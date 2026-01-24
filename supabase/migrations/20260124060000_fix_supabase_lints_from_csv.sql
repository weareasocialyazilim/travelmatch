-- =============================================================================
-- Fix Supabase Lints from CSV (Security + Performance)
-- Date: 2026-01-24
-- Purpose: Address lint warnings reported by Supabase CSV export
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1) SECURITY DEFINER VIEWS -> SECURITY INVOKER
-- =============================================================================

DROP VIEW IF EXISTS public.view_moderation_queue;
CREATE OR REPLACE VIEW public.view_moderation_queue
WITH (security_invoker = true) AS
SELECT 
    m.id AS moment_id,
    m.title,
    m.user_id,
    COALESCE(u.email, 'Unknown') AS username,
    CASE WHEN array_length(m.images, 1) > 0 THEN m.images[1] ELSE NULL END AS media_url,
    m.created_at,
    m.is_approved,
    m.is_hidden,
    m.ai_moderation_score,
    m.ai_moderation_labels
FROM 
    public.moments m
LEFT JOIN 
    public.users u ON m.user_id = u.id
WHERE 
    m.is_approved = false 
    OR m.is_hidden = true
ORDER BY 
    m.created_at DESC;

GRANT SELECT ON public.view_moderation_queue TO authenticated;
GRANT SELECT ON public.view_moderation_queue TO service_role;

DROP VIEW IF EXISTS public.view_financial_health;
CREATE OR REPLACE VIEW public.view_financial_health
WITH (security_invoker = true) AS
WITH EscrowStats AS (
    SELECT
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_escrow_volume,
        COALESCE(SUM(CASE WHEN escrow_status = 'locked' THEN amount ELSE 0 END), 0) as active_escrow_balance
    FROM 
        public.transactions
    WHERE
        status = 'completed' OR escrow_status = 'locked'
),
WalletStats AS (
    SELECT
        COALESCE(SUM(coins_balance), 0) as total_user_balance,
        COALESCE(SUM(pending_balance), 0) as total_pending_balance
    FROM
        public.wallets
)
SELECT
    e.total_transactions,
    e.total_escrow_volume,
    e.active_escrow_balance,
    w.total_user_balance,
    w.total_pending_balance,
    NOW() as last_updated
FROM
    EscrowStats e,
    WalletStats w;

GRANT SELECT ON public.view_financial_health TO authenticated;
GRANT SELECT ON public.view_financial_health TO service_role;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_safety'
  ) THEN
    DROP VIEW IF EXISTS public.admin_moderation_inbox;
    CREATE OR REPLACE VIEW public.admin_moderation_inbox
    WITH (security_invoker = true) AS
    SELECT 
        u.id as user_id,
        u.full_name,
        us.risk_score,
        us.status as moderation_status,
        u.created_at,
        'high_risk' as trigger_type,
        jsonb_build_object('score', us.risk_score) as details,
        (SELECT COUNT(*) FROM public.reports r WHERE r.reported_user_id = u.id) as report_count,
        NOW() as updated_at
    FROM public.users u
    JOIN public.user_safety us ON us.user_id = u.id
    WHERE us.risk_score >= 80 AND us.status NOT IN ('permanent_ban')

    UNION ALL

    SELECT 
        r.reported_user_id as user_id,
        u.full_name,
        us.risk_score,
        us.status as moderation_status,
        u.created_at,
        'reported' as trigger_type,
        jsonb_build_object('reason', r.reason, 'report_id', r.id) as details,
        (SELECT COUNT(*) FROM public.reports rep WHERE rep.reported_user_id = u.id) as report_count,
        r.created_at as updated_at
    FROM public.reports r
    JOIN public.users u ON u.id = r.reported_user_id
    JOIN public.user_safety us ON us.user_id = u.id
    WHERE r.status = 'pending';

    GRANT SELECT ON public.admin_moderation_inbox TO authenticated;
    GRANT SELECT ON public.admin_moderation_inbox TO service_role;
  ELSE
    RAISE NOTICE 'admin_moderation_inbox view skipped: public.user_safety not found.';
  END IF;
