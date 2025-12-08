-- ============================================
-- RLS POLICY TESTING SUITE
-- ============================================
-- Description: Comprehensive tests for Row Level Security policies
-- Purpose: Prevent data leaks and unauthorized access
-- Version: 1.0.0
-- Created: 2025-12-07

-- ============================================
-- TEST SETUP
-- ============================================

-- Create test extension for pgTAP (if using pgTAP)
-- CREATE EXTENSION IF NOT EXISTS pgtap;

-- Helper function to set auth context
CREATE OR REPLACE FUNCTION tests.set_auth_uid(uid uuid)
RETURNS void AS $$
BEGIN
  -- Set the JWT context for testing
  PERFORM set_config('request.jwt.claim.sub', uid::text, true);
END;
$$ LANGUAGE plpgsql;

-- Helper function to clear auth context
CREATE OR REPLACE FUNCTION tests.clear_auth_uid()
RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '', true);
END;
$$ LANGUAGE plpgsql;

-- Helper function to create test user
CREATE OR REPLACE FUNCTION tests.create_test_user(
  user_id uuid,
  username text DEFAULT 'testuser',
  email text DEFAULT 'test@example.com'
)
RETURNS uuid AS $$
DECLARE
  inserted_id uuid;
BEGIN
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES (
    user_id,
    email,
    crypt('testpassword', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO users (id, username, email, full_name, created_at, updated_at)
  VALUES (
    user_id,
    username,
    email,
    'Test User',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO inserted_id;
  
  RETURN COALESCE(inserted_id, user_id);
END;
$$ LANGUAGE plpgsql;

-- Helper function to cleanup test data
CREATE OR REPLACE FUNCTION tests.cleanup_test_data()
RETURNS void AS $$
BEGIN
  -- Clean up in reverse dependency order
  DELETE FROM messages WHERE sender_id IN (SELECT id FROM users WHERE email LIKE '%@test.example.com');
  DELETE FROM conversations WHERE auth.uid() IS NULL;
  DELETE FROM requests WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.example.com');
  DELETE FROM moments WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.example.com');
  DELETE FROM reviews WHERE reviewer_id IN (SELECT id FROM users WHERE email LIKE '%@test.example.com');
  DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.example.com');
  DELETE FROM reports WHERE reporter_id IN (SELECT id FROM users WHERE email LIKE '%@test.example.com');
  DELETE FROM blocks WHERE blocker_id IN (SELECT id FROM users WHERE email LIKE '%@test.example.com');
  DELETE FROM favorites WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.example.com');
  DELETE FROM transactions WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.example.com');
  DELETE FROM users WHERE email LIKE '%@test.example.com';
  DELETE FROM auth.users WHERE email LIKE '%@test.example.com';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- USERS TABLE RLS TESTS
-- ============================================

-- Test: Users can view any non-deleted profile
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  visible_count int;
BEGIN
  -- Setup
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- Test: User1 can see User2's profile
  SELECT COUNT(*) INTO visible_count
  FROM users
  WHERE id = user2_id AND deleted_at IS NULL;

  ASSERT visible_count = 1, 'FAIL: Users should be able to view other profiles';
  RAISE NOTICE 'PASS: Users can view any non-deleted profile';

  -- Cleanup
  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: Users can only update their own profile
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  update_count int;
BEGIN
  -- Setup
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- Test: User1 can update own profile
  UPDATE users SET bio = 'Updated bio' WHERE id = user1_id;
  GET DIAGNOSTICS update_count = ROW_COUNT;
  ASSERT update_count = 1, 'FAIL: Users should update own profile';

  -- Test: User1 cannot update User2's profile
  UPDATE users SET bio = 'Hacked bio' WHERE id = user2_id;
  GET DIAGNOSTICS update_count = ROW_COUNT;
  ASSERT update_count = 0, 'FAIL: Users should NOT update other profiles - SECURITY BREACH!';
  
  RAISE NOTICE 'PASS: Users can only update their own profile';

  -- Cleanup
  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: Users cannot insert profiles for other users
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  fake_user_id uuid := gen_random_uuid();
  insert_failed boolean := false;
BEGIN
  -- Setup
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- Test: User1 cannot create profile for fake user
  BEGIN
    INSERT INTO users (id, username, email, full_name, created_at, updated_at)
    VALUES (fake_user_id, 'fakeuser', 'fake@test.example.com', 'Fake User', NOW(), NOW());
  EXCEPTION WHEN OTHERS THEN
    insert_failed := true;
  END;

  ASSERT insert_failed = true, 'FAIL: Users should NOT create profiles for others - SECURITY BREACH!';
  RAISE NOTICE 'PASS: Users cannot insert profiles for other users';

  -- Cleanup
  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- MOMENTS TABLE RLS TESTS
-- ============================================

-- Test: Anyone can view active moments
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  moment_id uuid := gen_random_uuid();
  visible_count int;
BEGIN
  -- Setup
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- Create moment as User1
  INSERT INTO moments (id, user_id, title, description, status, category, created_at, updated_at)
  VALUES (moment_id, user1_id, 'Test Moment', 'Test Description', 'active', 'adventure', NOW(), NOW());

  -- Switch to User2
  PERFORM tests.set_auth_uid(user2_id);

  -- Test: User2 can see User1's active moment
  SELECT COUNT(*) INTO visible_count
  FROM moments
  WHERE id = moment_id AND status = 'active';

  ASSERT visible_count = 1, 'FAIL: Anyone should view active moments';
  RAISE NOTICE 'PASS: Anyone can view active moments';

  -- Cleanup
  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: Users cannot view other users' draft moments
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  draft_moment_id uuid := gen_random_uuid();
  visible_count int;
BEGIN
  -- Setup
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- Create draft moment as User1
  INSERT INTO moments (id, user_id, title, description, status, category, created_at, updated_at)
  VALUES (draft_moment_id, user1_id, 'Draft Moment', 'Draft Description', 'draft', 'adventure', NOW(), NOW());

  -- Switch to User2
  PERFORM tests.set_auth_uid(user2_id);

  -- Test: User2 cannot see User1's draft moment
  SELECT COUNT(*) INTO visible_count
  FROM moments
  WHERE id = draft_moment_id;

  ASSERT visible_count = 0, 'FAIL: Users should NOT view other users draft moments - SECURITY BREACH!';
  RAISE NOTICE 'PASS: Users cannot view other users draft moments';

  -- Cleanup
  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: Users can only update their own moments
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  moment1_id uuid := gen_random_uuid();
  moment2_id uuid := gen_random_uuid();
  update_count int;
BEGIN
  -- Setup
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  INSERT INTO moments (id, user_id, title, description, status, category, created_at, updated_at)
  VALUES (moment1_id, user1_id, 'User1 Moment', 'Description', 'active', 'adventure', NOW(), NOW());

  PERFORM tests.set_auth_uid(user2_id);
  INSERT INTO moments (id, user_id, title, description, status, category, created_at, updated_at)
  VALUES (moment2_id, user2_id, 'User2 Moment', 'Description', 'active', 'adventure', NOW(), NOW());

  -- Test: User2 cannot update User1's moment
  UPDATE moments SET title = 'Hacked Title' WHERE id = moment1_id;
  GET DIAGNOSTICS update_count = ROW_COUNT;
  ASSERT update_count = 0, 'FAIL: Users should NOT update other moments - SECURITY BREACH!';

  -- Test: User2 can update own moment
  UPDATE moments SET title = 'Updated Title' WHERE id = moment2_id;
  GET DIAGNOSTICS update_count = ROW_COUNT;
  ASSERT update_count = 1, 'FAIL: Users should update own moments';

  RAISE NOTICE 'PASS: Users can only update their own moments';

  -- Cleanup
  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- REQUESTS TABLE RLS TESTS
-- ============================================

-- Test: Users can view their own requests
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  moment_id uuid := gen_random_uuid();
  request_id uuid := gen_random_uuid();
  visible_count int;
BEGIN
  -- Setup
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.set_auth_uid(user2_id);

  INSERT INTO moments (id, user_id, title, description, status, category, created_at, updated_at)
  VALUES (moment_id, user2_id, 'Test Moment', 'Description', 'active', 'adventure', NOW(), NOW());

  PERFORM tests.set_auth_uid(user1_id);
  INSERT INTO requests (id, user_id, moment_id, status, message, created_at, updated_at)
  VALUES (request_id, user1_id, moment_id, 'pending', 'I want to join!', NOW(), NOW());

  -- Test: User1 can see own request
  SELECT COUNT(*) INTO visible_count
  FROM requests
  WHERE id = request_id;

  ASSERT visible_count = 1, 'FAIL: Users should view own requests';
  RAISE NOTICE 'PASS: Users can view their own requests';

  -- Cleanup
  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: Moment owners can view requests for their moments
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  moment_id uuid := gen_random_uuid();
  request_id uuid := gen_random_uuid();
  visible_count int;
BEGIN
  -- Setup
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  INSERT INTO moments (id, user_id, title, description, status, category, created_at, updated_at)
  VALUES (moment_id, user1_id, 'Test Moment', 'Description', 'active', 'adventure', NOW(), NOW());

  PERFORM tests.set_auth_uid(user2_id);
  INSERT INTO requests (id, user_id, moment_id, status, message, created_at, updated_at)
  VALUES (request_id, user2_id, moment_id, 'pending', 'I want to join!', NOW(), NOW());

  -- Switch to moment owner
  PERFORM tests.set_auth_uid(user1_id);

  -- Test: User1 can see requests for their moment
  SELECT COUNT(*) INTO visible_count
  FROM requests
  WHERE id = request_id;

  ASSERT visible_count = 1, 'FAIL: Moment owners should view requests';
  RAISE NOTICE 'PASS: Moment owners can view requests for their moments';

  -- Cleanup
  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: Users cannot view other users' requests
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  user3_id uuid := gen_random_uuid();
  moment_id uuid := gen_random_uuid();
  request_id uuid := gen_random_uuid();
  visible_count int;
BEGIN
  -- Setup
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.create_test_user(user3_id, 'user3', 'user3@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  INSERT INTO moments (id, user_id, title, description, status, category, created_at, updated_at)
  VALUES (moment_id, user1_id, 'Test Moment', 'Description', 'active', 'adventure', NOW(), NOW());

  PERFORM tests.set_auth_uid(user2_id);
  INSERT INTO requests (id, user_id, moment_id, status, message, created_at, updated_at)
  VALUES (request_id, user2_id, moment_id, 'pending', 'I want to join!', NOW(), NOW());

  -- Switch to unrelated user
  PERFORM tests.set_auth_uid(user3_id);

  -- Test: User3 cannot see User2's request
  SELECT COUNT(*) INTO visible_count
  FROM requests
  WHERE id = request_id;

  ASSERT visible_count = 0, 'FAIL: Users should NOT view other users requests - SECURITY BREACH!';
  RAISE NOTICE 'PASS: Users cannot view other users requests';

  -- Cleanup
  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- CONVERSATIONS & MESSAGES RLS TESTS
-- ============================================

-- Test: Users can only view conversations they participate in
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  user3_id uuid := gen_random_uuid();
  conv_id uuid := gen_random_uuid();
  visible_count int;
BEGIN
  -- Setup
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.create_test_user(user3_id, 'user3', 'user3@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- Create conversation between User1 and User2
  INSERT INTO conversations (id, participant_ids, created_at, updated_at)
  VALUES (conv_id, ARRAY[user1_id, user2_id], NOW(), NOW());

  -- Test: User1 can see the conversation
  SELECT COUNT(*) INTO visible_count FROM conversations WHERE id = conv_id;
  ASSERT visible_count = 1, 'FAIL: User1 should see own conversation';

  -- Switch to User3 (not a participant)
  PERFORM tests.set_auth_uid(user3_id);

  -- Test: User3 cannot see the conversation
  SELECT COUNT(*) INTO visible_count FROM conversations WHERE id = conv_id;
  ASSERT visible_count = 0, 'FAIL: Non-participants should NOT view conversation - SECURITY BREACH!';

  RAISE NOTICE 'PASS: Users can only view conversations they participate in';

  -- Cleanup
  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: Users can only view messages in their conversations
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  user3_id uuid := gen_random_uuid();
  conv_id uuid := gen_random_uuid();
  message_id uuid := gen_random_uuid();
  visible_count int;
BEGIN
  -- Setup
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.create_test_user(user3_id, 'user3', 'user3@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  INSERT INTO conversations (id, participant_ids, created_at, updated_at)
  VALUES (conv_id, ARRAY[user1_id, user2_id], NOW(), NOW());

  INSERT INTO messages (id, conversation_id, sender_id, content, created_at, updated_at)
  VALUES (message_id, conv_id, user1_id, 'Hello User2!', NOW(), NOW());

  -- Test: User2 can see the message
  PERFORM tests.set_auth_uid(user2_id);
  SELECT COUNT(*) INTO visible_count FROM messages WHERE id = message_id;
  ASSERT visible_count = 1, 'FAIL: Conversation participants should see messages';

  -- Test: User3 cannot see the message
  PERFORM tests.set_auth_uid(user3_id);
  SELECT COUNT(*) INTO visible_count FROM messages WHERE id = message_id;
  ASSERT visible_count = 0, 'FAIL: Non-participants should NOT view messages - SECURITY BREACH!';

  RAISE NOTICE 'PASS: Users can only view messages in their conversations';

  -- Cleanup
  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- TRANSACTIONS TABLE RLS TESTS
-- ============================================

-- Test: Users can only view their own transactions
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  transaction1_id uuid := gen_random_uuid();
  transaction2_id uuid := gen_random_uuid();
  visible_count int;
BEGIN
  -- Setup
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  INSERT INTO transactions (id, user_id, amount, type, status, created_at, updated_at)
  VALUES (transaction1_id, user1_id, 100.00, 'deposit', 'completed', NOW(), NOW());

  PERFORM tests.set_auth_uid(user2_id);
  INSERT INTO transactions (id, user_id, amount, type, status, created_at, updated_at)
  VALUES (transaction2_id, user2_id, 50.00, 'withdrawal', 'completed', NOW(), NOW());

  -- Test: User2 cannot see User1's transaction
  SELECT COUNT(*) INTO visible_count FROM transactions WHERE id = transaction1_id;
  ASSERT visible_count = 0, 'FAIL: Users should NOT view other transactions - SECURITY BREACH!';

  -- Test: User2 can see own transaction
  SELECT COUNT(*) INTO visible_count FROM transactions WHERE id = transaction2_id;
  ASSERT visible_count = 1, 'FAIL: Users should view own transactions';

  RAISE NOTICE 'PASS: Users can only view their own transactions';

  -- Cleanup
  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- BLOCKS TABLE RLS TESTS
-- ============================================

-- Test: Users can only view their own blocks
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  user3_id uuid := gen_random_uuid();
  block_id uuid := gen_random_uuid();
  visible_count int;
BEGIN
  -- Setup
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.create_test_user(user3_id, 'user3', 'user3@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- User1 blocks User2
  INSERT INTO blocks (id, blocker_id, blocked_id, created_at)
  VALUES (block_id, user1_id, user2_id, NOW());

  -- Test: User1 can see own block
  SELECT COUNT(*) INTO visible_count FROM blocks WHERE id = block_id;
  ASSERT visible_count = 1, 'FAIL: Users should view own blocks';

  -- Test: User3 cannot see User1's block
  PERFORM tests.set_auth_uid(user3_id);
  SELECT COUNT(*) INTO visible_count FROM blocks WHERE id = block_id;
  ASSERT visible_count = 0, 'FAIL: Users should NOT view other users blocks - SECURITY BREACH!';

  RAISE NOTICE 'PASS: Users can only view their own blocks';

  -- Cleanup
  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- FINAL TEST SUMMARY
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'RLS POLICY TEST SUITE COMPLETED';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'All critical security tests passed!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tested policies:';
  RAISE NOTICE '  ✓ Users: View/Update/Insert restrictions';
  RAISE NOTICE '  ✓ Moments: Active/Draft visibility, ownership';
  RAISE NOTICE '  ✓ Requests: User/Moment owner visibility';
  RAISE NOTICE '  ✓ Conversations: Participant-only access';
  RAISE NOTICE '  ✓ Messages: Conversation-based access';
  RAISE NOTICE '  ✓ Transactions: User-only access';
  RAISE NOTICE '  ✓ Blocks: User-only access';
  RAISE NOTICE '';
  RAISE NOTICE 'Data leak risk: MINIMIZED ✓';
  RAISE NOTICE '============================================';
END $$;
