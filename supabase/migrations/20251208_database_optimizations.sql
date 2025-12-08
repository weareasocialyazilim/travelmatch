-- ============================================
-- DATABASE OPTIMIZATIONS
-- Date: December 8, 2024
-- Purpose: Indexing, Soft Delete, Audit Logging
-- ============================================

-- ============================================
-- PART 1: PERFORMANCE INDEXING
-- ============================================

-- Moments: Search & Filter (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_moments_location_date_status 
ON moments(location, date, status) 
WHERE status = 'active';

-- Moments: Category browsing
CREATE INDEX IF NOT EXISTS idx_moments_category_created 
ON moments(category, created_at DESC) 
WHERE status = 'active';

-- Moments: User's moments
CREATE INDEX IF NOT EXISTS idx_moments_user_created 
ON moments(user_id, created_at DESC);

-- Moments: Availability search
CREATE INDEX IF NOT EXISTS idx_moments_availability 
ON moments(date, current_participants, max_participants) 
WHERE status = 'active';

-- Moments: Price range queries
CREATE INDEX IF NOT EXISTS idx_moments_price_status 
ON moments(price, status) 
WHERE status = 'active';

-- Moments: Location-based search (PostGIS)
CREATE INDEX IF NOT EXISTS idx_moments_coordinates_gist 
ON moments USING GIST(coordinates) 
WHERE status = 'active';

-- Moments: Featured content
CREATE INDEX IF NOT EXISTS idx_moments_featured 
ON moments(is_featured, created_at DESC) 
WHERE is_featured = true AND status = 'active';

-- Requests: User's requests
CREATE INDEX IF NOT EXISTS idx_requests_user_status 
ON requests(user_id, status, created_at DESC);

-- Requests: Moment's pending requests
CREATE INDEX IF NOT EXISTS idx_requests_moment_pending 
ON requests(moment_id, status, created_at DESC) 
WHERE status = 'pending';

-- Messages: Conversation pagination
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

-- ============================================
-- PART 2: SOFT DELETE PATTERN
-- ============================================

-- Add soft delete columns to moments
ALTER TABLE moments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);

COMMENT ON COLUMN moments.deleted_at IS 'Soft delete timestamp - NULL means active';
COMMENT ON COLUMN moments.deleted_by IS 'User who deleted the moment';

-- Add soft delete columns to requests
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);

-- Add soft delete columns to messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);

-- Add soft delete columns to conversations
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);

