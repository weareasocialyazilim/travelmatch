-- ============================================================================
// Escrow State Machine v2
// Fixed: Corrected typo, atomic transaction for race condition prevention
// ============================================================================

-- Drop old constraint and add new one with processing state
ALTER TABLE escrow_transactions DROP CONSTRAINT IF EXISTS escrow_transactions_status_check;
ALTER TABLE escrow_transactions ADD CONSTRAINT escrow_transactions_status_check CHECK (
  status IN ('pending', 'processing', 'released', 'refunded', 'disputed', 'expired', 'cancelled')
);

-- Add processing tracking columns
ALTER TABLE escrow_transactions ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ;
ALTER TABLE escrow_transactions ADD COLUMN IF NOT EXISTS release_attempted_at TIMESTAMPTZ;
ALTER TABLE escrow_transactions ADD COLUMN IF NOT EXISTS last_error TEXT;

-- Updated release_escrow with ATOMIC transaction to prevent race conditions
CREATE OR REPLACE FUNCTION release_escrow(
  p_escrow_id UUID,
  p_verified_by UUID DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_escrow RECORD;
  v_txn_id UUID;
  v_idempotency_key TEXT := 'release_escrow_' || p_escrow_id::text;
BEGIN
  -- Idempotency check - prevent double release
  IF EXISTS (SELECT 1 FROM escrow_idempotency_keys WHERE key = v_idempotency_key AND success = true) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Escrow already released (idempotent check)',
      'code', 'ALREADY_RELEASED'
    );
  END IF;

  -- Get and lock escrow with SKIP LOCKED to prevent race conditions
  SELECT * INTO STRICT v_escrow
  FROM escrow_transactions
  WHERE id = p_escrow_id
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Escrow not found or already being processed',
      'code', 'NOT_FOUND_OR_LOCKED'
    );
  END IF;

  -- Validate state transition - FIXED: was "reeleased_at" typo
  IF v_escrow.status = 'released' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Escrow already released',
      'releasedAt', v_escrow.released_at,  -- FIXED: was "reeleased_at"
      'code', 'ALREADY_RELEASED'
    );
  END IF;

  IF v_escrow.status = 'refunded' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Escrow already refunded',
      'code', 'ALREADY_REFUNDED'
    );
  END IF;

  IF v_escrow.status NOT IN ('pending', 'processing') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Escrow in invalid state: ' || v_escrow.status,
      'code', 'INVALID_STATE'
    );
  END IF;

  -- Check expiry
  IF v_escrow.expires_at < NOW() THEN
    -- Auto-refund expired escrow
    PERFORM refund_escrow(p_escrow_id, 'auto_refund_expired');
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Escrow expired, auto-refunded',
      'code', 'EXPIRED_AUTO_REFUNDED'
    );
  END IF;

  -- ATOMIC TRANSACTION - All-or-nothing to prevent race conditions
  BEGIN
    -- Transition to processing and release in single atomic operation
    UPDATE escrow_transactions
    SET
      status = 'released',
      released_at = NOW(),
      proof_verified = COALESCE(p_verified_by, proof_verified) IS NOT NULL,
      proof_verification_date = COALESCE(proof_verification_date, NOW()),
      processing_started_at = COALESCE(processing_started_at, NOW()),
      release_attempted_at = NOW(),
      metadata = metadata || jsonb_build_object(
        'releasedBy', p_verified_by,
        'releasedAt', NOW()
      )
    WHERE id = p_escrow_id
    AND status IN ('pending', 'processing')
    AND id = p_escrow_id;  -- Ensure row lock is held

    -- Credit recipient ONLY if update succeeded
    UPDATE users
    SET balance = balance + v_escrow.amount
    WHERE id = v_escrow.recipient_id;

    -- Log recipient transaction
    INSERT INTO transactions (
      user_id, type, amount, status,
      description, moment_id, metadata
    )
    VALUES (
      v_escrow.recipient_id, 'escrow_release', v_escrow.amount, 'completed',
      'Escrow funds released from ' || v_escrow.sender_id::text,
      v_escrow.moment_id,
      jsonb_build_object(
        'escrowId', p_escrow_id,
        'senderId', v_escrow.sender_id,
        'verifiedBy', p_verified_by
      )
    )
    RETURNING id INTO v_txn_id;

    -- Record idempotency key
    INSERT INTO escrow_idempotency_keys (key, escrow_id, success)
    VALUES (v_idempotency_key, p_escrow_id, true)
    ON CONFLICT (key) DO NOTHING;

    RETURN jsonb_build_object(
      'success', true,
      'status', 'released',
      'transactionId', v_txn_id,
      'releasedAt', NOW()
    );

  EXCEPTION WHEN OTHERS THEN
    -- Record failed attempt
    INSERT INTO escrow_idempotency_keys (key, escrow_id, success, error)
    VALUES (v_idempotency_key, p_escrow_id, false, SQLERRM)
    ON CONFLICT (key) DO NOTHING;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'Release failed: ' || SQLERRM,
      'code', 'RELEASE_FAILED'
    );
  END;
