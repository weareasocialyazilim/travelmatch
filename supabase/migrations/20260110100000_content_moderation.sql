-- =============================================================================
-- Content Moderation Schema
--
-- Tables for logging content moderation events and blocked content.
-- =============================================================================

-- Moderation Logs - Track all moderation decisions
CREATE TABLE IF NOT EXISTS moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('message', 'comment', 'moment_title', 'moment_description', 'profile_bio', 'review')),
    content_hash TEXT NOT NULL, -- SHA-256 hash of content (for privacy)
    severity TEXT NOT NULL CHECK (severity IN ('none', 'low', 'medium', 'high', 'critical')),
    violations JSONB DEFAULT '[]',
    action_taken TEXT NOT NULL CHECK (action_taken IN ('allowed', 'blocked', 'flagged', 'sanitized')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for moderation queries
CREATE INDEX IF NOT EXISTS idx_moderation_logs_user_id ON moderation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_severity ON moderation_logs(severity);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created_at ON moderation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_action ON moderation_logs(action_taken);

-- Blocked Content (for appeal/review)
CREATE TABLE IF NOT EXISTS blocked_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL,
    original_content_encrypted BYTEA, -- Encrypted for privacy/legal
    violation_reasons TEXT[] NOT NULL,
    appeal_status TEXT DEFAULT 'none' CHECK (appeal_status IN ('none', 'pending', 'approved', 'rejected')),
    appeal_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blocked_content_user_id ON blocked_content(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_content_appeal_status ON blocked_content(appeal_status);

-- User Warnings - Track warnings before suspension
CREATE TABLE IF NOT EXISTS user_moderation_warnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    warning_type TEXT NOT NULL CHECK (warning_type IN ('bad_language', 'phone_sharing', 'pii_sharing', 'spam', 'harassment', 'other')),
    warning_level INTEGER NOT NULL DEFAULT 1 CHECK (warning_level BETWEEN 1 AND 3),
    details TEXT,
    expires_at TIMESTAMPTZ, -- Warnings can expire
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_warnings_user_id ON user_moderation_warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_warnings_expires ON user_moderation_warnings(expires_at);

-- Bad Words Custom Dictionary (admin-managed)
CREATE TABLE IF NOT EXISTS moderation_dictionary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word TEXT NOT NULL UNIQUE,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category TEXT NOT NULL CHECK (category IN ('profanity', 'hate_speech', 'violence', 'spam', 'pii_pattern', 'other')),
    is_regex BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for dictionary lookups
CREATE INDEX IF NOT EXISTS idx_moderation_dictionary_active ON moderation_dictionary(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_moderation_dictionary_category ON moderation_dictionary(category);

-- =============================================================================
-- Enable Row Level Security
-- =============================================================================

ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_moderation_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_dictionary ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS Policies
-- =============================================================================

-- Moderation Logs: Service role and admins only
CREATE POLICY "moderation_logs_service_insert" ON moderation_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "moderation_logs_admin_select" ON moderation_logs
    FOR SELECT USING (
        auth.role() = 'service_role' OR
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = TRUE)
    );

-- Blocked Content: Users can see their own, admins can see all
CREATE POLICY "blocked_content_user_select" ON blocked_content
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "blocked_content_admin_all" ON blocked_content
    FOR ALL USING (
        auth.role() = 'service_role' OR
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = TRUE)
    );

CREATE POLICY "blocked_content_service_insert" ON blocked_content
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- User Warnings: Users can see their own, admins can manage all
CREATE POLICY "user_warnings_user_select" ON user_moderation_warnings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_warnings_user_acknowledge" ON user_moderation_warnings
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_warnings_admin_all" ON user_moderation_warnings
    FOR ALL USING (
        auth.role() = 'service_role' OR
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = TRUE)
    );

-- Moderation Dictionary: Admins only
CREATE POLICY "moderation_dictionary_admin_all" ON moderation_dictionary
    FOR ALL USING (
        auth.role() = 'service_role' OR
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = TRUE)
    );

-- =============================================================================
-- Functions
-- =============================================================================

-- Function to check user warning count and auto-suspend if needed
CREATE OR REPLACE FUNCTION check_user_warnings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_warning_count INTEGER;
BEGIN
    -- Count active warnings for user
    SELECT COUNT(*) INTO v_warning_count
    FROM user_moderation_warnings
    WHERE user_id = NEW.user_id
    AND (expires_at IS NULL OR expires_at > NOW());

    -- Auto-suspend after 3 warnings
    IF v_warning_count >= 3 THEN
        UPDATE profiles
        SET
            is_suspended = TRUE,
            suspended_reason = 'Çoklu içerik ihlali nedeniyle otomatik askıya alındı',
            suspended_at = NOW()
        WHERE id = NEW.user_id;

        -- Log the suspension
        INSERT INTO moderation_logs (user_id, content_type, content_hash, severity, violations, action_taken, metadata)
        VALUES (
            NEW.user_id,
            'profile_bio',
            'auto_suspension',
            'critical',
            jsonb_build_array(jsonb_build_object('type', 'auto_suspension', 'message', 'User suspended after 3 warnings')),
            'blocked',
            jsonb_build_object('warning_count', v_warning_count)
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS check_warnings_trigger ON user_moderation_warnings;
CREATE TRIGGER check_warnings_trigger
    AFTER INSERT ON user_moderation_warnings
    FOR EACH ROW
    EXECUTE FUNCTION check_user_warnings();

-- Function to get user moderation status
CREATE OR REPLACE FUNCTION get_user_moderation_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_warning_count INTEGER;
    v_blocked_count INTEGER;
    v_last_warning TIMESTAMPTZ;
BEGIN
    SELECT COUNT(*), MAX(created_at) INTO v_warning_count, v_last_warning
    FROM user_moderation_warnings
    WHERE user_id = p_user_id
    AND (expires_at IS NULL OR expires_at > NOW());

    SELECT COUNT(*) INTO v_blocked_count
    FROM blocked_content
    WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '30 days';

    RETURN jsonb_build_object(
        'warning_count', v_warning_count,
        'blocked_content_count', v_blocked_count,
        'last_warning', v_last_warning,
        'can_be_suspended', v_warning_count >= 2,
        'is_at_risk', v_warning_count >= 1 OR v_blocked_count >= 3
    );
END;
$$;

-- Grant execute to authenticated users (they can only see their own status)
GRANT EXECUTE ON FUNCTION get_user_moderation_status TO authenticated;

-- Function to cleanup old moderation logs (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_moderation_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM moderation_logs
    WHERE created_at < NOW() - INTERVAL '90 days';

    -- Cleanup expired warnings
    DELETE FROM user_moderation_warnings
    WHERE expires_at < NOW();
END;
$$;

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE moderation_logs IS 'Tracks all content moderation decisions';
COMMENT ON TABLE blocked_content IS 'Stores blocked content for appeal/review';
COMMENT ON TABLE user_moderation_warnings IS 'Warning system before user suspension';
COMMENT ON TABLE moderation_dictionary IS 'Admin-managed bad words dictionary';
