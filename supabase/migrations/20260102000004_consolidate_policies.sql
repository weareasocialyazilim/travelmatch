-- ============================================================================
-- POLICY CONSOLIDATION MIGRATION
-- ============================================================================
-- Date: 2026-01-02
-- Purpose: Consolidate multiple permissive policies to eliminate performance
--          issues and lint warnings (282 warnings from audit)
--
-- Problem: Multiple permissive policies for the same role/action cause:
-- 1. All policies evaluated for every query (performance hit)
-- 2. Security complexity and potential for policy drift
-- 3. Supabase linter warnings
--
-- Solution: Consolidate into single unified policies per action
--
-- High-Priority Tables (from audit):
-- - admin_sessions: 40 policy issues
-- - kyc_verifications: 40 policy issues
-- - processed_webhook_events: 40 policy issues
-- - trip_participants: 40 policy issues
-- - trip_requests: 30 policy issues
-- - bookings: 30 policy issues
--
-- Expected Performance Improvement: +10-15%
-- Risk: MEDIUM - Carefully maintains existing access patterns
-- ============================================================================

BEGIN;

-- ============================================================================
-- HELPER: Get current user ID with caching
-- ============================================================================

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.uid()
$$;

COMMENT ON FUNCTION public.current_user_id() IS
'Cached wrapper for auth.uid() - use (SELECT current_user_id()) in RLS policies';

