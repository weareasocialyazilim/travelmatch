-- Admin Panel Extended Tables
-- Migration: 20260120000000_admin_extended_tables
-- Adds fraud detection, payout management, VIP users, and wallet operations tables

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Fraud case status
DO $$ BEGIN
  CREATE TYPE fraud_case_status AS ENUM (
    'open',
    'investigating',
    'resolved',
    'escalated'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Fraud case priority
DO $$ BEGIN
  CREATE TYPE fraud_case_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Fraud case type
DO $$ BEGIN
  CREATE TYPE fraud_case_type AS ENUM (
    'payment_fraud',
    'identity_theft',
    'account_takeover',
    'fake_profile',
    'scam'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Fraud evidence type
DO $$ BEGIN
  CREATE TYPE fraud_evidence_type AS ENUM (
    'screenshot',
    'transaction',
    'chat_log',
    'document',
    'ip_log'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Linked account connection type
DO $$ BEGIN
  CREATE TYPE linked_account_connection AS ENUM (
    'same_ip',
    'same_device',
    'same_payment',
    'same_phone',
    'behavioral'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Payout status
DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Payout method
DO $$ BEGIN
  CREATE TYPE payout_method AS ENUM (
    'bank_transfer',
    'paypal',
    'crypto',
    'paytr'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- VIP tier
DO $$ BEGIN
  CREATE TYPE vip_tier AS ENUM (
    'vip',
    'influencer',
    'partner'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- VIP status
DO $$ BEGIN
  CREATE TYPE vip_status AS ENUM (
    'active',
    'inactive',
    'pending',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Alert severity
DO $$ BEGIN
  CREATE TYPE alert_severity AS ENUM (
    'info',
    'warning',
    'error',
    'critical'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Alert status
DO $$ BEGIN
  CREATE TYPE alert_status AS ENUM (
    'active',
    'acknowledged',
    'resolved',
    'dismissed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Report status
DO $$ BEGIN
  CREATE TYPE report_status AS ENUM (
    'pending',
    'reviewing',
    'resolved',
    'dismissed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Wallet transaction type
DO $$ BEGIN
  CREATE TYPE wallet_transaction_type AS ENUM (
    'credit',
    'debit',
    'adjustment'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- FRAUD CASES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS fraud_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  status fraud_case_status NOT NULL DEFAULT 'open',
  priority fraud_case_priority NOT NULL DEFAULT 'medium',
  type fraud_case_type NOT NULL,
  reported_at TIMESTAMPTZ DEFAULT now(),
  assigned_to UUID REFERENCES admin_users(id),
  reporter_id UUID REFERENCES users(id),
  suspect_id UUID REFERENCES users(id),
  suspect_name TEXT NOT NULL,
  suspect_email TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_count INTEGER DEFAULT 0,
  linked_accounts INTEGER DEFAULT 0,
  total_amount_involved DECIMAL(12,2) DEFAULT 0,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fraud cases
CREATE INDEX IF NOT EXISTS idx_fraud_cases_status ON fraud_cases(status);
CREATE INDEX IF NOT EXISTS idx_fraud_cases_priority ON fraud_cases(priority);
CREATE INDEX IF NOT EXISTS idx_fraud_cases_assigned_to ON fraud_cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_fraud_cases_suspect ON fraud_cases(suspect_id);
CREATE INDEX IF NOT EXISTS idx_fraud_cases_created_at ON fraud_cases(created_at DESC);

-- =====================================================
-- FRAUD EVIDENCE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS fraud_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES fraud_cases(id) ON DELETE CASCADE,
  type fraud_evidence_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT,
  metadata JSONB DEFAULT '{}',
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  uploaded_by UUID REFERENCES admin_users(id)
);

-- Indexes for fraud evidence
CREATE INDEX IF NOT EXISTS idx_fraud_evidence_case_id ON fraud_evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_fraud_evidence_type ON fraud_evidence(type);

-- =====================================================
-- LINKED ACCOUNTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS linked_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES fraud_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  connection_type linked_account_connection NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  detected_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for linked accounts
CREATE INDEX IF NOT EXISTS idx_linked_accounts_case_id ON linked_accounts(case_id);
CREATE INDEX IF NOT EXISTS idx_linked_accounts_user_id ON linked_accounts(user_id);

-- =====================================================
-- PAYOUT REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_avatar TEXT,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'TRY',
  status payout_status NOT NULL DEFAULT 'pending',
  payout_method payout_method NOT NULL,
  bank_details JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES admin_users(id),
  failure_reason TEXT,
  transaction_id TEXT
);

-- Indexes for payout requests
CREATE INDEX IF NOT EXISTS idx_payout_requests_user_id ON payout_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_created_at ON payout_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payout_requests_pending ON payout_requests(status, created_at) WHERE status = 'pending';

-- =====================================================
-- VIP USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS vip_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  tier vip_tier NOT NULL DEFAULT 'vip',
  commission_override DECIMAL(5,2) CHECK (commission_override >= 0 AND commission_override <= 100),
  giver_pays_commission BOOLEAN DEFAULT false,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  reason TEXT,
  status vip_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for VIP users
CREATE INDEX IF NOT EXISTS idx_vip_users_user_id ON vip_users(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_users_tier ON vip_users(tier);
CREATE INDEX IF NOT EXISTS idx_vip_users_status ON vip_users(status);
CREATE INDEX IF NOT EXISTS idx_vip_users_active ON vip_users(status, valid_until) WHERE status = 'active';

-- =====================================================
-- REPORTS TABLE
-- =====================================================

-- Schema alignment for reports table (handle transition from old schema)
DO $$ 
BEGIN
  -- If table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
      
      -- 1. Rename reported_user_id to reported_id if needed
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'reported_user_id') 
         AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'reported_id') THEN
          ALTER TABLE reports RENAME COLUMN reported_user_id TO reported_id;
      END IF;

      -- 2. Add 'type' column if missing
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'type') THEN
          ALTER TABLE reports ADD COLUMN type TEXT NOT NULL DEFAULT 'general';
      END IF;

      -- 3. Add 'priority' column if missing
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'priority') THEN
          ALTER TABLE reports ADD COLUMN priority fraud_case_priority NOT NULL DEFAULT 'medium';
      END IF;

      -- 4. Add 'assigned_to' column if missing
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'assigned_to') THEN
          ALTER TABLE reports ADD COLUMN assigned_to UUID REFERENCES admin_users(id);
      END IF;
      
       -- 5. Add 'resolution' column if missing
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'resolution') THEN
          ALTER TABLE reports ADD COLUMN resolution TEXT;
      END IF;

  END IF;
END $$;

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id),
  reported_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status report_status NOT NULL DEFAULT 'pending',
  priority fraud_case_priority NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES admin_users(id),
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for reports
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_id ON reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- =====================================================
-- REPORT ACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS report_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_by UUID NOT NULL REFERENCES admin_users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for report actions
CREATE INDEX IF NOT EXISTS idx_report_actions_report_id ON report_actions(report_id);

-- =====================================================
-- WALLET TRANSACTIONS TABLE (Admin adjustments)
-- =====================================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL,
  type wallet_transaction_type NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for wallet transactions
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);

-- =====================================================
-- ALERTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  status alert_status NOT NULL DEFAULT 'active',
  acknowledged_by UUID REFERENCES admin_users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES admin_users(id),
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for alerts
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(status, severity) WHERE status = 'active';

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update wallet balance function
CREATE OR REPLACE FUNCTION update_wallet_balance(
  p_user_id UUID,
  p_amount DECIMAL(12,2)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users
  SET 
    balance = balance + p_amount,
    updated_at = now()
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
END;
$$;

-- Generate case number function
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.case_number := 'FR-' || to_char(now(), 'YYYY') || '-' || 
    lpad(nextval('fraud_case_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$;

-- Create sequence for case numbers
CREATE SEQUENCE IF NOT EXISTS fraud_case_number_seq START 1;

-- Create trigger for case number generation
DROP TRIGGER IF EXISTS set_fraud_case_number ON fraud_cases;
CREATE TRIGGER set_fraud_case_number
  BEFORE INSERT ON fraud_cases
  FOR EACH ROW
  WHEN (NEW.case_number IS NULL OR NEW.case_number = '')
  EXECUTE FUNCTION generate_case_number();

-- Update evidence count trigger
CREATE OR REPLACE FUNCTION update_fraud_evidence_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE fraud_cases SET evidence_count = evidence_count + 1 WHERE id = NEW.case_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE fraud_cases SET evidence_count = evidence_count - 1 WHERE id = OLD.case_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS fraud_evidence_count ON fraud_evidence;
CREATE TRIGGER fraud_evidence_count
  AFTER INSERT OR DELETE ON fraud_evidence
  FOR EACH ROW
  EXECUTE FUNCTION update_fraud_evidence_count();

-- Update linked accounts count trigger
CREATE OR REPLACE FUNCTION update_linked_accounts_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE fraud_cases SET linked_accounts = linked_accounts + 1 WHERE id = NEW.case_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE fraud_cases SET linked_accounts = linked_accounts - 1 WHERE id = OLD.case_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS linked_accounts_count ON linked_accounts;
CREATE TRIGGER linked_accounts_count
  AFTER INSERT OR DELETE ON linked_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_linked_accounts_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE fraud_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE linked_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Admin access policies (admins can view all)
CREATE POLICY "Admins can view fraud cases"
  ON fraud_cases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage fraud cases"
  ON fraud_cases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
      AND au.role IN ('super_admin', 'manager', 'moderator')
    )
  );

CREATE POLICY "Admins can view fraud evidence"
  ON fraud_evidence FOR SELECT
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
      AND au.role IN ('super_admin', 'manager', 'moderator')
    )
  );

CREATE POLICY "Admins can view linked accounts"
  ON linked_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can view payout requests"
  ON payout_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Finance can manage payout requests"
  ON payout_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
      AND au.role IN ('super_admin', 'manager', 'finance')
    )
  );

