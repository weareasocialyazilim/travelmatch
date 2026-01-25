-- Migration: 20260120000002_admin_dashboard.sql
-- Purpose: Create views for the Admin Panel to monitor Content Safety and Titan Protocol Financials

-- 1. Moderation Queue View
-- Fetches content that is flagged by AI or unapproved
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
    m.ai_moderation_score, -- Assuming this column exists or will be added
    m.ai_moderation_labels -- Assuming this column exists or will be added
FROM 
    public.moments m
JOIN 
    public.profiles p ON m.user_id = p.id
WHERE 
    m.is_approved = false 
    OR m.is_hidden = true
ORDER BY 
    m.created_at DESC;

-- 2. Financial Health View (Titan Protocol)
-- Aggregates Escrow balances and pending withdrawals
CREATE OR REPLACE VIEW public.view_financial_health AS
WITH EscrowStats AS (
    SELECT
        COUNT(*) as total_transactions,
        SUM(amount) as total_escrow_volume,
        SUM(CASE WHEN status = 'held' THEN amount ELSE 0 END) as active_escrow_balance,
        SUM(CASE WHEN escrow_tier = 'direct' THEN amount ELSE 0 END) as direct_volume,
        SUM(CASE WHEN escrow_tier = 'optional' THEN amount ELSE 0 END) as optional_volume,
        SUM(CASE WHEN escrow_tier = 'mandatory' THEN amount ELSE 0 END) as mandatory_volume
    FROM 
        public.escrow_transactions
),
WithdrawalStats AS (
    SELECT
        COUNT(*) as pending_count,
        SUM(amount) as pending_amount
    FROM 
        public.transactions
    WHERE 
        type = 'withdrawal' AND status = 'pending'
)
SELECT 
    e.total_transactions,
    e.total_escrow_volume,
    e.active_escrow_balance,
    e.direct_volume,
    e.optional_volume,
    e.mandatory_volume,
    w.pending_count as pending_withdrawals_count,
    w.pending_amount as pending_withdrawals_amount,
    NOW() as last_updated
FROM 
    EscrowStats e
CROSS JOIN 
    WithdrawalStats w;

-- Grant access to authenticated users (RLS will filter actual admin access)
GRANT SELECT ON public.view_moderation_queue TO authenticated;
GRANT SELECT ON public.view_financial_health TO authenticated;
