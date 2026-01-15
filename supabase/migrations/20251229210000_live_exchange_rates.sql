-- ============================================
-- Lovendo Live Exchange Rate System
-- Migration: 20251229210000_live_exchange_rates.sql
-- ============================================
--
-- MANTIK:
-- - Escrow kuralları USD/EUR/GBP bazlı (sabit)
-- - Kullanıcı TL öder (güncel kur + %5 buffer)
-- - Kur saatlik güncellenir
-- ============================================

-- ============================================
-- 1. EXCHANGE RATES TABLE UPDATE
-- ============================================

-- Saatlik kur takibi için timestamp ekle
ALTER TABLE exchange_rates
ADD COLUMN IF NOT EXISTS rate_timestamp TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS bid_rate DECIMAL(18, 8),        -- Alış kuru
ADD COLUMN IF NOT EXISTS ask_rate DECIMAL(18, 8),        -- Satış kuru
ADD COLUMN IF NOT EXISTS mid_rate DECIMAL(18, 8),        -- Orta kur
ADD COLUMN IF NOT EXISTS is_latest BOOLEAN DEFAULT FALSE;

-- Latest flag için index
CREATE INDEX IF NOT EXISTS idx_exchange_rates_latest
ON exchange_rates(base_currency, target_currency, is_latest)
WHERE is_latest = TRUE;

-- ============================================
-- 2. BUFFER CONFIGURATION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS currency_buffer_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  buffer_percentage DECIMAL(5, 2) NOT NULL DEFAULT 5.00, -- %5 default
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default buffer config
INSERT INTO currency_buffer_config (name, buffer_percentage, description) VALUES
  ('TRY_INFLATION_BUFFER', 5.00, 'Türkiye enflasyon/kur dalgalanması koruması'),
  ('SETTLEMENT_BUFFER', 2.00, 'Ödeme-settlement arası kur koruması'),
  ('HIGH_VOLATILITY_BUFFER', 7.50, 'Yüksek volatilite dönemlerinde ekstra koruma')
ON CONFLICT (name) DO UPDATE SET
  buffer_percentage = EXCLUDED.buffer_percentage,
  updated_at = NOW();

-- ============================================
-- 3. ESCROW THRESHOLDS (USD BAZLI)
-- ============================================

CREATE TABLE IF NOT EXISTS escrow_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE,
  min_amount_usd DECIMAL(10, 2) NOT NULL,
  max_amount_usd DECIMAL(10, 2),  -- NULL = unlimited
  escrow_type TEXT NOT NULL CHECK (escrow_type IN ('none', 'optional', 'required')),
  max_contributors INTEGER,  -- NULL = unlimited
  description_tr TEXT,
  description_en TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Escrow kuralları (USD bazlı)
INSERT INTO escrow_thresholds (tier_name, min_amount_usd, max_amount_usd, escrow_type, max_contributors, description_tr, description_en) VALUES
  ('direct', 0, 30, 'none', NULL,
   'Küçük hediyeler anında iletilir, escrow gerekmez.',
   'Small gifts are delivered instantly, no escrow needed.'),
  ('optional', 30, 100, 'optional', NULL,
   'Orta tutarlı hediyeler için escrow isteğe bağlıdır.',
   'Escrow is optional for medium-sized gifts.'),
  ('required', 100, NULL, 'required', 3,
   'Büyük hediyeler için escrow zorunludur. Maksimum 3 kişi katkıda bulunabilir.',
   'Escrow is required for large gifts. Maximum 3 contributors allowed.')
ON CONFLICT (tier_name) DO UPDATE SET
  min_amount_usd = EXCLUDED.min_amount_usd,
  max_amount_usd = EXCLUDED.max_amount_usd,
  escrow_type = EXCLUDED.escrow_type,
  max_contributors = EXCLUDED.max_contributors;

-- ============================================
-- 4. GET LATEST EXCHANGE RATE (LIVE)
-- ============================================

