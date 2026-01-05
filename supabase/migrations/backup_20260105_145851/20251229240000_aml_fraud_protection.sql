-- ============================================
-- TravelMatch AML & Fraud Protection System
-- Migration: 20251229240000_aml_fraud_protection.sql
-- ============================================
--
-- MASAK (Turkey), EU AML Directive, FinCEN compliant
-- Multi-currency support: TRY, EUR, USD, GBP
-- ============================================

-- ============================================
-- 1. AML THRESHOLDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS aml_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Threshold Type
  threshold_type TEXT NOT NULL CHECK (threshold_type IN (
    'single_transaction',
    'daily_volume',
    'weekly_volume',
    'monthly_volume',
    'rapid_transactions',
    'round_amount',
    'cross_border',
    'new_account_high_volume',
    'dormant_account_activity',
    'structuring'
  )),

  -- Currency
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',

  -- Threshold Values
  amount DECIMAL(12, 2),
  count_threshold INTEGER,
  time_window_minutes INTEGER,

  -- Action
  action TEXT NOT NULL CHECK (action IN (
    'flag',
    'delay',
    'block',
    'report_masak',
    'report_fiu',
    'require_kyc',
    'require_source'
  )),

  -- Risk Score (1-100)
  risk_score INTEGER DEFAULT 10 CHECK (risk_score BETWEEN 1 AND 100),

  description_tr TEXT,
  description_en TEXT,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. AML THRESHOLDS DATA
-- ============================================

INSERT INTO aml_thresholds (threshold_type, currency, amount, count_threshold, time_window_minutes, action, risk_score, description_tr, description_en) VALUES

  -- ==========================================
  -- TRY Thresholds (MASAK Uyumlu)
  -- ==========================================

  ('single_transaction', 'TRY', 75000, NULL, NULL, 'report_masak', 80,
   '75.000 TL üzeri tek işlem - MASAK bildirimi zorunlu',
   'Single transaction over 75,000 TL - MASAK reporting required'),

  ('single_transaction', 'TRY', 25000, NULL, NULL, 'flag', 40,
   '25.000 TL üzeri işlem - manuel inceleme',
   'Transaction over 25,000 TL - manual review'),

  ('daily_volume', 'TRY', 100000, NULL, 1440, 'report_masak', 70,
   'Günlük 100.000 TL üzeri işlem hacmi',
   'Daily volume over 100,000 TL'),

  ('monthly_volume', 'TRY', 500000, NULL, 43200, 'report_masak', 90,
   'Aylık 500.000 TL üzeri işlem hacmi',
   'Monthly volume over 500,000 TL'),

  ('rapid_transactions', 'TRY', NULL, 5, 60, 'flag', 50,
   '1 saat içinde 5+ işlem - şüpheli aktivite',
   '5+ transactions within 1 hour - suspicious activity'),

  ('rapid_transactions', 'TRY', NULL, 10, 1440, 'delay', 60,
   '24 saat içinde 10+ işlem - gecikmeli onay',
   '10+ transactions within 24 hours - delayed approval'),

  ('structuring', 'TRY', 70000, 3, 1440, 'block', 85,
   'Yapılandırma şüphesi: 75K eşiği altında bölünmüş işlemler',
   'Structuring suspicion: Split transactions below 75K threshold'),

  ('round_amount', 'TRY', 10000, 3, 1440, 'flag', 30,
   'Yuvarlak tutarlarda tekrarlayan işlemler',
   'Repeated round amount transactions'),

  ('new_account_high_volume', 'TRY', 25000, NULL, 10080, 'require_kyc', 70,
   'Yeni hesapta (7 gün) yüksek hacim',
   'High volume in new account (7 days)'),

  ('dormant_account_activity', 'TRY', 10000, NULL, NULL, 'flag', 45,
   '90 gün pasif hesapta ani aktivite',
   'Sudden activity in 90-day dormant account'),

  -- ==========================================
  -- EUR Thresholds (EU AML Directive)
  -- ==========================================

  ('single_transaction', 'EUR', 10000, NULL, NULL, 'report_fiu', 80,
   '10.000 EUR üzeri tek işlem - FIU bildirimi',
   'Single transaction over 10,000 EUR - FIU reporting'),

  ('single_transaction', 'EUR', 3000, NULL, NULL, 'require_kyc', 50,
   '3.000 EUR üzeri işlem - KYC zorunlu',
   'Transaction over 3,000 EUR - KYC required'),

  ('monthly_volume', 'EUR', 15000, NULL, 43200, 'report_fiu', 75,
   'Aylık 15.000 EUR üzeri işlem hacmi',
   'Monthly volume over 15,000 EUR'),

  ('structuring', 'EUR', 9000, 3, 1440, 'block', 85,
   'Yapılandırma şüphesi: 10K EUR eşiği altında bölünmüş işlemler',
   'Structuring: Split transactions below 10K EUR threshold'),

  -- ==========================================
  -- USD Thresholds (FinCEN/BSA)
  -- ==========================================

  ('single_transaction', 'USD', 10000, NULL, NULL, 'report_fiu', 80,
   '$10.000 üzeri tek işlem - SAR bildirimi',
   'Single transaction over $10,000 - SAR reporting'),

  ('single_transaction', 'USD', 3000, NULL, NULL, 'require_kyc', 50,
   '$3.000 üzeri işlem - KYC zorunlu',
   'Transaction over $3,000 - KYC required'),

  ('structuring', 'USD', 9500, 3, 1440, 'block', 90,
   'Yapılandırma şüphesi: $10K limitinin altında bölünmüş işlemler',
   'Structuring: Split transactions below $10K threshold'),

  ('monthly_volume', 'USD', 15000, NULL, 43200, 'report_fiu', 75,
   'Aylık $15.000 üzeri işlem hacmi',
   'Monthly volume over $15,000'),

  -- ==========================================
  -- GBP Thresholds (NCA)
  -- ==========================================

  ('single_transaction', 'GBP', 8000, NULL, NULL, 'report_fiu', 80,
   '£8.000 üzeri tek işlem - NCA bildirimi',
   'Single transaction over £8,000 - NCA reporting'),

  ('single_transaction', 'GBP', 2500, NULL, NULL, 'require_kyc', 50,
   '£2.500 üzeri işlem - KYC zorunlu',
   'Transaction over £2,500 - KYC required')

