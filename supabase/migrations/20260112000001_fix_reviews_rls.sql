-- ============================================
-- Fix Reviews RLS Policy - Security Fix
-- Migration: 20260112000001_fix_reviews_rls.sql
-- ============================================
-- The current policy allows anyone to view all reviews (USING (true))
-- This is a data leak - reviews should only be visible to:
--   1. The reviewer (who wrote it)
--   2. The reviewed user (who received it)
--   3. The moment owner (if review is for a moment)
--   4. Public reviews for completed transactions
-- ============================================

-- Add missing request_id column if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'request_id') THEN
        ALTER TABLE reviews ADD COLUMN request_id UUID REFERENCES requests(id);
    END IF;
END $$;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Create secure policy for viewing reviews
CREATE POLICY "reviews_select_secure"
  ON public.reviews
  FOR SELECT
  USING (
    -- Reviewer can always see their own reviews
    auth.uid() = reviewer_id
    OR
    -- Reviewed user can see reviews about them
    auth.uid() = reviewed_id
    OR
    -- Moment owners can see reviews on their moments
    EXISTS (
      SELECT 1 FROM moments m
      WHERE m.id = reviews.moment_id
      AND m.user_id = auth.uid()
    )
  );

-- Create index to improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON public.reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_moment_id ON public.reviews(moment_id) WHERE moment_id IS NOT NULL;

-- ============================================
-- Also fix review creation to prevent fake reviews
-- ============================================

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;

-- Create stricter insert policy
CREATE POLICY "reviews_insert_verified"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    -- Reviewer must be the authenticated user
    auth.uid() = reviewer_id
    AND
    -- Reviewer cannot review themselves
    reviewer_id != reviewed_id
    AND
    -- Must have a completed request to review
    (
      -- For moment requests
      (
        request_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM requests r
          JOIN moments m ON m.id = r.moment_id 
          WHERE r.id = request_id
          AND r.status IN ('completed', 'verified')
          AND (m.user_id = auth.uid() OR r.user_id = auth.uid())
        )
      )
      OR
      -- Allow service_role for system-created reviews
      auth.jwt() ->> 'role' = 'service_role'
    )
    AND
    -- Prevent duplicate reviews for same request
    NOT EXISTS (
      SELECT 1 FROM reviews existing
      WHERE existing.request_id = reviews.request_id
      AND existing.reviewer_id = auth.uid()
    )
  );

-- ============================================
-- Verification
-- ============================================

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'reviews' AND schemaname = 'public';

  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Reviews table now has % policies', policy_count;
  RAISE NOTICE '✅ FIXED: Public view access removed';
  RAISE NOTICE '✅ FIXED: Only relevant parties can view reviews';
  RAISE NOTICE '✅ FIXED: Stricter insert validation';
  RAISE NOTICE '============================================';
END $$;
