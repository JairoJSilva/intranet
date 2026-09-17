#!/usr/bin/env bash
# ==============================================================================
# 🛡️ Pipeline Guardian — Runner Script
# Intranet Flowti - Portal Unificado Corporativo
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

export PYTHONPATH="${REPO_ROOT}:${PYTHONPATH:-}"

python3 "${SCRIPT_DIR}/pipeline-guardian.py" "$@"
