"""
Tests for Proof Verification Model

Tests cover:
- Landmark detection
- Face analysis
- Image authenticity checking
- Location verification
- Duplicate detection
"""

import pytest
from unittest.mock import MagicMock, patch
import numpy as np
from datetime import datetime, timedelta

# Import the modules we're testing
import sys
sys.path.insert(0, '..')

from app.models.proof_verification import (
    LandmarkDetector,
    ObjectDetector,
    FaceAnalyzer,
    ImageAuthenticityAnalyzer,
    ImageQualityAnalyzer,
    ProofVerificationModel,
    DuplicateProofDetector,
)


class TestLandmarkDetector:
    """Tests for Turkish landmark detection"""

    def test_landmark_database_exists(self):
        """Verify Turkish landmarks are loaded"""
        detector = LandmarkDetector()
        assert len(detector.landmarks) > 0
        assert 'kapadokya' in detector.landmarks
        assert 'ayasofya' in detector.landmarks
        assert 'pamukkale' in detector.landmarks

    def test_landmark_has_required_fields(self):
        """Each landmark should have name, keywords, and coordinates"""
        detector = LandmarkDetector()
        for landmark_id, landmark in detector.landmarks.items():
            assert 'name' in landmark
            assert 'keywords' in landmark
            assert 'lat' in landmark
            assert 'lng' in landmark
            assert isinstance(landmark['keywords'], list)

    def test_detect_landmark_from_keywords(self):
        """Test landmark detection from text keywords"""
        detector = LandmarkDetector()

        # Mock image analysis to return balloon keywords
        with patch.object(detector, '_extract_visual_features') as mock:
            mock.return_value = ['balloon', 'rock', 'cave', 'sunrise']

            result = detector.detect_landmarks("test_image.jpg")
            # Should detect Cappadocia from balloon keywords
            assert any('kapadokya' in r.lower() or 'cappadocia' in r.lower()
                      for r in result.get('detected', []))

    def test_location_verification(self):
        """Test GPS coordinate verification"""
        detector = LandmarkDetector()

        # Cappadocia coordinates
        kapadokya_lat = 38.6431
        kapadokya_lng = 34.8289

        result = detector.verify_location(
            claimed_landmark='kapadokya',
            exif_lat=kapadokya_lat,
            exif_lng=kapadokya_lng
        )

        assert result['match'] == True
        assert result['distance_km'] < 50  # Within 50km tolerance

    def test_location_mismatch(self):
        """Test detection of location mismatch"""
        detector = LandmarkDetector()

        # Istanbul coordinates (far from Cappadocia)
        istanbul_lat = 41.0082
        istanbul_lng = 28.9784

        result = detector.verify_location(
            claimed_landmark='kapadokya',
            exif_lat=istanbul_lat,
            exif_lng=istanbul_lng
        )

        assert result['match'] == False
        assert result['distance_km'] > 400  # Should be far


class TestFaceAnalyzer:
    """Tests for face detection and analysis"""

    def test_face_detection(self):
        """Test basic face detection"""
        analyzer = FaceAnalyzer()

        # Create a mock image with face
        mock_image = np.zeros((640, 480, 3), dtype=np.uint8)

        with patch.object(analyzer, '_detect_faces') as mock:
            mock.return_value = [{'bbox': [100, 100, 200, 200], 'confidence': 0.95}]

            result = analyzer.analyze(mock_image)
            assert result['face_count'] >= 0

    def test_face_quality_scoring(self):
        """Test face quality assessment"""
        analyzer = FaceAnalyzer()

        # Mock face detection result
        face_data = {
            'size': 10000,  # Large enough face
            'brightness': 0.7,
            'sharpness': 0.8,
            'frontal': True
        }

        score = analyzer._calculate_quality_score(face_data)
        assert 0 <= score <= 100
        assert score > 50  # Good quality should score high


class TestImageAuthenticityAnalyzer:
    """Tests for image manipulation detection"""

    def test_metadata_analysis(self):
        """Test EXIF metadata analysis"""
        analyzer = ImageAuthenticityAnalyzer()

        # Mock EXIF data
        mock_exif = {
            'Make': 'Apple',
            'Model': 'iPhone 14 Pro',
            'DateTime': '2024:01:15 14:30:00',
            'GPSLatitude': 38.6431,
            'GPSLongitude': 34.8289
        }

        with patch.object(analyzer, '_extract_exif') as mock:
            mock.return_value = mock_exif

            result = analyzer.analyze_metadata("test.jpg")
            assert 'has_gps' in result
            assert result['device_info'] is not None

    def test_manipulation_detection(self):
        """Test detection of image manipulation"""
        analyzer = ImageAuthenticityAnalyzer()

        # Mock image analysis
        mock_image = np.zeros((640, 480, 3), dtype=np.uint8)

        result = analyzer.check_manipulation(mock_image)
        assert 'manipulation_score' in result
        assert 0 <= result['manipulation_score'] <= 100

    def test_deepfake_detection(self):
        """Test deepfake/AI-generated detection"""
        analyzer = ImageAuthenticityAnalyzer()

        mock_image = np.zeros((640, 480, 3), dtype=np.uint8)

        result = analyzer.detect_ai_generated(mock_image)
        assert 'is_ai_generated' in result
        assert 'confidence' in result


