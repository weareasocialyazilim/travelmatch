-- ============================================
-- VALIDATE GIFT AMOUNT RPC
-- Created: 2025-01-25
-- ============================================
-- Validates that gift amount matches the moment's requested price
-- Prevents client-side manipulation of gift amounts
-- ============================================

-- Update atomic_transfer function to validate against moment's requested_amount
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
  v_moment_price DECIMAL;
  v_moment_currency TEXT;
  v_moment_owner_id UUID;
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

  -- ============================================
  -- NEW: Validate moment's requested amount
  -- If moment_id is provided, amount MUST match moment's price
  -- ============================================
  IF p_moment_id IS NOT NULL THEN
    SELECT price, currency, user_id 
    INTO v_moment_price, v_moment_currency, v_moment_owner_id
    FROM moments 
    WHERE id = p_moment_id AND status = 'active';

    IF v_moment_price IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Moment not found or inactive',
        'moment_id', p_moment_id
      );
    END IF;

    -- Verify recipient is the moment owner
    IF v_moment_owner_id != p_recipient_id THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Recipient must be the moment owner',
        'expected_recipient', v_moment_owner_id,
        'actual_recipient', p_recipient_id
      );
    END IF;

    -- CRITICAL: Validate amount matches moment's price
    -- Allow small tolerance for floating point (0.01)
    IF ABS(p_amount - v_moment_price) > 0.01 THEN
      RAISE EXCEPTION 'Gift amount (%) does not match moment requested amount (%). Manipulation detected.', 
        p_amount, v_moment_price;
    END IF;
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

  -- Create transaction record with moment metadata
  INSERT INTO transactions (
    id,
    sender_id,
    recipient_id,
    amount,
    moment_id,
    message,
    status,
    type,
    created_at,
    metadata
  ) VALUES (
    v_transaction_id,
    p_sender_id,
    p_recipient_id,
    p_amount,
    p_moment_id,
    p_message,
    'completed',
    'gift',
    NOW(),
    CASE WHEN p_moment_id IS NOT NULL THEN
      jsonb_build_object(
        'moment_price', v_moment_price,
        'moment_currency', v_moment_currency,
        'validated_at', NOW()
      )
    ELSE NULL END
  );

  -- Log audit event with moment validation info
  INSERT INTO audit_logs (
    user_id,
    action,
    ip_address,
    metadata,
    created_at
  ) VALUES (
    p_sender_id,
    'gift.sent',
    '0.0.0.0',
    jsonb_build_object(
      'transaction_id', v_transaction_id,
      'sender_balance_before', v_sender_balance,
      'sender_balance_after', v_sender_balance - p_amount,
      'recipient_id', p_recipient_id,
      'recipient_balance_before', v_recipient_balance,
      'recipient_balance_after', v_recipient_balance + p_amount,
      'amount', p_amount,
      'moment_id', p_moment_id,
      'moment_price_validated', p_moment_id IS NOT NULL,
      'moment_expected_price', v_moment_price
    ),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'sender_new_balance', v_sender_balance - p_amount,
    'recipient_new_balance', v_recipient_balance + p_amount,
    'moment_price_validated', p_moment_id IS NOT NULL
  );

EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  WHEN OTHERS THEN
    -- Log the exception for security monitoring
    INSERT INTO audit_logs (
      user_id,
      action,
      ip_address,
      metadata,
      created_at
    ) VALUES (
      p_sender_id,
      'gift.failed',
      '0.0.0.0',
      jsonb_build_object(
        'error', SQLERRM,
        'attempted_amount', p_amount,
        'moment_id', p_moment_id,
        'recipient_id', p_recipient_id
      ),
      NOW()
    );

    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.atomic_transfer TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.atomic_transfer IS 
'Atomic fund transfer with moment price validation. 
When moment_id is provided, the transfer amount must match the moment''s price field exactly.
This prevents client-side manipulation where attackers try to send less than the requested amount.';
