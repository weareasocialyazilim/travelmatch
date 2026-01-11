-- =====================================================
-- FIX: Allow authenticated users to read their own admin_users record
-- This is needed for login flow where user needs to verify they are an admin
-- =====================================================

-- Drop the existing policy that's too restrictive
DROP POLICY IF EXISTS "Admin users can view active admins" ON admin_users;

-- Create a new policy that allows:
-- 1. Authenticated users to read their own record (for login verification)
-- 2. Active admins to see other active admins
CREATE POLICY "Authenticated users can view own admin record"
  ON admin_users FOR SELECT
  USING (
    -- User can always see their own record if they're authenticated
    (auth.uid() = id)
    OR
    -- Or they can see active admins if they are themselves an active admin
    (
      is_active = true
      AND EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.is_active = true
      )
    )
  );

-- Also allow reading by email for login flow (user might not know their UUID yet)
CREATE POLICY "Authenticated users can verify admin status by email"
  ON admin_users FOR SELECT
  USING (
    -- Allow reading a record if the email matches the authenticated user's email
    email = (auth.jwt() ->> 'email')
    AND is_active = true
  );
