-- Atomic Wallet Transfer Functions
-- Prevents double-spending and race conditions in wallet transactions

-- Skip audit_logs table creation if it exists (it already does)
-- The existing audit_logs table will work fine for wallet auditing

-- Create atomic transfer function with row locking
CREATE OR REPLACE FUNCTION transfer_funds(
  sender_id UUID,
  receiver_id UUID,
  amount NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  sender_balance NUMERIC;
BEGIN
  -- Lock sender and receiver rows FOR UPDATE (prevents concurrent modifications)
  SELECT balance INTO sender_balance
  FROM wallets
  WHERE user_id = sender_id
  FOR UPDATE;

  -- Check sufficient balance
  IF sender_balance < amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance'
    );
  END IF;

  -- Deduct from sender
  UPDATE wallets
  SET balance = balance - amount,
      updated_at = NOW()
  WHERE user_id = sender_id;

  -- Add to receiver
  UPDATE wallets  
  SET balance = balance + amount,
      updated_at = NOW()
  WHERE user_id = receiver_id;

  RETURN jsonb_build_object(
    'success', true,
    'sender_new_balance', sender_balance - amount
  );
END;
$$ LANGUAGE plpgsql;

-- Create atomic withdrawal function
CREATE OR REPLACE FUNCTION withdraw_funds(
  user_id_param UUID,
  amount NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  current_balance NUMERIC;
BEGIN
  -- Lock user row
  SELECT balance INTO current_balance
  FROM wallets
  WHERE user_id = user_id_param
  FOR UPDATE;

  -- Check sufficient balance
  IF current_balance < amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance'
    );
  END IF;

  -- Deduct amount
  UPDATE wallets
  SET balance = balance - amount,
      updated_at = NOW()
  WHERE user_id = user_id_param;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', current_balance - amount
  );
END;
$$ LANGUAGE plpgsql;

-- Create atomic deposit function
CREATE OR REPLACE FUNCTION deposit_funds(
  user_id_param UUID,
  amount NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  new_balance NUMERIC;
BEGIN
  -- Lock user row
  UPDATE wallets
  SET balance = balance + amount,
      updated_at = NOW()
  WHERE user_id = user_id_param
  RETURNING balance INTO new_balance;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', new_balance
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION transfer_funds IS 'Atomically transfer funds between users with row locking';
COMMENT ON FUNCTION withdraw_funds IS 'Atomically withdraw funds with balance check';
COMMENT ON FUNCTION deposit_funds IS 'Atomically deposit funds to user wallet';
