-- Lovendo Row Level Security Migration
-- Version: 1.0.0
-- Created: 2024-12-05
-- Description: RLS policies for all tables

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can view any profile' AND tablename = 'users'
    ) THEN
        CREATE POLICY "Users can view any profile" ON users
  FOR SELECT USING (deleted_at IS NULL);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'users'
    ) THEN
        CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile' AND tablename = 'users'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- ============================================
-- MOMENTS POLICIES
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view active moments' AND tablename = 'moments'
    ) THEN
        CREATE POLICY "Anyone can view active moments" ON moments
  FOR SELECT USING (status = 'active' OR user_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can create moments' AND tablename = 'moments'
    ) THEN
        CREATE POLICY "Users can create moments" ON moments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own moments' AND tablename = 'moments'
    ) THEN
        CREATE POLICY "Users can update own moments" ON moments
  FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own moments' AND tablename = 'moments'
    ) THEN
        CREATE POLICY "Users can delete own moments" ON moments
  FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- REQUESTS POLICIES
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own requests' AND tablename = 'requests'
    ) THEN
        CREATE POLICY "Users can view own requests" ON requests
  FOR SELECT USING (
    user_id = auth.uid() OR 
    moment_id IN (SELECT id FROM moments WHERE user_id = auth.uid())
  );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can create requests' AND tablename = 'requests'
    ) THEN
        CREATE POLICY "Users can create requests" ON requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own requests' AND tablename = 'requests'
    ) THEN
        CREATE POLICY "Users can update own requests" ON requests
  FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Moment owners can update requests' AND tablename = 'requests'
    ) THEN
        CREATE POLICY "Moment owners can update requests" ON requests
  FOR UPDATE USING (
    moment_id IN (SELECT id FROM moments WHERE user_id = auth.uid())
  );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can cancel own requests' AND tablename = 'requests'
    ) THEN
        CREATE POLICY "Users can cancel own requests" ON requests
  FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own conversations' AND tablename = 'conversations'
    ) THEN
        CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = ANY(participant_ids));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can create conversations' AND tablename = 'conversations'
    ) THEN
        CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own conversations' AND tablename = 'conversations'
    ) THEN
        CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = ANY(participant_ids));
    END IF;
END $$;

-- ============================================
-- MESSAGES POLICIES
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can view messages in own conversations' AND tablename = 'messages'
    ) THEN
        CREATE POLICY "Users can view messages in own conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE auth.uid() = ANY(participant_ids)
    )
  );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can send messages in own conversations' AND tablename = 'messages'
    ) THEN
        CREATE POLICY "Users can send messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    conversation_id IN (
      SELECT id FROM conversations WHERE auth.uid() = ANY(participant_ids)
    )
  );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own messages' AND tablename = 'messages'
    ) THEN
        CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);
    END IF;
END $$;

-- ============================================
-- REVIEWS POLICIES
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view reviews' AND tablename = 'reviews'
    ) THEN
        CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can create reviews' AND tablename = 'reviews'
    ) THEN
        CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own reviews' AND tablename = 'reviews'
    ) THEN
        CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own reviews' AND tablename = 'reviews'
    ) THEN
        CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = reviewer_id);
    END IF;
END $$;

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own notifications' AND tablename = 'notifications'
    ) THEN
        CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own notifications' AND tablename = 'notifications'
    ) THEN
        CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own notifications' AND tablename = 'notifications'
    ) THEN
        CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- REPORTS POLICIES
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can create reports' AND tablename = 'reports'
    ) THEN
        CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own reports' AND tablename = 'reports'
    ) THEN
        CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);
    END IF;
END $$;

-- ============================================
-- BLOCKS POLICIES
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own blocks' AND tablename = 'blocks'
    ) THEN
        CREATE POLICY "Users can manage own blocks" ON blocks
  FOR ALL USING (auth.uid() = blocker_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can check if blocked' AND tablename = 'blocks'
    ) THEN
        CREATE POLICY "Users can check if blocked" ON blocks
  FOR SELECT USING (auth.uid() = blocked_id);
    END IF;
END $$;

-- ============================================
-- FAVORITES POLICIES
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own favorites' AND tablename = 'favorites'
    ) THEN
        CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can create favorites' AND tablename = 'favorites'
    ) THEN
        CREATE POLICY "Users can create favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own favorites' AND tablename = 'favorites'
    ) THEN
        CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- TRANSACTIONS POLICIES
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own transactions' AND tablename = 'transactions'
    ) THEN
        CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;
