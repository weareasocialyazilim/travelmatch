-- ============================================================================
-- LOVENDO PAYMENT SYSTEMS - COMPLETE MIGRATION
-- Created: 2026-01-27
-- Multi-Currency Support: 1 LVND = 1 TL (base currency)
-- Display Currencies: TRY, EUR, USD, GBP, JPY, AED, KRW, BRL, INR, CAD, AUD, CHF
-- Payment Providers: PAYTR (Turkey), IAP (International)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CURRENCY EXCHANGE RATES (Display only - rates cached from external APIs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency VARCHAR(3) NOT NULL UNIQUE,
  rate DECIMAL(18, 8) NOT NULL, -- 1 TRY = X units of currency
  source VARCHAR(50) NOT NULL DEFAULT 'static',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exchange_rates_currency ON exchange_rates(currency);
CREATE INDEX idx_exchange_rates_updated ON exchange_rates(updated_at DESC);

CREATE TABLE IF NOT EXISTS currency_rate_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id VARCHAR(200) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  rate DECIMAL(18, 8) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_currency_audit_transaction ON currency_rate_audit(transaction_id);

-- ============================================================================
-- LVND BALANCES AND TRANSACTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS lvnd_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
  pending_balance BIGINT NOT NULL DEFAULT 0,
  lifetime_earned BIGINT NOT NULL DEFAULT 0,
  lifetime_spent BIGINT NOT NULL DEFAULT 0,
  hoarder_decay_applied TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_lvnd_balances_user ON lvnd_balances(user_id);

CREATE TABLE IF NOT EXISTS lvnd_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL, -- Positive for earn, negative for spend
  transaction_type VARCHAR(50) NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  idempotency_key VARCHAR(200) UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lvnd_transactions_user ON lvnd_transactions(user_id);
CREATE INDEX idx_lvnd_transactions_type ON lvnd_transactions(transaction_type);
CREATE INDEX idx_lvnd_transactions_reference ON lvnd_transactions(reference_type, reference_id);
CREATE INDEX idx_lvnd_transactions_created ON lvnd_transactions(created_at DESC);
CREATE INDEX idx_lvnd_transactions_idempotency ON lvnd_transactions(idempotency_key);

-- ============================================================================
-- OFFER SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS offers (
  id VARCHAR(100) PRIMARY KEY, -- Custom ID format: offer_{timestamp}_{random}
  sender_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),
  moment_id UUID REFERENCES moments(id),
  lvnd_amount BIGINT NOT NULL CHECK (lvnd_amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
  exchange_rate DECIMAL(18, 8) NOT NULL DEFAULT 1.0,
  state VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (state IN (
    'created', 'pending', 'accepted', 'rejected', 'expired', 'cancelled', 'escalated'
  )),
  stage VARCHAR(20) NOT NULL CHECK (stage IN (
    'first_contact', 'warming', 'active', 'deep', 'meetup'
  )),
  expires_at TIMESTAMPTZ NOT NULL,
  counter_from_offer_id VARCHAR(100) REFERENCES offers(id),
  counter_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_offers_sender ON offers(sender_id, state);
CREATE INDEX idx_offers_receiver ON offers(receiver_id, state);
CREATE INDEX idx_offers_moment ON offers(moment_id);
CREATE INDEX idx_offers_expires ON offers(expires_at) WHERE state = 'pending';
CREATE INDEX idx_offers_stage ON offers(stage);

CREATE TABLE IF NOT EXISTS offer_state_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id VARCHAR(100) NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  from_state VARCHAR(20),
  to_state VARCHAR(20) NOT NULL,
  triggered_by VARCHAR(20) NOT NULL CHECK (triggered_by IN ('sender', 'receiver', 'system', 'admin')),
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_offer_history_offer ON offer_state_history(offer_id);
CREATE INDEX idx_offer_history_created ON offer_state_history(created_at DESC);

-- Offer stats per user (for rate limiting)
CREATE TABLE IF NOT EXISTS offer_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  accepts INTEGER NOT NULL DEFAULT 0,
  rejects INTEGER NOT NULL DEFAULT 0,
  cancels INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MEMBERSHIP SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'premium', 'platinum')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trial')),
  started_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  trial_used BOOLEAN DEFAULT false,
  payment_method_id VARCHAR(200),
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_memberships_user ON memberships(user_id, status);
CREATE INDEX idx_memberships_tier ON memberships(tier, status);
CREATE INDEX idx_memberships_expires ON memberships(expires_at) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS membership_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  membership_id UUID REFERENCES memberships(id),
  amount INTEGER NOT NULL, -- Kuruş cinsinden (örn: 4900 = 49 TL)
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_provider VARCHAR(50), -- 'paytr', 'iap', etc.
  provider_transaction_id VARCHAR(200),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_membership_tx_user ON membership_transactions(user_id);
CREATE INDEX idx_membership_tx_provider ON membership_transactions(provider_transaction_id);

CREATE TABLE IF NOT EXISTS membership_cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  membership_id UUID NOT NULL REFERENCES memberships(id),
  tier VARCHAR(20) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREATOR/VIP SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS creator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  application_text TEXT,
  portfolio_links JSONB DEFAULT '[]',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  UNIQUE(user_id)
);

