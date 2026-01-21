-- Migration: 20260121_init_ledger_os
-- Purpose: Establish the Ledger Operating System (Wallets + Transactions) and enforcing Security Policies
-- Standard: Docs/architecture/BACKEND_OPERATING_SYSTEM.md

-- 1. Create Wallets Table (The single source of truth for balances)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance NUMERIC(20, 2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
    currency VARCHAR(10) DEFAULT 'LVND' NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ,
    UNIQUE(user_id, currency)
);

-- 2. Create Coin Transactions (The Ledger)
CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id VARCHAR(100) NOT NULL, -- External ID or Idempotency Key
    sender_id UUID REFERENCES auth.users(id),
    recipient_id UUID REFERENCES auth.users(id),
    amount NUMERIC(20, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'LVND' NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('gift', 'purchase', 'withdrawal', 'refund', 'escrow_lock', 'escrow_release', 'reward')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    idempotency_key VARCHAR(100),
    UNIQUE(idempotency_key)
);

-- 3. Audit Logs (If not exists)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    details JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS Policies
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4.1 Wallets: Users read own, Service Role writes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'wallets' 
        AND policyname = 'Users can view own wallet'
    ) THEN
        CREATE POLICY "Users can view own wallet" ON public.wallets
            FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;

-- No INSERT/UPDATE/DELETE for authenticated users on wallets (RPC Only)

-- 4.2 Transactions: Users read own (sender or recipient)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'coin_transactions' 
        AND policyname = 'Users can view own transactions'
    ) THEN
        CREATE POLICY "Users can view own transactions" ON public.coin_transactions
            FOR SELECT TO authenticated 
            USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
    END IF;
END $$;

-- 5. RPC: Discover Nearby Moments (Secure, subset return)
-- Drops existing if present to enforce new standard
DROP FUNCTION IF EXISTS public.discover_nearby_moments;

CREATE OR REPLACE FUNCTION public.discover_nearby_moments(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 5000,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    title TEXT,
    thumbnail_url TEXT,
    distance_meters DOUBLE PRECISION,
    created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Audit the search (optional, careful with volume)
    -- INSERT INTO public.audit_logs (user_id, action, resource_type, details)
    -- VALUES (auth.uid(), 'discover_search', 'moment', jsonb_build_object('lat', lat, 'lng', lng));

    RETURN QUERY
    SELECT 
        m.id,
        m.user_id,
        m.description as title, -- Mapping description to title for safe subset
        m.media_url as thumbnail_url, -- Assuming media_url is the thumb
        (point(m.lng, m.lat) <@> point(lng, lat)) * 1609.344 as distance_meters,
        m.created_at
    FROM public.moments m
    WHERE 
        m.status = 'active'
        AND (point(m.lng, m.lat) <@> point(lng, lat)) < (radius_meters / 1609.344)
    ORDER BY distance_meters ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- 6. RPC: Get Wallet Balance (Safe wrapper)
CREATE OR REPLACE FUNCTION public.get_my_wallet_balance()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    wallet_data public.wallets%ROWTYPE;
BEGIN
    SELECT * INTO wallet_data
    FROM public.wallets
    WHERE user_id = auth.uid()
    LIMIT 1;

    IF NOT FOUND THEN
        -- Auto-create wallet if missing (Idempotent)
        INSERT INTO public.wallets (user_id, balance, currency)
        VALUES (auth.uid(), 0.00, 'LVND')
        RETURNING * INTO wallet_data;
    END IF;

    RETURN jsonb_build_object(
        'balance', wallet_data.balance,
        'currency', wallet_data.currency,
        'status', wallet_data.status
    );
END;
$$;
