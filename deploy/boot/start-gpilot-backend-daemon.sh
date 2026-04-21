#!/usr/bin/env bash

set -euo pipefail

ROOT=/home/username/GPilot
BACKEND_DIR="$ROOT/backend"
LOG_DIR="$BACKEND_DIR/logs"
LOG_FILE="$LOG_DIR/backend.log"

/usr/bin/mkdir -p "$LOG_DIR"

if /usr/bin/pgrep -f 'python3 -m uvicorn main:app --host 0.0.0.0 --port 8080' >/dev/null 2>&1; then
  exit 0
fi

for _ in $(seq 1 30); do
  if /usr/bin/python3 -c "from neo4j import GraphDatabase; driver = GraphDatabase.driver('bolt://localhost:7687', auth=('neo4j','neo4j1234')); driver.verify_connectivity()" >/dev/null 2>&1; then
    break
  fi
  /usr/bin/sleep 2
done

cd "$BACKEND_DIR"
/usr/bin/nohup /home/username/GPilot/backend/start-prod.sh >>"$LOG_FILE" 2>&1 </dev/null &
