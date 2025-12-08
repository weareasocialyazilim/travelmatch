from abc import ABC, abstractmethod
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class BaseModel(ABC):
    """Base class for all ML models"""
    
    def __init__(self):
        self.model = None
        self.loaded = False
    
    @abstractmethod
    async def load(self):
        """Load model weights from disk/S3"""
        pass
    
    @abstractmethod
    async def predict(self, **kwargs) -> Dict[str, Any]:
        """Run inference"""
        pass
    
    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.loaded
