import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "Redspot"
    app_version: str = "0.1.0"
    debug: bool = False

    server_host: str = "127.0.0.1"
    server_port: int = 8000

    cors_origins: list[str] = ["*"]

    clickhouse_host: Optional[str] = None
    clickhouse_port: int = 8123
    clickhouse_database: str = "redspot"
    clickhouse_user: Optional[str] = None
    clickhouse_password: Optional[str] = None

    kafka_bootstrap_servers: Optional[str] = None
    kafka_topic: str = "redspot_events"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()