-- ============================================
-- BLOCKER #3 FIX: Escrow Business Logic (Backend)
-- File: supabase/migrations/20251213000002_escrow_system.sql
-- ============================================

-- ============================================
-- 1. CREATE ESCROW TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  moment_id UUID REFERENCES moments(id) ON DELETE SET NULL,

  -- Escrow state
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'released', 'refunded', 'disputed', 'expired')
  ),
  release_condition TEXT NOT NULL DEFAULT 'proof_verified' CHECK (
    release_condition IN ('proof_verified', 'manual_approval', 'timer_expiry')
  ),

  -- Proof verification
  proof_submitted BOOLEAN DEFAULT FALSE,
  proof_verified BOOLEAN DEFAULT FALSE,
  proof_verification_date TIMESTAMPTZ,

  -- Timing
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  released_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Indexes
  CONSTRAINT sender_recipient_check CHECK (sender_id != recipient_id)
);

CREATE INDEX idx_escrow_sender ON escrow_transactions(sender_id);
CREATE INDEX idx_escrow_recipient ON escrow_transactions(recipient_id);
CREATE INDEX idx_escrow_status ON escrow_transactions(status);
CREATE INDEX idx_escrow_expires ON escrow_transactions(expires_at) WHERE status = 'pending';

COMMENT ON TABLE escrow_transactions IS
'Holds funds in escrow for high-value transactions.
Funds are released when proof is verified or conditions are met.';

-- Enable RLS
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own escrow transactions" ON escrow_transactions
FOR SELECT USING (auth.uid() IN (sender_id, recipient_id));

-- ============================================
-- 2. CREATE ESCROW TRANSACTION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION create_escrow_transaction(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_amount DECIMAL,
  p_moment_id UUID,
  p_release_condition TEXT DEFAULT 'proof_verified'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_sender_balance DECIMAL;
  v_escrow_id UUID;
  v_txn_id UUID;
BEGIN
  -- Validation
  IF p_sender_id = p_recipient_id THEN
    RAISE EXCEPTION 'Cannot escrow to yourself';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Lock sender and check balance
  SELECT balance INTO STRICT v_sender_balance
  FROM users
  WHERE id = p_sender_id
  FOR UPDATE;

  IF v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds: % < %', v_sender_balance, p_amount;
  END IF;

  -- Debit sender (money goes to escrow, not recipient yet)
  UPDATE users
  SET balance = balance - p_amount
  WHERE id = p_sender_id;

  -- Create escrow record
  INSERT INTO escrow_transactions (
    sender_id, recipient_id, amount,
    moment_id, status, release_condition, expires_at
  )
  VALUES (
    p_sender_id, p_recipient_id, p_amount,
    p_moment_id, 'pending', p_release_condition,
    NOW() + INTERVAL '7 days'
  )
  RETURNING id INTO v_escrow_id;

  -- Log transaction
  INSERT INTO transactions (
    user_id, type, amount, status,
    description, moment_id, metadata
  )
  VALUES (
    p_sender_id, 'escrow_hold', -p_amount, 'pending',
    'Funds held in escrow for moment ' || p_moment_id::text,
    p_moment_id,
    jsonb_build_object(
      'escrowId', v_escrow_id,
      'recipientId', p_recipient_id,
      'releaseCondition', p_release_condition
    )
  )
  RETURNING id INTO v_txn_id;

  RETURN jsonb_build_object(
    'success', true,
    'escrowId', v_escrow_id,
    'transactionId', v_txn_id,
    'status', 'pending',
    'expiresAt', NOW() + INTERVAL '7 days'
  );
END;
$$;

-- ============================================
-- 3. RELEASE ESCROW FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION release_escrow(
  p_escrow_id UUID,
  p_verified_by UUID DEFAULT NULL  -- Admin/system user
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_escrow RECORD;
  v_txn_id UUID;
BEGIN
  -- Get and lock escrow record
  SELECT * INTO STRICT v_escrow
  FROM escrow_transactions
  WHERE id = p_escrow_id
  FOR UPDATE;

  -- Validation
  IF v_escrow.status != 'pending' THEN
    RAISE EXCEPTION 'Escrow not in pending status: %', v_escrow.status;
  END IF;

  IF v_escrow.expires_at < NOW() THEN
    RAISE EXCEPTION 'Escrow expired at %', v_escrow.expires_at;
  END IF;

  -- Credit recipient
  UPDATE users
  SET balance = balance + v_escrow.amount
  WHERE id = v_escrow.recipient_id;

  -- Update escrow status
  UPDATE escrow_transactions
  SET
    status = 'released',
    released_at = NOW(),
    proof_verified = TRUE,
    proof_verification_date = NOW()
  WHERE id = p_escrow_id;

  -- Log recipient transaction
  INSERT INTO transactions (
    user_id, type, amount, status,
    description, moment_id, metadata
  )
  VALUES (
    v_escrow.recipient_id, 'escrow_release', v_escrow.amount, 'completed',
    'Escrow funds released from ' || v_escrow.sender_id::text,
    v_escrow.moment_id,
    jsonb_build_object(
      'escrowId', p_escrow_id,
      'senderId', v_escrow.sender_id,
      'verifiedBy', p_verified_by
    )
  )
  RETURNING id INTO v_txn_id;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'released',
    'transactionId', v_txn_id
  );
END;
$$;

-- ============================================
-- 4. REFUND ESCROW FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION refund_escrow(
  p_escrow_id UUID,
  p_reason TEXT DEFAULT 'user_request'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_escrow RECORD;
  v_txn_id UUID;
BEGIN
  -- Get and lock escrow
  SELECT * INTO STRICT v_escrow
  FROM escrow_transactions
  WHERE id = p_escrow_id
  FOR UPDATE;

  IF v_escrow.status != 'pending' THEN
    RAISE EXCEPTION 'Can only refund pending escrow';
  END IF;

  -- Refund to sender
  UPDATE users
  SET balance = balance + v_escrow.amount
  WHERE id = v_escrow.sender_id;

  -- Update escrow
  UPDATE escrow_transactions
  SET
    status = 'refunded',
    metadata = metadata || jsonb_build_object('refundReason', p_reason)
  WHERE id = p_escrow_id;

  -- Log refund transaction
  INSERT INTO transactions (
    user_id, type, amount, status,
    description, metadata
  )
  VALUES (
    v_escrow.sender_id, 'escrow_refund', v_escrow.amount, 'completed',
    'Escrow refunded: ' || p_reason,
    jsonb_build_object('escrowId', p_escrow_id, 'reason', p_reason)
  )
  RETURNING id INTO v_txn_id;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'refunded',
    'transactionId', v_txn_id
  );
END;
$$;

-- ============================================
-- 5. AUTO-REFUND EXPIRED ESCROW (pg_cron)
-- ============================================

-- First, enable pg_cron extension (requires superuser)
-- Run this manually in Supabase SQL Editor:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup of expired escrow (requires pg_cron)
-- Uncomment after enabling pg_cron:
/*
SELECT cron.schedule(
  'auto-refund-expired-escrow',
  '0 2 * * *',  -- Every day at 2 AM
  $$
    SELECT refund_escrow(id, 'auto_refund_expired')
    FROM escrow_transactions
    WHERE status = 'pending'
      AND expires_at < NOW()
    LIMIT 100;
  $$
);
*/

COMMENT ON TABLE escrow_transactions IS
'Escrow system with automatic expiry and refund mechanism.
Requires pg_cron for auto-refund job.';

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_escrow_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION release_escrow TO authenticated;
GRANT EXECUTE ON FUNCTION refund_escrow TO authenticated;
