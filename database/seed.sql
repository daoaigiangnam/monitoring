USE monitoring;
-- Default password: ChangeMe!123 (change immediately in production)
INSERT INTO users (username,password_hash,role,enabled) VALUES ('admin','$2y$10$9QmV2V4lF4mP7jR2eN7h8uX4p2vR5Qk9c0Wm3Lx6sA1bD8fG7hI2j','ADMIN',1)
ON DUPLICATE KEY UPDATE role='ADMIN',enabled=1;

INSERT INTO alert_rules (name,metric_key,operator,threshold,severity,duration_sec,enabled) VALUES
('High CPU','system.cpu.util','>=',90,'WARNING',300,1),
('Critical CPU','system.cpu.util','>=',95,'CRITICAL',120,1),
('High Memory','memory.util','>=',90,'WARNING',300,1)
ON DUPLICATE KEY UPDATE name=VALUES(name);
