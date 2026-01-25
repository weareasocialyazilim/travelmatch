-- Migration: 20260124040000_add_moderation_columns_and_update_views.sql
-- Description: Adds AI moderation columns to moments and updates Admin views

-- 1. Add columns to moments
ALTER TABLE public.moments 
ADD COLUMN IF NOT EXISTS ai_moderation_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS ai_moderation_labels JSONB DEFAULT '[]';

-- 2. Update view_moderation_queue (refresh it)
CREATE OR REPLACE VIEW public.view_moderation_queue AS
SELECT 
    m.id AS moment_id,
    m.title,
    m.user_id,
    p.username,
    m.media_url,
    m.created_at,
    m.is_approved,
    m.is_hidden,
    m.ai_moderation_score,
    m.ai_moderation_labels
FROM 
    public.moments m
JOIN 
    public.profiles p ON m.user_id = p.id
WHERE 
    m.is_approved = false 
    OR m.is_hidden = true
ORDER BY 
    m.created_at DESC;

-- 3. Update view_financial_health to use wallets table
CREATE OR REPLACE VIEW public.view_financial_health AS
WITH EscrowStats AS (
    SELECT
        COUNT(*) as total_transactions,
        SUM(amount) as total_escrow_volume,
        SUM(CASE WHEN escrow_status = 'locked' THEN amount ELSE 0 END) as active_escrow_balance
    FROM 
        public.transactions
    WHERE 
        type = 'gift' -- Assuming gifts go to escrow
),
WalletStats AS (
    SELECT
        SUM(coins_balance) as total_coins_sold,
        SUM(pending_balance) as apple_pending_funds
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
    w.total_coins_sold,
    w.apple_pending_funds,
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
GRANT SELECT ON public.wallets TO authenticated;
GRANT SELECT ON public.withdrawal_requests TO authenticated;
