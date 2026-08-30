# Infrastructure Monitoring

A production-oriented Mini-Zabbix-style infrastructure monitoring platform.

## Architecture
- **Agent:** Node.js 20+, Windows/Linux collectors and active checks
- **Backend API:** Node.js + Fastify
- **Database:** MySQL 8
- **Frontend/Admin:** Plain PHP 8.2+, Bootstrap 5, Chart.js
- **Notifications:** Telegram / SMTP email / Webhook
- **Deployment:** Docker Compose or native services

## Monitoring scope
CPU, memory, swap/pagefile, filesystem capacity, disk I/O, network I/O/errors, OS/hostname/IP/MAC/uptime, processes, Windows services, Linux services, ping, TCP, HTTP/HTTPS, DNS, TLS expiry, discovery, heartbeat, offline queue, trigger evaluation, deduplication, recovery, acknowledgement, maintenance, dependencies and audit logging.

## Quick start (server)
1. Copy `.env.example` to `.env` and set strong database/application secrets.
2. Run `docker compose up -d --build`.
3. Initialize MySQL with `database/schema.sql` and `database/seed.sql` when using a fresh database.
4. Open the PHP frontend on port 8080.
5. Enroll an agent and assign monitoring items.

## Agent: development
```bash
cd agent
npm install
# Set API_URL, AGENT_ID and AGENT_TOKEN
npm start
```

Copy `config.example.json` to `config.json` for active checks. The agent periodically refreshes remote configuration from the API and falls back to the local configuration if the API is unavailable. Reports are queued locally when the server cannot be reached.

## Windows installation
Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\agent\install\windows-install.ps1 -ApiUrl https://monitor.example.com -AgentToken YOUR_TOKEN
```
The installer creates a SYSTEM scheduled task with automatic restart and stores runtime settings as machine environment variables.

## Linux installation
Run as root:
```bash
API_URL=https://monitor.example.com AGENT_TOKEN=YOUR_TOKEN ./agent/install/linux-install.sh
```
This installs a hardened systemd service with automatic restart.

## Security
Use HTTPS in production, rotate agent tokens, restrict API exposure, never commit `.env`, use least privilege for agents, and put the PHP frontend behind a TLS-enabled reverse proxy. Do not expose MySQL to the public Internet.

## Production checklist
- Reverse proxy + TLS
- Strong DB/application credentials
- Per-agent tokens with rotation/revocation
- Backups and tested restore procedure
- Metrics retention/aggregation policy
- Alert notification retry policy
- Maintenance windows for planned work
- Host dependency graph for root-cause suppression
- Monitoring of the monitoring server itself
- Centralized log collection and OS hardening

## Scope note
This project intentionally follows Zabbix concepts rather than claiming protocol or feature parity with Zabbix. Additional collectors/checks can be added through the Agent collector/check architecture without changing the transport contract.
