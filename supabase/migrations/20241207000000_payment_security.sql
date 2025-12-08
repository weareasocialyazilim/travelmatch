/**
 * Database Migration: Payment Security Tables
 * 
 * Creates tables for:
 * - Audit logging
 * - Cache invalidation tracking
 * - Webhook event deduplication
 * - Payment security metadata
 */

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- CACHE INVALIDATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cache_invalidation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT NOT NULL,
  invalidated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_cache_invalidation_key ON cache_invalidation(cache_key);
CREATE INDEX idx_cache_invalidation_timestamp ON cache_invalidation(invalidated_at DESC);

-- ============================================
-- PROCESSED WEBHOOK EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS processed_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_webhook_events_event_id ON processed_webhook_events(event_id);
CREATE INDEX idx_webhook_events_processed_at ON processed_webhook_events(processed_at DESC);

-- ============================================
-- EXTEND USERS TABLE FOR STRIPE
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- ============================================
-- EXTEND TRANSACTIONS TABLE
-- ============================================
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_moment_id ON transactions(moment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Add index for metadata queries (Stripe payment intent ID)
CREATE INDEX IF NOT EXISTS idx_transactions_metadata_payment_intent 
  ON transactions((metadata->>'stripe_payment_intent_id'));

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Function to increment moment gift count
CREATE OR REPLACE FUNCTION increment_moment_gift_count(moment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE moments
  SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{gift_count}',
    to_jsonb(COALESCE((metadata->>'gift_count')::int, 0) + 1)
  )
  WHERE id = moment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment user balance
CREATE OR REPLACE FUNCTION increment_user_balance(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET balance = COALESCE(balance, 0) + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement user balance
CREATE OR REPLACE FUNCTION decrement_user_balance(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET balance = COALESCE(balance, 0) - amount
  WHERE id = user_id;
  
  -- Prevent negative balance
  UPDATE users
  SET balance = 0
  WHERE id = user_id AND balance < 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY audit_logs_select_policy ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert audit logs
CREATE POLICY audit_logs_insert_policy ON audit_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Enable RLS on cache invalidation
ALTER TABLE cache_invalidation ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read cache invalidation records
CREATE POLICY cache_invalidation_select_policy ON cache_invalidation
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert cache invalidation records
CREATE POLICY cache_invalidation_insert_policy ON cache_invalidation
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Enable RLS on webhook events
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access webhook events
CREATE POLICY webhook_events_policy ON processed_webhook_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for transactions (for real-time payment updates)
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- ============================================
-- CLEANUP FUNCTION
-- ============================================

-- Function to cleanup old records (run periodically via cron or manually)
CREATE OR REPLACE FUNCTION cleanup_old_payment_records()
RETURNS void AS $$
BEGIN
  -- Delete cache invalidation records older than 7 days
  DELETE FROM cache_invalidation
  WHERE invalidated_at < NOW() - INTERVAL '7 days';
  
  -- Delete processed webhook events older than 30 days
  DELETE FROM processed_webhook_events
  WHERE processed_at < NOW() - INTERVAL '30 days';
  
  -- Delete audit logs older than 90 days (adjust based on compliance requirements)
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE audit_logs IS 'Security audit trail for payment operations';
COMMENT ON TABLE cache_invalidation IS 'Cache invalidation tracking for distributed cache';
COMMENT ON TABLE processed_webhook_events IS 'Webhook event deduplication to prevent double processing';
COMMENT ON FUNCTION increment_moment_gift_count IS 'Atomically increment gift count for a moment';
COMMENT ON FUNCTION increment_user_balance IS 'Atomically increment user wallet balance';
COMMENT ON FUNCTION decrement_user_balance IS 'Atomically decrement user wallet balance (prevents negative)';
COMMENT ON FUNCTION cleanup_old_payment_records IS 'Cleanup old audit and cache records';
