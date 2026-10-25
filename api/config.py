import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    app_name: str = "Multimodal Construction Intelligence Platform"
    version: str = "1.0.0"
    environment: str = Field(default="development", alias="ENVIRONMENT")
    
    # AI Credentials
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    gemini_model: str = "gemini-2.5-flash"
    
    # Storage
    mongodb_uri: str = Field(default="", alias="MONGODB_URI")
    mongodb_db_name: str = Field(default="construction_intelligence", alias="MONGODB_DB_NAME")
    
    # Weather
    weather_api_key: str = Field(default="", alias="WEATHER_API_KEY")
    
    # CORS
    cors_origins: Union[str, List[str]] = ["*"]
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

    @property
    def is_gemini_configured(self) -> bool:
        return bool(self.gemini_api_key and len(self.gemini_api_key.strip()) > 5)

    @property
    def is_mongodb_configured(self) -> bool:
        return bool(self.mongodb_uri and "mongodb" in self.mongodb_uri)

settings = Settings()
