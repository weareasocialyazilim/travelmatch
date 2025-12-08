-- Strict Security Migration
-- Version: 1.1.0
-- Created: 2025-12-06
-- Description: Hardens security by preventing client-side updates to sensitive columns and ensuring transactions are server-side only.

-- ============================================
-- 1. PROTECT SENSITIVE USER COLUMNS
-- ============================================
-- Users should NOT be able to update their own balance, kyc_status, verified status, or rating.
-- These must only be updated by the service_role (Edge Functions).

CREATE OR REPLACE FUNCTION prevent_sensitive_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow if the user is a service_role (admin/edge function)
  IF (auth.jwt() ->> 'role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Check for unauthorized changes
  IF NEW.balance IS DISTINCT FROM OLD.balance THEN
    RAISE EXCEPTION 'You cannot update your own balance.';
  END IF;

  IF NEW.kyc_status IS DISTINCT FROM OLD.kyc_status THEN
    RAISE EXCEPTION 'You cannot update your own KYC status.';
  END IF;

  IF NEW.verified IS DISTINCT FROM OLD.verified THEN
    RAISE EXCEPTION 'You cannot update your own verification status.';
  END IF;

  IF NEW.rating IS DISTINCT FROM OLD.rating THEN
    RAISE EXCEPTION 'You cannot update your own rating.';
  END IF;

  IF NEW.review_count IS DISTINCT FROM OLD.review_count THEN
    RAISE EXCEPTION 'You cannot update your own review count.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_user_update_sensitive ON users;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_user_update_sensitive') THEN
        CREATE TRIGGER on_user_update_sensitive
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_sensitive_updates();
    END IF;
END $$;


-- ============================================
-- 2. LOCK DOWN TRANSACTIONS
-- ============================================
-- Ensure NO ONE (except service_role) can INSERT/UPDATE/DELETE transactions.
-- The previous migration might not have added INSERT policies, but we want to be explicit.

-- Drop any potential loose policies (if they existed, though we didn't see them in the previous file)
DROP POLICY IF EXISTS "Users can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete transactions" ON transactions;

-- We only keep the SELECT policy:
-- "Users can view own transactions" (Already exists in 20241205000002_enable_rls.sql)

-- ============================================
-- 3. LOCK DOWN REQUESTS STATUS
-- ============================================
-- Users shouldn't be able to force a request status to 'completed' or 'accepted' arbitrarily without proper flow.
-- For now, we'll trust the app logic but ideally, this should also be state-machine protected.
-- We will leave this for now as it might break the current "Accept/Reject" flow if we are too strict without moving that logic to Edge Functions yet.

-- ============================================
-- 4. SECURE MESSAGES
-- ============================================
-- Ensure users can't edit messages after sending (immutability).
-- Drop the UPDATE policy if it exists.
DROP POLICY IF EXISTS "Users can update own messages" ON messages;

-- If we want to allow "Edit" feature, we should restrict it to a time window, but for "Strict Security", immutability is safer.
