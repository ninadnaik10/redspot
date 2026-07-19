import json
import time
from urllib.parse import urlparse
from fastapi import Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import ClickEvent
from models.website import Website
from datetime import datetime, timezone
import logging
from messaging import send_event_to_kafka

logger = logging.getLogger(__name__)

# In-memory cache: site_id -> (domain, expires_at)
_site_cache: dict[str, tuple[str, float]] = {}
_CACHE_TTL = 300  # 5 minutes


def _extract_domain(url: str) -> str:
    """Extract domain (host) from a URL."""
    parsed = urlparse(url)
    return parsed.hostname or ""


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
    async def validate_origin(event: ClickEvent, request: Request, session: AsyncSession) -> bool:
        """Validate that the request origin matches the registered website domain."""
        if not event.site_id:
            logger.warning("Event rejected: no site_id provided")
            return False

        # Get registered domain for this site_id (check cache first)
        registered_domain = None
        now = time.time()
        cached = _site_cache.get(event.site_id)
        if cached and cached[1] > now:
            registered_domain = cached[0]
        else:
            # Look up in Postgres
            result = await session.execute(
                select(Website.url).where(Website.site_id == event.site_id)
            )
            row = result.scalar_one_or_none()
            if row is None:
                logger.warning(f"Unknown site_id: {event.site_id}")
                return False
            registered_domain = _extract_domain(row)
            _site_cache[event.site_id] = (registered_domain, now + _CACHE_TTL)

        # Extract origin from headers
        origin = request.headers.get("origin") or request.headers.get("referer") or ""
        request_domain = _extract_domain(origin)

        if not request_domain:
            logger.warning(f"No Origin/Referer header for site_id={event.site_id}")
            return False

        if request_domain != registered_domain:
            logger.warning(
                f"Origin mismatch for site_id={event.site_id}: "
                f"expected={registered_domain}, got={request_domain}"
            )
            return False

        return True

    @staticmethod
    async def process_event(event: ClickEvent, client_host: str | None = None) -> None:
        logger.info(
            f"Event received: {event.event_type} from {event.url}",
            extra={"event_data": event.model_dump()},
        )

        event_data = event.model_dump()
        send_event_to_kafka(event_data)