CREATE INDEX idx_creator_applications_status ON creator_applications(status);
CREATE INDEX idx_creator_applications_user ON creator_applications(user_id);

CREATE TABLE IF NOT EXISTS creator_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  cqs_score DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (cqs_score >= 0 AND cqs_score <= 100),
  moment_count INTEGER NOT NULL DEFAULT 0,
  fulfilled_offers INTEGER NOT NULL DEFAULT 0,
  rejected_offers INTEGER NOT NULL DEFAULT 0,
  avg_response_time_hours DECIMAL(5,2),
  total_earned BIGINT NOT NULL DEFAULT 0,
  pending_payout BIGINT NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_creator_status_user ON creator_status(user_id, status);
CREATE INDEX idx_creator_status_tier ON creator_status(tier);
CREATE INDEX idx_creator_status_cqs ON creator_status(cqs_score DESC);

CREATE TABLE IF NOT EXISTS creator_payouts (
  id VARCHAR(100) PRIMARY KEY, -- payout_{timestamp}_{random}
  creator_id UUID NOT NULL REFERENCES creator_status(user_id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'held', 'frozen')),
  hold_reason VARCHAR(100),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  admin_note TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_creator_payouts_creator ON creator_payouts(creator_id, status);
CREATE INDEX idx_creator_payouts_requested ON creator_payouts(requested_at DESC);

