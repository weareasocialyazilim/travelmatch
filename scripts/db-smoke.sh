#!/usr/bin/env bash
set -euo pipefail

echo "[db-smoke] Starting Supabase local..."
supabase start --exclude logflare

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "[db-smoke] SUPABASE_DB_URL not set, trying to infer from 'supabase status'..."
  DB_URL="$(supabase status 2>/dev/null | awk -F': ' '/DB URL/ {print $2}' | tail -n 1 || true)"
  if [[ -z "${DB_URL:-}" ]]; then
    echo "[db-smoke] ERROR: Could not infer DB URL. Please export SUPABASE_DB_URL."
    supabase stop || true
    exit 1
  fi
  export SUPABASE_DB_URL="$DB_URL"
fi

echo "[db-smoke] Running smoke tests..."
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/smoke.sql

echo "[db-smoke] Running security baseline audit..."
chmod +x ./scripts/db-security-audit.sh
./scripts/db-security-audit.sh

echo "[db-smoke] Stopping Supabase local..."
supabase stop

echo "[db-smoke] OK"
