-- ============================================
-- SOFT DELETE PATTERN IMPLEMENTATION
-- Date: December 8, 2024
-- Purpose: Prevent data loss, enable recovery, maintain compliance
-- ============================================

-- ============================================
-- STEP 1: ADD SOFT DELETE COLUMNS
-- ============================================

-- Moments table
ALTER TABLE moments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN moments.deleted_at IS 'Soft delete timestamp - NULL means active record';
COMMENT ON COLUMN moments.deleted_by IS 'User who deleted this moment';

-- Requests table
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN requests.deleted_at IS 'Soft delete timestamp - NULL means active record';
COMMENT ON COLUMN requests.deleted_by IS 'User who deleted this request';

-- Messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN messages.deleted_at IS 'Soft delete timestamp - NULL means active record';
COMMENT ON COLUMN messages.deleted_by IS 'User who deleted this message';

-- Conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN conversations.deleted_at IS 'Soft delete timestamp - NULL means active record';
COMMENT ON COLUMN conversations.deleted_by IS 'User who deleted this conversation';

-- ============================================
-- STEP 2: CREATE SOFT DELETE FUNCTIONS
-- ============================================

-- Generic soft delete function
CREATE OR REPLACE FUNCTION soft_delete(
  table_name TEXT,
  record_id UUID,
  user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
  sql_query TEXT;
  rows_affected INTEGER;
BEGIN
  -- Validate table name (prevent SQL injection)
  IF table_name NOT IN ('moments', 'requests', 'messages', 'conversations') THEN
    RAISE EXCEPTION 'Invalid table name: %', table_name;
  END IF;

  -- Build dynamic SQL
  sql_query := format(
    'UPDATE %I SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2 AND deleted_at IS NULL',
    table_name
  );

  -- Execute soft delete
  EXECUTE sql_query USING user_id, record_id;
  GET DIAGNOSTICS rows_affected = ROW_COUNT;

  -- Log to audit trail
  INSERT INTO audit_logs (
    user_id,
    category,
    event,
    severity,
    table_name,
    record_id,
    new_data
  ) VALUES (
    user_id,
    CASE table_name
      WHEN 'moments' THEN 'MOMENT'
      WHEN 'requests' THEN 'REQUEST'
      WHEN 'messages' THEN 'MESSAGE'
      ELSE 'OTHER'
    END,
    'SOFT_DELETE',
    'INFO',
    table_name,
    record_id,
    jsonb_build_object(
      'deleted_at', NOW(),
      'deleted_by', user_id
    )
  );

  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION soft_delete IS 'Soft delete a record by setting deleted_at timestamp';

-- Restore deleted record
CREATE OR REPLACE FUNCTION restore_deleted(
  table_name TEXT,
  record_id UUID,
  user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
  sql_query TEXT;
  rows_affected INTEGER;
BEGIN
  -- Validate table name
  IF table_name NOT IN ('moments', 'requests', 'messages', 'conversations') THEN
    RAISE EXCEPTION 'Invalid table name: %', table_name;
  END IF;

  -- Build dynamic SQL
  sql_query := format(
    'UPDATE %I SET deleted_at = NULL, deleted_by = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
    table_name
  );

  -- Execute restore
  EXECUTE sql_query USING record_id;
  GET DIAGNOSTICS rows_affected = ROW_COUNT;

  -- Log to audit trail
  INSERT INTO audit_logs (
    user_id,
    category,
    event,
    severity,
    table_name,
    record_id,
    new_data
  ) VALUES (
    user_id,
    CASE table_name
      WHEN 'moments' THEN 'MOMENT'
      WHEN 'requests' THEN 'REQUEST'
      WHEN 'messages' THEN 'MESSAGE'
      ELSE 'OTHER'
    END,
    'RESTORE',
    'INFO',
    table_name,
    record_id,
    jsonb_build_object(
      'restored_at', NOW(),
      'restored_by', user_id
    )
  );

  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION restore_deleted IS 'Restore a soft-deleted record';

-- Hard delete old soft-deleted records (cleanup)
CREATE OR REPLACE FUNCTION cleanup_old_deleted_records(
  retention_days INTEGER DEFAULT 90
)
RETURNS TABLE (
  table_name TEXT,
  records_deleted BIGINT
) AS $$
DECLARE
  table_rec RECORD;
  deleted_count BIGINT;
  total_deleted BIGINT := 0;
BEGIN
  FOR table_rec IN 
    SELECT unnest(ARRAY['moments', 'requests', 'messages', 'conversations']) AS tbl
  LOOP
    -- Hard delete records older than retention period
    EXECUTE format(
      'DELETE FROM %I WHERE deleted_at < NOW() - INTERVAL ''%s days''',
      table_rec.tbl,
      retention_days
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;

    -- Return result
    table_name := table_rec.tbl;
    records_deleted := deleted_count;
    RETURN NEXT;

    -- Log cleanup
    IF deleted_count > 0 THEN
      INSERT INTO audit_logs (
        user_id,
        category,
        event,
        severity,
        table_name,
        metadata
      ) VALUES (
        NULL,  -- System action
        'MAINTENANCE',
        'HARD_DELETE_CLEANUP',
        'INFO',
        table_rec.tbl,
        jsonb_build_object(
          'records_deleted', deleted_count,
          'retention_days', retention_days,
          'cleanup_timestamp', NOW()
        )
      );
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_deleted_records IS 'Hard delete soft-deleted records older than retention period (default 90 days)';

-- ============================================
-- STEP 3: UPDATE RLS POLICIES
-- ============================================

-- Drop existing policies (will recreate with soft delete support)
DROP POLICY IF EXISTS "Users can view their own moments" ON moments;
DROP POLICY IF EXISTS "Users can view active moments" ON moments;
DROP POLICY IF EXISTS "Users can create moments" ON moments;
DROP POLICY IF EXISTS "Users can update own moments" ON moments;
DROP POLICY IF EXISTS "Users can delete own moments" ON moments;

-- Moments: View own (including soft-deleted)
CREATE POLICY "Users can view their own moments"
ON moments FOR SELECT
USING (
  auth.uid() = user_id
  -- Owner can see soft-deleted records
);

-- Moments: View active (exclude soft-deleted)
CREATE POLICY "Users can view active moments"
ON moments FOR SELECT
USING (
  deleted_at IS NULL 
  AND status = 'active'
);

-- Moments: Create
CREATE POLICY "Users can create moments"
ON moments FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Moments: Update own (not deleted)
CREATE POLICY "Users can update own moments"
ON moments FOR UPDATE
USING (
  auth.uid() = user_id 
  AND deleted_at IS NULL
)
WITH CHECK (
  auth.uid() = user_id
);

-- Moments: Soft delete own
CREATE POLICY "Users can delete own moments"
ON moments FOR UPDATE
USING (
  auth.uid() = user_id 
  AND deleted_at IS NULL
)
WITH CHECK (
  auth.uid() = user_id 
  AND deleted_at IS NOT NULL  -- Ensures soft delete
);

-- Requests: Update policies
DROP POLICY IF EXISTS "Users can view their requests" ON requests;
DROP POLICY IF EXISTS "Users can create requests" ON requests;
DROP POLICY IF EXISTS "Users can update their requests" ON requests;

CREATE POLICY "Users can view their requests"
ON requests FOR SELECT
USING (
  (auth.uid() = user_id OR auth.uid() = moment_owner_id)
  -- AND deleted_at IS NULL  -- Only show non-deleted
);

CREATE POLICY "Users can create requests"
ON requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their requests"
ON requests FOR UPDATE
USING (
  (auth.uid() = user_id OR auth.uid() = moment_owner_id)
  AND deleted_at IS NULL
)
WITH CHECK (
  (auth.uid() = user_id OR auth.uid() = moment_owner_id)
);

-- Messages: Update policies
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can create messages" ON messages;

CREATE POLICY "Users can view their messages"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id 
    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    AND deleted_at IS NULL  -- Conversation not deleted
  )
  AND deleted_at IS NULL  -- Message not deleted
);

CREATE POLICY "Users can create messages"
ON messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id 
    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
  )
);

