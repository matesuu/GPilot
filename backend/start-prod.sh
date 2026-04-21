#!/usr/bin/env bash
# Start the GPilot FastAPI backend for production/systemd usage.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

exec /usr/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8080