END $$;

-- =============================================================================
-- 2) RLS DISABLED IN PUBLIC: spatial_ref_sys (best effort)
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'spatial_ref_sys'
  ) THEN
    BEGIN
      ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "spatial_ref_sys_read" ON public.spatial_ref_sys;
      CREATE POLICY "spatial_ref_sys_read"
        ON public.spatial_ref_sys
        FOR SELECT
        USING (true);
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE 'spatial_ref_sys RLS not enabled (insufficient privileges).';
    END;
  END IF;
END $$;

-- =============================================================================
-- 3) RLS ENABLED NO POLICY: add minimal policies
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_request_stats') THEN
    DROP POLICY IF EXISTS "daily_request_stats_service_only" ON public.daily_request_stats;
    CREATE POLICY "daily_request_stats_service_only"
      ON public.daily_request_stats
      FOR ALL TO service_role
      USING ((select auth.jwt()) ->> 'role' = 'service_role')
      WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'table_growth_stats') THEN
    DROP POLICY IF EXISTS "table_growth_stats_service_only" ON public.table_growth_stats;
    CREATE POLICY "table_growth_stats_service_only"
      ON public.table_growth_stats
      FOR ALL TO service_role
      USING ((select auth.jwt()) ->> 'role' = 'service_role')
      WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deferred_links') THEN
    DROP POLICY IF EXISTS "deferred_links_service_only" ON public.deferred_links;
    CREATE POLICY "deferred_links_service_only"
      ON public.deferred_links
      FOR ALL TO service_role
      USING ((select auth.jwt()) ->> 'role' = 'service_role')
      WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invites') THEN
    DROP POLICY IF EXISTS "invites_select_own" ON public.invites;
    DROP POLICY IF EXISTS "invites_insert_own" ON public.invites;
    DROP POLICY IF EXISTS "invites_delete_own" ON public.invites;

    CREATE POLICY "invites_select_own"
      ON public.invites
      FOR SELECT TO authenticated
      USING (creator_id = (select auth.uid()));

    CREATE POLICY "invites_insert_own"
      ON public.invites
      FOR INSERT TO authenticated
      WITH CHECK (creator_id = (select auth.uid()));

    CREATE POLICY "invites_delete_own"
      ON public.invites
      FOR DELETE TO authenticated
      USING (creator_id = (select auth.uid()));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'moderation_actions') THEN
    DROP POLICY IF EXISTS "moderation_actions_admin_select" ON public.moderation_actions;
    DROP POLICY IF EXISTS "moderation_actions_service_insert" ON public.moderation_actions;

    CREATE POLICY "moderation_actions_admin_select"
      ON public.moderation_actions
      FOR SELECT
      USING (
        (select auth.jwt()) ->> 'role' = 'service_role'
        OR EXISTS (
          SELECT 1 FROM public.admin_users au
          WHERE au.id = (select auth.uid())
          AND au.is_active = true
        )
      );

    CREATE POLICY "moderation_actions_service_insert"
      ON public.moderation_actions
      FOR INSERT
      WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profile_views') THEN
    DROP POLICY IF EXISTS "profile_views_select_own" ON public.profile_views;
    DROP POLICY IF EXISTS "profile_views_insert_own" ON public.profile_views;

    CREATE POLICY "profile_views_select_own"
      ON public.profile_views
      FOR SELECT TO authenticated
      USING (viewer_id = (select auth.uid()));

    CREATE POLICY "profile_views_insert_own"
      ON public.profile_views
      FOR INSERT TO authenticated
      WITH CHECK (viewer_id = (select auth.uid()));
  END IF;
END $$;

-- =============================================================================
-- 4) AUTH RLS INITPLAN FIXES (wrap auth.* with SELECT)
-- =============================================================================

