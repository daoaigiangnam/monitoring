# Infrastructure Monitoring

Mini-Zabbix-style infrastructure monitoring platform.

## Stack
- Agent: Node.js (Windows/Linux capable)
- Backend API: Node.js + Fastify
- Database: MySQL 8
- Frontend/Admin: PHP 8+ (plain PHP), Bootstrap 5, Chart.js
- Notifications: Telegram / Email / Webhook
- Deployment: Docker Compose

## Repository layout
- `agent/` monitoring agent
- `api/` Node.js API and alert engine
- `frontend/` plain-PHP dashboard and admin
- `database/` MySQL schema and seed data
- `docs/` architecture, API and deployment docs
- `docker-compose.yml` local/dev deployment

## Monitored areas
CPU, RAM, disk usage/I/O, network I/O, OS, hostname, LAN IPs, uptime, processes, Windows/Linux services, ping, TCP ports, HTTP/HTTPS URLs, DNS, SSL certificate expiry, discovery, heartbeat, offline buffering and alerts.

## Quick start
1. Copy `.env.example` to `.env` and set secrets.
2. Run `docker compose up -d`.
3. Import `database/schema.sql` (automatically mounted by MySQL on first initialization).
4. Open PHP frontend and log in with the seeded admin account shown in `.env.example`; change it immediately.
5. Build/run the agent from `agent/` and enroll it with the API token generated in Admin.

## Security
Use HTTPS in production. Never commit `.env` or real API secrets. Agents send outbound HTTPS only and support signed authenticated requests.
