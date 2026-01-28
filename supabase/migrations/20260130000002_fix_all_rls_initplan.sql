-- ============================================================================
-- FIX ALL AUTH_RLS_INITPLAN WARNINGS
-- ============================================================================
-- Date: 2026-01-27
-- Purpose: Replace auth.uid() with (SELECT auth.uid()) in ALL RLS policies
-- Risk: LOW - Only modifies RLS policy definitions
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: Fix all RLS policies with unoptimized auth function calls
-- ============================================================================

DO $$
DECLARE
  pol RECORD;
  pol_oid OID;
  tbl_name TEXT;
  pol_name TEXT;
  cmd TEXT;
  old_qual TEXT;
  old_withcheck TEXT;
  new_qual TEXT;
  new_withcheck TEXT;
  fixed_count INTEGER := 0;
BEGIN
  -- Get all policies that need fixing
  FOR pol_oid, tbl_name, pol_name, cmd, old_qual, old_withcheck IN
    SELECT
      p.oid,
      c.relname,
      p.polname,
      CASE p.polcmd
        WHEN 'r' THEN 'FOR SELECT'
        WHEN 'a' THEN 'FOR INSERT'
        WHEN 'w' THEN 'FOR UPDATE'
        WHEN 'd' THEN 'FOR DELETE'
        ELSE 'FOR ALL'
      END,
      pg_get_expr(p.polqual, p.polrelid),
      pg_get_expr(p.polwithcheck, p.polrelid)
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
    AND (
      (pg_get_expr(p.polqual, p.polrelid) ILIKE '%auth.uid()%' AND pg_get_expr(p.polqual, p.polrelid) NOT ILIKE '%(SELECT auth.uid())%')
      OR (pg_get_expr(p.polqual, p.polrelid) ILIKE '%auth.jwt()%' AND pg_get_expr(p.polqual, p.polrelid) NOT ILIKE '%(SELECT auth.jwt())%')
      OR (pg_get_expr(p.polqual, p.polrelid) ILIKE '%auth.role()%' AND pg_get_expr(p.polqual, p.polrelid) NOT ILIKE '%(SELECT auth.role())%')
      OR (pg_get_expr(p.polwithcheck, p.polrelid) ILIKE '%auth.uid()%' AND pg_get_expr(p.polwithcheck, p.polrelid) NOT ILIKE '%(SELECT auth.uid())%')
      OR (pg_get_expr(p.polwithcheck, p.polrelid) ILIKE '%auth.jwt()%' AND pg_get_expr(p.polwithcheck, p.polrelid) NOT ILIKE '%(SELECT auth.jwt())%')
      OR (pg_get_expr(p.polwithcheck, p.polrelid) ILIKE '%auth.role()%' AND pg_get_expr(p.polwithcheck, p.polrelid) NOT ILIKE '%(SELECT auth.role())%')
    )
    ORDER BY c.relname, p.polname
  LOOP
    -- Build replacements
    new_qual := COALESCE(old_qual, '');
    new_withcheck := COALESCE(old_withcheck, '');

    -- Replace auth.uid() with (SELECT auth.uid())
    new_qual := replace(new_qual, 'auth.uid()', '(SELECT auth.uid())');
    new_withcheck := replace(new_withcheck, 'auth.uid()', '(SELECT auth.uid())');

    -- Replace auth.jwt() with (SELECT auth.jwt())
    new_qual := replace(new_qual, 'auth.jwt()', '(SELECT auth.jwt())');
    new_withcheck := replace(new_withcheck, 'auth.jwt()', '(SELECT auth.jwt())');

    -- Replace auth.role() with (SELECT auth.role())
    new_qual := replace(new_qual, 'auth.role()', '(SELECT auth.role())');
    new_withcheck := replace(new_withcheck, 'auth.role()', '(SELECT auth.role())');

    -- Drop old policy
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol_name, tbl_name);

    -- Create new optimized policy
    IF new_qual != '' AND new_withcheck != '' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I %s USING (%s) WITH CHECK (%s)',
        pol_name, tbl_name, cmd, new_qual, new_withcheck
      );
    ELSIF new_qual != '' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I %s USING (%s)',
        pol_name, tbl_name, cmd, new_qual
      );
    ELSIF new_withcheck != '' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I %s WITH CHECK (%s)',
        pol_name, tbl_name, cmd, new_withcheck
      );
    END IF;

    fixed_count := fixed_count + 1;
    RAISE NOTICE 'Fixed RLS policy: %.%', tbl_name, pol_name;
  END LOOP;

  RAISE NOTICE '============================================';
  RAISE NOTICE 'Fixed % RLS policies with (SELECT auth) optimization', fixed_count;
  IF fixed_count = 0 THEN
    RAISE NOTICE 'All RLS policies were already optimized!';
  END IF;
  RAISE NOTICE '============================================';
END $$;

COMMIT;
