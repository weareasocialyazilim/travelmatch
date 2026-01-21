-- Migration: 20260124020000_create_wallets_table.sql
-- Description: Updates the wallets table and migrates balance data from users (Compatible with Ledger OS)

-- 1. Update Wallets Table Structure safely
DO $$ 
BEGIN
    -- Add coins_balance if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'coins_balance') THEN
        ALTER TABLE public.wallets ADD COLUMN coins_balance DECIMAL(18, 2) DEFAULT 0.00 NOT NULL;
    END IF;

    -- Add pending_balance if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'pending_balance') THEN
        ALTER TABLE public.wallets ADD COLUMN pending_balance DECIMAL(18, 2) DEFAULT 0.00 NOT NULL;
    END IF;

    -- Add currency_code if not exists (Note: Ledger OS uses 'currency' column, but we add this for compatibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'currency_code') THEN
        ALTER TABLE public.wallets ADD COLUMN currency_code VARCHAR(3) DEFAULT 'TRY' NOT NULL;
    END IF;

    -- Add last_updated if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'last_updated') THEN
        ALTER TABLE public.wallets ADD COLUMN last_updated TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 2. Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- 3. Policies (Idempotent)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallets' AND policyname = 'Users can view their own wallet') THEN
        CREATE POLICY "Users can view their own wallet" 
        ON public.wallets FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Initial Migration
-- Note: We use ON CONFLICT DO NOTHING to avoid duplicate key errors with Ledger OS unique constraints
-- Note: Check against auth.users to ensure referential integrity (avoid FK violation for deleted users)
INSERT INTO public.wallets (user_id, coins_balance, pending_balance, currency_code)
SELECT u.id, 0, 0, 'TRY'
FROM public.users u
JOIN auth.users au ON u.id = au.id
ON CONFLICT DO NOTHING;

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_wallet_timestamp ON public.wallets;
CREATE TRIGGER trigger_update_wallet_timestamp
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION update_wallet_timestamp();

-- 6. Add transaction columns safely
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS withdrawal_approval_status TEXT DEFAULT 'not_applicable' 
CHECK (withdrawal_approval_status IN ('not_applicable', 'pending_approval', 'approved', 'rejected'));
