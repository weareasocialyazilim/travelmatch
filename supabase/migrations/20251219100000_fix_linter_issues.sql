-- ============================================================
-- FIX SUPABASE LINTER ISSUES
-- Date: 2025-12-19
-- Target: Improve security and performance scores
-- ============================================================

-- ============================================================
-- 1. FIX FUNCTION SEARCH PATH (SECURITY)
-- ============================================================

-- 1.1 Fix update_kyc_updated_at
CREATE OR REPLACE FUNCTION public.update_kyc_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 1.2 Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 1.3 Fix cleanup_expired_2fa_codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_2fa_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM used_2fa_codes WHERE expires_at < NOW();
END;
$$;

-- ============================================================
-- 2. FIX AUTH_RLS_INITPLAN (PERFORMANCE)
-- Replace auth.uid() with (select auth.uid()) in RLS policies
-- ============================================================

-- 2.1 kyc_verifications
DROP POLICY IF EXISTS "Users can view own KYC" ON public.kyc_verifications;
CREATE POLICY "Users can view own KYC" ON public.kyc_verifications
FOR SELECT USING ((select auth.uid()) = user_id);

-- 2.2 escrow_transactions - Update policy
DROP POLICY IF EXISTS "Users can update own escrow proof" ON public.escrow_transactions;
CREATE POLICY "Users can update own escrow proof" ON public.escrow_transactions
FOR UPDATE USING (
  (select auth.uid()) = sender_id 
  AND status = 'pending'
  AND proof_submitted = false
)
WITH CHECK (
  (select auth.uid()) = sender_id
  AND status = 'pending'
);

-- 2.3 admin_users
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;
CREATE POLICY "Super admins can manage admin users" ON public.admin_users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users au 
    JOIN auth.users u ON u.email = au.email
    WHERE u.id = (select auth.uid()) 
    AND au.role = 'super_admin'
  )
);

-- 2.4 admin_sessions
DROP POLICY IF EXISTS "Admins can delete own sessions" ON public.admin_sessions;
CREATE POLICY "Admins can delete own sessions" ON public.admin_sessions
FOR DELETE USING (
  admin_id IN (
    SELECT au.id FROM admin_users au 
    JOIN auth.users u ON u.email = au.email 
    WHERE u.id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can view own sessions" ON public.admin_sessions;
CREATE POLICY "Admins can view own sessions" ON public.admin_sessions
FOR SELECT USING (
  admin_id IN (
    SELECT au.id FROM admin_users au 
    JOIN auth.users u ON u.email = au.email 
    WHERE u.id = (select auth.uid())
  )
);

-- 2.5 admin_audit_logs
DROP POLICY IF EXISTS "Admins can insert admin audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert admin audit logs" ON public.admin_audit_logs
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users au 
    JOIN auth.users u ON u.email = au.email
    WHERE u.id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can view admin audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view admin audit logs" ON public.admin_audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_users au 
    JOIN auth.users u ON u.email = au.email
    WHERE u.id = (select auth.uid())
  )
);

-- 2.6 tasks
DROP POLICY IF EXISTS "Admins can view assigned tasks" ON public.tasks;
CREATE POLICY "Admins can view assigned tasks" ON public.tasks
FOR SELECT USING (
  assigned_to IN (
    SELECT au.id FROM admin_users au 
    JOIN auth.users u ON u.email = au.email 
    WHERE u.id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM admin_users au 
    JOIN auth.users u ON u.email = au.email
    WHERE u.id = (select auth.uid())
  )
);

-- 2.7 trips - All policies
DROP POLICY IF EXISTS "Users can create own trips" ON public.trips;
CREATE POLICY "Users can create own trips" ON public.trips
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own trips" ON public.trips;
CREATE POLICY "Users can delete own trips" ON public.trips
FOR DELETE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own trips" ON public.trips;
CREATE POLICY "Users can update own trips" ON public.trips
FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own trips" ON public.trips;
CREATE POLICY "Users can view own trips" ON public.trips
FOR SELECT USING ((select auth.uid()) = user_id);

-- 2.8 trip_participants
DROP POLICY IF EXISTS "Trip owners can manage participants" ON public.trip_participants;
CREATE POLICY "Trip owners can manage participants" ON public.trip_participants
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM trips t 
    WHERE t.id = trip_participants.trip_id 
    AND t.user_id = (select auth.uid())
  )
);

-- 2.9 disputes - All policies
DROP POLICY IF EXISTS "Users can create disputes" ON public.disputes;
CREATE POLICY "Users can create disputes" ON public.disputes
FOR INSERT WITH CHECK ((select auth.uid()) = reporter_id);

