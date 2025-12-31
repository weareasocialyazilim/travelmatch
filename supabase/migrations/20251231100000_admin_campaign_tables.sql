-- Admin Panel Campaign & Notification Tables
-- Migration: 20251231100000_admin_campaign_tables
-- Purpose: Add missing tables for admin panel campaigns and notifications management

-- =====================================================
-- NOTIFICATION CAMPAIGNS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('push', 'email', 'sms', 'in_app')),
  target_audience JSONB DEFAULT '{}',  -- { segment: 'all' | 'active' | 'inactive', filters: {} }
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for notification_campaigns
CREATE INDEX idx_notification_campaigns_status ON notification_campaigns(status);
CREATE INDEX idx_notification_campaigns_type ON notification_campaigns(type);
CREATE INDEX idx_notification_campaigns_scheduled ON notification_campaigns(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_notification_campaigns_created_at ON notification_campaigns(created_at DESC);

-- =====================================================
-- MARKETING CAMPAIGNS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('promo', 'referral', 'seasonal', 'partnership', 'retention', 'acquisition')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  target_audience JSONB DEFAULT '{}',  -- { segment: 'all' | 'new' | 'returning', filters: {} }
  budget NUMERIC(12, 2) DEFAULT 0,
  spent NUMERIC(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  start_date DATE,
  end_date DATE,
  -- Performance metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue NUMERIC(12, 2) DEFAULT 0,
  -- Campaign content
  banner_url TEXT,
  landing_url TEXT,
  promo_code TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping', NULL)),
  discount_value NUMERIC(10, 2),
  -- Tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for marketing_campaigns
CREATE INDEX idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_marketing_campaigns_type ON marketing_campaigns(type);
CREATE INDEX idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);
CREATE INDEX idx_marketing_campaigns_promo_code ON marketing_campaigns(promo_code) WHERE promo_code IS NOT NULL;
CREATE INDEX idx_marketing_campaigns_created_at ON marketing_campaigns(created_at DESC);

-- =====================================================
-- PROMO CODES TABLE (for campaign tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order_amount NUMERIC(10, 2) DEFAULT 0,
  max_discount_amount NUMERIC(10, 2),
  usage_limit INTEGER,  -- NULL means unlimited
  used_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  applicable_to JSONB DEFAULT '{}',  -- { categories: [], products: [], users: [] }
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for promo_codes
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_campaign ON promo_codes(campaign_id);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active) WHERE is_active = true;
CREATE INDEX idx_promo_codes_validity ON promo_codes(valid_from, valid_until);

-- =====================================================
-- PROMO CODE USAGE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID,  -- Reference to orders table if exists
  discount_amount NUMERIC(10, 2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(promo_code_id, user_id, order_id)
);

-- Indexes for promo_code_usage
CREATE INDEX idx_promo_code_usage_code ON promo_code_usage(promo_code_id);
CREATE INDEX idx_promo_code_usage_user ON promo_code_usage(user_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE notification_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

-- Notification Campaigns Policies
CREATE POLICY "notification_campaigns_select_authenticated"
  ON notification_campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "notification_campaigns_insert_admin"
  ON notification_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'Admin'
    )
  );

CREATE POLICY "notification_campaigns_update_admin"
  ON notification_campaigns FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'Admin'
    )
  );

CREATE POLICY "notification_campaigns_delete_admin"
  ON notification_campaigns FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'Admin'
    )
  );

-- Marketing Campaigns Policies
CREATE POLICY "marketing_campaigns_select_authenticated"
  ON marketing_campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "marketing_campaigns_insert_admin"
  ON marketing_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'Admin'
    )
  );

CREATE POLICY "marketing_campaigns_update_admin"
  ON marketing_campaigns FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'Admin'
    )
  );

CREATE POLICY "marketing_campaigns_delete_admin"
  ON marketing_campaigns FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'Admin'
    )
  );

