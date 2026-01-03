"""
Smart Notification Model - TRAINING ONLY

═══════════════════════════════════════════════════════════════════════════════
⚠️  ARCHITECTURE DECISION RECORD (ADR-002)
═══════════════════════════════════════════════════════════════════════════════

STATUS: DEPRECATED FOR INFERENCE

This Python model is for TRAINING and BATCH PROCESSING only.
Real-time inference is handled by the TypeScript Edge Function:
  services/ml/smart-notifications/index.ts

DO NOT use this model for real-time notification scheduling.
It exists only for:
  1. Model training pipelines
  2. Batch analytics
  3. A/B test analysis
  4. Offline feature engineering

See: docs/ARCHITECTURE_CLEANUP_REPORT.md for full context
═══════════════════════════════════════════════════════════════════════════════
"""

import warnings
from app.core.base_model import BaseModel
from typing import Dict, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Deprecation warning
warnings.warn(
    "SmartNotificationModel is deprecated for real-time inference. "
    "Use the TypeScript Edge Function at services/ml/smart-notifications/index.ts instead.",
    DeprecationWarning,
    stacklevel=2
)


class SmartNotificationModel(BaseModel):
    """
    Smart notification timing and channel prediction.
    
    DEPRECATED: For training and batch processing only.
    Real-time inference should use the TypeScript Edge Function.
    """
    
    async def load(self):
        """Load smart notification model"""
        logger.warning(
            "SmartNotificationModel.load() called. "
            "This model is deprecated for inference. Use TypeScript Edge Function instead."
        )
        logger.info("Loading smart notification model...")
        
        # TODO: Load actual model
        self.model = "mock_notification_model"
        self.loaded = True
        
        logger.info("✓ Smart notification model loaded")
    
    async def predict(self, user_id: str, notification_type: str, urgency: str) -> Dict[str, Any]:
        """
        Predict optimal notification timing and channel.
        
        DEPRECATED: Use TypeScript Edge Function for real-time inference.
        
        Returns:
            {
                "send_at": datetime,
                "channel": str (push/email/sms),
                "confidence": float,
                "reason": str
            }
        """
        if not self.loaded:
            raise RuntimeError("Model not loaded")
        
        # TODO: Implement actual prediction logic
        # For now, using simple heuristics
        
        # Mock: User most active at 2-3pm on weekdays
        now = datetime.now()
        optimal_hour = 14  # 2 PM
        
        if now.hour < optimal_hour:
            send_at = now.replace(hour=optimal_hour, minute=30, second=0, microsecond=0)
        else:
            # Next day
            send_at = (now + timedelta(days=1)).replace(hour=optimal_hour, minute=30, second=0, microsecond=0)
        
        # Channel selection based on urgency
        channel_map = {
            "high": "push",
            "medium": "push",
            "low": "email",
        }
        
        channel = channel_map.get(urgency, "push")
        
        return {
            "send_at": send_at,
            "channel": channel,
            "confidence": 0.88,
            "reason": "User most active at 2-3pm on weekdays",
        }
