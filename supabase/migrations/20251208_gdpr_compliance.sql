-- GDPR Compliance Migration
-- Implements: Data export, deletion, consent tracking, and audit logging

-- Add GDPR consent and tracking columns to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS gdpr_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS privacy_policy_version TEXT,
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS data_export_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deletion_scheduled_for TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS analytics_consent BOOLEAN DEFAULT TRUE;

-- Create data export requests table
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  export_data JSONB,
  download_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Create account deletion requests table
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  notes TEXT
);

-- Create consent history table for audit trail
CREATE TABLE IF NOT EXISTS consent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  consent_type TEXT NOT NULL, -- 'privacy_policy', 'terms_of_service', 'marketing', 'analytics'
  consented BOOLEAN NOT NULL,
  version TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_status 
  ON data_export_requests(user_id, status);

CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_user_status 
  ON account_deletion_requests(user_id, status);

CREATE INDEX IF NOT EXISTS idx_consent_history_user_type 
  ON consent_history(user_id, consent_type, created_at DESC);

-- Function to export user data (GDPR Article 20 - Right to data portability)
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_data JSONB;
BEGIN
  -- Verify user owns the data or is admin
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only export your own data';
  END IF;

  SELECT jsonb_build_object(
    'profile', (
      SELECT to_jsonb(p.*) 
      FROM profiles p 
      WHERE p.id = target_user_id
    ),
    'trips', (
      SELECT COALESCE(jsonb_agg(to_jsonb(t.*)), '[]'::jsonb)
      FROM trips t 
      WHERE t.user_id = target_user_id AND t.deleted_at IS NULL
    ),
    'messages', (
      SELECT COALESCE(jsonb_agg(to_jsonb(m.*)), '[]'::jsonb)
      FROM messages m 
      WHERE m.sender_id = target_user_id
    ),
    'conversations', (
      SELECT COALESCE(jsonb_agg(to_jsonb(c.*)), '[]'::jsonb)
      FROM conversations c 
      WHERE c.user1_id = target_user_id OR c.user2_id = target_user_id
    ),
    'reviews_given', (
      SELECT COALESCE(jsonb_agg(to_jsonb(r.*)), '[]'::jsonb)
      FROM reviews r 
      WHERE r.reviewer_id = target_user_id
    ),
    'reviews_received', (
      SELECT COALESCE(jsonb_agg(to_jsonb(r.*)), '[]'::jsonb)
      FROM reviews r 
      WHERE r.reviewee_id = target_user_id
    ),
    'payments', (
      SELECT COALESCE(jsonb_agg(to_jsonb(p.*)), '[]'::jsonb)
      FROM payments p 
      WHERE p.user_id = target_user_id
    ),
    'consent_history', (
      SELECT COALESCE(jsonb_agg(to_jsonb(ch.*)), '[]'::jsonb)
      FROM consent_history ch 
      WHERE ch.user_id = target_user_id
    ),
    'exported_at', NOW()
  ) INTO user_data;

  RETURN user_data;
END;
$$;

