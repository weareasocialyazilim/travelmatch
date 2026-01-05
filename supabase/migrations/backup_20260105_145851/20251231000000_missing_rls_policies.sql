-- ============================================
-- SECURITY AUDIT: Complete RLS Policy Fix
-- Date: 2025-12-31
-- Issue: Missing RLS on 14 tables + orphan table cleanup
-- ============================================
-- This migration ensures all sensitive tables have proper
-- Row Level Security policies and cleans up any orphan tables.
-- ============================================

BEGIN;

-- ============================================
-- 1. CLEANUP: Remove orphan 'used_' table if exists
-- This table appears to be from a failed migration
-- ============================================

DO $$
BEGIN
  -- Check for orphan 'used_' table (not 'used_2fa_codes')
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'used_'
  ) THEN
    -- Log and drop the orphan table
    RAISE NOTICE 'Found orphan table "used_" - removing...';
    DROP TABLE IF EXISTS public.used_;
    RAISE NOTICE '✅ Orphan table "used_" removed';
  ELSE
    RAISE NOTICE '✅ No orphan "used_" table found';
  END IF;
END $$;

-- ============================================
-- 2. FINANCIAL CONFIGURATION TABLES
-- Read-only for authenticated users
-- ============================================

-- currencies - Exchange rate reference data
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'currencies') THEN
    -- Enable RLS
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'currencies' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ currencies: RLS enabled';
    END IF;

    -- Create read-only policy for authenticated users
    DROP POLICY IF EXISTS "currencies_read_authenticated" ON public.currencies;
    CREATE POLICY "currencies_read_authenticated" ON public.currencies
      FOR SELECT TO authenticated USING (true);

    -- Service role full access
    DROP POLICY IF EXISTS "currencies_service_role_all" ON public.currencies;
    CREATE POLICY "currencies_service_role_all" ON public.currencies
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    RAISE NOTICE '✅ currencies: Policies created';
  END IF;
END $$;

-- exchange_rates - Currency conversion rates
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'exchange_rates') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'exchange_rates' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ exchange_rates: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "exchange_rates_read_authenticated" ON public.exchange_rates;
    CREATE POLICY "exchange_rates_read_authenticated" ON public.exchange_rates
      FOR SELECT TO authenticated USING (true);

    DROP POLICY IF EXISTS "exchange_rates_service_role_all" ON public.exchange_rates;
    CREATE POLICY "exchange_rates_service_role_all" ON public.exchange_rates
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    RAISE NOTICE '✅ exchange_rates: Policies created';
  END IF;
END $$;

-- payment_limits - Global payment limits (read-only)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_limits') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'payment_limits' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.payment_limits ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ payment_limits: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "payment_limits_read_authenticated" ON public.payment_limits;
    CREATE POLICY "payment_limits_read_authenticated" ON public.payment_limits
      FOR SELECT TO authenticated USING (true);

    DROP POLICY IF EXISTS "payment_limits_service_role_all" ON public.payment_limits;
    CREATE POLICY "payment_limits_service_role_all" ON public.payment_limits
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    RAISE NOTICE '✅ payment_limits: Policies created';
  END IF;
END $$;

-- user_limits - Per-user limits (users can only read their own)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_limits') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'user_limits' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ user_limits: RLS enabled';
    END IF;

    -- user_limits is a config table (no user_id column)
    -- All authenticated users can read active limits
    DROP POLICY IF EXISTS "user_limits_read_own" ON public.user_limits;
    CREATE POLICY "user_limits_read_authenticated" ON public.user_limits
      FOR SELECT TO authenticated USING (is_active = true);

    -- Service role full access for management
    DROP POLICY IF EXISTS "user_limits_service_role_all" ON public.user_limits;
    CREATE POLICY "user_limits_service_role_all" ON public.user_limits
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    RAISE NOTICE '✅ user_limits: Policies created';
  END IF;
END $$;

-- ============================================
-- 3. SECURITY/ADMIN TABLES
-- Restricted to service_role only
-- ============================================

-- aml_thresholds - Anti-Money Laundering configuration
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'aml_thresholds') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'aml_thresholds' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.aml_thresholds ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ aml_thresholds: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "aml_thresholds_service_role_only" ON public.aml_thresholds;
    CREATE POLICY "aml_thresholds_service_role_only" ON public.aml_thresholds
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    RAISE NOTICE '✅ aml_thresholds: Service role policy created';
  END IF;
END $$;

-- fraud_rules - Fraud detection rules
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fraud_rules') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'fraud_rules' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.fraud_rules ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ fraud_rules: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "fraud_rules_service_role_only" ON public.fraud_rules;
    CREATE POLICY "fraud_rules_service_role_only" ON public.fraud_rules
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    RAISE NOTICE '✅ fraud_rules: Service role policy created';
  END IF;
END $$;