ON CONFLICT DO NOTHING;

CREATE INDEX idx_aml_thresholds_lookup ON aml_thresholds(currency, threshold_type) WHERE is_active = TRUE;

-- ============================================
-- 3. FRAUD RULES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS fraud_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  rule_name TEXT NOT NULL UNIQUE,
  rule_type TEXT NOT NULL CHECK (rule_type IN (
    'velocity',
    'pattern',
    'geographic',
    'behavioral',
    'device',
    'network',
    'relationship'
  )),

  -- Rule Parameters (JSONB for flexibility)
  parameters JSONB NOT NULL,

  -- Action
  action TEXT NOT NULL CHECK (action IN (
    'allow',
    'flag',
    'challenge',
    'delay',
    'block',
    'ban'
  )),

  risk_score INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,

  description_tr TEXT,
  description_en TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. FRAUD RULES DATA
-- ============================================

INSERT INTO fraud_rules (rule_name, rule_type, parameters, action, risk_score, description_tr, description_en) VALUES

  -- Velocity Rules
  ('rapid_fire_gifts', 'velocity',
   '{"max_count": 5, "time_window_seconds": 300, "action_type": "send"}',
   'block', 80,
   '5 dakikada 5+ hediye gönderimi engellenir',
   '5+ gifts sent within 5 minutes blocked'),

  ('burst_moment_creation', 'velocity',
   '{"max_count": 3, "time_window_seconds": 3600}',
   'flag', 40,
   '1 saatte 3+ moment oluşturma',
   '3+ moments created within 1 hour'),

  ('rapid_withdrawals', 'velocity',
   '{"max_count": 3, "time_window_seconds": 3600}',
   'block', 70,
   '1 saatte 3+ para çekme girişimi',
   '3+ withdrawal attempts within 1 hour'),

  -- Pattern Rules
  ('same_amount_pattern', 'pattern',
   '{"same_amount_count": 5, "time_window_hours": 24}',
   'flag', 50,
   'Aynı tutarda 5+ işlem (24 saat)',
   '5+ transactions with same amount (24h)'),

  ('ping_pong', 'pattern',
   '{"min_exchanges": 3, "time_window_hours": 48}',
   'block', 90,
   'İki kullanıcı arası karşılıklı transferler',
   'Back-and-forth transfers between two users'),

  ('circular_flow', 'pattern',
   '{"min_participants": 3, "time_window_hours": 72}',
   'block', 95,
   'A→B→C→A döngüsel para akışı',
   'Circular money flow A→B→C→A'),

  ('split_gifts', 'pattern',
   '{"threshold_percentage": 90, "split_count": 3, "time_window_minutes": 60}',
   'flag', 60,
   'Tek büyük işlem yerine bölünmüş küçük işlemler',
   'Split small transactions instead of one large'),

  -- Behavioral Rules
  ('new_user_max_send', 'behavioral',
   '{"account_age_hours": 24, "max_total_send_try": 1000}',
   'block', 70,
   'İlk 24 saatte 1.000 TL üzeri gönderim',
   'Sending over 1,000 TL in first 24 hours'),

  ('sudden_activity_spike', 'behavioral',
   '{"dormant_days": 30, "spike_multiplier": 10}',
   'challenge', 60,
   '30 gün pasif hesapta 10x aktivite artışı',
   '10x activity spike in 30-day dormant account'),

  ('gift_without_profile', 'behavioral',
   '{"has_avatar": false, "has_bio": false, "min_gift_amount_try": 500}',
   'flag', 45,
   'Profil tamamlamadan 500+ TL hediye',
   'Gifting 500+ TL without complete profile'),

  ('night_owl_activity', 'behavioral',
   '{"start_hour": 2, "end_hour": 5, "min_amount_try": 5000}',
   'flag', 35,
   'Gece 02:00-05:00 arası yüksek tutarlı işlem',
   'High value transaction between 2-5 AM'),

  -- Geographic Rules
  ('country_mismatch', 'geographic',
   '{"check_ip_country": true, "check_phone_country": true}',
   'challenge', 55,
   'IP ülkesi ve telefon ülkesi uyuşmazlığı',
   'IP country and phone country mismatch'),

  ('high_risk_country', 'geographic',
   '{"countries": ["KP", "IR", "SY", "CU", "VE", "MM"]}',
   'block', 100,
   'Yaptırım listesindeki ülkelerden erişim',
   'Access from sanctioned countries'),

  ('vpn_detection', 'geographic',
   '{"block_known_vpn": true, "flag_datacenter_ip": true}',
   'challenge', 40,
   'VPN veya datacenter IP tespit edildi',
   'VPN or datacenter IP detected'),

  -- Device Rules
  ('multiple_accounts_device', 'device',
   '{"max_accounts_per_device": 2}',
   'flag', 60,
   'Aynı cihazdan 2+ hesap',
   '2+ accounts from same device'),

  ('emulator_detection', 'device',
   '{"block_emulators": true}',
   'challenge', 50,
   'Emülatör tespit edildi',
   'Emulator detected'),

  ('rooted_device', 'device',
   '{"block_rooted": false, "flag_rooted": true}',
   'flag', 30,
   'Root/Jailbreak cihaz tespit edildi',
   'Rooted/Jailbroken device detected'),

  -- Relationship Rules
  ('self_gifting_attempt', 'relationship',
   '{"check_same_person": true}',
   'block', 100,
   'Kendine hediye gönderme girişimi',
   'Self-gifting attempt'),

  ('fake_relationship_farm', 'relationship',
   '{"max_unique_receivers_per_day": 10}',
   'flag', 70,
   'Günde 10+ farklı kişiye hediye',
   '10+ different recipients per day'),

  ('new_receiver_high_amount', 'relationship',
   '{"first_gift_max_try": 2500, "receiver_account_age_days": 7}',
   'challenge', 55,
   'Yeni tanışılan kullanıcıya yüksek tutar',
   'High amount to newly met user')

