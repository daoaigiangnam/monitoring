USE monitoring;

ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS token_created_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS token_last_used_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS token_revoked_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 1,
  ADD INDEX IF NOT EXISTS idx_agents_last_seen(last_seen),
  ADD INDEX IF NOT EXISTS idx_agents_enabled(enabled);

CREATE TABLE IF NOT EXISTS agent_enrollment_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  agent_id BIGINT UNSIGNED NOT NULL,
  event_type VARCHAR(32) NOT NULL,
  actor VARCHAR(128) NULL,
  ip_address VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_enrollment_agent_created(agent_id, created_at),
  CONSTRAINT fk_enrollment_agent FOREIGN KEY(agent_id) REFERENCES agents(id) ON DELETE CASCADE
) ENGINE=InnoDB;
