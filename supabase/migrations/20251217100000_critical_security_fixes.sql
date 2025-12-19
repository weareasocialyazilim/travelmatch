-- ============================================================================
-- CRITICAL SECURITY FIXES - FORENSIC AUDIT 2025-12-17
-- ============================================================================
-- This migration addresses DEFCON 1 blockers identified in the audit.
-- MUST BE APPLIED BEFORE PRODUCTION LAUNCH
-- ============================================================================

-- ============================================================================
-- FIX 1: BALANCE CONSTRAINT (BLOCKER 1.1)
-- Prevents negative balances due to race conditions or logic errors
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_balance_non_negative'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT check_balance_non_negative
    CHECK (balance >= 0);

    RAISE NOTICE 'Added balance non-negative constraint';
  ELSE
    RAISE NOTICE 'Balance constraint already exists';
  END IF;
END $$;

-- ============================================================================
-- FIX 2: REVOKE ESCROW FUNCTION PERMISSIONS (BLOCKER 1.2)
-- Users should NOT be able to directly call financial functions
-- All escrow operations must go through Edge Functions (service_role)
-- ============================================================================

REVOKE EXECUTE ON FUNCTION create_escrow_transaction FROM authenticated;
REVOKE EXECUTE ON FUNCTION release_escrow FROM authenticated;
REVOKE EXECUTE ON FUNCTION refund_escrow FROM authenticated;

-- Ensure service_role can still call these (for Edge Functions)
GRANT EXECUTE ON FUNCTION create_escrow_transaction TO service_role;
GRANT EXECUTE ON FUNCTION release_escrow TO service_role;
GRANT EXECUTE ON FUNCTION refund_escrow TO service_role;

COMMENT ON FUNCTION create_escrow_transaction IS
  'SECURITY: Only callable by service_role (Edge Functions). Do NOT grant to authenticated.';
COMMENT ON FUNCTION release_escrow IS
  'SECURITY: Only callable by service_role (Edge Functions). Do NOT grant to authenticated.';
COMMENT ON FUNCTION refund_escrow IS
  'SECURITY: Only callable by service_role (Edge Functions). Do NOT grant to authenticated.';

-- ============================================================================
-- FIX 3: REMOVE BROKEN ADMIN STORAGE POLICY (BLOCKER 1.7)
-- Policy references non-existent column users.role
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view KYC docs" ON storage.objects;

-- Note: Admin access to KYC docs should use service_role JWT, not user-level admin
-- COMMENT ON storage.objects removed - requires table owner permission

-- ============================================================================
-- FIX 4: STORAGE AUDIT LOG (BLOCKER 1.5)
-- NOTE: storage.objects triggers require superuser/service_role access
-- Storage audit logging should be handled at Edge Function level instead
-- ============================================================================

-- Drop any existing broken triggers (if we have permission)
DO $$
BEGIN
  DROP TRIGGER IF EXISTS log_sensitive_access_trigger ON storage.objects;
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'Skipping storage trigger drop - requires elevated permissions';
END $$;

-- NOTE: Storage audit logging moved to Edge Functions
-- See: supabase/functions/upload-file/index.ts for audit implementation

-- ============================================================================
-- FIX 5: TRANSACTION AMOUNT CONSTRAINT (LOW PRIORITY)
-- Prevent zero-amount transactions
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_amount_not_zero'
  ) THEN
    ALTER TABLE transactions
    ADD CONSTRAINT check_amount_not_zero
    CHECK (amount != 0);

    RAISE NOTICE 'Added transaction amount non-zero constraint';
  ELSE
    RAISE NOTICE 'Transaction amount constraint already exists';
  END IF;
END $$;

-- ============================================================================
-- FIX 6: CONSIDER REVOKING ATOMIC_TRANSFER (RECOMMENDED)
-- While the function has auth checks, it bypasses Edge Function rate limiting
-- Uncomment if you want to enforce all transfers go through Edge Functions
-- ============================================================================

-- REVOKE EXECUTE ON FUNCTION atomic_transfer FROM authenticated;
-- GRANT EXECUTE ON FUNCTION atomic_transfer TO service_role;

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these after migration to confirm fixes applied
-- ============================================================================

DO $$
DECLARE
  balance_constraint_exists BOOLEAN;
  escrow_permissions_revoked BOOLEAN;
  admin_policy_removed BOOLEAN;
BEGIN
  -- Check balance constraint
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_balance_non_negative'
  ) INTO balance_constraint_exists;

  -- Check escrow function permissions (should return 0 for authenticated)
  SELECT NOT EXISTS (
    SELECT 1 FROM information_schema.routine_privileges
    WHERE routine_name = 'create_escrow_transaction'
    AND grantee = 'authenticated'
    AND privilege_type = 'EXECUTE'
  ) INTO escrow_permissions_revoked;

  -- Check admin policy removed
  SELECT NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admins can view KYC docs'
  ) INTO admin_policy_removed;

  RAISE NOTICE '=== SECURITY FIXES VERIFICATION ===';
  RAISE NOTICE 'Balance constraint: %', CASE WHEN balance_constraint_exists THEN 'OK' ELSE 'MISSING' END;
  RAISE NOTICE 'Escrow permissions revoked: %', CASE WHEN escrow_permissions_revoked THEN 'OK' ELSE 'STILL EXPOSED' END;
  RAISE NOTICE 'Admin policy removed: %', CASE WHEN admin_policy_removed THEN 'OK' ELSE 'STILL EXISTS' END;
  RAISE NOTICE '===================================';
END $$;

-- ============================================================================
-- END OF CRITICAL SECURITY FIXES
-- ============================================================================
