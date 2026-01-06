-- ============================================================================
-- RLS InitPlan Optimization Migration
-- ============================================================================
-- Purpose: Fix auth.uid() InitPlan performance issue in RLS policies
-- 
-- Problem: Direct auth.uid() calls in RLS policies cause PostgreSQL to 
-- re-evaluate the function for every row (InitPlan). This can significantly 
-- slow down queries on large tables.
--
-- Solution: Wrap auth.uid() in a subquery (SELECT auth.uid()) which forces
-- PostgreSQL to evaluate it once and cache the result.
--
-- Affected: 35 policies across 13 tables
-- Risk: LOW - Only performance improvement, no functional change
-- ============================================================================

BEGIN;

-- ============================================================================
-- TRIPS TABLE (4 policies)
-- ============================================================================

DROP POLICY IF EXISTS "Users can create own trips" ON trips;
CREATE POLICY "Users can create own trips" ON trips
  FOR INSERT TO public
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own trips" ON trips;
CREATE POLICY "Users can view own trips" ON trips
  FOR SELECT TO public
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own trips" ON trips;
CREATE POLICY "Users can update own trips" ON trips
  FOR UPDATE TO public
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own trips" ON trips;
CREATE POLICY "Users can delete own trips" ON trips
  FOR DELETE TO public
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- VIDEOS TABLE (4 policies)
-- ============================================================================

DROP POLICY IF EXISTS "Users can create own videos" ON videos;
CREATE POLICY "Users can create own videos" ON videos
  FOR INSERT TO public
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own videos" ON videos;
-- Note: This policy might already use (SELECT auth.uid()), keeping for consistency
CREATE POLICY "Users can view own videos" ON videos
  FOR SELECT TO public
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own videos" ON videos;
CREATE POLICY "Users can update own videos" ON videos
  FOR UPDATE TO public
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own videos" ON videos;
CREATE POLICY "Users can delete own videos" ON videos
  FOR DELETE TO public
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- BOOKINGS TABLE (REMOVED - table no longer exists)
-- See: 20260103000001_remove_bookings_trip_requests.sql
-- ============================================================================

-- ============================================================================
-- TRIP_REQUESTS TABLE (REMOVED - table no longer exists)
-- See: 20260103000001_remove_bookings_trip_requests.sql
-- ============================================================================

-- ============================================================================
-- TRIP_PARTICIPANTS TABLE (3 policies)
-- ============================================================================

DROP POLICY IF EXISTS "Users can join trips" ON trip_participants;
CREATE POLICY "Users can join trips" ON trip_participants
  FOR INSERT TO public
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own participation" ON trip_participants;
CREATE POLICY "Users can manage own participation" ON trip_participants
  FOR ALL TO public
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Trip owners can manage participants" ON trip_participants;
CREATE POLICY "Trip owners can manage participants" ON trip_participants
  FOR ALL TO public
  USING (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = trip_participants.trip_id 
    AND trips.user_id = (SELECT auth.uid())
  ));

-- ============================================================================
-- DISPUTES TABLE (3 policies)
-- ============================================================================

DROP POLICY IF EXISTS "Users can create disputes" ON disputes;
CREATE POLICY "Users can create disputes" ON disputes
  FOR INSERT TO public
  WITH CHECK ((SELECT auth.uid()) = reporter_id);

DROP POLICY IF EXISTS "Users can view own disputes" ON disputes;
CREATE POLICY "Users can view own disputes" ON disputes
  FOR SELECT TO public
  USING ((SELECT auth.uid()) = reporter_id OR (SELECT auth.uid()) = reported_user_id);

DROP POLICY IF EXISTS "Users can update own disputes" ON disputes;
CREATE POLICY "Users can update own disputes" ON disputes
  FOR UPDATE TO public
  USING ((SELECT auth.uid()) = reporter_id);

-- ============================================================================
-- CONSENT_HISTORY TABLE (2 policies)
-- ============================================================================

