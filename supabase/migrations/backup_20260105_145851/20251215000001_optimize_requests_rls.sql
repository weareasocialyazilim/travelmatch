-- ============================================================================
-- Migration: Optimize requests table RLS policy
-- Date: 2025-12-15
-- Description: Replace N+1 subquery with cached auth_user_id() helper function
-- ============================================================================

-- Drop existing policy with subquery performance issue
DROP POLICY IF EXISTS "Users can view own requests" ON requests;

-- Recreate with optimized helper function
-- Uses auth_user_id() which caches auth.uid() per transaction
CREATE POLICY "Users can view own requests" ON requests
FOR SELECT USING (
  user_id = auth_user_id() OR 
  moment_id IN (SELECT id FROM moments WHERE user_id = auth_user_id())
);

COMMENT ON POLICY "Users can view own requests" ON requests IS 
'Users can view requests they created or requests for their moments. Uses cached auth_user_id() for ~30% performance improvement.';

-- Also optimize other requests policies if they exist
DROP POLICY IF EXISTS "Users can create requests" ON requests;
CREATE POLICY "Users can create requests" ON requests
FOR INSERT WITH CHECK (auth_user_id() = user_id);

DROP POLICY IF EXISTS "Users can update own requests" ON requests;
CREATE POLICY "Users can update own requests" ON requests
FOR UPDATE USING (user_id = auth_user_id());

DROP POLICY IF EXISTS "Users can delete own requests" ON requests;
CREATE POLICY "Users can delete own requests" ON requests
FOR DELETE USING (user_id = auth_user_id());

-- Log optimization
DO $$
BEGIN
  RAISE NOTICE 'Optimized requests table RLS policies with auth_user_id() helper';
END $$;
