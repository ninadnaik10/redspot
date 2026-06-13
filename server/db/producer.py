from kafka import KafkaProducer
from kafka.errors import KafkaError
from config import settings
import json
import logging

logger = logging.getLogger(__name__)

producer = None


def get_kafka_producer():
    global producer
    if producer is None:
        bootstrap_servers = settings.kafka_bootstrap_servers or "localhost:9092"
        producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            acks="all",
            retries=3,
        )
        logger.info(f"Kafka producer connected to {bootstrap_servers}")
    return producer


def send_event_to_kafka(event_data: dict, topic: str = None) -> bool:
    try:
        producer = get_kafka_producer()
        topic = topic or settings.kafka_topic

        future = producer.send(topic, value=event_data)
        record_metadata = future.get(timeout=10)

        logger.info(
            f"Event sent to Kafka: topic={record_metadata.topic}, "
            f"partition={record_metadata.partition}, offset={record_metadata.offset}"
        )
        return True
    except KafkaError as e:
        logger.error(f"Failed to send event to Kafka: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending to Kafka: {e}")
        return False