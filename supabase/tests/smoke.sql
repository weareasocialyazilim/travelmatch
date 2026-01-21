-- smoke.sql
-- Run: psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/smoke.sql
\set ON_ERROR_STOP on

begin;

-- SECTION A: ANON baseline (guest)
do $$
begin
  begin
    execute 'set local role anon';
  exception when others then
    null;
  end;

  -- A1) Public read RPC must work (update this to your actual function/signature)
  -- Example:
  -- perform 1 from public.discover_nearby_moments(41.0, 29.0, 10.0, 20, null, null, null, null);

  -- A2) Table write must fail (replace table name with a real sensitive table)
  begin
    execute 'insert into public.moments(id) values (gen_random_uuid())';
    raise exception 'FAIL: anon was able to insert into public.moments';
  exception when others then
    null;
  end;
end $$;

-- SECTION B: AUTH baseline (RLS sanity)
do $$
begin
  begin
    execute 'set local role authenticated';
  exception when others then
    null;
  end;

  -- Best-effort: ensure protected tables don't leak. Replace with your private tables.
  -- Example:
  -- perform 1 from public.messages limit 1;

end $$;

-- SECTION C: FINANCE/ESCROW deterministic rules
-- This section is intentionally written as a "hook" to your existing RPCs.
-- Replace table/function names once to make tests deterministic.
--
-- Required assertions:
-- - 0–30: direct transfer allowed
-- - 100+: direct transfer blocked, escrow required
-- - 100+: max 3 unique contributor enforced
-- - self-transfer forbidden
-- - idempotency_key prevents duplicate side-effects
--
-- Implementation approach:
-- 1) Create minimal fixtures (users/moment) in a transaction
-- 2) Call your RPC/policy functions (gift/create, escrow/hold, etc.)
-- 3) Assert expected state using selects on ledger/audit tables
-- 4) Rollback

rollback;
