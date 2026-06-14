from .connection import get_clickhouse_client
from models import ClickEvent
from typing import List, Dict, Any
from datetime import datetime


def parse_timestamp(timestamp_str: str) -> datetime:
    """Parse ISO timestamp string to datetime object, handling Z suffix"""
    if timestamp_str.endswith('Z'):
        timestamp_str = timestamp_str[:-1] + '+00:00'
    return datetime.fromisoformat(timestamp_str)


def save_event(event: ClickEvent) -> None:
    client = get_clickhouse_client()

    # Convert timestamp string to datetime object
    parsed_timestamp = parse_timestamp(event.timestamp)

    data = [
        (
            event.event_type,
            event.url,
            event.path,
            parsed_timestamp,
            event.click_x,
            event.click_y,
            event.screen_width,
            event.screen_height,
            event.doc_width,
            event.doc_height,
            event.target_tag,
            event.target_id,
            event.target_class,
            event.target_text,
        )
    ]

    columns = [
        "event_type", "url", "path", "timestamp", "click_x", "click_y",
        "screen_width", "screen_height", "doc_width", "doc_height",
        "target_tag", "target_id", "target_class", "target_text"
    ]

    try:
        client.insert(
            "redspot.click_events",
            data,
            column_names=columns
        )
    except Exception as e:
        print(f"ClickHouse insert error: {e}")
        print(f"Columns: {columns}")
        print(f"Data: {data}")
        raise


def get_click_heatmap_data(path: str) -> List[Dict[str, Any]]:
    client = get_clickhouse_client()

    query = """
        SELECT
            click_x,
            click_y,
            screen_width,
            doc_width,
            doc_height
        FROM redspot.click_events
        WHERE path = %(path)s
        ORDER BY timestamp DESC
        LIMIT 10000
    """

    result = client.query(query, parameters={"path": path})
    columns = ["click_x", "click_y", "screen_width", "doc_width", "doc_height"]
    return [dict(zip(columns, row)) for row in result.result_rows]


def get_click_stats(path: str = None) -> Dict[str, Any]:
    client = get_clickhouse_client()

    if path:
        query = """
            SELECT
                count() as total_clicks,
                uniqExact(url) as unique_urls,
                min(timestamp) as first_click,
                max(timestamp) as last_click
            FROM redspot.click_events
            WHERE path = %(path)s
        """
        return client.query_dict(query, parameters={"path": path})[0]
    else:
        query = """
            SELECT
                count() as total_clicks,
                uniqExact(url) as unique_urls,
                min(timestamp) as first_click,
                max(timestamp) as last_click
            FROM redspot.click_events
        """
        return client.query_dict(query)[0]