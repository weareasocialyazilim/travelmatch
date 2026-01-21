#!/usr/bin/env bash
set -euo pipefail

echo "[supabase-up] Starting Supabase local..."
supabase start --exclude logflare
echo "[supabase-up] OK"
