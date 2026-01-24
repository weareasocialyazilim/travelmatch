-- CRITICAL SECURITY FIX: Users Table PII Exposure
-- Migration: 20260203000000_fix_users_pii_exposure
-- Date: 2026-02-03
-- Priority: P0 - CRITICAL LAUNCH BLOCKER
--
-- ISSUE: The RLS policy "Users can view any profile" allows ANY authenticated user
-- to SELECT all columns from users table, including PII (email, phone, DOB, balance, push_token).
-- This violates GDPR/KVKK regulations and poses serious privacy and security risks.
--
-- IMPACT:
-- - Privacy breach (email, phone, date_of_birth exposed to all users)
-- - Financial data leak (balance visible to all users)
-- - Security risk (push_token can be used for targeted attacks)
--
-- FIX STRATEGY:
-- 1. Drop the dangerous "Users can view any profile" policy
-- 2. Create strict self-only policy for users table
-- 3. Create safe public_profiles view with only non-PII columns
-- 4. Add helper function for users to get their own full profile

-- =====================================================
-- STEP 1: Drop the dangerous policy
-- =====================================================
DROP POLICY IF EXISTS "Users can view any profile" ON users;

-- =====================================================
-- STEP 2: Create strict self-only policy
-- =====================================================
-- Users can ONLY view their own profile data from the users table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can view own profile only'
        AND tablename = 'users'
    ) THEN
        CREATE POLICY "Users can view own profile only" ON users
            FOR SELECT
            USING (deleted_at IS NULL AND auth.uid() = id);
    END IF;
END $$;

-- =====================================================
-- STEP 3: Create safe public profiles view
-- =====================================================
-- This view contains ONLY safe, non-PII columns for cross-user queries
-- NO email, phone, date_of_birth, balance, push_token, kyc_status, etc.
CREATE OR REPLACE VIEW public_profiles AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  location,
  languages,
  interests,
  verified,
  rating,
  review_count,
  created_at
FROM users
WHERE deleted_at IS NULL;

-- =====================================================
-- STEP 4: Grant appropriate access to the view
-- =====================================================
GRANT SELECT ON public_profiles TO authenticated;
GRANT SELECT ON public_profiles TO anon;

-- =====================================================
-- STEP 5: Create helper function for own profile
-- =====================================================
-- Users can call this function to get their own full profile data
-- (including email, balance, kyc_status, etc.)
CREATE OR REPLACE FUNCTION get_own_profile()
RETURNS SETOF users
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT * FROM users
  WHERE id = auth.uid()
  AND deleted_at IS NULL;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_own_profile() TO authenticated;

-- =====================================================
-- STEP 6: Add documentation
-- =====================================================
COMMENT ON VIEW public_profiles IS
'Safe public-facing user profile view. Contains NO PII (email, phone, DOB, balance, push_token, kyc_status). Use this view for cross-user profile queries (search, suggestions, etc.).';

COMMENT ON FUNCTION get_own_profile() IS
'Returns the full profile data for the authenticated user only. Includes PII fields that are not available in public_profiles view.';

-- =====================================================
-- STEP 7: Log the security fix to audit trail
-- =====================================================
INSERT INTO audit_logs (action, metadata, created_at)
VALUES (
  'SECURITY_FIX_APPLIED',
  jsonb_build_object(
    'fix', 'users_pii_exposure',
    'severity', 'CRITICAL',
    'policy_dropped', 'Users can view any profile',
    'policy_created', 'Users can view own profile only',
    'view_created', 'public_profiles',
    'function_created', 'get_own_profile()',
    'compliance', 'GDPR/KVKK',
    'ticket', 'SEC-001'
  ),
  NOW()
);
