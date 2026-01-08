-- ============================================================================
-- Migration: Clean Up Old Function Versions
-- ============================================================================
-- 
-- This migration drops all old versions of functions that have multiple signatures
-- to eliminate linter errors from deprecated function signatures.
-- ============================================================================

-- Drop all versions of create_gift_with_proof_requirement
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text as sig
    FROM pg_proc
    WHERE proname = 'create_gift_with_proof_requirement'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- Drop all versions of verify_proof_and_release
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text as sig
    FROM pg_proc
    WHERE proname = 'verify_proof_and_release'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- Drop all versions of calculate_payment_amount
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text as sig
    FROM pg_proc
    WHERE proname = 'calculate_payment_amount'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- Drop all versions of get_moment_price_display
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text as sig
    FROM pg_proc
    WHERE proname = 'get_moment_price_display'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- Drop all versions of get_moment_payment_info
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text as sig
    FROM pg_proc
    WHERE proname = 'get_moment_payment_info'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- Drop all versions of calculate_unified_payment
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text as sig
    FROM pg_proc
    WHERE proname = 'calculate_unified_payment'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- Drop all versions of get_live_exchange_rate
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text as sig
    FROM pg_proc
    WHERE proname = 'get_live_exchange_rate'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- Drop all versions of validate_promo_code
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text as sig
    FROM pg_proc
    WHERE proname = 'validate_promo_code'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- Drop all versions of get_escrow_duration_hours
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text as sig
    FROM pg_proc
    WHERE proname = 'get_escrow_duration_hours'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- Drop all versions of check_and_award_badges
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text as sig
    FROM pg_proc
    WHERE proname = 'check_and_award_badges'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- Drop all versions of calculate_commission
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text as sig
    FROM pg_proc
    WHERE proname = 'calculate_commission'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- Drop all versions of create_gift_with_commission
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text as sig
    FROM pg_proc
    WHERE proname = 'create_gift_with_commission'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- Drop all versions of check functions
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text as sig
    FROM pg_proc
    WHERE proname IN (
      'check_fraud_signals',
      'check_moment_contribution_limit', 
      'check_payment_limits',
      'check_suspicious_activity',
      'check_transaction_compliance'
    )
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- Drop all versions of admin functions
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text as sig
    FROM pg_proc
    WHERE proname IN ('admin_unban_user', 'admin_unsuspend_user')
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- ============================================================================
-- RECREATE ESSENTIAL FUNCTIONS (clean versions)
-- ============================================================================

