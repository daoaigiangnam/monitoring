USE monitoring;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS token_created_at DATETIME NULL;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS token_last_used_at DATETIME NULL;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS token_revoked_at DATETIME NULL;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS token_version INT UNSIGNED NOT NULL DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_agents_token_revoked ON agents(token_revoked_at);
