from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import logging
from datetime import datetime

from app.core.config import settings
from app.core.redis_client import get_redis
from app.models.match_scoring import MatchScoringModel
from app.models.recommendations import RecommendationModel
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
    description="Machine Learning inference service for TravelMatch platform",
    version="1.0.0",
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


# Request/Response Models
class MatchScoreRequest(BaseModel):
    user_a_id: str = Field(..., description="First user UUID")
    user_b_id: str = Field(..., description="Second user UUID")
    context: Optional[Dict] = Field(default=None, description="Additional context")


class MatchScoreResponse(BaseModel):
    score: float = Field(..., ge=0.0, le=1.0, description="Match score (0-1)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence (0-1)")
    factors: Dict[str, float] = Field(..., description="Score breakdown")
    latency_ms: int = Field(..., description="Inference latency in milliseconds")


class RecommendationRequest(BaseModel):
    user_id: str = Field(..., description="User UUID")
    limit: int = Field(10, ge=1, le=100, description="Number of recommendations")
    filters: Optional[Dict] = Field(default=None, description="Filter criteria")


class RecommendationResponse(BaseModel):
    recommendations: List[Dict] = Field(..., description="Recommended destinations")


class SmartNotificationRequest(BaseModel):
    user_id: str = Field(..., description="User UUID")
    notification_type: str = Field(..., description="Notification type")
    urgency: str = Field("medium", description="Urgency level (low/medium/high)")


class SmartNotificationResponse(BaseModel):
    send_at: datetime = Field(..., description="Optimal send time")
    channel: str = Field(..., description="Recommended channel (push/email/sms)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    reason: str = Field(..., description="Explanation")


# Startup event: Load models
@app.on_event("startup")
async def load_models():
    """Load ML models into memory on startup"""
    logger.info("Loading ML models...")
    
    try:
        # Initialize models
        models["match_scoring"] = MatchScoringModel()
        models["recommendations"] = RecommendationModel()
        models["smart_notifications"] = SmartNotificationModel()
        
        # Load model weights
        await models["match_scoring"].load()
        await models["recommendations"].load()
        await models["smart_notifications"].load()
        
        logger.info("✓ All models loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        raise


# Shutdown event: Cleanup
@app.on_event("shutdown")
async def shutdown():
    """Cleanup resources on shutdown"""
    logger.info("Shutting down ML service...")
    
    # Close Redis connections
    redis = get_redis()
    if redis:
        await redis.close()
    
    logger.info("✓ Shutdown complete")


# Health check endpoint
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
        "gpu_available": False,  # TODO: Check GPU availability
    }


# Match Scoring endpoint
@app.post("/match/score", response_model=MatchScoreResponse)
async def score_match(request: MatchScoreRequest):
    """
    Score user compatibility for travel matching
    
    Returns a score between 0-1 indicating how well two users match.
    """
    start_time = datetime.now()
    
    try:
        model = models.get("match_scoring")
        if not model:
            raise HTTPException(status_code=503, detail="Match scoring model not loaded")
        
        # Run inference
        result = await model.predict(
            user_a_id=request.user_a_id,
            user_b_id=request.user_b_id,
            context=request.context or {},
        )
        
        latency_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        
        return MatchScoreResponse(
            score=result["score"],
            confidence=result["confidence"],
            factors=result["factors"],
            latency_ms=latency_ms,
        )
    except Exception as e:
        logger.error(f"Match scoring error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Recommendations endpoint
@app.post("/recommend/destinations", response_model=RecommendationResponse)
async def recommend_destinations(request: RecommendationRequest):
    """
    Get personalized destination recommendations for a user
    """
    try:
        model = models.get("recommendations")
        if not model:
            raise HTTPException(status_code=503, detail="Recommendation model not loaded")
        
        # Run inference
        result = await model.predict(
            user_id=request.user_id,
            limit=request.limit,
            filters=request.filters or {},
        )
        
        return RecommendationResponse(recommendations=result)
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Smart Notifications endpoint
@app.post("/notifications/optimize", response_model=SmartNotificationResponse)
async def optimize_notification(request: SmartNotificationRequest):
    """
    Predict optimal timing and channel for sending notifications
    """
    try:
        model = models.get("smart_notifications")
        if not model:
            raise HTTPException(status_code=503, detail="Smart notification model not loaded")
        
        # Run inference
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


# Root endpoint
@app.get("/")
async def root():
    """API information"""
    return {
        "service": "TravelMatch ML Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "match_scoring": "/match/score",
            "recommendations": "/recommend/destinations",
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