-- KYC
DROP POLICY IF EXISTS "Users can view own KYC" ON public.kyc_verifications;
CREATE POLICY "Users can view own KYC"
  ON public.kyc_verifications
  FOR SELECT
  USING (user_id = (select auth.uid()));

-- Moments visibility (guard if helper function is missing)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'is_user_safe'
      AND pg_get_function_identity_arguments(p.oid) = 'uuid'
  ) THEN
    DROP POLICY IF EXISTS "Moments visibility" ON public.moments;
    CREATE POLICY "Moments visibility"
      ON public.moments
      FOR SELECT
      USING (
        (select auth.uid()) = user_id
        OR public.is_user_safe(moments.user_id)
      );
  ELSE
    RAISE NOTICE 'Moments visibility policy skipped: public.is_user_safe(UUID) not found.';
  END IF;
END $$;

-- Story views
DROP POLICY IF EXISTS "story_views_select_own" ON public.story_views;
CREATE POLICY "story_views_select_own"
  ON public.story_views
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "story_views_insert_own" ON public.story_views;
CREATE POLICY "story_views_insert_own"
  ON public.story_views
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "story_views_select_story_owner" ON public.story_views;
CREATE POLICY "story_views_select_story_owner"
  ON public.story_views
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.stories s
      WHERE s.id = story_id AND s.user_id = (select auth.uid())
    )
  );

-- admin_users: verify by email
DROP POLICY IF EXISTS "Authenticated users can verify admin status by email" ON public.admin_users;
CREATE POLICY "Authenticated users can verify admin status by email"
  ON public.admin_users FOR SELECT
  USING (
    email = ((select auth.jwt()) ->> 'email')
    AND is_active = true
  );

-- email_logs
DROP POLICY IF EXISTS "Service role full access to email_logs" ON public.email_logs;
CREATE POLICY "Service role full access to email_logs"
  ON public.email_logs
  FOR ALL
  USING ((select auth.jwt()) ->> 'role' = 'service_role')
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');

-- ml_analytics
DROP POLICY IF EXISTS "ml_analytics_service_only" ON public.ml_analytics;
CREATE POLICY "ml_analytics_service_only"
  ON public.ml_analytics
  FOR ALL
  USING ((select auth.jwt()) ->> 'role' = 'service_role');

-- ai_anomalies
DROP POLICY IF EXISTS "ai_anomalies_admin_select" ON public.ai_anomalies;
DROP POLICY IF EXISTS "ai_anomalies_admin_update" ON public.ai_anomalies;
DROP POLICY IF EXISTS "ai_anomalies_service_insert" ON public.ai_anomalies;

CREATE POLICY "ai_anomalies_admin_select"
  ON public.ai_anomalies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.id = (select auth.uid())
    )
  );

CREATE POLICY "ai_anomalies_admin_update"
  ON public.ai_anomalies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.id = (select auth.uid())
    )
  );

CREATE POLICY "ai_anomalies_service_insert"
  ON public.ai_anomalies
  FOR INSERT
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');

-- ab_experiments
DROP POLICY IF EXISTS "ab_experiments_admin_all" ON public.ab_experiments;
CREATE POLICY "ab_experiments_admin_all"
  ON public.ab_experiments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.id = (select auth.uid())
    )
  );

-- ab_assignments
DROP POLICY IF EXISTS "ab_assignments_service_all" ON public.ab_assignments;
DROP POLICY IF EXISTS "ab_assignments_user_select" ON public.ab_assignments;
DROP POLICY IF EXISTS "ab_assignments_select" ON public.ab_assignments;
DROP POLICY IF EXISTS "ab_assignments_insert" ON public.ab_assignments;
DROP POLICY IF EXISTS "ab_assignments_update" ON public.ab_assignments;
DROP POLICY IF EXISTS "ab_assignments_delete" ON public.ab_assignments;

CREATE POLICY "ab_assignments_select"
  ON public.ab_assignments
  FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR (select auth.jwt()) ->> 'role' = 'service_role'
  );

CREATE POLICY "ab_assignments_insert"
  ON public.ab_assignments
  FOR INSERT
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');