ON CONFLICT (rule_name) DO NOTHING;

CREATE INDEX idx_fraud_rules_type ON fraud_rules(rule_type) WHERE is_active = TRUE;

-- ============================================
-- 5. USER RISK PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS user_risk_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Current Risk Score (0-100)
  risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  risk_level TEXT GENERATED ALWAYS AS (
    CASE
      WHEN risk_score < 20 THEN 'low'
      WHEN risk_score < 50 THEN 'medium'
      WHEN risk_score < 80 THEN 'high'
      ELSE 'critical'
    END
  ) STORED,

  -- Flags
  flags JSONB DEFAULT '[]',

  -- Stats
  total_sent DECIMAL(12, 2) DEFAULT 0,
  total_received DECIMAL(12, 2) DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  flagged_transactions INTEGER DEFAULT 0,

  -- Status
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason TEXT,
  blocked_at TIMESTAMPTZ,

  -- Review
  last_reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_risk_score ON user_risk_profiles(risk_score DESC) WHERE NOT is_blocked;
CREATE INDEX idx_user_risk_level ON user_risk_profiles(risk_level);

-- ============================================
-- 6. SUSPICIOUS ACTIVITY REPORTS (SAR)
-- ============================================

CREATE TABLE IF NOT EXISTS suspicious_activity_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Report Info
  report_number TEXT UNIQUE,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'sar',
    'ctr',
    'str',
    'aml_alert',
    'fraud_alert'
  )),

  -- Subject
  user_id UUID REFERENCES users(id),
  transaction_ids UUID[],

  -- Details
  triggered_rules TEXT[],
  risk_score INTEGER,
  total_amount DECIMAL(12, 2),
  currency VARCHAR(3),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'investigating',
    'escalated',
    'reported',
    'cleared',
    'confirmed'
  )),

  -- Investigation
  assigned_to TEXT,
  investigation_notes TEXT,

  -- Reporting
  reported_to TEXT,
  reported_at TIMESTAMPTZ,
  reference_number TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Auto-generate report number
