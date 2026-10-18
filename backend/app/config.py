import os
from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    POSTGRES_DB: str = "vickyai"
    POSTGRES_USER: str = "vickyai"
    POSTGRES_PASSWORD: str = "change_this_password"
    DATABASE_URL: str = "postgresql+asyncpg://vickyai:change_this_password@postgres:5432/vickyai"

    # Ollama external LAN service - MUST NOT be hardcoded in application logic
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # Authentication
    JWT_SECRET: str = "change_this_jwt_secret_for_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # File uploads
    UPLOAD_DIR: str = "/app/uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # Application
    ENVIRONMENT: str = "production"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = ["*"]

    # Web Search Configuration
    SEARCH_PROVIDER: str = "duckduckgo"  # 'duckduckgo', 'tavily', 'brave', 'searxng'
    SEARCH_MAX_RESULTS: int = 5
    TAVILY_API_KEY: Optional[str] = None
    BRAVE_API_KEY: Optional[str] = None
    SEARXNG_BASE_URL: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def resolved_upload_dir(self) -> str:
        """Resolve upload directory for both local development and dockerized execution."""
        # If /app/uploads exists (docker container), use it; else use local uploads dir
        if os.path.exists(self.UPLOAD_DIR):
            return self.UPLOAD_DIR
        local_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
        os.makedirs(local_path, exist_ok=True)
        return local_path


@lru_cache()
def get_settings() -> Settings:
    return Settings()