CREATE POLICY "ab_assignments_update"
  ON public.ab_assignments
  FOR UPDATE
  USING ((select auth.jwt()) ->> 'role' = 'service_role');

CREATE POLICY "ab_assignments_delete"
  ON public.ab_assignments
  FOR DELETE
  USING ((select auth.jwt()) ->> 'role' = 'service_role');

-- recommendation_feedback
DROP POLICY IF EXISTS "recommendation_feedback_service_all" ON public.recommendation_feedback;
DROP POLICY IF EXISTS "recommendation_feedback_user_all" ON public.recommendation_feedback;
DROP POLICY IF EXISTS "recommendation_feedback_select" ON public.recommendation_feedback;
DROP POLICY IF EXISTS "recommendation_feedback_insert" ON public.recommendation_feedback;
DROP POLICY IF EXISTS "recommendation_feedback_update" ON public.recommendation_feedback;
DROP POLICY IF EXISTS "recommendation_feedback_delete" ON public.recommendation_feedback;

CREATE POLICY "recommendation_feedback_select"
  ON public.recommendation_feedback
  FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR (select auth.jwt()) ->> 'role' = 'service_role'
  );

CREATE POLICY "recommendation_feedback_insert"
  ON public.recommendation_feedback
  FOR INSERT
  WITH CHECK (
    user_id = (select auth.uid())
    OR (select auth.jwt()) ->> 'role' = 'service_role'
  );

CREATE POLICY "recommendation_feedback_update"
  ON public.recommendation_feedback
  FOR UPDATE
  USING (
    user_id = (select auth.uid())
    OR (select auth.jwt()) ->> 'role' = 'service_role'
  );

CREATE POLICY "recommendation_feedback_delete"
  ON public.recommendation_feedback
  FOR DELETE
  USING (
    user_id = (select auth.uid())
    OR (select auth.jwt()) ->> 'role' = 'service_role'
  );

-- chatbot_conversations
DROP POLICY IF EXISTS "chatbot_conversations_service_all" ON public.chatbot_conversations;
DROP POLICY IF EXISTS "chatbot_conversations_user_select" ON public.chatbot_conversations;
DROP POLICY IF EXISTS "chatbot_conversations_select" ON public.chatbot_conversations;
DROP POLICY IF EXISTS "chatbot_conversations_insert" ON public.chatbot_conversations;
DROP POLICY IF EXISTS "chatbot_conversations_update" ON public.chatbot_conversations;

CREATE POLICY "chatbot_conversations_select"
  ON public.chatbot_conversations
  FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR (select auth.jwt()) ->> 'role' = 'service_role'
  );

CREATE POLICY "chatbot_conversations_insert"
  ON public.chatbot_conversations
  FOR INSERT
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');

CREATE POLICY "chatbot_conversations_update"
  ON public.chatbot_conversations
  FOR UPDATE
  USING ((select auth.jwt()) ->> 'role' = 'service_role');

-- chatbot_messages
DROP POLICY IF EXISTS "chatbot_messages_service_all" ON public.chatbot_messages;
DROP POLICY IF EXISTS "chatbot_messages_user_select" ON public.chatbot_messages;
DROP POLICY IF EXISTS "chatbot_messages_select" ON public.chatbot_messages;
DROP POLICY IF EXISTS "chatbot_messages_insert" ON public.chatbot_messages;
DROP POLICY IF EXISTS "chatbot_messages_update" ON public.chatbot_messages;
DROP POLICY IF EXISTS "chatbot_messages_delete" ON public.chatbot_messages;

CREATE POLICY "chatbot_messages_select"
  ON public.chatbot_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chatbot_conversations cc
      WHERE cc.id = chatbot_messages.conversation_id
      AND cc.user_id = (select auth.uid())
    )
    OR (select auth.jwt()) ->> 'role' = 'service_role'
  );

CREATE POLICY "chatbot_messages_insert"
  ON public.chatbot_messages
  FOR INSERT
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');

