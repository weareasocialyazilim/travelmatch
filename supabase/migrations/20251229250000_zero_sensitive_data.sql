-- ============================================
-- Lovendo Zero-Sensitive-Data Schema
-- Migration: 20251229250000_zero_sensitive_data.sql
-- ============================================
--
-- PRENSİP: "Bizde olmayan veri, çalınamaz"
--
-- SAKLADIKLARIMIZ:
-- ✅ Token (PayTR card token)
-- ✅ Hash (TC, telefon, IBAN)
-- ✅ Masked (görüntüleme için)
-- ✅ Provider referansları (scanRef, transactionId)
--
-- SAKLAMADIKLARIMIZ:
-- ❌ Kredi kartı numarası
-- ❌ CVV
-- ❌ Kimlik belgesi görüntüsü
-- ❌ Biyometrik veri
-- ❌ TC Kimlik numarası (plain text)
-- ❌ Tam telefon numarası
-- ❌ Tam IBAN
-- ============================================

-- ============================================
-- 1. USERS TABLE UPDATES (Hassas Veri Yok)
-- ============================================

-- TC Kimlik: Sadece HASH (numara saklanmaz)
ALTER TABLE users ADD COLUMN IF NOT EXISTS tc_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tc_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tc_verified_at TIMESTAMPTZ;

-- Telefon: MASKED + HASH (full numara yok)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_masked TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;

-- KYC: Sadece STATUS + REFERENCE (belge saklanmaz)
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_scan_ref TEXT;

-- Unique constraints (duplicate prevention via hash)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tc_hash
ON users(tc_hash) WHERE tc_hash IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_hash
ON users(phone_hash) WHERE phone_hash IS NOT NULL;

-- ============================================
-- 2. SAVED CARDS (Token Only - Kart Numarası YOK)
-- ============================================

CREATE TABLE IF NOT EXISTS saved_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- PayTR Token (Kart numarası DEĞİL!)
  card_token TEXT NOT NULL,

  -- Görüntüleme için masked bilgiler
  masked_pan TEXT NOT NULL,           -- **** **** **** 1234
  card_brand TEXT,                    -- Visa, Mastercard, Troy
  card_bank TEXT,                     -- Garanti, Yapı Kredi, vs.
  card_type TEXT,                     -- credit, debit, prepaid
  card_family TEXT,                   -- Bonus, Maximum, World, vs.

  -- Kullanıcı tercihleri
  is_default BOOLEAN DEFAULT FALSE,
  nickname TEXT,                      -- "İş kartım", "Kişisel"

  -- ❌ BUNLAR YOK:
  -- card_number ❌
  -- cvv ❌
  -- expiry_month ❌
  -- expiry_year ❌

  -- Meta
  provider TEXT DEFAULT 'paytr',
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Soft delete (removed - existing table doesn't have these)
  deleted_at TIMESTAMPTZ
);

-- Indexes (modified - is_active column doesn't exist in existing table)
-- These indexes already exist without the is_active filter

-- RLS
ALTER TABLE saved_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own cards" ON saved_cards;
CREATE POLICY "Users can view own cards" ON saved_cards
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cards" ON saved_cards;
CREATE POLICY "Users can insert own cards" ON saved_cards
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cards" ON saved_cards;
CREATE POLICY "Users can update own cards" ON saved_cards
FOR UPDATE USING (auth.uid() = user_id);

-- Sadece 1 default kart
CREATE OR REPLACE FUNCTION ensure_single_default_card()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE saved_cards
    SET is_default = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_single_default_card ON saved_cards;
CREATE TRIGGER trigger_single_default_card
BEFORE INSERT OR UPDATE ON saved_cards
FOR EACH ROW
WHEN (NEW.is_default = TRUE)
EXECUTE FUNCTION ensure_single_default_card();

-- ============================================
-- 3. KYC VERIFICATIONS (Referans Only - Belge YOK)
-- ============================================

CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Provider bilgileri (using existing column names)
  provider TEXT NOT NULL DEFAULT 'idenfy',
  provider_id TEXT,                   -- Provider referans ID (was scan_ref)
  provider_check_id TEXT,             -- Check ID

  -- Durum
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'approved', 'denied', 'expired', 'verified', 'rejected', 'needs_review')
  ),

  -- Genel bilgiler (hassas DEĞİL)
  confidence DECIMAL(3, 2),           -- 0.00 to 1.00

  -- Sonuç detayları
  rejection_reasons TEXT[],           -- Red nedenleri (varsa)
  metadata JSONB,                     -- Ek veriler

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (using existing column names)
CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_verifications(status);

-- RLS
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own kyc" ON kyc_verifications;
CREATE POLICY "Users can view own kyc" ON kyc_verifications
FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 4. BANK ACCOUNTS (IBAN Masked - Full YOK)
-- ============================================

