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

DO $$
DECLARE
  policy RECORD;
  old_text TEXT;
  new_text TEXT;
BEGIN
  FOR policy IN
    SELECT
      policyname,
      tablename,
      cmd
    FROM pg_policies
    WHERE schemaname = 'public'
    AND (polqual ILIKE '%auth.uid()%' OR polqual ILIKE '%auth.jwt()%'
         OR polwithcheck ILIKE '%auth.uid()%' OR polwithcheck ILIKE '%auth.jwt()%'
         OR polqual ILIKE '%auth.role()%' OR polwithcheck ILIKE '%auth.role()%')
    ORDER BY tablename, policyname
  LOOP
    -- Get current policy definition
    EXECUTE format(
      'SELECT pg_get_policydef(%L::regclass, %L::name)',
      policy.tablename,
      policy.policyname
    ) INTO old_text;

    -- Replace auth.uid() with (SELECT auth.uid())
    new_text := old_text;
    new_text := replace(new_text, 'auth.uid()', '(SELECT auth.uid())');
    new_text := replace(new_text, 'auth.jwt()', '(SELECT auth.jwt())');
    new_text := replace(new_text, 'auth.role()', '(SELECT auth.role())');

    -- Only execute if something changed
    IF new_text != old_text THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy.policyname, policy.tablename);

      -- Parse and recreate policy from definition
      -- Extract the parts: cmd, roles, using, with check
      IF new_text ILIKE '%USING (%' THEN
        EXECUTE format('CREATE POLICY %I ON public.%I %s',
          policy.policyname,
          policy.tablename,
          new_text
        );
        RAISE NOTICE 'Fixed: %.%', policy.tablename, policy.policyname;
      ELSE
        -- For simple policies, try the full recreate
        EXECUTE new_text;
        RAISE NOTICE 'Fixed: %.%', policy.tablename, policy.policyname;
      END IF;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- PART 2: MANUALLY FIX KNOWN POLICIES (safer approach)
-- ============================================================================

-- ab_assignments
DROP POLICY IF EXISTS ab_assignments_service_all ON public.ab_assignments;
CREATE POLICY ab_assignments_service_all ON public.ab_assignments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS ab_assignments_user_select ON public.ab_assignments;
CREATE POLICY ab_assignments_user_select ON public.ab_assignments
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- admin_users (these are for service_role, but fix for consistency)
DROP POLICY IF EXISTS "Authenticated users can verify admin status by email" ON public.admin_users;
CREATE POLICY "Authenticated users can verify admin status by email" ON public.admin_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE email = (SELECT auth.jwt())->>'email')
  );

DROP POLICY IF EXISTS "Super admins can manage all admin users" ON public.admin_users;
CREATE POLICY "Super admins can manage all admin users" ON public.admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE email = (SELECT auth.jwt())->>'email'
      AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Users can view own admin record by email" ON public.admin_users;
CREATE POLICY "Users can view own admin record by email" ON public.admin_users
  FOR SELECT USING (
    email = (SELECT auth.jwt())->>'email'
  );

DROP POLICY IF EXISTS "Users can view own admin record by id" ON public.admin_users;
CREATE POLICY "Users can view own admin record by id" ON public.admin_users
  FOR SELECT USING (
    user_id = (SELECT auth.uid())
  );

-- blocked_content
DROP POLICY IF EXISTS blocked_content_admin_all ON public.blocked_content;
CREATE POLICY blocked_content_admin_all ON public.blocked_content
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS blocked_content_service_insert ON public.blocked_content;
CREATE POLICY blocked_content_service_insert ON public.blocked_content
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS blocked_content_user_select ON public.blocked_content;
CREATE POLICY blocked_content_user_select ON public.blocked_content
  FOR SELECT USING (
    user_id = (SELECT auth.uid())
    OR blocker_id = (SELECT auth.uid())
  );

