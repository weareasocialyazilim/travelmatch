-- Migration: Fix MEDIUM priority SECURITY DEFINER function - Add search_path protection
-- Date: 9 Aralık 2025
-- Priority: 🟡 MEDIUM (Batch 2 - 1 function)
--
-- Issue: SECURITY DEFINER function without SET search_path vulnerable to schema hijacking
-- Risk Level: MEDIUM - Participant data exposure
--
-- Functions Fixed:
--   1. get_conversation_participants → Add SET search_path + explicit schema

-- ============================================
-- FIX: get_conversation_participants
-- ============================================
-- Risk: Data exposure - can retrieve participant list
-- Impact: Privacy violation, participant info leak

CREATE OR REPLACE FUNCTION get_conversation_participants(conv_id UUID)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  last_read_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- 👈 ADDED: Schema hijacking protection
AS $$
BEGIN
  -- Use explicit schema prefixes
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

COMMENT ON FUNCTION get_conversation_participants IS 
'Returns list of active participants in a conversation. SECURITY DEFINER with search_path protection against schema hijacking.';

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  func_count INTEGER;
  search_path_count INTEGER;
BEGIN
  -- Check if function has search_path
  SELECT COUNT(*) INTO search_path_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname = 'get_conversation_participants'
    AND p.prosecdef = true
    AND p.proconfig IS NOT NULL
    AND array_to_string(p.proconfig, ',') LIKE '%search_path%';
  
  IF search_path_count = 1 THEN
    RAISE NOTICE '✅ Batch 2 (MEDIUM): get_conversation_participants secured with SET search_path';
  ELSE
    RAISE WARNING '⚠️ get_conversation_participants search_path not found';
  END IF;
END $$;
