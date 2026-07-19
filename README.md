# Redspot

Redspot is a website analytics platform for collecting, processing, and visualizing user interaction data. The current focus is click tracking, website heatmaps, data aggregation, and analytics dashboards.

The project is also a learning playground for event-driven architecture with Kafka and real-time analytics with ClickHouse.

## Motivation

I built Redspot to understand how modern analytics systems move data from a user's browser into a real-time analytics store.

The main learning goals are:

- Use Kafka to decouple event ingestion from event processing.
- Use ClickHouse for fast analytical queries over high-volume event data.
- Build a full flow from browser tracking script to backend ingestion to visual analytics.
- Learn how product analytics platforms can turn raw interaction events into useful UX insights.

## Features

- Website registration and authenticated dashboard access.
- Browser tracking script served by the backend.
- Click event collection from tracked websites.
- Kafka-based event pipeline for asynchronous processing.
- ClickHouse storage for analytics and heatmap queries.
- Heatmap viewer for visualizing where users interact with a page.
- PostgreSQL-backed user and website management.

## Future AI Features

Planned AI capabilities include:

- Understanding user journeys across pages and sessions.
- Decoding analytical data into plain-language insights.
- Suggesting UX improvements based on user behavior.
- Identifying friction points, confusing interactions, and drop-off patterns.

## Architecture

At a high level, Redspot follows this flow:

```text
Tracked Website
    -> Redspot tracking script
    -> FastAPI event ingestion API
    -> Kafka topic
    -> Kafka consumer
    -> ClickHouse analytics storage
    -> React dashboard and heatmap viewer
```

Kafka keeps event collection separate from processing, which makes the system easier to scale and reason about. ClickHouse is used for analytics because it is designed for fast aggregation over large event datasets.

## Project Structure

```text
.
├── web/      # React dashboard and heatmap viewer
└── server/   # FastAPI backend, event pipeline, databases, and tracking script
```

### `web/`

The frontend application is built with React and Vite. It contains the authenticated dashboard, website management screens, and heatmap viewer.

Main responsibilities:

- User login and registration UI.
- Dashboard for managing tracked websites.
- Heatmap viewer for inspecting click data.
- API integration with the backend.

### `server/`

The backend is built with FastAPI. It handles authentication, website registration, event ingestion, Kafka messaging, ClickHouse analytics queries, and PostgreSQL-backed application data.

Main responsibilities:

- Serve the tracking script at `/track.js`.
- Receive click events at the API layer.
- Validate events against registered websites.
- Publish events to Kafka.
- Consume events and persist analytics data to ClickHouse.
- Store users and website metadata in PostgreSQL.
- Expose heatmap and analytics APIs for the frontend.

## Screenshots

<img width="1882" height="1037" alt="Screenshot 2026-07-19 at 1 45 13 PM" src="https://github.com/user-attachments/assets/f601e87f-4803-4219-838c-9379ece1bc1b" />
<img width="1875" height="1038" alt="Screenshot 2026-07-19 at 1 45 23 PM" src="https://github.com/user-attachments/assets/98028cfc-d83f-4ba1-ac1a-0a966a001b70" />
