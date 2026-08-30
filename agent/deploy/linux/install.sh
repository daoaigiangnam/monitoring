#!/usr/bin/env bash
set -euo pipefail
API_URL="${1:?Usage: $0 <api_url> <agent_token> [install_dir] }"
TOKEN="${2:?Usage: $0 <api_url> <agent_token> [install_dir] }"
INSTALL_DIR="${3:-/opt/monitoring-agent}"
SERVICE="monitoring-agent"
command -v node >/dev/null 2>&1 || { echo 'Node.js 22+ is required.' >&2; exit 1; }
NODE_BIN="$(command -v node)"
SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
install -d -m 0755 "$INSTALL_DIR"
cp -a "$SCRIPT_DIR/src" "$SCRIPT_DIR/package.json" "$INSTALL_DIR/"
printf '{"api_url":"%s","token":"%s","interval_sec":30}\n' "${API_URL%/}" "$TOKEN" > "$INSTALL_DIR/config.json"
cat > "/etc/systemd/system/${SERVICE}.service" <<EOF
[Unit]
Description=Infrastructure Monitoring Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=$NODE_BIN $INSTALL_DIR/src/index.js
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now "$SERVICE"
echo "Monitoring Agent installed: $INSTALL_DIR"
