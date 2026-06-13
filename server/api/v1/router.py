from fastapi import APIRouter
from .health import router as health_router
from .events import router as events_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router)
api_router.include_router(events_router)