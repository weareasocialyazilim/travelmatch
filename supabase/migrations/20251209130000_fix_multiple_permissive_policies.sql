-- Migration: Fix Multiple Permissive Policies
-- Version: 2.0.0
-- Created: 2025-12-09
-- Description: Consolidate multiple permissive policies to eliminate lint warnings

-- ============================================
-- BLOCKS TABLE - FIX MULTIPLE PERMISSIVE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own blocks" ON public.blocks;
DROP POLICY IF EXISTS "Users can check if blocked" ON public.blocks;

-- Consolidated SELECT policy (blocker OR blocked can view)
DROP POLICY IF EXISTS "blocks_select_participants" ON public.blocks;
CREATE POLICY "blocks_select_participants" ON public.blocks
FOR SELECT
USING (
  blocker_id = auth_user_id() 
  OR blocked_id = auth_user_id()
);

COMMENT ON POLICY "blocks_select_participants" ON public.blocks IS 
'Both blocker and blocked user can view the block record';

-- INSERT: Only blocker can create blocks
DROP POLICY IF EXISTS "blocks_insert_blocker" ON public.blocks;
CREATE POLICY "blocks_insert_blocker" ON public.blocks
FOR INSERT
WITH CHECK (blocker_id = auth_user_id());

COMMENT ON POLICY "blocks_insert_blocker" ON public.blocks IS 
'Only the blocker can create new block records';

-- DELETE: Only blocker can remove blocks
DROP POLICY IF EXISTS "blocks_delete_blocker" ON public.blocks;
CREATE POLICY "blocks_delete_blocker" ON public.blocks
FOR DELETE
USING (blocker_id = auth_user_id());

COMMENT ON POLICY "blocks_delete_blocker" ON public.blocks IS 
'Only the blocker can remove (unblock) block records';

-- No UPDATE policy (blocks are immutable once created)

-- ============================================
-- REQUESTS TABLE - FIX MULTIPLE PERMISSIVE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own requests" ON public.requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.requests;
DROP POLICY IF EXISTS "Users can update own requests" ON public.requests;
DROP POLICY IF EXISTS "Moment owners can update requests" ON public.requests;
DROP POLICY IF EXISTS "Users can cancel own requests" ON public.requests;

-- SELECT: Requester OR moment owner can view
DROP POLICY IF EXISTS "requests_select_related" ON public.requests;
CREATE POLICY "requests_select_related" ON public.requests
FOR SELECT
USING (
  user_id = auth_user_id()
  OR moment_id IN (SELECT user_moment_ids())
);

COMMENT ON POLICY "requests_select_related" ON public.requests IS 
'Requester and moment owner can view request. Uses helper function for performance.';

-- INSERT: Only requester can create
DROP POLICY IF EXISTS "requests_insert_requester" ON public.requests;
CREATE POLICY "requests_insert_requester" ON public.requests
FOR INSERT
WITH CHECK (user_id = auth_user_id());

COMMENT ON POLICY "requests_insert_requester" ON public.requests IS 
'Users can create requests for moments';

-- UPDATE: Requester OR moment owner can update (consolidated)
DROP POLICY IF EXISTS "requests_update_related" ON public.requests;
CREATE POLICY "requests_update_related" ON public.requests
FOR UPDATE
USING (
  user_id = auth_user_id()
  OR moment_id IN (SELECT user_moment_ids())
);

COMMENT ON POLICY "requests_update_related" ON public.requests IS 
'Both requester and moment owner can update request status. Consolidates previous multiple policies.';

-- DELETE: Only requester can delete (cancel)
DROP POLICY IF EXISTS "requests_delete_requester" ON public.requests;
CREATE POLICY "requests_delete_requester" ON public.requests
FOR DELETE
USING (user_id = auth_user_id());

COMMENT ON POLICY "requests_delete_requester" ON public.requests IS 
'Only the requester can cancel (delete) their own requests';

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify no multiple permissive policies remain
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Check blocks table
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'blocks'
    AND cmd = 'SELECT';
  
  IF policy_count > 1 THEN
    RAISE WARNING 'Multiple SELECT policies still exist on blocks table: %', policy_count;
  END IF;

  -- Check requests table
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'requests'
    AND cmd = 'UPDATE';
  
  IF policy_count > 1 THEN
    RAISE WARNING 'Multiple UPDATE policies still exist on requests table: %', policy_count;
  END IF;

  RAISE NOTICE 'Multiple permissive policies fixed successfully';
END $$;
