"""
Gift Offer Analysis Model

Analyzes gift offers for the "Reddedilemez Teklif" (Irresistible Offer) algorithm.
Premium subscribers can make offers above the requested amount, triggering
special notifications with priority sounds.
"""

from app.core.base_model import BaseModel
from app.core.redis_client import get_redis
from typing import Dict, Any, Literal
import logging
import json

logger = logging.getLogger(__name__)

# Priority levels for notification system
PriorityLevel = Literal['low', 'normal', 'high', 'critical']

# Subscriber tiers
SubscriberTier = Literal['free', 'starter', 'pro', 'platinum']


class OfferAnalysisModel(BaseModel):
    """Gift offer analysis for premium subscriber notifications"""

    async def load(self):
        """Load offer analysis model"""
        logger.info("Loading offer analysis model...")
        self.loaded = True
        logger.info("✓ Offer analysis model loaded")

    async def analyze_offer(
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
                "offerScore": float (0-100),
                "valueRatio": float,
                "notificationSound": str,
                "recommendation": str,
                "isIrresistible": bool
            }
        """
        if not self.loaded:
            raise RuntimeError("Model not loaded")

        # Check cache first
        redis = await get_redis()
        cache_key = f"offer_analysis:{sender_tier}:{offer_amount}:{requested_amount}"

        cached_result = await redis.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for offer analysis: {cache_key}")
            return json.loads(cached_result)

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
            "offerScore": round(offer_score, 2),
            "valueRatio": round(value_ratio, 2),
            "notificationSound": notification_sound,
            "recommendation": recommendation,
            "senderTier": sender_tier,
            "isIrresistible": priority in ['critical', 'high'],
        }

        # Cache result for 5 minutes
        await redis.setex(cache_key, 300, json.dumps(result))

        logger.info(f"Offer analysis complete: {result}")
        return result


class FraudAnalysisModel(BaseModel):
    """Fraud detection for gift platform"""

    async def load(self):
        """Load fraud detection model"""
        logger.info("Loading fraud detection model...")
        self.loaded = True
        logger.info("✓ Fraud detection model loaded")

    async def analyze_risk(
        self,
        user_id: str,
        action_type: str,
        metadata: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        Analyze fraud risk for a user action

        Args:
            user_id: User UUID
            action_type: Type of action (proof_submission, withdrawal, account_creation)
            metadata: Additional context

        Returns:
            {
                "riskScore": int (0-100),
                "riskLevel": "low" | "medium" | "high" | "critical",
                "flags": list of detected issues,
                "recommendation": "approve" | "review" | "reject"
            }
        """
        if not self.loaded:
            raise RuntimeError("Model not loaded")

        # Check cache
        redis = await get_redis()
        cache_key = f"fraud_risk:{user_id}:{action_type}"

        cached_result = await redis.get(cache_key)
        if cached_result:
            return json.loads(cached_result)

        # TODO: Implement actual fraud detection logic
        # For now, return low risk by default

        flags = []
        risk_score = 10

        # Check metadata for suspicious patterns
        if metadata:
            # Multiple rapid submissions
            if metadata.get('submissions_last_hour', 0) > 5:
                flags.append('Çok fazla gönderim kısa sürede')
                risk_score += 20

            # New account with high-value transaction
            if metadata.get('account_age_days', 365) < 7 and metadata.get('amount', 0) > 5000:
                flags.append('Yeni hesaptan yüksek işlem')
                risk_score += 30

            # Multiple failed verifications
            if metadata.get('failed_verifications', 0) > 2:
                flags.append('Çoklu başarısız doğrulama')
                risk_score += 25

        # Determine risk level
        if risk_score >= 70:
            risk_level = 'critical'
            recommendation = 'reject'
        elif risk_score >= 50:
            risk_level = 'high'
            recommendation = 'review'
        elif risk_score >= 30:
            risk_level = 'medium'
            recommendation = 'review'
        else:
            risk_level = 'low'
            recommendation = 'approve'

        result = {
            "riskScore": risk_score,
            "riskLevel": risk_level,
            "flags": flags,
            "recommendation": recommendation,
        }

        # Cache for 10 minutes
        await redis.setex(cache_key, 600, json.dumps(result))

        return result
