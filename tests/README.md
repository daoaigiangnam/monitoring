# Monitoring Test Strategy

The project uses three test layers:

1. **Unit** — collectors, checks, alert expressions and utility services.
2. **API integration** — authentication, Agent heartbeat/report, CRUD and alert lifecycle against a disposable MySQL database.
3. **End-to-end** — Agent → API → MySQL → alert → notification.

Before a production release, CI must run syntax checks plus unit/integration tests. The integration environment must use an isolated database and test credentials only.

## Required scenarios

- Agent enrollment/authentication and invalid-token rejection.
- Heartbeat updates last-seen state.
- Metrics ingestion persists data.
- TCP/HTTP/DNS/SSL checks persist results.
- Threshold alert opens only after configured duration.
- Duplicate samples do not create duplicate open alerts.
- Recovery closes the active alert and creates a recovery event.
- Maintenance suppresses notifications without losing alert state.
- Dependency suppression prevents child notification spam.
- Notification retry/backoff records failures and eventual success.
- RBAC rejects unauthorized administrative operations.
- Retention removes only data outside configured retention windows.
