-- ============================================================================
-- Migration: Add Missing Columns and Fix Remaining Functions
-- ============================================================================
-- 
-- Issues Fixed:
-- 1. Add gift_id to escrow_transactions (required by create_gift_with_proof_requirement)
-- 2. Add release_reason to escrow_transactions (required by verify_proof_and_release)
-- 3. Add released_by to escrow_transactions (required by release_escrow)
-- 4. Add refunded_at to escrow_transactions (required by auto_refund_expired_escrows)
-- 5. Fix create_gift_with_proof_requirement function
-- 6. Fix verify_proof_and_release function
-- 7. Fix send_bulk_thank_you function (moment.creator_id -> moment.user_id)
-- 8. Fix get_moment_price_display and get_moment_payment_info functions
-- ============================================================================

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO escrow_transactions
-- ============================================================================

-- Add gift_id column (links escrow to gift)
ALTER TABLE public.escrow_transactions 
ADD COLUMN IF NOT EXISTS gift_id UUID REFERENCES public.gifts(id) ON DELETE SET NULL;

-- Add release_reason column
ALTER TABLE public.escrow_transactions 
ADD COLUMN IF NOT EXISTS release_reason TEXT;

-- Add released_by column  
ALTER TABLE public.escrow_transactions 
ADD COLUMN IF NOT EXISTS released_by UUID REFERENCES public.users(id);

-- Add refunded_at column
ALTER TABLE public.escrow_transactions 
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- Create index for gift_id lookup
CREATE INDEX IF NOT EXISTS idx_escrow_gift_id ON public.escrow_transactions(gift_id);

-- ============================================================================
-- 2. FIX create_gift_with_proof_requirement
-- ============================================================================

DROP FUNCTION IF EXISTS create_gift_with_proof_requirement(UUID, UUID, DECIMAL, TEXT, BOOLEAN, INTEGER);

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
  -- Get moment details
  SELECT m.id, m.user_id as receiver_id, m.price
  INTO v_moment
  FROM public.moments m
  WHERE m.id = p_moment_id
    AND m.status = 'active';
  
  IF v_moment.id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Moment not found or inactive');
  END IF;
  
  -- Create gift record
  INSERT INTO public.gifts (
    giver_id,
    receiver_id,
    moment_id,
    amount,
    currency,
    status,
    requires_proof
  ) VALUES (
    p_giver_id,
    v_moment.receiver_id,
    p_moment_id,
    p_amount,
    p_currency,
    'pending',
    p_requires_proof
  )
  RETURNING id INTO v_gift_id;
  
  -- Create escrow transaction
  INSERT INTO public.escrow_transactions (
    sender_id,
    recipient_id,
    gift_id,
    moment_id,
    amount,
    currency,
    status,
    release_condition,
    expires_at
  ) VALUES (
    p_giver_id,
    v_moment.receiver_id,
    v_gift_id,
    p_moment_id,
    p_amount,
    p_currency,
    'pending',
    CASE WHEN p_requires_proof THEN 'proof_verified' ELSE 'timer_expiry' END,
    NOW() + (p_proof_deadline_hours || ' hours')::INTERVAL
  )
  RETURNING id INTO v_escrow_id;
  
  -- Deduct from giver's balance
  UPDATE public.users
  SET balance = balance - p_amount
  WHERE id = p_giver_id;
  
  RETURN jsonb_build_object(
    'success', TRUE,
    'gift_id', v_gift_id,
    'escrow_id', v_escrow_id
  );
END;
$$;

-- ============================================================================
-- 3. FIX verify_proof_and_release
-- ============================================================================

