"""
Lovendo ML Service v3.0

Enterprise-grade AI platform for gift experience verification and optimization.

Features:
- Advanced Proof Verification (Computer Vision)
- Price Prediction & Dynamic Pricing
- Turkish NLP Engine
- Recommendation Engine (Collaborative + Content-based)
- AI Chatbot Assistant
- Demand Forecasting
- A/B Test Automation
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Literal, Any
import logging
from datetime import datetime

from app.core.config import settings
from app.core.redis_client import get_redis

# Import all models
from app.models.offer_analysis import OfferAnalysisModel, FraudAnalysisModel
from app.models.recommendations import MomentSuggestionModel, ContentModerationModel
from app.models.smart_notifications import SmartNotificationModel
from app.models.proof_verification import ProofVerificationModel, DuplicateProofDetector
from app.models.price_prediction import PricePredictionModel, DynamicPricingEngine, PriceOptimizer
from app.models.turkish_nlp import TurkishNLPModel, TextEnhancer
from app.models.recommendation_engine import RecommendationEngine, RecipientRecommender
from app.models.chatbot import ChatbotModel
from app.models.forecasting import DemandForecastingModel, ABTestingEngine
from app.models.seo_hacker import SEOHackerModel, seo_hacker

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Lovendo ML Service",
    description="Enterprise AI platform for gift experience verification and optimization",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instances
models: Dict = {}
engines: Dict = {}


# ═══════════════════════════════════════════════════════════════════════════
# Request/Response Models
# ═══════════════════════════════════════════════════════════════════════════

# === Proof Verification ===
class ProofVerifyRequest(BaseModel):
    image_url: str = Field(..., description="URL of proof image")
    proof_type: Literal["selfie_with_id", "experience_photo", "receipt", "location_check"] = Field(...)
    user_id: str = Field(..., description="User submitting proof")
    moment_id: Optional[str] = Field(None, description="Related moment ID")
    expected_location: Optional[Dict[str, float]] = Field(None, description="Expected GPS coordinates")
    expected_category: Optional[str] = Field(None, description="Expected experience category")


class ProofVerifyResponse(BaseModel):
    approved: bool
    status: str
    overall_score: float
    breakdown: Dict[str, Any]
    issues: List[str]
    suggestions: List[str]
    verified_at: str


# === Gift Offer Analysis ===
class OfferAnalysisRequest(BaseModel):
    offer_amount: float = Field(..., description="Amount offered (TRY)")
    requested_amount: float = Field(..., description="Amount requested for moment (TRY)")
    sender_tier: Literal["free", "starter", "pro", "platinum"] = Field(...)
    sender_history: Optional[Dict] = Field(None)


class OfferAnalysisResponse(BaseModel):
    priority: str
    offerScore: float
    valueRatio: float
    notificationSound: str
    recommendation: str
    isIrresistible: bool


# === Fraud Analysis ===
class FraudAnalysisRequest(BaseModel):
    user_id: str
    action_type: str
    metadata: Optional[Dict] = None


class FraudAnalysisResponse(BaseModel):
    riskScore: int
    riskLevel: str
    flags: List[str]
    recommendation: str


# === Price Prediction ===
class PricePredictRequest(BaseModel):
    category: str = Field(..., description="Experience category")
    location: str = Field(..., description="Location/city")
    duration_hours: float = Field(3.0, description="Duration in hours")
    group_size: int = Field(2, description="Number of participants")
    includes_transport: bool = Field(False)
    includes_meal: bool = Field(False)
    experience_date: Optional[datetime] = None


class PricePredictResponse(BaseModel):
    predicted_price: int
    price_range: Dict[str, int]
    competitive_range: Dict[str, int]
    confidence: float
    tier: str
    modifiers: Dict[str, float]
    season: str
    recommendation: str


class PriceAnalyzeRequest(BaseModel):
    listing_price: float
    category: str
    location: str
    duration_hours: float = 3.0


class DynamicPriceRequest(BaseModel):
    base_price: float
    moment_id: str
    experience_datetime: datetime
    current_bookings: int = 0
    max_capacity: int = 10


# === NLP ===
class NLPAnalyzeRequest(BaseModel):
    text: str = Field(..., description="Turkish text to analyze")
    analyze_sentiment: bool = Field(True)
    analyze_categories: bool = Field(True)
    extract_entities: bool = Field(True)
    check_moderation: bool = Field(True)


class NLPAnalyzeResponse(BaseModel):
    text: str
    word_count: int
    sentiment: Optional[Dict] = None
    categories: Optional[Dict] = None
    entities: Optional[Dict] = None
    moderation: Optional[Dict] = None
    keywords: List[Dict]
    quality: Dict


# === Recommendations ===
class RecommendationRequest(BaseModel):
    user_id: str
    recommendation_type: str = Field("for_you")
    limit: int = Field(20, ge=1, le=100)
    filters: Optional[Dict] = None
    context: Optional[Dict] = None


class SimilarMomentsRequest(BaseModel):
    moment_id: str
    limit: int = Field(10, ge=1, le=50)


# === Chatbot ===
class ChatRequest(BaseModel):
    user_id: str
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    intent: str
    intent_confidence: float
    suggestions: List[str] = []
    quick_replies: List[str] = []
    recommendations: Optional[List[Dict]] = None
    session_id: str


# === Forecasting ===
class ForecastRequest(BaseModel):
    category: str
    location: Optional[str] = None
    days_ahead: int = Field(30, ge=1, le=365)
    granularity: Literal["daily", "weekly", "monthly"] = "daily"


# === A/B Testing ===
class CreateExperimentRequest(BaseModel):
    experiment_id: str
    name: str
    variants: List[Dict[str, Any]]
    target_metric: str
    traffic_percentage: float = 100
    min_sample_size: int = 1000


class AssignVariantRequest(BaseModel):
    experiment_id: str
    user_id: str


class RecordConversionRequest(BaseModel):
    experiment_id: str
    user_id: str
    metric_value: float = 1.0


# === Content Moderation ===
class ContentModerationRequest(BaseModel):
    content_type: Literal["moment", "message", "proof", "profile"]
    content_url: Optional[str] = None
    text: Optional[str] = None
    user_id: Optional[str] = None


class ContentModerationResponse(BaseModel):
    approved: bool
    flags: List[str]
    confidence: float
    requiresManualReview: bool


# === Moment Suggestions ===
class MomentSuggestionRequest(BaseModel):
    user_id: str
    limit: int = Field(10, ge=1, le=50)
    filters: Optional[Dict] = None


# === Smart Notifications ===
class SmartNotificationRequest(BaseModel):
    user_id: str
    notification_type: str
    urgency: str = "medium"


class SmartNotificationResponse(BaseModel):
    send_at: datetime
    channel: str
    confidence: float
    reason: str


# ═══════════════════════════════════════════════════════════════════════════
# Lifecycle Events
# ═══════════════════════════════════════════════════════════════════════════

@app.on_event("startup")
async def load_models():
    """Load all ML models into memory on startup"""
    logger.info("🚀 Loading Lovendo ML Service v3.0...")

    try:
        # Core models
        models["offer_analysis"] = OfferAnalysisModel()
        models["fraud_analysis"] = FraudAnalysisModel()
        models["moment_suggestions"] = MomentSuggestionModel()
        models["content_moderation"] = ContentModerationModel()
        models["smart_notifications"] = SmartNotificationModel()

        # Advanced models
        models["proof_verification"] = ProofVerificationModel()
        models["price_prediction"] = PricePredictionModel()
        models["turkish_nlp"] = TurkishNLPModel()
        models["recommendation_engine"] = RecommendationEngine()
        models["chatbot"] = ChatbotModel()
        models["forecasting"] = DemandForecastingModel()

        # Engines (stateless services)
        engines["dynamic_pricing"] = DynamicPricingEngine()
        engines["price_optimizer"] = PriceOptimizer()
        engines["text_enhancer"] = TextEnhancer()
        engines["recipient_recommender"] = RecipientRecommender()
        engines["duplicate_detector"] = DuplicateProofDetector()
        engines["ab_testing"] = ABTestingEngine()

        # Load model weights
        for name, model in models.items():
            await model.load()
            logger.info(f"  ✓ {name} loaded")

        logger.info("✅ All models loaded successfully!")
        logger.info(f"   Models: {len(models)} | Engines: {len(engines)}")

    except Exception as e:
        logger.error(f"❌ Failed to load models: {e}")
        raise


@app.on_event("shutdown")
async def shutdown():
    """Cleanup resources on shutdown"""
    logger.info("Shutting down ML service...")
    redis = get_redis()
    if redis:
        await redis.close()
    logger.info("✓ Shutdown complete")


# ═══════════════════════════════════════════════════════════════════════════
# Health & Info Endpoints
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    redis = get_redis()
    redis_connected = await redis.ping() if redis else False

    return {
        "status": "healthy",
        "version": "3.0.0",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": len(models),
        "engines_loaded": len(engines),
        "redis_connected": redis_connected,
        "gpu_available": False,
    }


@app.get("/")
async def root():
    """API information"""
    return {
        "service": "Lovendo ML Service",
        "version": "3.0.0",
        "description": "Enterprise AI platform for gift experience verification",
        "capabilities": {
            "proof_verification": "Computer vision for proof analysis",
            "price_prediction": "ML-based price optimization",
            "turkish_nlp": "Turkish language processing",
            "recommendations": "Personalized gift suggestions",
            "chatbot": "AI conversational assistant",
            "forecasting": "Demand prediction",
            "ab_testing": "Experiment automation",
        },
        "docs": "/docs",
    }


# ═══════════════════════════════════════════════════════════════════════════
# Proof Verification Endpoints
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/proof/verify", response_model=ProofVerifyResponse)
async def verify_proof(request: ProofVerifyRequest):
    """
    Verify a proof submission using computer vision.

    Analyzes:
    - Landmark detection
    - Object detection
    - Face matching
    - Image authenticity
    - Quality assessment
    """
    try:
        model = models.get("proof_verification")
        if not model:
            raise HTTPException(status_code=503, detail="Proof verification model not loaded")

        result = await model.verify(
            image_url=request.image_url,
            proof_type=request.proof_type,
            user_id=request.user_id,
            moment_id=request.moment_id,
            expected_location=request.expected_location,
            expected_category=request.expected_category,
        )

        return ProofVerifyResponse(**result)
    except Exception as e:
        logger.error(f"Proof verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/proof/check-duplicate")
async def check_duplicate_proof(
    image_url: str = Query(...),
    user_id: str = Query(...),
    moment_id: str = Query(...),
):
    """Check if proof image has been used before"""
    try:
        detector = engines.get("duplicate_detector")

        # Simulate image data from URL
        image_data = image_url.encode()

        result = await detector.check_duplicate(image_data, user_id, moment_id)
        return result
    except Exception as e:
        logger.error(f"Duplicate check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# Price Prediction Endpoints
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/price/predict", response_model=PricePredictResponse)
async def predict_price(request: PricePredictRequest):
    """
    Predict optimal price for an experience.

    Uses ML to analyze market conditions and suggest pricing.
    """
    try:
        model = models.get("price_prediction")
        if not model:
            raise HTTPException(status_code=503, detail="Price prediction model not loaded")

        result = await model.predict_price(
            category=request.category,
            location=request.location,
            duration_hours=request.duration_hours,
            group_size=request.group_size,
            includes_transport=request.includes_transport,
            includes_meal=request.includes_meal,
            experience_date=request.experience_date,
        )

        return PricePredictResponse(**result)
    except Exception as e:
        logger.error(f"Price prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/price/analyze")
async def analyze_listing_price(request: PriceAnalyzeRequest):
    """Analyze if a listing price is competitive"""
    try:
        model = models.get("price_prediction")
        result = await model.analyze_listing_price(
            listing_price=request.listing_price,
            category=request.category,
            location=request.location,
            duration_hours=request.duration_hours,
        )
        return result
    except Exception as e:
        logger.error(f"Price analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/price/dynamic")
async def calculate_dynamic_price(request: DynamicPriceRequest):
    """Calculate real-time dynamic price based on demand"""
    try:
        engine = engines.get("dynamic_pricing")
        result = await engine.calculate_dynamic_price(
            base_price=request.base_price,
            moment_id=request.moment_id,
            experience_datetime=request.experience_datetime,
            current_bookings=request.current_bookings,
            max_capacity=request.max_capacity,
        )
        return result
    except Exception as e:
        logger.error(f"Dynamic pricing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/price/history/{category}")
async def get_price_history(
    category: str,
    location: Optional[str] = None,
    days: int = Query(30, ge=7, le=90),
):
    """Get historical price trends"""
    try:
        model = models.get("price_prediction")
        result = await model.get_price_history(category, location, days)
        return result
    except Exception as e:
        logger.error(f"Price history error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# Turkish NLP Endpoints
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/nlp/analyze", response_model=NLPAnalyzeResponse)
async def analyze_text(request: NLPAnalyzeRequest):
    """
    Comprehensive Turkish text analysis.

    Provides sentiment, categories, entities, and moderation.
    """
    try:
        model = models.get("turkish_nlp")
        if not model:
            raise HTTPException(status_code=503, detail="Turkish NLP model not loaded")

        result = await model.analyze(
            text=request.text,
            analyze_sentiment=request.analyze_sentiment,
            analyze_categories=request.analyze_categories,
            extract_entities=request.extract_entities,
            check_moderation=request.check_moderation,
        )

        return NLPAnalyzeResponse(**result)
    except Exception as e:
        logger.error(f"NLP analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/nlp/sentiment")
async def analyze_sentiment(text: str = Query(..., min_length=1)):
    """Quick sentiment analysis"""
    try:
        model = models.get("turkish_nlp")
        result = await model.analyze_sentiment(text)
        return result
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/nlp/enhance-title")
async def enhance_title(
    title: str = Query(...),
    category: str = Query(...),
):
    """Get enhanced title suggestions"""
    try:
        enhancer = engines.get("text_enhancer")
        from app.models.turkish_nlp import ContentCategory
        cat = ContentCategory(category) if category in [c.value for c in ContentCategory] else ContentCategory.ADVENTURE
        result = await enhancer.enhance_title(title, cat)
        return result
    except Exception as e:
        logger.error(f"Title enhancement error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/nlp/hashtags")
async def generate_hashtags(
    text: str = Query(...),
    category: str = Query(...),
    limit: int = Query(10, ge=1, le=30),
):
    """Generate relevant hashtags"""
    try:
        enhancer = engines.get("text_enhancer")
        from app.models.turkish_nlp import ContentCategory
        cat = ContentCategory(category) if category in [c.value for c in ContentCategory] else ContentCategory.ADVENTURE
        result = await enhancer.generate_hashtags(text, cat, limit)
        return {"hashtags": result}
    except Exception as e:
        logger.error(f"Hashtag generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# Recommendation Endpoints
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/recommendations")
async def get_recommendations(request: RecommendationRequest):
    """
    Get personalized recommendations.

    Uses hybrid collaborative + content-based filtering.
    """
    try:
        model = models.get("recommendation_engine")
        if not model:
            raise HTTPException(status_code=503, detail="Recommendation engine not loaded")

        from app.models.recommendation_engine import RecommendationType
        rec_type = RecommendationType(request.recommendation_type)

        result = await model.get_recommendations(
            user_id=request.user_id,
            recommendation_type=rec_type,
            limit=request.limit,
            filters=request.filters,
            context=request.context,
        )

        return result
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommendations/similar")
async def get_similar_moments(request: SimilarMomentsRequest):
    """Get moments similar to a given moment"""
    try:
        model = models.get("recommendation_engine")
        result = await model.get_similar_moments(
            moment_id=request.moment_id,
            limit=request.limit,
        )
        return result
    except Exception as e:
        logger.error(f"Similar moments error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recommendations/trending")
async def get_trending(
    category: Optional[str] = None,
    location: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
):
    """Get trending moments"""
    try:
        model = models.get("recommendation_engine")
        result = await model.get_trending(category, location, limit)
        return result
    except Exception as e:
        logger.error(f"Trending error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommendations/recipients")
async def suggest_recipients(
    user_id: str = Query(...),
    moment_id: str = Query(...),
    limit: int = Query(5, ge=1, le=20),
):
    """Suggest recipients for a gift"""
    try:
        recommender = engines.get("recipient_recommender")
        result = await recommender.suggest_recipients(user_id, moment_id, limit)
        return {"recipients": result}
    except Exception as e:
        logger.error(f"Recipient suggestion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# Chatbot Endpoints
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    AI chatbot for gift assistance.

    Provides conversational help with gift selection, proofs, and more.
    """
    try:
        model = models.get("chatbot")
        if not model:
            raise HTTPException(status_code=503, detail="Chatbot model not loaded")

        result = await model.chat(
            user_id=request.user_id,
            message=request.message,
            session_id=request.session_id,
        )

        return ChatResponse(**result)
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/chat/quick-actions/{user_id}")
async def get_quick_actions(user_id: str):
    """Get contextual quick actions for user"""
    try:
        model = models.get("chatbot")
        result = await model.get_quick_actions(user_id)
        return {"actions": result}
    except Exception as e:
        logger.error(f"Quick actions error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# Forecasting Endpoints
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/forecast")
async def get_forecast(request: ForecastRequest):
    """
    Get demand forecast for a category.

    Predicts future demand based on historical patterns and seasonality.
    """
    try:
        model = models.get("forecasting")
        if not model:
            raise HTTPException(status_code=503, detail="Forecasting model not loaded")

        result = await model.forecast(
            category=request.category,
            location=request.location,
            days_ahead=request.days_ahead,
            granularity=request.granularity,
        )

        return result
    except Exception as e:
        logger.error(f"Forecast error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/forecast/trends")
async def get_category_trends(days: int = Query(90, ge=30, le=365)):
    """Get demand trends across all categories"""
    try:
        model = models.get("forecasting")
        result = await model.get_category_trends(days)
        return result
    except Exception as e:
        logger.error(f"Trends error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/forecast/capacity")
async def get_capacity_recommendations(
    partner_id: str = Query(...),
    moment_id: str = Query(...),
    current_capacity: int = Query(..., ge=1),
):
    """Get capacity optimization recommendations"""
    try:
        model = models.get("forecasting")
        result = await model.get_capacity_recommendations(
            partner_id, moment_id, current_capacity
        )
        return result
    except Exception as e:
        logger.error(f"Capacity recommendation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# A/B Testing Endpoints
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/experiments")
async def create_experiment(request: CreateExperimentRequest):
    """Create a new A/B test experiment"""
    try:
        engine = engines.get("ab_testing")
        result = await engine.create_experiment(
            experiment_id=request.experiment_id,
            name=request.name,
            variants=request.variants,
            target_metric=request.target_metric,
            traffic_percentage=request.traffic_percentage,
            min_sample_size=request.min_sample_size,
        )
        return result
    except Exception as e:
        logger.error(f"Create experiment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/experiments/{experiment_id}/start")
async def start_experiment(experiment_id: str):
    """Start running an experiment"""
    try:
        engine = engines.get("ab_testing")
        result = await engine.start_experiment(experiment_id)
        return result
    except Exception as e:
        logger.error(f"Start experiment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/experiments/assign")
async def assign_variant(request: AssignVariantRequest):
    """Assign user to experiment variant"""
    try:
        engine = engines.get("ab_testing")
        result = await engine.assign_variant(
            request.experiment_id,
            request.user_id,
        )
        return result or {"variant": None, "reason": "Not included in experiment"}
    except Exception as e:
        logger.error(f"Assign variant error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/experiments/convert")
async def record_conversion(request: RecordConversionRequest):
    """Record a conversion event"""
    try:
        engine = engines.get("ab_testing")
        success = await engine.record_conversion(
            request.experiment_id,
            request.user_id,
            request.metric_value,
        )
        return {"recorded": success}
    except Exception as e:
        logger.error(f"Record conversion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/experiments/{experiment_id}/results")
async def get_experiment_results(experiment_id: str):
    """Get experiment results with statistical analysis"""
    try:
        engine = engines.get("ab_testing")
        result = await engine.get_results(experiment_id)
        return result
    except Exception as e:
        logger.error(f"Get results error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/experiments/{experiment_id}/conclude")
async def conclude_experiment(
    experiment_id: str,
    winning_variant_id: Optional[str] = None,
):
    """Conclude experiment and select winner"""
    try:
        engine = engines.get("ab_testing")
        result = await engine.conclude_experiment(experiment_id, winning_variant_id)
        return result
    except Exception as e:
        logger.error(f"Conclude experiment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# Legacy Endpoints (Backward Compatibility)
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/offer/analyze", response_model=OfferAnalysisResponse)
async def analyze_offer(request: OfferAnalysisRequest):
    """Analyze gift offer for priority notifications"""
    try:
        model = models.get("offer_analysis")
        if not model:
            raise HTTPException(status_code=503, detail="Model not loaded")

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
    """Analyze fraud risk"""
    try:
        model = models.get("fraud_analysis")
        if not model:
            raise HTTPException(status_code=503, detail="Model not loaded")

        result = await model.analyze_risk(
            user_id=request.user_id,
            action_type=request.action_type,
            metadata=request.metadata,
        )
        return FraudAnalysisResponse(**result)
    except Exception as e:
        logger.error(f"Fraud analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/moments/suggest")
async def suggest_moments(request: MomentSuggestionRequest):
    """Get moment suggestions"""
    try:
        model = models.get("moment_suggestions")
        if not model:
            raise HTTPException(status_code=503, detail="Model not loaded")

        result = await model.suggest_moments(
            user_id=request.user_id,
            limit=request.limit,
            filters=request.filters,
        )
        return {"suggestions": result}
    except Exception as e:
        logger.error(f"Suggestion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/content/moderate", response_model=ContentModerationResponse)
async def moderate_content(request: ContentModerationRequest):
    """Moderate user content"""
    try:
        model = models.get("content_moderation")
        if not model:
            raise HTTPException(status_code=503, detail="Model not loaded")

        result = await model.moderate(
            content_type=request.content_type,
            content_url=request.content_url,
            text=request.text,
            user_id=request.user_id,
        )
        return ContentModerationResponse(**result)
    except Exception as e:
        logger.error(f"Moderation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/notifications/optimize", response_model=SmartNotificationResponse)
async def optimize_notification(request: SmartNotificationRequest):
    """Optimize notification timing"""
    try:
        model = models.get("smart_notifications")
        if not model:
            raise HTTPException(status_code=503, detail="Model not loaded")

        result = await model.predict(
            user_id=request.user_id,
            notification_type=request.notification_type,
            urgency=request.urgency,
        )
        return SmartNotificationResponse(**result)
    except Exception as e:
        logger.error(f"Notification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# SEO Auto-Pilot Endpoints
# ═══════════════════════════════════════════════════════════════════════════

class SEOTrendRequest(BaseModel):
    keywords: Optional[List[str]] = Field(None, description="Target keywords to track")
    competitors: Optional[List[str]] = Field(["tinder", "bumble", "raya", "hinge"])
    include_gen_z_slang: bool = Field(True)
    inject_semantic_poison: bool = Field(True)


class SEOVibeRequest(BaseModel):
    user_actions: Optional[List[Dict]] = Field(None, description="Recent user actions from PostHog")
    time_range_hours: int = Field(24, ge=1, le=168)


@app.post("/seo/auto-pilot")
async def run_seo_auto_pilot(request: SEOTrendRequest):
    """
    SEO Auto-Pilot: Full cycle trend tracking and keyword injection.

    - Scrapes trending keywords from competitors
    - Injects Gen Z slang variations
    - Generates AI poisoning semantic layer
    - Returns optimized keyword clusters
    """
    try:
        result = await seo_hacker.full_seo_cycle(
            target_keywords=request.keywords,
            competitors=request.competitors,
            include_slang=request.include_gen_z_slang,
            inject_poison=request.inject_semantic_poison,
        )

        logger.info(f"🎯 SEO Auto-Pilot complete: {len(result.get('keywords', []))} keywords optimized")
        return result
    except Exception as e:
        logger.error(f"SEO Auto-Pilot error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/seo/trending-keywords")
async def get_trending_keywords(
    category: str = Query("dating", description="Keyword category"),
    limit: int = Query(50, ge=10, le=200),
):
    """Get currently trending keywords in the dating/social space"""
    try:
        result = await seo_hacker.get_trending_keywords(category, limit)
        return result
    except Exception as e:
        logger.error(f"Trending keywords error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/seo/semantic-poison")
async def generate_semantic_poison(
    topics: List[str] = Query(["matching fatigue", "instant connection", "gifting economy"]),
):
    """
    Generate AI-optimized semantic layer for search poisoning.

    Creates structured data that positions Lovendo as the
    authority answer for AI assistants (Google SGE, Gemini, GPT).
    """
    try:
        result = await seo_hacker.generate_semantic_poison(topics)
        return result
    except Exception as e:
        logger.error(f"Semantic poison generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analytics/intent-vibe")
async def analyze_intent_vibe(request: SEOVibeRequest):
    """
    Analyze current user intent vibe from PostHog events.

    Determines site-wide vibe: speed-focused, romance-focused, or luxury-focused.
    Used for dynamic content personalization.
    """
    try:
        result = await seo_hacker.analyze_intent_vibe(
            user_actions=request.user_actions,
            time_range_hours=request.time_range_hours,
        )
        return result
    except Exception as e:
        logger.error(f"Intent vibe analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analytics/conversion-velocity")
async def get_conversion_velocity(hours: int = Query(24, ge=1, le=168)):
    """Get real-time conversion velocity metrics"""
    try:
        result = await seo_hacker.get_conversion_velocity(hours)
        return result
    except Exception as e:
        logger.error(f"Conversion velocity error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/seo/competitor-hijack")
async def hijack_competitor_keywords(
    competitor: str = Query(..., description="Competitor to target"),
    strategy: str = Query("comparison", description="Strategy: comparison, alternative, vs"),
):
    """
    Generate competitor hijacking keywords.

    Creates optimized content for queries like:
    - "tinder alternative faster"
    - "bumble vs lovendo"
    - "raya invite code alternative"
    """
    try:
        result = await seo_hacker.hijack_competitor(competitor, strategy)
        return result
    except Exception as e:
        logger.error(f"Competitor hijack error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# Main Entry Point
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.ML_SERVICE_PORT,
        workers=settings.ML_WORKERS,
        log_level=settings.LOG_LEVEL.lower(),
    )
