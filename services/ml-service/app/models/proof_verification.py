"""
Advanced Proof Verification System

Uses Computer Vision and ML for:
- Landmark Detection (Is user really at the claimed location?)
- Object Detection (Are expected objects in the photo?)
- Face Matching (Same person across multiple proofs?)
- EXIF Analysis (GPS, timestamp verification)
- Image Authenticity (Deepfake/manipulation detection)
- Quality Assessment (Blur, lighting, resolution)
"""

from app.core.base_model import BaseModel
from app.core.redis_client import get_redis
from app.core.config import settings
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from enum import Enum
import logging
import json
import hashlib
import base64
import math

logger = logging.getLogger(__name__)


class ProofType(str, Enum):
    """Types of proof that can be submitted"""
    SELFIE_WITH_ID = "selfie_with_id"
    EXPERIENCE_PHOTO = "experience_photo"
    RECEIPT = "receipt"
    LOCATION_CHECK = "location_check"
    VIDEO_PROOF = "video_proof"


class VerificationStatus(str, Enum):
    """Verification result status"""
    APPROVED = "approved"
    REJECTED = "rejected"
    MANUAL_REVIEW = "manual_review"
    PENDING = "pending"


class LandmarkDetector:
    """
    Detects famous landmarks in images using visual embeddings.

    In production, this would use:
    - Google Cloud Vision Landmark Detection
    - AWS Rekognition
    - Custom trained model on Turkish landmarks
    """

    # Turkish landmark database with GPS coordinates
    LANDMARKS = {
        "cappadocia_balloons": {
            "name": "Kapadokya Balon Turu",
            "location": {"lat": 38.6431, "lng": 34.8289},
            "radius_km": 50,
            "visual_features": ["hot_air_balloon", "fairy_chimney", "rock_formation"],
            "confidence_threshold": 0.75,
        },
        "hagia_sophia": {
            "name": "Ayasofya",
            "location": {"lat": 41.0086, "lng": 28.9802},
            "radius_km": 1,
            "visual_features": ["dome", "minaret", "byzantine_architecture"],
            "confidence_threshold": 0.80,
        },
        "blue_mosque": {
            "name": "Sultan Ahmet Camii",
            "location": {"lat": 41.0054, "lng": 28.9768},
            "radius_km": 1,
            "visual_features": ["six_minaret", "blue_tiles", "dome"],
            "confidence_threshold": 0.80,
        },
        "bosphorus": {
            "name": "Boğaz",
            "location": {"lat": 41.0822, "lng": 29.0500},
            "radius_km": 20,
            "visual_features": ["bridge", "water", "boat", "strait"],
            "confidence_threshold": 0.70,
        },
        "pamukkale": {
            "name": "Pamukkale Travertenleri",
            "location": {"lat": 37.9204, "lng": 29.1187},
            "radius_km": 10,
            "visual_features": ["white_terraces", "thermal_pools", "travertine"],
            "confidence_threshold": 0.85,
        },
        "ephesus": {
            "name": "Efes Antik Kenti",
            "location": {"lat": 37.9390, "lng": 27.3417},
            "radius_km": 5,
            "visual_features": ["library_celsus", "ancient_ruins", "columns"],
            "confidence_threshold": 0.80,
        },
        "antalya_beach": {
            "name": "Antalya Sahili",
            "location": {"lat": 36.8969, "lng": 30.7133},
            "radius_km": 30,
            "visual_features": ["beach", "mediterranean", "cliffs"],
            "confidence_threshold": 0.65,
        },
        "sumela_monastery": {
            "name": "Sümela Manastırı",
            "location": {"lat": 40.6917, "lng": 39.6550},
            "radius_km": 5,
            "visual_features": ["cliff_monastery", "forest", "mountain"],
            "confidence_threshold": 0.85,
        },
    }

    async def detect(
        self,
        image_features: Dict[str, float],
        gps_coords: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """
        Detect landmarks in image.

        Args:
            image_features: Extracted visual features from image
            gps_coords: Optional GPS coordinates from EXIF

        Returns:
            Detected landmarks with confidence scores
        """
        detected = []

        for landmark_id, landmark in self.LANDMARKS.items():
            # Calculate visual similarity
            visual_score = self._calculate_visual_similarity(
                image_features,
                landmark["visual_features"]
            )

            # Calculate location match if GPS available
            location_score = 0.0
            if gps_coords:
                distance = self._haversine_distance(
                    gps_coords["lat"], gps_coords["lng"],
                    landmark["location"]["lat"], landmark["location"]["lng"]
                )
                if distance <= landmark["radius_km"]:
                    location_score = 1.0 - (distance / landmark["radius_km"])

            # Combined score (visual + location boost)
            combined_score = visual_score * 0.7 + location_score * 0.3

            if combined_score >= landmark["confidence_threshold"]:
                detected.append({
                    "landmark_id": landmark_id,
                    "name": landmark["name"],
                    "confidence": round(combined_score, 3),
                    "visual_score": round(visual_score, 3),
                    "location_score": round(location_score, 3),
                    "distance_km": round(distance, 2) if gps_coords else None,
                })

        # Sort by confidence
        detected.sort(key=lambda x: x["confidence"], reverse=True)

        return {
            "detected_landmarks": detected,
            "top_match": detected[0] if detected else None,
            "location_verified": any(d["location_score"] > 0.5 for d in detected),
        }

    def _calculate_visual_similarity(
        self,
        image_features: Dict[str, float],
        target_features: List[str],
    ) -> float:
        """Calculate similarity between image features and target features"""
        if not image_features:
            return 0.0

        matches = sum(1 for f in target_features if image_features.get(f, 0) > 0.5)
        return matches / len(target_features) if target_features else 0.0

    def _haversine_distance(
        self,
        lat1: float, lng1: float,
        lat2: float, lng2: float,
    ) -> float:
        """Calculate distance between two GPS coordinates in km"""
        R = 6371  # Earth's radius in km

        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lng = math.radians(lng2 - lng1)

        a = (math.sin(delta_lat / 2) ** 2 +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lng / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c


class ObjectDetector:
    """
    Detects objects relevant to travel experiences.

    In production, this would use:
    - YOLOv8 or DETR for object detection
    - Custom trained model for experience-specific objects
    """

    # Object categories relevant to experiences
    EXPERIENCE_OBJECTS = {
        "adventure": ["parachute", "balloon", "kayak", "surfboard", "climbing_gear", "diving_mask"],
        "luxury": ["yacht", "champagne", "luxury_car", "helicopter", "private_jet"],
        "food": ["restaurant", "food_plate", "wine", "cooking", "chef"],
        "nature": ["mountain", "waterfall", "forest", "beach", "lake", "wildlife"],
        "culture": ["museum", "artwork", "monument", "traditional_dress", "handicraft"],
        "wellness": ["spa", "massage", "yoga", "pool", "sauna"],
    }

    async def detect(
        self,
        image_data: bytes,
        expected_category: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Detect objects in image.

        Args:
            image_data: Raw image bytes
            expected_category: Optional expected experience category

        Returns:
            Detected objects with confidence scores
        """
        # Simulate object detection (in production, use actual ML model)
        # This would call YOLOv8 or similar

        detected_objects = []
        category_matches = {}

        # For demo, extract features from image hash
        image_hash = hashlib.md5(image_data).hexdigest()

        for category, objects in self.EXPERIENCE_OBJECTS.items():
            # Simulate detection based on image characteristics
            category_score = 0.0
            detected_in_category = []

            for obj in objects:
                # Simulate confidence score
                obj_hash = hashlib.md5(f"{image_hash}:{obj}".encode()).hexdigest()
                confidence = int(obj_hash[:2], 16) / 255.0

                if confidence > 0.6:
                    detected_in_category.append({
                        "object": obj,
                        "confidence": round(confidence, 3),
                        "bbox": self._generate_bbox(obj_hash),
                    })
                    category_score = max(category_score, confidence)

            if detected_in_category:
                detected_objects.extend(detected_in_category)
                category_matches[category] = round(category_score, 3)

        # Sort by confidence
        detected_objects.sort(key=lambda x: x["confidence"], reverse=True)

        # Check if expected category matches
        category_verified = False
        if expected_category and expected_category in category_matches:
            category_verified = category_matches[expected_category] > 0.7

        return {
            "detected_objects": detected_objects[:10],  # Top 10
            "category_scores": category_matches,
            "primary_category": max(category_matches, key=category_matches.get) if category_matches else None,
            "category_verified": category_verified,
            "object_count": len(detected_objects),
        }

    def _generate_bbox(self, hash_str: str) -> Dict[str, float]:
        """Generate bounding box from hash (for demo)"""
        values = [int(hash_str[i:i+2], 16) / 255.0 for i in range(0, 8, 2)]
        return {
            "x": round(values[0] * 0.5, 2),
            "y": round(values[1] * 0.5, 2),
            "width": round(0.2 + values[2] * 0.3, 2),
            "height": round(0.2 + values[3] * 0.3, 2),
        }


class FaceAnalyzer:
    """
    Analyzes faces for identity verification.

    In production, this would use:
    - MediaPipe Face Detection
    - FaceNet/ArcFace for embeddings
    - Custom liveness detection
    """

    async def analyze(
        self,
        image_data: bytes,
        reference_embedding: Optional[List[float]] = None,
    ) -> Dict[str, Any]:
        """
        Analyze faces in image.

        Args:
            image_data: Raw image bytes
            reference_embedding: Optional reference face embedding for matching

        Returns:
            Face analysis results
        """
        # Generate face embedding (simulated)
        image_hash = hashlib.md5(image_data).hexdigest()

        # Simulate face detection
        face_detected = int(image_hash[0], 16) > 5

        if not face_detected:
            return {
                "face_detected": False,
                "face_count": 0,
                "quality_score": 0.0,
                "match_score": None,
                "liveness_score": None,
            }

        # Generate face embedding (128-dimensional)
        embedding = [
            (int(image_hash[i % 32], 16) - 8) / 8.0
            for i in range(128)
        ]

        # Calculate quality score
        quality_score = 0.7 + (int(image_hash[1:3], 16) / 255.0) * 0.3

        # Calculate liveness score (anti-spoofing)
        liveness_score = 0.8 + (int(image_hash[3:5], 16) / 255.0) * 0.2

        # Match with reference if provided
        match_score = None
        if reference_embedding:
            match_score = self._cosine_similarity(embedding, reference_embedding)

        return {
            "face_detected": True,
            "face_count": 1 + (int(image_hash[5], 16) % 3),
            "quality_score": round(quality_score, 3),
            "liveness_score": round(liveness_score, 3),
            "match_score": round(match_score, 3) if match_score else None,
            "embedding": embedding,  # For future matching
            "landmarks": self._generate_landmarks(image_hash),
        }

    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        dot_product = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x ** 2 for x in a))
        norm_b = math.sqrt(sum(x ** 2 for x in b))

        if norm_a == 0 or norm_b == 0:
            return 0.0

        return dot_product / (norm_a * norm_b)

    def _generate_landmarks(self, hash_str: str) -> Dict[str, Dict[str, float]]:
        """Generate facial landmarks (for demo)"""
        return {
            "left_eye": {"x": 0.35, "y": 0.35},
            "right_eye": {"x": 0.65, "y": 0.35},
            "nose": {"x": 0.50, "y": 0.55},
            "mouth": {"x": 0.50, "y": 0.75},
        }


class ImageAuthenticityAnalyzer:
    """
    Analyzes image authenticity to detect manipulation.

    Detects:
    - Photoshop/editing artifacts
    - AI-generated images (deepfakes)
    - Copy-paste manipulations
    - Metadata inconsistencies
    """

    async def analyze(
        self,
        image_data: bytes,
        exif_data: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Analyze image authenticity.

        Args:
            image_data: Raw image bytes
            exif_data: Optional EXIF metadata

        Returns:
            Authenticity analysis results
        """
        image_hash = hashlib.md5(image_data).hexdigest()

        # ELA (Error Level Analysis) simulation
        ela_score = 0.85 + (int(image_hash[0:2], 16) / 255.0) * 0.15

        # AI generation detection
        ai_generated_score = (int(image_hash[2:4], 16) / 255.0) * 0.3

        # Manipulation detection
        manipulation_score = (int(image_hash[4:6], 16) / 255.0) * 0.25

        # Metadata consistency
        metadata_consistent = True
        metadata_flags = []

        if exif_data:
            # Check for suspicious patterns
            if not exif_data.get("DateTime"):
                metadata_flags.append("missing_timestamp")
            if not exif_data.get("GPSInfo"):
                metadata_flags.append("missing_gps")
            if exif_data.get("Software", "").lower() in ["photoshop", "gimp"]:
                metadata_flags.append("editing_software_detected")
                manipulation_score += 0.3

            metadata_consistent = len(metadata_flags) == 0

        # Overall authenticity score
        authenticity_score = (
            ela_score * 0.4 +
            (1 - ai_generated_score) * 0.3 +
            (1 - manipulation_score) * 0.3
        )

        # Determine if image is authentic
        is_authentic = (
            authenticity_score > 0.75 and
            ai_generated_score < 0.4 and
            manipulation_score < 0.4
        )

        return {
            "is_authentic": is_authentic,
            "authenticity_score": round(authenticity_score, 3),
            "ela_score": round(ela_score, 3),
            "ai_generated_probability": round(ai_generated_score, 3),
            "manipulation_probability": round(manipulation_score, 3),
            "metadata_consistent": metadata_consistent,
            "metadata_flags": metadata_flags,
            "risk_level": self._calculate_risk_level(authenticity_score, ai_generated_score),
        }

    def _calculate_risk_level(
        self,
        authenticity_score: float,
        ai_generated_score: float,
    ) -> str:
        """Calculate overall risk level"""
        if authenticity_score < 0.5 or ai_generated_score > 0.7:
            return "critical"
        elif authenticity_score < 0.7 or ai_generated_score > 0.5:
            return "high"
        elif authenticity_score < 0.85 or ai_generated_score > 0.3:
            return "medium"
        return "low"


class ImageQualityAnalyzer:
    """
    Analyzes image quality for proof verification.

    Checks:
    - Resolution adequacy
    - Blur detection
    - Lighting conditions
    - Compression artifacts
    """

    MIN_RESOLUTION = (640, 480)
    OPTIMAL_RESOLUTION = (1920, 1080)

    async def analyze(
        self,
        image_data: bytes,
        image_dimensions: Tuple[int, int],
    ) -> Dict[str, Any]:
        """
        Analyze image quality.

        Args:
            image_data: Raw image bytes
            image_dimensions: (width, height) tuple

        Returns:
            Quality analysis results
        """
        width, height = image_dimensions
        image_hash = hashlib.md5(image_data).hexdigest()

        # Resolution score
        resolution_score = min(1.0, (width * height) / (1920 * 1080))
        resolution_adequate = width >= self.MIN_RESOLUTION[0] and height >= self.MIN_RESOLUTION[1]

        # Blur score (simulated - would use Laplacian variance in production)
        blur_score = 0.7 + (int(image_hash[0:2], 16) / 255.0) * 0.3
        is_blurry = blur_score < 0.5

        # Lighting score
        lighting_score = 0.6 + (int(image_hash[2:4], 16) / 255.0) * 0.4
        lighting_issues = []
        if lighting_score < 0.5:
            lighting_issues.append("too_dark")
        elif lighting_score > 0.95:
            lighting_issues.append("overexposed")

        # Compression quality
        file_size = len(image_data)
        compression_ratio = file_size / (width * height * 3)
        compression_score = min(1.0, compression_ratio * 10)

        # Overall quality score
        overall_score = (
            resolution_score * 0.25 +
            blur_score * 0.35 +
            lighting_score * 0.25 +
            compression_score * 0.15
        )

        # Quality verdict
        if overall_score >= 0.8:
            quality_verdict = "excellent"
        elif overall_score >= 0.6:
            quality_verdict = "good"
        elif overall_score >= 0.4:
            quality_verdict = "acceptable"
        else:
            quality_verdict = "poor"

        return {
            "overall_score": round(overall_score, 3),
            "quality_verdict": quality_verdict,
            "resolution": {
                "width": width,
                "height": height,
                "score": round(resolution_score, 3),
                "adequate": resolution_adequate,
            },
            "sharpness": {
                "score": round(blur_score, 3),
                "is_blurry": is_blurry,
            },
            "lighting": {
                "score": round(lighting_score, 3),
                "issues": lighting_issues,
            },
            "compression": {
                "score": round(compression_score, 3),
                "file_size_kb": round(file_size / 1024, 1),
            },
            "suggestions": self._generate_suggestions(
                resolution_adequate, is_blurry, lighting_issues
            ),
        }

    def _generate_suggestions(
        self,
        resolution_ok: bool,
        is_blurry: bool,
        lighting_issues: List[str],
    ) -> List[str]:
        """Generate improvement suggestions"""
        suggestions = []

        if not resolution_ok:
            suggestions.append("Daha yüksek çözünürlüklü fotoğraf yükleyin")
        if is_blurry:
            suggestions.append("Fotoğraf bulanık, lütfen net bir fotoğraf çekin")
        if "too_dark" in lighting_issues:
            suggestions.append("Fotoğraf çok karanlık, daha aydınlık ortamda çekin")
        if "overexposed" in lighting_issues:
            suggestions.append("Fotoğraf çok parlak, gölgede çekmeyi deneyin")

        return suggestions


class ProofVerificationModel(BaseModel):
    """
    Main proof verification model combining all analyzers.

    Provides comprehensive proof verification including:
    - Landmark detection
    - Object detection
    - Face analysis
    - Authenticity verification
    - Quality assessment
    """

    def __init__(self):
        super().__init__()
        self.landmark_detector = LandmarkDetector()
        self.object_detector = ObjectDetector()
        self.face_analyzer = FaceAnalyzer()
        self.authenticity_analyzer = ImageAuthenticityAnalyzer()
        self.quality_analyzer = ImageQualityAnalyzer()

    async def load(self):
        """Load all sub-models"""
        logger.info("Loading Proof Verification models...")

        # In production, load actual model weights here
        # await self.landmark_detector.load_weights()
        # await self.object_detector.load_weights()
        # etc.

        self.loaded = True
        logger.info("✓ Proof Verification models loaded")

    async def predict(self, **kwargs) -> Dict[str, Any]:
        """Alias for verify method"""
        return await self.verify(**kwargs)

    async def verify(
        self,
        image_url: str,
        proof_type: str,
        user_id: str,
        moment_id: Optional[str] = None,
        expected_location: Optional[Dict[str, float]] = None,
        expected_category: Optional[str] = None,
        reference_face_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Verify a proof submission.

        Args:
            image_url: URL of the proof image
            proof_type: Type of proof (selfie_with_id, experience_photo, etc.)
            user_id: User submitting the proof
            moment_id: Related moment ID
            expected_location: Expected GPS coordinates
            expected_category: Expected experience category
            reference_face_id: Reference face for matching

        Returns:
            Comprehensive verification result
        """
        if not self.loaded:
            raise RuntimeError("Model not loaded")

        # Check cache first
        redis = await get_redis()
        cache_key = f"proof_verify:{hashlib.md5(image_url.encode()).hexdigest()}"

        cached = await redis.get(cache_key)
        if cached:
            logger.info(f"Cache hit for proof verification: {cache_key}")
            return json.loads(cached)

        # Fetch image (simulated - in production, actually download)
        image_data = await self._fetch_image(image_url)
        image_dimensions = (1920, 1080)  # Would be extracted from actual image

        # Extract EXIF data (simulated)
        exif_data = await self._extract_exif(image_data)
        gps_coords = exif_data.get("GPSInfo")

        # Run all analyzers in parallel
        results = {}

        # 1. Quality Analysis
        quality_result = await self.quality_analyzer.analyze(
            image_data, image_dimensions
        )
        results["quality"] = quality_result

        # Skip other checks if quality is too poor
        if quality_result["overall_score"] < 0.3:
            return self._build_response(
                approved=False,
                status=VerificationStatus.REJECTED,
                results=results,
                issues=["Fotoğraf kalitesi çok düşük"],
                suggestions=quality_result.get("suggestions", []),
            )

        # 2. Authenticity Analysis
        authenticity_result = await self.authenticity_analyzer.analyze(
            image_data, exif_data
        )
        results["authenticity"] = authenticity_result

        # 3. Landmark Detection (for experience photos)
        if proof_type in [ProofType.EXPERIENCE_PHOTO.value, ProofType.LOCATION_CHECK.value]:
            # Extract visual features (simulated)
            visual_features = await self._extract_visual_features(image_data)

            landmark_result = await self.landmark_detector.detect(
                visual_features,
                gps_coords,
            )
            results["landmarks"] = landmark_result

        # 4. Object Detection
        object_result = await self.object_detector.detect(
            image_data,
            expected_category,
        )
        results["objects"] = object_result

        # 5. Face Analysis (for selfie proofs)
        if proof_type in [ProofType.SELFIE_WITH_ID.value, ProofType.EXPERIENCE_PHOTO.value]:
            reference_embedding = None
            if reference_face_id:
                reference_embedding = await self._get_reference_face(reference_face_id)

            face_result = await self.face_analyzer.analyze(
                image_data,
                reference_embedding,
            )
            results["face"] = face_result

            # Store face embedding for future matching
            if face_result.get("face_detected") and face_result.get("embedding"):
                await self._store_face_embedding(user_id, face_result["embedding"])

        # Calculate overall verification score
        verification = self._calculate_verification(
            results,
            proof_type,
            expected_location,
            gps_coords,
        )

        response = self._build_response(
            approved=verification["approved"],
            status=verification["status"],
            results=results,
            overall_score=verification["score"],
            issues=verification["issues"],
            suggestions=verification["suggestions"],
        )

        # Cache result (shorter TTL for rejected)
        cache_ttl = 3600 if verification["approved"] else 300
        await redis.setex(cache_key, cache_ttl, json.dumps(response))

        # Log verification event
        logger.info(
            f"Proof verification completed: user={user_id}, "
            f"approved={verification['approved']}, score={verification['score']}"
        )

        return response

    def _calculate_verification(
        self,
        results: Dict[str, Any],
        proof_type: str,
        expected_location: Optional[Dict[str, float]],
        actual_gps: Optional[Dict[str, float]],
    ) -> Dict[str, Any]:
        """Calculate overall verification result"""
        scores = []
        issues = []
        suggestions = []

        # Quality score
        quality_score = results.get("quality", {}).get("overall_score", 0)
        scores.append(("quality", quality_score, 0.15))

        if quality_score < 0.5:
            issues.append("Fotoğraf kalitesi düşük")
            suggestions.extend(results.get("quality", {}).get("suggestions", []))

        # Authenticity score
        auth_result = results.get("authenticity", {})
        if not auth_result.get("is_authentic", True):
            issues.append("Fotoğraf manipüle edilmiş olabilir")
            return {
                "approved": False,
                "status": VerificationStatus.MANUAL_REVIEW,
                "score": 0.0,
                "issues": issues,
                "suggestions": ["Orijinal, düzenlenmemiş fotoğraf yükleyin"],
            }

        auth_score = auth_result.get("authenticity_score", 0.5)
        scores.append(("authenticity", auth_score, 0.25))

        # Landmark verification
        landmark_result = results.get("landmarks", {})
        if landmark_result:
            if landmark_result.get("location_verified"):
                scores.append(("landmark", 1.0, 0.3))
            elif landmark_result.get("top_match"):
                scores.append(("landmark", landmark_result["top_match"]["confidence"], 0.3))
            else:
                scores.append(("landmark", 0.3, 0.3))
                issues.append("Konum doğrulanamadı")

        # Object detection
        object_result = results.get("objects", {})
        if object_result.get("category_verified"):
            scores.append(("objects", 1.0, 0.15))
        elif object_result.get("primary_category"):
            scores.append(("objects", 0.7, 0.15))

        # Face verification
        face_result = results.get("face", {})
        if proof_type == ProofType.SELFIE_WITH_ID.value:
            if face_result.get("face_detected"):
                face_score = face_result.get("quality_score", 0.5)
                liveness_score = face_result.get("liveness_score", 0.5)
                combined_face = (face_score + liveness_score) / 2
                scores.append(("face", combined_face, 0.15))

                if face_result.get("match_score") and face_result["match_score"] < 0.8:
                    issues.append("Yüz eşleşme skoru düşük")
            else:
                issues.append("Fotoğrafta yüz tespit edilemedi")
                scores.append(("face", 0.0, 0.15))

        # Calculate weighted average
        total_weight = sum(s[2] for s in scores)
        overall_score = sum(s[1] * s[2] for s in scores) / total_weight if total_weight > 0 else 0

        # Determine status
        if overall_score >= 0.8 and not issues:
            status = VerificationStatus.APPROVED
            approved = True
        elif overall_score >= 0.6 and len(issues) <= 1:
            status = VerificationStatus.APPROVED
            approved = True
        elif overall_score >= 0.4:
            status = VerificationStatus.MANUAL_REVIEW
            approved = False
            suggestions.append("Kanıtınız manuel incelemeye alındı")
        else:
            status = VerificationStatus.REJECTED
            approved = False

        return {
            "approved": approved,
            "status": status,
            "score": round(overall_score * 100, 1),
            "issues": issues,
            "suggestions": suggestions,
        }

    def _build_response(
        self,
        approved: bool,
        status: VerificationStatus,
        results: Dict[str, Any],
        overall_score: float = 0.0,
        issues: List[str] = None,
        suggestions: List[str] = None,
    ) -> Dict[str, Any]:
        """Build standardized verification response"""
        return {
            "approved": approved,
            "status": status.value if isinstance(status, VerificationStatus) else status,
            "overall_score": overall_score,
            "breakdown": {
                "quality_score": results.get("quality", {}).get("overall_score", 0) * 100,
                "authenticity_score": results.get("authenticity", {}).get("authenticity_score", 0) * 100,
                "landmark_confidence": (
                    results.get("landmarks", {}).get("top_match", {}).get("confidence", 0) * 100
                    if results.get("landmarks") else None
                ),
                "face_quality": results.get("face", {}).get("quality_score", 0) * 100 if results.get("face") else None,
            },
            "details": results,
            "issues": issues or [],
            "suggestions": suggestions or [],
            "verified_at": datetime.utcnow().isoformat(),
        }

    async def _fetch_image(self, url: str) -> bytes:
        """Fetch image from URL (simulated)"""
        # In production, use aiohttp to download
        return hashlib.md5(url.encode()).digest() * 100

    async def _extract_exif(self, image_data: bytes) -> Dict[str, Any]:
        """Extract EXIF metadata from image"""
        # In production, use PIL or exifread
        image_hash = hashlib.md5(image_data).hexdigest()

        # Simulate EXIF data
        has_gps = int(image_hash[0], 16) > 7

        return {
            "DateTime": datetime.utcnow().isoformat(),
            "Make": "Apple",
            "Model": "iPhone 15 Pro",
            "GPSInfo": {
                "lat": 38.6431 + (int(image_hash[1:3], 16) - 128) / 1000,
                "lng": 34.8289 + (int(image_hash[3:5], 16) - 128) / 1000,
            } if has_gps else None,
        }

    async def _extract_visual_features(self, image_data: bytes) -> Dict[str, float]:
        """Extract visual features for landmark detection"""
        # In production, use CNN feature extractor
        image_hash = hashlib.md5(image_data).hexdigest()

        features = {}
        feature_names = [
            "hot_air_balloon", "fairy_chimney", "rock_formation",
            "dome", "minaret", "bridge", "water", "boat",
            "white_terraces", "thermal_pools", "beach", "mountain",
        ]

        for i, feature in enumerate(feature_names):
            score = int(image_hash[i % 32], 16) / 15.0
            features[feature] = round(score, 3)

        return features

    async def _get_reference_face(self, face_id: str) -> Optional[List[float]]:
        """Get reference face embedding from storage"""
        redis = await get_redis()
        embedding_json = await redis.get(f"face_embedding:{face_id}")

        if embedding_json:
            return json.loads(embedding_json)
        return None

    async def _store_face_embedding(self, user_id: str, embedding: List[float]):
        """Store face embedding for future matching"""
        redis = await get_redis()
        await redis.setex(
            f"face_embedding:{user_id}",
            86400 * 30,  # 30 days
            json.dumps(embedding),
        )


# Duplicate Detection Service
class DuplicateProofDetector:
    """
    Detects duplicate/reused proofs across users.

    Uses perceptual hashing to find similar images.
    """

    async def check_duplicate(
        self,
        image_data: bytes,
        user_id: str,
        moment_id: str,
    ) -> Dict[str, Any]:
        """
        Check if proof image has been used before.

        Returns:
            Duplicate detection results
        """
        redis = await get_redis()

        # Calculate perceptual hash (simulated)
        # In production, use imagehash library
        phash = self._calculate_phash(image_data)

        # Check against existing hashes
        existing_proofs = await redis.smembers("proof_hashes")

        duplicates = []
        for existing in existing_proofs:
            if isinstance(existing, bytes):
                existing = existing.decode()

            existing_data = json.loads(existing)
            similarity = self._hamming_similarity(phash, existing_data["phash"])

            if similarity > 0.9 and existing_data["user_id"] != user_id:
                duplicates.append({
                    "original_user_id": existing_data["user_id"],
                    "original_moment_id": existing_data["moment_id"],
                    "similarity": round(similarity, 3),
                    "uploaded_at": existing_data["uploaded_at"],
                })

        # Store this proof's hash
        await redis.sadd(
            "proof_hashes",
            json.dumps({
                "phash": phash,
                "user_id": user_id,
                "moment_id": moment_id,
                "uploaded_at": datetime.utcnow().isoformat(),
            }),
        )

        is_duplicate = len(duplicates) > 0

        return {
            "is_duplicate": is_duplicate,
            "duplicates": duplicates,
            "phash": phash,
            "risk_level": "critical" if is_duplicate else "none",
        }

    def _calculate_phash(self, image_data: bytes) -> str:
        """Calculate perceptual hash (simulated)"""
        # In production, use imagehash.phash()
        return hashlib.md5(image_data).hexdigest()[:16]

    def _hamming_similarity(self, hash1: str, hash2: str) -> float:
        """Calculate similarity based on Hamming distance"""
        if len(hash1) != len(hash2):
            return 0.0

        matches = sum(c1 == c2 for c1, c2 in zip(hash1, hash2))
        return matches / len(hash1)
