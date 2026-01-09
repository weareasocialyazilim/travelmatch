-- Foreign Key Indexes Migration
-- Creates indexes on foreign key columns to speed up JOIN operations and cascading deletes
-- Uses safe exception handling for tables/columns that may not exist

DO $$
BEGIN
  -- Index on moments.host_id (FK to profiles)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'moments' AND column_name = 'host_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_moments_host_id') THEN
      CREATE INDEX idx_moments_host_id ON moments(host_id);
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping idx_moments_host_id: %', SQLERRM;
END $$;

DO $$
BEGIN
  -- Index on moments.user_id (alternative FK to profiles)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'moments' AND column_name = 'user_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_moments_user_id') THEN
      CREATE INDEX idx_moments_user_id ON moments(user_id);
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping idx_moments_user_id: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'sender_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_sender_id') THEN
      CREATE INDEX idx_messages_sender_id ON messages(sender_id);
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping idx_messages_sender_id: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'conversation_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_conversation_id') THEN
      CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping idx_messages_conversation_id: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'user_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user_id') THEN
      CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping idx_notifications_user_id: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'user_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_user_id') THEN
      CREATE INDEX idx_transactions_user_id ON transactions(user_id);
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping idx_transactions_user_id: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'moment_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_moment_id') THEN
      CREATE INDEX idx_bookings_moment_id ON bookings(moment_id);
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping idx_bookings_moment_id: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'user_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_user_id') THEN
      CREATE INDEX idx_bookings_user_id ON bookings(user_id);
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping idx_bookings_user_id: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'moment_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reviews_moment_id') THEN
      CREATE INDEX idx_reviews_moment_id ON reviews(moment_id);
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping idx_reviews_moment_id: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'reviewer_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reviews_reviewer_id') THEN
      CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping idx_reviews_reviewer_id: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'reporter_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reports_reporter_id') THEN
      CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping idx_reports_reporter_id: %', SQLERRM;
END $$;

-- This migration safely creates FK indexes only where the columns exist