-- Conversations: Update policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (
  (auth.uid() = participant1_id OR auth.uid() = participant2_id)
  AND deleted_at IS NULL
);

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (
  auth.uid() = participant1_id OR auth.uid() = participant2_id
);

-- ============================================
-- STEP 4: CREATE INDEXES FOR SOFT DELETE
-- ============================================

-- Index for deleted_at queries (filtering out soft-deleted)
CREATE INDEX IF NOT EXISTS idx_moments_deleted_at 
ON moments(deleted_at) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_requests_deleted_at 
ON requests(deleted_at) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_deleted_at 
ON messages(deleted_at) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_deleted_at 
ON conversations(deleted_at) 
WHERE deleted_at IS NULL;

-- Index for cleanup queries (finding old deleted records)
CREATE INDEX IF NOT EXISTS idx_moments_deleted_cleanup 
ON moments(deleted_at) 
WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_requests_deleted_cleanup 
ON requests(deleted_at) 
WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_deleted_cleanup 
ON messages(deleted_at) 
WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_deleted_cleanup 
ON conversations(deleted_at) 
WHERE deleted_at IS NOT NULL;

-- ============================================
-- STEP 5: CREATE HELPER VIEWS
-- ============================================

-- Active moments (convenience view)
CREATE OR REPLACE VIEW active_moments AS
SELECT * FROM moments 
WHERE deleted_at IS NULL;

