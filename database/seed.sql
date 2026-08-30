USE monitoring;
-- Bootstrap login: admin / ChangeMe!123. Change immediately in production.
INSERT INTO users (username,password_hash,role,enabled) VALUES ('admin','$2y$12$iEMPbsEOEN.ztVLZ9ZP/../yCPCusHKyDicumtKQzXZ1CQeHpjNtm','ADMIN',1)
ON DUPLICATE KEY UPDATE role='ADMIN',enabled=1;

INSERT INTO alert_rules (name,metric_key,operator,threshold,severity,duration_sec,enabled) VALUES
('High CPU','system.cpu.util','>=',90,'WARNING',300,1),
('Critical CPU','system.cpu.util','>=',95,'CRITICAL',120,1),
('High Memory','memory.util','>=',90,'WARNING',300,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),severity=VALUES(severity),threshold=VALUES(threshold);
