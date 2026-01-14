-- - free ($0): Free tier - casual explorers
-- - standard ($10): Enhanced features for serious travelers
-- - premium ($25): Premium experience - unlimited features
-- - standard: Account >= 30 days, no KYC
-- - verified: KYC approved
-- ============================================

-- ============================================
-- 1. UPDATE SUBSCRIPTION PLANS (if needed)
-- ============================================

-- First, update existing plans to match frontend
UPDATE subscription_plans SET id = 'free' WHERE id = 'free';
UPDATE subscription_plans SET id = 'standard' WHERE id = 'starter';
UPDATE subscription_plans SET id = 'premium' WHERE id = 'pro';
DELETE FROM subscription_plans WHERE id = 'vip';

-- Ensure plans exist with correct data
INSERT INTO subscription_plans (id, name, price, interval, features, is_popular, color, icon) VALUES
('free', 'Free', 0, 'month',
 '["3 moments per month", "20 messages per day", "1 gift per month", "Basic filters"]',
 false, '#6B7280', 'free'),
('standard', 'Standard', 10, 'month',
 '["15 moments per month", "Unlimited messages", "10 gifts per month", "All discovery filters"]',
 true, '#3B82F6', 'airplane-takeoff'),
('premium', 'Premium', 25, 'month',
 '["Unlimited moments", "Unlimited messages", "Unlimited gifts", "Verified badge", "Incognito mode"]',
 false, '#F59E0B', 'crown')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  is_popular = EXCLUDED.is_popular,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon;

-- ============================================
-- 2. USER LIMITS TABLE
-- ============================================

DROP TABLE IF EXISTS user_limits CASCADE;

CREATE TABLE user_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Plan & User Type
  plan_id TEXT REFERENCES subscription_plans(id) ON DELETE CASCADE,
  user_type TEXT CHECK (user_type IN ('new', 'standard', 'verified', 'any')),

  -- Limit Category
  category TEXT NOT NULL CHECK (category IN (
    'send',              -- Para gönderme
    'receive',           -- Para alma
    'withdraw',          -- Para çekimi
    'moment_create',     -- Moment oluşturma
    'gift_per_moment',   -- Tek momente max katkı
    'messages'           -- Mesaj limiti
  )),

  -- Period
  limit_period TEXT NOT NULL CHECK (limit_period IN (
    'per_transaction',
    'daily',
    'weekly',
    'monthly'
  )),

  -- Currency
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',

  -- Values
  min_amount DECIMAL(12, 2),
  max_amount DECIMAL(12, 2),
  max_count INTEGER,

  -- KYC requirement
  requires_kyc_above DECIMAL(12, 2),

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. INSERT LIMITS BY PLAN
-- ============================================

