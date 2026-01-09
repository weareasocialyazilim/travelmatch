-- Keyset Pagination (Cursor-based) Migration
-- Replaces slow OFFSET pagination with efficient cursor-based pagination

-- 1. Add indexes for cursor-based pagination on main tables
CREATE INDEX IF NOT EXISTS idx_moments_created_at_desc 
  ON moments(created_at DESC, id DESC)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_messages_created_at_desc 
  ON messages(created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at_desc 
  ON notifications(created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_created_desc 
  ON transactions(user_id, created_at DESC, id DESC);

-- 2. Create helper function for keyset pagination on moments
CREATE OR REPLACE FUNCTION get_moments_keyset(
  cursor_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  cursor_id UUID DEFAULT NULL,
  page_size INT DEFAULT 20,
  status_filter TEXT DEFAULT 'active'
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  price NUMERIC,
  image_url TEXT,
  host_id UUID,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.description,
    m.category,
    m.price,
    m.image_url,
    m.host_id,
    m.status,
    m.created_at
  FROM moments m
  WHERE 
    m.status = status_filter
    AND (
      cursor_timestamp IS NULL 
      OR m.created_at < cursor_timestamp
      OR (m.created_at = cursor_timestamp AND m.id < cursor_id)
    )
  ORDER BY m.created_at DESC, m.id DESC
  LIMIT page_size;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Create helper function for messages pagination
CREATE OR REPLACE FUNCTION get_messages_keyset(
  conversation_id_param UUID,
  cursor_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  cursor_id UUID DEFAULT NULL,
  page_size INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  conversation_id UUID,
  sender_id UUID,
  content TEXT,
  type TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.conversation_id,
    m.sender_id,
    m.content,
    m.type,
    m.status,
    m.created_at
  FROM messages m
  WHERE 
    m.conversation_id = conversation_id_param
    AND (
      cursor_timestamp IS NULL 
      OR m.created_at < cursor_timestamp
      OR (m.created_at = cursor_timestamp AND m.id < cursor_id)
    )
  ORDER BY m.created_at DESC, m.id DESC
  LIMIT page_size;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Create helper function for notifications pagination
CREATE OR REPLACE FUNCTION get_notifications_keyset(
  user_id_param UUID,
  cursor_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  cursor_id UUID DEFAULT NULL,
  page_size INT DEFAULT 30,
  unread_only BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type TEXT,
  title TEXT,
  body TEXT,
  read BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.user_id,
    n.type,
    n.title,
    n.body,
    n.read,
    n.created_at
  FROM notifications n
  WHERE 
    n.user_id = user_id_param
    AND (NOT unread_only OR n.read = false)
    AND (
      cursor_timestamp IS NULL 
      OR n.created_at < cursor_timestamp
      OR (n.created_at = cursor_timestamp AND n.id < cursor_id)
    )
  ORDER BY n.created_at DESC, n.id DESC
  LIMIT page_size;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. Create helper function for transactions pagination
CREATE OR REPLACE FUNCTION get_transactions_keyset(
  user_id_param UUID,
  cursor_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  cursor_id UUID DEFAULT NULL,
  page_size INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type TEXT,
  amount NUMERIC,
  currency TEXT,
  status TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.user_id,
    t.type,
    t.amount,
    t.currency,
    t.status,
    t.description,
    t.created_at
  FROM transactions t
  WHERE 
    t.user_id = user_id_param
    AND (
      cursor_timestamp IS NULL 
      OR t.created_at < cursor_timestamp
      OR (t.created_at = cursor_timestamp AND t.id < cursor_id)
    )
  ORDER BY t.created_at DESC, t.id DESC
  LIMIT page_size;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Add comments for documentation
COMMENT ON INDEX idx_moments_created_at_desc IS 'Supports efficient keyset pagination on moments feed';
COMMENT ON INDEX idx_messages_created_at_desc IS 'Supports efficient keyset pagination in chat';
COMMENT ON INDEX idx_notifications_created_at_desc IS 'Supports efficient keyset pagination for notifications';
COMMENT ON INDEX idx_transactions_user_created_desc IS 'Supports efficient keyset pagination for wallet transactions';

COMMENT ON FUNCTION get_moments_keyset IS 'Keyset pagination for moments - O(1) vs OFFSET O(n)';
COMMENT ON FUNCTION get_messages_keyset IS 'Keyset pagination for chat messages';
COMMENT ON FUNCTION get_notifications_keyset IS 'Keyset pagination for notifications with optional unread filter';
COMMENT ON FUNCTION get_transactions_keyset IS 'Keyset pagination for wallet transactions';
