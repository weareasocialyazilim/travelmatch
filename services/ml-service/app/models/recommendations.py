"""
Gift Moment Suggestions & Content Moderation

Provides personalized moment suggestions based on user preferences and
moderates user-generated content (moments, messages, proofs).
"""

from app.core.base_model import BaseModel
from app.core.redis_client import get_redis
from typing import Dict, Any, List
import logging
import json

logger = logging.getLogger(__name__)


class MomentSuggestionModel(BaseModel):
    """Personalized moment/gift suggestions based on user behavior"""

    async def load(self):
        """Load moment suggestion model"""
        logger.info("Loading moment suggestion model...")
        self.loaded = True
        logger.info("✓ Moment suggestion model loaded")

    async def suggest_moments(
        self,
        user_id: str,
        limit: int = 10,
        filters: Dict = None,
    ) -> List[Dict[str, Any]]:
        """
        Generate personalized moment suggestions for a user

        Args:
            user_id: User UUID
            limit: Number of suggestions to return
            filters: Optional filters (budget, category, location)

        Returns:
            List of suggested moments with relevance scores
        """
        if not self.loaded:
            raise RuntimeError("Model not loaded")

        # Check cache
        redis = await get_redis()
        filter_key = json.dumps(filters or {}, sort_keys=True)
        cache_key = f"moment_suggestions:{user_id}:{filter_key}:{limit}"

        cached_result = await redis.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for moment suggestions: {cache_key}")
            return json.loads(cached_result)

        # TODO: Implement actual ML-based suggestions
        # For now, return category-based mock suggestions

        categories = filters.get('categories', []) if filters else []
        budget = filters.get('budget', 'medium') if filters else 'medium'

        # Mock suggestions based on categories
        all_suggestions = [
            {
                "momentId": "moment-1",
                "title": "Kapadokya Balon Turu",
                "category": "adventure",
                "suggestedAmount": 2500,
                "score": 0.95,
                "reason": "Macera kategorisinde en popüler deneyim",
            },
            {
                "momentId": "moment-2",
                "title": "Boğaz'da Yat Turu",
                "category": "luxury",
                "suggestedAmount": 3500,
                "score": 0.92,
                "reason": "Lüks deneyimler arasında en çok tercih edilen",
            },
            {
                "momentId": "moment-3",
                "title": "Ege Sahillerinde Dalış",
                "category": "adventure",
                "suggestedAmount": 1800,
                "score": 0.88,
                "reason": "Yaz sezonu için ideal su sporları",
            },
            {
                "momentId": "moment-4",
                "title": "Karadeniz Yaylası Turu",
                "category": "nature",
                "suggestedAmount": 1500,
                "score": 0.85,
                "reason": "Doğa severler için mükemmel",
            },
            {
                "momentId": "moment-5",
                "title": "İstanbul Gurme Turu",
                "category": "food",
                "suggestedAmount": 1200,
                "score": 0.82,
                "reason": "Yemek tutkunları için özel rota",
            },
        ]

        # Filter by category if specified
        if categories:
            all_suggestions = [s for s in all_suggestions if s['category'] in categories]

        # Filter by budget
        budget_limits = {'low': 1500, 'medium': 3000, 'high': 10000}
        max_amount = budget_limits.get(budget, 3000)
        all_suggestions = [s for s in all_suggestions if s['suggestedAmount'] <= max_amount]

        result = all_suggestions[:limit]

        # Cache for 1 hour
        await redis.setex(cache_key, 3600, json.dumps(result))

        return result

    async def suggest_recipients(
        self,
        user_id: str,
        moment_id: str,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Suggest recipients for a gift based on relationship and preferences

        Args:
            user_id: Gifter's user UUID
            moment_id: Moment being gifted
            limit: Number of suggestions

        Returns:
            List of suggested recipients with relevance scores
        """
        if not self.loaded:
            raise RuntimeError("Model not loaded")

        # TODO: Implement actual recipient suggestion logic
        # Would analyze user's contacts, past gifts, social connections

        return []


class ContentModerationModel(BaseModel):
    """AI-powered content moderation for moments, messages, and proofs"""

    async def load(self):
        """Load content moderation model"""
        logger.info("Loading content moderation model...")
        self.loaded = True
        logger.info("✓ Content moderation model loaded")

    async def moderate(
        self,
        content_type: str,
        content_url: str = None,
        text: str = None,
        user_id: str = None,
    ) -> Dict[str, Any]:
        """
        Moderate user-generated content

        Args:
            content_type: Type of content (moment, message, proof, profile)
            content_url: URL of image/video content
            text: Text content to moderate
            user_id: User who created the content

        Returns:
            {
                "approved": bool,
                "flags": list of issues,
                "confidence": float (0-1),
                "requiresManualReview": bool,
                "category": str (if flagged)
            }
        """
        if not self.loaded:
            raise RuntimeError("Model not loaded")

        flags = []
        confidence = 0.95
        requires_review = False

        # Text moderation
        if text:
            text_lower = text.lower()

            # Check for prohibited content
            prohibited_words = ['spam', 'scam', 'fake']  # Simplified list
            for word in prohibited_words:
                if word in text_lower:
                    flags.append(f'Yasaklı içerik tespit edildi: {word}')
                    confidence = 0.85

            # Check for contact info in messages (spam prevention)
            if content_type == 'message':
                import re
                if re.search(r'\b\d{10,}\b', text):  # Phone number pattern
                    flags.append('Mesajda telefon numarası tespit edildi')
                    requires_review = True

        # Image moderation would go here (using external API or local model)
        if content_url:
            # TODO: Implement image moderation
            # - NSFW detection
            # - Violence detection
            # - Spam/fake detection
            pass

        approved = len(flags) == 0
        if flags:
            requires_review = True

        result = {
            "approved": approved,
            "flags": flags,
            "confidence": confidence,
            "requiresManualReview": requires_review,
        }

        if flags:
            result["category"] = "policy_violation"

        logger.info(f"Content moderation result: {result}")
        return result


# Keep backward compatibility with old import
class RecommendationModel(MomentSuggestionModel):
    """Alias for backward compatibility"""
    pass
