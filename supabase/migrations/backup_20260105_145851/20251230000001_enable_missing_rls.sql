-- ============================================
-- SECURITY AUDIT FIX: Enable Missing RLS
-- Date: 2025-12-30
-- Audit: Security Deep Dive (OWASP Top 10)
-- Issue: P0 - 13 Tables Missing RLS
-- ============================================
-- This migration enables Row Level Security on tables
-- that were previously unprotected, exposing sensitive
-- financial and security configuration data.
-- ============================================

BEGIN;

-- ============================================
-- 1. FINANCIAL CONFIGURATION TABLES
-- These are read-only for authenticated users
-- ============================================

-- currencies - Exchange rate reference data
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'currencies') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                   WHERE c.relname = 'currencies' AND n.nspname = 'public' AND c.relrowsecurity = true) THEN
      ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ currencies: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "Read currencies" ON currencies;
    CREATE POLICY "Read currencies" ON currencies
      FOR SELECT TO authenticated USING (true);
    RAISE NOTICE '✅ currencies: Read policy created';
  END IF;
END $$;

-- exchange_rates - Currency conversion rates
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'exchange_rates') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                   WHERE c.relname = 'exchange_rates' AND n.nspname = 'public' AND c.relrowsecurity = true) THEN
      ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ exchange_rates: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "Read exchange rates" ON exchange_rates;
    CREATE POLICY "Read exchange rates" ON exchange_rates
      FOR SELECT TO authenticated USING (true);
    RAISE NOTICE '✅ exchange_rates: Read policy created';
  END IF;
END $$;

-- payment_limits - Global payment limits (read-only)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_limits') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                   WHERE c.relname = 'payment_limits' AND n.nspname = 'public' AND c.relrowsecurity = true) THEN
      ALTER TABLE payment_limits ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ payment_limits: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "Read payment limits" ON payment_limits;
    CREATE POLICY "Read payment limits" ON payment_limits
      FOR SELECT TO authenticated USING (true);
    RAISE NOTICE '✅ payment_limits: Read policy created';
  END IF;
END $$;

-- user_limits - Global limit configuration (all authenticated can read)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_limits') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                   WHERE c.relname = 'user_limits' AND n.nspname = 'public' AND c.relrowsecurity = true) THEN
      ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ user_limits: RLS enabled';
    END IF;

    -- Note: user_limits is a config table without user_id column
    -- All authenticated users can read active limits
    DROP POLICY IF EXISTS "Users read own limits" ON user_limits;
    CREATE POLICY "Authenticated can read limits" ON user_limits
      FOR SELECT TO authenticated USING (is_active = true);

    DROP POLICY IF EXISTS "Service role manages user limits" ON user_limits;
    CREATE POLICY "Service role manages user limits" ON user_limits
      FOR ALL TO service_role USING (true) WITH CHECK (true);
    RAISE NOTICE '✅ user_limits: Policies created';
  END IF;
END $$;

-- ============================================
-- 2. SECURITY/ADMIN TABLES
-- These are restricted to service_role only
-- ============================================

-- aml_thresholds - Anti-Money Laundering configuration
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'aml_thresholds') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                   WHERE c.relname = 'aml_thresholds' AND n.nspname = 'public' AND c.relrowsecurity = true) THEN
      ALTER TABLE aml_thresholds ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ aml_thresholds: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "Service role only" ON aml_thresholds;
    CREATE POLICY "Service role only" ON aml_thresholds
      FOR ALL TO service_role USING (true) WITH CHECK (true);
    RAISE NOTICE '✅ aml_thresholds: Service role policy created';
  END IF;
END $$;

-- fraud_rules - Fraud detection rules
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fraud_rules') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                   WHERE c.relname = 'fraud_rules' AND n.nspname = 'public' AND c.relrowsecurity = true) THEN
      ALTER TABLE fraud_rules ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ fraud_rules: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "Service role only" ON fraud_rules;
    CREATE POLICY "Service role only" ON fraud_rules
      FOR ALL TO service_role USING (true) WITH CHECK (true);
    RAISE NOTICE '✅ fraud_rules: Service role policy created';
  END IF;
END $$;

-- kyc_thresholds - KYC verification thresholds
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'kyc_thresholds') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                   WHERE c.relname = 'kyc_thresholds' AND n.nspname = 'public' AND c.relrowsecurity = true) THEN
      ALTER TABLE kyc_thresholds ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ kyc_thresholds: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "Service role only" ON kyc_thresholds;
    CREATE POLICY "Service role only" ON kyc_thresholds
      FOR ALL TO service_role USING (true) WITH CHECK (true);
    RAISE NOTICE '✅ kyc_thresholds: Service role policy created';
  END IF;
END $$;