class TestProofVerificationModel:
    """Integration tests for full proof verification"""

    @pytest.fixture
    def model(self):
        return ProofVerificationModel()

    def test_kyc_verification(self, model):
        """Test KYC proof verification flow"""
        result = model.verify_proof(
            image_url="https://example.com/kyc_selfie.jpg",
            proof_type="selfie_with_id",
            user_id="test-user-123"
        )

        assert 'overall' in result
        assert 'approved' in result
        assert 'status' in result
        assert 'breakdown' in result
        assert result['status'] in ['verified', 'rejected', 'needs_review']

    def test_experience_verification(self, model):
        """Test experience proof verification"""
        result = model.verify_proof(
            image_url="https://example.com/balloon_tour.jpg",
            proof_type="experience_photo",
            moment_id="moment-123",
            claimed_location="Kapadokya, Türkiye"
        )

        assert 'overall' in result
        assert 'breakdown' in result
        if 'landmarkMatch' in result['breakdown']:
            assert 0 <= result['breakdown']['landmarkMatch'] <= 100

    def test_receipt_verification(self, model):
        """Test receipt proof verification"""
        result = model.verify_proof(
            image_url="https://example.com/receipt.jpg",
            proof_type="receipt",
            moment_id="moment-456"
        )

        assert 'overall' in result
        assert 'approved' in result

    def test_score_thresholds(self, model):
        """Test verification score thresholds"""
        # High score should be verified
        with patch.object(model, '_calculate_score') as mock:
            mock.return_value = 90
            result = model._determine_status(90)
            assert result == 'verified'

        # Medium score needs review
        result = model._determine_status(65)
        assert result == 'needs_review'

        # Low score rejected
        result = model._determine_status(30)
        assert result == 'rejected'


class TestDuplicateProofDetector:
    """Tests for duplicate proof detection"""

    @pytest.fixture
    def detector(self):
        return DuplicateProofDetector()

    def test_hash_generation(self, detector):
        """Test perceptual hash generation"""
        mock_image = np.zeros((256, 256, 3), dtype=np.uint8)

        hash_value = detector._generate_hash(mock_image)
        assert hash_value is not None
        assert len(hash_value) == 64  # Standard phash length

    def test_similarity_calculation(self, detector):
        """Test hash similarity calculation"""
        hash1 = "a" * 64
        hash2 = "a" * 64
        hash3 = "b" * 64

        # Identical hashes should be 100% similar
        similarity = detector._calculate_similarity(hash1, hash2)
        assert similarity == 100.0

        # Different hashes should be less similar
        similarity = detector._calculate_similarity(hash1, hash3)
        assert similarity < 100.0

    def test_duplicate_detection(self, detector):
        """Test duplicate proof detection"""
        # Add a proof to the index
        detector.add_proof("proof-1", "test_hash_123")

        # Check for duplicates
        result = detector.check_duplicate("test_hash_123")
        assert result['is_duplicate'] == True
        assert "proof-1" in result['similar_proofs']

    def test_no_duplicate(self, detector):
        """Test no false positives"""
        result = detector.check_duplicate("unique_hash_abc")
        assert result['is_duplicate'] == False


class TestHaversineDistance:
    """Tests for geographic distance calculation"""

    def test_same_location(self):
        """Same coordinates should return 0"""
        from app.models.proof_verification import LandmarkDetector
        detector = LandmarkDetector()

        distance = detector._haversine_distance(38.0, 34.0, 38.0, 34.0)
        assert distance == 0.0

    def test_known_distance(self):
        """Test with known distance between cities"""
        from app.models.proof_verification import LandmarkDetector
        detector = LandmarkDetector()

        # Istanbul to Ankara (approximately 350km)
        istanbul = (41.0082, 28.9784)
        ankara = (39.9334, 32.8597)

        distance = detector._haversine_distance(
            istanbul[0], istanbul[1],
            ankara[0], ankara[1]
        )

        # Should be approximately 350km (±50km tolerance)
        assert 300 < distance < 400


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
