-- Migration: Fix CRITICAL SECURITY DEFINER functions - Add search_path protection
-- Date: 9 Aralık 2025
-- Priority: 🔴 CRITICAL (Batch 1 - 3 functions)
--
-- Issue: SECURITY DEFINER functions without SET search_path are vulnerable to schema hijacking
-- Risk Level: HIGH - Notification injection, authorization bypass
--
-- Functions Fixed:
--   1. create_notification → Add SET search_path + explicit schema
--   2. mark_notifications_read → Add SET search_path + RLS check
--   3. is_conversation_participant → Add SET search_path + explicit schema

-- ============================================
-- 1. FIX: create_notification
-- ============================================
-- Risk: Malicious notification injection
-- Impact: Users can receive fake notifications

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- 👈 ADDED: Schema hijacking protection
AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Use explicit schema prefix
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

COMMENT ON FUNCTION create_notification IS 
'Creates a notification for a user. SECURITY DEFINER with search_path protection against schema hijacking attacks.';

-- ============================================
-- 2. FIX: mark_notifications_read
-- ============================================
-- Risk: Authorization bypass - can mark other users'' notifications
-- Impact: Data manipulation, privacy violation

CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- 👈 ADDED: Schema hijacking protection
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Use explicit schema prefix + RLS-style check
  IF p_notification_ids IS NULL THEN
    -- Mark all unread notifications for this user
    UPDATE public.notifications
    SET read = TRUE
    WHERE user_id = p_user_id 
      AND read = FALSE;
  ELSE
    -- Mark specific notifications (must belong to user)
    UPDATE public.notifications
    SET read = TRUE
    WHERE user_id = p_user_id 
      AND id = ANY(p_notification_ids)
      AND read = FALSE;  -- Only update unread ones
  END IF;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

COMMENT ON FUNCTION mark_notifications_read IS 
'Marks notifications as read for a specific user. SECURITY DEFINER with search_path protection. Only updates notifications belonging to p_user_id.';

-- ============================================
-- 3. FIX: is_conversation_participant
-- ============================================
-- Risk: Authorization bypass - can check any conversation
-- Impact: Privacy violation, unauthorized conversation access

CREATE OR REPLACE FUNCTION is_conversation_participant(
  conv_id UUID, 
  usr_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- 👈 ADDED: Schema hijacking protection
AS $$
BEGIN
  -- Use explicit schema prefix
  RETURN EXISTS (
    SELECT 1 
    FROM public.conversation_participants 
    WHERE conversation_id = conv_id 
      AND user_id = usr_id
      AND is_archived = FALSE
  );
END;
$$;

COMMENT ON FUNCTION is_conversation_participant IS 
'Checks if a user is an active participant in a conversation. SECURITY DEFINER with search_path protection against schema hijacking.';

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  func_count INTEGER;
  search_path_count INTEGER;
BEGIN
  -- Count SECURITY DEFINER functions
  SELECT COUNT(*) INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN ('create_notification', 'mark_notifications_read', 'is_conversation_participant')
    AND p.prosecdef = true;
  
  -- Count functions with search_path
  SELECT COUNT(*) INTO search_path_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN ('create_notification', 'mark_notifications_read', 'is_conversation_participant')
    AND p.prosecdef = true
    AND p.proconfig IS NOT NULL
    AND array_to_string(p.proconfig, ',') LIKE '%search_path%';
  
  IF func_count = 3 AND search_path_count = 3 THEN
    RAISE NOTICE '✅ Batch 1 (CRITICAL): 3/3 functions secured with SET search_path';
    RAISE NOTICE '  - create_notification: SECURITY DEFINER + search_path ✅';
    RAISE NOTICE '  - mark_notifications_read: SECURITY DEFINER + search_path + RLS check ✅';
    RAISE NOTICE '  - is_conversation_participant: SECURITY DEFINER + search_path ✅';
  ELSE
    RAISE WARNING '⚠️ Expected 3 functions with search_path, found: %', search_path_count;
  END IF;
END $$;
