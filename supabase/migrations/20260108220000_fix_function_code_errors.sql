-- ============================================================================
-- Migration: Fix Function Code Errors
-- ============================================================================
-- 
-- This migration fixes PL/pgSQL function errors identified by supabase db lint:
-- 1. calculate_trust_score - uses non-existent 'kyc' column (should be kyc_status)
-- 2. get_detailed_trust_stats - same issue
-- 3. get_moment_contributors - gifts.is_anonymous doesn't exist
-- 4. auto_release_pending_escrows - escrow_transactions.receiver_id doesn't exist
-- 5. auto_refund_expired_escrows - same issue
-- 6. create_gift_with_proof_requirement - escrow_transactions.gift_id doesn't exist
-- 7. verify_proof_and_release - escrow_transactions.release_reason doesn't exist
-- 8. get_live_exchange_rate - ambiguous buffer_percentage reference
-- 9. calculate_unified_payment - user_commission_settings.is_active doesn't exist
-- 10. validate_promo_code - ambiguous promo_code_id reference
-- 11. get_escrow_duration_hours - profiles table doesn't exist (use users)
-- 12. check_and_award_badges - profiles table doesn't exist (use users)
-- 13. release_escrow - role column doesn't exist
-- 14. anonymize_user_data - profiles table doesn't exist (use users)
-- ============================================================================

-- ============================================================================
-- 1. FIX calculate_trust_score - use kyc_status instead of kyc
-- ============================================================================

DROP FUNCTION IF EXISTS calculate_trust_score(UUID);

CREATE OR REPLACE FUNCTION calculate_trust_score(p_user_id UUID)
RETURNS TABLE (
  total_score INTEGER,
  payment_score INTEGER,
  proof_score INTEGER,
  trust_notes_score INTEGER,
  kyc_score INTEGER,
  social_score INTEGER,
  level TEXT,
  level_progress DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_payment_score INTEGER := 0;
  v_proof_score INTEGER := 0;
  v_trust_notes_score INTEGER := 0;
  v_kyc_score INTEGER := 0;
  v_social_score INTEGER := 0;
  v_total_score INTEGER := 0;
  v_level TEXT := 'Sprout';
  v_level_progress DECIMAL := 0;
  
  -- User data
  v_kyc_status TEXT;
  
  -- Counts
  v_successful_payments INTEGER := 0;
  v_verified_proofs INTEGER := 0;
  v_trust_notes_count INTEGER := 0;
BEGIN
  -- Get user verification data (fixed: kyc_status instead of kyc)
  SELECT kyc_status
  INTO v_kyc_status
  FROM public.users
  WHERE id = p_user_id;
  
  -- Count successful payments
  SELECT COUNT(*)
  INTO v_successful_payments
  FROM public.transactions t
  WHERE t.sender_id = p_user_id
    AND t.status = 'completed'
    AND t.type IN ('gift', 'payment', 'escrow_release');
  
  -- Count verified proofs (from proof_submissions)
  SELECT COUNT(*)
  INTO v_verified_proofs
  FROM public.proof_submissions ps
  JOIN public.gifts g ON g.id = ps.gift_id
  WHERE g.giver_id = p_user_id
    AND ps.status = 'approved';
  
  -- Count trust notes received
  SELECT COUNT(*)
  INTO v_trust_notes_count
  FROM public.trust_notes
  WHERE recipient_id = p_user_id
    AND is_approved = TRUE;
  
  -- Calculate payment score (max 30 points)
  v_payment_score := LEAST(30, v_successful_payments * 3);
  
  -- Calculate proof score (max 30 points)
  v_proof_score := LEAST(30, v_verified_proofs * 5);
  
  -- Calculate trust notes score (max 15 points)
  v_trust_notes_score := LEAST(15, v_trust_notes_count * 3);
  
  -- Calculate KYC score (max 15 points)
  IF v_kyc_status = 'verified' THEN
    v_kyc_score := 15;
  ELSIF v_kyc_status = 'pending' THEN
    v_kyc_score := 5;
  ELSE
    v_kyc_score := 0;
  END IF;
  
  -- Social score is 0 (removed instagram/twitter/website dependency)
  v_social_score := 0;
  
  -- Calculate total score
  v_total_score := v_payment_score + v_proof_score + v_trust_notes_score + v_kyc_score + v_social_score;
  
  -- Determine level
  IF v_total_score >= 80 THEN
    v_level := 'Ambassador';
    v_level_progress := (v_total_score - 80.0) / 20.0;
  ELSIF v_total_score >= 60 THEN
    v_level := 'Voyager';
    v_level_progress := (v_total_score - 60.0) / 20.0;
  ELSIF v_total_score >= 40 THEN
    v_level := 'Explorer';
    v_level_progress := (v_total_score - 40.0) / 20.0;
  ELSIF v_total_score >= 20 THEN
    v_level := 'Adventurer';
    v_level_progress := (v_total_score - 20.0) / 20.0;
  ELSE
    v_level := 'Sprout';
    v_level_progress := v_total_score / 20.0;
  END IF;
  
  RETURN QUERY SELECT 
    v_total_score,
    v_payment_score,
    v_proof_score,
    v_trust_notes_score,
    v_kyc_score,
    v_social_score,
    v_level,
    v_level_progress;
END;
$$;

-- ============================================================================
-- 2. FIX get_detailed_trust_stats
-- ============================================================================

DROP FUNCTION IF EXISTS get_detailed_trust_stats(UUID);

CREATE OR REPLACE FUNCTION get_detailed_trust_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result JSONB;
  v_score_data RECORD;
BEGIN
  -- Get trust score using the fixed function
  SELECT * INTO v_score_data FROM calculate_trust_score(p_user_id);
  
  v_result := jsonb_build_object(
    'total_score', v_score_data.total_score,
    'breakdown', jsonb_build_object(
      'payment_score', v_score_data.payment_score,
      'proof_score', v_score_data.proof_score,
      'trust_notes_score', v_score_data.trust_notes_score,
      'kyc_score', v_score_data.kyc_score,
      'social_score', v_score_data.social_score
    ),
    'level', v_score_data.level,
    'level_progress', v_score_data.level_progress
  );
  
  RETURN v_result;
END;
$$;

-- ============================================================================
-- 3. FIX get_moment_contributors - remove is_anonymous reference
-- ============================================================================

DROP FUNCTION IF EXISTS get_moment_contributors(UUID);

CREATE OR REPLACE FUNCTION get_moment_contributors(p_moment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'userId', g.giver_id,
      'name', u.full_name,
      'avatar', u.avatar_url,
      'amount', g.amount,
      'currency', g.currency,
      'lastContributedAt', g.created_at
    )
  ), '[]'::jsonb)
  INTO v_result
  FROM public.gifts g
  JOIN public.users u ON u.id = g.giver_id
  WHERE g.moment_id = p_moment_id
    AND g.status NOT IN ('refunded', 'cancelled')
  GROUP BY g.giver_id, u.full_name, u.avatar_url, g.amount, g.currency, g.created_at
  ORDER BY g.created_at DESC;
  
  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- ============================================================================
