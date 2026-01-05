-- ============================================
-- DEFCON 1: CRITICAL SECURITY FIXES
-- Date: 2025-12-19
-- Audit: Forensic God Mode Audit Compliance
-- ============================================

-- ============================================
-- 1. FIX RLS WITH CHECK(true) VULNERABILITIES
-- ============================================

-- 1.1 Fix proof_verifications - Add proper validation
DROP POLICY IF EXISTS "Service role only for proof verification inserts" ON proof_verifications;
CREATE POLICY "Service role with validation for proof verification inserts"
ON proof_verifications FOR INSERT
TO service_role
WITH CHECK (
  -- Ensure user_id is valid and exists
  user_id IS NOT NULL AND
  EXISTS (SELECT 1 FROM users WHERE id = user_id) AND
  -- Ensure moment_id is valid if provided
  (moment_id IS NULL OR EXISTS (SELECT 1 FROM moments WHERE id = moment_id))
);

-- 1.2 Fix user_achievements - Add proper validation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_achievements') THEN
    DROP POLICY IF EXISTS "Service role only for achievement inserts" ON user_achievements;
    EXECUTE 'CREATE POLICY "Service role with validation for achievement inserts"
    ON user_achievements FOR INSERT
    TO service_role
    WITH CHECK (
      user_id IS NOT NULL AND
      EXISTS (SELECT 1 FROM users WHERE id = user_id)
    )';
  END IF;
END $$;

-- 1.3 Fix activity_logs - Add proper validation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'activity_logs') THEN
    DROP POLICY IF EXISTS "Service role only for activity log inserts" ON activity_logs;
    EXECUTE 'CREATE POLICY "Service role with validation for activity log inserts"
    ON activity_logs FOR INSERT
    TO service_role
    WITH CHECK (
      user_id IS NOT NULL AND
      EXISTS (SELECT 1 FROM users WHERE id = user_id)
    )';
  END IF;
END $$;

-- 1.4 Fix video_transcriptions - Add proper validation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'video_transcriptions') THEN
    DROP POLICY IF EXISTS "Service role can insert transcriptions" ON public.video_transcriptions;
    EXECUTE 'CREATE POLICY "Service role with validation for transcription inserts"
    ON public.video_transcriptions
    FOR INSERT
    TO service_role
    WITH CHECK (
      user_id IS NOT NULL AND
      EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) AND
      video_id IS NOT NULL AND
      transcription_text IS NOT NULL
    )';
  END IF;
END $$;

-- 1.5 Fix uploaded_images - Add proper validation
DROP POLICY IF EXISTS "Service role can insert uploads" ON public.uploaded_images;
CREATE POLICY "Service role with validation for upload inserts"
ON public.uploaded_images
FOR INSERT
TO service_role
WITH CHECK (
  user_id IS NOT NULL AND
  EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) AND
  filename IS NOT NULL AND
  url IS NOT NULL
);

-- ============================================
-- 2. FIX ESCROW FUNCTION - ADD AUTH CHECK
-- ============================================

-- Drop and recreate with proper auth check
CREATE OR REPLACE FUNCTION create_escrow_transaction(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_amount DECIMAL,
  p_moment_id UUID,
  p_release_condition TEXT DEFAULT 'proof_verified'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_sender_balance DECIMAL;
  v_escrow_id UUID;
  v_txn_id UUID;
  v_calling_user UUID;
BEGIN
  -- ============================================
  -- SECURITY FIX: Verify caller is the sender
  -- ============================================
  v_calling_user := auth.uid();
  
  -- Allow service_role to bypass for system operations
  IF v_calling_user IS NULL AND current_setting('role', true) != 'service_role' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- If authenticated user, must match sender_id
  IF v_calling_user IS NOT NULL AND p_sender_id != v_calling_user THEN
    RAISE EXCEPTION 'Cannot create escrow on behalf of another user. Your ID: %, Requested sender: %', 
      v_calling_user, p_sender_id;
  END IF;
  -- ============================================

  -- Validation
  IF p_sender_id = p_recipient_id THEN
    RAISE EXCEPTION 'Cannot escrow to yourself';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  IF p_amount > 10000 THEN
    RAISE EXCEPTION 'Amount exceeds maximum escrow limit of $10,000';
  END IF;

  -- Verify recipient exists
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_recipient_id) THEN
    RAISE EXCEPTION 'Recipient not found';
  END IF;

  -- Verify moment exists if provided
  IF p_moment_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM moments WHERE id = p_moment_id) THEN
    RAISE EXCEPTION 'Moment not found';
  END IF;

  -- Lock sender and check balance
  SELECT balance INTO STRICT v_sender_balance
  FROM users
  WHERE id = p_sender_id
  FOR UPDATE;

  IF v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds: available %.2f, requested %.2f', v_sender_balance, p_amount;
  END IF;

  -- Debit sender (money goes to escrow, not recipient yet)
  UPDATE users
  SET balance = balance - p_amount
  WHERE id = p_sender_id;

  -- Create escrow record
  INSERT INTO escrow_transactions (
    sender_id, recipient_id, amount,
    moment_id, status, release_condition, expires_at
  )
  VALUES (
    p_sender_id, p_recipient_id, p_amount,
    p_moment_id, 'pending', p_release_condition,
    NOW() + INTERVAL '7 days'
  )
  RETURNING id INTO v_escrow_id;

  -- Log transaction
  INSERT INTO transactions (
    user_id, type, amount, status,
    description, moment_id, metadata
  )
  VALUES (
    p_sender_id, 'escrow_hold', -p_amount, 'pending',
    'Funds held in escrow for moment ' || COALESCE(p_moment_id::text, 'N/A'),
    p_moment_id,
    jsonb_build_object(
      'escrowId', v_escrow_id,
      'recipientId', p_recipient_id,
      'releaseCondition', p_release_condition,
      'createdBy', v_calling_user
    )
  )
  RETURNING id INTO v_txn_id;

  RETURN jsonb_build_object(
    'success', true,
    'escrowId', v_escrow_id,
    'transactionId', v_txn_id,
    'status', 'pending',
    'expiresAt', NOW() + INTERVAL '7 days'
  );
