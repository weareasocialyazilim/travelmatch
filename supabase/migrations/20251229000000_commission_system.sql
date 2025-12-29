-- ============================================
-- TravelMatch Komisyon Sistemi
-- Migration: 20251229000000_commission_system.sql
-- ============================================
--
-- Komisyon Yapısı:
-- - $0-30:   %10 toplam (%7 giver + %3 receiver)
-- - $30-100: %10 toplam (%7 giver + %3 receiver)
-- - $100+:   %8 toplam (%5.6 giver + %2.4 receiver)
--
-- VIP/Influencer:
-- - Komisyon %100 giver'dan alınır
-- - Receiver hiç komisyon ödemez
-- ============================================

-- ============================================
-- 1. COMMISSION TIERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS commission_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  min_amount DECIMAL(10,2) NOT NULL,
  max_amount DECIMAL(10,2), -- NULL = unlimited
  total_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.10 = 10%
  giver_share DECIMAL(5,4) NOT NULL DEFAULT 0.70, -- 70% of total
  receiver_share DECIMAL(5,4) NOT NULL DEFAULT 0.30, -- 30% of total
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_rate CHECK (total_rate >= 0 AND total_rate <= 1),
  CONSTRAINT valid_shares CHECK (giver_share + receiver_share = 1),
  CONSTRAINT valid_range CHECK (max_amount IS NULL OR max_amount > min_amount)
);

-- Insert default tiers (70/30 split: Giver pays 70%, Receiver pays 30%)
INSERT INTO commission_tiers (name, min_amount, max_amount, total_rate, giver_share, receiver_share) VALUES
  ('low', 0, 30, 0.10, 0.70, 0.30),      -- $0-30: 10% total (7% giver, 3% receiver)
  ('medium', 30, 100, 0.10, 0.70, 0.30), -- $30-100: 10% total (7% giver, 3% receiver)
  ('high', 100, NULL, 0.08, 0.70, 0.30)  -- $100+: 8% total (5.6% giver, 2.4% receiver)
ON CONFLICT (name) DO UPDATE SET
  min_amount = EXCLUDED.min_amount,
  max_amount = EXCLUDED.max_amount,
  total_rate = EXCLUDED.total_rate,
  giver_share = EXCLUDED.giver_share,
  receiver_share = EXCLUDED.receiver_share;

CREATE INDEX IF NOT EXISTS idx_commission_tiers_range ON commission_tiers(min_amount, max_amount);

-- ============================================
-- 2. USER COMMISSION SETTINGS TABLE
-- ============================================

-- User account types for commission purposes
DO $$ BEGIN
  CREATE TYPE user_account_type AS ENUM (
    'standard',      -- Normal users - split commission
    'vip',           -- VIP users - giver pays all
    'influencer',    -- Influencers - giver pays all
    'partner',       -- Business partners - custom rates
    'exempt'         -- Exempt from commission (internal use)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS user_commission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- Account type
  account_type user_account_type NOT NULL DEFAULT 'standard',

  -- Custom commission (overrides tier rates if set)
  custom_rate_enabled BOOLEAN DEFAULT FALSE,
  custom_total_rate DECIMAL(5,4), -- NULL = use tier rate
  custom_giver_share DECIMAL(5,4) DEFAULT 1.0, -- VIP: 100% from giver
  custom_receiver_share DECIMAL(5,4) DEFAULT 0.0, -- VIP: 0% from receiver

  -- VIP/Influencer info
  vip_since TIMESTAMPTZ,
  vip_reason TEXT,
  vip_expires_at TIMESTAMPTZ, -- NULL = permanent

  -- Influencer verification
  social_platform TEXT, -- instagram, tiktok, youtube, twitter
  social_handle TEXT,
  follower_count INTEGER,
  verified_at TIMESTAMPTZ,
  verified_by UUID,

  -- Escrow settings
  escrow_hours INTEGER DEFAULT 168, -- 7 days default
  fast_release_enabled BOOLEAN DEFAULT FALSE,

  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,

  CONSTRAINT valid_custom_shares CHECK (
    NOT custom_rate_enabled OR
    (custom_giver_share + custom_receiver_share = 1)
  )
);

