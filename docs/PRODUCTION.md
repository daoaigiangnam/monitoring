# Production deployment checklist

## Before go-live
- Put API behind TLS/reverse proxy.
- Change all default database credentials.
- Generate unique random agent tokens; store only token hashes server-side.
- Restrict `/api/v1/agent/*` to expected network ranges when possible.
- Run API and workers as non-root service accounts.
- Configure Telegram/SMTP/Webhook channels in the database.
- Configure retention and backups for MySQL.
- Test an agent outage, service failure, disk threshold and recovery notification.

## Agent configuration
`config.json` supports active checks:

```json
{"tcp":[{"host":"10.0.0.10","port":443,"timeout":3000}],"http":[{"url":"https://example.com","timeout":5000}],"dns":[{"name":"example.com","record":"A"}]}
```

## API
- `GET /health`
- `POST /api/v1/agent/report` with `Authorization: Bearer <agent-token>`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/hosts`
- `GET /api/v1/hosts/:id/metrics`
- `GET /api/v1/alerts`

## Design boundaries
The agent collects and checks. The API validates, persists and evaluates. PHP renders/administers. MySQL is the source of truth. This separation allows future mobile/Grafana clients without changing the agent protocol.
