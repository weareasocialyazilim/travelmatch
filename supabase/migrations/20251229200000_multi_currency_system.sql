-- ============================================
-- Lovendo Multi-Currency System
-- Migration: 20251229200000_multi_currency_system.sql
-- ============================================

-- ============================================
-- 1. CURRENCIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS currencies (
  code VARCHAR(3) PRIMARY KEY,
  symbol VARCHAR(5) NOT NULL,
  name TEXT NOT NULL,
  name_tr TEXT NOT NULL,
  decimal_places INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desteklenen para birimleri
INSERT INTO currencies (code, symbol, name, name_tr, decimal_places, display_order) VALUES
  ('TRY', '₺', 'Turkish Lira', 'Türk Lirası', 2, 1),
  ('EUR', '€', 'Euro', 'Euro', 2, 2),
  ('USD', '$', 'US Dollar', 'Amerikan Doları', 2, 3),
  ('GBP', '£', 'British Pound', 'İngiliz Sterlini', 2, 4)
ON CONFLICT (code) DO UPDATE SET
  symbol = EXCLUDED.symbol,
  name = EXCLUDED.name,
  name_tr = EXCLUDED.name_tr;

CREATE INDEX IF NOT EXISTS idx_currencies_active ON currencies(is_active, display_order);

-- ============================================
-- 2. EXCHANGE RATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
  target_currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
  rate DECIMAL(18, 8) NOT NULL,
  rate_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT DEFAULT 'api',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_rate_per_day UNIQUE (base_currency, target_currency, rate_date),
  CONSTRAINT different_currencies CHECK (base_currency != target_currency)
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_lookup
ON exchange_rates(base_currency, target_currency, rate_date DESC);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_date
ON exchange_rates(rate_date DESC);

-- Başlangıç kurları (29 Aralık 2025 tahmini)
INSERT INTO exchange_rates (base_currency, target_currency, rate, source) VALUES
  -- TRY bazlı
  ('TRY', 'EUR', 0.0267, 'manual'),
  ('TRY', 'USD', 0.0284, 'manual'),
  ('TRY', 'GBP', 0.0224, 'manual'),
  -- Ters kurlar
  ('EUR', 'TRY', 37.45, 'manual'),
  ('USD', 'TRY', 35.20, 'manual'),
  ('GBP', 'TRY', 44.64, 'manual'),
  -- Cross rates
  ('EUR', 'USD', 1.064, 'manual'),
  ('USD', 'EUR', 0.940, 'manual'),
  ('EUR', 'GBP', 0.839, 'manual'),
  ('GBP', 'EUR', 1.192, 'manual'),
  ('USD', 'GBP', 0.789, 'manual'),
  ('GBP', 'USD', 1.268, 'manual')
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. USER PREFERENCES UPDATE
-- ============================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'TRY' REFERENCES currencies(code),
ADD COLUMN IF NOT EXISTS locale VARCHAR(10) DEFAULT 'tr-TR';

-- Mevcut kullanıcıları güncelle
UPDATE users
SET preferred_currency = 'TRY'
WHERE preferred_currency IS NULL;

-- ============================================
-- 4. MOMENTS TABLE UPDATE
-- ============================================

-- Currency constraint (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_moment_currency'
  ) THEN
    ALTER TABLE moments
    ADD CONSTRAINT fk_moment_currency
    FOREIGN KEY (currency) REFERENCES currencies(code);
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Default currency
ALTER TABLE moments
ALTER COLUMN currency SET DEFAULT 'TRY';

-- ============================================
-- 5. GIFTS TABLE UPDATE
-- ============================================

ALTER TABLE gifts
ADD COLUMN IF NOT EXISTS original_currency VARCHAR(3) REFERENCES currencies(code),
ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS exchange_rate_used DECIMAL(18, 8),
ADD COLUMN IF NOT EXISTS exchange_rate_date DATE;

-- ============================================
-- 6. ESCROW TABLE UPDATE
-- ============================================

ALTER TABLE escrow_transactions
ADD COLUMN IF NOT EXISTS original_currency VARCHAR(3) REFERENCES currencies(code),
ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS settlement_currency VARCHAR(3) DEFAULT 'TRY' REFERENCES currencies(code),
ADD COLUMN IF NOT EXISTS exchange_rate_used DECIMAL(18, 8);

-- ============================================
-- 7. EXCHANGE RATE FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_exchange_rate(
  p_from_currency VARCHAR(3),
  p_to_currency VARCHAR(3),
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(18, 8)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rate DECIMAL(18, 8);
  v_from_to_try DECIMAL(18, 8);
  v_try_to_target DECIMAL(18, 8);
BEGIN
  -- Aynı para birimi
  IF p_from_currency = p_to_currency THEN
    RETURN 1.0;
  END IF;

  -- Direkt kur ara
  SELECT rate INTO v_rate
  FROM exchange_rates
  WHERE base_currency = p_from_currency
    AND target_currency = p_to_currency
    AND rate_date <= p_date
  ORDER BY rate_date DESC
  LIMIT 1;

  IF v_rate IS NOT NULL THEN
    RETURN v_rate;
  END IF;

  -- Ters kur dene
  SELECT 1.0 / rate INTO v_rate
  FROM exchange_rates
  WHERE base_currency = p_to_currency
    AND target_currency = p_from_currency
    AND rate_date <= p_date
  ORDER BY rate_date DESC
  LIMIT 1;

  IF v_rate IS NOT NULL THEN
    RETURN v_rate;
  END IF;

  -- TRY üzerinden cross-rate hesapla
  IF p_from_currency != 'TRY' AND p_to_currency != 'TRY' THEN
    -- from → TRY
    SELECT rate INTO v_from_to_try
    FROM exchange_rates
    WHERE base_currency = p_from_currency
      AND target_currency = 'TRY'
      AND rate_date <= p_date
    ORDER BY rate_date DESC
    LIMIT 1;

    -- TRY → to
    SELECT rate INTO v_try_to_target
    FROM exchange_rates
    WHERE base_currency = 'TRY'
      AND target_currency = p_to_currency
      AND rate_date <= p_date
    ORDER BY rate_date DESC
    LIMIT 1;

    IF v_from_to_try IS NOT NULL AND v_try_to_target IS NOT NULL THEN
      RETURN v_from_to_try * v_try_to_target;
    END IF;
  END IF;

  -- Bulunamadı - hata fırlat
  RAISE EXCEPTION 'Exchange rate not found: % to %', p_from_currency, p_to_currency;
END;
$$;

-- ============================================
-- 8. CONVERT CURRENCY FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION convert_currency(
  p_amount DECIMAL(10, 2),
  p_from_currency VARCHAR(3),
  p_to_currency VARCHAR(3),
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  converted_amount DECIMAL(10, 2),
  exchange_rate DECIMAL(18, 8),
  rate_date DATE
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rate DECIMAL(18, 8);
  v_converted DECIMAL(10, 2);
BEGIN
  v_rate := get_exchange_rate(p_from_currency, p_to_currency, p_date);
  v_converted := ROUND(p_amount * v_rate, 2);

  RETURN QUERY SELECT v_converted, v_rate, p_date;
END;
$$;

-- ============================================
-- 9. GET MOMENT PRICE IN USER CURRENCY
-- ============================================

CREATE OR REPLACE FUNCTION get_moment_price_display(
  p_moment_id UUID,
  p_user_currency VARCHAR(3) DEFAULT 'TRY'
)
RETURNS TABLE (
  original_price DECIMAL(10, 2),
  original_currency VARCHAR(3),
  display_price DECIMAL(10, 2),
  display_currency VARCHAR(3),
  exchange_rate DECIMAL(18, 8),
  is_converted BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_moment RECORD;
  v_rate DECIMAL(18, 8);
  v_display_price DECIMAL(10, 2);
BEGIN
  SELECT price, currency INTO v_moment
  FROM moments
  WHERE id = p_moment_id;

  IF v_moment IS NULL THEN
    RETURN;
  END IF;

  IF v_moment.currency = p_user_currency THEN
    RETURN QUERY SELECT
      v_moment.price,
      v_moment.currency,
      v_moment.price,
      p_user_currency,
      1.0::DECIMAL(18, 8),
      FALSE;
  ELSE
    v_rate := get_exchange_rate(v_moment.currency, p_user_currency);
    v_display_price := ROUND(v_moment.price * v_rate, 2);

    RETURN QUERY SELECT
      v_moment.price,
      v_moment.currency,
      v_display_price,
      p_user_currency,
      v_rate,
      TRUE;
  END IF;
END;
$$;

-- ============================================
-- 10. GET ACTIVE CURRENCIES
-- ============================================

CREATE OR REPLACE FUNCTION get_active_currencies()
RETURNS TABLE (
  code VARCHAR(3),
  symbol VARCHAR(5),
  name TEXT,
  name_tr TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT code, symbol, name, name_tr
  FROM currencies
  WHERE is_active = TRUE
  ORDER BY display_order;
$$;

-- ============================================
-- 11. GRANTS
-- ============================================

GRANT SELECT ON currencies TO authenticated;
GRANT SELECT ON exchange_rates TO authenticated;
GRANT EXECUTE ON FUNCTION get_exchange_rate TO authenticated;
GRANT EXECUTE ON FUNCTION convert_currency TO authenticated;
GRANT EXECUTE ON FUNCTION get_moment_price_display TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_currencies TO authenticated;

-- ============================================
-- 12. COMMENTS
-- ============================================

COMMENT ON TABLE currencies IS 'Desteklenen para birimleri (ISO 4217)';
COMMENT ON TABLE exchange_rates IS 'Günlük döviz kurları';
COMMENT ON FUNCTION get_exchange_rate IS 'İki para birimi arasındaki kuru döner';
COMMENT ON FUNCTION convert_currency IS 'Para birimi dönüşümü yapar';
COMMENT ON FUNCTION get_moment_price_display IS 'Moment fiyatını kullanıcı para biriminde gösterir';
