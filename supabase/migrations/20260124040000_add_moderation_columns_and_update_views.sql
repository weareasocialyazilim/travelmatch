-- Migration: 20260124040000_add_moderation_columns_and_update_views.sql (FIXED)
-- Description: Adds AI moderation columns to moments and updates Admin views
-- Note: Fixed to match existing schema (profiles -> users, coins_balance -> balance)

-- 1. Add columns to moments if they don't exist
ALTER TABLE public.moments
ADD COLUMN IF NOT EXISTS ai_moderation_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS ai_moderation_labels JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

-- 2. Update view_moderation_queue (use users table, not profiles)
CREATE OR REPLACE VIEW public.view_moderation_queue AS
SELECT
    m.id AS moment_id,
    m.title,
    m.user_id,
    COALESCE(u.raw_user_meta_data->>'username', u.email, 'Unknown') AS username,
    CASE WHEN array_length(m.images, 1) > 0 THEN m.images[1] ELSE NULL END AS media_url,
    m.created_at,
    m.is_approved,
    m.is_hidden,
    m.ai_moderation_score,
    m.ai_moderation_labels
FROM
    public.moments m
JOIN
    auth.users u ON m.user_id = u.id
WHERE
    m.is_approved = false
    OR m.is_hidden = true
ORDER BY
    m.created_at DESC;

-- 3. Update view_financial_health to use correct column names
CREATE OR REPLACE VIEW public.view_financial_health AS
WITH EscrowStats AS (
    SELECT
        COUNT(*) as total_transactions,
        SUM(amount) as total_escrow_volume,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as active_escrow_balance
    FROM
        public.escrow_transactions
),
WalletStats AS (
    SELECT
        SUM(balance) as total_coins,
        SUM(pending_balance) as pending_funds
    FROM
        public.wallets
),
WithdrawalStats AS (
    SELECT
        COUNT(*) as pending_count,
        SUM(amount) as pending_amount
    FROM
        public.withdrawal_requests
    WHERE
        status = 'pending_processing' OR status = 'pending_approval'
)
SELECT
    e.total_transactions,
    e.total_escrow_volume,
    e.active_escrow_balance,
    w.total_coins,
    w.pending_funds as apple_pending_funds,
    wd.pending_count as pending_withdrawals_count,
    wd.pending_amount as pending_withdrawals_amount,
    NOW() as last_updated
FROM
    EscrowStats e
CROSS JOIN
    WalletStats w
CROSS JOIN
    WithdrawalStats wd;

-- 4. Grants
GRANT SELECT ON public.moments TO authenticated;
GRANT SELECT ON public.view_moderation_queue TO authenticated;
GRANT SELECT ON public.view_financial_health TO authenticated;
GRANT SELECT ON public.wallets TO authenticated;
GRANT SELECT ON public.withdrawal_requests TO authenticated;

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Moderation columns and views updated';
    RAISE NOTICE '- Added ai_moderation_score/labels to moments';
    RAISE NOTICE '- Added is_approved/is_hidden columns';
    RAISE NOTICE '- Updated view_moderation_queue (users table)';
    RAISE NOTICE '- Updated view_financial_health (balance column)';
    RAISE NOTICE '============================================';
END $$;