-- Promo Codes Policies (public read for active codes)
CREATE POLICY "promo_codes_select_public"
  ON promo_codes FOR SELECT
  TO authenticated
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'Admin'
  ));

CREATE POLICY "promo_codes_insert_admin"
  ON promo_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'Admin'
    )
  );

CREATE POLICY "promo_codes_update_admin"
  ON promo_codes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'Admin'
    )
  );

-- Promo Code Usage Policies
CREATE POLICY "promo_code_usage_select_own"
  ON promo_code_usage FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'Admin'
  ));

CREATE POLICY "promo_code_usage_insert_own"
  ON promo_code_usage FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_campaigns_updated_at
  BEFORE UPDATE ON notification_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPFUL FUNCTIONS
-- =====================================================

-- Function to validate and apply promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_user_id UUID,
  p_order_amount NUMERIC DEFAULT 0
)
RETURNS TABLE (
  is_valid BOOLEAN,
  promo_code_id UUID,
  discount_type TEXT,
  discount_value NUMERIC,
  final_discount NUMERIC,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_promo promo_codes%ROWTYPE;
  v_user_usage_count INTEGER;
  v_final_discount NUMERIC;
BEGIN
  -- Find the promo code
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE code = UPPER(p_code)
    AND is_active = true
    AND (valid_from IS NULL OR valid_from <= now())
    AND (valid_until IS NULL OR valid_until >= now());

  IF v_promo.id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, 'Invalid or expired promo code';
    RETURN;
  END IF;

  -- Check usage limit
  IF v_promo.usage_limit IS NOT NULL AND v_promo.used_count >= v_promo.usage_limit THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, 'Promo code usage limit reached';
    RETURN;
  END IF;

  -- Check per-user limit
  SELECT COUNT(*) INTO v_user_usage_count
  FROM promo_code_usage
  WHERE promo_code_id = v_promo.id AND user_id = p_user_id;

  IF v_promo.per_user_limit IS NOT NULL AND v_user_usage_count >= v_promo.per_user_limit THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, 'You have already used this promo code';
    RETURN;
  END IF;

  -- Check minimum order amount
  IF p_order_amount < v_promo.min_order_amount THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, 
      format('Minimum order amount is %s', v_promo.min_order_amount);
    RETURN;
  END IF;

  -- Calculate discount
  CASE v_promo.discount_type
    WHEN 'percentage' THEN
      v_final_discount := p_order_amount * (v_promo.discount_value / 100);
    WHEN 'fixed' THEN
      v_final_discount := v_promo.discount_value;
    ELSE
      v_final_discount := 0;
  END CASE;

  -- Apply max discount cap
  IF v_promo.max_discount_amount IS NOT NULL AND v_final_discount > v_promo.max_discount_amount THEN
    v_final_discount := v_promo.max_discount_amount;
  END IF;

  RETURN QUERY SELECT 
    true,
    v_promo.id,
    v_promo.discount_type,
    v_promo.discount_value,
    v_final_discount,
    NULL::TEXT;
END;
$$;

-- Function to increment promo code usage count
CREATE OR REPLACE FUNCTION increment_promo_code_usage(promo_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE promo_codes
  SET used_count = used_count + 1
  WHERE id = promo_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION validate_promo_code(TEXT, UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_promo_code_usage(UUID) TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE notification_campaigns IS 'Stores push/email/SMS notification campaigns for admin panel';
COMMENT ON TABLE marketing_campaigns IS 'Stores marketing campaigns with budget tracking and metrics';
COMMENT ON TABLE promo_codes IS 'Stores promotional codes linked to marketing campaigns';
COMMENT ON TABLE promo_code_usage IS 'Tracks promo code usage per user';
COMMENT ON FUNCTION validate_promo_code IS 'Validates and calculates discount for a promo code';
COMMENT ON FUNCTION increment_promo_code_usage IS 'Increments the used_count for a promo code';
