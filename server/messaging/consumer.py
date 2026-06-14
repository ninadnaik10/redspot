from kafka import KafkaConsumer
from config import settings
from models import ClickEvent
from db.clickhouse import save_event
import json
import logging
import asyncio
import threading

logger = logging.getLogger(__name__)

_shutdown_event = threading.Event()


def _consume_loop():
    bootstrap_servers = settings.kafka_bootstrap_servers or "localhost:9092"
    consumer = KafkaConsumer(
        settings.kafka_topic,
        bootstrap_servers=bootstrap_servers,
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
        group_id="clickhouse-writer",
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        consumer_timeout_ms=1000,
    )
    logger.info(f"Kafka consumer started on topic '{settings.kafka_topic}'")

    try:
        while not _shutdown_event.is_set():
            records = consumer.poll(timeout_ms=1000)
            for tp, messages in records.items():
                for message in messages:
                    try:
                        event = ClickEvent(**message.value)
                        save_event(event)
                    except Exception as e:
                        logger.error(f"Failed to process Kafka message: {e}")
    finally:
        consumer.close()
        logger.info("Kafka consumer stopped")


async def start_consumer():
    _shutdown_event.clear()
    await asyncio.to_thread(_consume_loop)


def stop_consumer():
    _shutdown_event.set()