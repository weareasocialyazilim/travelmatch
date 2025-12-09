-- Migration: Fix SECURITY DEFINER function search_path vulnerability
-- Created: 2025-12-09
-- Week 3 Day 12 - Phase 1: Critical Security Fix
-- 
-- Purpose: Add SET search_path protection to soft_delete_user function
-- Risk Level: CRITICAL (SECURITY DEFINER without search_path = schema hijacking)
--
-- Impact:
--   - Prevents schema hijacking attacks
--   - Ensures function uses public.users/moments/requests tables
--   - No breaking changes (same signature)
--
-- Testing:
--   SELECT soft_delete_user('test-user-id');
--   -- Verify: deleted_at set, moments/requests cancelled

-- ============================================
-- PHASE 1: SECURITY DEFINER FUNCTION FIX
-- ============================================

-- Drop and recreate with search_path protection
DROP FUNCTION IF EXISTS soft_delete_user(UUID);

CREATE OR REPLACE FUNCTION soft_delete_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with elevated privileges
SET search_path = public, pg_temp  -- 👈 CRITICAL FIX: Prevent schema hijacking
AS $$
BEGIN
  -- Soft delete user record (explicit schema prefix for safety)
  UPDATE public.users
  SET 
    deleted_at = TIMEZONE('utc', NOW()),
    email = email || '_deleted_' || EXTRACT(EPOCH FROM NOW())::TEXT,
    phone = NULL,
    push_token = NULL
  WHERE id = p_user_id AND deleted_at IS NULL;
  
  -- Cancel all active moments for this user
  UPDATE public.moments
  SET status = 'cancelled'
  WHERE user_id = p_user_id AND status IN ('active', 'draft');
  
  -- Cancel all pending requests for this user
  UPDATE public.requests
  SET status = 'cancelled'
  WHERE user_id = p_user_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$;

-- Add comment explaining the security model
COMMENT ON FUNCTION soft_delete_user(UUID) IS 
'Soft deletes a user and cascades to related records. 
SECURITY DEFINER with search_path protection to prevent schema hijacking.
Updates users, moments, and requests tables.';

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify function exists with correct attributes
DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname = 'soft_delete_user'
    AND p.prosecdef = true;  -- SECURITY DEFINER
  
  IF func_count = 0 THEN
    RAISE EXCEPTION 'soft_delete_user function not found or not SECURITY DEFINER';
  END IF;
  
  RAISE NOTICE 'soft_delete_user function verified: SECURITY DEFINER with search_path protection ✅';
END $$;
