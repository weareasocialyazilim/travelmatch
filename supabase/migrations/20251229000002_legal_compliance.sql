-- ============================================
-- TravelMatch Yasal Uyumluluk & Güvenlik
-- Migration: 20251229000002_legal_compliance.sql
-- ============================================
--
-- Bu migration şunları kapsar:
-- 1. KVKK Uyumluluğu (Açık Rıza, Aydınlatma)
-- 2. Kullanıcı Onayları Takibi
-- 3. Veri Saklama & Silme Politikaları
-- 4. Mesafeli Satış Sözleşmesi
-- 5. Güvenlik Logları
-- 6. Ödeme Güvenliği
-- ============================================

-- ============================================
-- 1. KULLANICI ONAYLARI (KVKK & Ticari İleti)
-- ============================================

CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- KVKK Onayları
  kvkk_aydinlatma_accepted BOOLEAN DEFAULT FALSE,
  kvkk_aydinlatma_accepted_at TIMESTAMPTZ,
  kvkk_aydinlatma_version TEXT, -- Hangi versiyon kabul edildi

  kvkk_acik_riza_accepted BOOLEAN DEFAULT FALSE,
  kvkk_acik_riza_accepted_at TIMESTAMPTZ,
  kvkk_acik_riza_version TEXT,

  -- Ticari İleti İzinleri (İYS uyumlu)
  commercial_sms_allowed BOOLEAN DEFAULT FALSE,
  commercial_sms_allowed_at TIMESTAMPTZ,
  commercial_email_allowed BOOLEAN DEFAULT FALSE,
  commercial_email_allowed_at TIMESTAMPTZ,
  commercial_push_allowed BOOLEAN DEFAULT FALSE,
  commercial_push_allowed_at TIMESTAMPTZ,

  -- Platform Sözleşmeleri
  terms_of_service_accepted BOOLEAN DEFAULT FALSE,
  terms_of_service_accepted_at TIMESTAMPTZ,
  terms_of_service_version TEXT,

  privacy_policy_accepted BOOLEAN DEFAULT FALSE,
  privacy_policy_accepted_at TIMESTAMPTZ,
  privacy_policy_version TEXT,

  -- Cookie (Çerez) İzinleri
  cookie_essential BOOLEAN DEFAULT TRUE, -- Zorunlu, her zaman true
  cookie_analytics BOOLEAN DEFAULT FALSE,
  cookie_marketing BOOLEAN DEFAULT FALSE,
  cookie_preferences_set_at TIMESTAMPTZ,

  -- IP ve Cihaz Bilgisi (kanıt için)
  consent_ip_address INET,
  consent_user_agent TEXT,
  consent_device_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user ON user_consents(user_id);

