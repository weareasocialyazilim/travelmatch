-- Migration: 20260124020000_create_wallets_table.sql (FIXED)
-- Description: Updates the wallets table to match existing schema
-- Note: wallets table already exists with balance column

-- 1. Add missing columns if they don't exist
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(20, 2) DEFAULT 0.00;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'LVND';
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- 2. Ensure RLS is enabled
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- 3. Ensure policies exist
CREATE POLICY IF NOT EXISTS "Users can view own wallet"
ON public.wallets FOR SELECT
USING (auth.uid() = user_id);

-- 4. Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger if not exists
DROP TRIGGER IF EXISTS trigger_update_wallet_timestamp ON public.wallets;
CREATE TRIGGER trigger_update_wallet_timestamp
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION update_wallet_timestamp();

-- 6. Add withdrawal columns to transactions if not exist
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS withdrawal_approval_status TEXT DEFAULT 'not_applicable';

-- 7. Add wallet-related indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_currency ON public.wallets(currency);

-- 8. Grant permissions
GRANT SELECT ON public.wallets TO authenticated;
GRANT SELECT ON public.transactions TO authenticated;

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Wallets table updated successfully';
    RAISE NOTICE '- Added missing columns (pending_balance, currency)';
    RAISE NOTICE '- Added trigger for updated_at';
    RAISE NOTICE '- Added indexes';
    RAISE NOTICE '============================================';
END $$;