-- Soft delete helper function
CREATE OR REPLACE FUNCTION soft_delete(
  table_name TEXT,
  record_id UUID,
  user_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  sql TEXT;
BEGIN
  sql := format(
    'UPDATE %I SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2 AND deleted_at IS NULL',
    table_name
  );
  
  EXECUTE sql USING user_id, record_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore deleted records
CREATE OR REPLACE FUNCTION restore_deleted(
  table_name TEXT,
  record_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  sql TEXT;
BEGIN
  sql := format(
    'UPDATE %I SET deleted_at = NULL, deleted_by = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
    table_name
  );
  
  EXECUTE sql USING record_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup old deleted records (retention: 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_deleted_records(
  table_name TEXT,
  retention_days INTEGER DEFAULT 90
) RETURNS INTEGER AS $$
DECLARE
  sql TEXT;
  deleted_count INTEGER;
BEGIN
  sql := format(
    'DELETE FROM %I WHERE deleted_at < NOW() - INTERVAL ''%s days''',
    table_name,
    retention_days
  );
  
  EXECUTE sql;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update indexes to exclude soft-deleted records
DROP INDEX IF EXISTS idx_moments_location_date_status;
CREATE INDEX idx_moments_location_date_status 
ON moments(location, date, status) 
WHERE status = 'active' AND deleted_at IS NULL;

DROP INDEX IF EXISTS idx_moments_category_created;
CREATE INDEX idx_moments_category_created 
ON moments(category, created_at DESC) 
WHERE status = 'active' AND deleted_at IS NULL;

DROP INDEX IF EXISTS idx_moments_user_created;
CREATE INDEX idx_moments_user_created 
ON moments(user_id, created_at DESC) 
WHERE deleted_at IS NULL;

-- ============================================
-- PART 3: COMPREHENSIVE AUDIT LOGGING
-- ============================================

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Who & When
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- What
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE')),
  
  -- How
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  session_id TEXT,
  
  -- Metadata
  category TEXT NOT NULL CHECK (category IN (
    'MOMENT', 'REQUEST', 'MESSAGE', 'USER', 'PAYMENT', 'SECURITY'
  )),
  severity TEXT DEFAULT 'INFO' CHECK (severity IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL')),
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp 
ON audit_logs(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record 
ON audit_logs(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_category_severity 
ON audit_logs(category, severity, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
ON audit_logs(action, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp 
ON audit_logs(timestamp DESC);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  changed_fields TEXT[];
  action_type TEXT;
  category_type TEXT;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'CREATE';
    new_data := to_jsonb(NEW);
    old_data := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check if it's a soft delete
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      action_type := 'SOFT_DELETE';
    ELSIF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
      action_type := 'RESTORE';
    ELSE
      action_type := 'UPDATE';
    END IF;
    
    new_data := to_jsonb(NEW);
    old_data := to_jsonb(OLD);
    
    -- Find changed fields
    SELECT array_agg(key)
    INTO changed_fields
    FROM jsonb_each(old_data)
    WHERE old_data->key IS DISTINCT FROM new_data->key;
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'DELETE';
    old_data := to_jsonb(OLD);
    new_data := NULL;
  END IF;
  
  -- Determine category based on table
  category_type := CASE TG_TABLE_NAME
    WHEN 'moments' THEN 'MOMENT'
    WHEN 'requests' THEN 'REQUEST'
    WHEN 'messages' THEN 'MESSAGE'
    WHEN 'users' THEN 'USER'
    ELSE 'SECURITY'
  END;
  
  -- Insert audit log
  INSERT INTO audit_logs (
    user_id,
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_fields,
    category,
    severity,
    metadata
  ) VALUES (
    COALESCE(
      CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END,
      auth.uid()
    ),
    TG_TABLE_NAME,
    COALESCE(
      CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END
    ),
    action_type,
    old_data,
    new_data,
    changed_fields,
    category_type,
    CASE 
      WHEN action_type IN ('DELETE', 'SOFT_DELETE') THEN 'WARNING'
      WHEN action_type = 'UPDATE' AND array_length(changed_fields, 1) > 5 THEN 'INFO'
      ELSE 'DEBUG'
    END,
    jsonb_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'trigger', TG_NAME
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit triggers to critical tables
DROP TRIGGER IF EXISTS moments_audit_trigger ON moments;
CREATE TRIGGER moments_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON moments
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS requests_audit_trigger ON requests;
CREATE TRIGGER requests_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS messages_audit_trigger ON messages;
CREATE TRIGGER messages_audit_trigger
  AFTER DELETE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

-- Audit log query functions
CREATE OR REPLACE FUNCTION get_user_audit_trail(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 100
) RETURNS TABLE (
  timestamp TIMESTAMPTZ,
  action TEXT,
  table_name TEXT,
  description TEXT,
  changed_fields TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.timestamp,
    a.action,
    a.table_name,
    COALESCE(
      a.description,
      format('%s %s on %s', a.action, a.record_id, a.table_name)
    ) as description,
    a.changed_fields
  FROM audit_logs a
  WHERE a.user_id = p_user_id
  ORDER BY a.timestamp DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_record_history(
  p_table_name TEXT,
  p_record_id UUID
) RETURNS TABLE (
  timestamp TIMESTAMPTZ,
  action TEXT,
  user_id UUID,
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.timestamp,
    a.action,
    a.user_id,
    a.old_data,
    a.new_data,
    a.changed_fields
  FROM audit_logs a
  WHERE a.table_name = p_table_name
    AND a.record_id = p_record_id
  ORDER BY a.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 4: RLS POLICY UPDATES
-- ============================================

-- Moments: Exclude soft-deleted records
DROP POLICY IF EXISTS "Users can view active moments" ON moments;
CREATE POLICY "Users can view active moments" ON moments
  FOR SELECT
  USING (deleted_at IS NULL);

-- Users can soft delete their own moments
DROP POLICY IF EXISTS "Users can soft delete own moments" ON moments;
CREATE POLICY "Users can soft delete own moments" ON moments
  FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (deleted_at IS NOT NULL AND deleted_by = auth.uid());

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check index usage
COMMENT ON MIGRATION IS '
To verify index effectiveness, run:

SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE schemaname = ''public''
  AND tablename IN (''moments'', ''requests'', ''messages'')
ORDER BY idx_scan DESC;

-- Test soft delete
SELECT soft_delete(''moments'', ''<moment-id>'', ''<user-id>'');
SELECT * FROM moments WHERE deleted_at IS NOT NULL;

-- View audit trail
SELECT * FROM get_user_audit_trail(''<user-id>'', 50);
SELECT * FROM get_record_history(''moments'', ''<moment-id>'');
';

-- ============================================
-- ROLLBACK PROCEDURES (if needed)
-- ============================================

/*
-- Drop audit triggers
DROP TRIGGER IF EXISTS moments_audit_trigger ON moments;
DROP TRIGGER IF EXISTS requests_audit_trigger ON requests;
DROP TRIGGER IF EXISTS messages_audit_trigger ON messages;

-- Drop audit functions
DROP FUNCTION IF EXISTS audit_trigger_func();
DROP FUNCTION IF EXISTS get_user_audit_trail(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_record_history(TEXT, UUID);

-- Drop audit table
DROP TABLE IF EXISTS audit_logs;

-- Remove soft delete columns
ALTER TABLE moments DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE moments DROP COLUMN IF EXISTS deleted_by;
ALTER TABLE requests DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE requests DROP COLUMN IF EXISTS deleted_by;
ALTER TABLE messages DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE messages DROP COLUMN IF EXISTS deleted_by;
ALTER TABLE conversations DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE conversations DROP COLUMN IF EXISTS deleted_by;

-- Drop soft delete functions
DROP FUNCTION IF EXISTS soft_delete(TEXT, UUID, UUID);
DROP FUNCTION IF EXISTS restore_deleted(TEXT, UUID);
DROP FUNCTION IF EXISTS cleanup_old_deleted_records(TEXT, INTEGER);
*/