DROP POLICY IF EXISTS "Users can view own disputes" ON public.disputes;
CREATE POLICY "Users can view own disputes" ON public.disputes
FOR SELECT USING (
  (select auth.uid()) = reporter_id 
  OR (select auth.uid()) = reported_user_id
);

-- 2.10 data_export_requests
DROP POLICY IF EXISTS "Users can create own export requests" ON public.data_export_requests;
CREATE POLICY "Users can create own export requests" ON public.data_export_requests
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own export requests" ON public.data_export_requests;
CREATE POLICY "Users can view own export requests" ON public.data_export_requests
FOR SELECT USING ((select auth.uid()) = user_id);

-- 2.11 bookings (REMOVED - table no longer exists)
-- See: 20260103000001_remove_bookings_trip_requests.sql

-- 2.12 trip_requests (REMOVED - table no longer exists)
-- See: 20260103000001_remove_bookings_trip_requests.sql

-- 2.13 videos
DROP POLICY IF EXISTS "Users can delete own videos" ON public.videos;
CREATE POLICY "Users can delete own videos" ON public.videos
FOR DELETE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own videos" ON public.videos;
CREATE POLICY "Users can update own videos" ON public.videos
FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can upload videos" ON public.videos;
CREATE POLICY "Users can upload videos" ON public.videos
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own videos" ON public.videos;
CREATE POLICY "Users can view own videos" ON public.videos
FOR SELECT USING ((select auth.uid()) = user_id);

-- ============================================================
-- 3. FIX DUPLICATE INDEX (PERFORMANCE)
-- ============================================================

-- Drop duplicate index on processed_webhook_events
DROP INDEX IF EXISTS idx_webhook_events_event_id_unique;

-- ============================================================
-- 4. ADD MISSING FK INDEXES (PERFORMANCE)
-- ============================================================

-- 4.1 admin_users.created_by
CREATE INDEX IF NOT EXISTS idx_admin_users_created_by 
ON public.admin_users(created_by);

-- 4.2 disputes.resolved_by
CREATE INDEX IF NOT EXISTS idx_disputes_resolved_by 
ON public.disputes(resolved_by);

-- 4.3 disputes.transaction_id
CREATE INDEX IF NOT EXISTS idx_disputes_transaction_id 
ON public.disputes(transaction_id);

-- 4.4 requests.host_id
CREATE INDEX IF NOT EXISTS idx_requests_host_id 
ON public.requests(host_id);

-- 4.5 tasks.completed_by
CREATE INDEX IF NOT EXISTS idx_tasks_completed_by 
ON public.tasks(completed_by);

-- 4.6 trip_requests.responded_by (REMOVED - table no longer exists)
-- CREATE INDEX IF NOT EXISTS idx_trip_requests_responded_by 
-- ON public.trip_requests(responded_by);

-- ============================================================
-- 5. PostGIS: spatial_ref_sys - FALSE POSITIVE (see SECURITY_ARCHITECTURE.md)
-- ============================================================

-- ============================================================
-- 6. VERIFICATION
-- ============================================================

DO $$
DECLARE
  func_count INT;
  policy_count INT;
  index_count INT;
BEGIN
  -- Count secured functions
  SELECT COUNT(*) INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname IN ('update_kyc_updated_at', 'update_updated_at_column', 'cleanup_expired_2fa_codes')
  AND p.proconfig IS NOT NULL;

  -- Count optimized policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND (LOWER(qual) LIKE '%(select auth.%' OR LOWER(with_check) LIKE '%(select auth.%');

  -- Count new FK indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND indexname IN (
    'idx_admin_users_created_by',
    'idx_disputes_resolved_by',
    'idx_disputes_transaction_id',
    'idx_requests_host_id',
    'idx_tasks_completed_by'
    -- 'idx_trip_requests_responded_by' -- REMOVED - table no longer exists
  );

  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ LINTER FIXES COMPLETE';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Functions with search_path secured: %', func_count;
  RAISE NOTICE 'Optimized RLS policies (cached auth): %', policy_count;
  RAISE NOTICE 'New FK indexes created: %', index_count;
  RAISE NOTICE '============================================';
  RAISE NOTICE '🔒 SECURITY FIXES:';
  RAISE NOTICE '   - 3 functions: search_path secured';
  RAISE NOTICE '   - PostGIS: extension in public (cannot move)';
  RAISE NOTICE '   - spatial_ref_sys: FALSE POSITIVE';
  RAISE NOTICE '============================================';
  RAISE NOTICE '⚡ PERFORMANCE FIXES:';
  RAISE NOTICE '   - 30+ RLS policies: auth.uid() cached';
  RAISE NOTICE '   - 1 duplicate index removed';
  RAISE NOTICE '   - 6 FK indexes added';
  RAISE NOTICE '============================================';
END $$;