COMMENT ON VIEW active_moments IS 'Active moments (excluding soft-deleted)';

-- Active requests
CREATE OR REPLACE VIEW active_requests AS
SELECT * FROM requests 
WHERE deleted_at IS NULL;

COMMENT ON VIEW active_requests IS 'Active requests (excluding soft-deleted)';

-- Active messages
CREATE OR REPLACE VIEW active_messages AS
SELECT * FROM messages 
WHERE deleted_at IS NULL;

COMMENT ON VIEW active_messages IS 'Active messages (excluding soft-deleted)';

-- Active conversations
CREATE OR REPLACE VIEW active_conversations AS
SELECT * FROM conversations 
WHERE deleted_at IS NULL;

COMMENT ON VIEW active_conversations IS 'Active conversations (excluding soft-deleted)';

-- Recently deleted (recovery view)
CREATE OR REPLACE VIEW recently_deleted AS
SELECT 
  'moment' AS record_type,
  id,
  deleted_at,
  deleted_by,
  NOW() - deleted_at AS deleted_ago
FROM moments WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 
  'request' AS record_type,
  id,
  deleted_at,
  deleted_by,
  NOW() - deleted_at AS deleted_ago
FROM requests WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 
  'message' AS record_type,
  id,
  deleted_at,
  deleted_by,
  NOW() - deleted_at AS deleted_ago
FROM messages WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 
  'conversation' AS record_type,
  id,
  deleted_at,
  deleted_by,
  NOW() - deleted_at AS deleted_ago
FROM conversations WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

COMMENT ON VIEW recently_deleted IS 'All recently soft-deleted records across tables';

-- ============================================
-- STEP 6: SCHEDULE AUTOMATIC CLEANUP
-- ============================================

-- Create cleanup job (requires pg_cron extension)
/*
SELECT cron.schedule(
  'cleanup-soft-deleted-records',
  '0 2 * * 0',  -- Every Sunday at 2 AM
  $$
    SELECT * FROM cleanup_old_deleted_records(90);  -- 90-day retention
  $$
);
*/

-- ============================================
-- STEP 7: MIGRATION HELPERS
-- ============================================

-- Count existing records that would be affected
DO $$
DECLARE
  moments_count INTEGER;
  requests_count INTEGER;
  messages_count INTEGER;
  conversations_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO moments_count FROM moments;
  SELECT COUNT(*) INTO requests_count FROM requests;
  SELECT COUNT(*) INTO messages_count FROM messages;
  SELECT COUNT(*) INTO conversations_count FROM conversations;

  RAISE NOTICE 'Soft delete migration summary:';
  RAISE NOTICE '- Moments: % records (all will be marked as active)', moments_count;
  RAISE NOTICE '- Requests: % records (all will be marked as active)', requests_count;
  RAISE NOTICE '- Messages: % records (all will be marked as active)', messages_count;
  RAISE NOTICE '- Conversations: % records (all will be marked as active)', conversations_count;
  RAISE NOTICE 'All existing records have deleted_at = NULL (active)';
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- 1. Verify columns added
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('moments', 'requests', 'messages', 'conversations')
  AND column_name IN ('deleted_at', 'deleted_by')
ORDER BY table_name, column_name;

-- 2. Verify indexes created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%_deleted_%'
ORDER BY tablename, indexname;

-- 3. Verify functions created
SELECT 
  proname AS function_name,
  pg_get_functiondef(oid) AS definition
FROM pg_proc
WHERE proname IN ('soft_delete', 'restore_deleted', 'cleanup_old_deleted_records');

-- 4. Test soft delete (dry run)
DO $$
DECLARE
  test_moment_id UUID;
  test_user_id UUID := auth.uid();