INSERT INTO user_limits (plan_id, user_type, category, limit_period, currency, min_amount, max_amount, max_count, requires_kyc_above) VALUES

  -- =====================================
  -- FREE PLAN ($0)
  -- =====================================

  -- SEND Limits (TRY)
  ('free', 'new', 'send', 'per_transaction', 'TRY', 10, 500, NULL, 500),
  ('free', 'new', 'send', 'daily', 'TRY', NULL, 1000, 3, NULL),
  ('free', 'new', 'send', 'monthly', 'TRY', NULL, 5000, 15, NULL),

  ('free', 'standard', 'send', 'per_transaction', 'TRY', 10, 1000, NULL, 500),
  ('free', 'standard', 'send', 'daily', 'TRY', NULL, 2500, 5, NULL),
  ('free', 'standard', 'send', 'monthly', 'TRY', NULL, 10000, 30, NULL),

  ('free', 'verified', 'send', 'per_transaction', 'TRY', 10, 2500, NULL, NULL),
  ('free', 'verified', 'send', 'daily', 'TRY', NULL, 5000, 10, NULL),
  ('free', 'verified', 'send', 'monthly', 'TRY', NULL, 25000, 50, NULL),

  -- SEND Limits (EUR)
  ('free', 'any', 'send', 'per_transaction', 'EUR', 1, 15, NULL, 15),
  ('free', 'any', 'send', 'monthly', 'EUR', NULL, 100, 10, NULL),

  -- SEND Limits (USD)
  ('free', 'any', 'send', 'per_transaction', 'USD', 1, 15, NULL, 15),
  ('free', 'any', 'send', 'monthly', 'USD', NULL, 100, 10, NULL),

  -- RECEIVE Limits
  ('free', 'any', 'receive', 'monthly', 'TRY', NULL, 10000, NULL, 7500),
  ('free', 'any', 'receive', 'monthly', 'EUR', NULL, 250, NULL, NULL),
  ('free', 'any', 'receive', 'monthly', 'USD', NULL, 250, NULL, NULL),

  -- MOMENT CREATE (3/month)
  ('free', 'any', 'moment_create', 'daily', 'TRY', NULL, NULL, 1, NULL),
  ('free', 'any', 'moment_create', 'monthly', 'TRY', NULL, NULL, 3, NULL),

  -- GIFT PER MOMENT
  ('free', 'any', 'gift_per_moment', 'per_transaction', 'TRY', NULL, 500, 1, NULL),

  -- =====================================
  -- STANDARD PLAN ($10/month)
  -- =====================================

  -- SEND Limits (TRY)
  ('standard', 'new', 'send', 'per_transaction', 'TRY', 10, 1000, NULL, 1000),
  ('standard', 'new', 'send', 'daily', 'TRY', NULL, 2500, 5, NULL),
  ('standard', 'new', 'send', 'monthly', 'TRY', NULL, 15000, 30, NULL),

  ('standard', 'standard', 'send', 'per_transaction', 'TRY', 10, 2500, NULL, 2500),
  ('standard', 'standard', 'send', 'daily', 'TRY', NULL, 5000, 10, NULL),
  ('standard', 'standard', 'send', 'monthly', 'TRY', NULL, 25000, 50, NULL),

  ('standard', 'verified', 'send', 'per_transaction', 'TRY', 10, 10000, NULL, NULL),
  ('standard', 'verified', 'send', 'daily', 'TRY', NULL, 25000, 25, NULL),
  ('standard', 'verified', 'send', 'monthly', 'TRY', NULL, 100000, NULL, NULL),

  -- SEND Limits (EUR)
  ('standard', 'any', 'send', 'per_transaction', 'EUR', 1, 75, NULL, 75),
  ('standard', 'any', 'send', 'monthly', 'EUR', NULL, 500, 30, NULL),

  -- SEND Limits (USD)
  ('standard', 'any', 'send', 'per_transaction', 'USD', 1, 75, NULL, 75),
  ('standard', 'any', 'send', 'monthly', 'USD', NULL, 500, 30, NULL),

  -- RECEIVE Limits
  ('standard', 'any', 'receive', 'monthly', 'TRY', NULL, 50000, NULL, 25000),
  ('standard', 'any', 'receive', 'monthly', 'EUR', NULL, 1500, NULL, NULL),
  ('standard', 'any', 'receive', 'monthly', 'USD', NULL, 1500, NULL, NULL),

  -- WITHDRAW
  ('standard', 'verified', 'withdraw', 'per_transaction', 'TRY', 100, 5000, NULL, NULL),
  ('standard', 'verified', 'withdraw', 'daily', 'TRY', NULL, 10000, 2, NULL),

  -- MOMENT CREATE (15/month)
  ('standard', 'any', 'moment_create', 'daily', 'TRY', NULL, NULL, 3, NULL),
  ('standard', 'any', 'moment_create', 'monthly', 'TRY', NULL, NULL, 15, NULL),

  -- GIFT PER MOMENT
  ('standard', 'any', 'gift_per_moment', 'per_transaction', 'TRY', NULL, 2500, 3, NULL),

  -- =====================================
  -- PREMIUM PLAN ($25/month)
  -- =====================================

  -- SEND Limits (TRY)
  ('premium', 'new', 'send', 'per_transaction', 'TRY', 10, 5000, NULL, 2500),
  ('premium', 'new', 'send', 'daily', 'TRY', NULL, 10000, 10, NULL),
  ('premium', 'new', 'send', 'monthly', 'TRY', NULL, 50000, 50, NULL),

  ('premium', 'standard', 'send', 'per_transaction', 'TRY', 10, 10000, NULL, 5000),
  ('premium', 'standard', 'send', 'daily', 'TRY', NULL, 25000, 25, NULL),
  ('premium', 'standard', 'send', 'monthly', 'TRY', NULL, 100000, 100, NULL),

  ('premium', 'verified', 'send', 'per_transaction', 'TRY', 10, 50000, NULL, NULL),
  ('premium', 'verified', 'send', 'daily', 'TRY', NULL, 100000, NULL, NULL),
  ('premium', 'verified', 'send', 'monthly', 'TRY', NULL, 500000, NULL, NULL),

  -- SEND Limits (EUR)
  ('premium', 'any', 'send', 'per_transaction', 'EUR', 1, 250, NULL, 250),
  ('premium', 'any', 'send', 'monthly', 'EUR', NULL, 2500, NULL, NULL),

  -- SEND Limits (USD)
  ('premium', 'any', 'send', 'per_transaction', 'USD', 1, 250, NULL, 250),
  ('premium', 'any', 'send', 'monthly', 'USD', NULL, 2500, NULL, NULL),

  -- RECEIVE Limits
  ('premium', 'any', 'receive', 'monthly', 'TRY', NULL, 250000, NULL, 100000),
  ('premium', 'any', 'receive', 'monthly', 'EUR', NULL, 7500, NULL, NULL),
  ('premium', 'any', 'receive', 'monthly', 'USD', NULL, 7500, NULL, NULL),

  -- WITHDRAW (higher limits)
  ('premium', 'verified', 'withdraw', 'per_transaction', 'TRY', 100, 25000, NULL, NULL),
  ('premium', 'verified', 'withdraw', 'daily', 'TRY', NULL, 50000, 5, NULL),

  -- MOMENT CREATE (Unlimited)
  ('premium', 'any', 'moment_create', 'daily', 'TRY', NULL, NULL, 10, NULL),
  ('premium', 'any', 'moment_create', 'monthly', 'TRY', NULL, NULL, NULL, NULL), -- Unlimited

  -- GIFT PER MOMENT
  ('premium', 'any', 'gift_per_moment', 'per_transaction', 'TRY', NULL, 10000, 5, NULL)

