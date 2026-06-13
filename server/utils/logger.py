import json
from typing import Any


def log_event(event: dict[str, Any], client_host: str | None = None) -> None:
    received_at = datetime.now(timezone.utc).isoformat()

    print(
        json.dumps(
            {
                "received_at": received_at,
                "client_host": client_host,
                "event": event,
            },
            indent=2,
            sort_keys=True,
        ),
        flush=True,
    )