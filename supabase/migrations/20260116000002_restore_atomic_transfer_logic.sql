-- ============================================
-- RESTORE ATOMIC TRANSFER FUNCTION
-- Date: 2026-01-16
-- Description: Restoring the atomic_transfer function in a separate file to avoid parser issues.
-- ============================================

CREATE OR REPLACE FUNCTION public.atomic_transfer(
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
  v_calling_user UUID;
BEGIN
  -- ============================================
  -- SECURITY: Verify caller is the sender
  -- ============================================
  v_calling_user := auth.uid();
  
  -- Allow service_role to bypass for system operations
  IF v_calling_user IS NULL THEN
    -- Check if this is service_role context
    IF current_setting('role', true) != 'service_role' THEN
      RAISE EXCEPTION 'Authentication required';
    END IF;
  ELSE
    -- Authenticated user must match sender_id
    IF p_sender_id != v_calling_user THEN
      RAISE EXCEPTION 'Cannot transfer funds on behalf of another user. Your ID: %, Requested sender: %', 
        v_calling_user, p_sender_id;
    END IF;
  END IF;
  -- ============================================

  -- Basic validation
  IF p_sender_id = p_recipient_id THEN
    RAISE EXCEPTION 'Cannot transfer to yourself';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Amount limit for safety
  IF p_amount > 10000 THEN
    RAISE EXCEPTION 'Amount exceeds maximum transfer limit of $10,000';
  END IF;

  -- Verify recipient exists
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_recipient_id) THEN
    RAISE EXCEPTION 'Recipient not found';
  END IF;

  -- Lock sender row and check balance
  SELECT balance INTO STRICT v_sender_balance
  FROM public.users
  WHERE id = p_sender_id
  FOR UPDATE;

  IF v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds: available %.2f, requested %.2f', v_sender_balance, p_amount;
  END IF;

  -- Lock recipient row
  SELECT balance INTO STRICT v_recipient_balance
  FROM public.users
  WHERE id = p_recipient_id
  FOR UPDATE;

  -- Debit sender
  UPDATE public.users
  SET
    balance = balance - p_amount,
    updated_at = NOW()
  WHERE id = p_sender_id;

  -- Credit recipient
  UPDATE public.users
  SET
    balance = balance + p_amount,
    updated_at = NOW()
  WHERE id = p_recipient_id;

  -- Log sender transaction
  INSERT INTO public.transactions (
    user_id,
    moment_id,
    type,
    amount,
    status,
    description,
    metadata
  ) VALUES (
    p_sender_id,
    p_moment_id,
    'payment', -- Changed from 'transfer_out' to standard type if needed, or keep specific
    -p_amount,
    'completed',
    COALESCE(p_message, 'Transfer to user'),
    jsonb_build_object('recipient_id', p_recipient_id)
  ) RETURNING id INTO v_txn_sender_id;

  -- Log recipient transaction
  INSERT INTO public.transactions (
    user_id,
    moment_id,
    type,
    amount,
    status,
    description,
    metadata
  ) VALUES (
    p_recipient_id,
    p_moment_id,
    'deposit', -- Changed from 'transfer_in'
    p_amount,
    'completed',
    COALESCE(p_message, 'Transfer from user'),
    jsonb_build_object('sender_id', p_sender_id)
  ) RETURNING id INTO v_txn_recipient_id;

  RETURN jsonb_build_object(
    'success', true,
    'sender_transaction_id', v_txn_sender_id,
    'recipient_transaction_id', v_txn_recipient_id,
    'new_balance', v_sender_balance - p_amount
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;
