-- ============================================================================
-- FIX AUTH_RLS_INITPLAN PERFORMANCE WARNINGS
-- ============================================================================
-- Date: 2026-01-27
-- Purpose: Replace auth.uid() and auth.jwt() with (SELECT auth.uid()) in RLS
-- This prevents re-evaluation on every row, improving query performance
-- Risk: LOW - Only affects RLS policy performance, not security
-- ============================================================================

BEGIN;

-- ============================================================================
-- HELPER: Fix auth.uid() calls in RLS policies
-- ============================================================================
-- Note: This migration is informational. The auth_rls_initplan warning is
-- a PERFORMANCE optimization, not a security issue. The policies work
-- correctly without this fix - they just may be slightly slower on large tables.
-- ============================================================================

DO $$
DECLARE
  pol RECORD;
  pol_oid OID;
  tbl TEXT;
  polname TEXT;
  cmd TEXT;
  old_qual TEXT;
  old_withcheck TEXT;
  new_qual TEXT;
  new_withcheck TEXT;
BEGIN
  FOR pol_oid, tbl, polname, cmd, old_qual, old_withcheck IN
    SELECT
      p.oid,
      c.relname,
      p.polname,
      CASE p.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        ELSE 'ALL'
      END,
      pg_get_expr(p.polqual, p.polrelid),
      pg_get_expr(p.polwithcheck, p.polrelid)
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
    ORDER BY c.relname, p.polname
  LOOP
    -- Check if this policy needs optimization
    IF (old_qual ILIKE '%auth.uid()%' OR old_qual ILIKE '%auth.jwt()%' OR old_qual ILIKE '%auth.role()%'
        OR old_withcheck ILIKE '%auth.uid()%' OR old_withcheck ILIKE '%auth.jwt()%' OR old_withcheck ILIKE '%auth.role()%')
       AND (old_qual NOT ILIKE '%(SELECT auth%' AND old_withcheck NOT ILIKE '%(SELECT auth%')
    THEN
      -- Build replacement
      new_qual := replace(replace(replace(old_qual,
        'auth.uid()', '(SELECT auth.uid())'),
        'auth.jwt()', '(SELECT auth.jwt())'),
        'auth.role()', '(SELECT auth.role())');

      new_withcheck := replace(replace(replace(old_withcheck,
        'auth.uid()', '(SELECT auth.uid())'),
        'auth.jwt()', '(SELECT auth.jwt())'),
        'auth.role()', '(SELECT auth.role())');

      -- Drop and recreate policy
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', polname, tbl);

      -- Recreate with optimization
      IF old_qual IS NOT NULL AND old_withcheck IS NOT NULL THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR %s USING (%s) WITH CHECK (%s)',
          polname, tbl, cmd, new_qual, new_withcheck);
      ELSIF old_qual IS NOT NULL THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR %s USING (%s)',
          polname, tbl, cmd, new_qual);
      ELSIF old_withcheck IS NOT NULL THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR %s WITH CHECK (%s)',
          polname, tbl, cmd, new_withcheck);
      END IF;

      RAISE NOTICE 'Fixed RLS: %.%', tbl, polname;
    END IF;
  END LOOP;
END $$;

COMMIT;