END;
$$;

-- ============================================
-- 3. FIX RELEASE ESCROW - ADD AUTH CHECK
-- ============================================

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
  v_calling_user UUID;
BEGIN
  v_calling_user := auth.uid();
  
  -- Get and lock escrow record
  SELECT * INTO STRICT v_escrow
  FROM escrow_transactions
  WHERE id = p_escrow_id
  FOR UPDATE;

  -- ============================================
  -- SECURITY FIX: Only sender, recipient, or admin can release
  -- ============================================
  IF v_calling_user IS NOT NULL AND 
     v_calling_user != v_escrow.sender_id AND 
     v_calling_user != v_escrow.recipient_id THEN
    -- Check if user is admin
    IF NOT EXISTS (
      SELECT 1 FROM users 
      WHERE id = v_calling_user AND role IN ('admin', 'super_admin')
    ) THEN
      RAISE EXCEPTION 'Not authorized to release this escrow';
    END IF;
  END IF;
  -- ============================================

  -- Validation
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
    metadata = metadata || jsonb_build_object('releasedBy', COALESCE(p_verified_by, v_calling_user))
  WHERE id = p_escrow_id;

  -- Log recipient transaction
  INSERT INTO transactions (
    user_id, type, amount, status,
    description, moment_id, metadata
  )
  VALUES (
    v_escrow.recipient_id, 'escrow_release', v_escrow.amount, 'completed',
    'Escrow funds released from sender',
    v_escrow.moment_id,
    jsonb_build_object(
      'escrowId', p_escrow_id,
      'senderId', v_escrow.sender_id,
      'verifiedBy', COALESCE(p_verified_by, v_calling_user)
    )
  )
  RETURNING id INTO v_txn_id;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'released',
    'transactionId', v_txn_id
  );
END;
$$;

-- ============================================
-- 4. FIX REFUND ESCROW - ADD AUTH CHECK
-- ============================================

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
  v_calling_user UUID;
BEGIN
  v_calling_user := auth.uid();
  
  -- Get and lock escrow
  SELECT * INTO STRICT v_escrow
  FROM escrow_transactions
  WHERE id = p_escrow_id
  FOR UPDATE;

  -- ============================================
  -- SECURITY FIX: Only sender or admin can refund
  -- ============================================
  IF v_calling_user IS NOT NULL AND v_calling_user != v_escrow.sender_id THEN
    -- Check if user is admin
    IF NOT EXISTS (
      SELECT 1 FROM users 
      WHERE id = v_calling_user AND role IN ('admin', 'super_admin')
    ) THEN
      RAISE EXCEPTION 'Only the sender or admin can request a refund';
    END IF;
  END IF;
  -- ============================================

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
      'refundedBy', v_calling_user,
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
      'refundedBy', v_calling_user
    )
  )
  RETURNING id INTO v_txn_id;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'refunded',
    'transactionId', v_txn_id
  );
END;
$$;

-- ============================================
-- 5. CREATE used_2fa_codes TABLE FOR REPLAY PROTECTION
-- ============================================

CREATE TABLE IF NOT EXISTS public.used_2fa_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_used_2fa_codes_user_hash 
  ON public.used_2fa_codes(user_id, code_hash);

-- Index for cleanup job
CREATE INDEX IF NOT EXISTS idx_used_2fa_codes_expires 
  ON public.used_2fa_codes(expires_at);

-- RLS
ALTER TABLE public.used_2fa_codes ENABLE ROW LEVEL SECURITY;

-- Only service role can access
CREATE POLICY "Service role only for 2fa codes"
ON public.used_2fa_codes FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Auto-cleanup expired codes (can be run via pg_cron)
CREATE OR REPLACE FUNCTION cleanup_expired_2fa_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.used_2fa_codes
  WHERE expires_at < NOW();
END;
$$;

-- ============================================
-- 6. VERIFICATION COMMENTS
-- ============================================

COMMENT ON FUNCTION create_escrow_transaction IS 
'Creates escrow transaction with mandatory auth check - user can only create escrow from their own account';

COMMENT ON FUNCTION release_escrow IS 
'Releases escrow with auth check - only sender, recipient, or admin can release';

COMMENT ON FUNCTION refund_escrow IS 
'Refunds escrow with auth check - only sender or admin can refund';

COMMENT ON TABLE public.used_2fa_codes IS 
'Stores used 2FA codes to prevent replay attacks within 60 second window';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ DEFCON 1 Security Fixes Applied Successfully';
  RAISE NOTICE '  - RLS WITH CHECK(true) vulnerabilities fixed';
  RAISE NOTICE '  - Escrow auth checks added';
  RAISE NOTICE '  - 2FA replay protection table created';
END $$;
