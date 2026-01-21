-- GRANTS_POLICY.sql
-- Strict baseline:
-- - anon: no table writes; prefer no table selects; allow-list only RPC EXECUTE.
-- Apply via a dedicated migration or controlled manual apply (recommended to copy into a migration).

begin;

-- Hard revoke anon writes
revoke insert, update, delete, truncate, references, trigger
on all tables in schema public
from anon;

-- Prefer RPC-only exposure for guest browse
revoke select
on all tables in schema public
from anon;

-- Prevent sequence usage
revoke usage, select, update
on all sequences in schema public
from anon;

-- Allow-list RPC EXECUTE for anon (guest browse)
-- IMPORTANT: Replace signatures with your real function definitions.
-- Examples (update/remove as needed):
-- grant execute on function public.discover_nearby_moments(double precision, double precision, double precision, integer, uuid, integer, integer, text) to anon;
-- grant execute on function public.search_cities(text, integer) to anon;

commit;
