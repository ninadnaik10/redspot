import clickhouse_connect
from config import settings

client = None


def get_clickhouse_client():
    global client
    if client is None:
        client = clickhouse_connect.get_client(
            host=settings.clickhouse_host or "localhost",
            port=settings.clickhouse_port,
            database=settings.clickhouse_database,
            username=settings.clickhouse_user,
            password=settings.clickhouse_password,
        )
    return client


def init_database():
    client = get_clickhouse_client()
    client.command("CREATE DATABASE IF NOT EXISTS redspot")
    client.command("USE redspot")
    client.command("""
        CREATE TABLE IF NOT EXISTS click_events (
            event_type String,
            url String,
            path String,
            timestamp DateTime64(3),
            click_x Int32,
            click_y Int32,
            screen_width Int32,
            screen_height Int32,
            doc_width Int32,
            doc_height Int32,
            target_tag Nullable(String),
            target_id Nullable(String),
            target_class Nullable(String),
            target_text Nullable(String),
            received_at DateTime64(3) DEFAULT now64(3)
        ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(timestamp)
        ORDER BY (timestamp, path, url)
    """)