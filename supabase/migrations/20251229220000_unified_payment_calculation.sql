-- ============================================
-- Lovendo Unified Payment System
-- Migration: 20251229220000_unified_payment_calculation.sql
-- ============================================
--
-- BU SİSTEM ŞUNLARI BİRLEŞTİRİR:
-- 1. Live exchange rates (saatlik güncelleme)
-- 2. Buffer (TRY için %5 enflasyon koruması)
-- 3. Tier-based commission (USD bazlı)
-- 4. Escrow rules (USD bazlı)
--
-- ÖNEMLİ:
-- - Buffer SADECE gönderen tarafında (alıcıya yansımaz)
-- - Komisyon oranları tier'a göre değişir
-- - Alıcı her zaman: (base_amount - receiver_commission) alır
-- ============================================

-- ============================================
-- 1. COMMISSION TIERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS commission_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  min_amount DECIMAL(10, 2) NOT NULL,
  max_amount DECIMAL(10, 2),  -- NULL = unlimited
  total_rate DECIMAL(5, 4) NOT NULL,  -- e.g., 0.10 for 10%
  giver_share DECIMAL(5, 4) NOT NULL DEFAULT 0.70,  -- 70% of commission from giver
  receiver_share DECIMAL(5, 4) NOT NULL DEFAULT 0.30,  -- 30% from receiver
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commission tiers (USD-based thresholds)
-- Note: description column removed as existing table doesn't have it
INSERT INTO commission_tiers (name, min_amount, max_amount, total_rate, giver_share, receiver_share) VALUES
  ('low', 0, 30, 0.10, 0.70, 0.30),
  ('medium', 30, 100, 0.10, 0.70, 0.30),
  ('high', 100, NULL, 0.08, 0.70, 0.30)
ON CONFLICT (name) DO UPDATE SET
  min_amount = EXCLUDED.min_amount,
  max_amount = EXCLUDED.max_amount,
  total_rate = EXCLUDED.total_rate,
  giver_share = EXCLUDED.giver_share,
  receiver_share = EXCLUDED.receiver_share;

-- ============================================
-- 2. USER COMMISSION SETTINGS (VIP/Influencer)
-- ============================================

CREATE TABLE IF NOT EXISTS user_commission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL DEFAULT 'standard' CHECK (account_type IN ('standard', 'vip', 'influencer', 'exempt')),
  custom_rate DECIMAL(5, 4),  -- Override commission rate
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Note: idx_user_commission_active index removed as is_active column doesn't exist
-- Account status is determined by account_type column instead

-- ============================================
-- 3. COMMISSION LEDGER
-- ============================================

