-- Normalize Conversations: Fix N+1 Query Problem
-- Migration Date: 2024-12-08
-- Purpose: Replace participant_ids ARRAY with proper junction table
--          to eliminate N+1 queries and improve query performance

-- ============================================
-- CREATE JUNCTION TABLE
-- ============================================

-- Create conversation_participants junction table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_read_at TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- Prevent duplicate entries
  UNIQUE(conversation_id, user_id)
);

-- Create indexes for optimal query performance
CREATE INDEX idx_conversation_participants_conversation 
  ON conversation_participants(conversation_id);

CREATE INDEX idx_conversation_participants_user 
  ON conversation_participants(user_id);

CREATE INDEX idx_conversation_participants_user_not_archived 
  ON conversation_participants(user_id) 
  WHERE is_archived = FALSE;

-- Composite index for common query pattern
CREATE INDEX idx_conversation_participants_composite 
  ON conversation_participants(user_id, conversation_id) 
  INCLUDE (last_read_at);

-- ============================================
-- MIGRATE EXISTING DATA
-- ============================================

-- Migrate existing participant_ids to junction table
DO $$
DECLARE
  conv_record RECORD;
  participant_id UUID;
BEGIN
  -- Loop through existing conversations
  FOR conv_record IN SELECT id, participant_ids FROM conversations
  LOOP
    -- Insert each participant into junction table
    FOREACH participant_id IN ARRAY conv_record.participant_ids
    LOOP
      INSERT INTO conversation_participants (conversation_id, user_id)
      VALUES (conv_record.id, participant_id)
      ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ============================================
-- ADD RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Users can view their own participations
CREATE POLICY "Users can view own participations"
  ON conversation_participants
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert themselves as participants (for creating conversations)
CREATE POLICY "Users can add themselves to conversations"
  ON conversation_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own participation (archive, last_read)
CREATE POLICY "Users can update own participations"
  ON conversation_participants
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users cannot delete participations (soft delete via archive)
CREATE POLICY "Prevent direct deletion"
  ON conversation_participants
  FOR DELETE
  USING (FALSE);

-- ============================================
-- CREATE HELPER FUNCTIONS
-- ============================================

-- Function to get conversation participants
CREATE OR REPLACE FUNCTION get_conversation_participants(conv_id UUID)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  last_read_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    u.avatar_url,
    cp.last_read_at
  FROM conversation_participants cp
  JOIN users u ON u.id = cp.user_id
  WHERE cp.conversation_id = conv_id
  AND cp.is_archived = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is participant
CREATE OR REPLACE FUNCTION is_conversation_participant(conv_id UUID, usr_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM conversation_participants 
    WHERE conversation_id = conv_id 
    AND user_id = usr_id
    AND is_archived = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's conversations (optimized)
CREATE OR REPLACE FUNCTION get_user_conversations(usr_id UUID)
RETURNS TABLE (
  conversation_id UUID,
  other_participants JSONB,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT
) AS $$
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
    (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
    c.updated_at as last_message_at,
    (
      SELECT COUNT(*)
      FROM messages m
      WHERE m.conversation_id = c.id
      AND m.created_at > COALESCE(
        (SELECT last_read_at FROM conversation_participants 
         WHERE conversation_id = c.id AND user_id = usr_id),
        '1970-01-01'::timestamp
      )
      AND m.sender_id != usr_id
    ) as unread_count
  FROM conversations c
  JOIN conversation_participants cp ON cp.conversation_id = c.id
  JOIN users u ON u.id = cp.user_id
  WHERE cp.user_id = usr_id 
  AND cp.is_archived = FALSE
  GROUP BY c.id, c.updated_at
  ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPDATE CONVERSATIONS TABLE
-- ============================================

-- Add column to mark as migrated (for rollback safety)
ALTER TABLE conversations 
  ADD COLUMN IF NOT EXISTS migrated_to_junction BOOLEAN DEFAULT FALSE;

-- Mark all migrated conversations
UPDATE conversations SET migrated_to_junction = TRUE;

-- ============================================
-- PERFORMANCE STATS
-- ============================================

COMMENT ON TABLE conversation_participants IS 
'Junction table for conversation participants. Eliminates N+1 queries from participant_ids array.
Performance improvement: O(1) lookups vs O(n) array scans.
Query optimization: Proper indexes enable efficient JOINs and filtering.';

COMMENT ON FUNCTION get_user_conversations IS
'Optimized function to fetch user conversations with participants and unread counts.
Uses single query with JOINs instead of multiple queries per conversation.
Expected performance: <50ms for 100 conversations with proper indexes.';

-- ============================================
-- MIGRATION VERIFICATION
-- ============================================

-- Verify migration success
DO $$
DECLARE
  conv_count INTEGER;
  participant_count INTEGER;
  array_sum INTEGER;
BEGIN
  -- Count conversations
  SELECT COUNT(*) INTO conv_count FROM conversations;
  
  -- Count junction table entries
  SELECT COUNT(*) INTO participant_count FROM conversation_participants;
  
  -- Calculate expected count from arrays
  SELECT SUM(array_length(participant_ids, 1)) INTO array_sum FROM conversations;
  
  -- Verify counts match
  IF participant_count != array_sum THEN
    RAISE EXCEPTION 'Migration verification failed: participant counts do not match. Expected: %, Got: %', 
      array_sum, participant_count;
  END IF;
  
  RAISE NOTICE 'Migration successful: % conversations, % participants', conv_count, participant_count;
END $$;
