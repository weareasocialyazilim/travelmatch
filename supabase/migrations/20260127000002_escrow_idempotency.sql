-- ============================================================================
// Escrow Idempotency
// Prevents duplicate escrow operations
// ============================================================================

-- Add idempotency_key column
ALTER TABLE escrow_transactions ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(200) UNIQUE;
ALTER TABLE escrow_transactions ADD COLUMN IF NOT EXISTS idempotency_expires_at TIMESTAMPTZ;

-- Create idempotency keys table for tracking
CREATE TABLE IF NOT EXISTS escrow_idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key VARCHAR(200) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  operation_type VARCHAR(50) NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX idx_escrow_idempotency_key ON escrow_idempotency_keys(idempotency_key);
CREATE INDEX idx_escrow_idempotency_expires ON escrow_idempotency_keys(expires_at);

-- Idempotent escrow creation function
CREATE OR REPLACE FUNCTION create_escrow_idempotent(
  p_idempotency_key VARCHAR(200),
  p_sender_id UUID,
  p_recipient_id UUID,
  p_amount DECIMAL,
  p_moment_id UUID DEFAULT NULL,
  p_release_condition TEXT DEFAULT 'proof_verified'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing jsonb;
  v_sender_balance DECIMAL;
  v_escrow_id UUID;
  v_txn_id UUID;
BEGIN
  -- Check if idempotency key already used
  SELECT response_data INTO v_existing
  FROM escrow_idempotency_keys
  WHERE idempotency_key = p_idempotency_key
    AND expires_at > NOW();

  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

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

  -- Debit sender
  UPDATE users
  SET balance = balance - p_amount
  WHERE id = p_sender_id;

  -- Create escrow record
  INSERT INTO escrow_transactions (
    sender_id, recipient_id, amount,
    moment_id, status, release_condition,
    idempotency_key, expires_at
  )
  VALUES (
    p_sender_id, p_recipient_id, p_amount,
    p_moment_id, 'pending', p_release_condition,
    p_idempotency_key, NOW() + INTERVAL '24 hours'
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
      'releaseCondition', p_release_condition,
      'idempotencyKey', p_idempotency_key
    )
  )
  RETURNING id INTO v_txn_id;

  -- Store idempotency response
  v_existing := jsonb_build_object(
    'success', true,
    'escrowId', v_escrow_id,
    'transactionId', v_txn_id,
    'status', 'pending',
    'expiresAt', NOW() + INTERVAL '7 days'
  );

  INSERT INTO escrow_idempotency_keys (
    idempotency_key, user_id, operation_type, response_data
  )
  VALUES (
    p_idempotency_key, p_sender_id, 'create_escrow', v_existing
  );

  RETURN v_existing;
END;
$$;

-- Cleanup expired idempotency keys (run daily via pg_cron)
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM escrow_idempotency_keys
  WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_escrow_idempotent TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_idempotency_keys TO service_role;

COMMENT ON COLUMN escrow_transactions.idempotency_key IS 'Unique key for idempotent operations';
