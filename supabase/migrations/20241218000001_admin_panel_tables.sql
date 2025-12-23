-- Admin Panel Database Schema
-- Migration: 20241218000001_admin_panel_tables

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Admin roles
CREATE TYPE admin_role AS ENUM (
  'super_admin',
  'manager',
  'moderator',
  'finance',
  'marketing',
  'support',
  'viewer'
);

-- Task priority
CREATE TYPE task_priority AS ENUM (
  'urgent',
  'high',
  'medium',
  'low'
);

-- Task status
CREATE TYPE task_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled'
);

-- =====================================================
-- ADMIN USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role admin_role NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  requires_2fa BOOLEAN DEFAULT true,
  totp_secret TEXT, -- Encrypted TOTP secret
  totp_enabled BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- =====================================================
-- ADMIN SESSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for session lookups
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Note: Partial index with now() removed as now() is not IMMUTABLE
-- Expired session cleanup handled via scheduled job instead

-- =====================================================
-- ROLE PERMISSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role admin_role NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, resource, action)
);

-- Index for permission lookups
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);

-- =====================================================
-- ADMIN AUDIT LOGS TABLE (Şirket içi - Admin Panel)
-- NOT: Kullanıcı audit_logs tablosu ayrı (20241207000000_payment_security.sql)
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for admin audit log queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_resource ON admin_audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);

-- Partition by month for better performance (optional, uncomment if needed)
-- CREATE INDEX idx_audit_logs_created_month ON audit_logs(date_trunc('month', created_at));

-- =====================================================
-- TASKS TABLE (Task Queue)
-- =====================================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  assigned_to UUID REFERENCES admin_users(id),
  assigned_roles admin_role[] DEFAULT '{}',
  due_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES admin_users(id)
);

-- Indexes for task queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_resource ON tasks(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_tasks_queue ON tasks(status, priority DESC, created_at ASC)
  WHERE status IN ('pending', 'in_progress');

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Admin users can only see active users
DROP POLICY IF EXISTS "Admin users can view active admins" ON admin_users;
CREATE POLICY "Admin users can view active admins"
  ON admin_users FOR SELECT
  USING (is_active = true);

-- Super admins can manage all admin users
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;
CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.role = 'super_admin'
      AND au.is_active = true
    )
  );

-- Users can view their own sessions
DROP POLICY IF EXISTS "Admins can view own sessions" ON admin_sessions;
CREATE POLICY "Admins can view own sessions"
  ON admin_sessions FOR SELECT
  USING (admin_id = auth.uid());

-- Admins can delete their own sessions
DROP POLICY IF EXISTS "Admins can delete own sessions" ON admin_sessions;
CREATE POLICY "Admins can delete own sessions"
  ON admin_sessions FOR DELETE
  USING (admin_id = auth.uid());

-- All admins can view role permissions
DROP POLICY IF EXISTS "Admins can view role permissions" ON role_permissions;
CREATE POLICY "Admins can view role permissions"
  ON role_permissions FOR SELECT
  USING (true);

-- Admin audit logs - admins can view based on their role
DROP POLICY IF EXISTS "Admins can view admin audit logs" ON admin_audit_logs;
CREATE POLICY "Admins can view admin audit logs"
  ON admin_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
      AND au.role IN ('super_admin', 'manager')
    )
  );

-- All authenticated admins can insert admin audit logs
DROP POLICY IF EXISTS "Admins can insert admin audit logs" ON admin_audit_logs;
CREATE POLICY "Admins can insert admin audit logs"
  ON admin_audit_logs FOR INSERT
  WITH CHECK (admin_id = auth.uid());

-- Tasks - admins can view tasks assigned to them or their role
DROP POLICY IF EXISTS "Admins can view assigned tasks" ON tasks;
CREATE POLICY "Admins can view assigned tasks"
  ON tasks FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
      AND au.role = ANY(assigned_roles)
    )
    OR EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
      AND au.role IN ('super_admin', 'manager')
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
DROP TRIGGER IF EXISTS admin_users_updated_at ON admin_users;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to admin_users
CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Apply updated_at trigger to tasks
DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- SEED DATA: Default Permissions
-- =====================================================

