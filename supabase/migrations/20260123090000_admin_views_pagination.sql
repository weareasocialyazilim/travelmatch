-- Migration: 20260123090000_admin_views_pagination.sql
-- Purpose: Admin performance views for finance and escrow lists

-- Finance transactions view for admin dashboards
CREATE OR REPLACE VIEW public.view_admin_finance_transactions AS
SELECT
  id,
  user_id,
  type,
  amount,
  currency,
  status,
  created_at
FROM public.transactions;

-- Escrow transactions view with joined user/moment metadata
CREATE OR REPLACE VIEW public.view_admin_escrow_transactions AS
SELECT
  e.id,
  e.sender_id,
  e.recipient_id,
  e.amount,
  e.currency,
  e.status,
  e.created_at,
  e.expires_at,
  e.released_at,
  e.refunded_at,
  e.proof_verified,
  e.moment_id,
  sender.display_name AS sender_name,
  sender.email AS sender_email,
  sender.avatar_url AS sender_avatar_url,
  recipient.display_name AS recipient_name,
  recipient.email AS recipient_email,
  recipient.avatar_url AS recipient_avatar_url,
  m.title AS moment_title,
  m.price AS moment_price
FROM public.escrow_transactions e
LEFT JOIN public.users sender ON sender.id = e.sender_id
LEFT JOIN public.users recipient ON recipient.id = e.recipient_id
LEFT JOIN public.moments m ON m.id = e.moment_id;

-- Finance summary RPC for admin dashboards (period + optional type)
CREATE OR REPLACE FUNCTION public.admin_finance_summary(
  p_start TIMESTAMPTZ,
  p_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  total_revenue NUMERIC,
  total_refunds NUMERIC,
  subscription_revenue NUMERIC,
  boost_revenue NUMERIC,
  transaction_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(
      SUM(
        CASE
          WHEN type IN ('subscription', 'boost') THEN amount
          ELSE 0
        END
      ),
      0
    ) AS total_revenue,
    COALESCE(
      SUM(
        CASE
          WHEN type = 'refund' THEN amount
          ELSE 0
        END
      ),
      0
    ) AS total_refunds,
    COALESCE(
      SUM(
        CASE
          WHEN type = 'subscription' THEN amount
          ELSE 0
        END
      ),
      0
    ) AS subscription_revenue,
    COALESCE(
      SUM(
        CASE
          WHEN type = 'boost' THEN amount
          ELSE 0
        END
      ),
      0
    ) AS boost_revenue,
    COUNT(*) AS transaction_count
  FROM public.transactions
  WHERE created_at >= p_start
    AND (p_type IS NULL OR type = p_type);
$$;

GRANT SELECT ON public.view_admin_finance_transactions TO authenticated;
GRANT SELECT ON public.view_admin_escrow_transactions TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_finance_summary(TIMESTAMPTZ, TEXT) TO authenticated;
