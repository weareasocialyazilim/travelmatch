-- Enable Realtime for Chat & Notifications
-- Version: 1.0.0
-- Created: 2025-12-16
-- Description: Critical fix - enables realtime subscriptions for messages, notifications, and conversations
-- Issue: Only transactions table was added to supabase_realtime, chat functionality needs realtime!

-- ============================================
-- ENABLE REALTIME FOR CHAT TABLES
-- ============================================

-- Messages - Critical for real-time chat
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
        RAISE NOTICE 'Added messages to supabase_realtime';
    END IF;
END $$;

-- Notifications - Critical for push notification sync
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
        RAISE NOTICE 'Added notifications to supabase_realtime';
    END IF;
END $$;

-- Conversations - For unread count badges, last_message_at updates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'conversations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
        RAISE NOTICE 'Added conversations to supabase_realtime';
    END IF;
END $$;

-- Requests - For request status updates (accepted/rejected)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE requests;
        RAISE NOTICE 'Added requests to supabase_realtime';
    END IF;
END $$;

-- ============================================
-- VERIFY REALTIME SETUP
-- ============================================
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename IN ('messages', 'notifications', 'conversations', 'requests', 'transactions');
    
    RAISE NOTICE 'Realtime enabled for % out of 5 critical tables', table_count;
    
    IF table_count < 5 THEN
        RAISE WARNING 'Some tables may not have been added to realtime!';
    END IF;
END $$;

-- ============================================
-- REALTIME BROADCAST AUTHORIZATION
-- ============================================
-- Ensure users can only subscribe to channels they're authorized for
-- This is handled by RLS policies, but adding explicit documentation

COMMENT ON TABLE messages IS 'Real-time enabled. Users can subscribe to conversation_id channels.';
COMMENT ON TABLE notifications IS 'Real-time enabled. Users can subscribe to user_id channels.';
COMMENT ON TABLE conversations IS 'Real-time enabled. Users can subscribe to participant_ids channels.';
COMMENT ON TABLE requests IS 'Real-time enabled. Users can subscribe to own request updates.';
