# Redspot

Scalable FastAPI server for collecting and processing website click events with ClickHouse and Kafka.

## Folder Structure

```
server/
├── main.py                 # Application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment configuration template
├── docker-compose.yml     # Docker services (ClickHouse, Kafka, Zookeeper)
├── docker-services.sh     # Service management script
├── config/                # Configuration management
│   ├── __init__.py
│   └── settings.py        # Pydantic settings
├── api/                   # API routes
│   ├── __init__.py
│   └── v1/               # API v1 namespace
│       ├── __init__.py
│       ├── router.py     # Main v1 router
│       ├── health.py     # Health check endpoint
│       └── events.py     # Event ingestion endpoint
├── models/               # Pydantic models/schemas
│   ├── __init__.py
│   └── event.py         # Event data models
├── services/             # Business logic
│   ├── __init__.py
│   └── event_service.py # Event processing service
├── utils/                # Utility functions
│   ├── __init__.py
│   └── logger.py        # Logging utilities
├── db/                   # Database connections
│   └── clickhouse/      # ClickHouse integration
│       ├── __init__.py
│       ├── connection.py # ClickHouse connection
│       ├── queries.py    # ClickHouse queries
│       └── init_clickhouse.sql
└── messaging/            # Kafka messaging
    ├── __init__.py
    ├── producer.py       # Kafka producer
    └── consumer.py       # Kafka consumer
```

## Quick Start

### Prerequisites
- Python 3.9+
- Docker & Docker Compose
- pip

### 1. Start Docker Services (ClickHouse + Kafka)

```bash
cd server

# Start services
./docker-services.sh up

# Or manually
docker-compose up -d
```

### 2. Setup Python Environment

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment config
cp .env.example .env
```

### 3. Run FastAPI Server

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Docker Services Management

```bash
./docker-services.sh up              # Start all services
./docker-services.sh down            # Stop all services
./docker-services.sh logs            # View logs
./docker-services.sh status          # Check service status
./docker-services.sh clickhouse-client  # Open ClickHouse CLI
./docker-services.sh kafka-topics    # List Kafka topics
./docker-services.sh kafka-consume   # Consume events from Kafka
./docker-services.sh reset           # Reset all data (⚠️ destructive)
```

## Service URLs

- **FastAPI Server**: http://localhost:8000
- **ClickHouse HTTP**: http://localhost:8123
- **ClickHouse Native**: localhost:9000
- **Kafka**: localhost:9092
- **Kafka UI**: http://localhost:8080

## API Endpoints

### Health Check
- `GET /api/v1/health` - Server health status

### Event Ingestion
- `POST /api/v1/events` - Collect click events

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DEBUG | Debug mode | false |
| HOST | Server host | 127.0.0.1 |
| PORT | Server port | 8000 |
| CORS_ORIGINS | Allowed CORS origins | localhost:5173 |
| CLICKHOUSE_HOST | ClickHouse server | localhost |
| CLICKHOUSE_PORT | ClickHouse HTTP port | 8123 |
| CLICKHOUSE_DATABASE | ClickHouse database | redspot |
| CLICKHOUSE_USER | ClickHouse user | default |
| CLICKHOUSE_PASSWORD | ClickHouse password | (empty) |
| KAFKA_BOOTSTRAP_SERVERS | Kafka servers | localhost:9092 |
| KAFKA_TOPIC | Kafka topic | redspot_events |

## Database Schema

### ClickHouse Tables

**click_events** - Raw click event data
```sql
CREATE TABLE redspot.click_events (
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
    received_at DateTime64(3)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, path, url)
```

## Testing

### Send Test Event

```bash
curl -X POST http://localhost:8000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "click",
    "url": "http://localhost:5173",
    "path": "/",
    "timestamp": "2025-01-11T10:30:45.123Z",
    "click_x": 500,
    "click_y": 300,
    "screen_width": 1920,
    "screen_height": 1080,
    "doc_width": 1920,
    "doc_height": 2000,
    "target_tag": "button",
    "target_id": "submit-btn",
    "target_class": "btn-primary",
    "target_text": "Submit"
  }'
```

### Verify ClickHouse Data

```bash
docker exec -it redspot-clickhouse clickhouse-client --query "SELECT * FROM redspot.click_events LIMIT 10 FORMAT Pretty"
```

### Verify Kafka Messages

```bash
./docker-services.sh kafka-consume
```

## Architecture

```
Client App (React)
    ↓ (POST /api/v1/events)
FastAPI Server
    ├─→ Kafka Producer (async)
    │       ↓
    │   Kafka Topic (redspot_events)
    │       ↓
    │   Kafka Consumer (async)
    │       ↓
    └─→ ClickHouse (persistent storage)
```

## Troubleshooting

### Services not starting
```bash
# Check logs
docker-compose logs clickhouse kafka

# Restart services
./docker-services.sh down && ./docker-services.sh up
```

### ClickHouse connection issues
```bash
# Verify ClickHouse is running
docker exec -it redspot-clickhouse clickhouse-client --query "SELECT 1"

# Check database exists
docker exec -it redspot-clickhouse clickhouse-client --query "SHOW DATABASES"
```

### Kafka connection issues
```bash
# List topics
./docker-services.sh kafka-topics --list

# Create topic manually
docker exec -it redspot-kafka kafka-topics --create --topic redspot_events --bootstrap-server localhost:9092
```