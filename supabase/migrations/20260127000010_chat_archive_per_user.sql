-- ============================================================================
-- Per-User Conversation Archive (FIXED)
-- ============================================================================
-- Note: Fixed function name conflicts by dropping old versions first

-- Drop old columns if exist
ALTER TABLE conversations DROP COLUMN IF EXISTS archived_at;

-- Create conversation_archive_state table
CREATE TABLE IF NOT EXISTS conversation_archive_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversation_archive_user ON conversation_archive_state(user_id, archived_at);
CREATE INDEX IF NOT EXISTS idx_conversation_archive_conv ON conversation_archive_state(conversation_id);

-- RLS
ALTER TABLE conversation_archive_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own archive state" ON conversation_archive_state FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own archive state" ON conversation_archive_state FOR ALL USING (auth.uid() = user_id);

-- View to get conversation with user's archive status
DROP VIEW IF EXISTS conversations_with_archive;
CREATE VIEW conversations_with_archive AS
SELECT
  c.*,
  CASE WHEN a.archived_at IS NOT NULL THEN TRUE ELSE FALSE END as is_archived,
  a.archived_at
FROM conversations c
LEFT JOIN conversation_archive_state a ON c.id = a.conversation_id AND a.user_id = auth.uid();

-- Drop old functions to avoid conflicts
DROP FUNCTION IF EXISTS get_active_conversations(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_archived_conversations(UUID) CASCADE;
DROP FUNCTION IF EXISTS archive_conversation(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS archive_conversation(UUID) CASCADE;
DROP FUNCTION IF EXISTS unarchive_conversation(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS unarchive_conversation(UUID) CASCADE;
DROP FUNCTION IF EXISTS hold_period_remaining(UUID) CASCADE;

-- Function to get user's active conversations
CREATE OR REPLACE FUNCTION get_active_conversations(p_user_id UUID)
RETURNS TABLE(id UUID, created_at TIMESTAMPTZ) LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.created_at FROM conversations c
  JOIN conversation_participants cp ON c.id = cp.conversation_id
  WHERE cp.user_id = p_user_id
  AND NOT EXISTS (
    SELECT 1 FROM conversation_archive_state a
    WHERE a.conversation_id = c.id AND a.user_id = p_user_id AND a.archived_at IS NOT NULL
  )
  ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$;

-- Function to get user's archived conversations
CREATE OR REPLACE FUNCTION get_archived_conversations(p_user_id UUID)
RETURNS TABLE(id UUID, created_at TIMESTAMPTZ) LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.created_at FROM conversations c
  JOIN conversation_participants cp ON c.id = cp.conversation_id
  WHERE cp.user_id = p_user_id
  AND EXISTS (
    SELECT 1 FROM conversation_archive_state a
    WHERE a.conversation_id = c.id AND a.user_id = p_user_id AND a.archived_at IS NOT NULL
  )
  ORDER BY a.archived_at DESC;
END;
$$;

-- Function to archive conversation for a user
CREATE OR REPLACE FUNCTION archive_conversation(p_user_id UUID, p_conversation_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN
  INSERT INTO conversation_archive_state (conversation_id, user_id, archived_at)
  VALUES (p_conversation_id, p_user_id, NOW())
  ON CONFLICT (conversation_id, user_id)
  DO UPDATE SET archived_at = NOW();
  RETURN jsonb_build_object('success', true, 'conversationId', p_conversation_id);
END;
$$;

-- Function to unarchive conversation for a user
CREATE OR REPLACE FUNCTION unarchive_conversation(p_user_id UUID, p_conversation_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN
  DELETE FROM conversation_archive_state WHERE conversation_id = p_conversation_id AND user_id = p_user_id;
  RETURN jsonb_build_object('success', true, 'conversationId', p_conversation_id);
END;
$$;

-- Function to check hold period remaining
CREATE OR REPLACE FUNCTION hold_period_remaining(p_escrow_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
DECLARE v_escrow RECORD; v_remaining INTERVAL;
BEGIN
  SELECT * INTO v_escrow FROM escrow_transactions WHERE id = p_escrow_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Escrow not found'); END IF;
  v_remaining := COALESCE(v_escrow.expires_at, v_escrow.created_at + INTERVAL '24 hours') - NOW();
  RETURN jsonb_build_object('remaining_seconds', EXTRACT(EPOCH FROM v_remaining)::INTEGER, 'expires_at', v_escrow.expires_at);
END;
$$;

-- Grants
GRANT SELECT ON conversations TO authenticated;
GRANT SELECT ON conversation_archive_state TO authenticated;
GRANT SELECT ON conversations_with_archive TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_conversations TO authenticated;
GRANT EXECUTE ON FUNCTION get_archived_conversations TO authenticated;
GRANT EXECUTE ON FUNCTION archive_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION unarchive_conversation TO authenticated;

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Per-user conversation archive applied';
  RAISE NOTICE '- conversation_archive_state table created';
  RAISE NOTICE '- Archive functions created';
  RAISE NOTICE '- Conversations view updated';
  RAISE NOTICE '============================================';
END $$;
