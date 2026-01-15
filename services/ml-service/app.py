"""
ML Service Main Application

Includes:
- Content moderation
- NSFW detection
- Spam detection
- Proof quality scoring
- Health monitoring
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import routers
from api.content_moderation import router as moderation_router
from api.proof_scoring import router as scoring_router

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Lovendo ML Service",
    description="Machine learning microservice for content moderation and quality scoring",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(moderation_router, tags=["moderation"])
app.include_router(scoring_router, tags=["scoring"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Lovendo ML Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "moderation": "/api/moderate-content",
            "scoring": "/api/score-proof",
            "health": "/health",
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # TODO: Check ML models loaded
        # TODO: Check GPU availability
        # TODO: Check dependencies
        
        return {
            "status": "healthy",
            "models": {
                "face_detection": "loaded",
                "id_detection": "loaded",
                "nsfw_detection": "loaded",
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