CREATE SEQUENCE IF NOT EXISTS sar_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_sar_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.report_number IS NULL THEN
    NEW.report_number := 'SAR-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
      LPAD(nextval('sar_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sar_number ON suspicious_activity_reports;
CREATE TRIGGER trigger_sar_number
BEFORE INSERT ON suspicious_activity_reports
FOR EACH ROW
EXECUTE FUNCTION generate_sar_number();

CREATE INDEX idx_sar_status ON suspicious_activity_reports(status) WHERE status NOT IN ('cleared', 'confirmed');
CREATE INDEX idx_sar_user ON suspicious_activity_reports(user_id);

-- ============================================
-- 7. TRANSACTION COMPLIANCE CHECK FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION check_transaction_compliance(
  p_user_id UUID,
  p_amount DECIMAL,
  p_currency VARCHAR(3),
  p_transaction_type TEXT,
  p_recipient_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user RECORD;
  v_risk_profile RECORD;
  v_aml_threshold RECORD;
  v_fraud_rule RECORD;
  v_result JSONB;
  v_is_allowed BOOLEAN := TRUE;
  v_block_reasons TEXT[] := '{}';
  v_warnings TEXT[] := '{}';
  v_risk_score INTEGER := 0;
  v_requires_kyc BOOLEAN := FALSE;
  v_requires_review BOOLEAN := FALSE;
  v_period_total DECIMAL;
  v_period_count INTEGER;
  v_recent_count INTEGER;
BEGIN
  -- Get user info
  SELECT u.*,
         COALESCE(us.plan_id, 'passport') as subscription_plan
  INTO v_user
  FROM users u
  LEFT JOIN user_subscriptions us ON us.user_id = u.id AND us.status = 'active'
  WHERE u.id = p_user_id;

  IF v_user IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'User not found');
  END IF;

  -- Get or create risk profile
  SELECT * INTO v_risk_profile
  FROM user_risk_profiles
  WHERE user_id = p_user_id;

  IF v_risk_profile IS NULL THEN
    INSERT INTO user_risk_profiles (user_id) VALUES (p_user_id)
    RETURNING * INTO v_risk_profile;
  END IF;

  -- Check if user is blocked
  IF v_risk_profile.is_blocked THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Hesabınız engellenmiştir',
      'block_reason', v_risk_profile.block_reason
    );
  END IF;

  -- =====================================
  -- SELF-GIFT CHECK
  -- =====================================
  IF p_recipient_id IS NOT NULL AND p_recipient_id = p_user_id THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Kendinize hediye gönderemezsiniz'
    );
  END IF;

  -- =====================================
  -- AML THRESHOLD CHECKS
  -- =====================================
  FOR v_aml_threshold IN
    SELECT * FROM aml_thresholds
    WHERE currency = p_currency AND is_active = TRUE
    ORDER BY risk_score DESC
  LOOP
    -- Single transaction threshold
    IF v_aml_threshold.threshold_type = 'single_transaction' AND p_amount >= v_aml_threshold.amount THEN
      v_risk_score := v_risk_score + v_aml_threshold.risk_score;

      IF v_aml_threshold.action = 'block' THEN
        v_is_allowed := FALSE;
        v_block_reasons := array_append(v_block_reasons, v_aml_threshold.description_tr);
      ELSIF v_aml_threshold.action = 'require_kyc' AND v_user.kyc_status != 'verified' THEN
        v_requires_kyc := TRUE;
        v_warnings := array_append(v_warnings, v_aml_threshold.description_tr);
      ELSIF v_aml_threshold.action IN ('report_masak', 'report_fiu') THEN
        v_requires_review := TRUE;
        v_warnings := array_append(v_warnings, 'Bu işlem otorite bildirimi gerektirebilir');
      ELSE
        v_warnings := array_append(v_warnings, v_aml_threshold.description_tr);
      END IF;
    END IF;

    -- Daily volume threshold
    IF v_aml_threshold.threshold_type = 'daily_volume' THEN
      SELECT COALESCE(SUM(amount), 0) INTO v_period_total
      FROM gifts
      WHERE (giver_id = p_user_id OR receiver_id = p_user_id)
        AND created_at >= CURRENT_DATE
        AND currency = p_currency
        AND status NOT IN ('cancelled', 'refunded');

      IF v_period_total + p_amount >= v_aml_threshold.amount THEN
        v_risk_score := v_risk_score + v_aml_threshold.risk_score;
        IF v_aml_threshold.action IN ('report_masak', 'report_fiu') THEN
          v_requires_review := TRUE;
        END IF;
      END IF;
    END IF;

    -- Rapid transactions check
    IF v_aml_threshold.threshold_type = 'rapid_transactions' THEN
      SELECT COUNT(*) INTO v_recent_count
      FROM gifts
      WHERE giver_id = p_user_id
        AND created_at >= NOW() - (v_aml_threshold.time_window_minutes || ' minutes')::INTERVAL
        AND status NOT IN ('cancelled', 'refunded');

      IF v_recent_count >= v_aml_threshold.count_threshold THEN
        v_risk_score := v_risk_score + v_aml_threshold.risk_score;
        IF v_aml_threshold.action = 'block' THEN
          v_is_allowed := FALSE;
          v_block_reasons := array_append(v_block_reasons, v_aml_threshold.description_tr);
        ELSIF v_aml_threshold.action = 'delay' THEN
          v_warnings := array_append(v_warnings, 'İşleminiz gecikmeli onaya alındı');
        END IF;
      END IF;
    END IF;

    -- Structuring detection
    IF v_aml_threshold.threshold_type = 'structuring' THEN
      SELECT COUNT(*), COALESCE(SUM(amount), 0) INTO v_period_count, v_period_total
      FROM gifts
      WHERE giver_id = p_user_id
        AND created_at >= NOW() - (v_aml_threshold.time_window_minutes || ' minutes')::INTERVAL
        AND currency = p_currency
        AND amount >= v_aml_threshold.amount * 0.8
        AND amount < v_aml_threshold.amount * 1.2
        AND status NOT IN ('cancelled', 'refunded');

      IF v_period_count >= v_aml_threshold.count_threshold THEN
        v_risk_score := v_risk_score + v_aml_threshold.risk_score;
        v_is_allowed := FALSE;
        v_block_reasons := array_append(v_block_reasons, v_aml_threshold.description_tr);
      END IF;
    END IF;
  END LOOP;

  -- =====================================
  -- FRAUD RULE CHECKS
  -- =====================================

  -- New user high amount check
  IF v_user.created_at > NOW() - INTERVAL '24 hours' THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_period_total
    FROM gifts
    WHERE giver_id = p_user_id
      AND currency = 'TRY'
      AND status NOT IN ('cancelled', 'refunded');

    IF v_period_total + (CASE WHEN p_currency = 'TRY' THEN p_amount ELSE p_amount * 35 END) > 1000 THEN
      v_risk_score := v_risk_score + 70;
      v_is_allowed := FALSE;
      v_block_reasons := array_append(v_block_reasons, 'Yeni hesaplar için 24 saat içinde maksimum 1.000 TL gönderim limiti');
    END IF;
  END IF;

  -- =====================================
  -- KYC ENFORCEMENT
  -- =====================================
  IF v_requires_kyc AND v_user.kyc_status != 'verified' THEN
    v_is_allowed := FALSE;
    v_block_reasons := array_append(v_block_reasons, 'Bu işlem için kimlik doğrulama gereklidir');
  END IF;

  -- =====================================
  -- UPDATE RISK PROFILE
  -- =====================================
  UPDATE user_risk_profiles
  SET
    risk_score = LEAST(100, risk_score + (v_risk_score / 10)),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- =====================================
  -- CREATE SAR IF NEEDED
  -- =====================================
  IF v_requires_review THEN
    INSERT INTO suspicious_activity_reports (
      report_type,
      user_id,
      triggered_rules,
      risk_score,
      total_amount,
      currency,
      status
    ) VALUES (
      'aml_alert',
      p_user_id,
      v_warnings,
      v_risk_score,
      p_amount,
      p_currency,
      'pending'
    );
  END IF;

  -- =====================================
  -- BUILD RESULT
  -- =====================================
  v_result := jsonb_build_object(
    'allowed', v_is_allowed,
    'user_plan', v_user.subscription_plan,
    'kyc_status', v_user.kyc_status,
    'risk_score', v_risk_score,
    'risk_level', CASE
      WHEN v_risk_score < 20 THEN 'low'
      WHEN v_risk_score < 50 THEN 'medium'
      WHEN v_risk_score < 80 THEN 'high'
      ELSE 'critical'
    END,
    'requires_kyc', v_requires_kyc,
    'requires_review', v_requires_review,
    'block_reasons', v_block_reasons,
    'warnings', v_warnings
  );

  RETURN v_result;
