-- ============================================
-- ATOMIC TRANSFER RPC
-- Re-enabled: 2025-12-17
-- SECURITY FIX: 2025-12-19 - Added sender validation
-- ============================================
-- Provides atomic fund transfers between users
-- Uses FOR UPDATE locks to prevent race conditions
-- SECURITY: Caller must be the sender (prevents spoofing)
-- ============================================

DROP FUNCTION IF EXISTS public.atomic_transfer(UUID, UUID, DECIMAL, UUID, TEXT);

CREATE OR REPLACE FUNCTION public.atomic_transfer(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_amount DECIMAL,
  p_moment_id UUID DEFAULT NULL,
  p_message TEXT DEFAULT NULL
) RETURNS jsonb 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $func$
DECLARE
  v_sender_balance DECIMAL;
  v_recipient_balance DECIMAL;
  v_transaction_id UUID;
  v_calling_user UUID;
BEGIN
  -- ============================================
  -- SECURITY FIX: Verify caller is the sender
  -- Prevents unauthorized transfers on behalf of others
  -- ============================================
  v_calling_user := auth.uid();
  
  IF v_calling_user IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;
  
  IF p_sender_id != v_calling_user THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: You can only transfer from your own account'
    );
  END IF;
  -- ============================================

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

  -- Create transaction record for sender (debit)
  INSERT INTO transactions (
    id, user_id, amount, moment_id, description, status, type, metadata, created_at
  ) VALUES (
    v_transaction_id, p_sender_id, -p_amount, p_moment_id,
    COALESCE(p_message, 'Transfer to user'), 'completed', 'payment',
    jsonb_build_object('recipient_id', p_recipient_id, 'transfer_id', v_transaction_id, 'transfer_type', 'outgoing'),
    NOW()
  );

  -- Create transaction record for recipient (credit)
  INSERT INTO transactions (
    user_id, amount, moment_id, description, status, type, metadata, created_at
  ) VALUES (
    p_recipient_id, p_amount, p_moment_id,
    COALESCE(p_message, 'Transfer from user'), 'completed', 'deposit',
    jsonb_build_object('sender_id', p_sender_id, 'transfer_id', v_transaction_id, 'transfer_type', 'incoming'),
    NOW()
  );

  -- Log audit event
  INSERT INTO audit_logs (user_id, action, metadata, ip_address, created_at)
  VALUES (
    p_sender_id, 'transfer.completed',
    jsonb_build_object(
      'transaction_id', v_transaction_id,
      'sender_id', p_sender_id,
      'recipient_id', p_recipient_id,
      'amount', p_amount,
      'sender_old_balance', v_sender_balance,
      'sender_new_balance', v_sender_balance - p_amount,
      'recipient_old_balance', v_recipient_balance,
      'recipient_new_balance', v_recipient_balance + p_amount
    ),
    '0.0.0.0', NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'sender_new_balance', v_sender_balance - p_amount,
    'recipient_new_balance', v_recipient_balance + p_amount
  );

EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$func$;

GRANT EXECUTE ON FUNCTION public.atomic_transfer TO authenticated;

COMMENT ON FUNCTION public.atomic_transfer IS 'Atomically transfers funds between two users with FOR UPDATE locks to prevent race conditions.';
