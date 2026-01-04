from app.core.base_model import BaseModel
from app.core.redis_client import get_redis
from typing import Dict, Any, Literal
import logging
import numpy as np
from datetime import datetime

logger = logging.getLogger(__name__)

# Priority levels for notification system
PriorityLevel = Literal['low', 'normal', 'high', 'critical']

# Subscriber tiers
SubscriberTier = Literal['free', 'starter', 'pro', 'platinum']


class MatchScoringModel(BaseModel):
    """Match scoring model for moment compatibility and offer analysis"""
    
    async def load(self):
        """Load match scoring model"""
        logger.info("Loading match scoring model...")
        
        # TODO: Load actual model from disk/S3
        # For now, using mock model
        self.model = "mock_match_model"
        self.loaded = True
        
        logger.info("✓ Match scoring model loaded")
    
    async def predict(self, user_a_id: str, user_b_id: str, context: Dict) -> Dict[str, Any]:
        """
        Predict match score between two users
        
        Args:
            user_a_id: First user UUID
            user_b_id: Second user UUID
            context: Additional context (destination, dates, etc.)
        
        Returns:
            {
                "score": float (0-1),
                "confidence": float (0-1),
                "factors": dict of contributing factors
            }
        """
        if not self.loaded:
            raise RuntimeError("Model not loaded")
        
        # Check cache first
        redis = await get_redis()
        cache_key = f"match_score:{user_a_id}:{user_b_id}"
        
        cached_result = await redis.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for match score: {cache_key}")
            import json
            return json.loads(cached_result)
        
        # TODO: Replace with actual model inference
        # For now, using mock scoring logic
        
        # Mock feature extraction
        interest_overlap = np.random.uniform(0.7, 0.95)
        moment_style = np.random.uniform(0.6, 0.9)
        personality = np.random.uniform(0.65, 0.92)
        
        # Mock scoring
        score = (interest_overlap * 0.4 + moment_style * 0.3 + personality * 0.3)
        confidence = np.random.uniform(0.85, 0.95)
        
        result = {
            "score": round(float(score), 2),
            "confidence": round(float(confidence), 2),
            "factors": {
                "interest_overlap": round(float(interest_overlap), 2),
                "moment_style": round(float(moment_style), 2),
                "personality": round(float(personality), 2),
            },
        }
        
        # Cache result for 1 hour
        import json
        await redis.setex(cache_key, 3600, json.dumps(result))
        
        return result

    async def analyze_subscriber_offer(
        self,
        offer_amount: float,
        requested_amount: float,
        sender_tier: SubscriberTier,
        sender_history: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        Analyze a subscriber's gift offer and determine notification priority
        
        The "Reddedilemez Teklif" (Irresistible Offer) Algorithm:
        - Platinum subscriber with 20%+ above requested = CRITICAL priority
        - Pro subscriber with 50%+ above = HIGH priority
        - Any offer 25%+ above = NORMAL priority
        
        Args:
            offer_amount: Amount offered by subscriber (TRY)
            requested_amount: Amount requested by host (Alıcı) for the moment
            sender_tier: Subscriber tier (free, starter, pro, platinum)
            sender_history: Optional sender history for bonus scoring
        
        Returns:
            {
                "priority": PriorityLevel,
                "offer_score": float (0-100),
                "value_ratio": float,
                "notification_sound": str,
                "recommendation": str
            }
        """
        if not self.loaded:
            raise RuntimeError("Model not loaded")
        
        # Calculate value ratio
        value_ratio = offer_amount / requested_amount if requested_amount > 0 else 1.0
        
        # Base score from value ratio
        base_score = min(100, value_ratio * 50)  # 2x ratio = 100 score
        
        # Tier multiplier
        tier_multipliers = {
            'platinum': 1.5,
            'pro': 1.3,
            'starter': 1.1,
            'free': 1.0,
        }
        tier_mult = tier_multipliers.get(sender_tier, 1.0)
        
        # History bonus (if available)
        history_bonus = 0
        if sender_history:
            completed_gifts = sender_history.get('completed_gifts', 0)
            avg_rating = sender_history.get('avg_rating', 4.0)
            history_bonus = min(20, completed_gifts * 2) + (avg_rating - 4.0) * 5
        
        # Final offer score
        offer_score = min(100, (base_score * tier_mult) + history_bonus)
        
        # Determine priority based on "Reddedilemez Teklif" algorithm
        priority: PriorityLevel = 'low'
        notification_sound = 'default'
        
        # Platinum with 20%+ above = CRITICAL (Liquid Shine sound)
        if sender_tier == 'platinum' and value_ratio >= 1.20:
            priority = 'critical'
            notification_sound = 'liquid_shine'  # Special premium sound
        # Pro/Platinum with 50%+ above = HIGH
        elif sender_tier in ['pro', 'platinum'] and value_ratio >= 1.50:
            priority = 'high'
            notification_sound = 'premium_offer'
        # Any offer 25%+ above = NORMAL elevated
        elif value_ratio >= 1.25:
            priority = 'normal'
            notification_sound = 'gift_received'
        else:
            priority = 'low'
            notification_sound = 'default'
        
        # Generate recommendation
        if priority == 'critical':
            recommendation = f"🔥 Yüksek değerli Platinum teklif! {int((value_ratio - 1) * 100)}% fazla sunuluyor."
        elif priority == 'high':
            recommendation = f"⭐ Premium abone önerisi: {offer_amount} TRY teklif edildi."
        elif priority == 'normal':
            recommendation = f"Beklentinin üzerinde bir teklif geldi: {offer_amount} TRY."
        else:
            recommendation = f"Yeni bir teklif alındı: {offer_amount} TRY."
        
        result = {
            "priority": priority,
            "offer_score": round(offer_score, 2),
            "value_ratio": round(value_ratio, 2),
            "notification_sound": notification_sound,
            "recommendation": recommendation,
            "sender_tier": sender_tier,
            "is_irresistible": priority in ['critical', 'high'],
        }
        
        logger.info(f"Offer analysis complete: {result}")
        return result