CREATE TABLE IF NOT EXISTS user_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Masked IBAN (gösterim için)
  iban_masked TEXT NOT NULL,          -- TR** **** **** **** **** 1234
  iban_hash TEXT NOT NULL,            -- SHA256 hash (duplicate check)

  -- Banka bilgileri (public)
  bank_name TEXT,                     -- Garanti BBVA
  bank_code TEXT,                     -- 0062
  branch_code TEXT,                   -- Şube kodu

  -- Hesap sahibi (doğrulanmış)
  account_holder_name TEXT,           -- KYC'den gelen isim

  -- Kullanıcı tercihleri
  is_default BOOLEAN DEFAULT FALSE,
  nickname TEXT,                      -- "Maaş hesabım"

  -- ❌ BUNLAR YOK:
  -- iban_full ❌

  -- Meta
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (is_active removed as column doesn't exist)
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user ON user_bank_accounts(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bank_accounts_iban_hash ON user_bank_accounts(iban_hash);

-- RLS
ALTER TABLE user_bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bank accounts" ON user_bank_accounts;
CREATE POLICY "Users can view own bank accounts" ON user_bank_accounts
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own bank accounts" ON user_bank_accounts;
CREATE POLICY "Users can manage own bank accounts" ON user_bank_accounts
FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 5. PAYMENT TRANSACTIONS (Referans Only)
-- ============================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- İlişkiler
  user_id UUID NOT NULL REFERENCES users(id),
  gift_id UUID REFERENCES gifts(id),

  -- Provider bilgileri
  provider TEXT NOT NULL DEFAULT 'paytr',
  provider_transaction_id TEXT NOT NULL,  -- PayTR işlem ID
  provider_order_id TEXT,                 -- Bizim order ID'miz

  -- Tutar bilgileri
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',

  -- Komisyon bilgileri
  commission_amount DECIMAL(12, 2) DEFAULT 0,
  net_amount DECIMAL(12, 2),

  -- Durum
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')
  ),

  -- Ödeme yöntemi (referans)
  payment_method TEXT,                    -- card, bank_transfer, wallet
  card_id UUID REFERENCES saved_cards(id),
  masked_pan TEXT,                        -- **** 1234

  -- ❌ BUNLAR YOK:
  -- card_number ❌
  -- cvv ❌

  -- Hata bilgisi
  error_code TEXT,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Fraud tracking
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_gift ON payment_transactions(gift_id);
CREATE INDEX IF NOT EXISTS idx_transactions_provider_id ON payment_transactions(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON payment_transactions(created_at DESC);

-- RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON payment_transactions;
CREATE POLICY "Users can view own transactions" ON payment_transactions
FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 6. WITHDRAWAL REQUESTS
-- ============================================

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Tutar
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',

  -- Hedef hesap (referans - full IBAN yok)
  bank_account_id UUID REFERENCES user_bank_accounts(id),
  iban_masked TEXT NOT NULL,          -- TR** **** **** 1234

  -- Durum
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')
  ),

  -- Provider bilgileri
  provider TEXT DEFAULT 'paytr',
  provider_transfer_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawal_requests;
CREATE POLICY "Users can view own withdrawals" ON withdrawal_requests
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create withdrawals" ON withdrawal_requests;
CREATE POLICY "Users can create withdrawals" ON withdrawal_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. HELPER FUNCTIONS (Masking)
-- ============================================

-- IBAN Maskeleme
CREATE OR REPLACE FUNCTION mask_iban(iban TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF iban IS NULL OR LENGTH(iban) < 10 THEN
    RETURN NULL;
  END IF;

  -- TR33 0006 1005 1978 6457 8413 26
  -- TR** **** **** **** **** **26
  RETURN SUBSTRING(iban, 1, 2) || '** **** **** **** **** **' || SUBSTRING(iban, LENGTH(iban) - 1, 2);
END;
$$;

-- Kart Numarası Maskeleme
CREATE OR REPLACE FUNCTION mask_card_number(card_number TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF card_number IS NULL OR LENGTH(card_number) < 12 THEN
    RETURN NULL;
  END IF;

  -- 4532015112830366 -> **** **** **** 0366
  RETURN '**** **** **** ' || SUBSTRING(card_number, LENGTH(card_number) - 3, 4);
END;
$$;

-- Telefon Maskeleme
CREATE OR REPLACE FUNCTION mask_phone(phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  digits TEXT;
BEGIN
  IF phone IS NULL THEN
    RETURN NULL;
  END IF;

  -- Sadece rakamları al
  digits := REGEXP_REPLACE(phone, '[^0-9]', '', 'g');

  IF LENGTH(digits) < 10 THEN
    RETURN NULL;
  END IF;

  -- 905321234567 -> +90 532 *** ** 67
  RETURN '+' || SUBSTRING(digits, 1, 2) || ' ' ||
         SUBSTRING(digits, 3, 3) || ' *** ** ' ||
         SUBSTRING(digits, LENGTH(digits) - 1, 2);
END;
$$;

-- TC Kimlik Hash (salt ile)
CREATE OR REPLACE FUNCTION hash_tc_kimlik(tc_kimlik TEXT, salt TEXT DEFAULT '')
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF tc_kimlik IS NULL OR LENGTH(tc_kimlik) != 11 THEN
    RETURN NULL;
  END IF;

  RETURN encode(sha256((tc_kimlik || COALESCE(salt, ''))::bytea), 'hex');
END;
$$;

-- Phone Hash
CREATE OR REPLACE FUNCTION hash_phone(phone TEXT, salt TEXT DEFAULT '')
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  digits TEXT;
BEGIN
  IF phone IS NULL THEN
    RETURN NULL;
  END IF;

  digits := REGEXP_REPLACE(phone, '[^0-9]', '', 'g');

  IF LENGTH(digits) < 10 THEN
    RETURN NULL;
  END IF;

  RETURN encode(sha256((digits || COALESCE(salt, ''))::bytea), 'hex');
END;
$$;

-- IBAN Hash
CREATE OR REPLACE FUNCTION hash_iban(iban TEXT, salt TEXT DEFAULT '')
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  clean_iban TEXT;
BEGIN
  IF iban IS NULL THEN
    RETURN NULL;
  END IF;

  -- Boşlukları kaldır, büyük harfe çevir
  clean_iban := UPPER(REGEXP_REPLACE(iban, '\s', '', 'g'));

  RETURN encode(sha256((clean_iban || COALESCE(salt, ''))::bytea), 'hex');
END;
$$;

-- ============================================
-- 8. SENSITIVE DATA ACCESS LOG (Audit)
-- ============================================

CREATE TABLE IF NOT EXISTS sensitive_data_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,               -- 'kyc_start', 'card_add', 'withdrawal_request'
  resource_type TEXT NOT NULL,        -- 'kyc', 'card', 'bank_account', 'withdrawal'
  resource_id UUID,

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- Result
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_user ON sensitive_data_access_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON sensitive_data_access_log(action, created_at DESC);

-- ============================================
-- 9. GRANTS
-- ============================================

GRANT SELECT ON saved_cards TO authenticated;
GRANT INSERT, UPDATE ON saved_cards TO authenticated;
GRANT SELECT ON kyc_verifications TO authenticated;
GRANT SELECT ON user_bank_accounts TO authenticated;
GRANT INSERT, UPDATE ON user_bank_accounts TO authenticated;
GRANT SELECT ON payment_transactions TO authenticated;
GRANT SELECT, INSERT ON withdrawal_requests TO authenticated;

GRANT EXECUTE ON FUNCTION mask_iban TO authenticated;
GRANT EXECUTE ON FUNCTION mask_card_number TO authenticated;
GRANT EXECUTE ON FUNCTION mask_phone TO authenticated;
GRANT EXECUTE ON FUNCTION hash_tc_kimlik TO authenticated;
GRANT EXECUTE ON FUNCTION hash_phone TO authenticated;
GRANT EXECUTE ON FUNCTION hash_iban TO authenticated;

-- ============================================
-- 10. COMMENTS
-- ============================================

COMMENT ON TABLE saved_cards IS
'Kayıtlı kartlar - SADECE PayTR token ve masked bilgiler. Kart numarası/CVV saklanmaz.';

COMMENT ON TABLE kyc_verifications IS
'KYC doğrulamaları - SADECE iDenfy referansı ve durum. Kimlik belgesi/selfie saklanmaz.';

COMMENT ON TABLE user_bank_accounts IS
'Banka hesapları - SADECE masked IBAN ve hash. Full IBAN saklanmaz.';

COMMENT ON TABLE payment_transactions IS
'Ödeme işlemleri - Provider transaction ID ile takip. Kart bilgisi saklanmaz.';

COMMENT ON TABLE withdrawal_requests IS
'Para çekme talepleri - IBAN referans ile. Full IBAN çekim anında provider''a gönderilir.';

COMMENT ON COLUMN users.tc_hash IS
'TC Kimlik numarasının SHA256 hash değeri. Plain text TC saklanmaz.';

COMMENT ON COLUMN users.phone_hash IS
'Telefon numarasının SHA256 hash değeri. Full numara saklanmaz.';

COMMENT ON FUNCTION mask_iban IS 'IBAN''ı maskeleyerek görüntüleme formatına çevirir';
COMMENT ON FUNCTION mask_card_number IS 'Kart numarasını maskeleyerek **** **** **** 1234 formatına çevirir';
COMMENT ON FUNCTION mask_phone IS 'Telefon numarasını +90 5** *** ** 67 formatına çevirir';
COMMENT ON FUNCTION hash_tc_kimlik IS 'TC Kimlik numarasını SHA256 ile hashler (salt ile)';
COMMENT ON FUNCTION hash_phone IS 'Telefon numarasını SHA256 ile hashler (salt ile)';
COMMENT ON FUNCTION hash_iban IS 'IBAN''ı SHA256 ile hashler (salt ile)';
