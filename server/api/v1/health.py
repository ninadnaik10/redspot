from fastapi import APIRouter
from models import HealthResponse
from datetime import datetime
from config import settings


router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.app_version,
    }