-- ============================================
-- ESCROW IDEMPOTENCY ENHANCEMENT
-- Migration: 20260109000000_escrow_idempotency.sql
--
-- Adds idempotency keys and transaction locks to ensure
-- release_escrow and refund_escrow cannot be executed
-- twice for the same escrow transaction.
-- ============================================

-- ============================================
-- 1. ADD IDEMPOTENCY KEY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS escrow_idempotency_keys (
  idempotency_key TEXT PRIMARY KEY,
  escrow_id UUID NOT NULL REFERENCES escrow_transactions(id) ON DELETE CASCADE,
  operation TEXT NOT NULL CHECK (operation IN ('release', 'refund')),
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Auto-cleanup after 30 days
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_escrow_idempotency_escrow ON escrow_idempotency_keys(escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrow_idempotency_expires ON escrow_idempotency_keys(expires_at);

COMMENT ON TABLE escrow_idempotency_keys IS
'Stores idempotency keys for escrow operations to prevent duplicate executions.
Keys expire after 30 days.';

-- Enable RLS
ALTER TABLE escrow_idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Only system/service role can access
DROP POLICY IF EXISTS "Service role only" ON escrow_idempotency_keys;
CREATE POLICY "Service role only" ON escrow_idempotency_keys
FOR ALL USING (false)
WITH CHECK (false);

-- ============================================
-- 2. UPDATE RELEASE_ESCROW WITH IDEMPOTENCY
-- ============================================

CREATE OR REPLACE FUNCTION release_escrow(
  p_escrow_id UUID,
  p_verified_by UUID DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_escrow RECORD;
  v_txn_id UUID;
  v_existing_result JSONB;
  v_result JSONB;
  v_idempotency_key TEXT;
BEGIN
  -- Generate idempotency key if not provided
  v_idempotency_key := COALESCE(
    p_idempotency_key,
    'release_' || p_escrow_id::text || '_' || NOW()::text
  );

  -- Check for existing idempotency key (fast-path for duplicate requests)
  SELECT result INTO v_existing_result
  FROM escrow_idempotency_keys
  WHERE idempotency_key = v_idempotency_key
    AND operation = 'release';

  IF FOUND THEN
    -- Return cached result for duplicate request
    RETURN v_existing_result || jsonb_build_object('idempotent', true);
  END IF;

  -- Get and lock escrow record with FOR UPDATE NOWAIT
  -- This prevents concurrent executions
  BEGIN
    SELECT * INTO STRICT v_escrow
    FROM escrow_transactions
    WHERE id = p_escrow_id
    FOR UPDATE NOWAIT;
  EXCEPTION
    WHEN lock_not_available THEN
      RAISE EXCEPTION 'Escrow transaction is being processed by another request';
    WHEN NO_DATA_FOUND THEN
      RAISE EXCEPTION 'Escrow transaction not found: %', p_escrow_id;
  END;

  -- Validation: Check status AFTER acquiring lock
  IF v_escrow.status = 'released' THEN
    -- Already released - return success (idempotent)
    v_result := jsonb_build_object(
      'success', true,
      'status', 'released',
      'message', 'Escrow already released',
      'idempotent', true
    );
    RETURN v_result;
  END IF;

  IF v_escrow.status != 'pending' THEN
    RAISE EXCEPTION 'Escrow not in pending status: %', v_escrow.status;
  END IF;

  IF v_escrow.expires_at < NOW() THEN
    RAISE EXCEPTION 'Escrow expired at %', v_escrow.expires_at;
  END IF;

  -- Credit recipient
  UPDATE users
  SET balance = balance + v_escrow.amount
  WHERE id = v_escrow.recipient_id;

  -- Update escrow status
  UPDATE escrow_transactions
  SET
    status = 'released',
    released_at = NOW(),
    proof_verified = TRUE,
    proof_verification_date = NOW(),
    metadata = metadata || jsonb_build_object(
      'releasedBy', p_verified_by,
      'idempotencyKey', v_idempotency_key
    )
  WHERE id = p_escrow_id;

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
      'verifiedBy', p_verified_by,
      'idempotencyKey', v_idempotency_key
    )
  )
  RETURNING id INTO v_txn_id;

  v_result := jsonb_build_object(
    'success', true,
    'status', 'released',
    'transactionId', v_txn_id,
    'escrowId', p_escrow_id
  );

  -- Store idempotency key
  INSERT INTO escrow_idempotency_keys (idempotency_key, escrow_id, operation, result)
  VALUES (v_idempotency_key, p_escrow_id, 'release', v_result)
  ON CONFLICT (idempotency_key) DO NOTHING;

  RETURN v_result;
END;
$$;

-- ============================================
-- 3. UPDATE REFUND_ESCROW WITH IDEMPOTENCY
-- ============================================

CREATE OR REPLACE FUNCTION refund_escrow(
  p_escrow_id UUID,
  p_reason TEXT DEFAULT 'user_request',
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_escrow RECORD;
  v_txn_id UUID;
  v_existing_result JSONB;
  v_result JSONB;
  v_idempotency_key TEXT;
BEGIN
  -- Generate idempotency key if not provided
  v_idempotency_key := COALESCE(
    p_idempotency_key,
    'refund_' || p_escrow_id::text || '_' || NOW()::text
  );

  -- Check for existing idempotency key (fast-path)
  SELECT result INTO v_existing_result
  FROM escrow_idempotency_keys
  WHERE idempotency_key = v_idempotency_key
    AND operation = 'refund';

  IF FOUND THEN
    -- Return cached result for duplicate request
    RETURN v_existing_result || jsonb_build_object('idempotent', true);
  END IF;

  -- Get and lock escrow with NOWAIT
  BEGIN
    SELECT * INTO STRICT v_escrow
    FROM escrow_transactions
    WHERE id = p_escrow_id
    FOR UPDATE NOWAIT;
  EXCEPTION
    WHEN lock_not_available THEN
      RAISE EXCEPTION 'Escrow transaction is being processed by another request';
    WHEN NO_DATA_FOUND THEN
      RAISE EXCEPTION 'Escrow transaction not found: %', p_escrow_id;
  END;

  -- Check if already refunded (idempotent success)
  IF v_escrow.status = 'refunded' THEN
    v_result := jsonb_build_object(
      'success', true,
      'status', 'refunded',
      'message', 'Escrow already refunded',
      'idempotent', true
    );
    RETURN v_result;
  END IF;

  IF v_escrow.status != 'pending' THEN
    RAISE EXCEPTION 'Can only refund pending escrow, current status: %', v_escrow.status;
  END IF;

  -- Refund to sender
  UPDATE users
  SET balance = balance + v_escrow.amount
  WHERE id = v_escrow.sender_id;

  -- Update escrow
  UPDATE escrow_transactions
  SET
    status = 'refunded',
    metadata = metadata || jsonb_build_object(
      'refundReason', p_reason,
      'idempotencyKey', v_idempotency_key,
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
    jsonb_build_object(
      'escrowId', p_escrow_id,
      'reason', p_reason,
      'idempotencyKey', v_idempotency_key
    )
  )
  RETURNING id INTO v_txn_id;

  v_result := jsonb_build_object(
    'success', true,
    'status', 'refunded',
    'transactionId', v_txn_id,
    'escrowId', p_escrow_id
  );

  -- Store idempotency key
  INSERT INTO escrow_idempotency_keys (idempotency_key, escrow_id, operation, result)
  VALUES (v_idempotency_key, p_escrow_id, 'refund', v_result)
  ON CONFLICT (idempotency_key) DO NOTHING;

  RETURN v_result;
END;
$$;

-- ============================================
-- 4. CLEANUP JOB FOR EXPIRED IDEMPOTENCY KEYS
-- ============================================

-- Function to cleanup expired idempotency keys
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM escrow_idempotency_keys
  WHERE expires_at < NOW();

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$;

-- Schedule cleanup with pg_cron (if available)
-- Uncomment if pg_cron is enabled:
/*
SELECT cron.schedule(
  'cleanup-escrow-idempotency-keys',
  '0 3 * * *',  -- Every day at 3 AM
  $$SELECT cleanup_expired_idempotency_keys()$$
);
*/

-- ============================================
-- 5. GRANT PERMISSIONS
-- ============================================

-- Use full function signatures to avoid ambiguity with existing function versions
GRANT EXECUTE ON FUNCTION release_escrow(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION refund_escrow(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_idempotency_keys() TO service_role;

COMMENT ON FUNCTION release_escrow(UUID, UUID, TEXT) IS
'Releases escrow funds to the recipient. Includes idempotency protection via
FOR UPDATE NOWAIT lock and idempotency key storage. Safe to call multiple times.';

COMMENT ON FUNCTION refund_escrow(UUID, TEXT, TEXT) IS
'Refunds escrow funds to the sender. Includes idempotency protection via
FOR UPDATE NOWAIT lock and idempotency key storage. Safe to call multiple times.';