DROP POLICY IF EXISTS "Users can add consent records" ON consent_history;
CREATE POLICY "Users can add consent records" ON consent_history
  FOR INSERT TO public
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own consent history" ON consent_history;
CREATE POLICY "Users can view own consent history" ON consent_history
  FOR SELECT TO public
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- DATA_EXPORT_REQUESTS TABLE (2 policies)
-- ============================================================================

DROP POLICY IF EXISTS "Users can create export requests" ON data_export_requests;
CREATE POLICY "Users can create export requests" ON data_export_requests
  FOR INSERT TO public
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own export requests" ON data_export_requests;
CREATE POLICY "Users can view own export requests" ON data_export_requests
  FOR SELECT TO public
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- KYC_VERIFICATIONS TABLE (1 policy)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own KYC" ON kyc_verifications;
CREATE POLICY "Users can view own KYC" ON kyc_verifications
  FOR SELECT TO public
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- ESCROW_TRANSACTIONS TABLE (1 policy)
-- ============================================================================

DROP POLICY IF EXISTS "Users can update own escrow proof" ON escrow_transactions;
CREATE POLICY "Users can update own escrow proof" ON escrow_transactions
  FOR UPDATE TO public
  USING ((SELECT auth.uid()) = sender_id OR (SELECT auth.uid()) = recipient_id)
  WITH CHECK (
    ((SELECT auth.uid()) = sender_id OR (SELECT auth.uid()) = recipient_id) 
    AND status = 'pending'::text
  );

-- ============================================================================
-- ADMIN_SESSIONS TABLE (2 policies)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view own sessions" ON admin_sessions;
CREATE POLICY "Admins can view own sessions" ON admin_sessions
  FOR SELECT TO public
  USING (admin_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins can delete own sessions" ON admin_sessions;
CREATE POLICY "Admins can delete own sessions" ON admin_sessions
  FOR DELETE TO public
  USING (admin_id = (SELECT auth.uid()));

-- ============================================================================
-- ADMIN_AUDIT_LOGS TABLE (2 policies)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can insert admin audit logs" ON admin_audit_logs;
CREATE POLICY "Admins can insert admin audit logs" ON admin_audit_logs
  FOR INSERT TO public
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.id = (SELECT auth.uid()) 
    AND au.is_active = true
  ));

DROP POLICY IF EXISTS "Admins can view admin audit logs" ON admin_audit_logs;
CREATE POLICY "Admins can view admin audit logs" ON admin_audit_logs
  FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.id = (SELECT auth.uid()) 
    AND au.is_active = true 
    AND au.role = ANY (ARRAY['super_admin'::admin_role, 'manager'::admin_role])
  ));

-- ============================================================================
-- ADMIN_USERS TABLE (1 policy)
-- ============================================================================

DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;
CREATE POLICY "Super admins can manage admin users" ON admin_users
  FOR ALL TO public
  USING (EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.id = (SELECT auth.uid()) 
    AND au.role = 'super_admin'::admin_role 
    AND au.is_active = true
  ));

-- ============================================================================
-- TASKS TABLE (1 policy)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view assigned tasks" ON tasks;
CREATE POLICY "Admins can view assigned tasks" ON tasks
  FOR SELECT TO public
  USING (
    assigned_to = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = (SELECT auth.uid()) 
      AND au.is_active = true 
      AND au.role = ANY (tasks.assigned_roles)
    )
    OR EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = (SELECT auth.uid()) 
      AND au.is_active = true 
      AND au.role = ANY (ARRAY['super_admin'::admin_role, 'manager'::admin_role])
    )
  );

COMMIT;

-- ============================================================================
-- VERIFICATION QUERY (run after migration)
-- ============================================================================
-- SELECT tablename, policyname
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND (
--     (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(SELECT auth.uid()%')
--     OR 
--     (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(SELECT auth.uid()%')
--   );
-- Should return 0 rows after successful migration
