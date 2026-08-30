#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-/opt/infrastructure-monitoring-agent}"
API_URL="${API_URL:?Set API_URL before running}"
AGENT_ID="${AGENT_ID:-$(hostname)}"
AGENT_TOKEN="${AGENT_TOKEN:?Set AGENT_TOKEN before running}"
INTERVAL_MS="${INTERVAL_MS:-60000}"

if [[ "$(id -u)" -ne 0 ]]; then echo 'Run as root.' >&2; exit 1; fi
command -v node >/dev/null || { echo 'Node.js 20+ is required.' >&2; exit 1; }
install -d -m 0750 "$INSTALL_DIR/data/queue"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cp -R "$SCRIPT_DIR"/* "$INSTALL_DIR/"
cat > "$INSTALL_DIR/config.env" <<EOF
API_URL=$API_URL
AGENT_ID=$AGENT_ID
AGENT_TOKEN=$AGENT_TOKEN
INTERVAL_MS=$INTERVAL_MS
AGENT_CONFIG=$INSTALL_DIR/config.json
QUEUE_DIR=$INSTALL_DIR/data/queue
EOF
chmod 0600 "$INSTALL_DIR/config.env"
cd "$INSTALL_DIR"
npm install --omit=dev
cat > /etc/systemd/system/infrastructure-monitor-agent.service <<EOF
[Unit]
Description=Infrastructure Monitoring Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=$INSTALL_DIR
EnvironmentFile=$INSTALL_DIR/config.env
ExecStart=$(command -v node) $INSTALL_DIR/src/index.js
Restart=always
RestartSec=10
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$INSTALL_DIR
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now infrastructure-monitor-agent.service
systemctl --no-pager --full status infrastructure-monitor-agent.service || true
echo "Installed: infrastructure-monitor-agent.service"
