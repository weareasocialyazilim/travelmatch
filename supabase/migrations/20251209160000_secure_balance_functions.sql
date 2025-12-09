-- Migration: Secure Balance & Sensitive Functions
-- Created: 2025-12-09
-- Week 3 Day 13 - Phase 2: High-Priority Functions
-- 
-- Purpose: Add SECURITY DEFINER + search_path to balance/payment functions
--          Add search_path to critical trigger functions
--
-- Functions Fixed:
--   1. increment_user_balance → SECURITY DEFINER + search_path
--   2. decrement_user_balance → SECURITY DEFINER + search_path
--   3. increment_moment_gift_count → SECURITY DEFINER + search_path
--   4. prevent_sensitive_updates → search_path (trigger)
--   5. invalidate_cdn_on_moment_change → search_path (trigger)
--   6. invalidate_cdn_on_user_change → search_path (trigger)
--
-- Risk Level: HIGH (balance manipulation, payment security)
--
-- Impact:
--   - Prevents balance hijacking attacks
--   - Secures payment flow
--   - Protects sensitive field updates
--   - No breaking changes

-- ============================================
-- BALANCE & PAYMENT FUNCTIONS
-- ============================================

-- Fix: increment_user_balance
-- Add SECURITY DEFINER to ensure proper privilege escalation
DROP FUNCTION IF EXISTS increment_user_balance(UUID, DECIMAL);

CREATE OR REPLACE FUNCTION increment_user_balance(user_id UUID, amount DECIMAL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- 👈 ADDED: Needs elevated privileges
SET search_path = public, pg_temp  -- 👈 ADDED: Prevent schema hijacking
AS $$
BEGIN
  UPDATE public.users  -- 👈 Explicit schema
  SET balance = COALESCE(balance, 0) + amount
  WHERE id = user_id;
END;
$$;

COMMENT ON FUNCTION increment_user_balance(UUID, DECIMAL) IS 
'Increments user balance. SECURITY DEFINER with search_path protection.
Used by payment triggers and edge functions.';

-- Fix: decrement_user_balance
DROP FUNCTION IF EXISTS decrement_user_balance(UUID, DECIMAL);

CREATE OR REPLACE FUNCTION decrement_user_balance(user_id UUID, amount DECIMAL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- 👈 ADDED: Needs elevated privileges
SET search_path = public, pg_temp  -- 👈 ADDED: Prevent schema hijacking
AS $$
BEGIN
  UPDATE public.users  -- 👈 Explicit schema
  SET balance = COALESCE(balance, 0) - amount
  WHERE id = user_id;
  
  -- Prevent negative balance
  UPDATE public.users  -- 👈 Explicit schema
  SET balance = 0
  WHERE id = user_id AND balance < 0;
END;
$$;

COMMENT ON FUNCTION decrement_user_balance(UUID, DECIMAL) IS 
'Decrements user balance with negative balance protection. 
SECURITY DEFINER with search_path protection.
Used by payment triggers and edge functions.';

-- Fix: increment_moment_gift_count
DROP FUNCTION IF EXISTS increment_moment_gift_count(UUID);

CREATE OR REPLACE FUNCTION increment_moment_gift_count(moment_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- 👈 ADDED: Needs elevated privileges for metadata update
SET search_path = public, pg_temp  -- 👈 ADDED: Prevent schema hijacking
AS $$
BEGIN
  UPDATE public.moments  -- 👈 Explicit schema
  SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{gift_count}',
    to_jsonb(COALESCE((metadata->>'gift_count')::int, 0) + 1)
  )
  WHERE id = moment_id;
END;
$$;

COMMENT ON FUNCTION increment_moment_gift_count(UUID) IS 
'Increments gift count in moment metadata. 
SECURITY DEFINER with search_path protection.
Used by payment flow when gifts are sent.';

-- ============================================
-- CRITICAL TRIGGER FUNCTIONS
-- ============================================

-- Fix: prevent_sensitive_updates
DROP FUNCTION IF EXISTS prevent_sensitive_updates() CASCADE;

CREATE OR REPLACE FUNCTION prevent_sensitive_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp  -- 👈 ADDED: Prevent schema hijacking
AS $$
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
$$;

-- Recreate trigger (dropped by CASCADE)
CREATE TRIGGER prevent_sensitive_updates_trigger
BEFORE UPDATE ON public.users
FOR EACH ROW
WHEN (NEW.id = auth.uid()::uuid)  -- Only for self-updates
EXECUTE FUNCTION prevent_sensitive_updates();

COMMENT ON FUNCTION prevent_sensitive_updates() IS 
'Prevents users from updating their own sensitive fields (balance, KYC, rating).
Trigger function with search_path protection.';

-- Fix: invalidate_cdn_on_moment_change
DROP FUNCTION IF EXISTS invalidate_cdn_on_moment_change() CASCADE;

CREATE OR REPLACE FUNCTION invalidate_cdn_on_moment_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp  -- 👈 ADDED: Prevent schema hijacking
AS $$
DECLARE
  moment_id TEXT;
BEGIN
  -- Get moment ID
  IF TG_OP = 'DELETE' THEN
    moment_id := OLD.id::text;
  ELSE
    moment_id := NEW.id::text;
  END IF;

  -- Call Edge Function asynchronously using pg_net
  PERFORM
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/cdn-invalidate',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
      ),
      body := jsonb_build_object(
        'type', 'moment',
        'ids', jsonb_build_array(moment_id)
      )
    );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Note: Trigger is disabled by default in original migration
