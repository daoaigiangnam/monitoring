CREATE DATABASE IF NOT EXISTS monitoring CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE monitoring;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  role ENUM('admin','operator','viewer') NOT NULL DEFAULT 'viewer',
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS agents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  agent_id VARCHAR(100) NOT NULL UNIQUE,
  hostname VARCHAR(255) NULL,
  ip_address VARCHAR(64) NULL,
  os_name VARCHAR(255) NULL,
  agent_version VARCHAR(50) NULL,
  agent_token CHAR(64) NOT NULL,
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  last_seen DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_agents_last_seen (last_seen),
  INDEX idx_agents_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS agent_configs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  agent_id BIGINT UNSIGNED NOT NULL,
  config_json JSON NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  INDEX idx_agent_configs_active (agent_id, is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS metrics (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  agent_id BIGINT UNSIGNED NOT NULL,
  metric_key VARCHAR(191) NOT NULL,
  metric_value DOUBLE NOT NULL,
  label_json JSON NULL,
  recorded_at DATETIME(3) NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  INDEX idx_metrics_agent_key_time (agent_id, metric_key, recorded_at),
  INDEX idx_metrics_time (recorded_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS monitor_checks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  agent_id BIGINT UNSIGNED NOT NULL,
  check_type ENUM('ping','tcp','udp','http','https','dns','ssl','service','process','custom') NOT NULL,
  name VARCHAR(190) NOT NULL,
  target VARCHAR(500) NOT NULL,
  port INT UNSIGNED NULL,
  config_json JSON NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  INDEX idx_checks_agent_enabled (agent_id, enabled)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS check_results (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  check_id BIGINT UNSIGNED NOT NULL,
  status ENUM('up','down','warning','unknown') NOT NULL,
  response_ms DOUBLE NULL,
  detail_json JSON NULL,
  checked_at DATETIME(3) NOT NULL,
  FOREIGN KEY (check_id) REFERENCES monitor_checks(id) ON DELETE CASCADE,
  INDEX idx_check_results_check_time (check_id, checked_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alert_rules (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  metric_key VARCHAR(191) NOT NULL,
  operator ENUM('>','>=','<','<=','=','!=') NOT NULL,
  threshold DOUBLE NULL,
  duration_seconds INT UNSIGNED NOT NULL DEFAULT 0,
  severity ENUM('info','warning','high','critical') NOT NULL DEFAULT 'warning',
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alerts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  agent_id BIGINT UNSIGNED NULL,
  rule_id BIGINT UNSIGNED NULL,
  fingerprint CHAR(64) NOT NULL,
  severity ENUM('info','warning','high','critical') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open','acknowledged','resolved') NOT NULL DEFAULT 'open',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  acknowledged_at DATETIME NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL,
  FOREIGN KEY (rule_id) REFERENCES alert_rules(id) ON DELETE SET NULL,
  UNIQUE KEY uq_alert_fingerprint_status (fingerprint, status),
  INDEX idx_alert_status_time (status, started_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alert_notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  alert_id BIGINT UNSIGNED NOT NULL,
  channel ENUM('telegram','email','webhook') NOT NULL,
  destination VARCHAR(500) NOT NULL,
  status ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
  sent_at DATETIME NULL,
  error_message TEXT NULL,
  FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
  INDEX idx_notification_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(190) NOT NULL,
  entity_type VARCHAR(100) NULL,
  entity_id BIGINT UNSIGNED NULL,
  payload_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;