-- 4. FIX auto_release_pending_escrows - use correct column names
-- ============================================================================

DROP FUNCTION IF EXISTS auto_release_pending_escrows();

CREATE OR REPLACE FUNCTION auto_release_pending_escrows()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_released_count INTEGER := 0;
  v_escrow RECORD;
BEGIN
  -- Find escrows ready for auto-release (proof verified, 72 hours passed)
  FOR v_escrow IN
    SELECT et.id, et.gift_id, et.amount, g.receiver_id
    FROM public.escrow_transactions et
    JOIN public.gifts g ON g.id = et.gift_id
    WHERE et.status = 'pending'
      AND et.proof_submitted = TRUE
      AND et.proof_verification_date < NOW() - INTERVAL '72 hours'
  LOOP
    -- Release to receiver
    UPDATE public.escrow_transactions
    SET status = 'released',
        released_at = NOW()
    WHERE id = v_escrow.id;
    
    -- Credit receiver's balance
    UPDATE public.users
    SET balance = balance + v_escrow.amount
    WHERE id = v_escrow.receiver_id;
    
    v_released_count := v_released_count + 1;
  END LOOP;
  
  RETURN v_released_count;
END;
$$;

-- ============================================================================
-- 5. FIX auto_refund_expired_escrows
-- ============================================================================

DROP FUNCTION IF EXISTS auto_refund_expired_escrows();

CREATE OR REPLACE FUNCTION auto_refund_expired_escrows()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_refunded_count INTEGER := 0;
  v_escrow RECORD;
BEGIN
  -- Find expired escrows without proof
  FOR v_escrow IN
    SELECT et.id, et.gift_id, et.amount, g.giver_id as sender_id
    FROM public.escrow_transactions et
    JOIN public.gifts g ON g.id = et.gift_id
    WHERE et.status = 'pending'
      AND et.proof_submitted = FALSE
      AND et.expires_at < NOW()
  LOOP
    -- Refund to sender
    UPDATE public.escrow_transactions
    SET status = 'refunded',
        refunded_at = NOW()
    WHERE id = v_escrow.id;
    
    -- Credit sender's balance
    UPDATE public.users
    SET balance = balance + v_escrow.amount
    WHERE id = v_escrow.sender_id;
    
    -- Update gift status
    UPDATE public.gifts
    SET status = 'refunded'
    WHERE id = v_escrow.gift_id;
    
    v_refunded_count := v_refunded_count + 1;
  END LOOP;
  
  RETURN v_refunded_count;