-- escrow_thresholds - Escrow configuration
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'escrow_thresholds') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                   WHERE c.relname = 'escrow_thresholds' AND n.nspname = 'public' AND c.relrowsecurity = true) THEN
      ALTER TABLE escrow_thresholds ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ escrow_thresholds: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "Service role only" ON escrow_thresholds;
    CREATE POLICY "Service role only" ON escrow_thresholds
      FOR ALL TO service_role USING (true) WITH CHECK (true);
    RAISE NOTICE '✅ escrow_thresholds: Service role policy created';
  END IF;
END $$;

-- currency_buffer_config - Currency buffer settings
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'currency_buffer_config') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                   WHERE c.relname = 'currency_buffer_config' AND n.nspname = 'public' AND c.relrowsecurity = true) THEN
      ALTER TABLE currency_buffer_config ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ currency_buffer_config: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "Service role only" ON currency_buffer_config;
    CREATE POLICY "Service role only" ON currency_buffer_config
      FOR ALL TO service_role USING (true) WITH CHECK (true);
    RAISE NOTICE '✅ currency_buffer_config: Service role policy created';
  END IF;
END $$;

-- ============================================
-- 3. AUDIT/LOGGING TABLES
-- These are restricted to service_role only
-- ============================================

-- admin_audit_logs - Admin action audit trail
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_audit_logs') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                   WHERE c.relname = 'admin_audit_logs' AND n.nspname = 'public' AND c.relrowsecurity = true) THEN
      ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ admin_audit_logs: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "Service role only" ON admin_audit_logs;
    CREATE POLICY "Service role only" ON admin_audit_logs
      FOR ALL TO service_role USING (true) WITH CHECK (true);
    RAISE NOTICE '✅ admin_audit_logs: Service role policy created';
  END IF;
END $$;

-- cdn_invalidation_logs - CDN cache invalidation logs
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cdn_invalidation_logs') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                   WHERE c.relname = 'cdn_invalidation_logs' AND n.nspname = 'public' AND c.relrowsecurity = true) THEN
      ALTER TABLE cdn_invalidation_logs ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ cdn_invalidation_logs: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "Service role only" ON cdn_invalidation_logs;
    CREATE POLICY "Service role only" ON cdn_invalidation_logs
      FOR ALL TO service_role USING (true) WITH CHECK (true);
    RAISE NOTICE '✅ cdn_invalidation_logs: Service role policy created';
  END IF;
END $$;

-- sensitive_data_access_log - PII access audit log
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sensitive_data_access_log') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                   WHERE c.relname = 'sensitive_data_access_log' AND n.nspname = 'public' AND c.relrowsecurity = true) THEN
      ALTER TABLE sensitive_data_access_log ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ sensitive_data_access_log: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "Service role only" ON sensitive_data_access_log;
    CREATE POLICY "Service role only" ON sensitive_data_access_log
      FOR ALL TO service_role USING (true) WITH CHECK (true);
    RAISE NOTICE '✅ sensitive_data_access_log: Service role policy created';
  END IF;
END $$;

-- suspicious_activity_reports - SAR reports
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'suspicious_activity_reports') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                   WHERE c.relname = 'suspicious_activity_reports' AND n.nspname = 'public' AND c.relrowsecurity = true) THEN
      ALTER TABLE suspicious_activity_reports ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '✅ suspicious_activity_reports: RLS enabled';
    END IF;

    DROP POLICY IF EXISTS "Service role only" ON suspicious_activity_reports;
    CREATE POLICY "Service role only" ON suspicious_activity_reports
      FOR ALL TO service_role USING (true) WITH CHECK (true);
    RAISE NOTICE '✅ suspicious_activity_reports: Service role policy created';
  END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  v_missing_rls TEXT[] := '{}';
  v_table TEXT;
  v_tables TEXT[] := ARRAY[
    'currencies', 'exchange_rates', 'payment_limits', 'user_limits',
    'aml_thresholds', 'fraud_rules', 'kyc_thresholds', 'escrow_thresholds',
    'currency_buffer_config', 'admin_audit_logs', 'cdn_invalidation_logs',
    'sensitive_data_access_log', 'suspicious_activity_reports'
  ];
BEGIN
  FOREACH v_table IN ARRAY v_tables
  LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = v_table) THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = v_table AND n.nspname = 'public' AND c.relrowsecurity = true
      ) THEN
        v_missing_rls := array_append(v_missing_rls, v_table);
      END IF;
    END IF;
  END LOOP;

  IF array_length(v_missing_rls, 1) > 0 THEN
    RAISE WARNING '⚠️ Tables still missing RLS: %', v_missing_rls;
  ELSE
    RAISE NOTICE '✅ All 13 tables now have RLS enabled';
  END IF;
END $$;

COMMIT;
