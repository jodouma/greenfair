#!/usr/bin/env bash
set -euo pipefail

rm -rf dist docs
find . -type d -name "__pycache__" -prune -exec rm -rf {} +
find . -type f \( -name "*.pyc" -o -name "*.pyo" \) -delete

if [[ "${1:-}" == "--deep" ]]; then
  rm -rf node_modules
fi

echo "Clean complete."
