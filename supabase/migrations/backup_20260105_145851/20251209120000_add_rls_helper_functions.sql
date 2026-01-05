-- Migration: Add RLS Helper Functions
-- Version: 2.0.0
-- Created: 2025-12-09
-- Description: Performance-optimized helper functions for RLS policies

-- ============================================
-- CORE AUTH HELPERS
-- ============================================

-- Helper: Cached User ID
-- Returns current authenticated user ID, cached within transaction
CREATE OR REPLACE FUNCTION public.auth_user_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.uid();
$$;

COMMENT ON FUNCTION public.auth_user_id() IS 
'Returns current authenticated user ID. Cached within transaction (STABLE). Use instead of auth.uid() for better performance.';

-- ============================================

-- Helper: Cached User Role
-- Returns current user role (anon/authenticated/service_role)
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(auth.jwt() ->> 'role', 'anon');
$$;

COMMENT ON FUNCTION public.auth_user_role() IS 
'Returns current user role from JWT. Cached within transaction (STABLE).';

-- ============================================

-- Helper: Check Service Role
-- Returns TRUE if current context is service_role
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth_user_role() = 'service_role';
$$;

COMMENT ON FUNCTION public.is_service_role() IS 
'Returns TRUE if current context is service_role. For internal operations only.';

-- ============================================

-- Helper: Check Admin Status
-- Returns TRUE if current user is admin (based on verified status or future role column)
-- NOTE: Currently using verified status as proxy for admin. Update when role column exists.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  -- For now, check service_role as admin equivalent
  -- Update this when users table has role column
  SELECT auth_user_role() = 'service_role';
$$;

COMMENT ON FUNCTION public.is_admin() IS 
'Returns TRUE if current user is admin. Currently checks service_role. Update when users.role column exists.';

-- ============================================
-- RELATIONSHIP HELPERS
-- ============================================

-- Helper: User's Conversations
-- Returns all conversation IDs where current user is a participant
CREATE OR REPLACE FUNCTION public.user_conversation_ids()
RETURNS SETOF UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT id 
  FROM public.conversations 
  WHERE auth_user_id() = ANY(participant_ids);
$$;

COMMENT ON FUNCTION public.user_conversation_ids() IS 
'Returns all conversation IDs where current user is a participant. Replaces subquery pattern for better performance.';

-- ============================================

-- Helper: User's Moments
-- Returns all moment IDs owned by current user
CREATE OR REPLACE FUNCTION public.user_moment_ids()
RETURNS SETOF UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT id 
  FROM public.moments 
  WHERE user_id = auth_user_id();
$$;

COMMENT ON FUNCTION public.user_moment_ids() IS 
'Returns all moment IDs owned by current user. Replaces subquery pattern for better performance.';

-- ============================================
-- INDEXES FOR HELPER FUNCTIONS
-- ============================================

-- Ensure conversations.participant_ids has GIN index for array operations
CREATE INDEX IF NOT EXISTS idx_conversations_participant_ids_gin 
ON public.conversations USING GIN (participant_ids);

COMMENT ON INDEX public.idx_conversations_participant_ids_gin IS 
'GIN index for fast array membership checks in conversations RLS policies';

-- Note: idx_users_role will be added when users table gets role column
-- For now, is_admin() uses service_role check which doesn't need index

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.auth_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_service_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_conversation_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_moment_ids() TO authenticated;

-- Grant to service_role for backend operations
GRANT EXECUTE ON FUNCTION public.auth_user_id() TO service_role;
GRANT EXECUTE ON FUNCTION public.auth_user_role() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_service_role() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
GRANT EXECUTE ON FUNCTION public.user_conversation_ids() TO service_role;
GRANT EXECUTE ON FUNCTION public.user_moment_ids() TO service_role;
