-- Migration: 20260124020000_create_wallets_table.sql
-- Description: Creates the wallets table and migrates balance data from users

-- 1. Create Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    coins_balance DECIMAL(18, 2) DEFAULT 0.00 NOT NULL,
    pending_balance DECIMAL(18, 2) DEFAULT 0.00 NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'TRY' NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_wallet UNIQUE (user_id)
);

-- 2. Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- 3. Policies
CREATE POLICY "Users can view their own wallet" 
ON public.wallets FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Initial Migration
INSERT INTO public.wallets (user_id, coins_balance, pending_balance, currency_code)
SELECT id, COALESCE(coins_balance, 0), COALESCE(pending_balance, 0), COALESCE(currency_code, 'TRY')
FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wallet_timestamp
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION update_wallet_timestamp();

-- 6. Add escrow_status and withdrawal_status to transactions if not already granular
-- Assuming transactions already has escrow_status from previous migration
-- Adding withdrawal_approval_status to transactions for manual checks
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS withdrawal_approval_status TEXT DEFAULT 'not_applicable' 
CHECK (withdrawal_approval_status IN ('not_applicable', 'pending_approval', 'approved', 'rejected'));

-- 7. Log Change
RAISE NOTICE '✅ Wallets table created and data migrated.';
