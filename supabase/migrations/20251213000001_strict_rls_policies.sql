-- ============================================
-- STRICT RLS Policies (CORRECTED)
-- Migration: 20251213000001_strict_rls_policies.sql
-- 
-- NOTE: This migration was corrected on 2025-12-15 to remove
-- references to non-existent tables (matches) and columns
-- (favorites.favorited_user_id).
-- 
-- The actual schema has:
-- - favorites table: (id, user_id, moment_id, created_at) - favorites moments, not users
-- - No matches table exists
-- ============================================

-- ============================================
-- 1. DROP INSECURE/BROKEN POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view any profile" ON users;
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can view matched profiles" ON users;

-- ============================================
-- 2. CREATE CORRECTED USER VISIBILITY POLICY
-- ============================================

-- Users can ONLY view profiles they have legitimate access to:
-- - Own profile
-- - Users in same conversation
-- - Users whose moments they've interacted with (requests)
-- - Users whose moments they've favorited
-- - Users with active moments (for discovery)
DROP POLICY IF EXISTS "Users can view connected profiles" ON users;
CREATE POLICY "Users can view connected profiles" ON users
FOR SELECT
USING (
  -- Always can view own profile
  auth.uid() = id
  OR
  -- Non-deleted profiles with legitimate connection
  (deleted_at IS NULL AND (
    -- In same active conversation
    EXISTS (
      SELECT 1 FROM conversations
      WHERE auth.uid() = ANY(participant_ids)
        AND users.id = ANY(participant_ids)
    )
    OR
    -- Has sent request for their moment (requester views host)
    EXISTS (
      SELECT 1 FROM requests r
      INNER JOIN moments m ON m.id = r.moment_id
      WHERE r.user_id = auth.uid() 
        AND m.user_id = users.id
        AND r.status IN ('pending', 'accepted')
    )
    OR
    -- Received request from them (host views requester)
    EXISTS (
      SELECT 1 FROM moments m
      INNER JOIN requests r ON r.moment_id = m.id
      WHERE m.user_id = auth.uid()
        AND r.user_id = users.id
        AND r.status IN ('pending', 'accepted')
    )
    OR
    -- Has favorited one of their active moments
    EXISTS (
      SELECT 1 FROM favorites f
      INNER JOIN moments m ON m.id = f.moment_id
      WHERE f.user_id = auth.uid()
        AND m.user_id = users.id
        AND m.status = 'active'
    )
    OR
    -- Has active moments (public for discovery)
    EXISTS (
      SELECT 1 FROM moments m
      WHERE m.user_id = users.id
        AND m.status = 'active'
    )
  ))
);

COMMENT ON POLICY "Users can view connected profiles" ON users IS
'Privacy-respecting profile visibility. Users can view: own profile, 
conversation partners, request counterparts, favorited moment owners, 
and users with active moments.';

-- ============================================
-- 3. CREATE CORRECTED REVIEW VISIBILITY POLICY
-- ============================================

DROP POLICY IF EXISTS "Users can view relevant reviews" ON reviews;
CREATE POLICY "Users can view relevant reviews" ON reviews
FOR SELECT
USING (
  -- Own reviews as reviewer
  auth.uid() = reviewer_id
  OR
  -- Reviews about current user
  auth.uid() = reviewed_id
  OR
  -- Reviews for completed moments (public feedback)
  EXISTS (
    SELECT 1 FROM moments m
    WHERE m.id = reviews.moment_id
      AND m.status = 'completed'
  )
);

COMMENT ON POLICY "Users can view relevant reviews" ON reviews IS
'Review visibility: reviewers see own reviews, reviewed users see reviews 
about them, anyone can see reviews for completed moments.';

-- ============================================
-- 4. HELPER FUNCTION (CORRECTED)
-- ============================================

CREATE OR REPLACE FUNCTION can_view_profile(
  p_viewer_id UUID,
  p_profile_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Self view always allowed
  IF p_viewer_id = p_profile_id THEN
    RETURN TRUE;
  END IF;

  -- Check for legitimate connections
  RETURN EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = p_profile_id
      AND u.deleted_at IS NULL
      AND (
        -- Conversation connection
        EXISTS (
          SELECT 1 FROM conversations c
          WHERE p_viewer_id = ANY(c.participant_ids)
            AND p_profile_id = ANY(c.participant_ids)
        )
        OR
        -- Request connection (either direction)
        EXISTS (
          SELECT 1 FROM requests r
          INNER JOIN moments m ON m.id = r.moment_id
          WHERE (
            (r.user_id = p_viewer_id AND m.user_id = p_profile_id)
            OR
            (m.user_id = p_viewer_id AND r.user_id = p_profile_id)
          )
          AND r.status IN ('pending', 'accepted')
        )
        OR
        -- Has active moments (public discovery)
        EXISTS (
          SELECT 1 FROM moments m
          WHERE m.user_id = p_profile_id
            AND m.status = 'active'
        )
      )
  );
END;
$$;

COMMENT ON FUNCTION can_view_profile IS
'Helper function to check if a user can view another profile.
Based on conversations, requests, or active moments.';

-- Grant execute permission
GRANT EXECUTE ON FUNCTION can_view_profile(UUID, UUID) TO authenticated;

-- ============================================
-- 5. VERIFICATION
-- ============================================

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Verify policies exist
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'users'
    AND policyname = 'Users can view connected profiles';

  IF policy_count = 0 THEN
    RAISE EXCEPTION 'User visibility policy not created!';
  END IF;

  RAISE NOTICE '✅ Strict RLS policies applied successfully';
END $$;
