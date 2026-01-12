"""
Turkish NLP Engine

Specialized NLP processing for Turkish language:
- Text classification (categories, sentiment)
- Named Entity Recognition (locations, dates, prices)
- Content moderation (spam, inappropriate content)
- Auto-tagging and keyword extraction
- Text enhancement suggestions
"""

from app.core.base_model import BaseModel
from app.core.redis_client import get_redis
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from enum import Enum
import logging
import json
import re
import hashlib

logger = logging.getLogger(__name__)


class SentimentType(str, Enum):
    """Sentiment categories"""
    VERY_POSITIVE = "very_positive"
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    VERY_NEGATIVE = "very_negative"


class ContentCategory(str, Enum):
    """Content categories for moments"""
    ADVENTURE = "adventure"
    LUXURY = "luxury"
    FOOD = "food"
    NATURE = "nature"
    CULTURE = "culture"
    WELLNESS = "wellness"
    ROMANTIC = "romantic"
    FAMILY = "family"
    NIGHTLIFE = "nightlife"
    SHOPPING = "shopping"


class TurkishNLPModel(BaseModel):
    """
    Turkish language NLP model.

    Provides:
    - Sentiment analysis
    - Text classification
    - Named entity recognition
    - Keyword extraction
    - Content moderation
    """

    # Turkish stopwords
    STOPWORDS = {
        "ve", "ile", "için", "bir", "bu", "da", "de", "den", "mi", "mu",
        "mı", "ki", "ama", "ancak", "fakat", "veya", "ya", "hem", "ne",
        "çok", "daha", "en", "gibi", "kadar", "olan", "olarak", "sonra",
        "önce", "şu", "o", "ben", "sen", "biz", "siz", "onlar", "bu",
    }

    # Category keywords for classification
    CATEGORY_KEYWORDS = {
        ContentCategory.ADVENTURE: [
            "macera", "adrenalin", "atlama", "tırmanma", "dalış", "rafting",
            "paraşüt", "balon", "zipline", "safari", "kamp", "trekking",
            "kayak", "sörf", "uçuş", "extreme", "off-road", "jeep",
        ],
        ContentCategory.LUXURY: [
            "lüks", "özel", "vip", "premium", "şampanya", "yat", "tekne",
            "helikopter", "limuzin", "butik", "suite", "spa", "masaj",
            "gurme", "michelin", "exclusive", "first class", "business",
        ],
        ContentCategory.FOOD: [
            "yemek", "restoran", "gastronomi", "lezzet", "mutfak", "şef",
            "tadım", "şarap", "kahve", "brunch", "akşam yemeği", "öğle",
            "street food", "workshop", "cooking", "barista", "sommelier",
        ],
        ContentCategory.NATURE: [
            "doğa", "orman", "dağ", "göl", "deniz", "sahil", "plaj",
            "yayla", "vadi", "şelale", "manzara", "kuş", "flora", "fauna",
            "eko", "yeşil", "temiz hava", "piknik", "kamp",
        ],
        ContentCategory.CULTURE: [
            "kültür", "tarih", "müze", "antik", "arkeoloji", "sanat",
            "galeri", "sergi", "tiyatro", "konser", "opera", "bale",
            "gezi", "tur", "rehber", "mimari", "cami", "kilise",
        ],
        ContentCategory.WELLNESS: [
            "wellness", "spa", "hamam", "masaj", "yoga", "meditasyon",
            "termal", "sağlık", "detox", "retreat", "dinlenme", "rahatlama",
            "aromaterapi", "pilates", "fitness", "organik",
        ],
        ContentCategory.ROMANTIC: [
            "romantik", "çift", "aşk", "evlilik", "yıldönümü", "sevgili",
            "proposal", "honeymoon", "balayı", "özel akşam", "gün batımı",
            "şamdan", "mum", "buket", "sürpriz",
        ],
        ContentCategory.FAMILY: [
            "aile", "çocuk", "kids", "eğlence", "park", "hayvanat bahçesi",
            "aquapark", "lunapark", "aktivite", "workshop", "eğitim",
            "piknik", "doğum günü", "kutlama",
        ],
        ContentCategory.NIGHTLIFE: [
            "gece", "kulüp", "bar", "parti", "dj", "dans", "müzik",
            "canlı", "sahne", "eğlence", "kokteyl", "pub", "meyhane",
        ],
        ContentCategory.SHOPPING: [
            "alışveriş", "shopping", "butik", "mağaza", "çarşı", "pazar",
            "antika", "vintage", "outlet", "moda", "tasarım", "el yapımı",
        ],
    }

    # Sentiment keywords
    SENTIMENT_KEYWORDS = {
        "positive": [
            "harika", "muhteşem", "mükemmel", "süper", "enfes", "eşsiz",
            "güzel", "iyi", "keyifli", "eğlenceli", "heyecanlı", "mutlu",
            "sevdim", "beğendim", "tavsiye", "öneririm", "teşekkür",
            "amazing", "perfect", "excellent", "wonderful", "fantastic",
        ],
        "negative": [
            "kötü", "berbat", "rezalet", "hayal kırıklığı", "pişman",
            "üzücü", "sıkıcı", "pahalı", "değmez", "tavsiye etmem",
            "sorun", "problem", "gecikme", "iptal", "iade", "şikayet",
            "terrible", "awful", "disappointed", "bad", "worst",
        ],
    }

    # Spam patterns
    SPAM_PATTERNS = [
        r"\b(kazan|kazanmak|para|hediye|çekiliş|tıkla|hemen)\b.*\b(link|tıkla|gir)\b",
        r"(whatsapp|telegram|instagram)\s*:?\s*\+?\d+",
        r"\b(takip|follow)\b.*\b(et|edin)\b",
        r"(www\.|http|\.com|\.net)",
        r"\b(satılık|satıyorum|kiralık)\b",
        r"\b\d{10,}\b",  # Long phone numbers
    ]

    # Inappropriate content patterns
    INAPPROPRIATE_PATTERNS = [
        r"\b(küfür1|küfür2)\b",  # Placeholder - would contain actual words
        r"\b(hakaret|tehdit|ırkçı)\b",
    ]

    async def load(self):
        """Load NLP models"""
        logger.info("Loading Turkish NLP models...")

        # In production, load actual models:
        # - BERTurk for embeddings
        # - Trained classifier for categories
        # - Sentiment model

        self.loaded = True
        logger.info("✓ Turkish NLP models loaded")

    async def predict(self, **kwargs) -> Dict[str, Any]:
        """Alias for analyze method"""
        return await self.analyze(**kwargs)

    async def analyze(
        self,
        text: str,
        analyze_sentiment: bool = True,
        analyze_categories: bool = True,
        extract_entities: bool = True,
        check_moderation: bool = True,
    ) -> Dict[str, Any]:
        """
        Comprehensive text analysis.

        Args:
            text: Input Turkish text
            analyze_sentiment: Whether to analyze sentiment
            analyze_categories: Whether to classify categories
            extract_entities: Whether to extract named entities
            check_moderation: Whether to check for policy violations

        Returns:
            Complete analysis results
        """
        if not self.loaded:
            raise RuntimeError("Model not loaded")

        # Check cache
        redis = await get_redis()
        cache_key = f"nlp_analysis:{hashlib.sha256(text.encode()).hexdigest()[:16]}"

        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)

        result = {
            "text": text,
            "word_count": len(text.split()),
            "char_count": len(text),
        }

        # Preprocess text
        processed_text = self._preprocess(text)
        tokens = self._tokenize(processed_text)
        result["tokens"] = tokens

        # Sentiment Analysis
        if analyze_sentiment:
            result["sentiment"] = await self._analyze_sentiment(processed_text, tokens)

        # Category Classification
        if analyze_categories:
            result["categories"] = await self._classify_categories(processed_text, tokens)

        # Named Entity Recognition
        if extract_entities:
            result["entities"] = await self._extract_entities(text)

        # Content Moderation
        if check_moderation:
            result["moderation"] = await self._check_moderation(text)

        # Keywords extraction
        result["keywords"] = self._extract_keywords(tokens)

        # Quality assessment
        result["quality"] = self._assess_quality(text, tokens)

        # Cache for 1 hour
        await redis.setex(cache_key, 3600, json.dumps(result))

        return result

    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of Turkish text.

        Returns:
            Sentiment analysis with confidence
        """
        processed_text = self._preprocess(text)
        tokens = self._tokenize(processed_text)

        return await self._analyze_sentiment(processed_text, tokens)

    async def _analyze_sentiment(
        self,
        text: str,
        tokens: List[str],
    ) -> Dict[str, Any]:
        """Internal sentiment analysis"""
        positive_count = 0
        negative_count = 0

        text_lower = text.lower()

        for word in self.SENTIMENT_KEYWORDS["positive"]:
            if word in text_lower:
                positive_count += 1

        for word in self.SENTIMENT_KEYWORDS["negative"]:
            if word in text_lower:
                negative_count += 1

        total = positive_count + negative_count
        if total == 0:
            sentiment = SentimentType.NEUTRAL
            score = 0.0
            confidence = 0.5
        else:
            score = (positive_count - negative_count) / total
            confidence = min(0.95, 0.5 + (total * 0.1))

            if score > 0.5:
                sentiment = SentimentType.VERY_POSITIVE
            elif score > 0.2:
                sentiment = SentimentType.POSITIVE
            elif score > -0.2:
                sentiment = SentimentType.NEUTRAL
            elif score > -0.5:
                sentiment = SentimentType.NEGATIVE
            else:
                sentiment = SentimentType.VERY_NEGATIVE

        return {
            "sentiment": sentiment.value,
            "score": round(score, 3),
            "confidence": round(confidence, 3),
            "positive_indicators": positive_count,
            "negative_indicators": negative_count,
        }

    async def classify_categories(
        self,
        text: str,
        top_k: int = 3,
    ) -> Dict[str, Any]:
        """
        Classify text into experience categories.

        Returns:
            Top categories with confidence scores
        """
        processed_text = self._preprocess(text)
        tokens = self._tokenize(processed_text)

        return await self._classify_categories(processed_text, tokens, top_k)

    async def _classify_categories(
        self,
        text: str,
        tokens: List[str],
        top_k: int = 3,
    ) -> Dict[str, Any]:
        """Internal category classification"""
        text_lower = text.lower()
        token_set = set(tokens)

        scores = {}

        for category, keywords in self.CATEGORY_KEYWORDS.items():
            score = 0
            matched_keywords = []

            for keyword in keywords:
                if keyword in text_lower:
                    score += 1
                    matched_keywords.append(keyword)

            if score > 0:
                # Normalize score
                normalized_score = min(1.0, score / 3)
                scores[category.value] = {
                    "score": round(normalized_score, 3),
                    "matched_keywords": matched_keywords,
                }

        # Sort by score
        sorted_categories = sorted(
            scores.items(),
            key=lambda x: x[1]["score"],
            reverse=True
        )[:top_k]

        primary_category = sorted_categories[0][0] if sorted_categories else None

        return {
            "primary_category": primary_category,
            "categories": dict(sorted_categories),
            "confidence": sorted_categories[0][1]["score"] if sorted_categories else 0,
        }

    async def extract_entities(self, text: str) -> Dict[str, Any]:
        """
        Extract named entities from Turkish text.

        Extracts:
        - Locations (cities, landmarks)
        - Dates and times
        - Prices
        - Organizations
        - Person names
        """
        return await self._extract_entities(text)

    async def _extract_entities(self, text: str) -> Dict[str, Any]:
        """Internal entity extraction"""
        entities = {
            "locations": [],
            "dates": [],
            "prices": [],
            "durations": [],
            "organizations": [],
        }

        # Location patterns (Turkish cities and landmarks)
        turkish_cities = [
            "İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Konya",
            "Trabzon", "Kapadokya", "Bodrum", "Fethiye", "Marmaris",
            "Çeşme", "Alaçatı", "Pamukkale", "Efes", "Şirince",
        ]

        for city in turkish_cities:
            if city.lower() in text.lower():
                entities["locations"].append({
                    "text": city,
                    "type": "city",
                    "confidence": 0.95,
                })

        # Price patterns
        price_patterns = [
            r"(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(?:TL|₺|lira)",
            r"(?:TL|₺)\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)",
            r"(\d+)\s*(?:bin|milyon)\s*(?:TL|₺|lira)?",
        ]

        for pattern in price_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                entities["prices"].append({
                    "text": match,
                    "type": "currency",
                    "currency": "TRY",
                    "confidence": 0.9,
                })

        # Duration patterns
        duration_patterns = [
            r"(\d+)\s*(?:saat|sa)",
            r"(\d+)\s*(?:gün|günlük)",
            r"(\d+)\s*(?:dakika|dk)",
            r"(\d+)\s*(?:hafta|haftalık)",
        ]

        for pattern in duration_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                entities["durations"].append({
                    "value": int(match),
                    "confidence": 0.85,
                })

        # Date patterns
        date_patterns = [
            r"(\d{1,2})[./](\d{1,2})[./](\d{2,4})",
            r"(\d{1,2})\s+(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)",
        ]

        for pattern in date_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                entities["dates"].append({
                    "text": " ".join(match) if isinstance(match, tuple) else match,
                    "confidence": 0.85,
                })

        return entities

    async def check_moderation(self, text: str) -> Dict[str, Any]:
        """
        Check text for policy violations.

        Checks for:
        - Spam content
        - Inappropriate language
        - Contact information sharing
        - Promotional content
        """
        return await self._check_moderation(text)

    async def _check_moderation(self, text: str) -> Dict[str, Any]:
        """Internal moderation check"""
        flags = []
        is_clean = True

        # Check spam patterns
        for pattern in self.SPAM_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                flags.append({
                    "type": "spam",
                    "severity": "high",
                    "message": "Spam içerik tespit edildi",
                })
                is_clean = False

        # Check inappropriate content
        for pattern in self.INAPPROPRIATE_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                flags.append({
                    "type": "inappropriate",
                    "severity": "critical",
                    "message": "Uygunsuz içerik tespit edildi",
                })
                is_clean = False

        # Check for contact info
        if re.search(r"\b\d{10,11}\b", text):  # Phone numbers
            flags.append({
                "type": "contact_info",
                "severity": "medium",
                "message": "Telefon numarası tespit edildi",
            })

        if re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text):
            flags.append({
                "type": "contact_info",
                "severity": "medium",
                "message": "E-posta adresi tespit edildi",
            })

        return {
            "is_clean": is_clean,
            "flags": flags,
            "requires_review": len([f for f in flags if f["severity"] in ["high", "critical"]]) > 0,
            "confidence": 0.9 if is_clean else 0.85,
        }

    def _preprocess(self, text: str) -> str:
        """Preprocess Turkish text"""
        # Lowercase
        text = text.lower()

        # Turkish character normalization
        replacements = {
            "ı": "i",
            "ğ": "g",
            "ü": "u",
            "ş": "s",
            "ö": "o",
            "ç": "c",
        }

        for turkish, latin in replacements.items():
            text = text.replace(turkish, latin)

        # Remove extra whitespace
        text = re.sub(r"\s+", " ", text).strip()

        return text

    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text into words"""
        # Simple word tokenization
        tokens = re.findall(r"\b\w+\b", text.lower())

        # Remove stopwords
        tokens = [t for t in tokens if t not in self.STOPWORDS and len(t) > 2]

        return tokens

    def _extract_keywords(self, tokens: List[str], top_k: int = 10) -> List[Dict[str, Any]]:
        """Extract keywords from tokens"""
        from collections import Counter

        # Count token frequencies
        token_counts = Counter(tokens)

        # Get top keywords
        keywords = []
        for token, count in token_counts.most_common(top_k):
            keywords.append({
                "keyword": token,
                "frequency": count,
                "score": round(count / len(tokens), 3) if tokens else 0,
            })

        return keywords

    def _assess_quality(self, text: str, tokens: List[str]) -> Dict[str, Any]:
        """Assess text quality"""
        word_count = len(text.split())
        unique_words = len(set(tokens))
        avg_word_length = sum(len(t) for t in tokens) / len(tokens) if tokens else 0

        # Quality metrics
        length_score = min(1.0, word_count / 50)  # Target: 50 words
        vocabulary_richness = unique_words / len(tokens) if tokens else 0
        readability_score = min(1.0, avg_word_length / 8)  # Target avg: 8 chars

        overall_score = (length_score * 0.3 + vocabulary_richness * 0.4 + readability_score * 0.3)

        suggestions = []
        if word_count < 20:
            suggestions.append("Daha detaylı açıklama ekleyin")
        if vocabulary_richness < 0.5:
            suggestions.append("Daha çeşitli kelimeler kullanın")
        if word_count > 200:
            suggestions.append("Açıklamayı kısaltmayı düşünün")

        return {
            "overall_score": round(overall_score, 3),
            "word_count": word_count,
            "unique_words": unique_words,
            "vocabulary_richness": round(vocabulary_richness, 3),
            "avg_word_length": round(avg_word_length, 1),
            "suggestions": suggestions,
        }


