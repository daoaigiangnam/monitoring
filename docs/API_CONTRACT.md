# API Contract v1

Base URL: `/api/v1`

## Agent
- `POST /agent/heartbeat` — authenticated Agent heartbeat and identity.
- `POST /agent/report` — authenticated metrics/check report.
- `GET /agent/config` — authenticated remote monitoring configuration.

## Monitoring
- `GET /hosts` — list monitored hosts.
- `GET /hosts/:id` — host detail.
- `GET /hosts/:id/metrics` — historical metrics.
- `GET /hosts/:id/alerts` — host alerts.
- `GET /monitor-items` — list items.
- `POST /monitor-items` — create item.
- `PUT /monitor-items/:id` — update item.
- `DELETE /monitor-items/:id` — delete item.

## Alerting
- `GET /alerts` — alert list.
- `POST /alerts/:id/ack` — acknowledge an alert.
- `GET /alert-rules` — rules.
- `POST /alert-rules` — create rule.
- `PUT /alert-rules/:id` — update rule.
- `DELETE /alert-rules/:id` — delete rule.

## Infrastructure
- `GET /dependencies`
- `POST /dependencies`
- `DELETE /dependencies/:id`
- `GET /maintenance`
- `POST /maintenance`
- `DELETE /maintenance/:id`
- `GET /notification-channels`
- `POST /notification-channels`
- `PUT /notification-channels/:id`
- `DELETE /notification-channels/:id`
- `POST /notification-channels/:id/test`

## Rules
- All Agent endpoints require an Agent token.
- Administrative endpoints require authenticated PHP session/RBAC.
- JSON responses use `{ success, data?, error? }`.
- Timestamps are UTC ISO-8601.
- Mutating endpoints must enforce CSRF when called through the PHP UI.
