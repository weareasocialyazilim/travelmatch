-- Admin Extended Tables (Permanent Solution)
-- Migration: 20260120000002_admin_core_tables.sql
-- This creates all tables needed by the admin panel

-- =====================================================
-- RESET FOR PERMANENT SOLUTION
-- =====================================================
-- Drop conflicting tables from previous partial migrations to ensure clean state
DROP TABLE IF EXISTS fraud_evidence CASCADE;
DROP TABLE IF EXISTS fraud_cases CASCADE;
DROP TABLE IF EXISTS linked_accounts CASCADE;
DROP TABLE IF EXISTS payout_requests CASCADE;
DROP TABLE IF EXISTS vip_users CASCADE;
DROP TABLE IF EXISTS kyc_verifications CASCADE;

-- =====================================================
-- FRAUD CASES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS fraud_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL DEFAULT 'suspicious_activity',
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  description TEXT,
  evidence JSONB DEFAULT '[]',
  amount_involved DECIMAL(12,2),
  assigned_to UUID REFERENCES admin_users(id),
  resolution TEXT,
  resolved_by UUID REFERENCES admin_users(id),
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fraud_cases_user_id ON fraud_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_cases_status ON fraud_cases(status);
CREATE INDEX IF NOT EXISTS idx_fraud_cases_severity ON fraud_cases(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_cases_created_at ON fraud_cases(created_at DESC);

-- =====================================================
-- FRAUD EVIDENCE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS fraud_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES fraud_cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fraud_evidence_case_id ON fraud_evidence(case_id);

-- =====================================================
-- LINKED ACCOUNTS TABLE (for fraud detection)
-- =====================================================

CREATE TABLE IF NOT EXISTS linked_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_user_id UUID NOT NULL REFERENCES users(id),
  linked_user_id UUID NOT NULL REFERENCES users(id),
  link_type TEXT NOT NULL, -- 'device', 'ip', 'phone', 'email_domain', 'payment_method'
  confidence_score DECIMAL(5,2) DEFAULT 0,
  detected_at TIMESTAMPTZ DEFAULT now(),
  verified_by UUID REFERENCES admin_users(id),
  verified_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'dismissed'
  metadata JSONB DEFAULT '{}',
  UNIQUE(primary_user_id, linked_user_id, link_type)
);

CREATE INDEX IF NOT EXISTS idx_linked_accounts_primary ON linked_accounts(primary_user_id);
CREATE INDEX IF NOT EXISTS idx_linked_accounts_linked ON linked_accounts(linked_user_id);

-- =====================================================
-- PAYOUT REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  status TEXT NOT NULL DEFAULT 'pending',
  payout_method TEXT NOT NULL DEFAULT 'bank_transfer',
  bank_details JSONB,
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES admin_users(id),
  failure_reason TEXT,
  transaction_id TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payout_requests_user_id ON payout_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_created_at ON payout_requests(created_at DESC);

-- =====================================================
-- VIP USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS vip_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  tier TEXT NOT NULL DEFAULT 'gold',
  granted_at TIMESTAMPTZ DEFAULT now(),
  granted_by UUID REFERENCES admin_users(id),
  expires_at TIMESTAMPTZ,
  reason TEXT,
  benefits JSONB DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vip_users_user_id ON vip_users(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_users_tier ON vip_users(tier);
CREATE INDEX IF NOT EXISTS idx_vip_users_is_active ON vip_users(is_active);

-- =====================================================
-- KYC VERIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  document_type TEXT NOT NULL DEFAULT 'national_id',
  document_front_url TEXT,
  document_back_url TEXT,
  selfie_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES admin_users(id),
  rejection_reason TEXT,
  verification_notes TEXT,
  ai_confidence_score DECIMAL(5,2),
  ai_flags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON kyc_verifications(status);

-- =====================================================
-- DISCOUNT CODES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_is_active ON discount_codes(is_active);

-- =====================================================
-- NOTIFICATION CAMPAIGNS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'push',
  status TEXT NOT NULL DEFAULT 'draft',
  target_audience JSONB DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES admin_users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_campaigns_status ON notification_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_scheduled_at ON notification_campaigns(scheduled_at);

-- =====================================================
-- ADMIN ANALYTICS RPC FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_admin_analytics_charts(period_days INTEGER DEFAULT 7)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMPTZ;
BEGIN
  start_date := now() - (period_days || ' days')::INTERVAL;
  
  result := jsonb_build_object(
    'dailyActiveUsers', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'date', d::DATE,
          'dau', COALESCE((
            SELECT COUNT(DISTINCT user_id) 
            FROM user_activity_logs 
            WHERE created_at::DATE = d::DATE
          ), 0),
          'mau', COALESCE((
            SELECT COUNT(DISTINCT user_id) 
            FROM user_activity_logs 
            WHERE created_at >= d::DATE - INTERVAL '30 days' AND created_at < d::DATE + INTERVAL '1 day'
          ), 0)
        ) ORDER BY d
      ), '[]'::JSONB)
      FROM generate_series(start_date::DATE, now()::DATE, '1 day'::INTERVAL) d
    ),
    'revenueData', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'date', d::DATE,
          'revenue', COALESCE((
            SELECT SUM(amount) FROM transactions WHERE created_at::DATE = d::DATE
          ), 0),
          'transactions', COALESCE((
            SELECT COUNT(*) FROM transactions WHERE created_at::DATE = d::DATE
          ), 0)
        ) ORDER BY d
      ), '[]'::JSONB)
      FROM generate_series(start_date::DATE, now()::DATE, '1 day'::INTERVAL) d
    ),
    'userAcquisition', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'source', COALESCE(acquisition_source, 'organic'),
          'count', cnt
        )
      ), '[]'::JSONB)
      FROM (
        SELECT acquisition_source, COUNT(*) as cnt
        FROM users
        WHERE created_at >= start_date
        GROUP BY acquisition_source
        ORDER BY cnt DESC
        LIMIT 10
      ) sub
    ),
    'geoDistribution', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'city', city,
          'count', cnt
        )
      ), '[]'::JSONB)
      FROM (
        SELECT city, COUNT(*) as cnt
        FROM users
        WHERE city IS NOT NULL AND created_at >= start_date
        GROUP BY city
        ORDER BY cnt DESC
        LIMIT 10
      ) sub
    )
  );
  
  RETURN result;
