-- ============================================
-- Fix Function Column References
-- ============================================
-- Fixes DB lint errors for functions referencing non-existent columns:
-- 1. refund_expired_escrow - remove updated_at, fix audit_logs columns
-- 2. record_rate_limit_violation - fix audit_logs columns
--
-- Author: Lovendo Team
-- Date: 2025-12-29
-- ============================================

-- ============================================
-- 1. Fix refund_expired_escrow function
-- ============================================

CREATE OR REPLACE FUNCTION refund_expired_escrow()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  expired_count INTEGER := 0;
  escrow_record RECORD;
BEGIN
  -- Find all expired escrows that are still pending
  FOR escrow_record IN
    SELECT id, sender_id, amount, moment_id
    FROM escrow_transactions
    WHERE status = 'pending'
      AND expires_at < NOW()
  LOOP
    -- Update escrow status to refunded (no updated_at column exists)
    UPDATE escrow_transactions
    SET status = 'refunded'
    WHERE id = escrow_record.id;
    
    -- Refund the amount to sender's balance
    UPDATE users
    SET balance = COALESCE(balance, 0) + escrow_record.amount,
        updated_at = NOW()
    WHERE id = escrow_record.sender_id;
    
    -- Create transaction record
    INSERT INTO transactions (
      user_id,
      type,
      amount,
      status,
      description,
      moment_id,
      metadata
    ) VALUES (
      escrow_record.sender_id,
      'refund',
      escrow_record.amount,
      'completed',
      'Automatic refund for expired escrow',
      escrow_record.moment_id,
      jsonb_build_object(
        'escrow_id', escrow_record.id,
        'reason', 'expired',
        'auto_refund', true
      )
    );
    
    -- Log the action using correct audit_logs columns
    INSERT INTO audit_logs (
      user_id,
      action,
      ip_address,
      metadata
    ) VALUES (
      escrow_record.sender_id,
      'escrow_auto_refund',
      'system',
      jsonb_build_object(
        'escrow_id', escrow_record.id,
        'amount', escrow_record.amount,
        'moment_id', escrow_record.moment_id,
        'refunded_at', NOW()
      )
    );
    
    expired_count := expired_count + 1;
  END LOOP;
  
  RETURN expired_count;
END;
$$;

COMMENT ON FUNCTION refund_expired_escrow() IS 'Automatically refunds expired escrow transactions. Called by pg_cron daily at 02:00 UTC.';

-- ============================================
-- 2. Fix record_rate_limit_violation function
-- ============================================

CREATE OR REPLACE FUNCTION public.record_rate_limit_violation(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Use correct audit_logs columns: user_id, action, ip_address, metadata
  INSERT INTO audit_logs (
    user_id,
    action,
    ip_address,
    metadata
  ) VALUES (
    CASE WHEN p_identifier ~ '^[0-9a-f-]{36}$' THEN p_identifier::UUID ELSE NULL END,
    'rate_limit_exceeded',
    COALESCE(p_ip_address, 'unknown'),
    jsonb_build_object(
      'identifier', p_identifier,
      'endpoint', p_endpoint,
      'category', 'security',
      'result', 'blocked'
    )
  );
END;
$$;

COMMENT ON FUNCTION record_rate_limit_violation(TEXT, TEXT, TEXT) IS 'Records rate limit violations in audit_logs for security monitoring.';

-- ============================================
-- Verification
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Fixed refund_expired_escrow - removed non-existent updated_at column';
  RAISE NOTICE '✅ Fixed record_rate_limit_violation - corrected audit_logs column references';
END;
$$;
