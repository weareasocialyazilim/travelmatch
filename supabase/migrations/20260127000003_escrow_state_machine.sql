-- ============================================================================
-- Escrow State Machine v2 (FIXED)
-- ============================================================================
-- Note: Fixed function name conflicts by dropping old versions first

-- 1. Add processing tracking columns to escrow_transactions
ALTER TABLE escrow_transactions ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ;
ALTER TABLE escrow_transactions ADD COLUMN IF NOT EXISTS release_attempted_at TIMESTAMPTZ;
ALTER TABLE escrow_transactions ADD COLUMN IF NOT EXISTS last_error TEXT;

-- 2. Drop old escrow functions to avoid conflicts
DROP FUNCTION IF EXISTS release_escrow(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS release_escrow(UUID) CASCADE;
DROP FUNCTION IF EXISTS refund_escrow(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS refund_escrow(UUID) CASCADE;

-- 3. Create release_escrow function
CREATE OR REPLACE FUNCTION release_escrow(
  p_escrow_id UUID,
  p_verified_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'pg_catalog', 'public'
AS $$
DECLARE
  v_escrow RECORD;
  v_coin_amount NUMERIC(20,2);
BEGIN
  SELECT * INTO v_escrow FROM escrow_transactions WHERE id = p_escrow_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Escrow not found');
  END IF;

  IF v_escrow.status = 'released' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already released', 'released_at', v_escrow.released_at);
  END IF;

  IF v_escrow.status != 'pending' AND v_escrow.status != 'processing' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid state: ' || v_escrow.status);
  END IF;

  v_coin_amount := v_escrow.amount * 100;

  -- Insert coin transaction
  INSERT INTO coin_transactions (reference_id, sender_id, recipient_id, amount, currency, type, status, metadata)
  VALUES (p_escrow_id, v_escrow.sender_id, v_escrow.recipient_id, v_coin_amount, 'LVND', 'escrow_release', 'completed',
          jsonb_build_object('senderId', v_escrow.sender_id, 'verifiedBy', p_verified_by))

  -- Update escrow
  UPDATE escrow_transactions SET status = 'released', released_at = NOW(), released_by = p_verified_by
  WHERE id = p_escrow_id;

  RETURN jsonb_build_object('success', true, 'released_amount', v_coin_amount);
END;
$$;

-- 4. Create refund_escrow function
CREATE OR REPLACE FUNCTION refund_escrow(p_escrow_id UUID, p_reason TEXT DEFAULT 'user_request')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'pg_catalog', 'public'
AS $$
DECLARE v_escrow RECORD; v_coin_amount NUMERIC(20,2);
BEGIN
  SELECT * INTO v_escrow FROM escrow_transactions WHERE id = p_escrow_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Escrow not found'); END IF;
  IF v_escrow.status != 'pending' THEN RETURN jsonb_build_object('success', false, 'error', 'Cannot refund'); END IF;
  v_coin_amount := v_escrow.amount * 100;
  INSERT INTO coin_transactions (reference_id, sender_id, recipient_id, amount, currency, type, status, metadata)
  VALUES (p_escrow_id, v_escrow.sender_id, v_escrow.sender_id, v_coin_amount, 'LVND', 'refund', 'completed',
          jsonb_build_object('reason', p_reason));
  UPDATE escrow_transactions SET status = 'refunded', refunded_at = NOW(), refund_reason = p_reason WHERE id = p_escrow_id;
  RETURN jsonb_build_object('success', true, 'refund_amount', v_coin_amount);
END;
$$;

-- 5. Create create_escrow_transaction function
DROP FUNCTION IF EXISTS create_escrow_transaction(UUID, UUID, UUID, NUMERIC, TEXT, JSONB) CASCADE;
CREATE OR REPLACE FUNCTION create_escrow_transaction(
  p_sender_id UUID, p_recipient_id UUID, p_moment_id UUID, p_amount NUMERIC,
  p_release_condition TEXT DEFAULT 'completed', p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'pg_catalog', 'public'
AS $$
DECLARE v_escrow_id UUID; v_coin_amount NUMERIC(20,2);
BEGIN
  v_coin_amount := p_amount * 100;
  INSERT INTO coin_transactions (reference_id, sender_id, recipient_id, amount, currency, type, status, metadata)
  VALUES (p_moment_id, p_sender_id, p_recipient_id, -v_coin_amount, 'LVND', 'escrow_lock', 'completed',
          jsonb_build_object('recipientId', p_recipient_id, 'releaseCondition', p_release_condition));
  INSERT INTO escrow_transactions (sender_id, recipient_id, moment_id, amount, currency, status, release_condition, metadata)
  VALUES (p_sender_id, p_recipient_id, p_moment_id, p_amount, 'TRY', 'pending', p_release_condition, p_metadata)
  RETURNING id INTO v_escrow_id;
  RETURN jsonb_build_object('success', true, 'escrow_id', v_escrow_id, 'coin_amount', v_coin_amount);
END;
$$;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION release_escrow TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION refund_escrow TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_escrow_transaction TO authenticated, service_role;

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Escrow state machine v2 applied';
  RAISE NOTICE '- release_escrow function created';
  RAISE NOTICE '- refund_escrow function created';
  RAISE NOTICE '- create_escrow_transaction function created';
  RAISE NOTICE '============================================';
END $$;