-- ============================================================================
-- 1. ADMIN_SESSIONS - Consolidate policies
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_sessions') THEN
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Admins can view own sessions" ON public.admin_sessions;
    DROP POLICY IF EXISTS "Admins can delete own sessions" ON public.admin_sessions;
    DROP POLICY IF EXISTS "Admins manage own sessions" ON public.admin_sessions;
    DROP POLICY IF EXISTS "Service role full access" ON public.admin_sessions;
    DROP POLICY IF EXISTS "admin_sessions_unified" ON public.admin_sessions;
    DROP POLICY IF EXISTS "admin_sessions_service_role" ON public.admin_sessions;

    -- Unified SELECT policy
    CREATE POLICY "admin_sessions_select" ON public.admin_sessions
      FOR SELECT
      USING (
        admin_id = (SELECT auth.uid())
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    -- Unified INSERT policy
    CREATE POLICY "admin_sessions_insert" ON public.admin_sessions
      FOR INSERT
      WITH CHECK (
        admin_id = (SELECT auth.uid())
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    -- Unified UPDATE policy
    CREATE POLICY "admin_sessions_update" ON public.admin_sessions
      FOR UPDATE
      USING (
        admin_id = (SELECT auth.uid())
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    -- Unified DELETE policy
    CREATE POLICY "admin_sessions_delete" ON public.admin_sessions
      FOR DELETE
      USING (
        admin_id = (SELECT auth.uid())
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    RAISE NOTICE '✅ admin_sessions: Policies consolidated';
  END IF;
END $$;

-- ============================================================================
-- 2. KYC_VERIFICATIONS - Consolidate policies
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'kyc_verifications') THEN
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Users can view own KYC" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "Users can view their own KYC verifications" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "KYC verifications access" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "KYC verifications service write" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "KYC verifications service update" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "KYC verifications service delete" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "Service role can manage KYC" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "Service role can manage KYC verifications" ON public.kyc_verifications;

    -- Users can only view their own KYC, service role has full access
    CREATE POLICY "kyc_verifications_select" ON public.kyc_verifications
      FOR SELECT
      USING (
        user_id = (SELECT auth.uid())
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    -- Only service role can insert KYC records
    CREATE POLICY "kyc_verifications_insert" ON public.kyc_verifications
      FOR INSERT
      WITH CHECK (
        (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    -- Only service role can update KYC records
    CREATE POLICY "kyc_verifications_update" ON public.kyc_verifications
      FOR UPDATE
      USING (
        (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    -- Only service role can delete KYC records
    CREATE POLICY "kyc_verifications_delete" ON public.kyc_verifications
      FOR DELETE
      USING (
        (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    RAISE NOTICE '✅ kyc_verifications: Policies consolidated';
  END IF;
END $$;

-- ============================================================================
-- 3. PROCESSED_WEBHOOK_EVENTS - Consolidate to service_role only
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'processed_webhook_events') THEN
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Service role only for webhook events" ON public.processed_webhook_events;
    DROP POLICY IF EXISTS "webhook_events_policy" ON public.processed_webhook_events;
    DROP POLICY IF EXISTS "processed_webhook_events_service_only" ON public.processed_webhook_events;

    -- Single service_role only policy for all operations
    CREATE POLICY "processed_webhook_events_all" ON public.processed_webhook_events
      FOR ALL
      USING (
        (SELECT auth.jwt() ->> 'role') = 'service_role'
      )
      WITH CHECK (
        (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    RAISE NOTICE '✅ processed_webhook_events: Consolidated to service_role only';
  END IF;
END $$;

-- ============================================================================
-- 4. TRIP_PARTICIPANTS - Consolidate policies
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trip_participants') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can join trips" ON public.trip_participants;
    DROP POLICY IF EXISTS "Users can manage own participation" ON public.trip_participants;
    DROP POLICY IF EXISTS "Trip owners can manage participants" ON public.trip_participants;
    DROP POLICY IF EXISTS "trip_participants_select" ON public.trip_participants;
    DROP POLICY IF EXISTS "trip_participants_insert" ON public.trip_participants;
    DROP POLICY IF EXISTS "trip_participants_update" ON public.trip_participants;
    DROP POLICY IF EXISTS "trip_participants_delete" ON public.trip_participants;

    -- SELECT: Users can see their own participation OR trip owner can see all
    CREATE POLICY "trip_participants_select" ON public.trip_participants
      FOR SELECT
      USING (
        user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM trips
          WHERE trips.id = trip_participants.trip_id
          AND trips.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    -- INSERT: Users can join trips (as themselves)
    CREATE POLICY "trip_participants_insert" ON public.trip_participants
      FOR INSERT
      WITH CHECK (
        user_id = (SELECT auth.uid())
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    -- UPDATE: Users can update own participation OR trip owner can update
    CREATE POLICY "trip_participants_update" ON public.trip_participants
      FOR UPDATE
      USING (
        user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM trips
          WHERE trips.id = trip_participants.trip_id
          AND trips.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    -- DELETE: Users can remove themselves OR trip owner can remove
    CREATE POLICY "trip_participants_delete" ON public.trip_participants
      FOR DELETE
      USING (
        user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM trips
          WHERE trips.id = trip_participants.trip_id
          AND trips.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    RAISE NOTICE '✅ trip_participants: Policies consolidated';
  END IF;
END $$;

-- ============================================================================
-- 5. TRIP_REQUESTS - Consolidate policies
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trip_requests') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can create requests" ON public.trip_requests;
    DROP POLICY IF EXISTS "Users can view own requests" ON public.trip_requests;
    DROP POLICY IF EXISTS "Users can update own requests" ON public.trip_requests;
    DROP POLICY IF EXISTS "Trip owners can view requests" ON public.trip_requests;
    DROP POLICY IF EXISTS "Trip owners can respond to requests" ON public.trip_requests;
    DROP POLICY IF EXISTS "trip_requests_select" ON public.trip_requests;
    DROP POLICY IF EXISTS "trip_requests_insert" ON public.trip_requests;
    DROP POLICY IF EXISTS "trip_requests_update" ON public.trip_requests;
    DROP POLICY IF EXISTS "trip_requests_delete" ON public.trip_requests;

    -- SELECT: Requesters and trip owners can view
    CREATE POLICY "trip_requests_select" ON public.trip_requests
      FOR SELECT
      USING (
        user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM trips
          WHERE trips.id = trip_requests.trip_id
          AND trips.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    -- INSERT: Users can create requests for themselves
    CREATE POLICY "trip_requests_insert" ON public.trip_requests
      FOR INSERT
      WITH CHECK (
        user_id = (SELECT auth.uid())
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    -- UPDATE: Requesters and trip owners can update
    CREATE POLICY "trip_requests_update" ON public.trip_requests
      FOR UPDATE
      USING (
        user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM trips
          WHERE trips.id = trip_requests.trip_id
          AND trips.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    -- DELETE: Only requesters can delete (cancel)
    CREATE POLICY "trip_requests_delete" ON public.trip_requests
      FOR DELETE
      USING (
        user_id = (SELECT auth.uid())
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    RAISE NOTICE '✅ trip_requests: Policies consolidated';
  END IF;
END $$;

-- ============================================================================
-- 6. BOOKINGS - Consolidate policies
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Trip owners can view bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Trip owners can manage bookings" ON public.bookings;
    DROP POLICY IF EXISTS "bookings_select" ON public.bookings;
    DROP POLICY IF EXISTS "bookings_insert" ON public.bookings;
    DROP POLICY IF EXISTS "bookings_update" ON public.bookings;
    DROP POLICY IF EXISTS "bookings_delete" ON public.bookings;

    -- SELECT: Bookers and trip owners can view
    CREATE POLICY "bookings_select" ON public.bookings
      FOR SELECT
      USING (
        user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM trips
          WHERE trips.id = bookings.trip_id
          AND trips.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    -- INSERT: Users can create bookings for themselves
    CREATE POLICY "bookings_insert" ON public.bookings
      FOR INSERT
      WITH CHECK (
        user_id = (SELECT auth.uid())
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    -- UPDATE: Bookers and trip owners can update
    CREATE POLICY "bookings_update" ON public.bookings
      FOR UPDATE
      USING (
        user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM trips
          WHERE trips.id = bookings.trip_id
          AND trips.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    -- DELETE: Trip owners can cancel bookings
    CREATE POLICY "bookings_delete" ON public.bookings
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM trips
          WHERE trips.id = bookings.trip_id
          AND trips.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );

    RAISE NOTICE '✅ bookings: Policies consolidated';
  END IF;
END $$;

-- ============================================================================
-- 7. VERIFICATION - Check for remaining multiple permissive policies
-- ============================================================================

DO $$
DECLARE
  dup_record RECORD;
  found_issues BOOLEAN := FALSE;
BEGIN
  RAISE NOTICE '--- Checking for remaining multiple permissive policies ---';

  FOR dup_record IN
    SELECT
      tablename,
      cmd,
      COUNT(*) as policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND permissive = 'PERMISSIVE'
    GROUP BY tablename, cmd
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
    LIMIT 10
  LOOP
    found_issues := TRUE;
    RAISE NOTICE '⚠️ % has % permissive % policies', dup_record.tablename, dup_record.policy_count, dup_record.cmd;
  END LOOP;

  IF NOT found_issues THEN
    RAISE NOTICE '✅ No multiple permissive policies detected on consolidated tables';
  ELSE
    RAISE NOTICE 'ℹ️ Some tables may still have multiple policies - review manually if needed';
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- POST-MIGRATION VERIFICATION
-- ============================================================================
-- Run this query to check consolidated tables:
--
-- SELECT tablename, cmd, COUNT(*) as policy_count
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('admin_sessions', 'kyc_verifications', 'processed_webhook_events',
--                     'trip_participants', 'trip_requests', 'bookings')
-- GROUP BY tablename, cmd
-- ORDER BY tablename, cmd;
--
-- Each table/cmd combination should have exactly 1 policy
-- ============================================================================
