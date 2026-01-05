-- =====================================================
-- SECURITY DEFINER AUDIT & OPTIMIZATION
-- Created: 2024-12-18
-- Purpose: Convert non-essential SECURITY DEFINER to INVOKER
-- =====================================================

-- Analysis Summary:
-- Total SECURITY DEFINER functions: 35 (excluding PostGIS st_* functions)
-- Required DEFINER (RLS bypass, system): 33
-- Changed to INVOKER: 2

-- =====================================================
-- CONVERT TO SECURITY INVOKER
-- These functions don't need elevated privileges
-- RLS policies will protect data access
-- =====================================================

-- 1. get_conversation_participants - Direct API call, RLS protects data
CREATE OR REPLACE FUNCTION public.get_conversation_participants(conv_id uuid)
RETURNS TABLE(user_id uuid, full_name text, avatar_url text, last_read_at timestamp with time zone)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER  -- Changed from DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    u.avatar_url,
    cp.last_read_at
  FROM public.conversation_participants cp
  JOIN public.users u ON u.id = cp.user_id
  WHERE cp.conversation_id = conv_id
    AND cp.is_archived = FALSE;
END;
$$;

-- 2. get_user_conversations - Direct API call, RLS protects data
CREATE OR REPLACE FUNCTION public.get_user_conversations(usr_id uuid)
RETURNS TABLE(
  conversation_id uuid, 
  other_participants jsonb, 
  last_message text, 
  last_message_at timestamp with time zone, 
  unread_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER  -- Changed from DEFINER
SET search_path TO 'public', 'pg_temp'
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

-- =====================================================
-- SECURITY DEFINER AUDIT RESULTS
-- =====================================================
-- The following functions MUST remain SECURITY DEFINER:
-- 
-- Auth Helpers (3):
--   auth_user_id, auth_user_role, is_admin, is_service_role
--
-- RLS Policy Helpers (4):
--   can_access_conversation, can_view_profile, 
--   is_conversation_participant, user_conversation_ids, user_moment_ids
--
-- Financial Operations (6):
--   create_escrow_transaction, release_escrow, refund_escrow,
--   refund_expired_escrow, increment_user_balance, decrement_user_balance
--
-- System Functions (8):
--   handle_new_user, create_notification, mark_notifications_read,
--   soft_delete_user, check_rate_limit, cleanup_rate_limits,
--   record_rate_limit_violation, invalidate_cdn_manually
--
-- Sync Triggers (5):
--   sync_junction_from_participant_ids, sync_participant_ids_from_junction,
--   populate_junction_on_conversation_insert, cleanup_old_feed_delta
--
-- Feed Delta Triggers (3):
--   track_match_changes, track_message_changes, track_moment_changes
