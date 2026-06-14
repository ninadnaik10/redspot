CREATE DATABASE IF NOT EXISTS redspot;

CREATE TABLE IF NOT EXISTS redspot.click_events (
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
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS redspot.click_events_aggregated (
    date Date,
    path String,
    hourly_timestamp DateTime,
    click_count UInt32,
    unique_visitors UInt32,
    top_x_coords Array(Int32),
    top_y_coords Array(Int32),
    top_elements Array(String)
) ENGINE = SummingMergeTree()
ORDER BY (date, path, hourly_timestamp)
SETTINGS index_granularity = 8192;