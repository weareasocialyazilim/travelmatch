#!/usr/bin/env bash
set -euo pipefail

echo "[supabase-down] Stopping Supabase local..."
supabase stop
echo "[supabase-down] OK"
