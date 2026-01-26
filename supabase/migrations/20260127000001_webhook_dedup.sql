-- ============================================================================
// Webhook Deduplication Table
// Prevents double-processing of PayTR webhooks
// ============================================================================

CREATE TABLE IF NOT EXISTS processed_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_oid VARCHAR(100) NOT NULL,
  event_type VARCHAR(50) NOT NULL DEFAULT 'payment',
  status VARCHAR(20) NOT NULL,
  amount_kurus BIGINT,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(merchant_oid, event_type)
);

CREATE INDEX idx_processed_webhook_oid ON processed_webhook_events(merchant_oid);
CREATE INDEX idx_processed_webhook_processed ON processed_webhook_events(processed_at DESC);

-- TTL cleanup: remove processed events older than 30 days
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM processed_webhook_events
  WHERE processed_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- RLS: Only service role can modify
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage webhook events" ON processed_webhook_events
  FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE processed_webhook_events IS 'Stores processed webhook events for deduplication. Prevents double-processing.';
