-- Migration: Fix Admin View for User Safety separation
-- Created: 2026-01-24

DROP VIEW IF EXISTS public.admin_moderation_inbox;
CREATE OR REPLACE VIEW public.admin_moderation_inbox AS
SELECT 
    u.id as user_id,
    u.full_name,
    us.risk_score,
    us.status as moderation_status,
    u.created_at,
    'high_risk' as trigger_type,
    jsonb_build_object('score', us.risk_score) as details,
    (SELECT COUNT(*) FROM public.reports r WHERE r.reported_user_id = u.id) as report_count,
    NOW() as updated_at
FROM public.users u
JOIN public.user_safety us ON us.user_id = u.id
WHERE us.risk_score >= 80 AND us.status NOT IN ('permanent_ban')

UNION ALL

SELECT 
    r.reported_user_id as user_id,
    u.full_name,
    us.risk_score,
    us.status as moderation_status,
    u.created_at,
    'reported' as trigger_type,
    jsonb_build_object('reason', r.reason, 'report_id', r.id) as details,
    (SELECT COUNT(*) FROM public.reports rep WHERE rep.reported_user_id = u.id) as report_count,
    r.created_at as updated_at
FROM public.reports r
JOIN public.users u ON u.id = r.reported_user_id
JOIN public.user_safety us ON us.user_id = u.id
WHERE r.status = 'pending';