ON CONFLICT DO NOTHING;

CREATE INDEX idx_user_limits_lookup ON user_limits(plan_id, user_type, category, limit_period, currency) WHERE is_active = TRUE;

-- ============================================
-- 4. KYC THRESHOLDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS kyc_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  threshold_type TEXT NOT NULL CHECK (threshold_type IN (
    'single_transaction',
    'daily_cumulative',
    'monthly_cumulative',
    'total_received',
    'total_sent',
    'withdrawal'
  )),

  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',

  action TEXT NOT NULL CHECK (action IN (
    'soft_prompt',
    'hard_require',
    'flag_review'
  )),

  message_tr TEXT,
  message_en TEXT,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO kyc_thresholds (threshold_type, amount, currency, action, message_tr, message_en) VALUES
  -- TRY thresholds
  ('single_transaction', 2500, 'TRY', 'soft_prompt',
   '2.500 TL üzeri işlemler için kimlik doğrulama önerilir.',
   'Identity verification is recommended for transactions over 2,500 TL.'),
  ('single_transaction', 5000, 'TRY', 'hard_require',
   '5.000 TL üzeri işlemler için kimlik doğrulama zorunludur.',
   'Identity verification is required for transactions over 5,000 TL.'),
  ('monthly_cumulative', 25000, 'TRY', 'soft_prompt',
   'Aylık 25.000 TL limitine yaklaşıyorsunuz.',
   'You are approaching the monthly 25,000 TL limit.'),
  ('monthly_cumulative', 50000, 'TRY', 'hard_require',
   'Aylık 50.000 TL limitine ulaştınız. KYC gereklidir.',
   'You have reached the 50,000 TL monthly limit. KYC required.'),
  ('total_received', 100000, 'TRY', 'flag_review',
   'Toplam 100.000 TL üzeri alım - hesap incelemeye alındı.',
   'Total received over 100,000 TL - account flagged for review.'),
  ('withdrawal', 10000, 'TRY', 'hard_require',
   'Para çekimi için kimlik doğrulama zorunludur.',
   'Identity verification is required for withdrawals.'),

  -- EUR thresholds (EU AML Directive)
  ('single_transaction', 1000, 'EUR', 'soft_prompt',
   '1.000 EUR üzeri işlemler için KYC önerilir.',
   'KYC recommended for transactions over 1,000 EUR.'),
  ('single_transaction', 3000, 'EUR', 'hard_require',
   '3.000 EUR üzeri işlemler için KYC zorunludur.',
   'KYC required for transactions over 3,000 EUR.'),

  -- USD thresholds (FinCEN)
  ('single_transaction', 1000, 'USD', 'soft_prompt',
   '$1.000 üzeri işlemler için KYC önerilir.',
   'KYC recommended for transactions over $1,000.'),
  ('single_transaction', 3000, 'USD', 'hard_require',
   '$3.000 üzeri işlemler için KYC zorunludur.',
   'KYC required for transactions over $3,000.')
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. CHECK USER LIMITS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION check_user_limits(
  p_user_id UUID,
  p_category TEXT,
  p_amount DECIMAL DEFAULT NULL,
  p_currency VARCHAR(3) DEFAULT 'TRY'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user RECORD;
  v_user_type TEXT;
  v_plan_id TEXT;
  v_limit RECORD;
  v_kyc_threshold RECORD;
  v_period_total DECIMAL;
  v_period_count INTEGER;
  v_is_blocked BOOLEAN := FALSE;
  v_block_reason TEXT;
  v_warnings JSONB := '[]'::JSONB;
  v_kyc_required BOOLEAN := FALSE;
  v_kyc_reason TEXT;
BEGIN
  -- Get user info
  SELECT
    u.id,
    u.created_at,
    u.kyc_status,
    COALESCE(us.plan_id, 'free') as plan_id
  INTO v_user
  FROM users u
  LEFT JOIN user_subscriptions us ON us.user_id = u.id AND us.status = 'active'
  WHERE u.id = p_user_id;

  IF v_user IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'User not found');
  END IF;

  v_plan_id := v_user.plan_id;

  -- Determine user type based on KYC status and account age
  IF v_user.kyc_status = 'verified' THEN
    v_user_type := 'verified';
  ELSIF v_user.created_at > NOW() - INTERVAL '30 days' THEN
    v_user_type := 'new';
  ELSE
    v_user_type := 'standard';
  END IF;

  -- Check applicable limits
  FOR v_limit IN
    SELECT * FROM user_limits
    WHERE plan_id = v_plan_id
      AND (user_type = v_user_type OR user_type = 'any')
      AND category = p_category
      AND currency = p_currency
      AND is_active = TRUE
    ORDER BY
      CASE WHEN user_type = v_user_type THEN 0 ELSE 1 END
  LOOP
    CASE v_limit.limit_period
      WHEN 'per_transaction' THEN
        -- Check min amount
        IF v_limit.min_amount IS NOT NULL AND p_amount < v_limit.min_amount THEN
          v_is_blocked := TRUE;
          v_block_reason := format('Minimum işlem tutarı: %s %s', v_limit.min_amount, p_currency);
        END IF;

        -- Check max amount
        IF v_limit.max_amount IS NOT NULL AND p_amount > v_limit.max_amount THEN
          v_is_blocked := TRUE;
          v_block_reason := format('Maksimum işlem tutarı: %s %s (%s planı)',
            v_limit.max_amount, p_currency, v_plan_id);
        END IF;

        -- Check KYC threshold
        IF v_limit.requires_kyc_above IS NOT NULL
           AND p_amount > v_limit.requires_kyc_above
           AND v_user.kyc_status != 'verified' THEN
          v_kyc_required := TRUE;
          v_kyc_reason := format('%s %s üzeri işlemler için kimlik doğrulama gerekli',
            v_limit.requires_kyc_above, p_currency);
        END IF;

      WHEN 'daily' THEN
        SELECT COALESCE(SUM(amount), 0), COUNT(*)
        INTO v_period_total, v_period_count
        FROM gifts
        WHERE ((p_category = 'send' AND giver_id = p_user_id)
           OR (p_category = 'receive' AND receiver_id = p_user_id))
          AND created_at >= CURRENT_DATE
          AND currency = p_currency
          AND status NOT IN ('cancelled', 'refunded');

        IF v_limit.max_amount IS NOT NULL AND v_period_total + COALESCE(p_amount, 0) > v_limit.max_amount THEN
          v_is_blocked := TRUE;
          v_block_reason := format('Günlük limit: %s / %s %s',
            ROUND(v_period_total::NUMERIC, 2), v_limit.max_amount, p_currency);
        END IF;

        IF v_limit.max_count IS NOT NULL AND v_period_count >= v_limit.max_count THEN
          v_is_blocked := TRUE;
          v_block_reason := format('Günlük işlem limiti: %s / %s işlem', v_period_count, v_limit.max_count);
        END IF;

      WHEN 'monthly' THEN
        SELECT COALESCE(SUM(amount), 0), COUNT(*)
        INTO v_period_total, v_period_count
        FROM gifts
        WHERE ((p_category = 'send' AND giver_id = p_user_id)
           OR (p_category = 'receive' AND receiver_id = p_user_id))
          AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
          AND currency = p_currency
          AND status NOT IN ('cancelled', 'refunded');

        IF v_limit.max_amount IS NOT NULL AND v_period_total + COALESCE(p_amount, 0) > v_limit.max_amount THEN
          v_is_blocked := TRUE;
          v_block_reason := format('Aylık limit: %s / %s %s',
            ROUND(v_period_total::NUMERIC, 2), v_limit.max_amount, p_currency);
        END IF;

        IF v_limit.max_count IS NOT NULL AND v_period_count >= v_limit.max_count THEN
          v_is_blocked := TRUE;
          v_block_reason := format('Aylık işlem limiti: %s / %s işlem', v_period_count, v_limit.max_count);
        END IF;
    END CASE;
  END LOOP;

  -- Check KYC thresholds
  IF NOT v_kyc_required AND v_user.kyc_status != 'verified' THEN
    FOR v_kyc_threshold IN
      SELECT * FROM kyc_thresholds
      WHERE currency = p_currency AND is_active = TRUE
      ORDER BY amount
    LOOP
      IF v_kyc_threshold.threshold_type = 'single_transaction' AND p_amount >= v_kyc_threshold.amount THEN
        IF v_kyc_threshold.action = 'hard_require' THEN
          v_kyc_required := TRUE;
          v_kyc_reason := v_kyc_threshold.message_tr;
          v_is_blocked := TRUE;
          v_block_reason := v_kyc_threshold.message_tr;
        ELSIF v_kyc_threshold.action = 'soft_prompt' THEN
          v_warnings := v_warnings || jsonb_build_array(jsonb_build_object(
            'type', 'kyc_prompt',
            'message', v_kyc_threshold.message_tr
          ));
        END IF;
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'allowed', NOT v_is_blocked,
    'plan_id', v_plan_id,
    'user_type', v_user_type,
    'kyc_status', v_user.kyc_status,
    'kyc_required', v_kyc_required,
    'kyc_reason', v_kyc_reason,
    'block_reason', v_block_reason,
    'warnings', v_warnings,
    'upgrade_available', v_plan_id != 'premium'
  );