END;
$$;

-- =====================================================
-- TRUST SCORE DISTRIBUTION RPC
-- =====================================================

CREATE OR REPLACE FUNCTION get_trust_score_distribution()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'range', range_label,
        'count', user_count
      )
    ), '[]'::JSONB)
    FROM (
      SELECT 
        CASE 
          WHEN trust_score >= 90 THEN '90-100'
          WHEN trust_score >= 80 THEN '80-89'
          WHEN trust_score >= 70 THEN '70-79'
          WHEN trust_score >= 60 THEN '60-69'
          WHEN trust_score >= 50 THEN '50-59'
          ELSE '0-49'
        END as range_label,
        COUNT(*) as user_count
      FROM users
      WHERE trust_score IS NOT NULL
      GROUP BY range_label
      ORDER BY range_label DESC
    ) sub
  );
END;
$$;

-- =====================================================
-- GENERATE CASE NUMBER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.case_number := 'FC-' || to_char(now(), 'YYYY') || '-' || LPAD((
    SELECT COUNT(*) + 1 FROM fraud_cases WHERE created_at >= date_trunc('year', now())
  )::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fraud_cases_generate_number ON fraud_cases;
CREATE TRIGGER fraud_cases_generate_number
  BEFORE INSERT ON fraud_cases
  FOR EACH ROW
  WHEN (NEW.case_number IS NULL)
  EXECUTE FUNCTION generate_case_number();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE fraud_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE linked_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_campaigns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can manage fraud cases" ON fraud_cases;
  DROP POLICY IF EXISTS "Admins can manage fraud evidence" ON fraud_evidence;
  DROP POLICY IF EXISTS "Admins can manage linked accounts" ON linked_accounts;
  DROP POLICY IF EXISTS "Admins can manage payout requests" ON payout_requests;
  DROP POLICY IF EXISTS "Admins can manage VIP users" ON vip_users;
  DROP POLICY IF EXISTS "Admins can manage KYC verifications" ON kyc_verifications;
  DROP POLICY IF EXISTS "Admins can manage discount codes" ON discount_codes;
  DROP POLICY IF EXISTS "Admins can manage notification campaigns" ON notification_campaigns;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Create RLS policies
CREATE POLICY "Admins can manage fraud cases"
  ON fraud_cases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage fraud evidence"
  ON fraud_evidence FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage linked accounts"
  ON linked_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage payout requests"
  ON payout_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage VIP users"
  ON vip_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage KYC verifications"
  ON kyc_verifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage discount codes"
  ON discount_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage notification campaigns"
  ON notification_campaigns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  DROP TRIGGER IF EXISTS fraud_cases_updated_at ON fraud_cases;
  DROP TRIGGER IF EXISTS payout_requests_updated_at ON payout_requests;
  DROP TRIGGER IF EXISTS vip_users_updated_at ON vip_users;
  DROP TRIGGER IF EXISTS kyc_verifications_updated_at ON kyc_verifications;
  DROP TRIGGER IF EXISTS discount_codes_updated_at ON discount_codes;
  DROP TRIGGER IF EXISTS notification_campaigns_updated_at ON notification_campaigns;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE TRIGGER fraud_cases_updated_at
  BEFORE UPDATE ON fraud_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER payout_requests_updated_at
  BEFORE UPDATE ON payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER vip_users_updated_at
  BEFORE UPDATE ON vip_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER kyc_verifications_updated_at
  BEFORE UPDATE ON kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER discount_codes_updated_at
  BEFORE UPDATE ON discount_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER notification_campaigns_updated_at
  BEFORE UPDATE ON notification_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
