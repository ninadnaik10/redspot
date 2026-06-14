import json
from fastapi import Request
from models import ClickEvent
from datetime import datetime, timezone
import logging
from messaging import send_event_to_kafka

logger = logging.getLogger(__name__)


class EventService:
    @staticmethod
    async def parse_and_validate_event(request: Request) -> ClickEvent | None:
        content_type = request.headers.get("content-type", "")

        if "application/json" in content_type:
            data = await request.json()
        else:
            body = await request.body()
            if not body:
                return None
            data = json.loads(body.decode("utf-8"))

        return ClickEvent(**data)

    @staticmethod
    async def process_event(event: ClickEvent, client_host: str | None = None) -> None:
        logger.info(
            f"Event received: {event.event_type} from {event.url}",
            extra={"event_data": event.model_dump()},
        )

        event_data = event.model_dump()
        send_event_to_kafka(event_data)