"""
TravelMatch ML Service

AI-powered verification and analysis for the gift experience platform.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Literal
import logging
from datetime import datetime

from app.core.config import settings
from app.core.redis_client import get_redis
from app.models.offer_analysis import OfferAnalysisModel, FraudAnalysisModel
from app.models.recommendations import MomentSuggestionModel, ContentModerationModel
from app.models.smart_notifications import SmartNotificationModel

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="TravelMatch ML Service",
    description="AI-powered gift verification and analysis for TravelMatch platform",
    version="2.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instances (loaded on startup)
models: Dict = {}


# ═══════════════════════════════════════════════════════════════════
# Request/Response Models
# ═══════════════════════════════════════════════════════════════════

# Gift Offer Analysis
class OfferAnalysisRequest(BaseModel):
    offer_amount: float = Field(..., description="Amount offered (TRY)")
    requested_amount: float = Field(..., description="Amount requested for moment (TRY)")
    sender_tier: Literal["free", "starter", "pro", "platinum"] = Field(..., description="Subscriber tier")
    sender_history: Optional[Dict] = Field(default=None, description="Sender's gift history")


class OfferAnalysisResponse(BaseModel):
    priority: str = Field(..., description="Notification priority (low/normal/high/critical)")
    offerScore: float = Field(..., description="Offer quality score (0-100)")
    valueRatio: float = Field(..., description="Offer to requested ratio")
    notificationSound: str = Field(..., description="Sound to use for notification")
    recommendation: str = Field(..., description="Recommendation message")
    isIrresistible: bool = Field(..., description="Whether this is an irresistible offer")


# Fraud Analysis
class FraudAnalysisRequest(BaseModel):
    user_id: str = Field(..., description="User UUID")
    action_type: str = Field(..., description="Action type (proof_submission/withdrawal/account_creation)")
    metadata: Optional[Dict] = Field(default=None, description="Additional context")


class FraudAnalysisResponse(BaseModel):
    riskScore: int = Field(..., description="Risk score (0-100)")
    riskLevel: str = Field(..., description="Risk level (low/medium/high/critical)")
    flags: List[str] = Field(..., description="Detected risk flags")
    recommendation: str = Field(..., description="Recommended action (approve/review/reject)")


# Moment Suggestions
class MomentSuggestionRequest(BaseModel):
    user_id: str = Field(..., description="User UUID")
    limit: int = Field(10, ge=1, le=50, description="Number of suggestions")
    filters: Optional[Dict] = Field(default=None, description="Filter criteria (budget, categories)")


class MomentSuggestionResponse(BaseModel):
    suggestions: List[Dict] = Field(..., description="Suggested moments")


# Content Moderation
class ContentModerationRequest(BaseModel):
    content_type: Literal["moment", "message", "proof", "profile"] = Field(..., description="Type of content")
    content_url: Optional[str] = Field(default=None, description="URL of image/video content")
    text: Optional[str] = Field(default=None, description="Text content")
    user_id: Optional[str] = Field(default=None, description="User who created content")


class ContentModerationResponse(BaseModel):
    approved: bool = Field(..., description="Whether content is approved")
    flags: List[str] = Field(..., description="Detected issues")
    confidence: float = Field(..., description="Confidence score (0-1)")
    requiresManualReview: bool = Field(..., description="Whether manual review is needed")


# Smart Notifications
class SmartNotificationRequest(BaseModel):
    user_id: str = Field(..., description="User UUID")
    notification_type: str = Field(..., description="Type (gift_received/proof_approved/funds_released)")
    urgency: str = Field("medium", description="Urgency level (low/medium/high)")


class SmartNotificationResponse(BaseModel):
    send_at: datetime = Field(..., description="Optimal send time")
    channel: str = Field(..., description="Recommended channel (push/email/sms)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    reason: str = Field(..., description="Explanation")


# ═══════════════════════════════════════════════════════════════════
# Lifecycle Events
# ═══════════════════════════════════════════════════════════════════

@app.on_event("startup")
async def load_models():
    """Load ML models into memory on startup"""
    logger.info("Loading ML models...")

    try:
        # Initialize models
        models["offer_analysis"] = OfferAnalysisModel()
        models["fraud_analysis"] = FraudAnalysisModel()
        models["moment_suggestions"] = MomentSuggestionModel()
        models["content_moderation"] = ContentModerationModel()
        models["smart_notifications"] = SmartNotificationModel()

        # Load model weights
        await models["offer_analysis"].load()
        await models["fraud_analysis"].load()
        await models["moment_suggestions"].load()
        await models["content_moderation"].load()
        await models["smart_notifications"].load()

        logger.info("✓ All models loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        raise


@app.on_event("shutdown")
async def shutdown():
    """Cleanup resources on shutdown"""
    logger.info("Shutting down ML service...")

    # Close Redis connections
    redis = get_redis()
    if redis:
        await redis.close()

    logger.info("✓ Shutdown complete")


# ═══════════════════════════════════════════════════════════════════
# API Endpoints
# ═══════════════════════════════════════════════════════════════════

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    redis = get_redis()
    redis_connected = await redis.ping() if redis else False

    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": len(models) > 0,
        "redis_connected": redis_connected,
        "gpu_available": False,
    }


@app.post("/offer/analyze", response_model=OfferAnalysisResponse)
async def analyze_offer(request: OfferAnalysisRequest):
    """
    Analyze a gift offer for "Reddedilemez Teklif" (Irresistible Offer) algorithm.

    Premium subscribers offering above requested amount get priority notifications.
    """
    try:
        model = models.get("offer_analysis")
        if not model:
            raise HTTPException(status_code=503, detail="Offer analysis model not loaded")

        result = await model.analyze_offer(
            offer_amount=request.offer_amount,
            requested_amount=request.requested_amount,
            sender_tier=request.sender_tier,
            sender_history=request.sender_history,
        )

        return OfferAnalysisResponse(**result)
    except Exception as e:
        logger.error(f"Offer analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/fraud/analyze", response_model=FraudAnalysisResponse)
async def analyze_fraud(request: FraudAnalysisRequest):
    """
    Analyze fraud risk for a user action.

    Checks for suspicious patterns in proof submissions, withdrawals, etc.
    """
    try:
        model = models.get("fraud_analysis")
        if not model:
            raise HTTPException(status_code=503, detail="Fraud analysis model not loaded")

        result = await model.analyze_risk(
            user_id=request.user_id,
            action_type=request.action_type,
            metadata=request.metadata,
        )

        return FraudAnalysisResponse(**result)
    except Exception as e:
        logger.error(f"Fraud analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/moments/suggest", response_model=MomentSuggestionResponse)
async def suggest_moments(request: MomentSuggestionRequest):
    """
    Get personalized moment suggestions for a user.

    Returns moments based on user preferences and past behavior.
    """
    try:
        model = models.get("moment_suggestions")
        if not model:
            raise HTTPException(status_code=503, detail="Moment suggestion model not loaded")

        result = await model.suggest_moments(
            user_id=request.user_id,
            limit=request.limit,
            filters=request.filters,
        )

        return MomentSuggestionResponse(suggestions=result)
    except Exception as e:
        logger.error(f"Moment suggestion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/content/moderate", response_model=ContentModerationResponse)
async def moderate_content(request: ContentModerationRequest):
    """
    Moderate user-generated content.

    Checks moments, messages, and proofs for policy violations.
    """
    try:
        model = models.get("content_moderation")
        if not model:
            raise HTTPException(status_code=503, detail="Content moderation model not loaded")

        result = await model.moderate(
            content_type=request.content_type,
            content_url=request.content_url,
            text=request.text,
            user_id=request.user_id,
        )

        return ContentModerationResponse(**result)
    except Exception as e:
        logger.error(f"Content moderation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/notifications/optimize", response_model=SmartNotificationResponse)
async def optimize_notification(request: SmartNotificationRequest):
    """
    Predict optimal timing and channel for sending notifications.

    Analyzes user activity patterns to maximize engagement.
    """
    try:
        model = models.get("smart_notifications")
        if not model:
            raise HTTPException(status_code=503, detail="Smart notification model not loaded")

        result = await model.predict(
            user_id=request.user_id,
            notification_type=request.notification_type,
            urgency=request.urgency,
        )

        return SmartNotificationResponse(
            send_at=result["send_at"],
            channel=result["channel"],
            confidence=result["confidence"],
            reason=result["reason"],
        )
    except Exception as e:
        logger.error(f"Smart notification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    """API information"""
    return {
        "service": "TravelMatch ML Service",
        "version": "2.0.0",
        "description": "AI-powered gift verification and analysis",
        "endpoints": {
            "health": "/health",
            "offer_analysis": "/offer/analyze",
            "fraud_analysis": "/fraud/analyze",
            "moment_suggestions": "/moments/suggest",
            "content_moderation": "/content/moderate",
            "smart_notifications": "/notifications/optimize",
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.ML_SERVICE_PORT,
        workers=settings.ML_WORKERS,
        log_level=settings.LOG_LEVEL.lower(),
    )
