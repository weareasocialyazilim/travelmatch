-- ============================================================================
// Per-User Conversation Archive
// Fix: archived_at is now per-participant, not per-conversation
// ============================================================================

-- Drop old single-column approach
ALTER TABLE conversations DROP COLUMN IF EXISTS archived_at;

-- Create conversation_archive_state for per-user archive tracking
CREATE TABLE IF NOT EXISTS conversation_archive_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Index for efficient querying
CREATE INDEX idx_conversation_archive_user ON conversation_archive_state(user_id, archived_at);
CREATE INDEX idx_conversation_archive_conv ON conversation_archive_state(conversation_id);

-- RLS
ALTER TABLE conversation_archive_state ENABLE ROW LEVEL SECURITY;

-- Users can only see their own archive state
CREATE POLICY "Users view own archive state" ON conversation_archive_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own archive state" ON conversation_archive_state
  FOR ALL USING (auth.uid() = user_id);

-- View to get conversation with user's archive status
CREATE OR REPLACE VIEW conversations_with_archive AS
SELECT
  c.*,
  CASE WHEN a.archived_at IS NOT NULL THEN TRUE ELSE FALSE END as is_archived,
  a.archived_at
FROM conversations c
LEFT JOIN conversation_archive_state a ON c.id = a.conversation_id AND a.user_id = auth.uid();

-- Function to get user's active conversations
CREATE OR REPLACE FUNCTION get_active_conversations(p_user_id UUID)
RETURNS SETOF conversations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.*
  FROM conversations c
  WHERE c.id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id = p_user_id
  )
  AND NOT EXISTS (
    SELECT 1 FROM conversation_archive_state a
    WHERE a.conversation_id = c.id AND a.user_id = p_user_id AND a.archived_at IS NOT NULL
  )
  ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$;

-- Function to get user's archived conversations
CREATE OR REPLACE FUNCTION get_archived_conversations(p_user_id UUID)
RETURNS SETOF conversations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.*
  FROM conversations c
  WHERE c.id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id = p_user_id
  )
  AND EXISTS (
    SELECT 1 FROM conversation_archive_state a
    WHERE a.conversation_id = c.id AND a.user_id = p_user_id AND a.archived_at IS NOT NULL
  )
  ORDER BY a.archived_at DESC;
END;
$$;

-- Function to archive conversation for a user
CREATE OR REPLACE FUNCTION archive_conversation(p_user_id UUID, p_conversation_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO conversation_archive_state (conversation_id, user_id, archived_at)
  VALUES (p_conversation_id, p_user_id, NOW())
  ON CONFLICT (conversation_id, user_id)
  DO UPDATE SET archived_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'conversationId', p_conversation_id,
    'archivedAt', NOW()
  );
END;
$$;

-- Function to unarchive conversation for a user
CREATE OR REPLACE FUNCTION unarchive_conversation(p_user_id UUID, p_conversation_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE conversation_archive_state
  SET archived_at = NULL
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'conversationId', p_conversation_id,
    'unarchivedAt', NOW()
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_active_conversations TO authenticated;
GRANT EXECUTE ON FUNCTION get_archived_conversations TO authenticated;
GRANT EXECUTE ON FUNCTION archive_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION unarchive_conversation TO authenticated;

COMMENT ON TABLE conversation_archive_state IS 'Per-user conversation archive state. User A can archive while User B sees it normally.';