-- Function to anonymize user data (GDPR Article 17 - Right to erasure)
CREATE OR REPLACE FUNCTION anonymize_user_data(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user owns the data or is admin
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own data';
  END IF;

  -- Anonymize profile
  UPDATE profiles
  SET 
    username = 'deleted_' || id,
    full_name = 'Deleted User',
    email = 'deleted_' || id || '@deleted.com',
    avatar_url = NULL,
    bio = NULL,
    phone_number = NULL,
    date_of_birth = NULL,
    deleted_at = NOW()
  WHERE id = target_user_id;

  -- Soft delete trips
  UPDATE trips
  SET 
    title = 'Deleted',
    description = NULL,
    deleted_at = NOW()
  WHERE user_id = target_user_id;

  -- Anonymize messages (keep for conversation context)
  UPDATE messages
  SET 
    content = '[Message deleted]',
    deleted_at = NOW()
  WHERE sender_id = target_user_id;

  -- Soft delete reviews
  UPDATE reviews
  SET 
    comment = NULL,
    deleted_at = NOW()
  WHERE reviewer_id = target_user_id;

  RETURN TRUE;
END;
$$;

-- Function to schedule account deletion (30-day grace period)
CREATE OR REPLACE FUNCTION schedule_account_deletion(target_user_id UUID, deletion_reason TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id UUID;
BEGIN
  -- Verify user owns the account
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own account';
  END IF;

  -- Create deletion request
  INSERT INTO account_deletion_requests (user_id, reason, status)
  VALUES (target_user_id, deletion_reason, 'pending')
  RETURNING id INTO request_id;

  -- Schedule deletion for 30 days from now
  UPDATE profiles
  SET 
    deletion_requested_at = NOW(),
    deletion_scheduled_for = NOW() + INTERVAL '30 days'
  WHERE id = target_user_id;

  RETURN request_id;
END;
$$;

-- Function to cancel account deletion (within grace period)
CREATE OR REPLACE FUNCTION cancel_account_deletion(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user owns the account
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Cancel deletion request
  UPDATE account_deletion_requests
  SET 
    status = 'cancelled',
    cancelled_at = NOW()
  WHERE user_id = target_user_id AND status = 'pending';

  -- Remove deletion schedule
  UPDATE profiles
  SET 
    deletion_requested_at = NULL,
    deletion_scheduled_for = NULL
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$;

-- Function to record consent
CREATE OR REPLACE FUNCTION record_consent(
  target_user_id UUID,
  consent_type TEXT,
  consented BOOLEAN,
  version TEXT DEFAULT NULL,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  consent_id UUID;
BEGIN
  -- Insert consent record
  INSERT INTO consent_history (
    user_id,
    consent_type,
    consented,
    version,
    ip_address,
    user_agent
  )
  VALUES (
    target_user_id,
    consent_type,
    consented,
    version,
    ip_address,
    user_agent
  )
  RETURNING id INTO consent_id;

  -- Update profile consent fields
  CASE consent_type
    WHEN 'privacy_policy' THEN
      UPDATE profiles
      SET 
        gdpr_consent_at = CASE WHEN consented THEN NOW() ELSE NULL END,
        privacy_policy_version = version
      WHERE id = target_user_id;
    WHEN 'terms_of_service' THEN
      UPDATE profiles
      SET terms_accepted_at = CASE WHEN consented THEN NOW() ELSE NULL END
      WHERE id = target_user_id;
    WHEN 'marketing' THEN
      UPDATE profiles
      SET marketing_consent = consented
      WHERE id = target_user_id;
    WHEN 'analytics' THEN
      UPDATE profiles
      SET analytics_consent = consented
      WHERE id = target_user_id;
  END CASE;

  RETURN consent_id;
END;
$$;

-- RLS Policies
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own export requests
CREATE POLICY "Users can view their own export requests"
  ON data_export_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own export requests
CREATE POLICY "Users can create their own export requests"
  ON data_export_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only see their own deletion requests
CREATE POLICY "Users can view their own deletion requests"
  ON account_deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own deletion requests
CREATE POLICY "Users can create their own deletion requests"
  ON account_deletion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own consent history
CREATE POLICY "Users can view their own consent history"
  ON consent_history FOR SELECT
  USING (auth.uid() = user_id);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION export_user_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION anonymize_user_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION schedule_account_deletion(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_account_deletion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION record_consent(UUID, TEXT, BOOLEAN, TEXT, INET, TEXT) TO authenticated;

-- Comments
COMMENT ON TABLE data_export_requests IS 'GDPR Article 20: Right to data portability - User data export requests';
COMMENT ON TABLE account_deletion_requests IS 'GDPR Article 17: Right to erasure - Account deletion requests with 30-day grace period';
COMMENT ON TABLE consent_history IS 'GDPR Article 7: Conditions for consent - Audit trail of user consent decisions';
COMMENT ON FUNCTION export_user_data IS 'Exports all user data in JSON format for GDPR compliance';
COMMENT ON FUNCTION anonymize_user_data IS 'Anonymizes user data while preserving relational integrity';
COMMENT ON FUNCTION schedule_account_deletion IS 'Schedules account deletion with 30-day grace period';
