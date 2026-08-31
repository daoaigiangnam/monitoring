#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"

curl -fsS "$BASE_URL/health" >/dev/null
printf 'E2E smoke: /health PASS\n'
