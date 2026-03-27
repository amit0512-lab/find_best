from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # PostgreSQL
    POSTGRESQL_URL: str = "postgresql+asyncpg://user:password@localhost:5432/pickai_db"
    
    # Feature Flag
    USE_REAL_DATA: bool = False
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