CREATE POLICY "chatbot_messages_update"
  ON public.chatbot_messages
  FOR UPDATE
  USING ((select auth.jwt()) ->> 'role' = 'service_role');

CREATE POLICY "chatbot_messages_delete"
  ON public.chatbot_messages
  FOR DELETE
  USING ((select auth.jwt()) ->> 'role' = 'service_role');

-- price_predictions_cache
DROP POLICY IF EXISTS "price_predictions_cache_service_only" ON public.price_predictions_cache;
CREATE POLICY "price_predictions_cache_service_only"
  ON public.price_predictions_cache
  FOR ALL
  USING ((select auth.jwt()) ->> 'role' = 'service_role');

-- alert_rules, active_alerts, alert_history
DROP POLICY IF EXISTS "Service role full access to alert_rules" ON public.alert_rules;
CREATE POLICY "Service role full access to alert_rules"
  ON public.alert_rules FOR ALL
  USING ((select auth.jwt()) ->> 'role' = 'service_role')
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access to active_alerts" ON public.active_alerts;
CREATE POLICY "Service role full access to active_alerts"
  ON public.active_alerts FOR ALL
  USING ((select auth.jwt()) ->> 'role' = 'service_role')
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access to alert_history" ON public.alert_history;
CREATE POLICY "Service role full access to alert_history"
  ON public.alert_history FOR ALL
  USING ((select auth.jwt()) ->> 'role' = 'service_role')
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');

-- demand_forecasts
DROP POLICY IF EXISTS "demand_forecasts_admin_select" ON public.demand_forecasts;
DROP POLICY IF EXISTS "demand_forecasts_service_all" ON public.demand_forecasts;
DROP POLICY IF EXISTS "demand_forecasts_select" ON public.demand_forecasts;
DROP POLICY IF EXISTS "demand_forecasts_modify" ON public.demand_forecasts;

CREATE POLICY "demand_forecasts_select"
  ON public.demand_forecasts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.id = (select auth.uid())
      AND au.is_active = true
    )
  );

CREATE POLICY "demand_forecasts_modify"
  ON public.demand_forecasts
  FOR ALL
  USING ((select auth.jwt()) ->> 'role' = 'service_role');

-- user_preference_vectors
DROP POLICY IF EXISTS "user_preference_vectors_service_all" ON public.user_preference_vectors;
DROP POLICY IF EXISTS "user_preference_vectors_user_select" ON public.user_preference_vectors;
DROP POLICY IF EXISTS "user_preference_vectors_select" ON public.user_preference_vectors;
DROP POLICY IF EXISTS "user_preference_vectors_modify" ON public.user_preference_vectors;

CREATE POLICY "user_preference_vectors_select"
  ON public.user_preference_vectors
  FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR (select auth.jwt()) ->> 'role' = 'service_role'
  );

CREATE POLICY "user_preference_vectors_modify"
  ON public.user_preference_vectors
  FOR ALL
  USING ((select auth.jwt()) ->> 'role' = 'service_role');

-- moderation_logs
DROP POLICY IF EXISTS "moderation_logs_service_insert" ON public.moderation_logs;
DROP POLICY IF EXISTS "moderation_logs_admin_select" ON public.moderation_logs;

CREATE POLICY "moderation_logs_service_insert" ON public.moderation_logs
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "moderation_logs_admin_select" ON public.moderation_logs
  FOR SELECT
  USING (
    (select auth.role()) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE email = ((select auth.jwt()) ->> 'email') AND is_active = TRUE
    )
  );

-- blocked_content
DROP POLICY IF EXISTS "blocked_content_user_select" ON public.blocked_content;
DROP POLICY IF EXISTS "blocked_content_admin_all" ON public.blocked_content;
DROP POLICY IF EXISTS "blocked_content_service_insert" ON public.blocked_content;

CREATE POLICY "blocked_content_user_select" ON public.blocked_content
  FOR SELECT
  USING (user_id = (select auth.uid()));

