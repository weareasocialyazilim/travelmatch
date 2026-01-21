\echo '--- Anon Write Grants ---'
select grantee, table_schema, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee = 'anon'
  and privilege_type in ('INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER');

\echo '--- RLS Disabled ---'
select n.nspname as schema_name,
       c.relname as table_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname not like 'pg_%'
  and c.relrowsecurity = false;

\echo '--- Functions Missing search_path ---'
select n.nspname as schema_name,
       p.proname as function_name
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prosecdef = true
  and pg_get_functiondef(p.oid) !~* 'set[[:space:]]+search_path';