-- blocks
DROP POLICY IF EXISTS "Users can check if blocked" ON public.blocks;
CREATE POLICY "Users can check if blocked" ON public.blocks
  FOR SELECT USING (
    user_id = (SELECT auth.uid())
    OR blocked_user_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage own blocks" ON public.blocks;
CREATE POLICY "Users can manage own blocks" ON public.blocks
  FOR ALL USING (user_id = (SELECT auth.uid()));

-- chatbot_conversations
DROP POLICY IF EXISTS chatbot_conversations_service_all ON public.chatbot_conversations;
CREATE POLICY chatbot_conversations_service_all ON public.chatbot_conversations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS chatbot_conversations_user_select ON public.chatbot_conversations;
CREATE POLICY chatbot_conversations_user_select ON public.chatbot_conversations
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- chatbot_messages
DROP POLICY IF EXISTS chatbot_messages_service_all ON public.chatbot_messages;
CREATE POLICY chatbot_messages_service_all ON public.chatbot_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS chatbot_messages_user_select ON public.chatbot_messages;
CREATE POLICY chatbot_messages_user_select ON public.chatbot_messages
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- story_views
DROP POLICY IF EXISTS story_views_select_own ON public.story_views;
CREATE POLICY story_views_select_own ON public.story_views
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS story_views_insert_own ON public.story_views;
CREATE POLICY story_views_insert_own ON public.story_views
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- demand_forecasts
DROP POLICY IF EXISTS demand_forecasts_admin_select ON public.demand_forecasts;
CREATE POLICY demand_forecasts_admin_select ON public.demand_forecasts
  FOR SELECT USING ((SELECT auth.jwt())->>'role' = 'service_role');

DROP POLICY IF EXISTS demand_forecasts_service_all ON public.demand_forecasts;
CREATE POLICY demand_forecasts_service_all ON public.demand_forecasts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- kyc_verifications
DROP POLICY IF EXISTS "Users can view own KYC" ON public.kyc_verifications;
CREATE POLICY "Users can view own KYC" ON public.kyc_verifications
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view own kyc" ON public.kyc_verifications;
CREATE POLICY "Users can view own kyc" ON public.kyc_verifications
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- recommendation_feedback
DROP POLICY IF EXISTS recommendation_feedback_service_all ON public.recommendation_feedback;
CREATE POLICY recommendation_feedback_service_all ON public.recommendation_feedback
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS recommendation_feedback_user_all ON public.recommendation_feedback;
CREATE POLICY recommendation_feedback_user_all ON public.recommendation_feedback
  FOR ALL USING (user_id = (SELECT auth.uid()));

-- requests
DROP POLICY IF EXISTS "Moment owners can update requests" ON public.requests;
CREATE POLICY "Moment owners can update requests" ON public.requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM moments WHERE id = requests.moment_id AND user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can cancel own requests" ON public.requests;
CREATE POLICY "Users can cancel own requests" ON public.requests
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- saved_cards
DROP POLICY IF EXISTS "Users can insert own cards" ON public.saved_cards;
CREATE POLICY "Users can insert own cards" ON public.saved_cards
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view own cards" ON public.saved_cards;
CREATE POLICY "Users can view own cards" ON public.saved_cards
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- user_moderation_warnings
DROP POLICY IF EXISTS user_warnings_admin_all ON public.user_moderation_warnings;
CREATE POLICY user_warnings_admin_all ON public.user_moderation_warnings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS user_warnings_user_acknowledge ON public.user_moderation_warnings;
CREATE POLICY user_warnings_user_acknowledge ON public.user_moderation_warnings
  FOR UPDATE USING (
    user_id = (SELECT auth.uid())
    AND acknowledged_at IS NULL
  );

DROP POLICY IF EXISTS user_warnings_user_select ON public.user_moderation_warnings;
CREATE POLICY user_warnings_user_select ON public.user_moderation_warnings
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- user_preference_vectors
DROP POLICY IF EXISTS user_preference_vectors_service_all ON public.user_preference_vectors;
CREATE POLICY user_preference_vectors_service_all ON public.user_preference_vectors
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS user_preference_vectors_user_select ON public.user_preference_vectors;
CREATE POLICY user_preference_vectors_user_select ON public.user_preference_vectors
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- videos
DROP POLICY IF EXISTS "Users can create own videos" ON public.videos;
CREATE POLICY "Users can create own videos" ON public.videos
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own videos" ON public.videos;
CREATE POLICY "Users can delete own videos" ON public.videos
  FOR DELETE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own videos" ON public.videos;
CREATE POLICY "Users can update own videos" ON public.videos
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- ab_experiments
DROP POLICY IF EXISTS ab_experiments_admin_all ON public.ab_experiments;
CREATE POLICY ab_experiments_admin_all ON public.ab_experiments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ai_anomalies
DROP POLICY IF EXISTS ai_anomalies_admin_select ON public.ai_anomalies;
CREATE POLICY ai_anomalies_admin_select ON public.ai_anomalies
  FOR SELECT USING ((SELECT auth.jwt())->>'role' = 'service_role');

DROP POLICY IF EXISTS ai_anomalies_admin_update ON public.ai_anomalies;
CREATE POLICY ai_anomalies_admin_update ON public.ai_anomalies
  FOR UPDATE USING ((SELECT auth.jwt())->>'role' = 'service_role');

DROP POLICY IF EXISTS ai_anomalies_service_insert ON public.ai_anomalies;
CREATE POLICY ai_anomalies_service_insert ON public.ai_anomalies
  FOR INSERT TO service_role WITH CHECK (true);

-- alerts
DROP POLICY IF EXISTS "Admins can manage alerts" ON public.alerts;
CREATE POLICY "Admins can manage alerts" ON public.alerts
  FOR ALL USING ((SELECT auth.jwt())->>'role' = 'service_role');

DROP POLICY IF EXISTS "Admins can view alerts" ON public.alerts;
CREATE POLICY "Admins can view alerts" ON public.alerts
  FOR SELECT USING ((SELECT auth.jwt())->>'role' = 'service_role');

-- deep_link_events
DROP POLICY IF EXISTS deep_link_events_validated_insert ON public.deep_link_events;
CREATE POLICY deep_link_events_validated_insert ON public.deep_link_events
  FOR INSERT WITH CHECK (
    session_id IS NOT NULL
    AND (user_id IS NULL OR user_id = (SELECT auth.uid()))
  );

-- discount_codes
DROP POLICY IF EXISTS "Admins can manage discount codes" ON public.discount_codes;
CREATE POLICY "Admins can manage discount codes" ON public.discount_codes
  FOR ALL USING ((SELECT auth.jwt())->>'role' = 'service_role');

-- founder_decision_log
DROP POLICY IF EXISTS founder_decision_log_insert_super_admin ON public.founder_decision_log;
CREATE POLICY founder_decision_log_insert_super_admin ON public.founder_decision_log
  FOR INSERT WITH CHECK (
    (SELECT auth.jwt())->>'role' = 'service_role'
  );

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
DECLARE
  remaining_issues INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_issues
  FROM pg_policies
  WHERE schemaname = 'public'
  AND (polqual ILIKE '%auth.uid()%' OR polqual ILIKE '%auth.jwt()%'
       OR polwithcheck ILIKE '%auth.uid()%' OR polwithcheck ILIKE '%auth.jwt()%')
  AND polqual NOT ILIKE '%(SELECT auth%'
  AND polwithcheck NOT ILIKE '%(SELECT auth%';

  IF remaining_issues > 0 THEN
    RAISE NOTICE '⚠️ Still have % policies with unoptimized auth function calls', remaining_issues;
  ELSE
    RAISE NOTICE '✅ All RLS policies optimized with (SELECT auth.uid())';
  END IF;
END $$;
