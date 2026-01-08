-- ============================================================================
-- FIX REMAINING SUPABASE LINTER ISSUES
-- ============================================================================
-- Date: 2026-01-08
-- Purpose: Fix remaining auth_rls_initplan, multiple_permissive_policies,
--          and duplicate_index warnings
-- Risk: LOW - Performance improvements and policy cleanup
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: FIX AUTH_RLS_INITPLAN WARNINGS
-- ============================================================================
-- Replace auth.<function>() with (SELECT auth.<function>()) for caching
-- ============================================================================

-- 1.1 uploaded_images_secure_insert
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'uploaded_images') THEN
    DROP POLICY IF EXISTS "uploaded_images_secure_insert" ON public.uploaded_images;
    DROP POLICY IF EXISTS "uploaded_images_insert_policy" ON public.uploaded_images;
    DROP POLICY IF EXISTS "Users can insert own uploads" ON public.uploaded_images;
    
    CREATE POLICY "uploaded_images_secure_insert" ON public.uploaded_images
      FOR INSERT TO authenticated
      WITH CHECK (user_id = (SELECT auth.uid()));
    
    RAISE NOTICE '✅ uploaded_images: INSERT policy fixed with (SELECT auth.uid())';
  END IF;
END $$;

-- 1.2 deep_link_events_secure_insert
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deep_link_events') THEN
    DROP POLICY IF EXISTS "deep_link_events_secure_insert" ON public.deep_link_events;
    DROP POLICY IF EXISTS "deep_link_events_validated_insert" ON public.deep_link_events;
    DROP POLICY IF EXISTS "Service can insert deep link events" ON public.deep_link_events;
    DROP POLICY IF EXISTS "deep_link_events_insert_policy" ON public.deep_link_events;
    DROP POLICY IF EXISTS "deep_link_events_insert" ON public.deep_link_events;
    
    -- Columns: type, source, url, session_id (required), user_id (optional)
    CREATE POLICY "deep_link_events_insert" ON public.deep_link_events
      FOR INSERT TO authenticated, service_role
      WITH CHECK (
        type IS NOT NULL
        AND source IS NOT NULL
        AND url IS NOT NULL
        AND session_id IS NOT NULL
        AND (
          user_id IS NULL
          OR user_id = (SELECT auth.uid())
          OR (SELECT auth.jwt() ->> 'role') = 'service_role'
        )
      );
    
    RAISE NOTICE '✅ deep_link_events: INSERT policy consolidated and fixed';
  END IF;
END $$;

