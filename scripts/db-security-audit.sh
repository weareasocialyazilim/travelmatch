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

-- 4) EK-P1-6: Critical financial/admin functions must NOT be callable by anon/authenticated
-- These functions should only be callable by service_role
select case when exists (
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname in (
      'increment_user_balance',
      'decrement_user_balance',
      'handle_coin_transaction',
      'approve_gift_chat',
      'create_notification',
      'soft_delete_account',
      'create_escrow_transaction'
    )
    and exists (
      select 1
      from information_schema.role_routine_grants
      where routine_schema='public'
        and routine_name=p.proname
        and grantee in ('anon', 'authenticated')
        and privilege_type='EXECUTE'
    )
)
then 'FAIL|critical financial/admin functions are callable by anon or authenticated'
else 'OK|critical functions restricted to service_role'
end;

-- 5) EK-P0-2: gifts table UPDATE must not be allowed for authenticated
select case when exists (
  select 1
  from information_schema.role_table_grants
  where table_schema='public'
    and table_name='gifts'
    and grantee='authenticated'
    and privilege_type='UPDATE'
)
then 'FAIL|gifts table UPDATE is allowed for authenticated users'
else 'OK|gifts table UPDATE restricted to service_role'
end;

-- 6) EK-P0-1: notifications table INSERT must not be allowed for authenticated
select case when exists (
  select 1
  from information_schema.role_table_grants
  where table_schema='public'
    and table_name='notifications'
    and grantee='authenticated'
    and privilege_type='INSERT'
)
then 'FAIL|notifications table INSERT is allowed for authenticated users'
else 'OK|notifications table INSERT restricted to service_role'
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
