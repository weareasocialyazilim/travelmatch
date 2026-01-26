-- Migration: Immutable Moderation Logs + Confidence Drift Monitoring
-- Created: 2026-01-26
-- Purpose: Prevent moderation_logs updates, track confidence drift, admin override audit

-- Create admin_audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for admin audit queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_resource ON admin_audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);

-- Create moderation_stats table for confidence drift monitoring
CREATE TABLE IF NOT EXISTS moderation_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  avg_confidence NUMERIC,
  total_moderated INTEGER DEFAULT 0,
  auto_approved INTEGER DEFAULT 0,
  pending_review INTEGER DEFAULT 0,
  rejected INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  cost_estimate_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to calculate daily moderation stats
CREATE OR REPLACE FUNCTION calculate_daily_moderation_stats(target_date DATE)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO moderation_stats (date, avg_confidence, total_moderated, auto_approved, pending_review, rejected, error_count)
  SELECT
    target_date,
    COALESCE(AVG(ai_moderation_score), 0)::NUMERIC,
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE moderation_status = 'approved')::INTEGER,
    COUNT(*) FILTER (WHERE moderation_status = 'pending_review')::INTEGER,
    COUNT(*) FILTER (WHERE moderation_status = 'rejected')::INTEGER,
    COUNT(*) FILTER (WHERE moderation_status = 'error')::INTEGER
  FROM moments
  WHERE DATE(updated_at) = target_date
  ON CONFLICT (date) DO UPDATE SET
    avg_confidence = EXCLUDED.avg_confidence,
    total_moderated = EXCLUDED.total_moderated,
    auto_approved = EXCLUDED.auto_approved,
    pending_review = EXCLUDED.pending_review,
    rejected = EXCLUDED.rejected,
    error_count = EXCLUDED.error_count;
END;
$$;

-- Function to trigger confidence drift alert
CREATE OR REPLACE FUNCTION check_confidence_drift()
RETURNS TABLE (alert_type VARCHAR, message TEXT, severity VARCHAR)
LANGUAGE plpgsql
AS $$
DECLARE
  avg_7day NUMERIC;
  avg_today NUMERIC;
  drift_threshold NUMERIC := 15; -- 15% drift triggers alert
BEGIN
  -- Calculate 7-day average
  SELECT AVG(avg_confidence) INTO avg_7day
  FROM moderation_stats
  WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    AND date < CURRENT_DATE;

  -- Calculate today's average
  SELECT avg_confidence INTO avg_today
  FROM moderation_stats
  WHERE date = CURRENT_DATE;

  IF avg_7day IS NULL OR avg_today IS NULL THEN
    RETURN;
  END IF;

  -- Check for significant drift
  IF abs(avg_today - avg_7day) >= drift_threshold THEN
    RETURN QUERY VALUES (
      'confidence_drift',
      format('Moderation confidence drift detected: 7-day avg %s%%, today %s%%', avg_7day::INTEGER, avg_today::INTEGER),
      CASE WHEN avg_today < avg_7day THEN 'warning' ELSE 'info' END
    );
  END IF;
END;
$$;

-- Trigger function to prevent updates to moderation_logs (immutable)
CREATE OR REPLACE FUNCTION prevent_moderation_log_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'moderation_logs are immutable - updates not allowed. Create a new record instead.'
    USING HINT = 'Insert a new moderation_log entry with the corrected decision';
END;
$$;

-- Create trigger to enforce immutability
DROP TRIGGER IF EXISTS trg_prevent_moderation_log_update ON moderation_logs;
CREATE TRIGGER trg_prevent_moderation_log_update
  BEFORE UPDATE ON moderation_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_moderation_log_update();

-- Create trigger to prevent deletes (optional - can be relaxed if needed)
-- DROP TRIGGER IF EXISTS trg_prevent_moderation_log_delete ON moderation_logs;
-- CREATE TRIGGER trg_prevent_moderation_log_delete
--   BEFORE DELETE ON moderation_logs
--   FOR EACH ROW
--   EXECUTE FUNCTION prevent_moderation_log_update();

-- Function to add image_hash to moderation_logs metadata automatically
CREATE OR REPLACE FUNCTION set_moderation_log_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.metadata IS NULL THEN
    NEW.metadata := '{}'::jsonb;
  END IF;

  -- Add timestamp if not present
  IF NOT (NEW.metadata ? 'timestamp') THEN
    NEW.metadata := NEW.metadata || jsonb_build_object('timestamp', NOW()::TEXT);
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for metadata defaults
DROP TRIGGER IF EXISTS trg_set_moderation_log_metadata ON moderation_logs;
CREATE TRIGGER trg_set_moderation_log_metadata
  BEFORE INSERT ON moderation_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_moderation_log_metadata();

-- Run daily stats calculation for yesterday (catch up)
-- This will be automated via pg_cron in production
-- SELECT calculate_daily_moderation_stats(CURRENT_DATE - INTERVAL '1 day');