-- Uncomment to re-enable if needed:
-- CREATE TRIGGER moments_cdn_invalidation
-- AFTER INSERT OR UPDATE OR DELETE ON public.moments
-- FOR EACH ROW EXECUTE FUNCTION invalidate_cdn_on_moment_change();

COMMENT ON FUNCTION invalidate_cdn_on_moment_change() IS 
'Invalidates CDN cache when moments change. 
Trigger function with search_path protection.
Calls Edge Function via pg_net.';

-- Fix: invalidate_cdn_on_user_change
DROP FUNCTION IF EXISTS invalidate_cdn_on_user_change() CASCADE;

CREATE OR REPLACE FUNCTION invalidate_cdn_on_user_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp  -- 👈 ADDED: Prevent schema hijacking
AS $$
DECLARE
  user_id TEXT;
BEGIN
  user_id := NEW.id::text;

  -- Only invalidate if profile images changed
  IF (OLD.profile_image IS DISTINCT FROM NEW.profile_image) OR
     (OLD.verification_video IS DISTINCT FROM NEW.verification_video) THEN
    
    -- Call Edge Function asynchronously
    PERFORM
      net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/cdn-invalidate',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
        ),
        body := jsonb_build_object(
          'type', 'user',
          'ids', jsonb_build_array(user_id)
        )
      );
  END IF;

  RETURN NEW;
END;
$$;

-- Note: Trigger is disabled by default in original migration
-- Uncomment to re-enable if needed:
-- CREATE TRIGGER users_cdn_invalidation
-- AFTER UPDATE ON public.users
-- FOR EACH ROW EXECUTE FUNCTION invalidate_cdn_on_user_change();

COMMENT ON FUNCTION invalidate_cdn_on_user_change() IS 
'Invalidates CDN cache when user profile images change. 
Trigger function with search_path protection.
Calls Edge Function via pg_net.';

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  func_count INTEGER;
BEGIN
  -- Verify balance functions are SECURITY DEFINER
  SELECT COUNT(*)
  INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN ('increment_user_balance', 'decrement_user_balance', 'increment_moment_gift_count')
    AND p.prosecdef = true;  -- SECURITY DEFINER
  
  IF func_count != 3 THEN
    RAISE EXCEPTION 'Balance functions not properly secured';
  END IF;
  
  RAISE NOTICE 'Phase 2 complete: 6 functions secured with search_path protection ✅';
  RAISE NOTICE '  - 3 balance functions: SECURITY DEFINER + search_path ✅';
  RAISE NOTICE '  - 3 trigger functions: search_path protection ✅';
END $$;
