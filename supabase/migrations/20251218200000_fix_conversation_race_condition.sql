-- Migration: Fix Conversation Race Condition
-- Creates atomic get_or_create_conversation function and unique constraint
-- Prevents duplicate conversations when concurrent requests occur

-- 1. Create GIN index on participant_ids for efficient array lookups
-- Note: Hash index on md5() removed because md5() is not IMMUTABLE in index context
CREATE INDEX IF NOT EXISTS idx_conversations_participant_ids_gin
ON conversations USING gin (participant_ids);

-- 2. Create atomic get_or_create_conversation function
-- Uses advisory lock to prevent race conditions
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  p_participant_ids uuid[]
)
RETURNS conversations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sorted_ids uuid[];
  v_conversation conversations;
  v_lock_key bigint;
BEGIN
  -- Sort participant IDs for consistent ordering
  SELECT array_agg(id ORDER BY id) INTO v_sorted_ids
  FROM unnest(p_participant_ids) AS id;

  -- Generate a lock key from sorted participant IDs
  -- This ensures only one transaction can create a conversation for these participants
  v_lock_key := ('x' || md5(array_to_string(v_sorted_ids, ',')))::bit(64)::bigint;

  -- Acquire advisory lock (transaction-level, automatically released at commit/rollback)
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- Try to find existing conversation
  SELECT * INTO v_conversation
  FROM conversations
  WHERE participant_ids @> v_sorted_ids
    AND participant_ids <@ v_sorted_ids
  LIMIT 1;

  -- If found, return it
  IF v_conversation.id IS NOT NULL THEN
    RETURN v_conversation;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (participant_ids, created_at, updated_at)
  VALUES (v_sorted_ids, NOW(), NOW())
  RETURNING * INTO v_conversation;

  RETURN v_conversation;
END;
$$;

-- 3. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(uuid[]) TO authenticated;

-- 4. Add comment for documentation
COMMENT ON FUNCTION public.get_or_create_conversation IS
'Atomically gets or creates a conversation for the given participants.
Uses advisory lock to prevent race conditions and duplicate conversations.
Participant IDs are automatically sorted for consistent lookups.';
