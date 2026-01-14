-- Stabilization Migration: Triage Items & Integration Health Events
-- Migration: 20260114000000_add_triage_and_integration_health
--
-- SAFE MODE:
-- - ADD-ONLY: Yeni tablolar, mevcut tablolara dokunmuyor
-- - Nullable alanlar ve default degerler
-- - Mevcut akislari etkilemez
--

-- =====================================================
-- TRIAGE ITEMS TABLE (PASSIVE MODE)
-- =====================================================
-- Bu tablo admin panelde triage queue icin kullanilir
-- Varsayilan olarak sadece goruntulemek icindir
-- Aksiyonlar feature flag arkasinda

CREATE TABLE IF NOT EXISTS triage_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Triage item type
  item_type TEXT NOT NULL DEFAULT 'general',
  -- Possible values: 'proof_review', 'user_report', 'content_flag', 'fraud_alert', 'kyc_review', 'payment_dispute', 'general'

  -- Source reference (polymorphic)
  source_type TEXT, -- 'user', 'moment', 'transaction', 'message', etc.
  source_id TEXT,

  -- Triage metadata
  title TEXT NOT NULL DEFAULT 'Yeni Triage Ogesi',
  description TEXT,

  -- Priority and status
  priority TEXT NOT NULL DEFAULT 'medium',
  -- Possible values: 'critical', 'high', 'medium', 'low'

  status TEXT NOT NULL DEFAULT 'pending',
  -- Possible values: 'pending', 'in_review', 'escalated', 'resolved', 'dismissed'

  -- AI Risk scoring (optional)
  ai_risk_score DECIMAL(5,4), -- 0.0000 to 1.0000
  ai_risk_factors JSONB DEFAULT '[]',
  ai_analyzed_at TIMESTAMPTZ,

  -- Assignment
  assigned_to UUID REFERENCES admin_users(id),
  assigned_at TIMESTAMPTZ,

  -- Resolution
  resolution_type TEXT, -- 'approved', 'rejected', 'escalated', 'no_action'
  resolution_notes TEXT,
  resolved_by UUID REFERENCES admin_users(id),
  resolved_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Metadata for flexibility
  metadata JSONB DEFAULT '{}'
);

-- Indexes for triage queries
CREATE INDEX IF NOT EXISTS idx_triage_items_status ON triage_items(status);
CREATE INDEX IF NOT EXISTS idx_triage_items_priority ON triage_items(priority);
CREATE INDEX IF NOT EXISTS idx_triage_items_type ON triage_items(item_type);
CREATE INDEX IF NOT EXISTS idx_triage_items_assigned ON triage_items(assigned_to);
CREATE INDEX IF NOT EXISTS idx_triage_items_source ON triage_items(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_triage_items_queue ON triage_items(status, priority DESC, created_at ASC)
  WHERE status IN ('pending', 'in_review');
CREATE INDEX IF NOT EXISTS idx_triage_items_risk ON triage_items(ai_risk_score DESC NULLS LAST)
  WHERE ai_risk_score IS NOT NULL;

-- =====================================================
-- INTEGRATION HEALTH EVENTS TABLE (LOG-BASED)
-- =====================================================
-- Bu tablo entegrasyon sagligini log-based takip eder
-- Gercek ping YAPMAZ, sadece event loglar
-- Her entegrasyon kullanildiginda SUCCESS/FAIL loglanir

CREATE TABLE IF NOT EXISTS integration_health_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Integration identifier
  integration_name TEXT NOT NULL,
  -- Possible values: 'supabase', 'stripe', 'twilio', 'sendgrid', 'posthog', 'sentry', 'openai', 'mapbox', etc.

  -- Event type
  event_type TEXT NOT NULL DEFAULT 'health_check',
  -- Possible values: 'health_check', 'api_call', 'webhook', 'connection', 'authentication'

  -- Status
  status TEXT NOT NULL,
  -- Possible values: 'success', 'failure', 'timeout', 'degraded'

  -- Response metrics
  response_time_ms INTEGER,
  status_code INTEGER,

  -- Error details (if failure)
  error_code TEXT,
  error_message TEXT,

  -- Context
  endpoint TEXT, -- API endpoint called
  method TEXT, -- HTTP method

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Additional metadata
  metadata JSONB DEFAULT '{}'
);

