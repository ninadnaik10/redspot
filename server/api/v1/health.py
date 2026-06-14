from fastapi import APIRouter
from models import HealthResponse
from datetime import datetime, timezone
from config import settings


router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": settings.app_version,
    }