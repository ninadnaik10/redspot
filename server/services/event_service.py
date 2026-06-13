import json
from fastapi import Request
from models import ClickEvent
from typing import Any
from datetime import datetime, timezone
import logging
from db.kafka import send_event_to_kafka
from db.clickhouse import save_event

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
        received_at = datetime.now(timezone.utc).isoformat()

        print(
            json.dumps(
                {
                    "received_at": received_at,
                    "client_host": client_host,
                    "event": event.model_dump(),
                },
                indent=2,
                sort_keys=True,
            ),
            flush=True,
        )

        logger.info(
            f"Event received: {event.event_type} from {event.url}",
            extra={"event_data": event.model_dump()},
        )

        try:

            event_data = event.model_dump()

            send_event_to_kafka(event_data)

            # Convert timestamp to string format for ClickHouse
            event_dict = event_data.copy()
            if isinstance(event_dict.get('timestamp'), str):
                # ClickHouse expects ISO format for DateTime64
                pass
            save_event(event)
        except ImportError:
            logger.warning("ClickHouse/Kafka not available, skipping persistence")
        except Exception as e:
            logger.error(f"Failed to persist event: {e}")