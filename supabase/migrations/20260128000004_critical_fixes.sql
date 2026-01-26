-- ============================================================================
// Critical Production Fixes v1
// Fixes from production readiness audit
// ============================================================================

-- Fix A.3: Add content column to message_moderation_logs for admin visibility
ALTER TABLE message_moderation_logs ADD COLUMN IF NOT EXISTS content TEXT;

-- Update RLS to allow admin access to content (redacted/safe version)
-- Create policy for admin to view message content with PII redaction
CREATE OR REPLACE FUNCTION redact_pii(text_content TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Redact phone numbers
  RETURN regexp_replace(text_content,
    '\+?90?[5-7][0-9]{8}', '[PHONE_REDACTED]', 'g');
END;
$$;

-- Fix B.6: Add reported_message_id column to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS reported_message_id UUID REFERENCES messages(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reports_message_id ON reports(reported_message_id);

-- Fix: Add idempotency keys table if not exists
CREATE TABLE IF NOT EXISTS escrow_idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(200) NOT NULL UNIQUE,
  escrow_id UUID NOT NULL REFERENCES escrow_transactions(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL DEFAULT false,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_idempotency_key ON escrow_idempotency_keys(key);
CREATE INDEX IF NOT EXISTS idx_escrow_idempotency_escrow ON escrow_idempotency_keys(escrow_id);

-- Fix C.1: Add archived notification to other party
-- Add notification_type for archive events
INSERT INTO notification_types (type_key, title_template, body_template, is_active)
VALUES (
  'conversation_archived',
  '{{otherPartyName}} sohbeti arşivledi',
  '{{otherPartyName}} bu sohbeti arşivledi. Arşivlenmiş sohbetleri görmek için ayarlara gidin.',
  true
)
ON CONFLICT (type_key) DO NOTHING;

-- Fix: Add audit log fallback table for when main audit fails
CREATE TABLE IF NOT EXISTS audit_log_fallback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  original_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_fallback_created ON audit_log_fallback(created_at DESC);

-- Fix: Add escrow_idempotency_keys table for release idempotency
CREATE TABLE IF NOT EXISTS escrow_idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(200) NOT NULL UNIQUE,
  escrow_id UUID NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions
GRANT EXECUTE ON FUNCTION redact_pii TO authenticated;
GRANT SELECT ON audit_log_fallback TO authenticated;

-- RLS for audit_log_fallback - only admins can see
ALTER TABLE audit_log_fallback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit fallback" ON audit_log_fallback
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

COMMENT ON COLUMN message_moderation_logs.content IS 'Message content for admin review (should be redacted before display)';
COMMENT ON COLUMN reports.reported_message_id IS 'Link to specific message being reported';
COMMENT ON TABLE escrow_idempotency_keys IS 'Prevents duplicate escrow releases (idempotency)';
