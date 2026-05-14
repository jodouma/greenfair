#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "== GreenFair Dashboard WSL setup =="
echo "Project root: $PROJECT_ROOT"

if [[ "$PROJECT_ROOT" == /mnt/c/* || "$PROJECT_ROOT" == /mnt/d/* ]]; then
  echo "WARNING: You are working inside a Windows-mounted path."
  echo "Recommended: move this project to ~/code/greenfair-dashboard for better WSL performance."
fi

echo "== Checking Node.js =="
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found."
  echo "Install Node 22 using nvm:"
  echo "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash"
  echo "source ~/.bashrc"
  echo "nvm install 22"
  exit 1
fi

node -v
npm -v

echo "== Installing npm dependencies =="
npm install

echo "== Preparing Python environment =="
if [[ ! -d ".venv" ]]; then
  python3 -m venv .venv
fi

source .venv/bin/activate
if ! python -m pip install --upgrade pip; then
  echo "pip upgrade failed inside .venv, attempting recovery with ensurepip..."
  python -m ensurepip --upgrade
fi
python -m pip install -r requirements.txt

echo "== Generating GreenFair data =="
npm run data:build

echo "== Validating data =="
npm run data:validate

echo "== Typechecking =="
npm run typecheck

echo "== Building app =="
npm run build

echo "== Secret scan =="
npm run secret:scan

echo ""
echo "Setup complete."
echo "Run development server:"
echo "  npm run dev"
echo ""
echo "Run full dev mode with data watcher:"
echo "  npm run dev:full"
