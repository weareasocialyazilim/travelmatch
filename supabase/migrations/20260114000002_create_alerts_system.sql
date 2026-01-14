-- ============================================================================
-- Migration: Create alerts system tables
-- Description: P1 FIX - Replace mock data with real alerts system
-- Date: 2026-01-14
-- ============================================================================

-- ============================================================================
-- Alert Rules Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.alert_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,

    -- Categorization
    category TEXT NOT NULL CHECK (category IN ('security', 'payments', 'operations', 'engineering')),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),

    -- Rule configuration
    condition TEXT NOT NULL,           -- Human-readable condition description
    metric_name TEXT NOT NULL,         -- e.g., 'fraud_count', 'error_rate', 'queue_size'
    metric_query TEXT,                 -- SQL or RPC query to get current value
    threshold NUMERIC NOT NULL,
    threshold_operator TEXT NOT NULL DEFAULT '>' CHECK (threshold_operator IN ('>', '<', '>=', '<=', '=', '!=')),
    window_minutes INTEGER DEFAULT 60, -- Time window for aggregation
    cooldown_minutes INTEGER DEFAULT 15, -- Minimum time between alerts

    -- Notification settings
    notify_channels TEXT[] DEFAULT ARRAY['dashboard'], -- 'dashboard', 'email', 'slack', 'sms'
    notify_roles TEXT[] DEFAULT ARRAY['super_admin'],  -- Roles to notify

    -- State
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    last_checked_at TIMESTAMPTZ,

    -- Metadata
    created_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Active Alerts Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.active_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id TEXT NOT NULL REFERENCES public.alert_rules(id) ON DELETE CASCADE,

    -- Alert details
    title TEXT NOT NULL,
    description TEXT,

    -- Current state
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),

    -- Metric values at trigger time
    current_value NUMERIC NOT NULL,
    threshold_value NUMERIC NOT NULL,
    metric_unit TEXT DEFAULT '',

    -- Lifecycle
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    acknowledged_by_name TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    resolved_by_name TEXT,
    resolution_notes TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Alert History Table (for resolved alerts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id TEXT REFERENCES public.alert_rules(id) ON DELETE SET NULL,
    original_alert_id UUID,

    -- Alert details
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,

    -- Metric values
    current_value NUMERIC,
    threshold_value NUMERIC,
    metric_unit TEXT DEFAULT '',

    -- Lifecycle timestamps
    triggered_at TIMESTAMPTZ NOT NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Duration
    duration_seconds INTEGER,

    -- Resolution
    resolved_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    resolved_by_name TEXT,
    resolution_notes TEXT,
    resolution_type TEXT CHECK (resolution_type IN ('manual', 'auto_recovery', 'escalated', 'false_positive')),

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_alert_rules_category ON public.alert_rules(category);
CREATE INDEX IF NOT EXISTS idx_alert_rules_severity ON public.alert_rules(severity);
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON public.alert_rules(enabled);

CREATE INDEX IF NOT EXISTS idx_active_alerts_rule_id ON public.active_alerts(rule_id);
CREATE INDEX IF NOT EXISTS idx_active_alerts_status ON public.active_alerts(status);
CREATE INDEX IF NOT EXISTS idx_active_alerts_triggered_at ON public.active_alerts(triggered_at DESC);

CREATE INDEX IF NOT EXISTS idx_alert_history_rule_id ON public.alert_history(rule_id) WHERE rule_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_alert_history_resolved_at ON public.alert_history(resolved_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_history_severity ON public.alert_history(severity);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access to alert_rules"
    ON public.alert_rules FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to active_alerts"
    ON public.active_alerts FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to alert_history"
    ON public.alert_history FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- Triggers
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_alert_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_alert_rules_updated_at ON public.alert_rules;
CREATE TRIGGER trigger_alert_rules_updated_at
    BEFORE UPDATE ON public.alert_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_alert_rules_updated_at();

CREATE OR REPLACE FUNCTION public.update_active_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_active_alerts_updated_at ON public.active_alerts;
CREATE TRIGGER trigger_active_alerts_updated_at
    BEFORE UPDATE ON public.active_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_active_alerts_updated_at();

-- ============================================================================
-- Function to move resolved alert to history
-- ============================================================================
CREATE OR REPLACE FUNCTION public.archive_resolved_alert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        -- Insert into history
        INSERT INTO public.alert_history (
            rule_id, original_alert_id, title, description,
            category, severity, current_value, threshold_value, metric_unit,
            triggered_at, acknowledged_at, resolved_at,
            duration_seconds, resolved_by, resolved_by_name, resolution_notes,
            resolution_type, metadata
        )
        SELECT
            NEW.rule_id, NEW.id, NEW.title, NEW.description,
            ar.category, ar.severity, NEW.current_value, NEW.threshold_value, NEW.metric_unit,
            NEW.triggered_at, NEW.acknowledged_at, NOW(),
            EXTRACT(EPOCH FROM (NOW() - NEW.triggered_at))::INTEGER,
            NEW.resolved_by, NEW.resolved_by_name, NEW.resolution_notes,
            'manual', NEW.metadata
        FROM public.alert_rules ar
        WHERE ar.id = NEW.rule_id;

        -- Delete from active alerts
        DELETE FROM public.active_alerts WHERE id = NEW.id;

        -- Return NULL to prevent the update (row is deleted)
        RETURN NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_archive_resolved_alert ON public.active_alerts;
CREATE TRIGGER trigger_archive_resolved_alert
    AFTER UPDATE ON public.active_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.archive_resolved_alert();

-- ============================================================================
-- Seed Default Alert Rules
-- ============================================================================
INSERT INTO public.alert_rules (id, name, category, condition, metric_name, threshold, severity, enabled)
VALUES
    ('fraud-spike', 'Fraud Spike Detection', 'security',
     'fraud_count > 10 in 1 hour', 'fraud_count', 10, 'critical', true),

    ('payment-failure', 'Payment Gateway Error Rate', 'payments',
     'error_rate > 5%', 'payment_error_rate', 5, 'critical', true),

    ('escrow-expiring', 'Escrow Expiring Soon', 'operations',
     'expiring_escrows > 0 in 2 hours', 'expiring_escrow_count', 0, 'high', true),

    ('proof-queue', 'Proof Queue Backlog', 'operations',
     'pending_proofs > 100', 'proof_queue_size', 100, 'medium', true),

    ('system-latency', 'High API Latency', 'engineering',
     'p95_latency > 500ms', 'api_p95_latency', 500, 'high', true),

    ('user-spike', 'Unusual User Activity', 'security',
     'registrations > 500 in 1 hour', 'hourly_registrations', 500, 'medium', true),

    ('low-balance', 'Low Platform Balance', 'payments',
     'platform_balance < 10000 TL', 'platform_balance', 10000, 'high', true),

    ('db-connections', 'Database Connection Pool', 'engineering',
     'active_connections > 80%', 'db_connection_usage', 80, 'high', true)

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    condition = EXCLUDED.condition,
    metric_name = EXCLUDED.metric_name,
    threshold = EXCLUDED.threshold,
    severity = EXCLUDED.severity,
    updated_at = NOW();

-- Add comments
COMMENT ON TABLE public.alert_rules IS 'Alert rule definitions for monitoring system health and business metrics';
COMMENT ON TABLE public.active_alerts IS 'Currently active/unresolved alerts';
COMMENT ON TABLE public.alert_history IS 'Historical record of resolved alerts';