-- kyc_thresholds - KYC verification thresholds
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'kyc_thresholds') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'kyc_thresholds' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.kyc_thresholds ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ kyc_thresholds: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "kyc_thresholds_service_role_only" ON public.kyc_thresholds;
    CREATE POLICY "kyc_thresholds_service_role_only" ON public.kyc_thresholds
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    RAISE NOTICE '✅ kyc_thresholds: Service role policy created';
  END IF;
END $$;

-- escrow_thresholds - Escrow configuration
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'escrow_thresholds') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'escrow_thresholds' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.escrow_thresholds ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ escrow_thresholds: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "escrow_thresholds_service_role_only" ON public.escrow_thresholds;
    CREATE POLICY "escrow_thresholds_service_role_only" ON public.escrow_thresholds
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    RAISE NOTICE '✅ escrow_thresholds: Service role policy created';
  END IF;
END $$;

-- currency_buffer_config - Currency buffer settings
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'currency_buffer_config') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'currency_buffer_config' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.currency_buffer_config ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ currency_buffer_config: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "currency_buffer_config_service_role_only" ON public.currency_buffer_config;
    CREATE POLICY "currency_buffer_config_service_role_only" ON public.currency_buffer_config
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    RAISE NOTICE '✅ currency_buffer_config: Service role policy created';
  END IF;
END $$;

-- ============================================
-- 4. AUDIT/LOGGING TABLES
-- Restricted to service_role only
-- ============================================

-- admin_audit_logs - Admin action audit trail
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_audit_logs') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'admin_audit_logs' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ admin_audit_logs: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "admin_audit_logs_service_role_only" ON public.admin_audit_logs;
    CREATE POLICY "admin_audit_logs_service_role_only" ON public.admin_audit_logs
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    RAISE NOTICE '✅ admin_audit_logs: Service role policy created';
  END IF;
END $$;

-- cdn_invalidation_logs - CDN cache invalidation logs
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cdn_invalidation_logs') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'cdn_invalidation_logs' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.cdn_invalidation_logs ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ cdn_invalidation_logs: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "cdn_invalidation_logs_service_role_only" ON public.cdn_invalidation_logs;
    CREATE POLICY "cdn_invalidation_logs_service_role_only" ON public.cdn_invalidation_logs
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    RAISE NOTICE '✅ cdn_invalidation_logs: Service role policy created';
  END IF;
END $$;

-- sensitive_data_access_log - PII access audit log
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sensitive_data_access_log') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'sensitive_data_access_log' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.sensitive_data_access_log ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ sensitive_data_access_log: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "sensitive_data_access_log_service_role_only" ON public.sensitive_data_access_log;
    CREATE POLICY "sensitive_data_access_log_service_role_only" ON public.sensitive_data_access_log
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    RAISE NOTICE '✅ sensitive_data_access_log: Service role policy created';
  END IF;
END $$;

-- suspicious_activity_reports - SAR reports
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'suspicious_activity_reports') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'suspicious_activity_reports' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.suspicious_activity_reports ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ suspicious_activity_reports: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "suspicious_activity_reports_service_role_only" ON public.suspicious_activity_reports;
    CREATE POLICY "suspicious_activity_reports_service_role_only" ON public.suspicious_activity_reports
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    RAISE NOTICE '✅ suspicious_activity_reports: Service role policy created';
  END IF;
END $$;

-- ============================================
-- 5. VERIFICATION
-- ============================================

DO $$
DECLARE
  v_missing_rls TEXT[] := '{}';
  v_table TEXT;
  v_protected_tables TEXT[] := ARRAY[
    'currencies', 'exchange_rates', 'payment_limits', 'user_limits',
    'aml_thresholds', 'fraud_rules', 'kyc_thresholds', 'escrow_thresholds',
    'currency_buffer_config', 'admin_audit_logs', 'cdn_invalidation_logs',
    'sensitive_data_access_log', 'suspicious_activity_reports'
  ];
  v_total_protected INT := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS VERIFICATION REPORT';
  RAISE NOTICE '========================================';

  FOREACH v_table IN ARRAY v_protected_tables
  LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = v_table) THEN
      IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = v_table AND n.nspname = 'public' AND c.relrowsecurity = true
      ) THEN
        v_total_protected := v_total_protected + 1;
      ELSE
        v_missing_rls := array_append(v_missing_rls, v_table);
      END IF;
    END IF;
  END LOOP;

  IF array_length(v_missing_rls, 1) > 0 THEN
    RAISE WARNING '❌ Tables STILL missing RLS: %', v_missing_rls;
    RAISE EXCEPTION 'Security validation failed - RLS not enabled on all required tables';
  ELSE
    RAISE NOTICE '✅ SUCCESS: All % sensitive tables now have RLS enabled', v_total_protected;
  END IF;

  -- Check for orphan tables
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'used_') THEN
    RAISE WARNING '⚠️ Orphan table "used_" still exists';
  ELSE
    RAISE NOTICE '✅ No orphan tables found';
  END IF;

  RAISE NOTICE '========================================';
END $$;

COMMIT;
