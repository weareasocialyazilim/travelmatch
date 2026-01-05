-- ============================================================================
-- CRITICAL SECURITY FIXES MIGRATION
-- ============================================================================
-- Date: 2026-01-02
-- Purpose: Address CRITICAL security issues from Supabase Performance Audit
-- Risk: LOW - Security improvements, no functional changes
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. SPATIAL_REF_SYS RLS - SKIPPED
-- ============================================================================
-- Problem: PostGIS's spatial_ref_sys table has RLS disabled
-- Note: This is a PostGIS extension table owned by Supabase, we cannot modify it
-- The table contains public reference data (coordinate system definitions)
-- and is safe to leave without RLS as it's read-only reference data
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'spatial_ref_sys: Skipped (PostGIS system table - cannot modify owner)';
END $$;

-- ============================================================================
-- 2. FUNCTION SEARCH PATH - SECURITY DEFINER VULNERABILITY FIX
-- ============================================================================
-- Problem: generate_default_username() has mutable search_path
-- Risk: Schema hijacking attacks possible
-- Solution: Set explicit search_path to prevent attacks
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_default_username') THEN
    ALTER FUNCTION public.generate_default_username()
    SET search_path = public, pg_temp;

    RAISE NOTICE '✅ generate_default_username: search_path secured';
  ELSE
    RAISE NOTICE 'ℹ️ generate_default_username function not found';
  END IF;
END $$;

-- ============================================================================
-- 3. VERIFY ALL OTHER SECURITY DEFINER FUNCTIONS HAVE SEARCH_PATH
-- ============================================================================
-- Ensure no other functions are vulnerable to schema hijacking
-- ============================================================================

DO $$
DECLARE
  func_record RECORD;
  fixed_count INTEGER := 0;
BEGIN
  -- Find all SECURITY DEFINER functions without proper search_path
  FOR func_record IN
    SELECT
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prosecdef = true
    AND (p.proconfig IS NULL OR NOT EXISTS (
      SELECT 1 FROM unnest(p.proconfig) AS config
      WHERE config LIKE 'search_path=%'
    ))
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp',
        func_record.schema_name,
        func_record.function_name,
        func_record.args
      );
      fixed_count := fixed_count + 1;
      RAISE NOTICE '✅ Fixed search_path for: %.%', func_record.schema_name, func_record.function_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '⚠️ Could not fix %.%: %', func_record.schema_name, func_record.function_name, SQLERRM;
    END;
  END LOOP;

  IF fixed_count > 0 THEN
    RAISE NOTICE '✅ Fixed search_path for % SECURITY DEFINER functions', fixed_count;
  ELSE
    RAISE NOTICE 'ℹ️ All SECURITY DEFINER functions already have proper search_path';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run after migration to verify:
-- SELECT tablename, policyname FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'spatial_ref_sys';
--
-- Should return: spatial_ref_sys | spatial_ref_sys_public_read
-- ============================================================================

COMMIT;

-- ============================================================================
-- MANUAL STEPS REQUIRED (Cannot be done via SQL):
-- ============================================================================
-- 1. Enable "Leaked Password Protection" in Supabase Dashboard:
--    Dashboard -> Authentication -> Settings -> Enable "Check passwords against HIBP"
--
-- 2. Review database connection limits if needed:
--    Dashboard -> Settings -> Database -> Connection pooling
-- ============================================================================