CREATE TABLE IF NOT EXISTS commission_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID REFERENCES gifts(id),
  escrow_id UUID REFERENCES escrow_transactions(id),

  -- Amounts in moment currency
  base_amount DECIMAL(10, 2) NOT NULL,
  base_currency VARCHAR(3) NOT NULL REFERENCES currencies(code),

  -- Commission breakdown
  total_commission DECIMAL(10, 2) NOT NULL,
  giver_commission DECIMAL(10, 2) NOT NULL,
  receiver_commission DECIMAL(10, 2) NOT NULL,

  -- What each party pays/gets
  giver_pays DECIMAL(10, 2) NOT NULL,
  receiver_gets DECIMAL(10, 2) NOT NULL,

  -- TRY equivalents
  giver_pays_try DECIMAL(10, 2),
  receiver_gets_try DECIMAL(10, 2),

  -- Exchange rate info
  exchange_rate DECIMAL(18, 8),
  buffer_percentage DECIMAL(5, 2),

  -- Tier info
  tier_name TEXT,
  escrow_type TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commission_ledger_gift ON commission_ledger(gift_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_escrow ON commission_ledger(escrow_id);

-- ============================================
-- 4. UNIFIED PAYMENT CALCULATION
-- ============================================

CREATE OR REPLACE FUNCTION calculate_unified_payment(
  p_base_amount DECIMAL(10, 2),      -- Moment fiyatı
  p_moment_currency VARCHAR(3),       -- Moment para birimi (EUR, USD, etc.)
  p_user_currency VARCHAR(3) DEFAULT 'TRY',  -- Kullanıcının ödeme para birimi
  p_receiver_id UUID DEFAULT NULL     -- Alıcı ID (VIP kontrolü için)
)
RETURNS TABLE (
  -- Original amounts
  base_amount DECIMAL(10, 2),
  moment_currency VARCHAR(3),

  -- USD equivalent (for tier determination)
  amount_usd DECIMAL(10, 2),

  -- Commission details
  tier_name TEXT,
  commission_rate DECIMAL(5, 4),
  total_commission DECIMAL(10, 2),
  giver_commission DECIMAL(10, 2),
  receiver_commission DECIMAL(10, 2),

  -- Escrow details
  escrow_type TEXT,
  max_contributors INTEGER,

  -- Exchange rate details
  exchange_rate DECIMAL(18, 8),
  buffer_percentage DECIMAL(5, 2),
  rate_timestamp TIMESTAMPTZ,
  rate_is_stale BOOLEAN,

  -- FINAL AMOUNTS (what matters!)
  giver_pays_base DECIMAL(10, 2),     -- Base currency: amount + giver_commission
  giver_pays_try DECIMAL(10, 2),      -- TRY with buffer: (amount + giver_commission) × rate × (1 + buffer)
  giver_pays_display DECIMAL(10, 2),  -- User's currency
  giver_currency VARCHAR(3),

  receiver_gets DECIMAL(10, 2),       -- Base currency: amount - receiver_commission
  receiver_gets_try DECIMAL(10, 2),   -- TRY equivalent (no buffer!)
  receiver_currency VARCHAR(3)
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  -- Commission vars
  v_tier RECORD;
  v_user_settings RECORD;
  v_total_rate DECIMAL(5, 4);
  v_giver_share DECIMAL(5, 4);
  v_receiver_share DECIMAL(5, 4);
  v_total_commission DECIMAL(10, 2);
  v_giver_commission DECIMAL(10, 2);
  v_receiver_commission DECIMAL(10, 2);

  -- Escrow vars
  v_escrow RECORD;

  -- Exchange rate vars
  v_amount_usd DECIMAL(10, 2);
  v_rate_to_try DECIMAL(18, 8);
  v_rate_to_user DECIMAL(18, 8);
  v_buffer DECIMAL(5, 2);
  v_rate_timestamp TIMESTAMPTZ;
  v_is_stale BOOLEAN;

  -- Final amounts
  v_giver_pays_base DECIMAL(10, 2);
  v_giver_pays_try DECIMAL(10, 2);
  v_giver_pays_display DECIMAL(10, 2);
  v_receiver_gets DECIMAL(10, 2);
  v_receiver_gets_try DECIMAL(10, 2);
BEGIN
  -- ==========================================
  -- STEP 1: Convert to USD for tier determination
  -- ==========================================
  IF p_moment_currency = 'USD' THEN
    v_amount_usd := p_base_amount;
  ELSE
    v_amount_usd := ROUND(p_base_amount * get_exchange_rate(p_moment_currency, 'USD'), 2);
  END IF;

  -- ==========================================
  -- STEP 2: Get commission tier
  -- ==========================================
  SELECT * INTO v_tier
  FROM commission_tiers
  WHERE is_active = TRUE
    AND v_amount_usd >= min_amount
    AND (max_amount IS NULL OR v_amount_usd < max_amount)
  LIMIT 1;

  IF v_tier IS NULL THEN
    -- Default tier
    v_total_rate := 0.10;
    v_giver_share := 0.70;
    v_receiver_share := 0.30;
  ELSE
    v_total_rate := v_tier.total_rate;
    v_giver_share := v_tier.giver_share;
    v_receiver_share := v_tier.receiver_share;
  END IF;

  -- ==========================================
  -- STEP 3: Check VIP/Influencer status
  -- ==========================================
  IF p_receiver_id IS NOT NULL THEN
    SELECT * INTO v_user_settings
    FROM user_commission_settings
    WHERE user_id = p_receiver_id
      AND is_active = TRUE;

    IF v_user_settings IS NOT NULL THEN
      -- VIP/Influencer: Giver pays ALL commission
      IF v_user_settings.account_type IN ('vip', 'influencer') THEN
        v_giver_share := 1.0;
        v_receiver_share := 0.0;
      END IF;

      -- Custom rate override
      IF v_user_settings.custom_rate IS NOT NULL THEN
        v_total_rate := v_user_settings.custom_rate;
      END IF;

      -- Exempt: No commission
      IF v_user_settings.account_type = 'exempt' THEN
        v_total_rate := 0;
      END IF;
    END IF;
  END IF;

  -- ==========================================
  -- STEP 4: Calculate commissions
  -- ==========================================
  v_total_commission := ROUND(p_base_amount * v_total_rate, 2);
  v_giver_commission := ROUND(v_total_commission * v_giver_share, 2);
  v_receiver_commission := v_total_commission - v_giver_commission; -- Remainder to avoid rounding issues

  -- ==========================================
  -- STEP 5: Get escrow tier
  -- ==========================================
  SELECT * INTO v_escrow
  FROM escrow_thresholds
  WHERE is_active = TRUE
    AND v_amount_usd >= min_amount_usd
    AND (max_amount_usd IS NULL OR v_amount_usd < max_amount_usd)
  LIMIT 1;

  -- ==========================================
  -- STEP 6: Get exchange rates
  -- ==========================================

  -- Rate to TRY (with buffer info)
  IF p_moment_currency = 'TRY' THEN
    v_rate_to_try := 1.0;
    v_buffer := 0;
    v_rate_timestamp := NOW();
    v_is_stale := FALSE;
  ELSE
    SELECT
      rate,
      buffer_percentage,
      rate_timestamp,
      is_stale
    INTO v_rate_to_try, v_buffer, v_rate_timestamp, v_is_stale
    FROM get_live_exchange_rate(p_moment_currency, 'TRY');

    -- Get buffer from config
    SELECT buffer_percentage INTO v_buffer
    FROM currency_buffer_config
    WHERE name = 'TRY_INFLATION_BUFFER' AND is_active = TRUE;
    v_buffer := COALESCE(v_buffer, 5.00);
  END IF;

  -- Rate to user currency
  IF p_user_currency = 'TRY' THEN
    v_rate_to_user := v_rate_to_try;
  ELSIF p_user_currency = p_moment_currency THEN
    v_rate_to_user := 1.0;
  ELSE
    v_rate_to_user := get_exchange_rate(p_moment_currency, p_user_currency);
  END IF;

  -- ==========================================
  -- STEP 7: Calculate FINAL amounts
  -- ==========================================

  -- What giver pays (base currency)
  v_giver_pays_base := p_base_amount + v_giver_commission;

  -- What giver pays (TRY with buffer) - BUFFER ONLY FOR GIVER!
  v_giver_pays_try := ROUND(v_giver_pays_base * v_rate_to_try * (1 + v_buffer / 100), 2);

  -- What giver pays (display currency)
  IF p_user_currency = 'TRY' THEN
    v_giver_pays_display := v_giver_pays_try;
  ELSIF p_user_currency = p_moment_currency THEN
    v_giver_pays_display := v_giver_pays_base;
  ELSE
    -- Other currency: no buffer
    v_giver_pays_display := ROUND(v_giver_pays_base * v_rate_to_user, 2);
  END IF;

  -- What receiver gets (base currency) - NO BUFFER!
  v_receiver_gets := p_base_amount - v_receiver_commission;

  -- What receiver gets (TRY) - NO BUFFER!
  v_receiver_gets_try := ROUND(v_receiver_gets * v_rate_to_try, 2);

  -- ==========================================
  -- RETURN
  -- ==========================================
  RETURN QUERY SELECT
    p_base_amount,
    p_moment_currency,
    v_amount_usd,
    COALESCE(v_tier.name, 'default')::TEXT,
    v_total_rate,
    v_total_commission,
    v_giver_commission,
    v_receiver_commission,
    COALESCE(v_escrow.escrow_type, 'required')::TEXT,
    v_escrow.max_contributors,
    v_rate_to_try,
    v_buffer,
    v_rate_timestamp,
    v_is_stale,
    v_giver_pays_base,
    v_giver_pays_try,
    v_giver_pays_display,
    p_user_currency,
    v_receiver_gets,
    v_receiver_gets_try,
    p_moment_currency;  -- Receiver gets in original currency
END;
$$;

-- ============================================
-- 5. SIMPLIFIED VERSION FOR MOMENT DISPLAY
-- ============================================

CREATE OR REPLACE FUNCTION get_moment_payment_info(
  p_moment_id UUID,
  p_user_currency VARCHAR(3) DEFAULT 'TRY'
)
RETURNS TABLE (
  -- Moment info
  moment_id UUID,
  moment_title TEXT,
  moment_price DECIMAL(10, 2),
  moment_currency VARCHAR(3),

  -- User pays
  user_pays DECIMAL(10, 2),
  user_currency VARCHAR(3),
  user_pays_formatted TEXT,

  -- Original price formatted
  original_formatted TEXT,

  -- Commission info
  commission_rate_percent DECIMAL(5, 2),

  -- Buffer info (only if TRY)
  has_buffer BOOLEAN,
  buffer_percent DECIMAL(5, 2),
  buffer_note TEXT,

  -- Escrow info
  escrow_type TEXT,
  escrow_required BOOLEAN,
  max_contributors INTEGER,

  -- Rate info
  exchange_rate DECIMAL(18, 8),
  rate_age_minutes INTEGER,
  rate_is_stale BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_moment RECORD;
  v_calc RECORD;
  v_currency RECORD;
BEGIN
  -- Get moment
  SELECT m.id, m.title, m.price, m.currency, m.user_id
  INTO v_moment
  FROM moments m
  WHERE m.id = p_moment_id;

  IF v_moment IS NULL THEN
    RAISE EXCEPTION 'Moment not found: %', p_moment_id;
  END IF;

  -- Calculate payment
  SELECT * INTO v_calc
  FROM calculate_unified_payment(
    v_moment.price,
    v_moment.currency,
    p_user_currency,
    v_moment.user_id
  );

  -- Get currency symbol
  SELECT symbol INTO v_currency
  FROM currencies
  WHERE code = p_user_currency;

  RETURN QUERY SELECT
    v_moment.id,
    v_moment.title,
    v_moment.price,
    v_moment.currency,
    v_calc.giver_pays_display,
    p_user_currency,
    COALESCE(v_currency.symbol, '') || TO_CHAR(v_calc.giver_pays_display, 'FM999,999.00'),
    (SELECT c.symbol FROM currencies c WHERE c.code = v_moment.currency) || TO_CHAR(v_moment.price, 'FM999,999.00'),
    ROUND(v_calc.commission_rate * 100, 2),
    (p_user_currency = 'TRY' AND v_calc.buffer_percentage > 0),
    v_calc.buffer_percentage,
    CASE
      WHEN p_user_currency = 'TRY' AND v_calc.buffer_percentage > 0
      THEN 'Kur koruması dahil (%' || v_calc.buffer_percentage || ')'
      ELSE NULL
    END,
    v_calc.escrow_type,
    (v_calc.escrow_type = 'required'),
    v_calc.max_contributors,
    v_calc.exchange_rate,
    EXTRACT(EPOCH FROM (NOW() - v_calc.rate_timestamp))::INTEGER / 60,
    v_calc.rate_is_stale;
END;
$$;

-- ============================================
-- 6. RECEIVER PAYOUT CALCULATION
-- ============================================

CREATE OR REPLACE FUNCTION calculate_receiver_payout(
  p_gift_id UUID
)
RETURNS TABLE (
  gift_id UUID,
  base_amount DECIMAL(10, 2),
  base_currency VARCHAR(3),
  receiver_commission DECIMAL(10, 2),
  receiver_gets DECIMAL(10, 2),
  receiver_gets_try DECIMAL(10, 2),
  exchange_rate DECIMAL(18, 8),
  payout_note TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_gift RECORD;
  v_rate DECIMAL(18, 8);
BEGIN
  -- Get gift with commission info
  SELECT
    g.id,
    g.amount,
    g.currency,
    COALESCE(cl.receiver_commission, 0) as receiver_commission,
    COALESCE(cl.receiver_gets, g.amount) as receiver_gets
  INTO v_gift
  FROM gifts g
  LEFT JOIN commission_ledger cl ON cl.gift_id = g.id
  WHERE g.id = p_gift_id;

  IF v_gift IS NULL THEN
    RAISE EXCEPTION 'Gift not found: %', p_gift_id;
  END IF;

  -- Get current rate (NO BUFFER for receiver!)
  IF v_gift.currency = 'TRY' THEN
    v_rate := 1.0;
  ELSE
    v_rate := get_exchange_rate(v_gift.currency, 'TRY');
  END IF;

  RETURN QUERY SELECT
    v_gift.id,
    v_gift.amount,
    v_gift.currency,
    v_gift.receiver_commission,
    v_gift.receiver_gets,
    ROUND(v_gift.receiver_gets * v_rate, 2),
    v_rate,
    'Komisyon düşüldükten sonra net tutar'::TEXT;
END;
$$;

-- ============================================
-- 7. PAYMENT SUMMARY VIEW
-- ============================================

CREATE OR REPLACE VIEW v_payment_summary AS
SELECT
  -- Commission tiers
  ct.name as tier,
  ct.min_amount as min_usd,
  ct.max_amount as max_usd,
  ROUND(ct.total_rate * 100, 1) || '%' as total_commission,
  ROUND(ct.total_rate * ct.giver_share * 100, 1) || '%' as giver_pays,
  ROUND(ct.total_rate * ct.receiver_share * 100, 1) || '%' as receiver_pays,

  -- Escrow
  et.escrow_type,
  et.max_contributors,

  -- Buffer (for TRY)
  (SELECT buffer_percentage FROM currency_buffer_config WHERE name = 'TRY_INFLATION_BUFFER') as try_buffer_percent

FROM commission_tiers ct
LEFT JOIN escrow_thresholds et ON
  ct.min_amount = et.min_amount_usd
WHERE ct.is_active = TRUE
ORDER BY ct.min_amount;

-- ============================================
-- 8. GRANTS
-- ============================================

GRANT SELECT ON commission_tiers TO authenticated;
GRANT SELECT ON user_commission_settings TO authenticated;
GRANT SELECT ON commission_ledger TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_unified_payment TO authenticated;
GRANT EXECUTE ON FUNCTION get_moment_payment_info TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_receiver_payout TO authenticated;
GRANT SELECT ON v_payment_summary TO authenticated;

-- ============================================
-- 9. COMMENTS
-- ============================================

COMMENT ON TABLE commission_tiers IS 'USD bazlı komisyon oranları';
COMMENT ON TABLE user_commission_settings IS 'VIP/Influencer kullanıcı komisyon ayarları';
COMMENT ON TABLE commission_ledger IS 'Komisyon kayıtları';
COMMENT ON FUNCTION calculate_unified_payment IS
'Birleşik ödeme hesaplaması: kur + buffer + komisyon + escrow.
Buffer SADECE gönderene uygulanır, alıcıya yansımaz.';
COMMENT ON FUNCTION get_moment_payment_info IS
'Moment için basitleştirilmiş ödeme bilgisi (UI için)';
COMMENT ON FUNCTION calculate_receiver_payout IS
'Alıcının alacağı net tutarı hesaplar (buffer olmadan)';
