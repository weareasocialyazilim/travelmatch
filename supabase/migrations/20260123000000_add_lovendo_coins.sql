-- ============================================
-- LOVENDO COINS MIGRATION (FIXED)
-- Description: Adds support for virtual currency ("Coins") to comply with Apple IAP.
-- Note: Fixed to match existing schema
-- ============================================

-- 1. Coin Packages (IAP Products) - Only create if not exists
CREATE TABLE IF NOT EXISTS coin_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_product_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  coin_amount INTEGER NOT NULL CHECK (coin_amount > 0),
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  platform TEXT DEFAULT 'all' CHECK (platform IN ('all', 'ios', 'android')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add indexes for coin_packages
CREATE INDEX IF NOT EXISTS idx_coin_packages_active ON coin_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_coin_packages_store_id ON coin_packages(store_product_id);

-- 3. Add missing columns to coin_transactions if they don't exist
-- (coin_transactions already exists with sender_id/recipient_id schema)
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100);
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'purchase';
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';

-- 4. Update RLS policies for coin_transactions
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy to match current schema
DROP POLICY IF EXISTS "Users can view own coin transactions" ON coin_transactions;
CREATE POLICY "Users can view own coin transactions"
  ON coin_transactions FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- 5. Add RLS policies for coin_packages
ALTER TABLE coin_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active coin packages" ON coin_packages;
CREATE POLICY "Anyone can view active coin packages"
  ON coin_packages FOR SELECT
  USING (is_active = true);

-- 6. Helper function to handle coin transactions (matches existing schema)
CREATE OR REPLACE FUNCTION handle_coin_transaction(
  p_user_id UUID,
  p_amount NUMERIC,
  p_type TEXT,
  p_reference_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'pg_catalog', 'public'
AS $$
DECLARE
  v_txn_id UUID;
BEGIN
  -- Check idempotency
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_txn_id FROM coin_transactions WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN RETURN v_txn_id; END IF;
  END IF;

  -- Insert transaction (matches existing schema: sender_id/recipient_id)
  INSERT INTO coin_transactions (
    reference_id, sender_id, recipient_id, amount, currency, type, status, metadata, idempotency_key
  )
  VALUES (
    p_reference_id, NULL, p_user_id, ABS(p_amount), 'LVND', COALESCE(p_type, 'purchase'), 'completed', p_metadata, p_idempotency_key
  )
  RETURNING id INTO v_txn_id;

  RETURN v_txn_id;
END;
$$;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION handle_coin_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION handle_coin_transaction TO service_role;
GRANT SELECT ON coin_packages TO authenticated;
GRANT SELECT ON coin_transactions TO authenticated;

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Coin system migration applied successfully';
  RAISE NOTICE '- coin_packages table created/updated';
  RAISE NOTICE '- coin_transactions columns added';
  RAISE NOTICE '- handle_coin_transaction function created';
  RAISE NOTICE '============================================';
END $$;