-- 1.3 reviews_secure_select
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
    DROP POLICY IF EXISTS "reviews_secure_select" ON public.reviews;
    DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
    DROP POLICY IF EXISTS "reviews_select_policy" ON public.reviews;
    
    CREATE POLICY "reviews_select" ON public.reviews
      FOR SELECT
      USING (
        reviewer_id = (SELECT auth.uid())
        OR reviewed_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM moments m
          WHERE m.id = reviews.moment_id
          AND m.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    RAISE NOTICE '✅ reviews: SELECT policy fixed with (SELECT auth.uid())';
  END IF;
END $$;

-- 1.4 admin_sessions - "Admins manage own sessions"
-- Note: admin_users doesn't have auth_user_id column - admin panel uses custom email auth
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_sessions') THEN
    -- Drop all existing policies first
    DROP POLICY IF EXISTS "Admins manage own sessions" ON public.admin_sessions;
    DROP POLICY IF EXISTS "Service role full access" ON public.admin_sessions;
    DROP POLICY IF EXISTS "admin_sessions_service_role_access" ON public.admin_sessions;
    DROP POLICY IF EXISTS "admin_sessions_select" ON public.admin_sessions;
    DROP POLICY IF EXISTS "admin_sessions_insert" ON public.admin_sessions;
    DROP POLICY IF EXISTS "admin_sessions_update" ON public.admin_sessions;
    DROP POLICY IF EXISTS "admin_sessions_delete" ON public.admin_sessions;
    DROP POLICY IF EXISTS "admin_sessions_all" ON public.admin_sessions;
    
    -- Admin sessions table is only accessed via service_role from the admin backend
    -- The admin panel authenticates via email/password + TOTP, not Supabase Auth
    CREATE POLICY "admin_sessions_service_only" ON public.admin_sessions
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (
        -- Only allow sessions for active admins
        admin_id IN (SELECT id FROM public.admin_users WHERE is_active = true)
      );
    
    RAISE NOTICE '✅ admin_sessions: Consolidated to service_role only policy';
  END IF;
END $$;

-- 1.5 admin_users - Note: No auth_user_id column, admin auth is separate from Supabase Auth
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_users') THEN
    DROP POLICY IF EXISTS "admin_users_modify_policy" ON public.admin_users;
    DROP POLICY IF EXISTS "admin_users_select_policy" ON public.admin_users;
    DROP POLICY IF EXISTS "admin_users_select" ON public.admin_users;
    DROP POLICY IF EXISTS "admin_users_all" ON public.admin_users;
    DROP POLICY IF EXISTS "admin_users_modify" ON public.admin_users;
    
    -- Admin users are only managed via service_role from the admin backend
    CREATE POLICY "admin_users_service_only" ON public.admin_users
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
    
    RAISE NOTICE '✅ admin_users: Consolidated to service_role only policy';
  END IF;
END $$;

-- ============================================================================
-- PART 2: FIX MULTIPLE PERMISSIVE POLICIES
-- ============================================================================
-- Consolidate duplicate policies into single policies per action
-- ============================================================================

-- 2.1 bookings - Multiple INSERT/SELECT/UPDATE policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
    DROP POLICY IF EXISTS "Trip owners can manage bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Trip owners can view bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
    DROP POLICY IF EXISTS "bookings_select" ON public.bookings;
    DROP POLICY IF EXISTS "bookings_insert" ON public.bookings;
    DROP POLICY IF EXISTS "bookings_update" ON public.bookings;
    DROP POLICY IF EXISTS "bookings_delete" ON public.bookings;
    
    -- Consolidated SELECT
    CREATE POLICY "bookings_select" ON public.bookings
      FOR SELECT
      USING (
        user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM trips t
          WHERE t.id = bookings.trip_id
          AND t.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    -- Consolidated INSERT
    CREATE POLICY "bookings_insert" ON public.bookings
      FOR INSERT
      WITH CHECK (
        user_id = (SELECT auth.uid())
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    -- Consolidated UPDATE
    CREATE POLICY "bookings_update" ON public.bookings
      FOR UPDATE
      USING (
        user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM trips t
          WHERE t.id = bookings.trip_id
          AND t.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    -- Consolidated DELETE
    CREATE POLICY "bookings_delete" ON public.bookings
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM trips t
          WHERE t.id = bookings.trip_id
          AND t.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    RAISE NOTICE '✅ bookings: Policies consolidated';
  END IF;
END $$;

-- 2.2 cache_invalidation - Multiple INSERT policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cache_invalidation') THEN
    DROP POLICY IF EXISTS "cache_invalidation_insert_policy" ON public.cache_invalidation;
    DROP POLICY IF EXISTS "cache_invalidation_service_role_only" ON public.cache_invalidation;
    
    -- Service role only for cache invalidation
    CREATE POLICY "cache_invalidation_all" ON public.cache_invalidation
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
    
    RAISE NOTICE '✅ cache_invalidation: Consolidated to service_role only';
  END IF;
END $$;

-- 2.3 data_export_requests - Multiple INSERT policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'data_export_requests') THEN
    DROP POLICY IF EXISTS "Users can create export requests" ON public.data_export_requests;
    DROP POLICY IF EXISTS "Users can create own export requests" ON public.data_export_requests;
    DROP POLICY IF EXISTS "data_export_requests_insert" ON public.data_export_requests;
    DROP POLICY IF EXISTS "data_export_requests_select" ON public.data_export_requests;
    
    -- Consolidated SELECT
    CREATE POLICY "data_export_requests_select" ON public.data_export_requests
      FOR SELECT
      USING (
        user_id = (SELECT auth.uid())
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    -- Consolidated INSERT
    CREATE POLICY "data_export_requests_insert" ON public.data_export_requests
      FOR INSERT TO authenticated
      WITH CHECK (user_id = (SELECT auth.uid()));
    
    RAISE NOTICE '✅ data_export_requests: Policies consolidated';
  END IF;
END $$;

-- 2.4 kyc_verifications - Multiple policies for all actions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'kyc_verifications') THEN
    DROP POLICY IF EXISTS "KYC verifications access" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "KYC verifications service write" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "KYC verifications service update" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "KYC verifications service delete" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "Service role can manage KYC" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "Users can view own KYC" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "kyc_verifications_select" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "kyc_verifications_insert" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "kyc_verifications_update" ON public.kyc_verifications;
    DROP POLICY IF EXISTS "kyc_verifications_delete" ON public.kyc_verifications;
    
    -- Users can view own, service role has full access
    CREATE POLICY "kyc_verifications_select" ON public.kyc_verifications
      FOR SELECT
      USING (
        user_id = (SELECT auth.uid())
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    -- Only service role can modify
    CREATE POLICY "kyc_verifications_insert" ON public.kyc_verifications
      FOR INSERT
      WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'service_role');
    
    CREATE POLICY "kyc_verifications_update" ON public.kyc_verifications
      FOR UPDATE
      USING ((SELECT auth.jwt() ->> 'role') = 'service_role');
    
    CREATE POLICY "kyc_verifications_delete" ON public.kyc_verifications
      FOR DELETE
      USING ((SELECT auth.jwt() ->> 'role') = 'service_role');
    
    RAISE NOTICE '✅ kyc_verifications: Policies consolidated';
  END IF;
END $$;

-- 2.5 processed_webhook_events - Multiple policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'processed_webhook_events') THEN
    DROP POLICY IF EXISTS "Service role only for webhook events" ON public.processed_webhook_events;
    DROP POLICY IF EXISTS "webhook_events_policy" ON public.processed_webhook_events;
    DROP POLICY IF EXISTS "processed_webhook_events_all" ON public.processed_webhook_events;
    
    CREATE POLICY "processed_webhook_events_service" ON public.processed_webhook_events
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
    
    RAISE NOTICE '✅ processed_webhook_events: Consolidated to service_role only';
  END IF;
END $$;

-- 2.6 trip_participants - Multiple policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trip_participants') THEN
    DROP POLICY IF EXISTS "Trip owners can manage participants" ON public.trip_participants;
    DROP POLICY IF EXISTS "Users can manage own participation" ON public.trip_participants;
    DROP POLICY IF EXISTS "Users can join trips" ON public.trip_participants;
    DROP POLICY IF EXISTS "Users can view trip participants" ON public.trip_participants;
    DROP POLICY IF EXISTS "trip_participants_select" ON public.trip_participants;
    DROP POLICY IF EXISTS "trip_participants_insert" ON public.trip_participants;
    DROP POLICY IF EXISTS "trip_participants_update" ON public.trip_participants;
    DROP POLICY IF EXISTS "trip_participants_delete" ON public.trip_participants;
    
    CREATE POLICY "trip_participants_select" ON public.trip_participants
      FOR SELECT
      USING (
        user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM trips t
          WHERE t.id = trip_participants.trip_id
          AND t.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    CREATE POLICY "trip_participants_insert" ON public.trip_participants
      FOR INSERT
      WITH CHECK (
        user_id = (SELECT auth.uid())
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    CREATE POLICY "trip_participants_update" ON public.trip_participants
      FOR UPDATE
      USING (
        user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM trips t
          WHERE t.id = trip_participants.trip_id
          AND t.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    CREATE POLICY "trip_participants_delete" ON public.trip_participants
      FOR DELETE
      USING (
        user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM trips t
          WHERE t.id = trip_participants.trip_id
          AND t.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    RAISE NOTICE '✅ trip_participants: Policies consolidated';
  END IF;
END $$;

-- 2.7 trip_requests - Multiple policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trip_requests') THEN
    DROP POLICY IF EXISTS "Users can create requests" ON public.trip_requests;
    DROP POLICY IF EXISTS "Users can create trip requests" ON public.trip_requests;
    DROP POLICY IF EXISTS "Trip owners can view requests" ON public.trip_requests;
    DROP POLICY IF EXISTS "Users can view own requests" ON public.trip_requests;
    DROP POLICY IF EXISTS "Users can view own trip requests" ON public.trip_requests;
    DROP POLICY IF EXISTS "Trip owners can respond to requests" ON public.trip_requests;
    DROP POLICY IF EXISTS "Users can update own requests" ON public.trip_requests;
    DROP POLICY IF EXISTS "trip_requests_select" ON public.trip_requests;
    DROP POLICY IF EXISTS "trip_requests_insert" ON public.trip_requests;
    DROP POLICY IF EXISTS "trip_requests_update" ON public.trip_requests;
    DROP POLICY IF EXISTS "trip_requests_delete" ON public.trip_requests;
    
    CREATE POLICY "trip_requests_select" ON public.trip_requests
      FOR SELECT
      USING (
        user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM trips t
          WHERE t.id = trip_requests.trip_id
          AND t.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    CREATE POLICY "trip_requests_insert" ON public.trip_requests
      FOR INSERT
      WITH CHECK (
        user_id = (SELECT auth.uid())
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    CREATE POLICY "trip_requests_update" ON public.trip_requests
      FOR UPDATE
      USING (
        user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM trips t
          WHERE t.id = trip_requests.trip_id
          AND t.user_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    CREATE POLICY "trip_requests_delete" ON public.trip_requests
      FOR DELETE
      USING (
        user_id = (SELECT auth.uid())
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    RAISE NOTICE '✅ trip_requests: Policies consolidated';
  END IF;
END $$;

-- 2.8 trips - Multiple SELECT policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trips') THEN
    DROP POLICY IF EXISTS "Users can view own trips" ON public.trips;
    DROP POLICY IF EXISTS "Users can view public trips" ON public.trips;
    DROP POLICY IF EXISTS "trips_select" ON public.trips;
    
    -- Consolidated SELECT: Own trips OR public trips
    CREATE POLICY "trips_select" ON public.trips
      FOR SELECT
      USING (
        user_id = (SELECT auth.uid())
        OR status = 'published'
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    RAISE NOTICE '✅ trips: SELECT policies consolidated';
  END IF;
END $$;

-- 2.9 videos - Multiple INSERT/SELECT policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'videos') THEN
    DROP POLICY IF EXISTS "Users can create own videos" ON public.videos;
    DROP POLICY IF EXISTS "Users can upload videos" ON public.videos;
    DROP POLICY IF EXISTS "Users can view all videos" ON public.videos;
    DROP POLICY IF EXISTS "Users can view own videos" ON public.videos;
    DROP POLICY IF EXISTS "videos_select" ON public.videos;
    DROP POLICY IF EXISTS "videos_insert" ON public.videos;
    
    -- Consolidated SELECT: All published OR own videos
    CREATE POLICY "videos_select" ON public.videos
      FOR SELECT
      USING (
        user_id = (SELECT auth.uid())
        OR status = 'published'
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      );
    
    -- Consolidated INSERT
    CREATE POLICY "videos_insert" ON public.videos
      FOR INSERT TO authenticated
      WITH CHECK (user_id = (SELECT auth.uid()));
    
    RAISE NOTICE '✅ videos: Policies consolidated';
  END IF;
END $$;

-- ============================================================================
-- PART 3: FIX DUPLICATE INDEX WARNINGS
-- ============================================================================

-- 3.1 escrow_transactions: idx_escrow_expires vs idx_escrow_transactions_expires
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'escrow_transactions' 
    AND indexname = 'idx_escrow_expires'
  ) AND EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'escrow_transactions' 
    AND indexname = 'idx_escrow_transactions_expires'
  ) THEN
    DROP INDEX IF EXISTS public.idx_escrow_expires;
    RAISE NOTICE '✅ escrow_transactions: Dropped duplicate idx_escrow_expires';
  END IF;
END $$;

-- 3.2 kyc_verifications: idx_kyc_verifications_user vs idx_kyc_verifications_user_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'kyc_verifications' 
    AND indexname = 'idx_kyc_verifications_user'
  ) AND EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'kyc_verifications' 
    AND indexname = 'idx_kyc_verifications_user_id'
  ) THEN
    DROP INDEX IF EXISTS public.idx_kyc_verifications_user;
    RAISE NOTICE '✅ kyc_verifications: Dropped duplicate idx_kyc_verifications_user';
  END IF;
END $$;

-- 3.3 moments: idx_moments_coordinates vs idx_moments_coordinates_gist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'moments' 
    AND indexname = 'idx_moments_coordinates'
  ) AND EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'moments' 
    AND indexname = 'idx_moments_coordinates_gist'
  ) THEN
    DROP INDEX IF EXISTS public.idx_moments_coordinates;
    RAISE NOTICE '✅ moments: Dropped duplicate idx_moments_coordinates';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  policy_issues INTEGER;
  dup_index_count INTEGER;
BEGIN
  RAISE NOTICE '--- VERIFICATION ---';
  
  -- Check for remaining multiple permissive policies on fixed tables
  SELECT COUNT(*) INTO policy_issues
  FROM (
    SELECT tablename, cmd, COUNT(*) as cnt
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN (
      'admin_sessions', 'admin_users', 'bookings', 'cache_invalidation',
      'data_export_requests', 'deep_link_events', 'kyc_verifications',
      'processed_webhook_events', 'reviews', 'trip_participants',
      'trip_requests', 'trips', 'uploaded_images', 'videos'
    )
    GROUP BY tablename, cmd
    HAVING COUNT(*) > 1
  ) sub;
  
  IF policy_issues > 0 THEN
    RAISE NOTICE '⚠️ Still have % table/action combinations with multiple policies', policy_issues;
  ELSE
    RAISE NOTICE '✅ All targeted tables have single policy per action';
  END IF;
  
  -- Check for remaining duplicate indexes
  SELECT COUNT(*) INTO dup_index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND indexname IN (
    'idx_escrow_expires', 
    'idx_kyc_verifications_user', 
    'idx_moments_coordinates'
  );
  
  IF dup_index_count > 0 THEN
    RAISE NOTICE '⚠️ Still have % duplicate indexes', dup_index_count;
  ELSE
    RAISE NOTICE '✅ All duplicate indexes removed';
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Fixed Issues:
-- 
-- auth_rls_initplan (5):
--   ✅ uploaded_images_secure_insert
--   ✅ deep_link_events_secure_insert
--   ✅ reviews_secure_select
--   ✅ admin_sessions (Admins manage own sessions)
--   ✅ admin_users_modify_policy
--
-- multiple_permissive_policies (13 tables):
--   ✅ admin_sessions
--   ✅ admin_users
--   ✅ bookings
--   ✅ cache_invalidation
--   ✅ data_export_requests
--   ✅ deep_link_events
--   ✅ kyc_verifications
--   ✅ processed_webhook_events
--   ✅ trip_participants
--   ✅ trip_requests
--   ✅ trips
--   ✅ videos
--
-- duplicate_index (3):
--   ✅ escrow_transactions: idx_escrow_expires
--   ✅ kyc_verifications: idx_kyc_verifications_user
--   ✅ moments: idx_moments_coordinates
-- ============================================================================