END;
$$;

-- ============================================
-- 6. CHECK MOMENT CONTRIBUTION LIMIT
-- ============================================

CREATE OR REPLACE FUNCTION check_moment_contribution_limit(
  p_moment_id UUID,
  p_user_id UUID,
  p_amount DECIMAL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plan_id TEXT;
  v_limit RECORD;
  v_existing_count INTEGER;
  v_existing_total DECIMAL;
  v_max_per_user DECIMAL;
  v_max_times INTEGER;
BEGIN
  -- Get user's plan
  SELECT COALESCE(us.plan_id, 'free')
  INTO v_plan_id
  FROM users u
  LEFT JOIN user_subscriptions us ON us.user_id = u.id AND us.status = 'active'
  WHERE u.id = p_user_id;

  -- Get limit for this plan
  SELECT max_amount, max_count INTO v_max_per_user, v_max_times
  FROM user_limits
  WHERE plan_id = v_plan_id
    AND category = 'gift_per_moment'
    AND limit_period = 'per_transaction'
    AND is_active = TRUE
  LIMIT 1;

  -- Default if no limit found
  v_max_per_user := COALESCE(v_max_per_user, 10000);
  v_max_times := COALESCE(v_max_times, 5);

  -- Get existing contributions by this user to this moment
  SELECT COUNT(*), COALESCE(SUM(amount), 0)
  INTO v_existing_count, v_existing_total
  FROM gifts
  WHERE moment_id = p_moment_id
    AND giver_id = p_user_id
    AND status NOT IN ('cancelled', 'refunded');

  -- Check count limit
  IF v_existing_count >= v_max_times THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', format('Bu momente en fazla %s kez katkıda bulunabilirsiniz', v_max_times),
      'current_count', v_existing_count,
      'max_count', v_max_times
    );
  END IF;

  -- Check amount limit
  IF v_existing_total + p_amount > v_max_per_user THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', format('Bu momente toplam en fazla %s TL katkıda bulunabilirsiniz', v_max_per_user),
      'current_total', v_existing_total,
      'max_total', v_max_per_user,
      'remaining', GREATEST(0, v_max_per_user - v_existing_total)
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'current_count', v_existing_count,
    'current_total', v_existing_total,
    'remaining_count', v_max_times - v_existing_count,
    'remaining_amount', v_max_per_user - v_existing_total
  );
