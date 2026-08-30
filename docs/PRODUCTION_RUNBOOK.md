# Production Runbook

## 1. Deploy
1. Copy `.env.example` to `.env` and set strong database/API secrets.
2. Start MySQL, API and PHP with Docker Compose.
3. Apply all SQL files in `database/schema.sql` and `database/migrations/` in order.
4. Enroll each Agent with a unique token.

## 2. Verify
- `GET /health` returns healthy.
- Agent heartbeat updates `last_seen`.
- Metrics and checks appear in MySQL.
- Dashboard shows the host.
- Test every notification channel.

## 3. Operations
- Put hosts in Maintenance before planned work.
- Acknowledge alerts when an operator owns the incident.
- Configure dependencies from infrastructure root to dependent services.
- Keep retention policies aligned with available MySQL storage.

## 4. Security
- Use HTTPS in production.
- Never commit `.env`, agent tokens, Telegram tokens or SMTP passwords.
- Rotate credentials periodically.
- Restrict API access to required networks.
- Run Agents with the least-privileged account that still permits required collectors.

## 5. Recovery
- Back up MySQL regularly and test restores.
- Preserve Agent local queues during API outages.
- After an API/database outage, verify Agent backlog drains and alerts recover normally.

## 6. Upgrade
1. Back up MySQL.
2. Review release notes and migrations.
3. Apply migrations before starting workers that depend on them.
4. Restart API/workers.
5. Roll out Agent updates in a small canary group before broad deployment.
6. Verify heartbeat, metrics, checks and notifications.
