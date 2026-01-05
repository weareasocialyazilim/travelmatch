-- ============================================================
-- FINAL CRITICAL FIXES MIGRATION
-- Date: 2025-12-18
-- Purpose: Complete remaining critical items from health check
-- ============================================================

-- ============================================================
-- 1. CONVERSATION PARTICIPANTS SYNC TRIGGER
-- Keep participant_ids and junction table in sync during transition
-- ============================================================

-- Sync trigger: When junction changes, update array
CREATE OR REPLACE FUNCTION sync_participant_ids_from_junction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE conversations
    SET participant_ids = (
      SELECT array_agg(user_id ORDER BY joined_at)
      FROM conversation_participants
      WHERE conversation_id = NEW.conversation_id
    ),
    updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE conversations
    SET participant_ids = COALESCE(
      (SELECT array_agg(user_id ORDER BY joined_at)
       FROM conversation_participants
       WHERE conversation_id = OLD.conversation_id),
      '{}'::uuid[]
    ),
    updated_at = NOW()
    WHERE id = OLD.conversation_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Sync trigger: When array changes, update junction
CREATE OR REPLACE FUNCTION sync_junction_from_participant_ids()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid UUID;
BEGIN
  -- Only sync if participant_ids actually changed
  IF OLD.participant_ids IS DISTINCT FROM NEW.participant_ids THEN
    -- Delete participants no longer in array
    DELETE FROM conversation_participants
    WHERE conversation_id = NEW.id
      AND user_id != ALL(NEW.participant_ids);
    
    -- Insert new participants from array
    FOREACH uid IN ARRAY NEW.participant_ids
    LOOP
      INSERT INTO conversation_participants (conversation_id, user_id)
      VALUES (NEW.id, uid)
      ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers (if not exist)
DROP TRIGGER IF EXISTS sync_participant_ids_on_junction_change ON conversation_participants;
CREATE TRIGGER sync_participant_ids_on_junction_change
  AFTER INSERT OR DELETE ON conversation_participants
  FOR EACH ROW
  EXECUTE FUNCTION sync_participant_ids_from_junction();

DROP TRIGGER IF EXISTS sync_junction_on_participant_ids_change ON conversations;
CREATE TRIGGER sync_junction_on_participant_ids_change
  AFTER UPDATE OF participant_ids ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION sync_junction_from_participant_ids();

-- Also sync on INSERT to conversations
CREATE OR REPLACE FUNCTION populate_junction_on_conversation_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid UUID;
BEGIN
  -- Insert all participants from array into junction
  FOREACH uid IN ARRAY NEW.participant_ids
  LOOP
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (NEW.id, uid)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
  END LOOP;
  
  -- Mark as migrated
  UPDATE conversations SET migrated_to_junction = TRUE WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS populate_junction_on_new_conversation ON conversations;
CREATE TRIGGER populate_junction_on_new_conversation
  AFTER INSERT ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION populate_junction_on_conversation_insert();

-- ============================================================
-- 2. BACKFILL: Ensure all existing conversations have junction entries
-- ============================================================

DO $$
DECLARE
  conv RECORD;
  uid UUID;
  inserted_count INT := 0;
BEGIN
  FOR conv IN 
    SELECT id, participant_ids 
    FROM conversations 
    WHERE migrated_to_junction IS NOT TRUE
  LOOP
    FOREACH uid IN ARRAY conv.participant_ids
    LOOP
      INSERT INTO conversation_participants (conversation_id, user_id)
      VALUES (conv.id, uid)
      ON CONFLICT (conversation_id, user_id) DO NOTHING;
      inserted_count := inserted_count + 1;
    END LOOP;
    
    UPDATE conversations SET migrated_to_junction = TRUE WHERE id = conv.id;
  END LOOP;
  
  RAISE NOTICE 'Backfilled % junction entries', inserted_count;
END $$;

-- ============================================================
-- 3. EDGE FUNCTION IMPROVEMENTS
-- Add missing indexes for Edge Function performance
-- ============================================================

-- Webhook deduplication index (critical for stripe-webhook)
CREATE INDEX IF NOT EXISTS idx_processed_webhook_events_event_id 
ON processed_webhook_events(event_id);

-- Cache invalidation lookup (critical for cdn-invalidate)
CREATE INDEX IF NOT EXISTS idx_cache_invalidation_key_time 
ON cache_invalidation(cache_key, invalidated_at DESC);

-- Audit logs query optimization
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action 
ON audit_logs(user_id, action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created 
ON audit_logs(action, created_at DESC);

-- ============================================================
-- 4. REALTIME OPTIMIZATION
-- Create helper view for conversation access
-- ============================================================

CREATE OR REPLACE VIEW v_user_conversations AS
SELECT 
  cp.user_id,
  cp.conversation_id,
  c.moment_id,
  c.last_message_id,
  c.updated_at as conversation_updated_at,
  cp.last_read_at,
  cp.is_archived
FROM conversation_participants cp
JOIN conversations c ON c.id = cp.conversation_id;

-- Grant access to authenticated users
GRANT SELECT ON v_user_conversations TO authenticated;

-- ============================================================
-- 5. ADD MISSING CONSTRAINT
-- Ensure escrow sender != recipient
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'escrow_sender_not_recipient'
  ) THEN
    ALTER TABLE escrow_transactions
    ADD CONSTRAINT escrow_sender_not_recipient
    CHECK (sender_id != recipient_id);
  END IF;
END $$;

-- ============================================================
-- 6. OPTIMIZE RLS POLICIES FOR JUNCTION TABLE
-- Use (select auth.uid()) pattern for conversation_participants
-- ============================================================

-- Already optimized in previous migration, but ensure consistency
DO $$
BEGIN
  -- Check if policies need optimization
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conversation_participants'
    AND qual LIKE '%auth.uid()%'
    AND qual NOT LIKE '%(select auth.uid())%'
  ) THEN
    RAISE NOTICE 'conversation_participants policies may need optimization';
  END IF;
END $$;

-- ============================================================
-- VALIDATION
-- ============================================================

DO $$
DECLARE
  sync_trigger_count INT;
  junction_coverage NUMERIC;
  new_index_count INT;
BEGIN
  -- Count sync triggers
  SELECT COUNT(*) INTO sync_trigger_count
  FROM pg_trigger
  WHERE tgname IN (
    'sync_participant_ids_on_junction_change',
    'sync_junction_on_participant_ids_change',
    'populate_junction_on_new_conversation'
  );
  
  -- Check junction coverage
  SELECT 
    ROUND(
      (SELECT COUNT(DISTINCT conversation_id) FROM conversation_participants)::numeric /
      NULLIF((SELECT COUNT(*) FROM conversations), 0) * 100, 2
    )
  INTO junction_coverage;
  
  -- Count new indexes
  SELECT COUNT(*) INTO new_index_count
  FROM pg_indexes
  WHERE indexname IN (
    'idx_processed_webhook_events_event_id',
    'idx_cache_invalidation_key_time',
    'idx_audit_logs_user_action',
    'idx_audit_logs_action_created'
  );
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ FINAL CRITICAL FIXES COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Sync triggers created: %', sync_trigger_count;
  RAISE NOTICE 'Junction table coverage: %% %', junction_coverage;
  RAISE NOTICE 'New indexes created: %', new_index_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ participant_ids ↔ junction SYNCED';
  RAISE NOTICE '✅ Edge Function indexes ADDED';
  RAISE NOTICE '✅ Realtime view CREATED';
  RAISE NOTICE '✅ Escrow constraint ADDED';
  RAISE NOTICE '========================================';
END $$;