CREATE INDEX IF NOT EXISTS idx_user_commission_user_id ON user_commission_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_commission_account_type ON user_commission_settings(account_type);
CREATE INDEX IF NOT EXISTS idx_user_commission_vip ON user_commission_settings(account_type)
  WHERE account_type IN ('vip', 'influencer');

-- ============================================
-- 3. COMMISSION LEDGER TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS commission_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Transaction references
  escrow_id UUID REFERENCES escrow_transactions(id),
  gift_id UUID,
  moment_id UUID REFERENCES moments(id),

  -- Parties
  giver_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),

  -- Amounts
  base_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',

  -- Commission breakdown
  tier_name TEXT NOT NULL,
  total_rate DECIMAL(5,4) NOT NULL,
  total_commission DECIMAL(10,2) NOT NULL,

  giver_commission DECIMAL(10,2) NOT NULL,
  receiver_commission DECIMAL(10,2) NOT NULL,
  platform_revenue DECIMAL(10,2) NOT NULL,

  -- What parties actually pay/receive
  giver_pays DECIMAL(10,2) NOT NULL, -- base_amount + giver_commission
  receiver_gets DECIMAL(10,2) NOT NULL, -- base_amount - receiver_commission

  -- Account type at time of transaction
  receiver_account_type user_account_type NOT NULL DEFAULT 'standard',
  was_vip_transaction BOOLEAN DEFAULT FALSE,
  is_direct_pay BOOLEAN DEFAULT FALSE,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'collected', 'transferred', 'refunded', 'failed')
  ),

  -- PayTR integration
  paytr_merchant_oid TEXT,
  paytr_transfer_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  collected_at TIMESTAMPTZ,
  transferred_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_commission_ledger_escrow ON commission_ledger(escrow_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_gift ON commission_ledger(gift_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_giver ON commission_ledger(giver_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_receiver ON commission_ledger(receiver_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_status ON commission_ledger(status);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_created ON commission_ledger(created_at DESC);

-- ============================================
-- 4. GIFTS TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giver_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),
  moment_id UUID REFERENCES moments(id),

  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',

  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'completed', 'refunded', 'cancelled')
  ),

  -- Proof requirement tracking
  proof_requirement TEXT DEFAULT 'required',
  proof_requested_by_giver BOOLEAN DEFAULT FALSE,
  is_direct_pay BOOLEAN DEFAULT FALSE,
  direct_pay_transferred_at TIMESTAMPTZ,

  message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  CONSTRAINT valid_gift_amount CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_gifts_giver ON gifts(giver_id);
CREATE INDEX IF NOT EXISTS idx_gifts_receiver ON gifts(receiver_id);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);