-- Onay geçmişi (her değişiklik loglanır)
CREATE TABLE IF NOT EXISTS consent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'kvkk_aydinlatma', 'commercial_sms', etc.
  old_value BOOLEAN,
  new_value BOOLEAN,
  version TEXT,
  ip_address INET,
  user_agent TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_history_user ON consent_history(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_history_type ON consent_history(consent_type);

-- Trigger: Onay değişikliklerini logla
CREATE OR REPLACE FUNCTION log_consent_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  consent_fields TEXT[] := ARRAY[
    'kvkk_aydinlatma_accepted', 'kvkk_acik_riza_accepted',
    'commercial_sms_allowed', 'commercial_email_allowed', 'commercial_push_allowed',
    'terms_of_service_accepted', 'privacy_policy_accepted',
    'cookie_analytics', 'cookie_marketing'
  ];
  field_name TEXT;
  old_val BOOLEAN;
  new_val BOOLEAN;
BEGIN
  FOREACH field_name IN ARRAY consent_fields
  LOOP
    EXECUTE format('SELECT ($1).%I, ($2).%I', field_name, field_name)
    INTO old_val, new_val
    USING OLD, NEW;

    IF old_val IS DISTINCT FROM new_val THEN
      INSERT INTO consent_history (user_id, consent_type, old_value, new_value, ip_address, user_agent)
      VALUES (NEW.user_id, field_name, old_val, new_val, NEW.consent_ip_address, NEW.consent_user_agent);
    END IF;
  END LOOP;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_consent_change ON user_consents;
CREATE TRIGGER trg_log_consent_change
  BEFORE UPDATE ON user_consents
  FOR EACH ROW
  EXECUTE FUNCTION log_consent_change();

-- ============================================
-- 2. MESAFELİ SATIŞ SÖZLEŞMESİ
-- ============================================

CREATE TABLE IF NOT EXISTS gift_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,

  -- Taraflar
  giver_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),

  -- Sözleşme Detayları
  contract_number TEXT NOT NULL UNIQUE, -- TM-2024-000001 formatında
  contract_version TEXT NOT NULL DEFAULT '1.0',

  -- Ön Bilgilendirme
  pre_info_accepted BOOLEAN DEFAULT FALSE,
  pre_info_accepted_at TIMESTAMPTZ,

  -- Mesafeli Satış Sözleşmesi
  distance_contract_accepted BOOLEAN DEFAULT FALSE,
  distance_contract_accepted_at TIMESTAMPTZ,

  -- Sözleşme Tutarları
  base_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',

  -- Cayma Hakkı
  withdrawal_deadline TIMESTAMPTZ, -- 14 gün (hizmet başlamadan önce)
  withdrawal_used BOOLEAN DEFAULT FALSE,
  withdrawal_used_at TIMESTAMPTZ,
  withdrawal_reason TEXT,

  -- Moment/Hizmet Bilgisi
  moment_id UUID NOT NULL REFERENCES moments(id),
  moment_title TEXT NOT NULL,
  moment_description TEXT,

  -- İmza Bilgileri
  giver_ip_address INET,
  giver_user_agent TEXT,
  giver_device_id TEXT,

  -- PDF Depolama
  contract_pdf_url TEXT, -- Storage URL
  contract_pdf_hash TEXT, -- SHA256 hash for integrity

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_contracts_gift ON gift_contracts(gift_id);
CREATE INDEX IF NOT EXISTS idx_gift_contracts_giver ON gift_contracts(giver_id);
CREATE INDEX IF NOT EXISTS idx_gift_contracts_number ON gift_contracts(contract_number);

