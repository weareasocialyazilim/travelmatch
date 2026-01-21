-- Migration: 20260124040000_add_moderation_columns_and_update_views.sql
-- Description: Adds AI moderation columns to moments and updates Admin views

-- 1. Add columns to moments
ALTER TABLE public.moments 
ADD COLUMN IF NOT EXISTS ai_moderation_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS ai_moderation_labels JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

-- 2. Update view_moderation_queue (refresh it)
-- Drop first to avoid column mismatch errors (cannot change name of view column...)
DROP VIEW IF EXISTS public.view_moderation_queue;

CREATE OR REPLACE VIEW public.view_moderation_queue AS
SELECT 
    m.id AS moment_id,
    m.title,
    m.user_id,
    COALESCE(u.email, 'Unknown') AS username,
    CASE WHEN array_length(m.images, 1) > 0 THEN m.images[1] ELSE NULL END AS media_url,
    m.created_at,
    m.is_approved,
    m.is_hidden,
    m.ai_moderation_score,
    m.ai_moderation_labels
FROM 
    public.moments m
LEFT JOIN 
    public.users u ON m.user_id = u.id
WHERE 
    m.is_approved = false 
    OR m.is_hidden = true
ORDER BY 
    m.created_at DESC;

-- 3. Update view_financial_health to use wallets table
DROP VIEW IF EXISTS public.view_financial_health;

CREATE OR REPLACE VIEW public.view_financial_health AS
WITH EscrowStats AS (
    SELECT
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_escrow_volume,
        COALESCE(SUM(CASE WHEN escrow_status = 'locked' THEN amount ELSE 0 END), 0) as active_escrow_balance
    FROM 
        public.transactions
    WHERE
        status = 'completed' OR escrow_status = 'locked'
),
WalletStats AS (
    SELECT
        COALESCE(SUM(coins_balance), 0) as total_user_balance,
        COALESCE(SUM(pending_balance), 0) as total_pending_balance
    FROM
        public.wallets
)
SELECT
    e.total_transactions,
    e.total_escrow_volume,
    e.active_escrow_balance,
    w.total_user_balance,
    w.total_pending_balance,
    NOW() as last_updated
FROM
    EscrowStats e,
    WalletStats w;
