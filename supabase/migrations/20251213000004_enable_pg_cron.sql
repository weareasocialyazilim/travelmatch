-- ============================================
-- CRITICAL: Enable pg_cron Extension
-- ============================================
-- Purpose: Enable automatic refund of expired escrow transactions
-- Run this IMMEDIATELY after deploying to production
-- Location: Supabase Dashboard → SQL Editor

-- ============================================
-- 1. ENABLE PG_CRON EXTENSION
-- ============================================

-- Check if extension exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Enable pg_cron extension
    CREATE EXTENSION pg_cron;
    RAISE NOTICE '✅ pg_cron extension enabled successfully';
  ELSE
    RAISE NOTICE 'ℹ️ pg_cron extension already enabled';
  END IF;
END $$;

-- Verify extension
SELECT
  extname,
  extversion,
  'Installed' as status
FROM pg_extension
WHERE extname = 'pg_cron';

-- ============================================
-- 2. SCHEDULE AUTO-REFUND JOB
-- ============================================

-- Remove existing job if exists (idempotent)
DO $$
BEGIN
  -- Try to unschedule and schedule the cron job, but do not fail the
  -- migration if pg_cron is not available or scheduling fails in this
  -- environment (e.g. local dev / restricted permissions).
  BEGIN
    PERFORM cron.unschedule('refund-expired-escrow');
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not unschedule refund-expired-escrow: %', SQLERRM;
  END;

  BEGIN
    PERFORM cron.schedule(
      'refund-expired-escrow',
      '0 2 * * *',
      $cmd$SELECT refund_expired_escrow();$cmd$
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not schedule refund-expired-escrow: %', SQLERRM;
  END;
END $$;

-- ============================================
-- 3. VERIFY SCHEDULED JOB
-- ============================================

-- List all cron jobs
SELECT
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
FROM cron.job
WHERE jobname = 'refund-expired-escrow';

-- Expected output:
-- jobid | schedule   | command                               | active | jobname
-- ------|------------|---------------------------------------|--------|------------------------
-- 1     | 0 2 * * *  | SELECT refund_expired_escrow();       | t      | refund-expired-escrow

-- ============================================
-- 4. TEST THE FUNCTION (Optional)
-- ============================================

-- Manually trigger the refund function to test
-- SELECT refund_expired_escrow();

-- Check cron job history
SELECT
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname = 'refund-expired-escrow')
ORDER BY start_time DESC
LIMIT 10;

-- ============================================
-- 5. MONITORING QUERIES
-- ============================================

-- Check upcoming escrow expirations
SELECT
  COUNT(*) as pending_escrows,
  MIN(expires_at) as next_expiry,
  MAX(expires_at) as last_expiry
FROM escrow_transactions
WHERE status = 'pending' AND expires_at > NOW();

-- Check recently expired (should be auto-refunded)
SELECT
  id,
  sender_id,
  recipient_id,
  amount,
  status,
  expires_at,
  created_at
FROM escrow_transactions
WHERE status = 'pending'
  AND expires_at < NOW()
ORDER BY expires_at DESC
LIMIT 10;

-- ============================================
-- IMPORTANT NOTES
-- ============================================
/*
1. pg_cron runs in UTC timezone
2. Job runs daily at 02:00 UTC (adjust if needed)
3. Function refund_expired_escrow() must exist before scheduling
4. Monitor cron.job_run_details for execution logs
5. If job fails, check Supabase logs for errors

TROUBLESHOOTING:
- If job doesn't run: Check pg_cron.log table
- If function fails: Check database logs in Supabase Dashboard
- To pause job: UPDATE cron.job SET active = false WHERE jobname = 'refund-expired-escrow';
- To resume job: UPDATE cron.job SET active = true WHERE jobname = 'refund-expired-escrow';
*/
