-- =====================================================
-- FIX: Remove infinite recursion in admin_users RLS
-- The problem: policies query admin_users table which triggers the same policies
-- Solution: Use security definer function or simple auth.uid() check
-- =====================================================

-- Drop all existing policies on admin_users to start fresh
DROP POLICY IF EXISTS "Authenticated users can view own admin record" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can verify admin status by email" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Admin users can view active admins" ON admin_users;

-- Simple policy 1: User can always read their own record by ID
CREATE POLICY "Users can view own admin record by id"
  ON admin_users FOR SELECT
  USING (id = auth.uid());

-- Simple policy 2: User can read their record by matching email in JWT
-- This avoids recursion by using JWT claim directly, not querying the table
CREATE POLICY "Users can view own admin record by email"
  ON admin_users FOR SELECT
  USING (
    email = (auth.jwt() ->> 'email')
    AND is_active = true
  );

-- Create a security definer function to check if user is super_admin
-- This bypasses RLS when checking admin status
CREATE OR REPLACE FUNCTION is_super_admin(check_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = check_user_id
    AND role = 'super_admin'
    AND is_active = true
  );
END;
$$;

-- Policy 3: Super admins can manage all admin users (using security definer function)
CREATE POLICY "Super admins can manage all admin users"
  ON admin_users FOR ALL
  USING (is_super_admin(auth.uid()));