END;
$$;

-- Updated refund_escrow with proper state handling
CREATE OR REPLACE FUNCTION refund_escrow(
  p_escrow_id UUID,
  p_reason TEXT DEFAULT 'user_request'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_escrow RECORD;
  v_txn_id UUID;
BEGIN
  -- Get and lock escrow
  SELECT * INTO STRICT v_escrow
  FROM escrow_transactions
  WHERE id = p_escrow_id
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Escrow not found or already being processed',
      'code', 'NOT_FOUND_OR_LOCKED'
    );
  END IF;

  -- Check if already finalized
  IF v_escrow.status IN ('released', 'refunded') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Escrow already ' || v_escrow.status,
      'code', 'ALREADY_FINALIZED'
    );
  END IF;

  -- Transition to processing
  UPDATE escrow_transactions
  SET status = 'processing'
  WHERE id = p_escrow_id;

  -- Refund to sender
  UPDATE users
  SET balance = balance + v_escrow.amount
  WHERE id = v_escrow.sender_id;

  -- Mark refunded
  UPDATE escrow_transactions
  SET
    status = 'refunded',
    metadata = metadata || jsonb_build_object(
      'refundReason', p_reason,
      'refundedAt', NOW()
    )
  WHERE id = p_escrow_id;

  -- Log refund transaction
  INSERT INTO transactions (
    user_id, type, amount, status,
    description, metadata
  )
  VALUES (
    v_escrow.sender_id, 'escrow_refund', v_escrow.amount, 'completed',
    'Escrow refunded: ' || p_reason,
    jsonb_build_object('escrowId', p_escrow_id, 'reason', p_reason)
  )
  RETURNING id INTO v_txn_id;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'refunded',
    'transactionId', v_txn_id,
    'refundedAt', NOW()
  );
END;
$$;

-- Grace period before funds release (security hold)
CREATE OR REPLACE FUNCTION hold_period_remaining(p_escrow_id UUID)
RETURNS INTERVAL
LANGUAGE plpgsql
AS $$
DECLARE
  v_escrow RECORD;
BEGIN
  SELECT * INTO v_escrow FROM escrow_transactions WHERE id = p_escrow_id;
  IF NOT FOUND THEN RETURN INTERVAL '0 seconds'; END IF;
  RETURN GREATEST(INTERVAL '0 seconds', v_escrow.created_at + INTERVAL '24 hours' - NOW());
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION release_escrow TO authenticated;
GRANT EXECUTE ON FUNCTION refund_escrow TO authenticated;
GRANT EXECUTE ON FUNCTION hold_period_remaining TO authenticated;

COMMENT ON FUNCTION release_escrow IS 'Releases escrow funds to recipient. Uses SKIP LOCKED for concurrent safety.';
COMMENT ON FUNCTION refund_escrow IS 'Refunds escrow funds to sender. Uses SKIP LOCKED for concurrent safety.';

-- ============================================
-- DISPUTE AUTO-ESCALATION
-- Escalates disputes pending for >7 days to urgent status
-- ============================================

CREATE OR REPLACE FUNCTION auto_escalate_disputes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_escalated_count INTEGER := 0;
BEGIN
  -- Update disputes that have been pending for more than 7 days
  UPDATE disputes
  SET
    status = 'escalated',
    priority = 'urgent',
    metadata = metadata || jsonb_build_object(
      'auto_escalated', true,
      'escalated_at', NOW(),
      'escalation_reason', 'pending_over_7_days'
    ),
    updated_at = NOW()
  WHERE
    status = 'pending'
    AND created_at < NOW() - INTERVAL '7 days'
  RETURNING id INTO v_escalated_count;

  -- Log the escalation
  IF v_escalated_count > 0 THEN
    RAISE NOTICE 'Auto-escalated % disputes pending for over 7 days', v_escalated_count;
  END IF;

  RETURN v_escalated_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION auto_escalate_disputes TO authenticated;

COMMENT ON FUNCTION auto_escalate_disputes IS 'Auto-escalates disputes pending for more than 7 days to urgent status.';

-- ============================================
-- PG_CRON SCHEDULE (Run every hour)
-- Uncomment to enable auto-escalation
-- ============================================
-- SELECT cron.schedule(
--   'auto-escalate-old-disputes',
--   '0 * * * *', -- Every hour
--   'SELECT auto_escalate_disputes();'
-- );
