-- ============================================
-- Security Hardening P0 Migration
-- Migration: 20260124000001_security_hardening_p0.sql
-- ============================================
--
-- This migration addresses critical security issues from the
-- "Vibe Coding Security Manifesto" audit:
--
-- EK-P0-2: Fix gifts UPDATE policy - restrict to service_role only
-- EK-P2-11: Column-level permissions for users table
-- ============================================

-- ============================================
-- 1. FIX GIFTS UPDATE POLICY (EK-P0-2)
-- ============================================
-- PROBLEM: Current policy allows both giver_id and receiver_id to update
--          ANY column, including sensitive ones like amount, status, etc.
-- SOLUTION: Remove auth.uid() from UPDATE policy, only service_role can update

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can update gifts" ON gifts;

-- Create strict UPDATE policy - ONLY service_role can update
CREATE POLICY "Only service_role can update gifts" ON gifts
FOR UPDATE USING (
  -- SECURITY: Only service_role (Edge Functions) can update gifts
  -- This prevents clients from modifying amount, status, or other sensitive fields
  current_setting('request.jwt.claim.role', true) = 'service_role'
);

-- Also add UPDATE GRANT restriction
REVOKE UPDATE ON gifts FROM authenticated;
REVOKE UPDATE ON gifts FROM anon;
GRANT UPDATE ON gifts TO service_role;

-- ============================================
-- 2. ADD host_approved COLUMN IF NOT EXISTS
-- ============================================
-- This column is referenced in code but may not exist in all environments

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifts' AND column_name = 'host_approved'
  ) THEN
    ALTER TABLE gifts ADD COLUMN host_approved BOOLEAN DEFAULT FALSE;
    COMMENT ON COLUMN gifts.host_approved IS 'Whether the receiver (host) has approved chat unlock';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifts' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE gifts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ============================================
-- 3. COLUMN-LEVEL PERMISSIONS FOR USERS (EK-P2-11)
-- ============================================
-- PROBLEM: Users can update ANY column on their own row via RLS
-- SOLUTION: Revoke UPDATE on sensitive columns, create whitelisted RPC

-- Revoke UPDATE on sensitive columns from authenticated users
-- Note: PostgreSQL requires table-level GRANT before column-level REVOKE
REVOKE UPDATE (
  balance,
  role,
  email,
  verified,
  kyc_status,
  trust_score,
  deleted_at,
  idenfy_status,
  idenfy_scan_ref,
  verified_at,
  email_bounced,
  email_bounced_at,
  email_unsubscribed,
  email_unsubscribed_at,
  email_unsubscribe_reason
) ON users FROM authenticated;

