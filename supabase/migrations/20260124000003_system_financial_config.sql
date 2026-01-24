-- ============================================
-- System Financial Configuration Table
-- Migration: 20260124000003_system_financial_config.sql
-- ============================================
--
-- PURPOSE: Centralized configuration for financial parameters
-- - Withdrawal approval thresholds
-- - Exchange rate bounds
-- - Commission rate overrides (for VIP/special cases)
-- - Transaction limits
-- ============================================

-- 1. Create System Config Table
CREATE TABLE IF NOT EXISTS system_financial_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('withdrawal', 'exchange', 'commission', 'limits')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert Default Configurations
INSERT INTO system_financial_config (config_key, config_value, description, category) VALUES
  -- Withdrawal Approval Thresholds
  ('withdrawal_approval_threshold', '{"amount": 1000, "currency": "LVND"}'::jsonb,
   'Withdrawals above this amount require manual approval', 'withdrawal'),

  ('withdrawal_min_amount', '{"amount": 50, "currency": "LVND"}'::jsonb,
   'Minimum withdrawal amount', 'withdrawal'),

  ('withdrawal_max_amount', '{"amount": 50000, "currency": "LVND"}'::jsonb,
   'Maximum single withdrawal amount', 'withdrawal'),

  -- Exchange Rate Validation
  ('lvnd_to_try_rate_bounds', '{"min": 0.5, "max": 2.0, "expected": 1.0}'::jsonb,
   'Acceptable bounds for LVND to TRY exchange rate', 'exchange'),

  ('rate_staleness_threshold', '{"hours": 2}'::jsonb,
   'Hours before exchange rate is considered stale', 'exchange'),

  -- Commission Rate Defaults (used when DB lookup fails)
  ('commission_rate_fallback', '{"basic": 0.15, "premium": 0.10, "platinum": 0.05}'::jsonb,
   'Fallback commission rates by tier', 'commission'),

  -- Transaction Limits
  ('daily_withdrawal_limit', '{"basic": 5000, "premium": 20000, "platinum": 100000}'::jsonb,
   'Daily withdrawal limits by tier (LVND)', 'limits'),

  ('monthly_withdrawal_limit', '{"basic": 50000, "premium": 200000, "platinum": 1000000}'::jsonb,
   'Monthly withdrawal limits by tier (LVND)', 'limits')

ON CONFLICT (config_key) DO NOTHING;

-- 3. Helper Function: Get Config Value
CREATE OR REPLACE FUNCTION get_financial_config(
  p_config_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_value JSONB;
BEGIN
  SELECT config_value INTO v_value
  FROM system_financial_config
  WHERE config_key = p_config_key
    AND is_active = TRUE;

  IF v_value IS NULL THEN
    RAISE EXCEPTION 'Config key not found or inactive: %', p_config_key;
  END IF;

  RETURN v_value;
END;
$$;

-- 4. Helper Function: Get Approval Threshold
CREATE OR REPLACE FUNCTION get_withdrawal_approval_threshold()
RETURNS DECIMAL(20,2)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_config JSONB;
  v_threshold DECIMAL(20,2);
BEGIN
  v_config := get_financial_config('withdrawal_approval_threshold');
  v_threshold := (v_config->>'amount')::DECIMAL(20,2);

  RETURN v_threshold;
END;
$$;

-- 5. Auto-Update Timestamp Trigger
CREATE OR REPLACE FUNCTION update_system_financial_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS system_financial_config_updated_at ON system_financial_config;
CREATE TRIGGER system_financial_config_updated_at
  BEFORE UPDATE ON system_financial_config
  FOR EACH ROW
  EXECUTE FUNCTION update_system_financial_config_timestamp();

-- 6. RLS Policies
ALTER TABLE system_financial_config ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access
DROP POLICY IF EXISTS "Service role full access to financial config" ON system_financial_config;
CREATE POLICY "Service role full access to financial config"
  ON system_financial_config
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read (for transparency)
DROP POLICY IF EXISTS "Authenticated users can read financial config" ON system_financial_config;
CREATE POLICY "Authenticated users can read financial config"
  ON system_financial_config
  FOR SELECT
  TO authenticated
  USING (true);

-- 7. Grants
GRANT SELECT ON system_financial_config TO authenticated;
GRANT ALL ON system_financial_config TO service_role;
GRANT EXECUTE ON FUNCTION get_financial_config TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_withdrawal_approval_threshold TO authenticated, service_role;

-- 8. Comments
COMMENT ON TABLE system_financial_config IS 'Centralized storage for financial system parameters (thresholds, limits, rates)';
COMMENT ON FUNCTION get_financial_config IS 'Fetch active financial configuration by key';
COMMENT ON FUNCTION get_withdrawal_approval_threshold IS 'Get current withdrawal approval threshold (convenience wrapper)';

-- 9. Indexes
CREATE INDEX IF NOT EXISTS idx_system_financial_config_key ON system_financial_config(config_key) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_system_financial_config_category ON system_financial_config(category) WHERE is_active = TRUE;