CREATE POLICY "blocked_content_admin_all" ON public.blocked_content
  FOR ALL
  USING (
    (select auth.role()) = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE email = ((select auth.jwt()) ->> 'email') AND is_active = TRUE
    )
  );

CREATE POLICY "blocked_content_service_insert" ON public.blocked_content
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'service_role');

-- integration_health_events / internal_error_log
DROP POLICY IF EXISTS "System can insert health events" ON public.integration_health_events;
CREATE POLICY "System can insert health events"
  ON public.integration_health_events
  FOR INSERT
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "System can insert error logs" ON public.internal_error_log;
CREATE POLICY "System can insert error logs"
  ON public.internal_error_log
  FOR INSERT
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');

-- uploaded_images
DROP POLICY IF EXISTS "Service role can insert uploads" ON public.uploaded_images;
CREATE POLICY "Service role can insert uploads"
  ON public.uploaded_images
  FOR INSERT
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');

-- =============================================================================
-- 5) FUNCTION SEARCH_PATH FIXES (dynamic)
-- =============================================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS func
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'hash_tc_kimlik',
        'update_email_logs_updated_at',
        'hash_iban',
        'ensure_single_default_card',
        'mask_phone',
        'archive_resolved_alert',
        'get_transactions_keyset',
        'transfer_funds',
        'deposit_funds',
        'get_moments_keyset',
        'mask_iban',
        'update_alert_rules_updated_at',
        'mask_card_number',
        'update_kyc_updated_at',
        'withdraw_funds',
        'hash_phone',
        'generate_case_number',
        'update_updated_at_column',
        'update_active_alerts_updated_at',
        'get_notifications_keyset',
        'update_wallet_timestamp',
        'get_messages_keyset'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', r.func);
  END LOOP;
END $$;

-- =============================================================================
-- 6) UNINDEXED FOREIGN KEYS (guarded)
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ab_experiments') THEN
    CREATE INDEX IF NOT EXISTS idx_ab_experiments_created_by
      ON public.ab_experiments(created_by);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appeals') THEN
    CREATE INDEX IF NOT EXISTS idx_appeals_reviewed_by
      ON public.appeals(reviewed_by);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coin_transactions') THEN
    CREATE INDEX IF NOT EXISTS idx_coin_transactions_sender_id
      ON public.coin_transactions(sender_id);

    CREATE INDEX IF NOT EXISTS idx_coin_transactions_recipient_id
      ON public.coin_transactions(recipient_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deferred_links') THEN
    CREATE INDEX IF NOT EXISTS idx_deferred_links_claimed_by
      ON public.deferred_links(claimed_by);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'moderation_actions') THEN
    CREATE INDEX IF NOT EXISTS idx_moderation_actions_admin_id
      ON public.moderation_actions(admin_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profile_views') THEN
    CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_id
      ON public.profile_views(viewed_id);
  END IF;
END $$;

-- =============================================================================
-- 7) UNUSED INDEXES (drop if present)
-- =============================================================================

DROP INDEX IF EXISTS public.idx_reports_created_at;
DROP INDEX IF EXISTS public.idx_reports_status;

DROP INDEX IF EXISTS public.idx_escrow_idempotency_escrow;
DROP INDEX IF EXISTS public.idx_escrow_idempotency_expires;

DROP INDEX IF EXISTS public.idx_report_actions_report_id;
DROP INDEX IF EXISTS public.idx_wallet_transactions_created_at;

DROP INDEX IF EXISTS public.idx_alerts_status;
DROP INDEX IF EXISTS public.idx_alerts_severity;
DROP INDEX IF EXISTS public.idx_alerts_created_at;

DROP INDEX IF EXISTS public.idx_fraud_cases_severity;
DROP INDEX IF EXISTS public.idx_fraud_cases_created_at;
DROP INDEX IF EXISTS public.idx_fraud_evidence_case_id;

