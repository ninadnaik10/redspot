#!/bin/bash

set -e

case "$1" in
  up)
    echo "Starting ClickHouse and Kafka..."
    docker-compose up -d
    echo "Waiting for services to be healthy..."
    sleep 10
    echo "✓ Services started"
    echo "  ClickHouse: http://localhost:8123"
    echo "  Kafka: localhost:9092"
    echo "  Kafka UI: http://localhost:8080"
    ;;
  down)
    echo "Stopping services..."
    docker-compose down
    echo "✓ Services stopped"
    ;;
  logs)
    docker-compose logs -f "${2:-clickhouse kafka}"
    ;;
  status)
    docker-compose ps
    ;;
  clickhouse-client)
    docker exec -it heatmap-clickhouse clickhouse-client --host localhost
    ;;
  kafka-topics)
    docker exec -it heatmap-kafka kafka-topics --bootstrap-server localhost:9092 "${@:2}"
    ;;
  kafka-consume)
    docker exec -it heatmap-kafka kafka-console-consumer --topic heatmap_events --bootstrap-server localhost:9092 --from-beginning
    ;;
  reset)
    echo "WARNING: This will delete all data!"
    read -p "Are you sure? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      docker-compose down -v
      docker-compose up -d
      echo "✓ Services reset"
    fi
    ;;
  *)
    echo "Usage: $0 {up|down|logs|status|clickhouse-client|kafka-topics|kafka-consume|reset}"
    exit 1
    ;;
esac