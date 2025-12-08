-- Create rate_limits table for API rate limiting
-- This table stores rate limit counters per client (IP or user ID)

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE, -- Format: "ratelimit:user:UUID" or "ratelimit:ip:x.x.x.x"
  count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_rate_limits_key ON rate_limits(key);
CREATE INDEX idx_rate_limits_expires_at ON rate_limits(expires_at);

-- Auto-delete expired records (cleanup job)
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension)
-- Run every hour to remove expired rate limit records
-- SELECT cron.schedule('cleanup-rate-limits', '0 * * * *', 'SELECT cleanup_expired_rate_limits()');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_rate_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rate_limits_updated_at
  BEFORE UPDATE ON rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_rate_limits_updated_at();

-- Grant permissions to service role
GRANT ALL ON rate_limits TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Comment for documentation
COMMENT ON TABLE rate_limits IS 'Stores rate limiting data for API endpoints';
COMMENT ON COLUMN rate_limits.key IS 'Unique identifier for rate limit (user ID or IP address)';
COMMENT ON COLUMN rate_limits.count IS 'Number of requests in current window';
COMMENT ON COLUMN rate_limits.window_start IS 'Start time of current rate limit window';
COMMENT ON COLUMN rate_limits.expires_at IS 'When the current rate limit window expires';