CREATE OR REPLACE FUNCTION get_live_exchange_rate(
  p_from_currency VARCHAR(3),
  p_to_currency VARCHAR(3)
)
RETURNS TABLE (
  rate DECIMAL(18, 8),
  rate_with_buffer DECIMAL(18, 8),
  buffer_percentage DECIMAL(5, 2),
  rate_timestamp TIMESTAMPTZ,
  is_stale BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rate DECIMAL(18, 8);
  v_timestamp TIMESTAMPTZ;
  v_buffer DECIMAL(5, 2);
  v_is_stale BOOLEAN;
BEGIN
  -- Aynı para birimi
  IF p_from_currency = p_to_currency THEN
    RETURN QUERY SELECT
      1.0::DECIMAL(18, 8),
      1.0::DECIMAL(18, 8),
      0.00::DECIMAL(5, 2),
      NOW(),
      FALSE;
    RETURN;
  END IF;

  -- En son kuru al (is_latest = TRUE olanı tercih et)
  SELECT er.rate, er.rate_timestamp INTO v_rate, v_timestamp
  FROM exchange_rates er
  WHERE er.base_currency = p_from_currency
    AND er.target_currency = p_to_currency
  ORDER BY er.is_latest DESC, er.rate_timestamp DESC
  LIMIT 1;

  -- Bulunamadıysa ters kuru dene
  IF v_rate IS NULL THEN
    SELECT 1.0 / er.rate, er.rate_timestamp INTO v_rate, v_timestamp
    FROM exchange_rates er
    WHERE er.base_currency = p_to_currency
      AND er.target_currency = p_from_currency
    ORDER BY er.is_latest DESC, er.rate_timestamp DESC
    LIMIT 1;
  END IF;

  IF v_rate IS NULL THEN
    RAISE EXCEPTION 'Exchange rate not found: % to %', p_from_currency, p_to_currency;
  END IF;

  -- Buffer al (TRY'ye dönüşüm için %5)
  IF p_to_currency = 'TRY' THEN
    SELECT buffer_percentage INTO v_buffer
    FROM currency_buffer_config
    WHERE name = 'TRY_INFLATION_BUFFER' AND is_active = TRUE;
  ELSE
    SELECT buffer_percentage INTO v_buffer
    FROM currency_buffer_config
    WHERE name = 'SETTLEMENT_BUFFER' AND is_active = TRUE;
  END IF;

  v_buffer := COALESCE(v_buffer, 5.00);

  -- Kurun yaşını kontrol et (2 saatten eskiyse stale)
  v_is_stale := (v_timestamp < NOW() - INTERVAL '2 hours');

  RETURN QUERY SELECT
    v_rate,
    ROUND(v_rate * (1 + v_buffer / 100), 8),
    v_buffer,
    v_timestamp,
    v_is_stale;
END;
$$;

-- ============================================
-- 5. CONVERT TO TRY WITH BUFFER
-- ============================================

CREATE OR REPLACE FUNCTION convert_to_try_with_buffer(
  p_amount DECIMAL(10, 2),
  p_from_currency VARCHAR(3)
)
RETURNS TABLE (
  original_amount DECIMAL(10, 2),
  original_currency VARCHAR(3),
  try_amount DECIMAL(10, 2),
  try_amount_with_buffer DECIMAL(10, 2),
  exchange_rate DECIMAL(18, 8),
  buffer_percentage DECIMAL(5, 2),
  rate_timestamp TIMESTAMPTZ,
  is_stale BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rate_info RECORD;
BEGIN
  -- TRY zaten
  IF p_from_currency = 'TRY' THEN
    RETURN QUERY SELECT
      p_amount,
      'TRY'::VARCHAR(3),
      p_amount,
      p_amount,
      1.0::DECIMAL(18, 8),
      0.00::DECIMAL(5, 2),
      NOW(),
      FALSE;
    RETURN;
  END IF;

  -- Kuru al
  SELECT * INTO v_rate_info
  FROM get_live_exchange_rate(p_from_currency, 'TRY');

  RETURN QUERY SELECT
    p_amount,
    p_from_currency,
    ROUND(p_amount * v_rate_info.rate, 2),
    ROUND(p_amount * v_rate_info.rate_with_buffer, 2),
    v_rate_info.rate,
    v_rate_info.buffer_percentage,
    v_rate_info.rate_timestamp,
    v_rate_info.is_stale;
END;
$$;

-- ============================================
-- 6. GET ESCROW TIER FOR AMOUNT
-- ============================================

CREATE OR REPLACE FUNCTION get_escrow_tier_for_amount(
  p_amount DECIMAL(10, 2),
  p_currency VARCHAR(3)
)
RETURNS TABLE (
  tier_name TEXT,
  escrow_type TEXT,
  max_contributors INTEGER,
  amount_usd DECIMAL(10, 2),
  description_tr TEXT,
  description_en TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_amount_usd DECIMAL(10, 2);
  v_rate DECIMAL(18, 8);
BEGIN
  -- USD'ye çevir
  IF p_currency = 'USD' THEN
    v_amount_usd := p_amount;
  ELSE
    v_rate := get_exchange_rate(p_currency, 'USD');
    v_amount_usd := ROUND(p_amount * v_rate, 2);
  END IF;

  -- Tier bul
  RETURN QUERY
  SELECT
    et.tier_name,
    et.escrow_type,
    et.max_contributors,
    v_amount_usd,
    et.description_tr,
    et.description_en
  FROM escrow_thresholds et
  WHERE et.is_active = TRUE
    AND v_amount_usd >= et.min_amount_usd
    AND (et.max_amount_usd IS NULL OR v_amount_usd < et.max_amount_usd)
  LIMIT 1;
END;
$$;

-- ============================================
-- 7. CALCULATE PAYMENT AMOUNT (FOR UI)
-- ============================================

CREATE OR REPLACE FUNCTION calculate_payment_amount(
  p_moment_id UUID,
  p_user_currency VARCHAR(3) DEFAULT 'TRY'
)
RETURNS TABLE (
  moment_price DECIMAL(10, 2),
  moment_currency VARCHAR(3),
  user_pays DECIMAL(10, 2),
  user_currency VARCHAR(3),
  exchange_rate DECIMAL(18, 8),
  buffer_percentage DECIMAL(5, 2),
  escrow_tier TEXT,
  escrow_type TEXT,
  max_contributors INTEGER,
  rate_timestamp TIMESTAMPTZ,
  rate_is_stale BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_moment RECORD;
  v_try_info RECORD;
  v_tier_info RECORD;
  v_user_amount DECIMAL(10, 2);
  v_user_rate DECIMAL(18, 8);
BEGIN
  -- Moment bilgisi
  SELECT m.price, m.currency INTO v_moment
  FROM moments m
  WHERE m.id = p_moment_id;

  IF v_moment IS NULL THEN
    RAISE EXCEPTION 'Moment not found: %', p_moment_id;
  END IF;

  -- TRY'ye çevir (buffer ile)
  SELECT * INTO v_try_info
  FROM convert_to_try_with_buffer(v_moment.price, v_moment.currency);

  -- Escrow tier bul
  SELECT * INTO v_tier_info
  FROM get_escrow_tier_for_amount(v_moment.price, v_moment.currency);

  -- Kullanıcı para birimine çevir
  IF p_user_currency = 'TRY' THEN
    v_user_amount := v_try_info.try_amount_with_buffer;
    v_user_rate := v_try_info.exchange_rate * (1 + v_try_info.buffer_percentage / 100);
  ELSIF p_user_currency = v_moment.currency THEN
    -- Aynı para birimi, buffer yok
    v_user_amount := v_moment.price;
    v_user_rate := 1.0;
  ELSE
    -- Farklı para birimi (EUR → USD gibi)
    v_user_rate := get_exchange_rate(v_moment.currency, p_user_currency);
    v_user_amount := ROUND(v_moment.price * v_user_rate, 2);
  END IF;

  RETURN QUERY SELECT
    v_moment.price,
    v_moment.currency,
    v_user_amount,
    p_user_currency,
    v_user_rate,
    CASE WHEN p_user_currency = 'TRY' THEN v_try_info.buffer_percentage ELSE 0.00 END,
    v_tier_info.tier_name,
    v_tier_info.escrow_type,
    v_tier_info.max_contributors,
    v_try_info.rate_timestamp,
    v_try_info.is_stale;
END;
$$;

-- ============================================
-- 8. UPDATE EXCHANGE RATE (FROM API)
-- ============================================

CREATE OR REPLACE FUNCTION upsert_exchange_rate(
  p_base VARCHAR(3),
  p_target VARCHAR(3),
  p_rate DECIMAL(18, 8),
  p_source TEXT DEFAULT 'api'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Eski latest'leri kaldır
  UPDATE exchange_rates
  SET is_latest = FALSE
  WHERE base_currency = p_base
    AND target_currency = p_target
    AND is_latest = TRUE;

  -- Yeni kuru ekle
  INSERT INTO exchange_rates (
    base_currency,
    target_currency,
    rate,
    mid_rate,
    rate_date,
    rate_timestamp,
    source,
    is_latest
  ) VALUES (
    p_base,
    p_target,
    p_rate,
    p_rate,
    CURRENT_DATE,
    NOW(),
    p_source,
    TRUE
  );
END;
$$;

-- ============================================
-- 9. CLEANUP OLD RATES (Keep 30 days)
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_old_exchange_rates()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM exchange_rates
  WHERE rate_date < CURRENT_DATE - INTERVAL '30 days'
    AND is_latest = FALSE;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- ============================================
-- 10. RATE STALENESS CHECK VIEW
-- ============================================

CREATE OR REPLACE VIEW v_exchange_rate_status AS
SELECT
  base_currency,
  target_currency,
  rate,
  rate_timestamp,
  CASE
    WHEN rate_timestamp > NOW() - INTERVAL '1 hour' THEN 'fresh'
    WHEN rate_timestamp > NOW() - INTERVAL '2 hours' THEN 'recent'
    WHEN rate_timestamp > NOW() - INTERVAL '6 hours' THEN 'stale'
    ELSE 'very_stale'
  END AS freshness,
  EXTRACT(EPOCH FROM (NOW() - rate_timestamp)) / 60 AS age_minutes
FROM exchange_rates
WHERE is_latest = TRUE;

-- ============================================
-- 11. GRANTS
-- ============================================

GRANT SELECT ON currency_buffer_config TO authenticated;
GRANT SELECT ON escrow_thresholds TO authenticated;
GRANT SELECT ON v_exchange_rate_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_live_exchange_rate TO authenticated;
GRANT EXECUTE ON FUNCTION convert_to_try_with_buffer TO authenticated;
GRANT EXECUTE ON FUNCTION get_escrow_tier_for_amount TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_payment_amount TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_exchange_rate TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_exchange_rates TO service_role;

-- ============================================
-- 12. COMMENTS
-- ============================================

COMMENT ON TABLE currency_buffer_config IS 'Kur dönüşümlerinde kullanılan buffer/koruma yüzdeleri';
COMMENT ON TABLE escrow_thresholds IS 'USD bazlı escrow kuralları (0-30: direct, 30-100: optional, 100+: required)';
COMMENT ON FUNCTION get_live_exchange_rate IS 'En güncel kuru buffer ile birlikte döner';
COMMENT ON FUNCTION convert_to_try_with_buffer IS 'Herhangi bir para birimini TRY ye çevirir (%5 buffer dahil)';
COMMENT ON FUNCTION calculate_payment_amount IS 'Moment için kullanıcının ödeyeceği tutarı hesaplar';