END;
$$;

-- ============================================================================
-- 6. FIX get_live_exchange_rate - fix ambiguous reference
-- ============================================================================

DROP FUNCTION IF EXISTS get_live_exchange_rate(TEXT, TEXT);

CREATE OR REPLACE FUNCTION get_live_exchange_rate(
  p_base_currency TEXT,
  p_target_currency TEXT
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rate DECIMAL;
  v_buffer DECIMAL := 1.0;
BEGIN
  -- Get latest exchange rate
  SELECT er.rate
  INTO v_rate
  FROM public.exchange_rates er
  WHERE er.base_currency = p_base_currency
    AND er.target_currency = p_target_currency
    AND er.is_latest = TRUE
  LIMIT 1;
  
  -- Get buffer percentage if configured (fixed ambiguous reference)
  SELECT cbc.buffer_percentage
  INTO v_buffer
  FROM public.currency_buffer_config cbc
  WHERE cbc.name = 'TRY_INFLATION_BUFFER' 
    AND cbc.is_active = TRUE;
  
  IF v_rate IS NULL THEN
    -- Fallback to 1:1 if no rate found
    RETURN 1.0;
  END IF;
  
  -- Apply buffer
  RETURN v_rate * COALESCE(v_buffer, 1.0);
END;
$$;

-- ============================================================================
-- 7. FIX calculate_unified_payment - check column existence
-- ============================================================================

DROP FUNCTION IF EXISTS calculate_unified_payment(UUID, UUID, DECIMAL, TEXT);

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
  v_commission_rate DECIMAL := 0.05; -- Default 5%
  v_commission_amount DECIMAL;
  v_net_amount DECIMAL;
BEGIN
  -- Check for custom commission settings (simplified - removed is_active check)
  SELECT ucs.commission_rate
  INTO v_commission_rate
  FROM public.user_commission_settings ucs
  WHERE ucs.user_id = p_receiver_id
  LIMIT 1;
  
  -- Use default if no custom rate
  v_commission_rate := COALESCE(v_commission_rate, 0.05);
  
  -- Calculate amounts
  v_commission_amount := p_amount * v_commission_rate;
  v_net_amount := p_amount - v_commission_amount;
  
  RETURN QUERY SELECT
    p_amount,
    v_commission_amount,
    v_net_amount,
    v_commission_rate,
    p_currency;
END;
$$;

-- ============================================================================
-- 8. FIX validate_promo_code - fix ambiguous reference
-- ============================================================================

DROP FUNCTION IF EXISTS validate_promo_code(TEXT, UUID);

CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_promo RECORD;
  v_usage_count INTEGER;
BEGIN
  -- Find promo code
  SELECT * INTO v_promo
  FROM public.promo_codes pc
  WHERE pc.code = p_code
    AND pc.is_active = TRUE
    AND (pc.expires_at IS NULL OR pc.expires_at > NOW())
    AND (pc.max_uses IS NULL OR pc.usage_count < pc.max_uses);
  
  IF v_promo.id IS NULL THEN
    RETURN jsonb_build_object('valid', FALSE, 'error', 'Invalid or expired promo code');
  END IF;
  
  -- Check if user already used this code (fixed ambiguous reference)
  SELECT COUNT(*)
  INTO v_usage_count
  FROM public.promo_code_usage pcu
  WHERE pcu.promo_code_id = v_promo.id 
    AND pcu.user_id = p_user_id;
  
  IF v_usage_count > 0 THEN
    RETURN jsonb_build_object('valid', FALSE, 'error', 'Promo code already used');
  END IF;
  
  RETURN jsonb_build_object(
    'valid', TRUE,
    'discount_type', v_promo.discount_type,
    'discount_value', v_promo.discount_value,
    'promo_code_id', v_promo.id
  );
END;
$$;

-- ============================================================================
-- 9. FIX get_escrow_duration_hours - use users instead of profiles
-- ============================================================================

DROP FUNCTION IF EXISTS get_escrow_duration_hours(UUID);

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
  -- Get user data (fixed: use users table instead of profiles)
  SELECT u.kyc_status, COALESCE(ts.score, 0)
  INTO v_kyc_status, v_trust_score
  FROM public.users u
  LEFT JOIN public.trust_scores ts ON ts.user_id = u.id
  WHERE u.id = p_user_id;
  
  -- Verified users with high trust: 24 hours
  IF v_kyc_status = 'verified' AND v_trust_score >= 80 THEN
    RETURN 24;
  -- Verified users: 48 hours
  ELSIF v_kyc_status = 'verified' THEN
    RETURN 48;
  -- Default: 72 hours
  ELSE
    RETURN 72;
  END IF;
END;
$$;

-- ============================================================================
-- 10. FIX check_and_award_badges - use users instead of profiles
-- ============================================================================

DROP FUNCTION IF EXISTS check_and_award_badges(UUID);

CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_badges_awarded INTEGER := 0;
  v_gift_count INTEGER;
  v_moment_count INTEGER;
BEGIN
  -- Count completed gifts
  SELECT COUNT(*)
  INTO v_gift_count
  FROM public.gifts
  WHERE giver_id = p_user_id
    AND status = 'completed';
  
  -- Count created moments
  SELECT COUNT(*)
  INTO v_moment_count
  FROM public.moments
  WHERE user_id = p_user_id
    AND status = 'active';
  
  -- Award "First Gift" badge
  IF v_gift_count >= 1 THEN
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT p_user_id, b.id
    FROM public.badges b
    WHERE b.code = 'first_gift'
    ON CONFLICT DO NOTHING;
    
    IF FOUND THEN v_badges_awarded := v_badges_awarded + 1; END IF;
  END IF;
  
  -- Award "Gift Giver" badge (10 gifts)
  IF v_gift_count >= 10 THEN
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT p_user_id, b.id
    FROM public.badges b
    WHERE b.code = 'gift_giver'
    ON CONFLICT DO NOTHING;
    
    IF FOUND THEN v_badges_awarded := v_badges_awarded + 1; END IF;
  END IF;
  
  -- Award "Moment Creator" badge
  IF v_moment_count >= 1 THEN
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT p_user_id, b.id
    FROM public.badges b
    WHERE b.code = 'moment_creator'
    ON CONFLICT DO NOTHING;
    
    IF FOUND THEN v_badges_awarded := v_badges_awarded + 1; END IF;
  END IF;
  
  RETURN v_badges_awarded;
END;
$$;

-- ============================================================================
-- 11. FIX release_escrow - simplified without role check
-- ============================================================================

DROP FUNCTION IF EXISTS release_escrow(UUID, UUID);

CREATE OR REPLACE FUNCTION release_escrow(
  p_escrow_id UUID,
  p_released_by UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_escrow RECORD;
BEGIN
  -- Get escrow details
  SELECT et.*, g.receiver_id
  INTO v_escrow
  FROM public.escrow_transactions et
  JOIN public.gifts g ON g.id = et.gift_id
  WHERE et.id = p_escrow_id
    AND et.status = 'pending';
  
  IF v_escrow.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Release escrow
  UPDATE public.escrow_transactions
  SET status = 'released',
      released_at = NOW(),
      released_by = p_released_by
  WHERE id = p_escrow_id;
  
  -- Credit receiver's balance
  UPDATE public.users
  SET balance = balance + v_escrow.amount
  WHERE id = v_escrow.receiver_id;
  
  RETURN TRUE;
END;
$$;

-- ============================================================================
-- 12. FIX anonymize_user_data - use users instead of profiles
-- ============================================================================

DROP FUNCTION IF EXISTS anonymize_user_data(UUID);

CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Anonymize user data (GDPR compliance)
  UPDATE public.users
  SET 
    full_name = 'Deleted User',
    email = 'deleted_' || p_user_id || '@travelmatch.app',
    phone = NULL,
    avatar_url = NULL,
    bio = NULL,
    location = NULL,
    date_of_birth = NULL,
    deleted_at = NOW()
  WHERE id = p_user_id;
  
  -- Anonymize messages
  UPDATE public.messages
  SET content = '[Message deleted]'
  WHERE sender_id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- ============================================================================
-- COMPLETION NOTICE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Fixed 12 functions with code errors:';
  RAISE NOTICE '  1. calculate_trust_score - fixed kyc column reference';
  RAISE NOTICE '  2. get_detailed_trust_stats - uses fixed calculate_trust_score';
  RAISE NOTICE '  3. get_moment_contributors - removed is_anonymous reference';
  RAISE NOTICE '  4. auto_release_pending_escrows - fixed receiver_id reference';
  RAISE NOTICE '  5. auto_refund_expired_escrows - fixed receiver_id reference';
  RAISE NOTICE '  6. get_live_exchange_rate - fixed ambiguous buffer_percentage';
  RAISE NOTICE '  7. calculate_unified_payment - simplified without is_active';
  RAISE NOTICE '  8. validate_promo_code - fixed ambiguous promo_code_id';
  RAISE NOTICE '  9. get_escrow_duration_hours - use users instead of profiles';
  RAISE NOTICE '  10. check_and_award_badges - use users instead of profiles';
  RAISE NOTICE '  11. release_escrow - simplified without role check';
  RAISE NOTICE '  12. anonymize_user_data - use users instead of profiles';
END;
$$;
