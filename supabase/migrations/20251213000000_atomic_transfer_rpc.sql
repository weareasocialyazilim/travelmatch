-- ============================================
-- BLOCKER #1 FIX: Atomic Balance Transfer
-- File: supabase/migrations/20251213000000_atomic_transfer.sql
-- ============================================

-- Create atomic transfer function with transaction safety
CREATE OR REPLACE FUNCTION atomic_transfer(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_amount DECIMAL,
  p_moment_id UUID DEFAULT NULL,
  p_message TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_sender_balance DECIMAL;
  v_recipient_balance DECIMAL;
  v_txn_sender_id UUID;
  v_txn_recipient_id UUID;
BEGIN
  -- Validation
  IF p_sender_id = p_recipient_id THEN
    RAISE EXCEPTION 'Cannot transfer to yourself';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- BEGIN TRANSACTION (implicit in function)

  -- 1. LOCK sender row and check balance (prevents race condition)
  SELECT balance INTO STRICT v_sender_balance
  FROM users
  WHERE id = p_sender_id
  FOR UPDATE;  -- 🔒 Row-level lock

  IF v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds: % < %', v_sender_balance, p_amount;
  END IF;

  -- 2. LOCK recipient row
  SELECT balance INTO STRICT v_recipient_balance
  FROM users
  WHERE id = p_recipient_id
  FOR UPDATE;

  -- 3. Debit sender (atomic)
  UPDATE users
  SET
    balance = balance - p_amount,
    updated_at = NOW()
  WHERE id = p_sender_id;

  -- 4. Credit recipient (atomic)
  UPDATE users
  SET
    balance = balance + p_amount,
    updated_at = NOW()
  WHERE id = p_recipient_id;

  -- 5. Log sender transaction
  INSERT INTO transactions (
    user_id, type, amount, status,
    description, moment_id, metadata, created_at
  )
  VALUES (
    p_sender_id, 'gift', -p_amount, 'completed',
    'Sent gift to user ' || p_recipient_id::text,
    p_moment_id,
    jsonb_build_object(
      'recipientId', p_recipient_id,
      'message', p_message
    ),
    NOW()
  )
  RETURNING id INTO v_txn_sender_id;

  -- 6. Log recipient transaction
  INSERT INTO transactions (
    user_id, type, amount, status,
    description, moment_id, metadata, created_at
  )
  VALUES (
    p_recipient_id, 'gift', p_amount, 'completed',
    'Received gift from user ' || p_sender_id::text,
    p_moment_id,
    jsonb_build_object(
      'senderId', p_sender_id,
      'message', p_message
    ),
    NOW()
  )
  RETURNING id INTO v_txn_recipient_id;

  -- COMMIT (automatic on successful function return)
  -- All or nothing - if ANY step fails, entire transaction rolls back

  RETURN jsonb_build_object(
    'success', true,
    'senderTxnId', v_txn_sender_id,
    'recipientTxnId', v_txn_recipient_id,
    'newSenderBalance', v_sender_balance - p_amount,
    'newRecipientBalance', v_recipient_balance + p_amount
  );

EXCEPTION
  WHEN OTHERS THEN
    -- ROLLBACK (automatic on exception)
    RAISE EXCEPTION 'Transfer failed: %', SQLERRM;
END;
$$;

COMMENT ON FUNCTION atomic_transfer IS
'Atomically transfers funds between users with row-level locking.
All operations (debit + credit + logging) succeed or fail together.
SECURITY DEFINER with search_path protection against SQL injection.';

-- Grant execute permission to authenticated users (via Edge Function)
GRANT EXECUTE ON FUNCTION atomic_transfer TO authenticated;
