-- Migration: Fix Coin Transaction Precision
-- Description: Change coin_transactions.amount to DECIMAL for fractional support
-- Issue: Currently INTEGER, causes rounding errors for partial coins (e.g., 50.50 LVND)

-- ==============================================================
-- 1. ALTER COIN_TRANSACTIONS TABLE
-- ==============================================================

-- Change amount column from INTEGER to DECIMAL(20,2)
ALTER TABLE coin_transactions 
ALTER COLUMN amount TYPE DECIMAL(20,2);

-- ==============================================================
-- 2. UPDATE HANDLE_COIN_TRANSACTION RPC
-- ==============================================================

CREATE OR REPLACE FUNCTION handle_coin_transaction(
    p_user_id UUID,
    p_amount DECIMAL(20,2),  -- Changed from INTEGER
    p_type TEXT DEFAULT 'purchase',
    p_description TEXT DEFAULT NULL,  -- Kept for backward compatibility
    p_reference_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_wallet_id UUID;
    v_new_balance DECIMAL(20,2);
    v_transaction_id UUID;
BEGIN
    -- 1. Check idempotency (prevent duplicate transactions)
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id INTO v_transaction_id
        FROM coin_transactions
        WHERE idempotency_key = p_idempotency_key;
        
        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true,
                'transaction_id', v_transaction_id,
                'message', 'Transaction already processed (idempotent)'
            );
        END IF;
    END IF;

    -- 2. Get or create wallet (atomic, prevents race condition)
    INSERT INTO wallets (user_id, currency, coins_balance, balance)
    VALUES (p_user_id, 'LVND', 0, 0)
    ON CONFLICT (user_id, currency) DO NOTHING;

    SELECT id INTO v_wallet_id
    FROM wallets
    WHERE user_id = p_user_id AND currency = 'LVND';

    -- 3. Update wallet balance (with row-level lock to prevent race conditions)
    UPDATE wallets
    SET coins_balance = coins_balance + p_amount,
        last_updated = NOW()
    WHERE id = v_wallet_id
    RETURNING coins_balance INTO v_new_balance;

    -- 4. Log transaction
    INSERT INTO coin_transactions (
        user_id,
        amount,
        type,
        reference_id,
        metadata,
        idempotency_key,
        status,
        created_at
    )
    VALUES (
        p_user_id,
        p_amount,  -- No more ::INTEGER cast
        p_type,
        p_reference_id,
        p_metadata,
        p_idempotency_key,
        'completed',
        NOW()
    )
    RETURNING id INTO v_transaction_id;

    -- 5. Return result
    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'wallet_id', v_wallet_id,
        'new_balance', v_new_balance,
        'amount_processed', p_amount
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- ==============================================================
-- 3. ADD COMMENT
-- ==============================================================

COMMENT ON COLUMN coin_transactions.amount IS 'Transaction amount in LVND (supports fractional coins like 50.50)';
COMMENT ON FUNCTION handle_coin_transaction(UUID, DECIMAL, TEXT, TEXT, TEXT, JSONB, TEXT) IS 'Updated to support fractional LVND amounts (DECIMAL precision)';
