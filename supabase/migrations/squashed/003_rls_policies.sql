-- ============================================================================
-- TravelMatch RLS Policies v2.0
-- 
-- All RLS policies consolidated from multiple security fix migrations.
-- 
-- IMPORTANT: Use templates from packages/shared/sql-templates/rls-policy-templates.sql
--            for new policies.
-- ============================================================================

-- Enable RLS on all tables (idempotent)
DO $$ 
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
    END LOOP;
END $$;

-- ============================================================================
-- CRITICAL FINANCIAL TABLES
-- ============================================================================

-- WALLETS: Owner-only access
DROP POLICY IF EXISTS "wallets_select_own" ON wallets;
DROP POLICY IF EXISTS "wallets_update_own" ON wallets;

CREATE POLICY "wallets_select_own"
ON wallets
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- No direct updates - use RPC functions
CREATE POLICY "wallets_no_direct_update"
ON wallets
FOR UPDATE
TO authenticated
USING (false);

-- TRANSACTIONS: Owner can view their transactions
DROP POLICY IF EXISTS "transactions_select_own" ON transactions;
DROP POLICY IF EXISTS "transactions_insert_own" ON transactions;

CREATE POLICY "transactions_select_own"
ON transactions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Insert only by user
CREATE POLICY "transactions_insert_own"
ON transactions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- SAVED_CARDS: Owner-only access
DROP POLICY IF EXISTS "saved_cards_select_own" ON saved_cards;
DROP POLICY IF EXISTS "saved_cards_insert_own" ON saved_cards;
DROP POLICY IF EXISTS "saved_cards_update_own" ON saved_cards;
DROP POLICY IF EXISTS "saved_cards_delete_own" ON saved_cards;

CREATE POLICY "saved_cards_select_own"
ON saved_cards
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "saved_cards_insert_own"
ON saved_cards
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "saved_cards_update_own"
ON saved_cards
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "saved_cards_delete_own"
ON saved_cards
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ESCROW_TRANSACTIONS: Sender or recipient can view
DROP POLICY IF EXISTS "escrow_select_participant" ON escrow_transactions;

CREATE POLICY "escrow_select_participant"
ON escrow_transactions
FOR SELECT
TO authenticated
USING (
  sender_id = auth.uid() 
  OR recipient_id = auth.uid()
);

-- ============================================================================
-- USER CONTENT TABLES
-- ============================================================================

-- USERS: Public profile view, owner edit
DROP POLICY IF EXISTS "users_select_public" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

CREATE POLICY "users_select_public"
ON users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_update_own"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- MOMENTS: Public view if status='active', owner CRUD
DROP POLICY IF EXISTS "moments_select_public" ON moments;
DROP POLICY IF EXISTS "moments_insert_own" ON moments;
DROP POLICY IF EXISTS "moments_update_own" ON moments;
DROP POLICY IF EXISTS "moments_delete_own" ON moments;

CREATE POLICY "moments_select_public"
ON moments
FOR SELECT
TO authenticated
USING (
  status = 'active'
  OR user_id = auth.uid()
);

CREATE POLICY "moments_insert_own"
ON moments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "moments_update_own"
ON moments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "moments_delete_own"
ON moments
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- REQUESTS: Requester or moment owner can view
DROP POLICY IF EXISTS "requests_select_participant" ON requests;
DROP POLICY IF EXISTS "requests_insert_own" ON requests;
DROP POLICY IF EXISTS "requests_update_participant" ON requests;

CREATE POLICY "requests_select_participant"
ON requests
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM moments 
    WHERE moments.id = requests.moment_id 
    AND moments.user_id = auth.uid()
  )
);

CREATE POLICY "requests_insert_own"
ON requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "requests_update_participant"
ON requests
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM moments 
    WHERE moments.id = requests.moment_id 
    AND moments.user_id = auth.uid()
  )
);

-- ============================================================================
-- MESSAGING TABLES
-- ============================================================================

-- CONVERSATIONS: Participants only
DROP POLICY IF EXISTS "conversations_select_participant" ON conversations;

CREATE POLICY "conversations_select_participant"
ON conversations
FOR SELECT
TO authenticated
USING (
  auth.uid() = ANY(participant_ids)
);

-- MESSAGES: Conversation participants only
DROP POLICY IF EXISTS "messages_select_participant" ON messages;
DROP POLICY IF EXISTS "messages_insert_sender" ON messages;

CREATE POLICY "messages_select_participant"
ON messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND auth.uid() = ANY(conversations.participant_ids)
  )
);

CREATE POLICY "messages_insert_sender"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND auth.uid() = ANY(conversations.participant_ids)
  )
);

-- ============================================================================
-- NOTIFICATION & SOCIAL TABLES
-- ============================================================================

-- NOTIFICATIONS: Owner only
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;

CREATE POLICY "notifications_select_own"
ON notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
ON notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- FOLLOWS: Public read, authenticated write
DROP POLICY IF EXISTS "follows_select_public" ON follows;
DROP POLICY IF EXISTS "follows_insert_own" ON follows;
DROP POLICY IF EXISTS "follows_delete_own" ON follows;

CREATE POLICY "follows_select_public"
ON follows
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "follows_insert_own"
ON follows
FOR INSERT
TO authenticated
WITH CHECK (follower_id = auth.uid());

CREATE POLICY "follows_delete_own"
ON follows
FOR DELETE
TO authenticated
USING (follower_id = auth.uid());

-- FAVORITES (saved moments): Owner only
DROP POLICY IF EXISTS "favorites_select_own" ON favorites;
DROP POLICY IF EXISTS "favorites_insert_own" ON favorites;
DROP POLICY IF EXISTS "favorites_delete_own" ON favorites;

CREATE POLICY "favorites_select_own"
ON favorites
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "favorites_insert_own"
ON favorites
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "favorites_delete_own"
ON favorites
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- REVIEWS: Public read, reviewer write
DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;

CREATE POLICY "reviews_select_public"
ON reviews
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "reviews_insert_own"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (reviewer_id = auth.uid());

-- ============================================================================
-- MODERATION TABLES
-- ============================================================================

-- REPORTS: Reporter can view own reports
DROP POLICY IF EXISTS "reports_select_own" ON reports;
DROP POLICY IF EXISTS "reports_insert_own" ON reports;

CREATE POLICY "reports_select_own"
ON reports
FOR SELECT
TO authenticated
USING (reporter_id = auth.uid());

CREATE POLICY "reports_insert_own"
ON reports
FOR INSERT
TO authenticated
WITH CHECK (reporter_id = auth.uid());

-- BLOCKS: Blocker can manage
DROP POLICY IF EXISTS "blocks_select_own" ON blocks;
DROP POLICY IF EXISTS "blocks_insert_own" ON blocks;
DROP POLICY IF EXISTS "blocks_delete_own" ON blocks;

CREATE POLICY "blocks_select_own"
ON blocks
FOR SELECT
TO authenticated
USING (blocker_id = auth.uid());

CREATE POLICY "blocks_insert_own"
ON blocks
FOR INSERT
TO authenticated
WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "blocks_delete_own"
ON blocks
FOR DELETE
TO authenticated
USING (blocker_id = auth.uid());
