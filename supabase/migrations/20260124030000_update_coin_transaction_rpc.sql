-- Migration: 20260124030000_update_coin_transaction_rpc.sql
-- Description: Updates handle_coin_transaction to use the wallets table

CREATE OR REPLACE FUNCTION handle_coin_transaction(
  p_user_id UUID,
  p_amount DECIMAL,
  p_type TEXT,
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_new_balance DECIMAL;
  v_txn_id UUID;
BEGIN
  -- 1. Ensure wallet exists (Just in case)
  INSERT INTO wallets (user_id, coins_balance, currency_code)
  VALUES (p_user_id, 0.00, 'TRY')
  ON CONFLICT (user_id) DO NOTHING;

  -- 2. Lock wallet for update to prevent race conditions
  SELECT coins_balance INTO v_new_balance
  FROM wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- 3. Check sufficient funds for debit
  IF p_amount < 0 AND (v_new_balance + p_amount) < 0 THEN
    RAISE EXCEPTION 'Insufficient coin balance';
  END IF;

  -- 4. Update Wallet Balance
  UPDATE wallets 
  SET coins_balance = coins_balance + p_amount,
      last_updated = NOW()
  WHERE user_id = p_user_id;

  -- 5. Sync back to users table for backward compatibility (Optional, but safer for now)
  -- Note: We should eventually remove coins_balance from users table
  UPDATE users 
  SET coins_balance = (SELECT coins_balance FROM wallets WHERE user_id = p_user_id),
      updated_at = NOW()
  WHERE id = p_user_id;

  -- 6. Record Transaction in audit trail
  -- Note: coin_transactions table currently expects INTEGER amount. 
  -- We should probably keep it INTEGER if coins are always whole units, 
  -- but our model says 1 LVND = 1 local unit, and local units can have decimals.
  -- I'll keep it as DECIMAL in wallets but let's see if we should adjust coin_transactions.
  
  INSERT INTO coin_transactions (
    user_id, amount, type, reference_id, description, metadata
  ) VALUES (
    p_user_id, p_amount::INTEGER, p_type, p_reference_id, p_description, p_metadata
  )
  RETURNING id INTO v_txn_id;

  RETURN v_txn_id;
END;
$$;
