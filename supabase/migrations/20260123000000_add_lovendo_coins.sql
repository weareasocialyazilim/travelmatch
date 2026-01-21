-- ============================================
-- LOVENDO COINS MIGRATION
-- Description: Adds support for virtual currency ("Coins") to comply with Apple IAP.
-- ============================================

-- 1. Add Coins Balance to Users
-- We use INTEGER for coins (atomic units). 
ALTER TABLE users ADD COLUMN IF NOT EXISTS coins_balance INTEGER DEFAULT 0;

-- 2. Coin Packages (IAP Products)
-- These map to RevenueCat/store products.
CREATE TABLE IF NOT EXISTS coin_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_product_id TEXT NOT NULL UNIQUE, -- e.g. 'lovendo_100_coins'
  name TEXT NOT NULL,
  description TEXT,
  coin_amount INTEGER NOT NULL CHECK (coin_amount > 0),
  price DECIMAL(10,2) NOT NULL, -- Display price (e.g. 9.99)
  currency TEXT DEFAULT 'USD', -- Display currency
  is_active BOOLEAN DEFAULT TRUE,
  platform TEXT DEFAULT 'all' CHECK (platform IN ('all', 'ios', 'android')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Coin Transactions (Audit Trail)
CREATE TABLE IF NOT EXISTS coin_balance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- Positive = Credit, Negative = Debit
  type TEXT NOT NULL CHECK (
    type IN (
      'purchase',          -- Bought via IAP
      'gift_sent',         -- Sent to escrow/user
      'gift_received',     -- Released from escrow
      'bonus',             -- Admin bonus
      'refund',            -- Refunded from espresso
      'withdrawal_burn'    -- Burned for real money withdrawal
    )
  ),
  reference_id UUID, -- External ID (Escrow ID, IAP Transaction ID, etc.)
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_coin_balance_history_user ON coin_balance_history(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_balance_history_type ON coin_balance_history(type);
CREATE INDEX IF NOT EXISTS idx_coin_packages_active ON coin_packages(is_active);

-- 5. RLS Policies

-- Coin Packages: Public read, Admin write (implicit via dashboard)
ALTER TABLE coin_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coin packages" 
  ON coin_packages FOR SELECT 
  USING (is_active = true);

-- Coin Transactions: Users see their own
ALTER TABLE coin_balance_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coin transactions" 
  ON coin_balance_history FOR SELECT 
  USING (auth.uid() = user_id);

-- Users: Allow users to view own coin balance (covered by existing users select policy, but ensuring update protection)
-- Note: Updates to coins_balance should only happen via secure Database Functions (Security Definer), NOT direct client update.

-- 6. Helper Function: Safe Add/Subtract Coins
CREATE OR REPLACE FUNCTION handle_coin_transaction(
  p_user_id UUID,
  p_amount INTEGER,
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
  v_new_balance INTEGER;
  v_txn_id UUID;
BEGIN
  -- Lock user for update to prevent race conditions
  SELECT coins_balance INTO v_new_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check sufficient funds for debit
  IF p_amount < 0 AND (v_new_balance + p_amount) < 0 THEN
    RAISE EXCEPTION 'Insufficient coin balance';
  END IF;

  -- Update Balance
  UPDATE users 
  SET coins_balance = coins_balance + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Record Transaction
  INSERT INTO coin_balance_history (
    user_id, amount, type, reference_id, description, metadata
  ) VALUES (
    p_user_id, p_amount, p_type, p_reference_id, p_description, p_metadata
  )
  RETURNING id INTO v_txn_id;

  RETURN v_txn_id;
END;
$$;