END;
$$;

-- ============================================
-- 7. CHECK MOMENT CREATION LIMIT
-- ============================================

CREATE OR REPLACE FUNCTION check_moment_creation_limit(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plan_id TEXT;
  v_daily_count INTEGER;
  v_monthly_count INTEGER;
  v_daily_limit INTEGER;
  v_monthly_limit INTEGER;
BEGIN
  -- Get user's plan
  SELECT COALESCE(us.plan_id, 'free')
  INTO v_plan_id
  FROM users u
  LEFT JOIN user_subscriptions us ON us.user_id = u.id AND us.status = 'active'
  WHERE u.id = p_user_id;

  -- Get limits
  SELECT max_count INTO v_daily_limit
  FROM user_limits
  WHERE plan_id = v_plan_id
    AND category = 'moment_create'
    AND limit_period = 'daily'
    AND is_active = TRUE;

  SELECT max_count INTO v_monthly_limit
  FROM user_limits
  WHERE plan_id = v_plan_id
    AND category = 'moment_create'
    AND limit_period = 'monthly'
    AND is_active = TRUE;

  -- Count existing
  SELECT COUNT(*) INTO v_daily_count
  FROM moments WHERE user_id = p_user_id AND created_at >= CURRENT_DATE;

  SELECT COUNT(*) INTO v_monthly_count
  FROM moments WHERE user_id = p_user_id AND created_at >= DATE_TRUNC('month', CURRENT_DATE);

  -- Check limits
  IF v_daily_limit IS NOT NULL AND v_daily_count >= v_daily_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', format('Günlük moment limiti: %s / %s', v_daily_count, v_daily_limit),
      'daily_count', v_daily_count,
      'daily_limit', v_daily_limit
    );
  END IF;

  IF v_monthly_limit IS NOT NULL AND v_monthly_count >= v_monthly_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', format('Aylık moment limiti: %s / %s', v_monthly_count, v_monthly_limit),
      'monthly_count', v_monthly_count,
      'monthly_limit', v_monthly_limit
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'daily_count', v_daily_count,
    'daily_limit', v_daily_limit,
    'monthly_count', v_monthly_count,
    'monthly_limit', v_monthly_limit,
    'plan_id', v_plan_id
  );
END;
$$;

-- ============================================
-- 8. GRANTS
-- ============================================

GRANT SELECT ON user_limits TO authenticated;
GRANT SELECT ON kyc_thresholds TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_limits TO authenticated;
GRANT EXECUTE ON FUNCTION check_moment_contribution_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_moment_creation_limit TO authenticated;

-- ============================================
-- 9. COMMENTS
-- ============================================

COMMENT ON TABLE user_limits IS 'Plan ve kullanıcı tipine göre işlem limitleri (Free/Standard/Premium)';
COMMENT ON TABLE kyc_thresholds IS 'KYC gerektiren eşik değerler (TRY/EUR/USD)';
COMMENT ON FUNCTION check_user_limits IS 'Kullanıcının işlem limitlerini kontrol eder';
COMMENT ON FUNCTION check_moment_contribution_limit IS 'Tek momente katkı limitini kontrol eder';
COMMENT ON FUNCTION check_moment_creation_limit IS 'Moment oluşturma limitini kontrol eder';
