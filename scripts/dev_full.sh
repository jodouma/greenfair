#!/usr/bin/env bash
set -euo pipefail

echo "Starting GreenFair full dev mode..."
echo "- Vite will hot-reload frontend changes."
echo "- Data watcher will rebuild JSON when notebooks/scripts change."

if ! command -v npx >/dev/null 2>&1; then
  echo "npx not found. Run npm install first."
  exit 1
fi

npm run data:build
npm run data:validate

npx concurrently -k \
  -n "data,vite" \
  -c "yellow,green" \
  "npm run watch:data" \
  "npm run dev"
