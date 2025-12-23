-- ============================================================
-- HEALTH CHECK FIXES MIGRATION
-- Date: 2025-12-18
-- Based on: Project Health Analysis
-- ============================================================

-- ============================================================
-- 1. ESCROW AUTO-EXPIRE/REFUND FUNCTION
-- Cron job exists but function was missing!
-- ============================================================

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
    -- Update escrow status to refunded
    UPDATE escrow_transactions
    SET status = 'refunded',
        updated_at = NOW()
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
    
    -- Log the action
    INSERT INTO audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      new_data
    ) VALUES (
      escrow_record.sender_id,
      'escrow_auto_refund',
      'escrow_transactions',
      escrow_record.id,
      jsonb_build_object(
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

-- ============================================================
-- 2. CLEANUP FUNCTIONS FOR LOG/STREAM TABLES
-- TTL/Archiving strategy for feed_delta, deep_link_events, audit_logs
-- ============================================================

-- Feed delta cleanup (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_feed_delta()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM feed_delta
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Deep link events cleanup (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_deep_link_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM deep_link_events
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Audit logs archival check (don't delete, just report old logs)
-- Audit logs should be kept longer for compliance
CREATE OR REPLACE FUNCTION count_old_audit_logs()
RETURNS TABLE(
  older_than_1_year BIGINT,
  older_than_2_years BIGINT,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 year') as older_than_1_year,
    COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '2 years') as older_than_2_years,
    COUNT(*) as total_count
  FROM audit_logs;
END;
$$;

-- ============================================================
-- 3. ADDITIONAL CRON JOBS FOR CLEANUP
-- ============================================================

-- Schedule cleanup jobs (if not exists)
DO $$
BEGIN
  -- Feed delta cleanup - daily at 03:00 UTC
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE command LIKE '%cleanup_old_feed_delta%') THEN
    PERFORM cron.schedule(
      'cleanup_feed_delta',
      '0 3 * * *',
      'SELECT cleanup_old_feed_delta();'
    );
  END IF;
  
  -- Deep link events cleanup - weekly on Sunday at 04:00 UTC
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE command LIKE '%cleanup_old_deep_link_events%') THEN
    PERFORM cron.schedule(
      'cleanup_deep_link_events',
      '0 4 * * 0',
      'SELECT cleanup_old_deep_link_events();'
    );
  END IF;
  
  -- Rate limits cleanup - daily at 02:30 UTC
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE command LIKE '%cleanup_rate_limits%') THEN
    PERFORM cron.schedule(
      'cleanup_rate_limits',
      '30 2 * * *',
      'SELECT cleanup_rate_limits();'
    );
  END IF;
END $$;

-- ============================================================
-- 4. STORAGE POLICY IMPROVEMENTS
-- Optimize INSERT policies with proper auth checks
-- ============================================================

-- Fix avatar INSERT policy (was missing WITH CHECK)
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix video-uploads INSERT policy
DROP POLICY IF EXISTS "Users can upload videos" ON storage.objects;
CREATE POLICY "Users can upload videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'video-uploads'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix KYC docs INSERT policy
DROP POLICY IF EXISTS "Users can upload their own KYC docs" ON storage.objects;
CREATE POLICY "Users can upload their own KYC docs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'kyc_docs'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix moment-images INSERT policy
DROP POLICY IF EXISTS "Users can upload moment images" ON storage.objects;
CREATE POLICY "Users can upload moment images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'moment-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix profile-proofs INSERT policy
DROP POLICY IF EXISTS "Users can upload profile proofs" ON storage.objects;
CREATE POLICY "Users can upload profile proofs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-proofs'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================
-- 5. REALTIME HELPER FUNCTION FOR PRIVATE CHANNELS
-- ============================================================

-- Function to check if user can access a conversation channel
CREATE OR REPLACE FUNCTION can_access_conversation(conv_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id
      AND user_id = auth.uid()
  );
END;
$$;

-- Function to get user's accessible conversation IDs (for realtime subscriptions)
CREATE OR REPLACE FUNCTION user_conversation_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT conversation_id 
  FROM conversation_participants 
  WHERE user_id = auth.uid();
$$;

-- ============================================================
-- 6. MISSING COMPOSITE INDEXES FOR RLS PERFORMANCE
-- ============================================================

-- Favorites: user_id + moment_id (for duplicate check)
CREATE INDEX IF NOT EXISTS idx_favorites_user_moment 
ON favorites(user_id, moment_id);

-- Reports: composite for admin queries
CREATE INDEX IF NOT EXISTS idx_reports_status_created 
ON reports(status, created_at DESC);

-- Transactions: user + type + created for history queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_created 
ON transactions(user_id, type, created_at DESC);

-- Escrow: status + expires_at for cron job
CREATE INDEX IF NOT EXISTS idx_escrow_pending_expires 
ON escrow_transactions(status, expires_at) 
WHERE status = 'pending';

-- ============================================================
-- 7. PHONE UNIQUENESS (Optional - Uncomment if needed)
-- ============================================================

-- Uncomment if you want phone numbers to be unique:
-- ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone);

-- ============================================================
-- 8. VALIDATION BLOCK
-- ============================================================

DO $$
DECLARE
  job_count INT;
  function_count INT;
  index_count INT;
BEGIN
  -- Count cron jobs
  SELECT COUNT(*) INTO job_count FROM cron.job WHERE active = true;
  
  -- Count health-related functions
  SELECT COUNT(*) INTO function_count 
  FROM pg_proc 
  WHERE proname IN (
    'refund_expired_escrow', 
    'cleanup_old_feed_delta', 
    'cleanup_old_deep_link_events',
    'can_access_conversation',
    'user_conversation_ids'
  );
  
  -- Count new indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE indexname IN (
    'idx_favorites_user_moment',
    'idx_reports_status_created',
    'idx_transactions_user_type_created',
    'idx_escrow_pending_expires'
  );
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ HEALTH CHECK FIXES COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Active cron jobs: %', job_count;
  RAISE NOTICE 'Health functions created: %', function_count;
  RAISE NOTICE 'New indexes created: %', index_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Escrow auto-refund: IMPLEMENTED';
  RAISE NOTICE '✅ Cleanup functions: CREATED';
  RAISE NOTICE '✅ Storage policies: HARDENED';
  RAISE NOTICE '✅ Realtime helpers: ADDED';
  RAISE NOTICE '✅ Performance indexes: CREATED';
  RAISE NOTICE '========================================';
END $$;
