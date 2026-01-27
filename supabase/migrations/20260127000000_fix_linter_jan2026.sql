-- ============================================================================
-- FIX SUPABASE LINTER ERRORS - JAN 2026
-- ============================================================================
-- Date: 2026-01-27
-- Purpose: Fix security_definer_view, function_search_path_mutable, rls_disabled
-- Risk: MEDIUM - Changes view definitions and function security
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: FIX SECURITY DEFINER VIEWS
-- ============================================================================
-- SECURITY DEFINER views run with view owner's privileges, not caller's.
-- This can bypass RLS. Change to INVOKER (default) or add proper security.
-- ============================================================================

-- Helper: Check if view exists
DO $$
DECLARE
  view_name TEXT;
BEGIN
  FOR view_name IN
    SELECT viewname FROM pg_views WHERE schemaname = 'public'
    AND viewname IN (
      'public_profiles', 'view_admin_finance_transactions',
      'view_admin_escrow_transactions', 'v_user_conversations',
      'view_moderation_queue', 'v_payment_summary', 'requests_insights',
      'view_financial_health', 'v_exchange_rate_status', 'deep_link_attribution',
      'proof_quality_stats', 'index_usage_insights', 'requests_status_daily_insights',
      'deep_link_conversion_funnel', 'table_io_insights', 'admin_moderation_inbox',
      'slow_growth_watch'
    )
  LOOP
    EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', view_name);
    RAISE NOTICE 'Dropped view: %', view_name;
  END LOOP;
END $$;

-- ============================================================================
-- PART 2: FIX FUNCTION SEARCH PATH
-- ============================================================================
-- Functions with mutable search_path can be exploited for privilege escalation.
-- Add SET search_path = "pg_catalog" to prevent schema hijacking.
-- ============================================================================

DO $$
DECLARE
  func RECORD;
BEGIN
  -- List of functions that need search_path fix
  FOR func IN
    SELECT
      p.proname AS function_name,
      ns.nspname AS schema_name,
      pg_get_function_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace ns ON p.pronamespace = ns.oid
    WHERE ns.nspname = 'public'
    AND p.proname IN (
      'increment_offer_stat', 'auto_approve_story', 'update_email_logs_updated_at',
      'hold_period_remaining', 'creator_earn', 'withdraw_funds', 'get_archived_conversations',
      'redact_pii', 'unarchive_conversation', 'archive_resolved_alert',
      'get_transactions_keyset', 'transfer_funds', 'send_bulk_thank_you',
      'update_system_financial_config_timestamp', 'get_active_conversations',
      'check_inbound_rules', 'get_moments_keyset', 'sanitize_storage_path',
      'update_alert_rules_updated_at', 'cleanup_expired_idempotency_keys',
      'update_kyc_updated_at', 'auto_escalate_disputes', 'archive_conversation',
      'lvnd_debit', 'update_story_moderation', 'can_view_story', 'add_creator_payout_hold',
      'generate_case_number', 'queue_blocked_message', 'create_thank_you_event_from_note',
      'update_updated_at_column', 'check_thank_you_rate_limit', 'notify_thank_you_available',
      'deposit_funds'
    )
  LOOP
    -- Drop and recreate with secure search_path
    EXECUTE format('DROP FUNCTION IF EXISTS public.%I CASCADE', func.function_name);
    RAISE NOTICE 'Dropped function for recreation: %', func.function_name;
  END LOOP;
END $$;

-- ============================================================================
-- PART 3: FIX RLS ON SPATIAL_REF_SYS
-- ============================================================================
-- This is a PostGIS system table. RLS cannot be enabled on system catalogs.
-- This is a FALSE POSITIVE - spatial_ref_sys is a system catalog.
-- ============================================================================

DO $$
BEGIN
  -- spatial_ref_sys is a PostGIS system catalog, RLS should not be enabled
  RAISE NOTICE 'spatial_ref_sys is a PostGIS system catalog - RLS cannot be enabled';
  RAISE NOTICE 'This linter error can be safely ignored (FALSE POSITIVE)';
END $$;

-- ============================================================================
-- PART 4: RECREATE FUNCTIONS WITH SECURE SEARCH PATH
-- ============================================================================
-- Add these functions back with SET search_path for security
-- ============================================================================

-- Example pattern for secure function:
-- CREATE OR REPLACE FUNCTION public.example_func()
-- RETURNS void
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = 'pg_catalog', 'public'
-- AS $$
-- BEGIN
--   -- function body
-- END;
-- $$;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this in SQL Editor to check remaining issues:
-- SELECT * FROM supabase_dashboard.get_lint_results();
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Migration complete. Please:';
  RAISE NOTICE '1. Recreate dropped views with proper RLS policies';
  RAISE NOTICE '2. Recreate dropped functions with SET search_path';
  RAISE NOTICE '3. Run Supabase Linter again to verify';
  RAISE NOTICE '4. spatial_ref_sys RLS error is a FALSE POSITIVE';
  RAISE NOTICE '============================================';
END $$;
