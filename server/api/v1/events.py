from fastapi import APIRouter, Request, HTTPException
from models import ClickEvent, EventResponse
from services import EventService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/events", response_model=EventResponse)
async def collect_event(request: Request):
    try:
        event = await EventService.parse_and_validate_event(request)

        if event:
            client_host = request.client.host if request.client else None
            await EventService.process_event(event, client_host)

        return {"ok": True, "message": "Event received"}
    except Exception as e:
        logger.error(f"Error processing event: {e}")
        raise HTTPException(status_code=400, detail="Invalid event payload")