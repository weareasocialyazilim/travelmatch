-- =============================================================================
-- FIX: Escrow Functions and Transactions Constraints
-- Date: 2026-01-21
-- Author: GitHub Copilot
-- Description: Updates create_escrow_transaction and release_escrow functions
-- to populate sender_id/recipient_id in transactions table, satisfying the
-- check_transfer_participants constraint.
-- =============================================================================

-- 1. Update create_escrow_transaction
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
  v_existing_escrow UUID;
BEGIN
  -- Validation
  IF p_sender_id = p_recipient_id THEN
    RAISE EXCEPTION 'Cannot escrow to yourself';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Check for existing pending escrow (idempotency)
  SELECT id INTO v_existing_escrow
  FROM escrow_transactions
  WHERE sender_id = p_sender_id
    AND recipient_id = p_recipient_id
    AND moment_id = p_moment_id
    AND status = 'pending'
  LIMIT 1;

  IF v_existing_escrow IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'escrowId', v_existing_escrow,
      'status', 'pending',
      'message', 'Existing escrow found'
    );
  END IF;

  -- Lock sender with NOWAIT to fail fast if locked
  BEGIN
    SELECT balance INTO STRICT v_sender_balance
    FROM users
    WHERE id = p_sender_id
    FOR UPDATE NOWAIT;
  EXCEPTION
    WHEN lock_not_available THEN
      RAISE EXCEPTION 'Transaction in progress. Please try again.';
  END;

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

  -- Log transaction (FIXED: Added sender_id/recipient_id)
  INSERT INTO transactions (
    user_id, sender_id, recipient_id,
    type, amount, status,
    description, moment_id, metadata
  )
  VALUES (
    p_sender_id, p_sender_id, p_recipient_id,
    'escrow_hold', -p_amount, 'completed',
    'Escrow hold for ' || p_recipient_id::text,
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
    'newBalance', v_sender_balance - p_amount
  );
END;
$$;

-- 2. Update release_escrow
CREATE OR REPLACE FUNCTION release_escrow(
  p_escrow_id UUID,
  p_verified_by UUID DEFAULT NULL
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
  -- Get and lock escrow record with NOWAIT
  BEGIN
    SELECT * INTO STRICT v_escrow
    FROM escrow_transactions
    WHERE id = p_escrow_id
    FOR UPDATE NOWAIT;
  EXCEPTION
    WHEN lock_not_available THEN
      RAISE EXCEPTION 'Escrow is being processed. Please wait.';
  END;

  -- Validation
  IF v_escrow.status != 'pending' THEN
    -- Idempotency: if already released, return success
    IF v_escrow.status = 'released' THEN
      RETURN jsonb_build_object(
        'success', true,
        'status', 'released',
        'message', 'Escrow already released'
      );
    END IF;
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

  -- Log recipient transaction (FIXED: Added sender_id/recipient_id)
  INSERT INTO transactions (
    user_id, sender_id, recipient_id,
    type, amount, status,
    description, moment_id, metadata
  )
  VALUES (
    v_escrow.recipient_id, v_escrow.sender_id, v_escrow.recipient_id,
    'escrow_release', v_escrow.amount, 'completed',
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