BEGIN
  -- This is just a test to verify the function works
  -- Uncomment to actually test on a real moment
  /*
  SELECT id INTO test_moment_id FROM moments LIMIT 1;
  
  RAISE NOTICE 'Testing soft delete on moment: %', test_moment_id;
  PERFORM soft_delete('moments', test_moment_id, test_user_id);
  
  -- Verify it's soft deleted
  IF EXISTS (SELECT 1 FROM moments WHERE id = test_moment_id AND deleted_at IS NOT NULL) THEN
    RAISE NOTICE 'SUCCESS: Moment soft deleted';
  ELSE
    RAISE EXCEPTION 'FAILED: Moment not soft deleted';
  END IF;
  
  -- Restore it
  PERFORM restore_deleted('moments', test_moment_id, test_user_id);
  
  -- Verify it's restored
  IF EXISTS (SELECT 1 FROM moments WHERE id = test_moment_id AND deleted_at IS NULL) THEN
    RAISE NOTICE 'SUCCESS: Moment restored';
  ELSE
    RAISE EXCEPTION 'FAILED: Moment not restored';
  END IF;
  */
  
  RAISE NOTICE 'Soft delete functions are ready to use';
  RAISE NOTICE 'Use: SELECT soft_delete(''moments'', moment_id, user_id)';
  RAISE NOTICE 'Use: SELECT restore_deleted(''moments'', moment_id, user_id)';
END $$;

-- ============================================
-- ROLLBACK PLAN
-- ============================================

/*
-- If you need to rollback this migration:

-- 1. Drop indexes
DROP INDEX IF EXISTS idx_moments_deleted_at;
DROP INDEX IF EXISTS idx_requests_deleted_at;
DROP INDEX IF EXISTS idx_messages_deleted_at;
DROP INDEX IF EXISTS idx_conversations_deleted_at;
DROP INDEX IF EXISTS idx_moments_deleted_cleanup;
DROP INDEX IF EXISTS idx_requests_deleted_cleanup;
DROP INDEX IF EXISTS idx_messages_deleted_cleanup;
DROP INDEX IF EXISTS idx_conversations_deleted_cleanup;

-- 2. Drop views
DROP VIEW IF EXISTS active_moments;
DROP VIEW IF EXISTS active_requests;
DROP VIEW IF EXISTS active_messages;
DROP VIEW IF EXISTS active_conversations;
DROP VIEW IF EXISTS recently_deleted;

-- 3. Drop functions
DROP FUNCTION IF EXISTS soft_delete(TEXT, UUID, UUID);
DROP FUNCTION IF EXISTS restore_deleted(TEXT, UUID, UUID);
DROP FUNCTION IF EXISTS cleanup_old_deleted_records(INTEGER);

-- 4. Remove columns
ALTER TABLE moments DROP COLUMN IF EXISTS deleted_at, DROP COLUMN IF EXISTS deleted_by;
ALTER TABLE requests DROP COLUMN IF EXISTS deleted_at, DROP COLUMN IF EXISTS deleted_by;
ALTER TABLE messages DROP COLUMN IF EXISTS deleted_at, DROP COLUMN IF EXISTS deleted_by;
ALTER TABLE conversations DROP COLUMN IF EXISTS deleted_at, DROP COLUMN IF EXISTS deleted_by;

-- 5. Restore original RLS policies (copy from initial_schema.sql)
*/

-- ============================================
-- USAGE EXAMPLES
-- ============================================

COMMENT ON SCHEMA public IS '
Soft Delete Pattern Usage:

-- APPLICATION CODE --

// Instead of hard delete:
// await supabase.from("moments").delete().eq("id", momentId)

// Use soft delete:
await supabase.rpc("soft_delete", {
  table_name: "moments",
  record_id: momentId,
  user_id: currentUserId
});

// Restore deleted record:
await supabase.rpc("restore_deleted", {
  table_name: "moments",
  record_id: momentId,
  user_id: currentUserId
});

// View recently deleted (admin):
const { data } = await supabase.from("recently_deleted").select("*");

// Cleanup old deleted (admin/cron):
const { data } = await supabase.rpc("cleanup_old_deleted_records", {
  retention_days: 90
});

-- BENEFITS --

1. Data Recovery: Users can undo accidental deletes
2. Compliance: Maintain audit trail (GDPR, CCPA)
3. Analytics: Analyze deleted content patterns
4. Relationships: Preserve foreign key integrity
5. Performance: Soft delete faster than cascade delete

-- BEST PRACTICES --

1. UI: Show "Deleted" badge on soft-deleted records (owner view)
2. Recovery: Provide "Restore" button within 30 days
3. Cleanup: Auto-delete after 90 days (GDPR compliant)
4. Queries: Always use deleted_at IS NULL filter
5. Indexes: Partial indexes on deleted_at IS NULL

Created: 2024-12-08
';
