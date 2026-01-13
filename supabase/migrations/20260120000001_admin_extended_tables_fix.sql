-- Admin Panel Extended Tables - Fix
-- Migration: 20260120000001_admin_extended_tables_fix
-- Fixes remaining tables after partial migration

-- =====================================================
-- FIX REPORTS TABLE (add missing columns if they don't exist)
-- =====================================================

-- Add reported_id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'reported_id'
  ) THEN
    ALTER TABLE reports ADD COLUMN reported_id UUID REFERENCES users(id);
  END IF;
END $$;

-- Add status column if missing (may have different type)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'status'
  ) THEN
    ALTER TABLE reports ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Add priority column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'priority'
  ) THEN
    ALTER TABLE reports ADD COLUMN priority TEXT DEFAULT 'medium';
  END IF;
END $$;

-- Add assigned_to column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE reports ADD COLUMN assigned_to UUID REFERENCES admin_users(id);
  END IF;
END $$;

-- Create indexes only if columns exist
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- =====================================================
-- REPORT ACTIONS TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS report_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_by UUID REFERENCES admin_users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_actions_report_id ON report_actions(report_id);

-- =====================================================
-- WALLET TRANSACTIONS TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'adjustment',
  description TEXT NOT NULL,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);

-- =====================================================
-- ALERTS TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  acknowledged_by UUID REFERENCES admin_users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES admin_users(id),
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- =====================================================
-- UPDATE WALLET BALANCE FUNCTION
-- =====================================================

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
    balance = COALESCE(balance, 0) + p_amount,
    updated_at = now()
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
END;
$$;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE report_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Drop and recreate (safer approach)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can view report actions" ON report_actions;
  DROP POLICY IF EXISTS "Admins can insert report actions" ON report_actions;
  DROP POLICY IF EXISTS "Admins can view wallet transactions" ON wallet_transactions;
  DROP POLICY IF EXISTS "Finance can manage wallet transactions" ON wallet_transactions;
  DROP POLICY IF EXISTS "Admins can view alerts" ON alerts;
  DROP POLICY IF EXISTS "Admins can manage alerts" ON alerts;
END $$;

CREATE POLICY "Admins can view report actions"
  ON report_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can insert report actions"
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
-- TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS alerts_updated_at ON alerts;
CREATE TRIGGER alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