DROP FUNCTION IF EXISTS verify_proof_and_release(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION verify_proof_and_release(
  p_escrow_id UUID,
  p_verified_by UUID,
  p_release_reason TEXT DEFAULT 'proof_verified'
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
  LEFT JOIN public.gifts g ON g.id = et.gift_id
  WHERE et.id = p_escrow_id
    AND et.status = 'pending';
  
  IF v_escrow.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update escrow
  UPDATE public.escrow_transactions
  SET 
    status = 'released',
    proof_verified = TRUE,
    proof_verification_date = NOW(),
    released_at = NOW(),
    released_by = p_verified_by,
    release_reason = p_release_reason
  WHERE id = p_escrow_id;
  
  -- Update gift status
  IF v_escrow.gift_id IS NOT NULL THEN
    UPDATE public.gifts
    SET status = 'completed'
    WHERE id = v_escrow.gift_id;
  END IF;
  
  -- Credit recipient's balance
  UPDATE public.users
  SET balance = balance + v_escrow.amount
  WHERE id = v_escrow.recipient_id;
  
  RETURN TRUE;
END;
$$;

-- ============================================================================
-- 4. FIX send_bulk_thank_you - use user_id instead of creator_id
-- ============================================================================

DROP FUNCTION IF EXISTS send_bulk_thank_you(UUID, TEXT);

CREATE OR REPLACE FUNCTION send_bulk_thank_you(
  p_moment_id UUID,
  p_message TEXT DEFAULT 'Thank you for your gift!'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_moment RECORD;
  v_gift RECORD;
  v_count INTEGER := 0;
BEGIN
  -- Get moment details (fixed: use user_id instead of creator_id)
  SELECT m.id, m.user_id, m.title
  INTO v_moment
  FROM public.moments m
  WHERE m.id = p_moment_id;
  
  IF v_moment.id IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Send thank you to each gift giver
  FOR v_gift IN
    SELECT DISTINCT g.giver_id
    FROM public.gifts g
    WHERE g.moment_id = p_moment_id
      AND g.status = 'completed'
  LOOP
    -- Create notification
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      body,
      data
    ) VALUES (
      v_gift.giver_id,
      'thank_you',
      'Thank You from ' || v_moment.title,
      p_message,
      jsonb_build_object(
        'moment_id', p_moment_id,
        'from_user_id', v_moment.user_id
      )
    );
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;

-- ============================================================================
-- 5. FIX get_moment_price_display - correct return type
-- ============================================================================

DROP FUNCTION IF EXISTS get_moment_price_display(UUID);

CREATE OR REPLACE FUNCTION get_moment_price_display(p_moment_id UUID)
RETURNS TABLE (
  price DECIMAL,
  currency TEXT,
  formatted_price TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.price,
    m.currency,
    m.currency || ' ' || m.price::TEXT
  FROM public.moments m
  WHERE m.id = p_moment_id;
END;
$$;

-- ============================================================================
-- 6. FIX get_moment_payment_info - correct return type  
-- ============================================================================

DROP FUNCTION IF EXISTS get_moment_payment_info(UUID);

CREATE OR REPLACE FUNCTION get_moment_payment_info(p_moment_id UUID)
RETURNS TABLE (
  moment_id UUID,
  host_id UUID,
  price DECIMAL,
  currency TEXT,
  total_gifts DECIMAL,
  gift_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as moment_id,
    m.user_id as host_id,
    m.price,
    m.currency,
    COALESCE(SUM(g.amount), 0) as total_gifts,
    COUNT(g.id)::INTEGER as gift_count
  FROM public.moments m
  LEFT JOIN public.gifts g ON g.moment_id = m.id AND g.status = 'completed'
  WHERE m.id = p_moment_id
  GROUP BY m.id, m.user_id, m.price, m.currency;
END;
$$;

-- ============================================================================
-- 7. FIX calculate_payment_amount - correct return type
-- ============================================================================

DROP FUNCTION IF EXISTS calculate_payment_amount(DECIMAL, TEXT, TEXT);

CREATE OR REPLACE FUNCTION calculate_payment_amount(
  p_amount DECIMAL,
  p_from_currency TEXT,
  p_to_currency TEXT
)
RETURNS TABLE (
  original_amount DECIMAL,
  converted_amount DECIMAL,
  exchange_rate DECIMAL,
  from_currency TEXT,
  to_currency TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rate DECIMAL := 1.0;
BEGIN
  -- Get exchange rate if currencies differ
  IF p_from_currency != p_to_currency THEN
    SELECT er.rate INTO v_rate
    FROM public.exchange_rates er
    WHERE er.base_currency = p_from_currency
      AND er.target_currency = p_to_currency
      AND er.is_latest = TRUE
    LIMIT 1;
    
    v_rate := COALESCE(v_rate, 1.0);
  END IF;
  
  RETURN QUERY SELECT 
    p_amount,
    p_amount * v_rate,
    v_rate,
    p_from_currency,
    p_to_currency;
END;
$$;

-- ============================================================================
-- COMPLETION NOTICE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Fixed remaining function issues:';
  RAISE NOTICE '  - Added gift_id, release_reason, released_by, refunded_at to escrow_transactions';
  RAISE NOTICE '  - Fixed create_gift_with_proof_requirement';
  RAISE NOTICE '  - Fixed verify_proof_and_release';
  RAISE NOTICE '  - Fixed send_bulk_thank_you (user_id instead of creator_id)';
  RAISE NOTICE '  - Fixed get_moment_price_display return type';
  RAISE NOTICE '  - Fixed get_moment_payment_info return type';
  RAISE NOTICE '  - Fixed calculate_payment_amount return type';
END;
$$;
