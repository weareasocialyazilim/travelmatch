-- ============================================
-- Payment & Escrow Audit Fixes
-- Migration: 20251230000000_audit_payment_fixes.sql
-- ============================================
-- Addresses findings from payment audit:
-- 1. Add partial refund support
-- 2. Add dispute state transitions
-- 3. Add service fee retention option
-- ============================================

-- ============================================
-- 1. ADD PARTIAL REFUND COLUMNS
-- ============================================

-- Add columns for tracking partial refunds
ALTER TABLE escrow_transactions
ADD COLUMN IF NOT EXISTS refunded_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_fee_retained DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- Create index for refund tracking
CREATE INDEX IF NOT EXISTS idx_escrow_refunded
ON escrow_transactions(status, refunded_at)
WHERE status = 'refunded';

-- ============================================
-- 2. PARTIAL REFUND FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION partial_refund_escrow(
  p_escrow_id UUID,
  p_refund_amount DECIMAL DEFAULT NULL, -- NULL = full refund
  p_service_fee DECIMAL DEFAULT 0,      -- Amount to retain as service fee
  p_reason TEXT DEFAULT 'user_request'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_escrow RECORD;
  v_actual_refund DECIMAL;
  v_txn_id UUID;
BEGIN
  -- Get and lock escrow
  SELECT * INTO STRICT v_escrow
  FROM escrow_transactions
  WHERE id = p_escrow_id
  FOR UPDATE;

  -- Validation: Only pending escrow can be refunded
  IF v_escrow.status NOT IN ('pending', 'disputed') THEN
    RAISE EXCEPTION 'Can only refund pending or disputed escrow, current status: %', v_escrow.status;
  END IF;

  -- Calculate refund amount
  IF p_refund_amount IS NULL THEN
    -- Full refund minus service fee
    v_actual_refund := v_escrow.amount - COALESCE(v_escrow.refunded_amount, 0) - p_service_fee;
  ELSE
    -- Partial refund
    v_actual_refund := LEAST(
      p_refund_amount,
      v_escrow.amount - COALESCE(v_escrow.refunded_amount, 0) - p_service_fee
    );
  END IF;

  -- Validate refund amount
  IF v_actual_refund <= 0 THEN
    RAISE EXCEPTION 'Invalid refund amount: % (escrow: %, already refunded: %, fee: %)',
      v_actual_refund, v_escrow.amount, v_escrow.refunded_amount, p_service_fee;
  END IF;

  -- Refund to sender
  UPDATE users
  SET balance = balance + v_actual_refund
  WHERE id = v_escrow.sender_id;

  -- Update escrow record
  UPDATE escrow_transactions
  SET
    refunded_amount = COALESCE(refunded_amount, 0) + v_actual_refund,
    service_fee_retained = COALESCE(service_fee_retained, 0) + p_service_fee,
    refund_reason = p_reason,
    refunded_at = NOW(),
    status = CASE
      WHEN (COALESCE(refunded_amount, 0) + v_actual_refund + COALESCE(service_fee_retained, 0) + p_service_fee) >= amount
      THEN 'refunded'
      ELSE 'pending' -- Partial refund keeps it pending
    END,
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'refund_history', COALESCE(metadata->'refund_history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'amount', v_actual_refund,
          'service_fee', p_service_fee,
          'reason', p_reason,
          'timestamp', NOW()
        )
      )
    )
  WHERE id = p_escrow_id;

  -- Log refund transaction
  INSERT INTO transactions (
    user_id, type, amount, status,
    description, moment_id, metadata
  )
  VALUES (
    v_escrow.sender_id,
    CASE WHEN p_refund_amount IS NOT NULL THEN 'partial_refund' ELSE 'escrow_refund' END,
    v_actual_refund,
    'completed',
    CASE
      WHEN p_refund_amount IS NOT NULL THEN 'Partial escrow refund: ' || p_reason
      ELSE 'Full escrow refund: ' || p_reason
    END,
    v_escrow.moment_id,
    jsonb_build_object(
      'escrow_id', p_escrow_id,
      'reason', p_reason,
      'service_fee', p_service_fee,
      'is_partial', p_refund_amount IS NOT NULL
    )
  )
  RETURNING id INTO v_txn_id;

  RETURN jsonb_build_object(
    'success', true,
    'escrow_id', p_escrow_id,
    'refund_amount', v_actual_refund,
    'service_fee_retained', p_service_fee,
    'total_refunded', COALESCE(v_escrow.refunded_amount, 0) + v_actual_refund,
    'remaining_amount', v_escrow.amount - COALESCE(v_escrow.refunded_amount, 0) - v_actual_refund - p_service_fee,
    'status', CASE
      WHEN (COALESCE(v_escrow.refunded_amount, 0) + v_actual_refund + p_service_fee) >= v_escrow.amount
      THEN 'refunded'
      ELSE 'partially_refunded'
    END,
    'transaction_id', v_txn_id
  );
