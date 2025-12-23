-- Enable RLS on cdn_invalidation_logs table
-- Migration to address ERROR level security issue
-- Date: 2025-12-09
-- Issue: Table has RLS disabled, allowing unrestricted access

-- ============================================================================
-- Enable RLS
-- ============================================================================

ALTER TABLE public.cdn_invalidation_logs 
ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Policy 1: Service role can read all logs
-- This is used for admin dashboards and debugging
DROP POLICY IF EXISTS "Service role can read cdn invalidation logs" ON public.cdn_invalidation_logs;
CREATE POLICY "Service role can read cdn invalidation logs"
  ON public.cdn_invalidation_logs 
  FOR SELECT
  USING (
    -- Only service role can read
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Policy 2: Service role can insert logs
-- CDN invalidation triggers and edge functions need write access
DROP POLICY IF EXISTS "Service role can insert cdn invalidation logs" ON public.cdn_invalidation_logs;
CREATE POLICY "Service role can insert cdn invalidation logs"
  ON public.cdn_invalidation_logs 
  FOR INSERT
  WITH CHECK (
    -- Only service role can insert
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Policy 3: Service role can update logs
-- For updating success/error status asynchronously
DROP POLICY IF EXISTS "Service role can update cdn invalidation logs" ON public.cdn_invalidation_logs;
CREATE POLICY "Service role can update cdn invalidation logs"
  ON public.cdn_invalidation_logs 
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'service_role'
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- No DELETE policy - logs should be retained (use retention policy instead)

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.cdn_invalidation_logs IS 
  'Logs of CDN cache invalidation requests - RLS enabled, service_role only access';

-- ============================================================================
-- Verification
-- ============================================================================

-- To verify RLS is enabled:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename = 'cdn_invalidation_logs';
-- Expected: rowsecurity = true

-- To verify policies:
-- SELECT policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE schemaname = 'public' AND tablename = 'cdn_invalidation_logs';
-- Expected: 3 policies (SELECT, INSERT, UPDATE)
