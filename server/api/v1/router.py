from fastapi import APIRouter
from .health import router as health_router
from .events import router as events_router
from .heatmap import router as heatmap_router
from .users import router as users_router
from .auth import router as auth_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router)
api_router.include_router(events_router)
api_router.include_router(heatmap_router)
api_router.include_router(users_router)
api_router.include_router(auth_router)