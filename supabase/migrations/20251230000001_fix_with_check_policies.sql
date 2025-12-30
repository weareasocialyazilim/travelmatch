-- ============================================
-- SECURITY AUDIT FIX: Add Validation to WITH CHECK Policies
-- Date: 2025-12-30
-- Audit: Security Deep Dive (OWASP Top 10)
-- Issue: P0 - Service Role WITH CHECK (true) Without Validation
-- ============================================
-- This migration adds proper validation to service role INSERT
-- policies that previously used WITH CHECK (true) without
-- verifying referential integrity.
-- ============================================

BEGIN;

-- ============================================
-- 1. FIX deep_link_events INSERT POLICY
-- File: 20251209000004_mobile_optimizations.sql:51
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deep_link_events') THEN
    -- Drop old permissive policy
    DROP POLICY IF EXISTS "Service can insert deep link events" ON deep_link_events;
    DROP POLICY IF EXISTS "deep_link_events_service_insert" ON deep_link_events;

    -- Create policy with validation
    CREATE POLICY "deep_link_events_service_insert_validated" ON deep_link_events
      FOR INSERT TO service_role
      WITH CHECK (
        -- Required fields must be present
        id IS NOT NULL AND
        type IS NOT NULL AND
        source IS NOT NULL AND
        url IS NOT NULL AND
        session_id IS NOT NULL AND
        -- If user_id provided, it must exist
        (user_id IS NULL OR EXISTS (SELECT 1 FROM auth.users WHERE id = user_id))
      );

    RAISE NOTICE '✅ deep_link_events: INSERT policy updated with validation';
  END IF;
END $$;

-- ============================================
-- 2. FIX proof_quality_scores INSERT POLICY
-- File: 20251209000004_mobile_optimizations.sql:94
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'proof_quality_scores') THEN
    -- Drop old permissive policies
    DROP POLICY IF EXISTS "Service can insert quality scores" ON proof_quality_scores;
    DROP POLICY IF EXISTS "proof_quality_scores_service_only" ON proof_quality_scores;

    -- Create policy with validation
    CREATE POLICY "proof_quality_scores_service_insert_validated" ON proof_quality_scores
      FOR INSERT TO service_role
      WITH CHECK (
        -- Required fields
        user_id IS NOT NULL AND
        proof_type IS NOT NULL AND
        image_url IS NOT NULL AND
        score IS NOT NULL AND
        -- User must exist
        EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) AND
        -- If reviewed_by provided, reviewer must exist
        (reviewed_by IS NULL OR EXISTS (SELECT 1 FROM auth.users WHERE id = reviewed_by))
      );

    RAISE NOTICE '✅ proof_quality_scores: INSERT policy updated with validation';
  END IF;
END $$;

-- ============================================
-- 3. FIX cache_invalidation POLICY
-- File: 20251219200000_platinum_security_fixes.sql:153
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cache_invalidation') THEN
    -- Drop old permissive policy
    DROP POLICY IF EXISTS "cache_invalidation_service_only" ON cache_invalidation;

    -- Create policy with validation for inserts
    CREATE POLICY "cache_invalidation_service_validated" ON cache_invalidation
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (
        -- Required fields for cache invalidation
        table_name IS NOT NULL AND
        record_id IS NOT NULL
      );

    RAISE NOTICE '✅ cache_invalidation: Policy updated with validation';
  END IF;
END $$;

-- ============================================
-- 4. FIX totp_usage_log POLICY
-- File: 20251219200000_platinum_security_fixes.sql:194
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'totp_usage_log') THEN
    -- Drop old permissive policy
    DROP POLICY IF EXISTS "totp_usage_service_only" ON totp_usage_log;

    -- Create policy with validation
    CREATE POLICY "totp_usage_service_validated" ON totp_usage_log
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (
        -- Required fields
        user_id IS NOT NULL AND
        code_hash IS NOT NULL AND
        -- User must exist
        EXISTS (SELECT 1 FROM auth.users WHERE id = user_id)
      );

    RAISE NOTICE '✅ totp_usage_log: Policy updated with validation';
  END IF;
END $$;

-- ============================================
-- 5. FIX user_badges INSERT POLICY (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_badges') THEN
    -- Drop old policies
    DROP POLICY IF EXISTS "Service role inserts badges" ON user_badges;
    DROP POLICY IF EXISTS "user_badges_service_insert" ON user_badges;

    -- Create policy with validation
    CREATE POLICY "user_badges_service_insert_validated" ON user_badges
      FOR INSERT TO service_role
      WITH CHECK (
        -- Required fields
        user_id IS NOT NULL AND
        badge_id IS NOT NULL AND
        -- User must exist
        EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) AND
        -- Badge must exist
        EXISTS (SELECT 1 FROM badges WHERE id = badge_id)
      );

    RAISE NOTICE '✅ user_badges: INSERT policy updated with validation';
  END IF;
END $$;

-- ============================================
-- 6. FIX feed_delta INSERT POLICY (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feed_delta') THEN
    -- Drop old policies
    DROP POLICY IF EXISTS "Service role inserts feed_delta" ON feed_delta;
    DROP POLICY IF EXISTS "feed_delta_service_insert" ON feed_delta;

    -- Create policy with validation
    CREATE POLICY "feed_delta_service_insert_validated" ON feed_delta
      FOR INSERT TO service_role
      WITH CHECK (
        -- Required fields
        user_id IS NOT NULL AND
        -- User must exist
        EXISTS (SELECT 1 FROM auth.users WHERE id = user_id)
      );

    RAISE NOTICE '✅ feed_delta: INSERT policy updated with validation';
  END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  v_policy RECORD;
  v_unvalidated INTEGER := 0;
BEGIN
  -- Check for remaining WITH CHECK (true) without validation
  FOR v_policy IN
    SELECT schemaname, tablename, policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
    AND with_check = 'true'
    AND policyname NOT LIKE '%_validated%'
  LOOP
    v_unvalidated := v_unvalidated + 1;
    RAISE NOTICE '⚠️ Unvalidated policy: %.% - %', v_policy.schemaname, v_policy.tablename, v_policy.policyname;
  END LOOP;

  IF v_unvalidated = 0 THEN
    RAISE NOTICE '✅ All service role INSERT policies now have proper validation';
  ELSE
    RAISE WARNING '⚠️ Found % policies with WITH CHECK (true) that may need review', v_unvalidated;
  END IF;
END $$;

COMMIT;