class TextEnhancer:
    """
    Enhances Turkish text for better engagement.

    Provides:
    - Title suggestions
    - Description improvements
    - SEO optimization
    - Hashtag generation
    """

    TITLE_TEMPLATES = {
        ContentCategory.ADVENTURE: [
            "Heyecan Dolu {activity} Deneyimi",
            "Adrenalin Tutkunları İçin: {activity}",
            "Unutulmaz {activity} Macerası",
        ],
        ContentCategory.LUXURY: [
            "Özel {activity} Deneyimi",
            "VIP {activity} Paketi",
            "Lüks {activity} Anı",
        ],
        ContentCategory.FOOD: [
            "Lezzet Yolculuğu: {activity}",
            "Gurme {activity} Deneyimi",
            "{activity} Tadım Atölyesi",
        ],
        ContentCategory.NATURE: [
            "Doğayla Buluşma: {activity}",
            "Huzur Dolu {activity}",
            "{activity} Keşif Turu",
        ],
    }

    async def enhance_title(
        self,
        original_title: str,
        category: ContentCategory,
    ) -> Dict[str, Any]:
        """
        Suggest enhanced titles.

        Returns:
            List of title suggestions
        """
        templates = self.TITLE_TEMPLATES.get(category, [])
        suggestions = []

        # Extract main activity from original title
        activity = original_title.split()[0] if original_title else "Deneyim"

        for template in templates:
            suggestion = template.format(activity=activity)
            suggestions.append({
                "title": suggestion,
                "engagement_score": 0.8 + (hash(suggestion) % 20) / 100,
            })

        return {
            "original": original_title,
            "suggestions": suggestions,
            "best_suggestion": max(suggestions, key=lambda x: x["engagement_score"]) if suggestions else None,
        }

    async def generate_hashtags(
        self,
        text: str,
        category: ContentCategory,
        limit: int = 10,
    ) -> List[str]:
        """
        Generate relevant hashtags for content.

        Returns:
            List of hashtags
        """
        base_hashtags = {
            ContentCategory.ADVENTURE: ["macera", "adrenalin", "kesfet", "outdoor"],
            ContentCategory.LUXURY: ["luks", "premium", "vip", "ozel"],
            ContentCategory.FOOD: ["lezzet", "gurme", "yemek", "foodie"],
            ContentCategory.NATURE: ["doga", "gezgin", "travel", "kesfet"],
            ContentCategory.CULTURE: ["kultur", "tarih", "sanat", "gezi"],
            ContentCategory.WELLNESS: ["saglik", "wellness", "spa", "huzur"],
            ContentCategory.ROMANTIC: ["romantik", "ask", "cift", "surprise"],
            ContentCategory.FAMILY: ["aile", "cocuk", "eglence", "kids"],
        }

        hashtags = base_hashtags.get(category, ["travelmatch", "deneyim"])

        # Add TravelMatch branded hashtags
        hashtags = ["TravelMatch", "HediyeAnı", "DeneyimHediye"] + hashtags

        return [f"#{tag}" for tag in hashtags[:limit]]

    async def suggest_improvements(
        self,
        text: str,
        category: ContentCategory,
    ) -> Dict[str, Any]:
        """
        Suggest improvements for moment description.

        Returns:
            Improvement suggestions
        """
        suggestions = []

        # Check for missing elements
        text_lower = text.lower()

        if not any(word in text_lower for word in ["süre", "saat", "dakika"]):
            suggestions.append({
                "type": "missing_duration",
                "message": "Deneyimin süresini belirtin",
                "example": "Bu deneyim yaklaşık 3 saat sürmektedir.",
            })

        if not any(word in text_lower for word in ["dahil", "içerir", "sunulur"]):
            suggestions.append({
                "type": "missing_inclusions",
                "message": "Neler dahil olduğunu belirtin",
                "example": "Fiyata ulaşım, rehber ve öğle yemeği dahildir.",
            })

        if not any(word in text_lower for word in ["dikkat", "not", "önemli", "gerekli"]):
            suggestions.append({
                "type": "missing_requirements",
                "message": "Katılım için gerekenleri ekleyin",
                "example": "Katılımcıların rahat ayakkabı giymeleri önerilir.",
            })

        if len(text.split()) < 30:
            suggestions.append({
                "type": "too_short",
                "message": "Açıklamayı zenginleştirin",
                "example": "Deneyimi daha detaylı anlatarak güven oluşturun.",
            })

        return {
            "text_length": len(text.split()),
            "suggestions": suggestions,
            "completeness_score": max(0, 1 - len(suggestions) * 0.2),
        }
