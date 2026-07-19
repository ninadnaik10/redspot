from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.postgres import get_session
from models import ClickEvent, EventResponse
from services import EventService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/events", response_model=EventResponse)
async def collect_event(request: Request, session: AsyncSession = Depends(get_session)):
    try:
        event = await EventService.parse_and_validate_event(request)
        if not event:
            return {"ok": True, "message": "No event data"}

        # Validate origin against registered website domain
        if not await EventService.validate_origin(event, request, session):
            raise HTTPException(status_code=403, detail="Origin not allowed for this site_id")

        client_host = request.client.host if request.client else None
        await EventService.process_event(event, client_host)
        return {"ok": True, "message": "Event received"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing event: {e}")
        raise HTTPException(status_code=400, detail="Invalid event payload")