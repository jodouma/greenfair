#!/usr/bin/env bash
set -euo pipefail

echo "Scanning for possible secrets..."

PATTERN='(GEMINI_API_KEY|GOOGLE_API_KEY|OPENAI_API_KEY|API_KEY|AIza[0-9A-Za-z_-]{10,}|sk-[A-Za-z0-9]{10,}|PRIVATE_KEY)'

MATCHES="$(grep -RInE "$PATTERN" . \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=.git \
  --exclude-dir=.venv \
  --exclude=package-lock.json \
  --exclude=.env.example \
  || true)"

MATCHES="$(printf '%s\n' "$MATCHES" \
  | grep -v 'REDACTED_GEMINI_KEY' \
  | grep -v 'api_key=GEMINI_API_KEY' \
  | grep -v "PATTERN='" \
  | grep -v 'secret_pattern = re.compile' \
  || true)"

if [[ -n "$MATCHES" ]]; then
  echo "Potential secrets found:"
  echo "$MATCHES"
  echo ""
  echo "Review these matches. Do not commit real secrets."
  exit 1
fi

echo "No obvious secrets found."