CREATE POLICY "Admins can view VIP users"
  ON vip_users FOR SELECT
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
      AND au.role IN ('super_admin', 'manager', 'marketing')
    )
  );

CREATE POLICY "Admins can view reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage reports"
  ON reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
      AND au.role IN ('super_admin', 'manager', 'moderator', 'support')
    )
  );

CREATE POLICY "Admins can view report actions"
  ON report_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can add report actions"
  ON report_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can view wallet transactions"
  ON wallet_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Finance can manage wallet transactions"
  ON wallet_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
      AND au.role IN ('super_admin', 'manager', 'finance')
    )
  );

CREATE POLICY "Admins can view alerts"
  ON alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage alerts"
  ON alerts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

CREATE TRIGGER fraud_cases_updated_at
  BEFORE UPDATE ON fraud_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vip_users_updated_at
  BEFORE UPDATE ON vip_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE fraud_cases IS 'Fraud investigation cases for suspicious activities';
COMMENT ON TABLE fraud_evidence IS 'Evidence files and documents for fraud cases';
COMMENT ON TABLE linked_accounts IS 'Accounts linked to fraud cases by various signals';
COMMENT ON TABLE payout_requests IS 'User payout/withdrawal requests';
COMMENT ON TABLE vip_users IS 'VIP, influencer, and partner user privileges';
COMMENT ON TABLE reports IS 'User reports for policy violations';
COMMENT ON TABLE report_actions IS 'Actions taken on user reports';
COMMENT ON TABLE wallet_transactions IS 'Admin-initiated wallet adjustments';
COMMENT ON TABLE alerts IS 'System alerts and notifications for admins';
