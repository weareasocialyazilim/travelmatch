#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "[db-security-audit] ERROR: SUPABASE_DB_URL is not set."
  exit 1
fi

echo "[db-security-audit] Running security baseline audit..."

RESULTS="$(psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -At <<'SQL'
-- Return a single line per check: OK|<msg> or FAIL|<msg>

-- 1) anon must not have table write grants in public schema
select case when exists (
  select 1
  from information_schema.role_table_grants
  where table_schema='public'
    and grantee='anon'
    and privilege_type in ('INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER')
)
then 'FAIL|anon has table write grants in public schema'
else 'OK|anon has no table write grants'
end;

-- 2) RLS must be enabled on all public tables (strict baseline)
select case when exists (
  select 1
  from pg_class c
  join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public'
    and c.relkind='r'
    and c.relname not like 'pg_%'
    and c.relrowsecurity=false
)
then 'FAIL|one or more public tables have RLS disabled'
else 'OK|RLS enabled on all public tables'
end;

-- 3) SECURITY DEFINER functions must set search_path
select case when exists (
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.prosecdef=true
    and pg_get_functiondef(p.oid) !~* 'set[[:space:]]+search_path'
)
then 'FAIL|one or more SECURITY DEFINER functions do not set search_path'
else 'OK|all SECURITY DEFINER functions set search_path'
end;
SQL
)"

echo "$RESULTS" | while IFS='|' read -r status msg; do
  printf "[db-security-audit] %s: %s\n" "$status" "$msg"
done

if echo "$RESULTS" | grep -q '^FAIL|'; then
  echo "[db-security-audit] FAILED"
  exit 1
fi

echo "[db-security-audit] OK"
