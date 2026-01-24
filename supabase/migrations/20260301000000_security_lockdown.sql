-- Migration: Security Lockdown
-- Description: Fixes critical RLS leaks in users table and revokes unsafe client-side permissions.
-- Priority: P0 (Critical)

-- 1. Fix Users Table RLS (PII Protection)
-- Drop the permissive policy that allowed everyone to select * (including balances/phones)
DROP POLICY IF EXISTS "Users can view any profile" ON users;

-- Create a strict "Self-Only" policy for the main users table
-- Only the user themselves can see their own sensitive record
CREATE POLICY "Users can view own record" ON users
    FOR SELECT USING (auth.uid() = id);

-- 2. Revoke Unsafe Permissions (Force logic to Edge Functions)
-- Prevent mobile client from directly updating sensitive tables
REVOKE UPDATE ON gifts FROM authenticated;
REVOKE DELETE ON gifts FROM authenticated;

-- Prevent mobile client from soft-deleting users directly (must use delete-account function)
-- Note: users table might need UPDATE for some benign fields. 
-- Ideally we REVOKE ALL and grant only on safe columns, but Postgres RLS is row-based.
-- For now, we rely on the specific RLS policy update above which might block updates if not careful,
-- but standard practice for "Users can update own profile" usually allows auth.uid() = id.
-- To strictly block "deleted_at" updates from client, we would need a column-level trigger or REVOKE UPDATE, 
-- then GRANT UPDATE(full_name, avatar_url, etc) TO authenticated.
-- Let's implement the safer REVOKE UPDATE and specific COLUMN GRANT approach for users.

REVOKE UPDATE ON users FROM authenticated;
GRANT UPDATE (
    full_name,
    avatar_url,
    bio,
    location,
    gender,
    date_of_birth,
    updated_at
) ON users TO authenticated;

-- 3. Lock down Gifts Table
-- Gifts should only be inserted by client. Status updates (unlock chat) must happen via Edge Function.
-- Already revoked UPDATE/DELETE above.
