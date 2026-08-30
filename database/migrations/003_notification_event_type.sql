USE monitoring;
ALTER TABLE alert_notifications ADD COLUMN IF NOT EXISTS event_type ENUM('ALERT','RECOVERY') NOT NULL DEFAULT 'ALERT' AFTER channel_id;