-- ============================================================================
-- PAYTR PAYMENT INTEGRATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS paytr_payments (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  amount_tl BIGINT NOT NULL, -- Kuruş cinsinden
  amount_local BIGINT NOT NULL, -- Kullanıcının para biriminde
  currency VARCHAR(3) NOT NULL,
  exchange_rate DECIMAL(18, 8) NOT NULL,
  payment_type VARCHAR(50) NOT NULL, -- 'lvnd_purchase', 'membership', etc.
  reference_id VARCHAR(200) NOT NULL,
  merchant_oid VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  paytr_status VARCHAR(50),
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_paytr_payments_user ON paytr_payments(user_id, status);
CREATE INDEX idx_paytr_payments_merchant ON paytr_payments(merchant_oid);
CREATE INDEX idx_paytr_payments_reference ON paytr_payments(reference_id, payment_type);

CREATE TABLE IF NOT EXISTS paytr_refunds (
  id VARCHAR(100) PRIMARY KEY, -- ref_{timestamp}_{random}
  payment_id VARCHAR(100) NOT NULL REFERENCES paytr_payments(id),
  user_id UUID NOT NULL REFERENCES users(id),
  amount_tl BIGINT NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  admin_note TEXT
);

CREATE INDEX idx_paytr_refunds_payment ON paytr_refunds(payment_id);
CREATE INDEX idx_paytr_refunds_user ON paytr_refunds(user_id);

-- ============================================================================
-- ADMIN AUDIT LOGS (Extended for all systems)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(200) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_admin ON admin_audit_logs(admin_id, created_at DESC);
CREATE INDEX idx_admin_audit_resource ON admin_audit_logs(resource_type, resource_id);
CREATE INDEX idx_admin_audit_created ON admin_audit_logs(created_at DESC);

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- LVND Credit Function
CREATE OR REPLACE FUNCTION lvnd_credit(
  user_id UUID,
  amount BIGINT,
  transaction_id UUID
) RETURNS void AS $$
BEGIN
  UPDATE lvnd_balances
  SET
    balance = balance + amount,
    lifetime_earned = lifetime_earned + amount,
    updated_at = NOW()
  WHERE user_id = user_id;

  IF NOT FOUND THEN
    INSERT INTO lvnd_balances (user_id, balance, lifetime_earned)
    VALUES (user_id, amount, amount);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- LVND Debit Function
CREATE OR REPLACE FUNCTION lvnd_debit(
  user_id UUID,
  amount BIGINT,
  transaction_id UUID
) RETURNS void AS $$
DECLARE
  current_balance BIGINT;
BEGIN
  SELECT balance INTO current_balance
  FROM lvnd_balances
  WHERE user_id = user_id;

  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User balance not found';
  END IF;

  IF current_balance < amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  UPDATE lvnd_balances
  SET
    balance = balance - amount,
    lifetime_spent = lifetime_spent + amount,
    updated_at = NOW()
  WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment Offer Stat
CREATE OR REPLACE FUNCTION increment_offer_stat(
  user_id UUID,
  stat_name TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO offer_stats (user_id, accepts, rejects, cancels)
  VALUES (user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO UPDATE SET
    accepts = offer_stats.accepts + (CASE WHEN stat_name = 'accepts' THEN 1 ELSE 0 END),
    rejects = offer_stats.rejects + (CASE WHEN stat_name = 'rejects' THEN 1 ELSE 0 END),
    cancels = offer_stats.cancels + (CASE WHEN stat_name = 'cancels' THEN 1 ELSE 0 END),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Creator Earn Function
CREATE OR REPLACE FUNCTION creator_earn(
  creator_id UUID,
  amount BIGINT,
  offer_amount BIGINT
) RETURNS void AS $$
BEGIN
  UPDATE creator_status
  SET
    total_earned = total_earned + amount,
    fulfilled_offers = fulfilled_offers + 1,
    updated_at = NOW()
  WHERE user_id = creator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add Creator Payout Hold
CREATE OR REPLACE FUNCTION add_creator_payout_hold(
  creator_id UUID,
  amount BIGINT
) RETURNS void AS $$
BEGIN
  UPDATE creator_status
  SET
    pending_payout = pending_payout + amount,
    updated_at = NOW()
  WHERE user_id = creator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Users can only see their own balances
ALTER TABLE lvnd_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own balance" ON lvnd_balances
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their own transactions
ALTER TABLE lvnd_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON lvnd_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON lvnd_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Users can view their own offers
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own offers" ON offers
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can create offers (checked in application logic)
CREATE POLICY "Users can create offers" ON offers
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update their own offer state
CREATE POLICY "Users can update own offers" ON offers
  FOR UPDATE USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Users can view their own membership
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own membership" ON memberships
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own creator status
ALTER TABLE creator_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own creator status" ON creator_status
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default exchange rates (will be refreshed by cron job)
INSERT INTO exchange_rates (currency, rate, source) VALUES
  ('TRY', 1.0, 'base'),
  ('EUR', 0.030, 'ecb'),
  ('USD', 0.032, 'ecb'),
  ('GBP', 0.026, 'ecb'),
  ('JPY', 4.85, 'ecb'),
  ('AED', 0.12, 'ecb'),
  ('KRW', 42.5, 'ecb'),
  ('BRL', 0.16, 'ecb'),
  ('INR', 2.65, 'ecb'),
  ('CAD', 0.044, 'ecb'),
  ('AUD', 0.049, 'ecb'),
  ('CHF', 0.028, 'ecb')
ON CONFLICT (currency) DO NOTHING;

-- ============================================================================
-- SUMMARY OF TABLES
-- ============================================================================
/*
Tables Created:
- exchange_rates: Currency exchange rates (display only)
- currency_rate_audit: Rate history for audit
- lvnd_balances: User LVND balances
- lvnd_transactions: All LVND movements
- offers: Offer records
- offer_state_history: Offer state transitions
- offer_stats: User offer statistics
- memberships: User membership records
- membership_transactions: Membership payment history
- membership_cancellations: Cancellation reasons
- creator_applications: Creator applications
- creator_status: Creator profiles and status
- creator_payouts: Creator payout records
- paytr_payments: PAYTR payment records
- paytr_refunds: Refund records
- admin_audit_logs: Admin action audit

Key Principles:
- All monetary values stored in TL (kuruş)
- Currency conversion for DISPLAY ONLY
- No speculative currency mechanics
- Full audit trail for all transactions
- RLS policies for data security
*/
