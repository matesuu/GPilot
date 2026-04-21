#!/usr/bin/env bash
# Start the GPilot FastAPI backend.
# Run from the repository root or the backend/ directory.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Start the server
exec uvicorn main:app --host 0.0.0.0 --port 8080 --reload
