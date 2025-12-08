from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Service Configuration
    ML_SERVICE_PORT: int = 8000
    ML_WORKERS: int = 4
    LOG_LEVEL: str = "info"
    
    # Redis (Feature Store + Cache)
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_PASSWORD: Optional[str] = None
    CACHE_TTL: int = 3600  # 1 hour
    
    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    
    # Model Configuration
    MODEL_STORAGE: str = "local"  # or 's3'
    MODEL_PATH: str = "/models"
    S3_BUCKET: Optional[str] = None
    S3_REGION: str = "us-east-1"
    
    # Performance
    ENABLE_GPU: bool = False
    BATCH_SIZE: int = 32
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
