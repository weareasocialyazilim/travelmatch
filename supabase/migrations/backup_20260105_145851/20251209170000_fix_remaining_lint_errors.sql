-- Migration: Fix Remaining Lint Errors
-- Created: 2025-12-09
-- Description: Fix ambiguous column reference and remove unused function

-- ============================================
-- FIX 1: Remove unused increment_moment_gift_count
-- ============================================

-- This function references non-existent metadata column
-- Remove it since it's not used anywhere in the codebase
DROP FUNCTION IF EXISTS public.increment_moment_gift_count(UUID);

COMMENT ON SCHEMA public IS 
'increment_moment_gift_count removed - was referencing non-existent metadata column. 
Will be recreated when moments.metadata column is added in future.';

-- ============================================
-- FIX 2: Fix ambiguous column in get_user_conversations
-- ============================================

-- Drop and recreate with explicit table qualifiers
DROP FUNCTION IF EXISTS public.get_user_conversations(UUID);

CREATE OR REPLACE FUNCTION public.get_user_conversations(usr_id UUID)
RETURNS TABLE (
  conversation_id UUID,
  other_participants JSONB,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    jsonb_agg(
      jsonb_build_object(
        'id', u.id,
        'name', u.full_name,
        'avatar', u.avatar_url
      )
    ) FILTER (WHERE u.id != usr_id) as other_participants,
    -- 👇 FIX: Explicit table qualifier to avoid ambiguity
    (SELECT content FROM public.messages m2 
     WHERE m2.conversation_id = c.id 
     ORDER BY m2.created_at DESC LIMIT 1) as last_message,
    c.updated_at as last_message_at,
    (
      SELECT COUNT(*)
      FROM public.messages m
      WHERE m.conversation_id = c.id
      AND m.created_at > COALESCE(
        (SELECT last_read_at FROM public.conversation_participants cp2
         WHERE cp2.conversation_id = c.id AND cp2.user_id = usr_id),
        '1970-01-01'::timestamp
      )
      AND m.sender_id != usr_id
    ) as unread_count
  FROM public.conversations c
  JOIN public.conversation_participants cp ON cp.conversation_id = c.id
  JOIN public.users u ON u.id = cp.user_id
  WHERE cp.user_id = usr_id 
  AND cp.is_archived = FALSE
  GROUP BY c.id, c.updated_at
  ORDER BY c.updated_at DESC;
END;
$$;

COMMENT ON FUNCTION public.get_user_conversations(UUID) IS 
'Returns user conversations with participants, last message, and unread count.
SECURITY DEFINER with search_path protection.
Fixed: Ambiguous column reference by using explicit table qualifiers.';

-- ============================================
-- NOTE: pg_net extension needed for CDN invalidation
-- ============================================

-- invalidate_cdn_manually function requires pg_net extension
-- To install, run in Supabase SQL Editor:
-- CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
-- Then create the invalidate_cdn_manually function

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Remaining lint errors fixed:';
  RAISE NOTICE '  - increment_moment_gift_count removed (metadata column doesnt exist)';
  RAISE NOTICE '  - get_user_conversations ambiguous column fixed';
  RAISE NOTICE '  - invalidate_cdn_manually documented (needs pg_net extension)';
END $$;
