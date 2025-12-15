-- ============================================
-- BLOCKER #2 FIX: Strict RLS Policies
-- File: supabase/migrations/20251213000001_fix_strict_rls.sql
-- ============================================

-- ============================================
-- 1. DROP INSECURE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view any profile" ON users;
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;

-- ============================================
-- 2. CREATE STRICT USER VISIBILITY POLICY
-- ============================================

-- Users can ONLY view profiles they have legitimate access to:
-- - Own profile
-- - Matched users
-- - Favorited users
-- - Users in same conversation
-- - Users whose moments they've interacted with
CREATE POLICY "Users can view matched profiles" ON users
FOR SELECT
USING (
  -- Own profile
  auth.uid() = id
  OR
  -- Active, non-deleted profiles with connection
  (deleted_at IS NULL AND (
    -- Has active match
    EXISTS (
      SELECT 1 FROM matches
      WHERE status = 'active'
        AND ((user1_id = auth.uid() AND user2_id = users.id)
          OR (user2_id = auth.uid() AND user1_id = users.id))
    )
    OR
    -- Has favorited this user
    EXISTS (
      SELECT 1 FROM favorites
      WHERE user_id = auth.uid()
        AND favorited_user_id = users.id
    )
    OR
    -- In same active conversation
    EXISTS (
      SELECT 1 FROM conversations
      WHERE auth.uid() = ANY(participant_ids)
        AND users.id = ANY(participant_ids)
        AND archived_at IS NULL
    )
    OR
    -- Interacted with their moment (sent request/gift)
    EXISTS (
      SELECT 1 FROM requests
      WHERE user_id = auth.uid()
        AND moment_id IN (SELECT id FROM moments WHERE user_id = users.id)
        AND status IN ('pending', 'accepted')
    )
    OR
    -- User is moment owner that current user requested
    EXISTS (
      SELECT 1 FROM moments m
      INNER JOIN requests r ON r.moment_id = m.id
      WHERE m.user_id = users.id
        AND r.user_id = auth.uid()
        AND r.status IN ('pending', 'accepted')
    )
  ))
);

COMMENT ON POLICY "Users can view matched profiles" ON users IS
'Strict privacy: Users can only view profiles they have legitimate connection with.
Prevents arbitrary profile browsing.';

-- ============================================
-- 3. CREATE STRICT REVIEW VISIBILITY POLICY
-- ============================================

-- Reviews are ONLY visible to:
-- - Review author
-- - Reviewed user
-- - Users who can see the reviewed user's profile
CREATE POLICY "Users can view relevant reviews" ON reviews
FOR SELECT
USING (
  -- Own reviews (as reviewer)
  auth.uid() = reviewer_id
  OR
  -- Reviews about me
  auth.uid() = reviewee_id
  OR
  -- Reviews about users I can see
  (
    -- Can see reviewee's profile via match/favorite/conversation
    reviewee_id IN (
      SELECT id FROM users
      WHERE
        auth.uid() = id  -- Own profile
        OR (deleted_at IS NULL AND (
          -- Has active match with reviewee
          EXISTS (
            SELECT 1 FROM matches
            WHERE status = 'active'
              AND ((user1_id = auth.uid() AND user2_id = users.id)
                OR (user2_id = auth.uid() AND user1_id = users.id))
          )
          OR
          -- In conversation with reviewee
          EXISTS (
            SELECT 1 FROM conversations
            WHERE auth.uid() = ANY(participant_ids)
              AND users.id = ANY(participant_ids)
              AND archived_at IS NULL
          )
        ))
    )
  )
);

COMMENT ON POLICY "Users can view relevant reviews" ON users IS
'Reviews are only visible to involved parties and connected users.
Prevents review harvesting.';

-- ============================================
-- 4. ADD HELPER FUNCTION FOR PROFILE VISIBILITY
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
  -- Self
  IF p_viewer_id = p_profile_id THEN
    RETURN TRUE;
  END IF;

  -- Check if profile is visible based on connections
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = p_profile_id
      AND deleted_at IS NULL
      AND (
        -- Match exists
        EXISTS (
          SELECT 1 FROM matches
          WHERE status = 'active'
            AND ((user1_id = p_viewer_id AND user2_id = p_profile_id)
              OR (user2_id = p_viewer_id AND user1_id = p_profile_id))
        )
        OR
        -- Favorite exists
        EXISTS (
          SELECT 1 FROM favorites
          WHERE user_id = p_viewer_id
            AND favorited_user_id = p_profile_id
        )
        OR
        -- Conversation exists
        EXISTS (
          SELECT 1 FROM conversations
          WHERE p_viewer_id = ANY(participant_ids)
            AND p_profile_id = ANY(participant_ids)
            AND archived_at IS NULL
        )
      )
  );
END;
$$;

COMMENT ON FUNCTION can_view_profile IS
'Helper function to check if a user can view another user''s profile.
Used in RLS policies and application logic.';

-- ============================================
-- 5. VERIFICATION QUERY
-- ============================================

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Verify strict policies are in place
  SELECT COUNT(*)
  INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('users', 'reviews')
    AND policyname IN (
      'Users can view matched profiles',
      'Users can view relevant reviews'
    );

  IF policy_count != 2 THEN
    RAISE EXCEPTION 'Strict RLS policies not properly created';
  END IF;

  -- Verify insecure policies are dropped
  SELECT COUNT(*)
  INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND policyname IN (
      'Users can view any profile',
      'Anyone can view reviews'
    );

  IF policy_count > 0 THEN
    RAISE EXCEPTION 'Insecure policies still exist!';
  END IF;

  RAISE NOTICE 'Strict RLS migration complete ✅';
  RAISE NOTICE '  - Insecure policies dropped ✅';
  RAISE NOTICE '  - Strict visibility policies created ✅';
  RAISE NOTICE '  - Helper function added ✅';
END $$;
