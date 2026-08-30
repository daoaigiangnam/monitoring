USE monitoring;
INSERT INTO users (email, password_hash, name, role) VALUES ('admin@example.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3RoY5s3mTg9aS9jI2kC4N0P2m', 'Administrator', 'admin') ON DUPLICATE KEY UPDATE name = VALUES(name);
