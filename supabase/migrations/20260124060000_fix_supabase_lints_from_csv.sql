-- =============================================================================
-- Fix Supabase Lints from CSV (FIXED)
-- =============================================================================

-- view_moderation_queue
DROP VIEW IF EXISTS public.view_moderation_queue;
CREATE OR REPLACE VIEW public.view_moderation_queue
WITH (security_invoker = true) AS
SELECT
    m.id AS moment_id, m.title, m.user_id,
    COALESCE(u.raw_user_meta_data->>'username', u.email, 'Unknown') AS username,
    CASE WHEN array_length(m.images, 1) > 0 THEN m.images[1] ELSE NULL END AS media_url,
    m.created_at,
    COALESCE(m.is_approved, false) AS is_approved,
    COALESCE(m.is_hidden, false) AS is_hidden,
    m.ai_moderation_score, m.ai_moderation_labels
FROM public.moments m
LEFT JOIN auth.users u ON m.user_id = u.id
WHERE COALESCE(m.is_approved, false) = false OR COALESCE(m.is_hidden, false) = true
ORDER BY m.created_at DESC;

GRANT SELECT ON public.view_moderation_queue TO authenticated, service_role;

-- view_financial_health
DROP VIEW IF EXISTS public.view_financial_health;
CREATE OR REPLACE VIEW public.view_financial_health
WITH (security_invoker = true) AS
WITH EscrowStats AS (
    SELECT COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_escrow_volume,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as active_escrow_balance
    FROM public.escrow_transactions WHERE status = 'pending'
),
WalletStats AS (
    SELECT COALESCE(SUM(balance), 0) as total_user_balance, COALESCE(SUM(pending_balance), 0) as total_pending_balance
    FROM public.wallets
)
SELECT e.total_transactions, e.total_escrow_volume, e.active_escrow_balance,
    w.total_user_balance, w.total_pending_balance, NOW() as last_updated
FROM EscrowStats e, WalletStats w;

GRANT SELECT ON public.view_financial_health TO authenticated, service_role;

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Fixed linter views';
  RAISE NOTICE '============================================';
END $$;
