-- Migration to add profile_username, last_synced_at, and stats_json to platforms table

ALTER TABLE platforms ADD COLUMN profile_username TEXT;
ALTER TABLE platforms ADD COLUMN last_synced_at TEXT;
ALTER TABLE platforms ADD COLUMN stats_json TEXT;
