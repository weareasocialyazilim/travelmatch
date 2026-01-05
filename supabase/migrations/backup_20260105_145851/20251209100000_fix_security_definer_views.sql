-- Fix Security Definer Views - Convert to SECURITY INVOKER
-- Migration to address ERROR level security issues
-- Date: 2025-12-09
-- Issue: Views bypass RLS when using SECURITY DEFINER (default)

-- Drop existing views
DROP VIEW IF EXISTS deep_link_conversion_funnel;
DROP VIEW IF EXISTS deep_link_attribution;
DROP VIEW IF EXISTS proof_quality_stats;

-- Recreate views with SECURITY INVOKER
-- This ensures RLS policies are respected and users only see their own data

-- Deep link conversion funnel - SECURITY INVOKER
CREATE OR REPLACE VIEW deep_link_conversion_funnel
WITH (security_invoker = true) AS
SELECT
    type,
    source,
    campaign,
    COUNT(*) as total_clicks,
    COUNT(CASE WHEN landing_screen IS NOT NULL THEN 1 END) as landed,
    COUNT(CASE WHEN completed THEN 1 END) as converted,
    ROUND(
        100.0 * COUNT(CASE WHEN completed THEN 1 END) / NULLIF(COUNT(*), 0),
        2
    ) as conversion_rate,
    AVG(time_to_land) as avg_time_to_land,
    AVG(time_to_complete) as avg_time_to_complete
FROM deep_link_events
GROUP BY type, source, campaign;

-- Deep link attribution report - SECURITY INVOKER
CREATE OR REPLACE VIEW deep_link_attribution
WITH (security_invoker = true) AS
SELECT
    source,
    campaign,
    medium,
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as clicks,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(CASE WHEN completed THEN 1 END) as conversions,
    ROUND(
        100.0 * COUNT(CASE WHEN completed THEN 1 END) / NULLIF(COUNT(*), 0),
        2
    ) as conversion_rate
FROM deep_link_events
GROUP BY source, campaign, medium, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Proof quality statistics - SECURITY INVOKER
CREATE OR REPLACE VIEW proof_quality_stats
WITH (security_invoker = true) AS
SELECT
    proof_type,
    COUNT(*) as total_submissions,
    COUNT(CASE WHEN approved THEN 1 END) as auto_approved,
    COUNT(CASE WHEN NOT approved THEN 1 END) as needs_review,
    ROUND(AVG((score->>'overall')::numeric), 2) as avg_score,
    ROUND(
        100.0 * COUNT(CASE WHEN approved THEN 1 END) / NULLIF(COUNT(*), 0),
        2
    ) as auto_approval_rate,
    DATE_TRUNC('day', created_at) as date
FROM proof_quality_scores
GROUP BY proof_type, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Restore comments
COMMENT ON VIEW deep_link_conversion_funnel IS 'Conversion funnel by type, source, and campaign - SECURITY INVOKER respects RLS';
COMMENT ON VIEW deep_link_attribution IS 'Attribution report by source and campaign - SECURITY INVOKER respects RLS';
COMMENT ON VIEW proof_quality_stats IS 'Quality score statistics by proof type - SECURITY INVOKER respects RLS';

-- Grant access to authenticated users
GRANT SELECT ON deep_link_conversion_funnel TO authenticated;
GRANT SELECT ON deep_link_attribution TO authenticated;
GRANT SELECT ON proof_quality_stats TO authenticated;

-- Note: Views now respect RLS policies on underlying tables
-- - deep_link_events: Users see only their own events
-- - proof_quality_scores: Users see only their own scores
-- - Admin/analytics access should be handled via service role or separate analytics schema
