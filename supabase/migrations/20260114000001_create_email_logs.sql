-- ============================================================================
-- Migration: Create email_logs table for email audit trail
-- Description: P0 FIX - Email logging for compliance, debugging, and analytics
-- Date: 2026-01-14
-- ============================================================================

-- Create email_logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Recipient information
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    recipient_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

    -- Email metadata
    template_id TEXT,
    template_name TEXT,
    subject TEXT,

    -- Provider information
    provider TEXT NOT NULL DEFAULT 'sendgrid' CHECK (provider IN ('sendgrid', 'mailgun', 'ses', 'mock')),
    provider_message_id TEXT,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
        'queued',      -- In job queue
        'sending',     -- Currently being sent
        'sent',        -- Successfully sent to provider
        'delivered',   -- Confirmed delivered
        'opened',      -- Email opened (pixel tracking)
        'clicked',     -- Link clicked
        'bounced',     -- Hard or soft bounce
        'complained',  -- Marked as spam
        'failed',      -- Failed to send
        'dropped'      -- Dropped by provider
    )),

    -- Event timestamps
    queued_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    first_clicked_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    complained_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,

    -- Error tracking
    error_code TEXT,
    error_message TEXT,
    bounce_type TEXT CHECK (bounce_type IN ('hard', 'soft', NULL)),
    bounce_reason TEXT,

    -- Analytics
    click_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email
    ON public.email_logs(recipient_email);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_user_id
    ON public.email_logs(recipient_user_id)
    WHERE recipient_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_logs_status
    ON public.email_logs(status);

CREATE INDEX IF NOT EXISTS idx_email_logs_provider_message_id
    ON public.email_logs(provider_message_id)
    WHERE provider_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_logs_template_id
    ON public.email_logs(template_id)
    WHERE template_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_logs_created_at
    ON public.email_logs(created_at DESC);

-- Composite index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_email_logs_status_created
    ON public.email_logs(status, created_at DESC);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access to email_logs" ON public.email_logs;
DROP POLICY IF EXISTS "Admin users can view email_logs" ON public.email_logs;

-- RLS Policies
-- Service role has full access (for workers)
CREATE POLICY "Service role full access to email_logs"
    ON public.email_logs
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Admin users can view email logs (via admin session, not direct JWT)
-- This is handled at the API level, not RLS

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_email_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_email_logs_updated_at ON public.email_logs;
CREATE TRIGGER trigger_email_logs_updated_at
    BEFORE UPDATE ON public.email_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_email_logs_updated_at();

-- Create function to log email events
CREATE OR REPLACE FUNCTION public.log_email_event(
    p_provider_message_id TEXT,
    p_event_type TEXT,
    p_event_data JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_email_id UUID;
BEGIN
    -- Find the email log by provider message ID
    SELECT id INTO v_email_id
    FROM public.email_logs
    WHERE provider_message_id = p_provider_message_id
    LIMIT 1;

    IF v_email_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Update based on event type
    CASE p_event_type
        WHEN 'delivered' THEN
            UPDATE public.email_logs
            SET status = 'delivered',
                delivered_at = NOW()
            WHERE id = v_email_id;

        WHEN 'open' THEN
            UPDATE public.email_logs
            SET status = CASE WHEN status NOT IN ('bounced', 'complained', 'failed') THEN 'opened' ELSE status END,
                opened_at = COALESCE(opened_at, NOW()),
                open_count = open_count + 1
            WHERE id = v_email_id;

        WHEN 'click' THEN
            UPDATE public.email_logs
            SET first_clicked_at = COALESCE(first_clicked_at, NOW()),
                click_count = click_count + 1
            WHERE id = v_email_id;

        WHEN 'bounce' THEN
            UPDATE public.email_logs
            SET status = 'bounced',
                bounced_at = NOW(),
                bounce_type = COALESCE(p_event_data->>'bounce_type', 'hard'),
                bounce_reason = p_event_data->>'reason'
            WHERE id = v_email_id;

        WHEN 'spamreport', 'complaint' THEN
            UPDATE public.email_logs
            SET status = 'complained',
                complained_at = NOW()
            WHERE id = v_email_id;

        WHEN 'dropped' THEN
            UPDATE public.email_logs
            SET status = 'dropped',
                failed_at = NOW(),
                error_message = p_event_data->>'reason'
            WHERE id = v_email_id;

        ELSE
            -- Unknown event, just log to metadata
            UPDATE public.email_logs
            SET metadata = metadata || jsonb_build_object(
                'events', COALESCE(metadata->'events', '[]'::jsonb) ||
                    jsonb_build_object('type', p_event_type, 'data', p_event_data, 'at', NOW())
            )
            WHERE id = v_email_id;
    END CASE;

    RETURN TRUE;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.log_email_event(TEXT, TEXT, JSONB) TO service_role;

-- Add comment
COMMENT ON TABLE public.email_logs IS 'Email audit trail for compliance, debugging, and analytics. P0 FIX.';
