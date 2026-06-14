-- Migration: heatmap -> redspot
-- Run this against your ClickHouse instance to move all data from the old database to the new one.

-- 1. Create new database
CREATE DATABASE IF NOT EXISTS redspot;

-- 2. Create tables in new database
CREATE TABLE IF NOT EXISTS redspot.click_events AS heatmap.click_events;

CREATE TABLE IF NOT EXISTS redspot.click_events_aggregated AS heatmap.click_events_aggregated;

-- 3. Copy data
INSERT INTO redspot.click_events SELECT * FROM heatmap.click_events;

INSERT INTO redspot.click_events_aggregated SELECT * FROM heatmap.click_events_aggregated;

-- 4. Verify row counts match
SELECT 'heatmap.click_events' AS table, count() AS rows FROM heatmap.click_events
UNION ALL
SELECT 'redspot.click_events' AS table, count() AS rows FROM redspot.click_events
UNION ALL
SELECT 'heatmap.click_events_aggregated' AS table, count() AS rows FROM heatmap.click_events_aggregated
UNION ALL
SELECT 'redspot.click_events_aggregated' AS table, count() AS rows FROM redspot.click_events_aggregated;

-- 5. Drop old database (uncomment after verifying counts)
-- DROP DATABASE heatmap;