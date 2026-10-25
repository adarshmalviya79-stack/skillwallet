from fastapi import APIRouter
from datetime import datetime, timezone
from api.schemas import ApiResponse
from api.config import settings
from api.storage import storage

router = APIRouter()

@router.get("/health", response_model=ApiResponse[dict])
async def check_health():
    return ApiResponse(
        success=True,
        data={
            "status": "healthy",
            "app_name": settings.app_name,
            "version": settings.version,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "services": {
                "gemini_multimodal_ai": "active" if settings.is_gemini_configured else "demo_mode",
                "gemini_model": settings.gemini_model,
                "database_storage": storage.storage_mode,
                "is_storage_persistent": storage.is_persistent,
                "weather_provider": "Open-Meteo Live API"
            }
        }
    )
