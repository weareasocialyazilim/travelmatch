-- ============================================================================
-- RATE LIMITING IMPLEMENTATION
-- Migration: 20251209000013_create_rate_limits
-- Description: Implements rate limiting for API abuse prevention
-- ============================================================================

-- =============================================================================
-- 1. CREATE RATE LIMITS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,           -- user_id or IP address
  endpoint TEXT NOT NULL,             -- API endpoint or action
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, endpoint, window_start)
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
ON rate_limits(identifier, endpoint, window_start DESC);

-- Auto-cleanup old entries
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup 
ON rate_limits(window_start);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 2. RATE LIMIT CONFIGURATION TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limit_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT UNIQUE NOT NULL,
  max_requests INTEGER NOT NULL DEFAULT 100,
  window_seconds INTEGER NOT NULL DEFAULT 60,
  penalty_seconds INTEGER DEFAULT 300,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default rate limits
INSERT INTO rate_limit_config (endpoint, max_requests, window_seconds) VALUES
  ('auth.login', 5, 60),              -- 5 logins per minute
  ('auth.register', 3, 3600),         -- 3 registrations per hour
  ('auth.password_reset', 3, 3600),   -- 3 password resets per hour
  ('api.general', 100, 60),           -- 100 API calls per minute
  ('api.search', 30, 60),             -- 30 searches per minute
  ('api.upload', 10, 60),             -- 10 uploads per minute
  ('messaging.send', 50, 60),         -- 50 messages per minute
  ('payment.transaction', 10, 60),    -- 10 transactions per minute
  ('report.abuse', 5, 3600)           -- 5 abuse reports per hour
ON CONFLICT (endpoint) DO NOTHING;

-- =============================================================================
-- 3. RATE LIMITING FUNCTIONS
-- =============================================================================

-- Check if request is rate limited
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT DEFAULT 'api.general'
)
RETURNS TABLE (
  allowed BOOLEAN,
  remaining INTEGER,
  reset_at TIMESTAMPTZ,
  retry_after INTEGER
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_config RECORD;
  v_window_start TIMESTAMPTZ;
  v_current_count INTEGER;
BEGIN
  -- Get rate limit config for endpoint
  SELECT * INTO v_config
  FROM rate_limit_config
  WHERE endpoint = p_endpoint AND is_active = true;
  
  -- If no config, use default
  IF NOT FOUND THEN
    SELECT * INTO v_config
    FROM rate_limit_config
    WHERE endpoint = 'api.general';
  END IF;
  
  -- Calculate current window start
  v_window_start := date_trunc('second', NOW()) 
    - ((EXTRACT(EPOCH FROM NOW())::INTEGER % v_config.window_seconds) || ' seconds')::INTERVAL;
  
  -- Get or create rate limit entry
  INSERT INTO rate_limits (identifier, endpoint, window_start, request_count)
  VALUES (p_identifier, p_endpoint, v_window_start, 1)
  ON CONFLICT (identifier, endpoint, window_start)
  DO UPDATE SET 
    request_count = rate_limits.request_count + 1,
    updated_at = NOW()
  RETURNING request_count INTO v_current_count;
  
  -- Return rate limit status
  allowed := v_current_count <= v_config.max_requests;
  remaining := GREATEST(0, v_config.max_requests - v_current_count);
  reset_at := v_window_start + (v_config.window_seconds || ' seconds')::INTERVAL;
  retry_after := CASE 
    WHEN v_current_count > v_config.max_requests 
    THEN EXTRACT(EPOCH FROM (reset_at - NOW()))::INTEGER
    ELSE 0 
  END;
  
  RETURN NEXT;
END;
$$;

-- Record rate limit violation for monitoring
CREATE OR REPLACE FUNCTION public.record_rate_limit_violation(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO audit_logs (
    id,
    timestamp,
    user_id,
    event,
    category,
    resource,
    action,
    result,
    ip_address,
    metadata
  ) VALUES (
    gen_random_uuid(),
    NOW(),
    CASE WHEN p_identifier ~ '^[0-9a-f-]{36}$' THEN p_identifier::UUID ELSE NULL END,
    'rate_limit_exceeded',
    'security',
    p_endpoint,
    'block',
    'blocked',
    COALESCE(p_ip_address, 'unknown'),
    jsonb_build_object(
      'identifier', p_identifier,
      'endpoint', p_endpoint
    )
  );
END;
$$;

-- =============================================================================
-- 4. CLEANUP JOB
-- =============================================================================

-- Function to clean old rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  -- Delete entries older than 1 hour
  DELETE FROM rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- =============================================================================
-- 5. RLS POLICIES
-- =============================================================================

-- Rate limits: Only service role can access
CREATE POLICY "rate_limits_service_only"
ON rate_limits
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Rate limit config: Read for authenticated, write for service role
CREATE POLICY "rate_limit_config_read"
ON rate_limit_config
FOR SELECT
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "rate_limit_config_write"
ON rate_limit_config
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Enable RLS on config table
ALTER TABLE rate_limit_config ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- SUMMARY
-- =============================================================================
-- Rate limit endpoints configured:
-- - auth.login: 5/min
-- - auth.register: 3/hour
-- - auth.password_reset: 3/hour
-- - api.general: 100/min
-- - api.search: 30/min
-- - api.upload: 10/min
-- - messaging.send: 50/min
-- - payment.transaction: 10/min
-- - report.abuse: 5/hour
-- ============================================================================
