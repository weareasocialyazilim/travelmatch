-- ============================================
-- ATOMIC TRANSFER RPC
-- Re-enabled: 2025-12-17
-- ============================================
-- Provides atomic fund transfers between users
-- Uses FOR UPDATE locks to prevent race conditions
-- ============================================

-- Create atomic transfer function with proper locking
-- (CREATE OR REPLACE handles existing function automatically)
CREATE OR REPLACE FUNCTION public.atomic_transfer(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_amount DECIMAL,
  p_moment_id UUID DEFAULT NULL,
  p_message TEXT DEFAULT NULL
) RETURNS jsonb 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_balance DECIMAL;
  v_recipient_balance DECIMAL;
  v_transaction_id UUID;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Amount must be positive'
    );
  END IF;

  -- Validate sender and recipient are different
  IF p_sender_id = p_recipient_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot transfer to self'
    );
  END IF;

  -- Lock both rows in consistent order to prevent deadlocks
  -- Always lock in UUID order
  IF p_sender_id < p_recipient_id THEN
    SELECT balance INTO STRICT v_sender_balance
    FROM users WHERE id = p_sender_id FOR UPDATE;
    
    SELECT balance INTO STRICT v_recipient_balance
    FROM users WHERE id = p_recipient_id FOR UPDATE;
  ELSE
    SELECT balance INTO STRICT v_recipient_balance
    FROM users WHERE id = p_recipient_id FOR UPDATE;
    
    SELECT balance INTO STRICT v_sender_balance
    FROM users WHERE id = p_sender_id FOR UPDATE;
  END IF;

  -- Check sufficient balance
  IF v_sender_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance',
      'available_balance', v_sender_balance,
      'requested_amount', p_amount
    );
  END IF;

  -- Perform atomic transfer
  UPDATE users 
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE id = p_sender_id;

  UPDATE users 
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE id = p_recipient_id;

  -- Generate transaction ID
  v_transaction_id := gen_random_uuid();

  -- Create transaction record
  INSERT INTO transactions (
    id,
    sender_id,
    recipient_id,
    amount,
    moment_id,
    message,
    status,
    type,
    created_at
  ) VALUES (
    v_transaction_id,
    p_sender_id,
    p_recipient_id,
    p_amount,
    p_moment_id,
    p_message,
    'completed',
    'transfer',
    NOW()
  );

  -- Log audit event (using correct audit_logs schema: user_id, action, metadata)
  INSERT INTO audit_logs (
    user_id,
    action,
    ip_address,
    metadata,
    created_at
  ) VALUES (
    p_sender_id,
    'transfer.completed',
    '0.0.0.0',
    jsonb_build_object(
      'transaction_id', v_transaction_id,
      'sender_balance_before', v_sender_balance,
      'sender_balance_after', v_sender_balance - p_amount,
      'recipient_id', p_recipient_id,
      'recipient_balance_before', v_recipient_balance,
      'recipient_balance_after', v_recipient_balance + p_amount,
      'amount', p_amount
    ),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'sender_new_balance', v_sender_balance - p_amount,
    'recipient_new_balance', v_recipient_balance + p_amount
  );

EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
