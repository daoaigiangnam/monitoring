# Infrastructure Monitoring

A production-oriented Mini-Zabbix-style infrastructure monitoring platform.

## Final architecture
- **Agent:** Node.js 20+, Windows/Linux collectors and active checks
- **Backend API:** Node.js + Fastify
- **Database:** MySQL 8
- **Frontend/Admin:** Plain PHP 8.2+, Bootstrap 5, Chart.js
- **Notifications:** Telegram / SMTP email / Webhook
- **Deployment:** Docker Compose

## Monitoring scope
CPU, memory, swap/pagefile, filesystem capacity and inode, disk I/O, network I/O/errors, OS/hostname/IP/MAC/uptime, processes, Windows services, Linux systemd, ping, TCP, HTTP/HTTPS, DNS, TLS expiry, discovery, heartbeat, offline queue, trigger evaluation, deduplication, recovery, acknowledgement, maintenance, dependencies and audit logging.

## Quick start
1. Copy `.env.example` to `.env` and set strong secrets.
2. `docker compose up -d --build`
3. Open the PHP frontend on port 8080.
4. Create/enroll an agent with the API enrollment endpoint.
5. Configure checks and thresholds in Admin.

## Agent
`cd agent && npm install && npm start`

Set `API_URL`, `AGENT_ID`, and `AGENT_TOKEN` in the environment or `agent/config.json`.

## Security
Use HTTPS in production, rotate agent tokens, restrict API exposure, never commit `.env`, and run the agent with the least privilege required by the collectors you enable.

## Production notes
Metrics are retained by policy. Raw metrics should be aggregated before long-term retention. Run the API worker/cron jobs continuously in production. The included Docker setup is a development/single-node baseline, not a high-availability topology.