END;
$$;

COMMENT ON FUNCTION partial_refund_escrow IS 'Performs partial or full refund of escrow with optional service fee retention';

-- ============================================
-- 3. DISPUTE FLOW FUNCTIONS
-- ============================================

-- Open a dispute
CREATE OR REPLACE FUNCTION open_escrow_dispute(
  p_escrow_id UUID,
  p_disputant_id UUID,
  p_reason TEXT,
  p_evidence JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_escrow RECORD;
BEGIN
  -- Get and lock escrow
  SELECT * INTO STRICT v_escrow
  FROM escrow_transactions
  WHERE id = p_escrow_id
  FOR UPDATE;

  -- Validation: Only pending escrow can be disputed
  IF v_escrow.status != 'pending' THEN
    RAISE EXCEPTION 'Can only dispute pending escrow, current status: %', v_escrow.status;
  END IF;

  -- Validate disputant is a party to the escrow
  IF p_disputant_id NOT IN (v_escrow.sender_id, v_escrow.recipient_id) THEN
    RAISE EXCEPTION 'User is not a party to this escrow';
  END IF;

  -- Update escrow to disputed
  UPDATE escrow_transactions
  SET
    status = 'disputed',
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'dispute', jsonb_build_object(
        'opened_by', p_disputant_id,
        'opened_at', NOW(),
        'reason', p_reason,
        'evidence', p_evidence,
        'status', 'open'
      )
    )
  WHERE id = p_escrow_id;

  -- Log dispute
  INSERT INTO audit_logs (
    user_id,
    action,
    ip_address,
    metadata
  ) VALUES (
    p_disputant_id,
    'escrow_dispute_opened',
    'system',
    jsonb_build_object(
      'escrow_id', p_escrow_id,
      'reason', p_reason,
      'amount', v_escrow.amount
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'escrow_id', p_escrow_id,
    'status', 'disputed',
    'message', 'Dispute opened successfully'
  );
END;
$$;

COMMENT ON FUNCTION open_escrow_dispute IS 'Opens a dispute for a pending escrow transaction';

-- Resolve a dispute (admin function)
CREATE OR REPLACE FUNCTION resolve_escrow_dispute(
  p_admin_id UUID,
  p_escrow_id UUID,
  p_resolution TEXT, -- 'release_to_recipient', 'refund_to_sender', 'split'
  p_sender_amount DECIMAL DEFAULT NULL, -- For split resolution
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_escrow RECORD;
  v_recipient_amount DECIMAL;
BEGIN
  -- Get and lock escrow
  SELECT * INTO STRICT v_escrow
  FROM escrow_transactions
  WHERE id = p_escrow_id
  FOR UPDATE;

  -- Validation: Only disputed escrow can be resolved
  IF v_escrow.status != 'disputed' THEN
    RAISE EXCEPTION 'Can only resolve disputed escrow, current status: %', v_escrow.status;
  END IF;

  -- Handle resolution based on type
  CASE p_resolution
    WHEN 'release_to_recipient' THEN
      -- Release full amount to recipient
      UPDATE users SET balance = balance + v_escrow.amount WHERE id = v_escrow.recipient_id;
      UPDATE escrow_transactions SET status = 'released', released_at = NOW() WHERE id = p_escrow_id;

    WHEN 'refund_to_sender' THEN
      -- Full refund to sender
      UPDATE users SET balance = balance + v_escrow.amount WHERE id = v_escrow.sender_id;
      UPDATE escrow_transactions SET status = 'refunded', refunded_at = NOW() WHERE id = p_escrow_id;

    WHEN 'split' THEN
      -- Split between parties
      IF p_sender_amount IS NULL OR p_sender_amount < 0 OR p_sender_amount > v_escrow.amount THEN
        RAISE EXCEPTION 'Invalid sender_amount for split resolution';
      END IF;
      v_recipient_amount := v_escrow.amount - p_sender_amount;

      UPDATE users SET balance = balance + p_sender_amount WHERE id = v_escrow.sender_id;
      UPDATE users SET balance = balance + v_recipient_amount WHERE id = v_escrow.recipient_id;
      UPDATE escrow_transactions
      SET
        status = 'released',
        released_at = NOW(),
        refunded_amount = p_sender_amount
      WHERE id = p_escrow_id;

    ELSE
      RAISE EXCEPTION 'Invalid resolution type: %', p_resolution;
  END CASE;

  -- Update dispute metadata
  UPDATE escrow_transactions
  SET metadata = metadata || jsonb_build_object(
    'dispute', metadata->'dispute' || jsonb_build_object(
      'resolved_by', p_admin_id,
      'resolved_at', NOW(),
      'resolution', p_resolution,
      'notes', p_notes,
      'sender_amount', p_sender_amount,
      'status', 'resolved'
    )
  )
  WHERE id = p_escrow_id;

  -- Log resolution
  INSERT INTO audit_logs (
    user_id,
    action,
    ip_address,
    metadata
  ) VALUES (
    p_admin_id,
    'escrow_dispute_resolved',
    'admin',
    jsonb_build_object(
      'escrow_id', p_escrow_id,
      'resolution', p_resolution,
      'sender_amount', p_sender_amount,
      'notes', p_notes
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'escrow_id', p_escrow_id,
    'resolution', p_resolution,
    'message', 'Dispute resolved successfully'
  );
END;
$$;

COMMENT ON FUNCTION resolve_escrow_dispute IS 'Admin function to resolve an escrow dispute';

-- ============================================
-- 4. UPDATE ORIGINAL REFUND FUNCTION
-- ============================================

-- Keep backward compatibility but add more options
CREATE OR REPLACE FUNCTION refund_escrow(
  p_escrow_id UUID,
  p_reason TEXT DEFAULT 'user_request'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Call the new partial_refund_escrow with full refund
  RETURN partial_refund_escrow(p_escrow_id, NULL, 0, p_reason);
END;
$$;

-- ============================================
-- 5. GRANTS
-- ============================================

GRANT EXECUTE ON FUNCTION partial_refund_escrow TO authenticated;
GRANT EXECUTE ON FUNCTION open_escrow_dispute TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_escrow_dispute TO authenticated;

-- ============================================
-- 6. ADD EXCHANGE RATE UPDATE CRON JOB
-- ============================================

-- Schedule exchange rate updates (hourly)
-- Note: pg_cron extension must be enabled
DO $$
DECLARE
  _job_id bigint;
BEGIN
  -- Try to unschedule existing job
  BEGIN
    SELECT cron.unschedule('update-exchange-rates') INTO _job_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not unschedule update-exchange-rates: %', SQLERRM;
  END;

  -- Schedule the cron job
  BEGIN
    SELECT cron.schedule(
      'update-exchange-rates',
      '0 * * * *', -- Every hour
      'SELECT notify_exchange_rate_update()'
    ) INTO _job_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not schedule update-exchange-rates: %', SQLERRM;
  END;
END $$;

-- Create helper function for exchange rate notification
CREATE OR REPLACE FUNCTION notify_exchange_rate_update()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- This function can be extended to call pg_net for HTTP request
  -- For now, it just logs that an update is needed
  INSERT INTO audit_logs (
    user_id,
    action,
    ip_address,
    metadata
  ) VALUES (
    NULL,
    'exchange_rate_update_requested',
    'cron',
    jsonb_build_object('timestamp', NOW())
  );
END;
$$;

-- ============================================
-- 7. COMMENTS
-- ============================================

COMMENT ON FUNCTION partial_refund_escrow IS 'Performs partial or full refund of escrow with optional service fee retention. Addresses audit finding for partial refund support.';
COMMENT ON FUNCTION open_escrow_dispute IS 'Allows parties to open a dispute on pending escrow. Addresses audit finding for dispute flow.';
COMMENT ON FUNCTION resolve_escrow_dispute IS 'Admin function to resolve disputes with options for full release, refund, or split.';
COMMENT ON FUNCTION notify_exchange_rate_update IS 'Called by pg_cron to trigger exchange rate updates.';
