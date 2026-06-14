from fastapi import APIRouter, Query
from db.clickhouse import get_click_heatmap_data
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/heatmap")
async def get_heatmap(url: str = Query(description="Full URL to get heatmap for")):
    try:
        path = urlparse(url).path or "/"
        clicks = get_click_heatmap_data(path)
        return {"ok": True, "clicks": clicks}
    except Exception as e:
        logger.error(f"Failed to fetch heatmap data: {e}")
        return {"ok": True, "clicks": []}