-- Migration: Fix LOW priority trigger functions - Add search_path protection
-- Date: 9 Aralık 2025
-- Priority: 🟢 LOW (Batch 3 - 4 trigger functions)
--
-- Issue: SECURITY DEFINER trigger functions without SET search_path
-- Risk Level: LOW - Trigger functions (no direct user input)
--
-- Functions Fixed:
--   1. track_moment_changes → Add SET search_path + explicit schema
--   2. track_match_changes → Add SET search_path + explicit schema
--   3. track_message_changes → Add SET search_path + explicit schema
--   4. cleanup_old_feed_delta → Add SET search_path + explicit schema

-- ============================================
-- 1. FIX: track_moment_changes
-- ============================================

CREATE OR REPLACE FUNCTION track_moment_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- 👈 ADDED: Schema hijacking protection
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES ('insert', 'moment', NEW.id, NEW.user_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES ('update', 'moment', NEW.id, NEW.user_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES ('delete', 'moment', OLD.id, OLD.user_id, NULL);
    RETURN OLD;
  END IF;
END;
$$;

COMMENT ON FUNCTION track_moment_changes IS 
'Automatically track changes to moments table in feed_delta. SECURITY DEFINER with search_path protection.';

-- ============================================
-- 2. FIX: track_match_changes
-- ============================================

CREATE OR REPLACE FUNCTION track_match_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- 👈 ADDED: Schema hijacking protection
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Insert for both users in the match
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES 
      ('insert', 'match', NEW.id, NEW.user_a_id, to_jsonb(NEW)),
      ('insert', 'match', NEW.id, NEW.user_b_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update for both users
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES 
      ('update', 'match', NEW.id, NEW.user_a_id, to_jsonb(NEW)),
      ('update', 'match', NEW.id, NEW.user_b_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Delete for both users
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES 
      ('delete', 'match', OLD.id, OLD.user_a_id, NULL),
      ('delete', 'match', OLD.id, OLD.user_b_id, NULL);
    RETURN OLD;
  END IF;
END;
$$;

COMMENT ON FUNCTION track_match_changes IS 
'Automatically track changes to matches table in feed_delta. SECURITY DEFINER with search_path protection.';

-- ============================================
-- 3. FIX: track_message_changes
-- ============================================

CREATE OR REPLACE FUNCTION track_message_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- 👈 ADDED: Schema hijacking protection
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Insert for both sender and receiver
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES 
      ('insert', 'message', NEW.id, NEW.sender_id, to_jsonb(NEW)),
      ('insert', 'message', NEW.id, NEW.receiver_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update for both users
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES 
      ('update', 'message', NEW.id, NEW.sender_id, to_jsonb(NEW)),
      ('update', 'message', NEW.id, NEW.receiver_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Delete for both users
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES 
      ('delete', 'message', OLD.id, OLD.sender_id, NULL),
      ('delete', 'message', OLD.id, OLD.receiver_id, NULL);
    RETURN OLD;
  END IF;
END;
$$;

COMMENT ON FUNCTION track_message_changes IS 
'Automatically track changes to messages table in feed_delta. SECURITY DEFINER with search_path protection.';

-- ============================================
-- 4. FIX: cleanup_old_feed_delta
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_old_feed_delta()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- 👈 ADDED: Schema hijacking protection
AS $$
BEGIN
  DELETE FROM public.feed_delta
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;

COMMENT ON FUNCTION cleanup_old_feed_delta IS 
'Remove delta records older than 7 days. SECURITY DEFINER with search_path protection.';

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  func_count INTEGER;
  search_path_count INTEGER;
BEGIN
  -- Count SECURITY DEFINER trigger functions
  SELECT COUNT(*) INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'track_moment_changes', 
      'track_match_changes', 
      'track_message_changes', 
      'cleanup_old_feed_delta'
    )
    AND p.prosecdef = true;
  
  -- Count functions with search_path
  SELECT COUNT(*) INTO search_path_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'track_moment_changes', 
      'track_match_changes', 
      'track_message_changes', 
      'cleanup_old_feed_delta'
    )
    AND p.prosecdef = true
    AND p.proconfig IS NOT NULL
    AND array_to_string(p.proconfig, ',') LIKE '%search_path%';
  
  IF func_count = 4 AND search_path_count = 4 THEN
    RAISE NOTICE '✅ Batch 3 (LOW): 4/4 trigger functions secured with SET search_path';
    RAISE NOTICE '  - track_moment_changes: SECURITY DEFINER + search_path ✅';
    RAISE NOTICE '  - track_match_changes: SECURITY DEFINER + search_path ✅';
    RAISE NOTICE '  - track_message_changes: SECURITY DEFINER + search_path ✅';
    RAISE NOTICE '  - cleanup_old_feed_delta: SECURITY DEFINER + search_path ✅';
  ELSE
    RAISE WARNING '⚠️ Expected 4 functions with search_path, found: %', search_path_count;
  END IF;
END $$;