-- Super Admin - Full access
INSERT INTO role_permissions (role, resource, action) VALUES
  ('super_admin', 'users', 'view'),
  ('super_admin', 'users', 'create'),
  ('super_admin', 'users', 'update'),
  ('super_admin', 'users', 'delete'),
  ('super_admin', 'users', 'export'),
  ('super_admin', 'users', 'impersonate'),
  ('super_admin', 'moments', 'view'),
  ('super_admin', 'moments', 'create'),
  ('super_admin', 'moments', 'update'),
  ('super_admin', 'moments', 'delete'),
  ('super_admin', 'moments', 'export'),
  ('super_admin', 'disputes', 'view'),
  ('super_admin', 'disputes', 'create'),
  ('super_admin', 'disputes', 'update'),
  ('super_admin', 'disputes', 'delete'),
  ('super_admin', 'disputes', 'export'),
  ('super_admin', 'transactions', 'view'),
  ('super_admin', 'transactions', 'create'),
  ('super_admin', 'transactions', 'update'),
  ('super_admin', 'transactions', 'delete'),
  ('super_admin', 'transactions', 'export'),
  ('super_admin', 'payouts', 'view'),
  ('super_admin', 'payouts', 'create'),
  ('super_admin', 'payouts', 'update'),
  ('super_admin', 'payouts', 'delete'),
  ('super_admin', 'payouts', 'export'),
  ('super_admin', 'reports', 'view'),
  ('super_admin', 'reports', 'create'),
  ('super_admin', 'reports', 'update'),
  ('super_admin', 'reports', 'delete'),
  ('super_admin', 'reports', 'export'),
  ('super_admin', 'analytics', 'view'),
  ('super_admin', 'analytics', 'export'),
  ('super_admin', 'settings', 'view'),
  ('super_admin', 'settings', 'update'),
  ('super_admin', 'admin_users', 'view'),
  ('super_admin', 'admin_users', 'create'),
  ('super_admin', 'admin_users', 'update'),
  ('super_admin', 'admin_users', 'delete'),
  ('super_admin', 'integrations', 'view'),
  ('super_admin', 'integrations', 'update');

-- Manager permissions
INSERT INTO role_permissions (role, resource, action) VALUES
  ('manager', 'users', 'view'),
  ('manager', 'users', 'update'),
  ('manager', 'users', 'export'),
  ('manager', 'users', 'impersonate'),
  ('manager', 'moments', 'view'),
  ('manager', 'moments', 'update'),
  ('manager', 'moments', 'export'),
  ('manager', 'disputes', 'view'),
  ('manager', 'disputes', 'update'),
  ('manager', 'disputes', 'export'),
  ('manager', 'transactions', 'view'),
  ('manager', 'transactions', 'export'),
  ('manager', 'payouts', 'view'),
  ('manager', 'payouts', 'update'),
  ('manager', 'payouts', 'export'),
  ('manager', 'reports', 'view'),
  ('manager', 'reports', 'update'),
  ('manager', 'reports', 'export'),
  ('manager', 'analytics', 'view'),
  ('manager', 'analytics', 'export'),
  ('manager', 'settings', 'view'),
  ('manager', 'admin_users', 'view'),
  ('manager', 'integrations', 'view');

-- Moderator permissions
INSERT INTO role_permissions (role, resource, action) VALUES
  ('moderator', 'users', 'view'),
  ('moderator', 'users', 'update'),
  ('moderator', 'moments', 'view'),
  ('moderator', 'moments', 'update'),
  ('moderator', 'moments', 'delete'),
  ('moderator', 'disputes', 'view'),
  ('moderator', 'disputes', 'update'),
  ('moderator', 'transactions', 'view'),
  ('moderator', 'payouts', 'view'),
  ('moderator', 'reports', 'view'),
  ('moderator', 'reports', 'update'),
  ('moderator', 'analytics', 'view');

-- Finance permissions
INSERT INTO role_permissions (role, resource, action) VALUES
  ('finance', 'users', 'view'),
  ('finance', 'moments', 'view'),
  ('finance', 'disputes', 'view'),
  ('finance', 'transactions', 'view'),
  ('finance', 'transactions', 'update'),
  ('finance', 'transactions', 'export'),
  ('finance', 'payouts', 'view'),
  ('finance', 'payouts', 'update'),
  ('finance', 'payouts', 'export'),
  ('finance', 'reports', 'view'),
  ('finance', 'analytics', 'view'),
  ('finance', 'analytics', 'export');

-- Marketing permissions
INSERT INTO role_permissions (role, resource, action) VALUES
  ('marketing', 'users', 'view'),
  ('marketing', 'users', 'export'),
  ('marketing', 'moments', 'view'),
  ('marketing', 'moments', 'export'),
  ('marketing', 'transactions', 'view'),
  ('marketing', 'reports', 'view'),
  ('marketing', 'analytics', 'view'),
  ('marketing', 'analytics', 'export');

-- Support permissions
INSERT INTO role_permissions (role, resource, action) VALUES
  ('support', 'users', 'view'),
  ('support', 'users', 'update'),
  ('support', 'moments', 'view'),
  ('support', 'disputes', 'view'),
  ('support', 'disputes', 'update'),
  ('support', 'transactions', 'view'),
  ('support', 'payouts', 'view'),
  ('support', 'reports', 'view'),
  ('support', 'reports', 'update');

-- Viewer permissions (read-only)
INSERT INTO role_permissions (role, resource, action) VALUES
  ('viewer', 'users', 'view'),
  ('viewer', 'moments', 'view'),
  ('viewer', 'disputes', 'view'),
  ('viewer', 'transactions', 'view'),
  ('viewer', 'payouts', 'view'),
  ('viewer', 'reports', 'view'),
  ('viewer', 'analytics', 'view');

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE admin_users IS 'Admin panel users with role-based access';
COMMENT ON TABLE admin_sessions IS 'Admin user sessions for security tracking';
COMMENT ON TABLE role_permissions IS 'Permission definitions for each admin role';
COMMENT ON TABLE admin_audit_logs IS 'Audit trail for all admin actions (şirket içi)';
COMMENT ON TABLE tasks IS 'Task queue for admin workflow management';
