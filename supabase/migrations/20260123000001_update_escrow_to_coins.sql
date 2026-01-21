-- ============================================
-- LOVENDO COINS - ESCROW REFACTOR
-- Description: Updates Escrow functions to use "Coins" (virtual currency) instead of real money balance.
-- ============================================

-- ============================================
-- 1. CREATE ESCROW (COINS)
-- ============================================

CREATE OR REPLACE FUNCTION create_escrow_transaction(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_amount DECIMAL, -- Treated as Coins (Integer value expected)
  p_moment_id UUID,
  p_release_condition TEXT DEFAULT 'proof_verified'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_sender_coins INTEGER;
  v_escrow_id UUID;
  v_txn_id UUID;
  v_coin_amount INTEGER;
BEGIN
  -- Validation
  IF p_sender_id = p_recipient_id THEN
    RAISE EXCEPTION 'Cannot escrow to yourself';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  v_coin_amount := CAST(p_amount AS INTEGER);

  -- Lock sender and check COIN balance
  -- Changed from 'balance' to 'coins_balance'
  SELECT coins_balance INTO STRICT v_sender_coins
  FROM users
  WHERE id = p_sender_id
  FOR UPDATE;

  IF v_sender_coins < v_coin_amount THEN
    RAISE EXCEPTION 'Insufficient coins: % < %', v_sender_coins, v_coin_amount;
  END IF;

  -- Debit sender's COINS
  UPDATE users
  SET coins_balance = coins_balance - v_coin_amount
  WHERE id = p_sender_id;

  -- Create escrow record
  -- We set currency to 'COIN' to distinguish from legacy fiat escrows
  INSERT INTO escrow_transactions (
    sender_id, recipient_id, amount, currency,
    moment_id, status, release_condition, expires_at
  )
  VALUES (
    p_sender_id, p_recipient_id, v_coin_amount, 'COIN',
    p_moment_id, 'pending', p_release_condition,
    NOW() + INTERVAL '7 days'
  )
  RETURNING id INTO v_escrow_id;

  -- Log Coin Transaction (Sender Audit)
  -- Uses the new coin_transactions table
  INSERT INTO coin_transactions (
    user_id, amount, type, reference_id, description, metadata
  )
  VALUES (
    p_sender_id, -v_coin_amount, 'gift_sent', v_escrow_id,
    'Locked in escrow for moment ' || p_moment_id::text,
    jsonb_build_object(
      'recipientId', p_recipient_id,
      'releaseCondition', p_release_condition
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'escrowId', v_escrow_id,
    'status', 'pending',
    'currency', 'COIN',
    'amount', v_coin_amount
  );
END;
$$;

-- ============================================
-- 2. RELEASE ESCROW (COINS)
-- ============================================

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
  v_coin_amount INTEGER;
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

  IF v_escrow.currency != 'COIN' THEN
     -- Fallback for legacy fiat transactions if necessary, or just block
     -- For now, enforcing COIN logic for new system.
     -- If legacy migration is needed, we would add an IF currency = 'USD' block here.
     -- Assuming migration is a hard cutover for new features:
     RAISE NOTICE 'Processing non-COIN escrow using coin logic (auto-migrate)';
  END IF;

  v_coin_amount := CAST(v_escrow.amount AS INTEGER);

  -- Credit recipient's COINS
  UPDATE users
  SET coins_balance = coins_balance + v_coin_amount
  WHERE id = v_escrow.recipient_id;

  -- Update escrow status
  UPDATE escrow_transactions
  SET
    status = 'released',
    released_at = NOW(),
    proof_verified = TRUE,
    proof_verification_date = NOW()
  WHERE id = p_escrow_id;

  -- Log Coin Transaction (Recipient Audit)
  INSERT INTO coin_transactions (
    user_id, amount, type, reference_id, description, metadata
  )
  VALUES (
    v_escrow.recipient_id, v_coin_amount, 'gift_received', p_escrow_id,
    'Gift received from ' || v_escrow.sender_id::text,
    jsonb_build_object(
      'senderId', v_escrow.sender_id,
      'verifiedBy', p_verified_by,
      'momentId', v_escrow.moment_id
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', 'released',
    'amount', v_coin_amount
  );
END;
$$;

-- ============================================
-- 3. REFUND ESCROW (COINS)
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
  v_coin_amount INTEGER;
BEGIN
  -- Get and lock escrow
  SELECT * INTO STRICT v_escrow
  FROM escrow_transactions
  WHERE id = p_escrow_id
  FOR UPDATE;

  IF v_escrow.status != 'pending' THEN
    RAISE EXCEPTION 'Can only refund pending escrow';
  END IF;

  v_coin_amount := CAST(v_escrow.amount AS INTEGER);

  -- Refund to sender's COINS
  UPDATE users
  SET coins_balance = coins_balance + v_coin_amount
  WHERE id = v_escrow.sender_id;

  -- Update escrow
  UPDATE escrow_transactions
  SET
    status = 'refunded',
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('refundReason', p_reason)
  WHERE id = p_escrow_id;

  -- Log Coin Transaction (Refund Audit)
  INSERT INTO coin_transactions (
    user_id, amount, type, reference_id, description, metadata
  )
  VALUES (
    v_escrow.sender_id, v_coin_amount, 'refund', p_escrow_id,
    'Escrow refund: ' || p_reason,
    jsonb_build_object('reason', p_reason)
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', 'refunded',
    'amount', v_coin_amount
  );
END;
$$;
