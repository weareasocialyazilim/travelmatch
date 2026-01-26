-- Migration: AI Cost Monitoring
-- Created: 2026-01-26
-- Purpose: Track AI service costs, enforce soft caps, prevent surprise bills

-- AI cost logs table
CREATE TABLE IF NOT EXISTS ai_cost_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service VARCHAR(100) NOT NULL,
  cost_cents INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for monthly cost queries
CREATE INDEX IF NOT EXISTS idx_ai_cost_logs_created_at ON ai_cost_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_cost_logs_service ON ai_cost_logs(service);

-- Function to aggregate monthly costs (for cron job)
CREATE OR REPLACE FUNCTION aggregate_monthly_costs()
RETURNS TABLE (
  service VARCHAR,
  total_cost_cents BIGINT,
  request_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    service,
    SUM(cost_cents)::BIGINT AS total_cost_cents,
    COUNT(*)::BIGINT AS request_count
  FROM ai_cost_logs
  WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY service;
END;
$$;

-- Function to get cost status (used by monitoring)
CREATE OR REPLACE FUNCTION get_ai_cost_status()
RETURNS TABLE (
  current_month_spend INTEGER,
  percent_used NUMERIC,
  is_near_limit BOOLEAN,
  is_over_limit BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  total_spent INTEGER;
  soft_limit INTEGER := 10000; -- $100
BEGIN
  SELECT COALESCE(SUM(cost_cents), 0) INTO total_spent
  FROM ai_cost_logs
  WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);

  RETURN QUERY SELECT
    total_spent,
    (total_spent::NUMERIC / soft_limit * 100),
    total_spent > (soft_limit * 0.8),
    total_spent > soft_limit;
END;
$$;