-- ============================================
-- 5. COMMISSION CALCULATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION calculate_commission(
  p_amount DECIMAL,
  p_receiver_id UUID,
  p_currency TEXT DEFAULT 'TRY'
)
RETURNS TABLE (
  tier_name TEXT,
  total_rate DECIMAL,
  total_commission DECIMAL,
  giver_commission DECIMAL,
  receiver_commission DECIMAL,
  giver_pays DECIMAL,
  receiver_gets DECIMAL,
  is_vip BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_tier RECORD;
  v_user_settings RECORD;
  v_total_rate DECIMAL;
  v_giver_share DECIMAL;
  v_receiver_share DECIMAL;
  v_is_vip BOOLEAN := FALSE;
BEGIN
  -- Get user commission settings
  SELECT * INTO v_user_settings
  FROM user_commission_settings
  WHERE user_id = p_receiver_id;

  -- Check if VIP/Influencer (giver pays all)
  IF v_user_settings.account_type IN ('vip', 'influencer') THEN
    v_is_vip := TRUE;
    -- Check if VIP has expired
    IF v_user_settings.vip_expires_at IS NOT NULL
       AND v_user_settings.vip_expires_at < NOW() THEN
      v_is_vip := FALSE;
    END IF;
  END IF;

  -- Get applicable tier
  SELECT * INTO v_tier
  FROM commission_tiers
  WHERE is_active = TRUE
    AND min_amount <= p_amount
    AND (max_amount IS NULL OR max_amount > p_amount)
  LIMIT 1;

  -- Default tier if none found
  IF v_tier IS NULL THEN
    v_tier.name := 'default';
    v_tier.total_rate := 0.10;
    v_tier.giver_share := 0.70;
    v_tier.receiver_share := 0.30;
  END IF;

  -- Determine rates
  IF v_user_settings.custom_rate_enabled AND v_user_settings.custom_total_rate IS NOT NULL THEN
    v_total_rate := v_user_settings.custom_total_rate;
    v_giver_share := v_user_settings.custom_giver_share;
    v_receiver_share := v_user_settings.custom_receiver_share;
  ELSIF v_is_vip THEN
    v_total_rate := v_tier.total_rate;
    v_giver_share := 1.0; -- Giver pays 100%
    v_receiver_share := 0.0; -- Receiver pays 0%
  ELSE
    v_total_rate := v_tier.total_rate;
    v_giver_share := v_tier.giver_share;
    v_receiver_share := v_tier.receiver_share;
  END IF;

  -- Calculate commissions
  RETURN QUERY SELECT
    v_tier.name::TEXT,
    v_total_rate,
    ROUND((p_amount * v_total_rate)::NUMERIC, 2),
    ROUND((p_amount * v_total_rate * v_giver_share)::NUMERIC, 2),
    ROUND((p_amount * v_total_rate * v_receiver_share)::NUMERIC, 2),
    ROUND((p_amount + (p_amount * v_total_rate * v_giver_share))::NUMERIC, 2),
    ROUND((p_amount - (p_amount * v_total_rate * v_receiver_share))::NUMERIC, 2),
    v_is_vip;
END;
$$;

-- ============================================
-- 6. GET ESCROW DURATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_escrow_duration_hours(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_trust_score DECIMAL;
  v_custom_hours INTEGER;
  v_account_type user_account_type;
BEGIN
  -- Check for custom setting first
  SELECT escrow_hours, account_type INTO v_custom_hours, v_account_type
  FROM user_commission_settings
  WHERE user_id = p_user_id;

  -- VIP/Influencers get faster release
  IF v_account_type IN ('vip', 'influencer') THEN
    RETURN COALESCE(v_custom_hours, 24); -- 24 hours for VIP
  END IF;

  IF v_custom_hours IS NOT NULL AND v_custom_hours > 0 THEN
    RETURN v_custom_hours;
  END IF;

  -- Get trust score
  SELECT trust_score INTO v_trust_score
  FROM profiles
  WHERE id = p_user_id;

  -- Dynamic duration based on trust
  IF v_trust_score >= 90 THEN
    RETURN 4;   -- 4 hours - excellent trust
  ELSIF v_trust_score >= 80 THEN
    RETURN 12;  -- 12 hours - very good
  ELSIF v_trust_score >= 70 THEN
    RETURN 24;  -- 24 hours - good
  ELSIF v_trust_score >= 50 THEN
    RETURN 72;  -- 3 days - moderate
  ELSE
    RETURN 168; -- 7 days - new/low trust
  END IF;
END;
$$;

-- ============================================
-- 7. CREATE GIFT WITH COMMISSION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION create_gift_with_commission(
  p_giver_id UUID,
  p_receiver_id UUID,
  p_moment_id UUID,
  p_base_amount DECIMAL,
  p_currency TEXT DEFAULT 'TRY'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_commission RECORD;
  v_user_settings RECORD;
  v_ledger_id UUID;
  v_gift_id UUID;
BEGIN
  -- Calculate commission
  SELECT * INTO v_commission
  FROM calculate_commission(p_base_amount, p_receiver_id, p_currency);

  -- Get receiver account type
  SELECT account_type INTO v_user_settings
  FROM user_commission_settings
  WHERE user_id = p_receiver_id;

  -- Create gift record
  INSERT INTO gifts (
    giver_id,
    receiver_id,
    moment_id,
    amount,
    currency,
    status
  ) VALUES (
    p_giver_id,
    p_receiver_id,
    p_moment_id,
    p_base_amount,
    p_currency,
    'pending'
  )
  RETURNING id INTO v_gift_id;

  -- Create commission ledger entry
  INSERT INTO commission_ledger (
    gift_id,
    moment_id,
    giver_id,
    receiver_id,
    base_amount,
    currency,
    tier_name,
    total_rate,
    total_commission,
    giver_commission,
    receiver_commission,
    platform_revenue,
    giver_pays,
    receiver_gets,
    receiver_account_type,
    was_vip_transaction,
    status
  ) VALUES (
    v_gift_id,
    p_moment_id,
    p_giver_id,
    p_receiver_id,
    p_base_amount,
    p_currency,
    v_commission.tier_name,
    v_commission.total_rate,
    v_commission.total_commission,
    v_commission.giver_commission,
    v_commission.receiver_commission,
    v_commission.total_commission, -- Platform gets total commission
    v_commission.giver_pays,
    v_commission.receiver_gets,
    COALESCE(v_user_settings, 'standard'),
    v_commission.is_vip,
    'pending'
  )
  RETURNING id INTO v_ledger_id;

  RETURN jsonb_build_object(
    'success', true,
    'gift_id', v_gift_id,
    'ledger_id', v_ledger_id,
    'base_amount', p_base_amount,
    'giver_pays', v_commission.giver_pays,
    'receiver_gets', v_commission.receiver_gets,
    'total_commission', v_commission.total_commission,
    'giver_commission', v_commission.giver_commission,
    'receiver_commission', v_commission.receiver_commission,
    'is_vip', v_commission.is_vip,
    'tier', v_commission.tier_name,
    'currency', p_currency
  );
END;
$$;

-- ============================================
-- 8. ADMIN VIP MANAGEMENT FUNCTIONS
-- ============================================

-- Set user as VIP/Influencer
CREATE OR REPLACE FUNCTION admin_set_user_vip(
  p_admin_id UUID,
  p_user_id UUID,
  p_account_type user_account_type,
  p_reason TEXT,
  p_social_platform TEXT DEFAULT NULL,
  p_social_handle TEXT DEFAULT NULL,
  p_follower_count INTEGER DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Upsert user commission settings
  INSERT INTO user_commission_settings (
    user_id,
    account_type,
    custom_rate_enabled,
    custom_giver_share,
    custom_receiver_share,
    vip_since,
    vip_reason,
    vip_expires_at,
    social_platform,
    social_handle,
    follower_count,
    verified_at,
    verified_by,
    created_by,
    updated_by
  ) VALUES (
    p_user_id,
    p_account_type,
    FALSE, -- Use tier rates, just change share split
    1.0,   -- Giver pays 100%
    0.0,   -- Receiver pays 0%
    NOW(),
    p_reason,
    p_expires_at,
    p_social_platform,
    p_social_handle,
    p_follower_count,
    NOW(),
    p_admin_id,
    p_admin_id,
    p_admin_id
  )
  ON CONFLICT (user_id) DO UPDATE SET
    account_type = EXCLUDED.account_type,
    custom_giver_share = 1.0,
    custom_receiver_share = 0.0,
    vip_since = COALESCE(user_commission_settings.vip_since, NOW()),
    vip_reason = EXCLUDED.vip_reason,
    vip_expires_at = EXCLUDED.vip_expires_at,
    social_platform = COALESCE(EXCLUDED.social_platform, user_commission_settings.social_platform),
    social_handle = COALESCE(EXCLUDED.social_handle, user_commission_settings.social_handle),
    follower_count = COALESCE(EXCLUDED.follower_count, user_commission_settings.follower_count),
    verified_at = NOW(),
    verified_by = p_admin_id,
    updated_at = NOW(),
    updated_by = p_admin_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'account_type', p_account_type,
    'vip_since', NOW(),
    'expires_at', p_expires_at
  );
END;
$$;

-- Remove VIP status
CREATE OR REPLACE FUNCTION admin_remove_user_vip(
  p_admin_id UUID,
  p_user_id UUID,
  p_reason TEXT DEFAULT 'Admin removal'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_old_type user_account_type;
BEGIN
  -- Get old type
  SELECT account_type INTO v_old_type
  FROM user_commission_settings
  WHERE user_id = p_user_id;

  -- Update to standard
  UPDATE user_commission_settings
  SET
    account_type = 'standard',
    custom_rate_enabled = FALSE,
    custom_giver_share = 0.70,
    custom_receiver_share = 0.30,
    updated_at = NOW(),
    updated_by = p_admin_id,
    notes = COALESCE(notes || E'\n', '') ||
            'VIP removed on ' || NOW()::TEXT || ': ' || p_reason
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'previous_type', v_old_type,
    'new_type', 'standard'
  );
END;
$$;

-- ============================================
-- 9. RLS POLICIES
-- ============================================

ALTER TABLE commission_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_commission_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- Commission tiers - readable by all authenticated
CREATE POLICY "Anyone can view commission tiers"
  ON commission_tiers FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- User commission settings - users can view own
CREATE POLICY "Users can view own commission settings"
  ON user_commission_settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Commission ledger - parties can view own
CREATE POLICY "Users can view own commission ledger"
  ON commission_ledger FOR SELECT
  TO authenticated
  USING (auth.uid() IN (giver_id, receiver_id));

-- Gifts - parties can view own
CREATE POLICY "Users can view own gifts"
  ON gifts FOR SELECT
  TO authenticated
  USING (auth.uid() IN (giver_id, receiver_id));

-- ============================================
-- 10. GRANTS
-- ============================================

GRANT SELECT ON commission_tiers TO authenticated;
GRANT SELECT ON user_commission_settings TO authenticated;
GRANT SELECT ON commission_ledger TO authenticated;
GRANT SELECT ON gifts TO authenticated;

GRANT EXECUTE ON FUNCTION calculate_commission TO authenticated;
GRANT EXECUTE ON FUNCTION create_gift_with_commission TO authenticated;
GRANT EXECUTE ON FUNCTION get_escrow_duration_hours TO authenticated;
GRANT EXECUTE ON FUNCTION admin_set_user_vip TO authenticated;
GRANT EXECUTE ON FUNCTION admin_remove_user_vip TO authenticated;

-- ============================================
-- 11. COMMENTS
-- ============================================

COMMENT ON TABLE commission_tiers IS 'Tiered commission rates based on transaction amount';
COMMENT ON TABLE user_commission_settings IS 'Per-user commission settings including VIP/Influencer status';
COMMENT ON TABLE commission_ledger IS 'Complete ledger of all commission calculations and collections';
COMMENT ON TABLE gifts IS 'Gift transactions between users';
COMMENT ON FUNCTION calculate_commission IS 'Calculate commission breakdown for a given amount and receiver';
COMMENT ON FUNCTION create_gift_with_commission IS 'Create a gift transaction with proper commission calculation';
COMMENT ON FUNCTION get_escrow_duration_hours IS 'Get dynamic escrow duration based on user trust score';
COMMENT ON FUNCTION admin_set_user_vip IS 'Admin function to set user as VIP/Influencer';
COMMENT ON FUNCTION admin_remove_user_vip IS 'Admin function to remove VIP status from user';