-- Sözleşme numarası oluştur
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  year_part TEXT;
  seq_part TEXT;
  next_seq INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;

  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(contract_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO next_seq
  FROM gift_contracts
  WHERE contract_number LIKE 'TM-' || year_part || '-%';

  seq_part := LPAD(next_seq::TEXT, 6, '0');

  RETURN 'TM-' || year_part || '-' || seq_part;
END;
$$;

-- ============================================
-- 3. VERİ SAKLAMA & SİLME (KVKK Md. 7)
-- ============================================

-- Veri silme talepleri
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Talep Detayları
  request_type TEXT NOT NULL, -- 'full_deletion', 'partial_deletion', 'data_export'
  reason TEXT,

  -- İşlem Durumu
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, rejected

  -- İşlem Detayları
  processed_by UUID,
  processed_at TIMESTAMPTZ,
  processing_notes TEXT,

  -- Silinen Veriler (audit için)
  deleted_data_summary JSONB, -- Hangi tablolardan ne silindi

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- KVKK 30 gün kuralı
  deadline TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_user ON data_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON data_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_deadline ON data_deletion_requests(deadline) WHERE status = 'pending';

-- Otomatik veri anonimleştirme (soft delete yerine)
CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result JSONB := '{}'::jsonb;
  v_anon_email TEXT;
  v_anon_name TEXT;
BEGIN
  -- Anonimleştirilmiş değerler
  v_anon_email := 'deleted_' || SUBSTRING(p_user_id::TEXT, 1, 8) || '@deleted.local';
  v_anon_name := 'Silinmiş Kullanıcı';

  -- Profil anonimleştir
  UPDATE profiles
  SET
    full_name = v_anon_name,
    bio = NULL,
    avatar_url = NULL,
    phone = NULL,
    location = NULL,
    social_links = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;

  v_result := v_result || jsonb_build_object('profiles', 1);

  -- Kayıtlı kartları sil
  DELETE FROM saved_cards WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_result = ROW_COUNT;

  -- Onayları temizle (tarihler kalır, yasal kanıt için)
  UPDATE user_consents
  SET
    consent_ip_address = NULL,
    consent_user_agent = NULL,
    consent_device_id = NULL
  WHERE user_id = p_user_id;

  v_result := v_result || jsonb_build_object('consents_anonymized', 1);

  -- Bildirimleri sil
  DELETE FROM notifications WHERE user_id = p_user_id;

  -- User'ı deaktif et
  UPDATE users
  SET
    is_active = FALSE,
    deleted_at = NOW()
  WHERE id = p_user_id;

  RETURN v_result;
END;
$$;

-- ============================================
-- 4. GÜVENLİK LOGLARI
-- ============================================

CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Event Detayları
  event_type TEXT NOT NULL, -- 'login', 'logout', 'password_change', 'payment_attempt', etc.
  event_status TEXT NOT NULL, -- 'success', 'failure', 'blocked'
  event_details JSONB DEFAULT '{}'::jsonb,

  -- Risk Değerlendirmesi
  risk_score INTEGER DEFAULT 0, -- 0-100
  risk_factors TEXT[],

  -- Konum/Cihaz
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  geo_country TEXT,
  geo_city TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_logs_user ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created ON security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_risk ON security_logs(risk_score) WHERE risk_score > 50;
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_logs(ip_address);

-- Şüpheli aktivite tespiti
CREATE OR REPLACE FUNCTION check_suspicious_activity(
  p_user_id UUID,
  p_event_type TEXT,
  p_ip_address INET
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_risk_score INTEGER := 0;
  v_risk_factors TEXT[] := '{}';
  v_recent_failures INTEGER;
  v_different_ips INTEGER;
  v_result JSONB;
BEGIN
  -- Son 1 saatteki başarısız denemeler
  SELECT COUNT(*) INTO v_recent_failures
  FROM security_logs
  WHERE user_id = p_user_id
    AND event_type = p_event_type
    AND event_status = 'failure'
    AND created_at > NOW() - INTERVAL '1 hour';

  IF v_recent_failures >= 5 THEN
    v_risk_score := v_risk_score + 40;
    v_risk_factors := v_risk_factors || 'multiple_failures';
  END IF;

  -- Son 24 saatte farklı IP'ler
  SELECT COUNT(DISTINCT ip_address) INTO v_different_ips
  FROM security_logs
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '24 hours';

  IF v_different_ips >= 5 THEN
    v_risk_score := v_risk_score + 30;
    v_risk_factors := v_risk_factors || 'multiple_ips';
  END IF;

  -- Daha önce hiç kullanılmamış IP
  IF NOT EXISTS (
    SELECT 1 FROM security_logs
    WHERE user_id = p_user_id
      AND ip_address = p_ip_address
      AND created_at < NOW() - INTERVAL '1 hour'
  ) THEN
    v_risk_score := v_risk_score + 20;
    v_risk_factors := v_risk_factors || 'new_ip';
  END IF;

  v_result := jsonb_build_object(
    'risk_score', v_risk_score,
    'risk_factors', v_risk_factors,
    'should_block', v_risk_score >= 70,
    'require_2fa', v_risk_score >= 50
  );

  RETURN v_result;
END;
$$;

-- ============================================
-- 5. ÖDEME GÜVENLİĞİ
-- ============================================

-- Ödeme limitleri
CREATE TABLE IF NOT EXISTS payment_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Limit Türü
  limit_type TEXT NOT NULL, -- 'daily_user', 'weekly_user', 'monthly_user', 'per_transaction'

  -- Değerler
  min_amount DECIMAL(10,2),
  max_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',

  -- Uygulama
  applies_to TEXT NOT NULL DEFAULT 'all', -- 'all', 'new_users', 'unverified'
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default limitler
INSERT INTO payment_limits (limit_type, min_amount, max_amount, currency, applies_to) VALUES
  ('per_transaction', 10, 10000, 'TRY', 'all'),
  ('daily_user', NULL, 25000, 'TRY', 'all'),
  ('weekly_user', NULL, 100000, 'TRY', 'all'),
  ('per_transaction', 10, 2500, 'TRY', 'new_users'), -- İlk 30 gün
  ('daily_user', NULL, 5000, 'TRY', 'new_users')
ON CONFLICT DO NOTHING;

-- Limit kontrolü
CREATE OR REPLACE FUNCTION check_payment_limits(
  p_user_id UUID,
  p_amount DECIMAL,
  p_currency TEXT DEFAULT 'TRY'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_created_at TIMESTAMPTZ;
  v_is_new_user BOOLEAN;
  v_daily_total DECIMAL;
  v_weekly_total DECIMAL;
  v_limit RECORD;
  v_errors TEXT[] := '{}';
BEGIN
  -- Kullanıcı yaşı
  SELECT created_at INTO v_user_created_at FROM users WHERE id = p_user_id;
  v_is_new_user := v_user_created_at > NOW() - INTERVAL '30 days';

  -- Günlük toplam
  SELECT COALESCE(SUM(giver_pays), 0) INTO v_daily_total
  FROM commission_ledger
  WHERE giver_id = p_user_id
    AND currency = p_currency
    AND status IN ('collected', 'transferred')
    AND created_at > NOW() - INTERVAL '1 day';

  -- Haftalık toplam
  SELECT COALESCE(SUM(giver_pays), 0) INTO v_weekly_total
  FROM commission_ledger
  WHERE giver_id = p_user_id
    AND currency = p_currency
    AND status IN ('collected', 'transferred')
    AND created_at > NOW() - INTERVAL '7 days';

  -- Limitleri kontrol et
  FOR v_limit IN
    SELECT * FROM payment_limits
    WHERE currency = p_currency
      AND is_active = TRUE
      AND (applies_to = 'all' OR (applies_to = 'new_users' AND v_is_new_user))
    ORDER BY
      CASE applies_to WHEN 'new_users' THEN 1 ELSE 2 END
  LOOP
    CASE v_limit.limit_type
      WHEN 'per_transaction' THEN
        IF v_limit.min_amount IS NOT NULL AND p_amount < v_limit.min_amount THEN
          v_errors := v_errors || format('Minimum tutar: %s %s', v_limit.min_amount, p_currency);
        END IF;
        IF p_amount > v_limit.max_amount THEN
          v_errors := v_errors || format('Maksimum tutar: %s %s', v_limit.max_amount, p_currency);
        END IF;

      WHEN 'daily_user' THEN
        IF v_daily_total + p_amount > v_limit.max_amount THEN
          v_errors := v_errors || format('Günlük limit aşıldı. Kalan: %s %s',
            GREATEST(0, v_limit.max_amount - v_daily_total), p_currency);
        END IF;

      WHEN 'weekly_user' THEN
        IF v_weekly_total + p_amount > v_limit.max_amount THEN
          v_errors := v_errors || format('Haftalık limit aşıldı. Kalan: %s %s',
            GREATEST(0, v_limit.max_amount - v_weekly_total), p_currency);
        END IF;
    END CASE;
  END LOOP;

  RETURN jsonb_build_object(
    'allowed', array_length(v_errors, 1) IS NULL,
    'errors', v_errors,
    'daily_used', v_daily_total,
    'weekly_used', v_weekly_total,
    'is_new_user', v_is_new_user
  );
END;
$$;

-- ============================================
-- 6. FRAUD DETECTION
-- ============================================

CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),

  -- Alert Detayları
  alert_type TEXT NOT NULL, -- 'velocity', 'amount_spike', 'new_device', 'location_mismatch'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'

  -- İlgili İşlem
  transaction_id UUID,
  escrow_id UUID REFERENCES escrow_transactions(id),

  -- Detaylar
  details JSONB NOT NULL,

  -- Durum
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'false_positive'
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fraud_alerts_user ON fraud_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON fraud_alerts(status) WHERE status IN ('open', 'investigating');
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_severity ON fraud_alerts(severity) WHERE status = 'open';

-- Basit fraud kontrolü
CREATE OR REPLACE FUNCTION check_fraud_signals(
  p_user_id UUID,
  p_amount DECIMAL,
  p_ip_address INET,
  p_device_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_alerts JSONB[] := '{}';
  v_avg_amount DECIMAL;
  v_recent_count INTEGER;
  v_last_device TEXT;
  v_result JSONB;
BEGIN
  -- 1. Ortalama tutarın çok üstünde mi?
  SELECT AVG(base_amount) INTO v_avg_amount
  FROM commission_ledger
  WHERE giver_id = p_user_id
    AND status IN ('collected', 'transferred');

  IF v_avg_amount IS NOT NULL AND p_amount > v_avg_amount * 5 THEN
    v_alerts := v_alerts || jsonb_build_object(
      'type', 'amount_spike',
      'message', 'Tutar ortalamanın 5 katından fazla',
      'severity', 'medium'
    );
  END IF;

  -- 2. Son 10 dakikada çok fazla işlem?
  SELECT COUNT(*) INTO v_recent_count
  FROM commission_ledger
  WHERE giver_id = p_user_id
    AND created_at > NOW() - INTERVAL '10 minutes';

  IF v_recent_count >= 3 THEN
    v_alerts := v_alerts || jsonb_build_object(
      'type', 'velocity',
      'message', 'Kısa sürede çok fazla işlem',
      'severity', 'high'
    );
  END IF;

  -- 3. Yeni cihaz mı?
  SELECT device_fingerprint INTO v_last_device
  FROM security_logs
  WHERE user_id = p_user_id
    AND event_type = 'payment_attempt'
    AND event_status = 'success'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_last_device IS NOT NULL AND v_last_device != p_device_id THEN
    v_alerts := v_alerts || jsonb_build_object(
      'type', 'new_device',
      'message', 'Yeni cihazdan işlem',
      'severity', 'low'
    );
  END IF;

  -- Sonuç
  v_result := jsonb_build_object(
    'alerts', v_alerts,
    'should_block', EXISTS (
      SELECT 1 FROM unnest(v_alerts) a
      WHERE (a->>'severity') = 'critical'
    ),
    'require_verification', EXISTS (
      SELECT 1 FROM unnest(v_alerts) a
      WHERE (a->>'severity') IN ('high', 'critical')
    )
  );

  -- Yüksek severity varsa kaydet
  IF jsonb_array_length(v_result->'alerts') > 0 THEN
    INSERT INTO fraud_alerts (user_id, alert_type, severity, details)
    SELECT
      p_user_id,
      a->>'type',
      a->>'severity',
      a
    FROM unnest(v_alerts) a
    WHERE (a->>'severity') IN ('high', 'critical');
  END IF;

  RETURN v_result;
END;
$$;

-- ============================================
-- 7. IBAN DOĞRULAMA
-- ============================================

CREATE TABLE IF NOT EXISTS user_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Banka Bilgileri
  iban TEXT NOT NULL,
  iban_hash TEXT NOT NULL, -- SHA256 hash for searching
  bank_name TEXT,
  account_holder_name TEXT NOT NULL,

  -- Doğrulama
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verification_method TEXT, -- 'micro_deposit', 'document', 'manual'

  -- Varsayılan
  is_default BOOLEAN DEFAULT FALSE,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Bir user'ın aynı IBAN'ı iki kez eklemesini önle
  CONSTRAINT unique_user_iban UNIQUE (user_id, iban_hash)
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_user ON user_bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_iban_hash ON user_bank_accounts(iban_hash);

-- IBAN doğrulama (Türkiye formatı)
CREATE OR REPLACE FUNCTION validate_turkish_iban(p_iban TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_clean_iban TEXT;
  v_bank_code TEXT;
  v_is_valid BOOLEAN := FALSE;
BEGIN
  -- Temizle
  v_clean_iban := UPPER(REGEXP_REPLACE(p_iban, '[^A-Z0-9]', '', 'g'));

  -- Türk IBAN kontrolü
  IF LENGTH(v_clean_iban) = 26 AND v_clean_iban LIKE 'TR%' THEN
    v_bank_code := SUBSTRING(v_clean_iban, 5, 5);
    v_is_valid := TRUE;
  END IF;

  RETURN jsonb_build_object(
    'is_valid', v_is_valid,
    'iban', v_clean_iban,
    'bank_code', v_bank_code,
    'error', CASE WHEN NOT v_is_valid THEN 'Geçersiz Türk IBAN formatı' ELSE NULL END
  );
END;
$$;

-- ============================================
-- 8. RLS POLİTİKALARI
-- ============================================

ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bank_accounts ENABLE ROW LEVEL SECURITY;

-- User consents - kullanıcı sadece kendisini
CREATE POLICY "Users can view own consents"
  ON user_consents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own consents"
  ON user_consents FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own consents"
  ON user_consents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Consent history - sadece kendi
CREATE POLICY "Users can view own consent history"
  ON consent_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Gift contracts - taraflar görebilir
CREATE POLICY "Contract parties can view"
  ON gift_contracts FOR SELECT
  TO authenticated
  USING (auth.uid() IN (giver_id, receiver_id));

-- Deletion requests - sadece kendi
CREATE POLICY "Users can view own deletion requests"
  ON data_deletion_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create deletion requests"
  ON data_deletion_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Bank accounts - sadece kendi
CREATE POLICY "Users can manage own bank accounts"
  ON user_bank_accounts FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- 9. GRANTS
-- ============================================

GRANT SELECT, UPDATE, INSERT ON user_consents TO authenticated;
GRANT SELECT ON consent_history TO authenticated;
GRANT SELECT ON gift_contracts TO authenticated;
GRANT SELECT, INSERT ON data_deletion_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_bank_accounts TO authenticated;

GRANT EXECUTE ON FUNCTION validate_turkish_iban TO authenticated;
GRANT EXECUTE ON FUNCTION check_payment_limits TO authenticated;
GRANT EXECUTE ON FUNCTION check_fraud_signals TO authenticated;
GRANT EXECUTE ON FUNCTION check_suspicious_activity TO authenticated;
GRANT EXECUTE ON FUNCTION generate_contract_number TO authenticated;
GRANT EXECUTE ON FUNCTION anonymize_user_data TO service_role;

-- ============================================
-- 10. YORUMLAR
-- ============================================

COMMENT ON TABLE user_consents IS 'KVKK ve ticari ileti onayları - yasal zorunluluk';
COMMENT ON TABLE consent_history IS 'Onay değişiklik geçmişi - yasal kanıt';
COMMENT ON TABLE gift_contracts IS 'Mesafeli satış sözleşmeleri - tüketici hukuku';
COMMENT ON TABLE data_deletion_requests IS 'KVKK veri silme talepleri - 30 gün içinde yanıt zorunlu';
COMMENT ON TABLE security_logs IS 'Güvenlik olayları - fraud detection';
COMMENT ON TABLE fraud_alerts IS 'Şüpheli aktivite uyarıları';
COMMENT ON TABLE user_bank_accounts IS 'Kullanıcı IBAN bilgileri - PayTR transferi için';
