-- GDPR/KVKK Data Request Management Table
-- Supports data access, rectification, deletion, portability, and objection requests

CREATE TABLE IF NOT EXISTS gdpr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL CHECK (
    request_type IN (
      'data_access',
      'data_rectification',
      'data_deletion',
      'data_portability',
      'objection'
    )
  ),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_review', 'completed', 'rejected')
  ),
  justification TEXT,
  data_categories TEXT[] DEFAULT ARRAY['all'],
  requested_by UUID REFERENCES admin_users(id),
  reference_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  resolution_notes TEXT,
  completed_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_by UUID REFERENCES admin_users(id),

  CONSTRAINT valid_user CHECK (user_id IS NOT NULL)
);

-- Indexes for GDPR requests
CREATE INDEX idx_gdpr_requests_user_id ON gdpr_requests(user_id);
CREATE INDEX idx_gdpr_requests_status ON gdpr_requests(status);
CREATE INDEX idx_gdpr_requests_type ON gdpr_requests(request_type);
CREATE INDEX idx_gdpr_requests_created_at ON gdpr_requests(created_at DESC);

-- RLS Policies for GDPR requests
ALTER TABLE gdpr_requests ENABLE ROW LEVEL SECURITY;

-- Admins can view all GDPR requests
CREATE POLICY "Admins can view GDPR requests"
  ON gdpr_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM role_permissions
      WHERE role_permissions.role = (
        SELECT role FROM admin_users WHERE admin_users.id = auth.uid()
      )
      AND role_permissions.resource = 'compliance'
      AND role_permissions.action = 'view'
    )
  );

-- Admins with compliance.create can create requests
CREATE POLICY "Compliance admins can create GDPR requests"
  ON gdpr_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM role_permissions
      WHERE role_permissions.role = (
        SELECT role FROM admin_users WHERE admin_users.id = auth.uid()
      )
      AND role_permissions.resource = 'compliance'
      AND role_permissions.action = 'create'
    )
  );

-- Admins with compliance.update can update requests
CREATE POLICY "Compliance admins can update GDPR requests"
  ON gdpr_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM role_permissions
      WHERE role_permissions.role = (
        SELECT role FROM admin_users WHERE admin_users.id = auth.uid()
      )
      AND role_permissions.resource = 'compliance'
      AND role_permissions.action = 'update'
    )
  );

-- Add ip_address column to admin_sessions for session security
ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

-- Add activity tracking columns
ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Index for session cleanup
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions(token_hash);

-- Update last_activity_at on session activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for session activity tracking
DROP TRIGGER IF EXISTS trigger_update_session_activity ON admin_sessions;
CREATE TRIGGER trigger_update_session_activity
  BEFORE UPDATE ON admin_sessions
  FOR EACH ROW
  WHEN (OLD.token_hash IS DISTINCT FROM NEW.token_hash)
  EXECUTE FUNCTION update_session_activity();

-- Grant execute to anon for API access
GRANT EXECUTE ON FUNCTION update_session_activity() TO postgres, anon;