-- Create safe profile update function
CREATE OR REPLACE FUNCTION update_own_profile(
  p_full_name TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Update only allowed fields
  UPDATE users
  SET
    full_name = COALESCE(p_full_name, full_name),
    bio = COALESCE(p_bio, bio),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    location = COALESCE(p_location, location),
    updated_at = NOW()
  WHERE id = v_user_id
  RETURNING jsonb_build_object(
    'id', id,
    'full_name', full_name,
    'bio', bio,
    'avatar_url', avatar_url,
    'location', location,
    'updated_at', updated_at
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION update_own_profile TO authenticated;
REVOKE EXECUTE ON FUNCTION update_own_profile FROM anon;
REVOKE EXECUTE ON FUNCTION update_own_profile FROM public;

COMMENT ON FUNCTION update_own_profile IS
'Safe profile update - only allows updating non-sensitive fields';

-- ============================================
-- 4. CREATE GIFT APPROVAL RPC (for Edge Function)
-- ============================================

CREATE OR REPLACE FUNCTION approve_gift_chat(
  p_gift_id UUID,
  p_receiver_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_gift RECORD;
  v_min_amount NUMERIC := 30; -- $30 minimum for chat unlock
BEGIN
  -- Verify gift exists and belongs to receiver
  SELECT id, giver_id, receiver_id, amount, status, host_approved
  INTO v_gift
  FROM gifts
  WHERE id = p_gift_id AND receiver_id = p_receiver_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Gift not found or not authorized';
  END IF;

  -- Check minimum amount for chat eligibility
  IF v_gift.amount < v_min_amount THEN
    RAISE EXCEPTION 'Gift amount below chat unlock threshold (minimum $30)';
  END IF;

  -- Check if already approved
  IF v_gift.host_approved THEN
    RETURN jsonb_build_object('success', true, 'already_approved', true);
  END IF;

  -- Update gift
  UPDATE gifts
  SET
    host_approved = TRUE,
    updated_at = NOW()
  WHERE id = p_gift_id;

  RETURN jsonb_build_object(
    'success', true,
    'gift_id', p_gift_id,
    'giver_id', v_gift.giver_id
  );
END;
$$;

-- Only service_role can execute this function
REVOKE EXECUTE ON FUNCTION approve_gift_chat FROM public;
REVOKE EXECUTE ON FUNCTION approve_gift_chat FROM anon;
REVOKE EXECUTE ON FUNCTION approve_gift_chat FROM authenticated;
GRANT EXECUTE ON FUNCTION approve_gift_chat TO service_role;

COMMENT ON FUNCTION approve_gift_chat IS
'Approve chat unlock for a gift - called only by Edge Function with service_role';

-- ============================================
-- 5. CREATE NOTIFICATION INSERT RPC
-- ============================================
-- This allows controlled notification creation from Edge Functions

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, body, data, created_at)
  VALUES (p_user_id, p_type, p_title, p_body, p_data, NOW())
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Only service_role can create notifications via RPC
REVOKE EXECUTE ON FUNCTION create_notification FROM public;
REVOKE EXECUTE ON FUNCTION create_notification FROM anon;
REVOKE EXECUTE ON FUNCTION create_notification FROM authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO service_role;

COMMENT ON FUNCTION create_notification IS
'Create notification - called only by Edge Function with service_role';

-- ============================================
-- 6. SOFT DELETE ACCOUNT RPC
-- ============================================

CREATE OR REPLACE FUNCTION soft_delete_account(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Verify caller is the user or service_role
  IF auth.uid() IS DISTINCT FROM p_user_id AND
     current_setting('request.jwt.claim.role', true) != 'service_role' THEN
    RAISE EXCEPTION 'Not authorized to delete this account';
  END IF;

  -- Soft delete the user
  UPDATE users
  SET
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id AND deleted_at IS NULL;

  -- Log the deletion
  INSERT INTO audit_logs (user_id, action, resource_type, new_value)
  VALUES (p_user_id, 'account_soft_delete', 'user', jsonb_build_object('deleted_at', NOW()));

  RETURN TRUE;
END;
$$;

-- Only service_role can soft delete accounts
REVOKE EXECUTE ON FUNCTION soft_delete_account FROM public;
REVOKE EXECUTE ON FUNCTION soft_delete_account FROM anon;
REVOKE EXECUTE ON FUNCTION soft_delete_account FROM authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_account TO service_role;

COMMENT ON FUNCTION soft_delete_account IS
'Soft delete user account - called only by Edge Function with service_role';

-- ============================================
-- 7. RESTRICT NOTIFICATIONS TABLE
-- ============================================
-- Remove direct INSERT capability from client

REVOKE INSERT ON notifications FROM authenticated;
REVOKE INSERT ON notifications FROM anon;
GRANT INSERT ON notifications TO service_role;

-- Keep SELECT for users to read their own notifications
-- (Assuming RLS policy already handles this)

-- ============================================
-- 8. CREATE SIGNED URL HELPER (for storage)
-- ============================================
-- Note: Actual signed URL generation happens in Edge Function
-- This is just a path sanitizer

CREATE OR REPLACE FUNCTION sanitize_storage_path(p_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Remove any path traversal attempts
  IF p_path ~ '\.\.' OR p_path ~ '//' THEN
    RAISE EXCEPTION 'Invalid path';
  END IF;

  -- Ensure path starts correctly
  RETURN regexp_replace(p_path, '^/*', '');
END;
$$;

GRANT EXECUTE ON FUNCTION sanitize_storage_path TO authenticated;
GRANT EXECUTE ON FUNCTION sanitize_storage_path TO service_role;

-- ============================================
-- 9. COMMENTS
-- ============================================

COMMENT ON POLICY "Only service_role can update gifts" ON gifts IS
'EK-P0-2: Security hardening - prevents client-side gift manipulation';