DROP INDEX IF EXISTS public.idx_users_is_discoverable;
DROP INDEX IF EXISTS public.idx_users_city;
DROP INDEX IF EXISTS public.idx_users_acquisition_source;
DROP INDEX IF EXISTS public.idx_users_trust_score;
DROP INDEX IF EXISTS public.idx_users_risk_score;
DROP INDEX IF EXISTS public.idx_users_moderation_status;

DROP INDEX IF EXISTS public.idx_vip_users_tier;
DROP INDEX IF EXISTS public.idx_vip_users_is_active;

DROP INDEX IF EXISTS public.idx_discount_codes_code;
DROP INDEX IF EXISTS public.idx_discount_codes_is_active;

DROP INDEX IF EXISTS public.idx_notification_campaigns_scheduled_at;

DROP INDEX IF EXISTS public.idx_escrow_gift_id;
DROP INDEX IF EXISTS public.idx_escrow_transactions_original_currency;
DROP INDEX IF EXISTS public.idx_escrow_transactions_recipient_id;
DROP INDEX IF EXISTS public.idx_escrow_transactions_released_by;
DROP INDEX IF EXISTS public.idx_escrow_transactions_sender_id;
DROP INDEX IF EXISTS public.idx_escrow_transactions_settlement_currency;

DROP INDEX IF EXISTS public.idx_exchange_rates_target_currency;
DROP INDEX IF EXISTS public.idx_fraud_alerts_escrow_id;
DROP INDEX IF EXISTS public.idx_gifts_original_currency;
DROP INDEX IF EXISTS public.idx_moments_moderated_by;

DROP INDEX IF EXISTS public.idx_payment_disputes_commission_ledger_id;
DROP INDEX IF EXISTS public.idx_payment_disputes_gift_id;
DROP INDEX IF EXISTS public.idx_payment_transactions_card_id;

DROP INDEX IF EXISTS public.idx_trust_notes_escrow_id;
DROP INDEX IF EXISTS public.idx_user_badges_badge_id;
DROP INDEX IF EXISTS public.idx_conversations_participant_ids_gin;
DROP INDEX IF EXISTS public.idx_withdrawal_requests_bank_account_id;

DROP INDEX IF EXISTS public.idx_requests_user_id;
DROP INDEX IF EXISTS public.idx_requests_moment_id;
DROP INDEX IF EXISTS public.idx_stories_expires_at;
DROP INDEX IF EXISTS public.idx_story_views_story_id;

DROP INDEX IF EXISTS public.idx_commission_tiers_range;
DROP INDEX IF EXISTS public.idx_ml_analytics_endpoint;
DROP INDEX IF EXISTS public.idx_ml_analytics_created_at;
DROP INDEX IF EXISTS public.idx_ai_anomalies_type;
DROP INDEX IF EXISTS public.idx_ai_anomalies_severity;
DROP INDEX IF EXISTS public.idx_ai_anomalies_resolved;
DROP INDEX IF EXISTS public.idx_ab_experiments_status;
DROP INDEX IF EXISTS public.idx_ab_experiments_created_at;

-- =============================================================================
-- 8) EXTENSIONS IN PUBLIC SCHEMA -> move to extensions (best effort)
-- =============================================================================

DO $$
BEGIN
  CREATE SCHEMA IF NOT EXISTS extensions;

  BEGIN
    ALTER EXTENSION postgis SET SCHEMA extensions;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'postgis extension move skipped (insufficient privileges).';
    WHEN feature_not_supported THEN
      RAISE NOTICE 'postgis extension move skipped (not supported by extension).';
    WHEN undefined_object THEN
      RAISE NOTICE 'postgis extension move skipped (extension not installed).';
  END;

  BEGIN
    ALTER EXTENSION pg_trgm SET SCHEMA extensions;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'pg_trgm extension move skipped (insufficient privileges).';
    WHEN feature_not_supported THEN
      RAISE NOTICE 'pg_trgm extension move skipped (not supported by extension).';
    WHEN undefined_object THEN
      RAISE NOTICE 'pg_trgm extension move skipped (extension not installed).';
  END;
END $$;

COMMIT;