-- Indexes for health event queries
CREATE INDEX IF NOT EXISTS idx_health_events_integration ON integration_health_events(integration_name);
CREATE INDEX IF NOT EXISTS idx_health_events_status ON integration_health_events(status);
CREATE INDEX IF NOT EXISTS idx_health_events_created ON integration_health_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_events_recent ON integration_health_events(integration_name, created_at DESC);

-- Composite index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_health_events_dashboard ON integration_health_events(integration_name, status, created_at DESC);

-- =====================================================
-- INTERNAL ERROR LOG TABLE (for ops-dashboard)
-- =====================================================
-- Internal error logging - Sentry'ye alternatif internal log
-- Stabilite dashboard'u icin

CREATE TABLE IF NOT EXISTS internal_error_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Error identification
  error_type TEXT NOT NULL,
  -- Possible values: 'api_error', 'db_error', 'auth_error', 'payment_error', 'integration_error', 'validation_error'

  error_code TEXT,
  error_message TEXT NOT NULL,

  -- Source information
  service TEXT, -- 'admin', 'mobile', 'web', 'api', 'worker'
  endpoint TEXT,

  -- Severity
  severity TEXT NOT NULL DEFAULT 'error',
  -- Possible values: 'debug', 'info', 'warning', 'error', 'critical'

  -- Context
  user_id UUID, -- Optional: affected user
  admin_id UUID REFERENCES admin_users(id), -- Optional: admin who triggered

  -- Stack trace (truncated for storage)
  stack_trace TEXT,

  -- Request context (sanitized, no sensitive data)
  request_context JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Occurrence tracking
  occurrence_count INTEGER DEFAULT 1,
  first_occurred_at TIMESTAMPTZ DEFAULT now(),
  last_occurred_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for error log queries
CREATE INDEX IF NOT EXISTS idx_error_log_type ON internal_error_log(error_type);
CREATE INDEX IF NOT EXISTS idx_error_log_severity ON internal_error_log(severity);
CREATE INDEX IF NOT EXISTS idx_error_log_service ON internal_error_log(service);
CREATE INDEX IF NOT EXISTS idx_error_log_created ON internal_error_log(created_at DESC);

-- Index for 24h error count queries
CREATE INDEX IF NOT EXISTS idx_error_log_recent ON internal_error_log(created_at DESC)
  WHERE created_at > now() - interval '24 hours';

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE triage_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_error_log ENABLE ROW LEVEL SECURITY;

-- Triage items: admins can view based on role
CREATE POLICY "Admins can view triage items"
  ON triage_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

-- Triage items: only managers and super_admins can update (feature flag controlled in app)
CREATE POLICY "Managers can update triage items"
  ON triage_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
      AND au.role IN ('super_admin', 'manager', 'moderator')
    )
  );

-- Health events: all admins can view
CREATE POLICY "Admins can view health events"
  ON integration_health_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

-- Health events: system can insert (service role)
CREATE POLICY "System can insert health events"
  ON integration_health_events FOR INSERT
  WITH CHECK (true);

-- Error log: managers can view
CREATE POLICY "Managers can view error logs"
  ON internal_error_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
      AND au.role IN ('super_admin', 'manager')
    )
  );

-- Error log: system can insert
CREATE POLICY "System can insert error logs"
  ON internal_error_log FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at trigger for triage_items
CREATE TRIGGER triage_items_updated_at
  BEFORE UPDATE ON triage_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE triage_items IS 'Triage queue for admin review - passive mode by default, actions behind feature flags';
COMMENT ON TABLE integration_health_events IS 'Log-based integration health tracking - no real pings, logs events when integrations are used';
COMMENT ON TABLE internal_error_log IS 'Internal error logging for ops-dashboard - alternative to external services';

COMMENT ON COLUMN triage_items.ai_risk_score IS 'AI-calculated risk score between 0 and 1, nullable';
COMMENT ON COLUMN triage_items.status IS 'Current status - actions are feature-flag controlled';
COMMENT ON COLUMN integration_health_events.status IS 'Event status - logged when integration is actually used';