END;
$$;

-- ============================================
-- 8. GRANTS
-- ============================================

GRANT SELECT ON aml_thresholds TO authenticated;
GRANT SELECT ON fraud_rules TO authenticated;
GRANT SELECT ON user_risk_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION check_transaction_compliance TO authenticated;

-- Admin only
GRANT ALL ON suspicious_activity_reports TO service_role;

-- ============================================
-- 9. RLS POLICIES
-- ============================================

ALTER TABLE user_risk_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own risk profile" ON user_risk_profiles;
CREATE POLICY "Users can view own risk profile"
ON user_risk_profiles FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- 10. COMMENTS
-- ============================================

COMMENT ON TABLE aml_thresholds IS 'AML eşikleri - MASAK, EU AML, FinCEN uyumlu (TRY/EUR/USD/GBP)';
COMMENT ON TABLE fraud_rules IS 'Fraud tespit kuralları (velocity, pattern, behavioral, geographic, device, relationship)';
COMMENT ON TABLE user_risk_profiles IS 'Kullanıcı risk profilleri ve skorları';
COMMENT ON TABLE suspicious_activity_reports IS 'Şüpheli Aktivite Raporları (SAR/STR)';
COMMENT ON FUNCTION check_transaction_compliance IS 'İşlem öncesi AML ve fraud kontrollerini yapar';
