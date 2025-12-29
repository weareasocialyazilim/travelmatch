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

-- Note: Admin access to KYC docs requires service_role JWT
-- COMMENT ON TABLE storage.objects removed - requires owner privileges

-- ============================================================================
-- FIX 4: FIX STORAGE AUDIT LOG TRIGGER (BLOCKER 1.5)
-- Current trigger references wrong column names
-- ============================================================================

-- Drop existing broken trigger
DROP TRIGGER IF EXISTS log_sensitive_access_trigger ON storage.objects;
DROP FUNCTION IF EXISTS storage.log_sensitive_access();
DROP FUNCTION IF EXISTS public.log_sensitive_storage_access();

-- Create corrected function in public schema (storage schema requires superuser)
CREATE OR REPLACE FUNCTION public.log_sensitive_storage_access()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Only log access to sensitive buckets
  IF NEW.bucket_id IN ('kyc_docs', 'profile-proofs') THEN
    INSERT INTO public.audit_logs (
      id,
      user_id,
      action,
      metadata,
      created_at
    ) VALUES (
      gen_random_uuid(),
      auth.uid(),
      TG_OP || '_storage_' || NEW.bucket_id,
      jsonb_build_object(
        'path', NEW.name,
        'bucket', NEW.bucket_id,
        'size', COALESCE(NEW.metadata->>'size', 'unknown'),
        'mimetype', COALESCE(NEW.metadata->>'mimetype', 'unknown'),
        'operation', TG_OP,
        'timestamp', NOW()
      ),
      NOW()
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the storage operation if audit logging fails
  RAISE WARNING 'Audit log failed for storage operation: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Note: Trigger on storage.objects requires superuser, skipping for now
-- The audit logging can be done via Edge Functions or service_role instead
-- CREATE TRIGGER log_sensitive_access_trigger
--   AFTER INSERT OR UPDATE ON storage.objects
--   FOR EACH ROW
--   EXECUTE FUNCTION public.log_sensitive_storage_access();

COMMENT ON FUNCTION public.log_sensitive_storage_access IS
  'Audit logging for sensitive storage buckets (kyc_docs, profile-proofs). Fixed 2025-12-17. Note: Trigger disabled as storage.objects requires superuser.';

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