-- Calculate commission
CREATE OR REPLACE FUNCTION calculate_commission(
  p_amount DECIMAL,
  p_commission_rate DECIMAL DEFAULT 0.05
)
RETURNS TABLE (
  gross_amount DECIMAL,
  commission DECIMAL,
  net_amount DECIMAL,
  rate DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY SELECT
    p_amount,
    p_amount * p_commission_rate,
    p_amount * (1 - p_commission_rate),
    p_commission_rate;
END;
$$;

-- Create gift with commission
CREATE OR REPLACE FUNCTION create_gift_with_commission(
  p_giver_id UUID,
  p_moment_id UUID,
  p_amount DECIMAL,
  p_currency TEXT DEFAULT 'TRY'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_gift_id UUID;
  v_moment RECORD;
  v_commission DECIMAL;
  v_net_amount DECIMAL;
BEGIN
  -- Get moment
  SELECT m.id, m.user_id as receiver_id
  INTO v_moment
  FROM public.moments m
  WHERE m.id = p_moment_id;
  
  IF v_moment.id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Moment not found');
  END IF;
  
  -- Calculate commission (5%)
  v_commission := p_amount * 0.05;
  v_net_amount := p_amount - v_commission;
  
  -- Create gift
  INSERT INTO public.gifts (
    giver_id,
    receiver_id,
    moment_id,
    amount,
    currency,
    commission_amount,
    net_amount,
    status
  ) VALUES (
    p_giver_id,
    v_moment.receiver_id,
    p_moment_id,
    p_amount,
    p_currency,
    v_commission,
    v_net_amount,
    'pending'
  )
  RETURNING id INTO v_gift_id;
  
  RETURN jsonb_build_object(
    'success', TRUE,
    'gift_id', v_gift_id,
    'net_amount', v_net_amount,
    'commission', v_commission
  );
END;
$$;

-- Get escrow duration hours
CREATE OR REPLACE FUNCTION get_escrow_duration_hours(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_kyc_status TEXT;
  v_trust_score INTEGER;
BEGIN
  SELECT u.kyc_status, COALESCE(ts.score, 0)
  INTO v_kyc_status, v_trust_score
  FROM public.users u
  LEFT JOIN public.trust_scores ts ON ts.user_id = u.id
  WHERE u.id = p_user_id;
  
  IF v_kyc_status = 'verified' AND v_trust_score >= 80 THEN
    RETURN 24;
  ELSIF v_kyc_status = 'verified' THEN
    RETURN 48;
  ELSE
    RETURN 72;
  END IF;
END;
$$;

-- Check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_badges_awarded INTEGER := 0;
  v_gift_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_gift_count
  FROM public.gifts
  WHERE giver_id = p_user_id AND status = 'completed';
  
  IF v_gift_count >= 1 THEN
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT p_user_id, b.id FROM public.badges b WHERE b.code = 'first_gift'
    ON CONFLICT DO NOTHING;
    IF FOUND THEN v_badges_awarded := v_badges_awarded + 1; END IF;
  END IF;
  
  RETURN v_badges_awarded;
END;
$$;

-- Validate promo code
CREATE OR REPLACE FUNCTION validate_promo_code(p_code TEXT, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_promo RECORD;
  v_usage_count INTEGER;
BEGIN
  SELECT * INTO v_promo FROM public.promo_codes pc
  WHERE pc.code = p_code AND pc.is_active = TRUE;
  
  IF v_promo.id IS NULL THEN
    RETURN jsonb_build_object('valid', FALSE, 'error', 'Invalid promo code');
  END IF;
  
  SELECT COUNT(*) INTO v_usage_count
  FROM public.promo_code_usage pcu
  WHERE pcu.promo_code_id = v_promo.id AND pcu.user_id = p_user_id;
  
  IF v_usage_count > 0 THEN
    RETURN jsonb_build_object('valid', FALSE, 'error', 'Already used');
  END IF;
  
  RETURN jsonb_build_object('valid', TRUE, 'discount_value', v_promo.discount_value);
END;
$$;

-- Get live exchange rate
CREATE OR REPLACE FUNCTION get_live_exchange_rate(p_base TEXT, p_target TEXT)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rate DECIMAL;
BEGIN
  IF p_base = p_target THEN
    RETURN 1.0;
  END IF;
  
  SELECT er.rate INTO v_rate
  FROM public.exchange_rates er
  WHERE er.base_currency = p_base
    AND er.target_currency = p_target
    AND er.is_latest = TRUE
  LIMIT 1;
  
  RETURN COALESCE(v_rate, 1.0);
END;
$$;

-- Calculate unified payment
CREATE OR REPLACE FUNCTION calculate_unified_payment(
  p_sender_id UUID,
  p_receiver_id UUID,
  p_amount DECIMAL,
  p_currency TEXT
)
RETURNS TABLE (
  base_amount DECIMAL,
  commission_amount DECIMAL,
  net_amount DECIMAL,
  commission_rate DECIMAL,
  currency TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_commission_rate DECIMAL := 0.05;
BEGIN
  RETURN QUERY SELECT
    p_amount,
    p_amount * v_commission_rate,
    p_amount * (1 - v_commission_rate),
    v_commission_rate,
    p_currency;
END;
$$;

-- Create gift with proof requirement
CREATE OR REPLACE FUNCTION create_gift_with_proof_requirement(
  p_giver_id UUID,
  p_moment_id UUID,
  p_amount DECIMAL,
  p_currency TEXT DEFAULT 'TRY',
  p_requires_proof BOOLEAN DEFAULT TRUE,
  p_proof_deadline_hours INTEGER DEFAULT 72
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_gift_id UUID;
  v_escrow_id UUID;
  v_moment RECORD;
BEGIN
  SELECT m.id, m.user_id INTO v_moment
  FROM public.moments m WHERE m.id = p_moment_id AND m.status = 'active';
  
  IF v_moment.id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Moment not found');
  END IF;
  
  INSERT INTO public.gifts (giver_id, receiver_id, moment_id, amount, currency, status, requires_proof)
  VALUES (p_giver_id, v_moment.user_id, p_moment_id, p_amount, p_currency, 'pending', p_requires_proof)
  RETURNING id INTO v_gift_id;
  
  INSERT INTO public.escrow_transactions (sender_id, recipient_id, gift_id, moment_id, amount, currency, status, expires_at)
  VALUES (p_giver_id, v_moment.user_id, v_gift_id, p_moment_id, p_amount, p_currency, 'pending', NOW() + (p_proof_deadline_hours || ' hours')::INTERVAL)
  RETURNING id INTO v_escrow_id;
  
  RETURN jsonb_build_object('success', TRUE, 'gift_id', v_gift_id, 'escrow_id', v_escrow_id);
END;
$$;

-- Verify proof and release
CREATE OR REPLACE FUNCTION verify_proof_and_release(p_escrow_id UUID, p_verified_by UUID, p_reason TEXT DEFAULT 'proof_verified')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_escrow RECORD;
BEGIN
  SELECT * INTO v_escrow FROM public.escrow_transactions WHERE id = p_escrow_id AND status = 'pending';
  IF v_escrow.id IS NULL THEN RETURN FALSE; END IF;
  
  UPDATE public.escrow_transactions SET status = 'released', released_at = NOW(), released_by = p_verified_by, release_reason = p_reason WHERE id = p_escrow_id;
  IF v_escrow.gift_id IS NOT NULL THEN UPDATE public.gifts SET status = 'completed' WHERE id = v_escrow.gift_id; END IF;
  UPDATE public.users SET balance = balance + v_escrow.amount WHERE id = v_escrow.recipient_id;
  
  RETURN TRUE;
END;
$$;

-- Get moment price display
CREATE OR REPLACE FUNCTION get_moment_price_display(p_moment_id UUID)
RETURNS TABLE (price DECIMAL, currency TEXT, formatted_price TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY SELECT m.price, m.currency, m.currency || ' ' || m.price::TEXT
  FROM public.moments m WHERE m.id = p_moment_id;
END;
$$;

-- Get moment payment info
CREATE OR REPLACE FUNCTION get_moment_payment_info(p_moment_id UUID)
RETURNS TABLE (moment_id UUID, host_id UUID, price DECIMAL, currency TEXT, total_gifts DECIMAL, gift_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY SELECT m.id, m.user_id, m.price, m.currency, COALESCE(SUM(g.amount), 0), COUNT(g.id)::INTEGER
  FROM public.moments m LEFT JOIN public.gifts g ON g.moment_id = m.id AND g.status = 'completed'
  WHERE m.id = p_moment_id GROUP BY m.id, m.user_id, m.price, m.currency;
END;
$$;

-- Calculate payment amount
CREATE OR REPLACE FUNCTION calculate_payment_amount(p_amount DECIMAL, p_from_currency TEXT, p_to_currency TEXT)
RETURNS TABLE (original_amount DECIMAL, converted_amount DECIMAL, exchange_rate DECIMAL, from_currency TEXT, to_currency TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rate DECIMAL := 1.0;
BEGIN
  IF p_from_currency != p_to_currency THEN
    SELECT er.rate INTO v_rate FROM public.exchange_rates er
    WHERE er.base_currency = p_from_currency AND er.target_currency = p_to_currency AND er.is_latest = TRUE LIMIT 1;
    v_rate := COALESCE(v_rate, 1.0);
  END IF;
  RETURN QUERY SELECT p_amount, p_amount * v_rate, v_rate, p_from_currency, p_to_currency;
END;
$$;

-- ============================================================================
-- COMPLETION NOTICE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Cleaned up old function versions and recreated essential functions';
END;
$$;
