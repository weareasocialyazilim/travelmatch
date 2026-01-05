-- Migration: Add GDPR consent columns to users table
-- These columns track user consent for GDPR compliance

-- Add GDPR/consent columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS gdpr_consent_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS analytics_consent BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_policy_version VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

-- Add index for GDPR consent status queries
CREATE INDEX IF NOT EXISTS idx_users_gdpr_consent ON users(gdpr_consent_at) WHERE gdpr_consent_at IS NOT NULL;

-- Add RPC function for recording consent
CREATE OR REPLACE FUNCTION record_consent(
    target_user_id UUID,
    consent_type VARCHAR(100),
    consented BOOLEAN,
    version VARCHAR(50) DEFAULT '1.0'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Record in consent_history
    INSERT INTO consent_history (user_id, consent_type, consent_given, consent_version)
    VALUES (target_user_id, consent_type, consented, version);
    
    -- Update users table based on consent type
    IF consent_type = 'marketing' THEN
        UPDATE users SET marketing_consent = consented, updated_at = now() WHERE id = target_user_id;
    ELSIF consent_type = 'analytics' THEN
        UPDATE users SET analytics_consent = consented, updated_at = now() WHERE id = target_user_id;
    ELSIF consent_type = 'gdpr' THEN
        UPDATE users SET 
            gdpr_consent_at = CASE WHEN consented THEN now() ELSE NULL END,
            privacy_policy_version = version,
            updated_at = now()
        WHERE id = target_user_id;
    ELSIF consent_type = 'terms' THEN
        UPDATE users SET 
            terms_accepted_at = CASE WHEN consented THEN now() ELSE NULL END,
            updated_at = now()
        WHERE id = target_user_id;
    END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION record_consent TO authenticated;
