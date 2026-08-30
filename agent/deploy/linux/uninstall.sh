#!/usr/bin/env bash
set -euo pipefail
SERVICE="monitoring-agent"
INSTALL_DIR="${1:-/opt/monitoring-agent}"
systemctl disable --now "$SERVICE" 2>/dev/null || true
rm -f "/etc/systemd/system/${SERVICE}.service"
systemctl daemon-reload
rm -rf "$INSTALL_DIR"
echo "Monitoring Agent removed."
