#!/usr/bin/env bash
# Start the GPilot FastAPI backend.
# Run from the repository root or the backend/ directory.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Activate the polyg conda env if not already active
if [[ "${CONDA_DEFAULT_ENV:-}" != "polyg" ]]; then
  echo "[start.sh] Activating conda env 'polyg' ..."
  # shellcheck disable=SC1091
  source "$(conda info --base)/etc/profile.d/conda.sh"
  conda activate polyg
fi

# Ensure PolyG is installed in editable mode
pip show polyg &>/dev/null || pip install -e /home/username/PolyG --quiet

# Ensure backend deps are installed
pip install -r requirements.txt --quiet

# Start the server
exec uvicorn main:app --host 0.0.0.0 --port 8080 --reload
