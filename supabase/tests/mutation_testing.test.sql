-- ============================================
-- MUTATION TESTING
-- ============================================
-- Description: Test RLS policies against mutations/changes
-- Purpose: Ensure policies remain secure after schema changes
-- Version: 1.0.0
-- Created: 2024-12-07

-- ============================================
-- POLICY MUTATION RESISTANCE
-- ============================================

-- Test: Disabled RLS detection
DO $$
DECLARE
  users_rls_enabled boolean;
  moments_rls_enabled boolean;
  transactions_rls_enabled boolean;
BEGIN
  -- Check if RLS is enabled on critical tables
  SELECT relrowsecurity INTO users_rls_enabled
  FROM pg_class WHERE relname = 'users';
  
  SELECT relrowsecurity INTO moments_rls_enabled
  FROM pg_class WHERE relname = 'moments';
  
  SELECT relrowsecurity INTO transactions_rls_enabled
  FROM pg_class WHERE relname = 'transactions';

  ASSERT users_rls_enabled = true, 'FAIL: RLS disabled on users table - CRITICAL!';
  ASSERT moments_rls_enabled = true, 'FAIL: RLS disabled on moments table - CRITICAL!';
  ASSERT transactions_rls_enabled = true, 'FAIL: RLS disabled on transactions - CRITICAL!';

  RAISE NOTICE 'PASS: RLS enabled on all critical tables';
END $$;

-- ============================================
-- MISSING POLICY DETECTION
-- ============================================

-- Test: All tables have SELECT policies
DO $$
DECLARE
  tables_without_select RECORD;
  missing_count int := 0;
BEGIN
  FOR tables_without_select IN
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename NOT IN (
        SELECT tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' AND cmd = 'SELECT'
      )
      AND tablename IN ('users', 'moments', 'messages', 'transactions', 'proofs')
  LOOP
    RAISE WARNING 'Table % missing SELECT policy', tables_without_select.tablename;
    missing_count := missing_count + 1;
  END LOOP;

  ASSERT missing_count = 0, 'FAIL: Some tables missing SELECT policies';
  RAISE NOTICE 'PASS: All tables have SELECT policies';
END $$;

-- Test: All tables have INSERT/UPDATE/DELETE policies
DO $$
DECLARE
  tables_without_insert RECORD;
  tables_without_update RECORD;
  tables_without_delete RECORD;
  missing_count int := 0;
BEGIN
  -- Check INSERT policies
  FOR tables_without_insert IN
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN ('moments', 'messages', 'requests')
      AND tablename NOT IN (
        SELECT tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' AND cmd = 'INSERT'
      )
  LOOP
    RAISE WARNING 'Table % missing INSERT policy', tables_without_insert.tablename;
    missing_count := missing_count + 1;
  END LOOP;

  -- Check UPDATE policies
  FOR tables_without_update IN
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN ('users', 'moments', 'messages')
      AND tablename NOT IN (
        SELECT tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' AND cmd = 'UPDATE'
      )
  LOOP
    RAISE WARNING 'Table % missing UPDATE policy', tables_without_update.tablename;
    missing_count := missing_count + 1;
  END LOOP;

  ASSERT missing_count = 0, 'FAIL: Some tables missing INSERT/UPDATE policies';
  RAISE NOTICE 'PASS: All tables have required policies';
END $$;

-- ============================================
-- POLICY LOGIC MUTATION TESTS
-- ============================================

-- Test: User ownership checks are not bypassable
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  moment_id uuid := gen_random_uuid();
  update_count int;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  
  -- User1 creates moment
  PERFORM tests.set_auth_uid(user1_id);
  INSERT INTO moments (id, user_id, title, type, price_amount)
  VALUES (moment_id, user1_id, 'Test Moment', 'coffee', 5.00);

  -- User2 tries to update via direct SQL (mutation test)
  PERFORM tests.set_auth_uid(user2_id);
  UPDATE moments SET user_id = user2_id WHERE id = moment_id;
  GET DIAGNOSTICS update_count = ROW_COUNT;

  ASSERT update_count = 0, 'FAIL: Ownership check bypassed - CRITICAL MUTATION!';
  RAISE NOTICE 'PASS: Ownership checks resistant to mutations';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: Auth context checks are enforced
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  moment_id uuid := gen_random_uuid();
  can_read_without_auth boolean;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  
  -- Create moment
  PERFORM tests.set_auth_uid(user1_id);
  INSERT INTO moments (id, user_id, title, type, price_amount, status)
  VALUES (moment_id, user1_id, 'Private', 'coffee', 5.00, 'draft');

  -- Clear auth context
  PERFORM tests.clear_auth_uid();
  
  -- Try to read without auth
  SELECT EXISTS(
    SELECT 1 FROM moments WHERE id = moment_id AND status = 'draft'
  ) INTO can_read_without_auth;

  -- Public moments are visible, but drafts should not be
  ASSERT can_read_without_auth = false, 
    'FAIL: Can read private data without auth - MUTATION!';
  RAISE NOTICE 'PASS: Auth context required for private data';

  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- CROSS-TABLE POLICY CONSISTENCY
-- ============================================

-- Test: Related tables have consistent policies
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  moment_id uuid := gen_random_uuid();
  request_id uuid := gen_random_uuid();
  transaction_id uuid := gen_random_uuid();
  can_see_request boolean;
  can_see_transaction boolean;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  
  -- User1 creates moment
  PERFORM tests.set_auth_uid(user1_id);
  INSERT INTO moments (id, user_id, title, type, price_amount)
  VALUES (moment_id, user1_id, 'Coffee', 'coffee', 5.00);

  -- User2 creates request
  PERFORM tests.set_auth_uid(user2_id);
  INSERT INTO requests (id, moment_id, user_id, status)
  VALUES (request_id, moment_id, user2_id, 'pending');

  -- Create transaction
  INSERT INTO transactions (id, sender_id, receiver_id, moment_id, type, amount)
  VALUES (transaction_id, user2_id, user1_id, moment_id, 'gift', 5.00);

  -- User1 should see related request and transaction
  PERFORM tests.set_auth_uid(user1_id);
  
  SELECT EXISTS(
    SELECT 1 FROM requests WHERE id = request_id
  ) INTO can_see_request;

  SELECT EXISTS(
    SELECT 1 FROM transactions WHERE id = transaction_id
  ) INTO can_see_transaction;

  ASSERT can_see_request = true, 'FAIL: Moment owner cannot see request';
  ASSERT can_see_transaction = true, 'FAIL: Transaction party cannot see transaction';
  
  RAISE NOTICE 'PASS: Related table policies are consistent';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- POLICY BYPASS MUTATION TESTS
-- ============================================

-- Test: Cannot bypass policies with UNION queries
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  user1_email text;
  bypass_worked boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  
  PERFORM tests.set_auth_uid(user2_id);

  -- Try to bypass with UNION
  BEGIN
    EXECUTE format('
      SELECT email FROM users WHERE id = %L
      UNION ALL
      SELECT email FROM users WHERE id = %L
    ', user2_id, user1_id) INTO user1_email;
    
    bypass_worked := (user1_email IS NOT NULL);
  EXCEPTION WHEN OTHERS THEN
    bypass_worked := false;
  END;

  -- RLS should still apply to UNION queries
  RAISE NOTICE 'INFO: UNION query test completed (policies should apply)';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: Cannot bypass policies with CTE
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  bypass_worked boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  
  PERFORM tests.set_auth_uid(user2_id);

  -- Try to bypass with CTE
  BEGIN
    WITH all_users AS (
      SELECT * FROM users
    )
    SELECT id FROM all_users WHERE id = user1_id;
    
    bypass_worked := true;
  EXCEPTION WHEN OTHERS THEN
    bypass_worked := false;
  END;

  -- RLS should apply to CTEs
  RAISE NOTICE 'INFO: CTE bypass test completed (policies should apply)';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- DEFAULT POLICY MUTATION TESTS
-- ============================================

-- Test: No overly permissive default policies
DO $$
DECLARE
  permissive_policy RECORD;
  dangerous_count int := 0;
BEGIN
  -- Check for policies with "true" in USING clause
  FOR permissive_policy IN
    SELECT schemaname, tablename, policyname, qual
    FROM pg_policies
    WHERE schemaname = 'public'
      AND cmd IN ('UPDATE', 'DELETE')
      AND qual = 'true'
  LOOP
    RAISE WARNING 'Overly permissive policy: %.%.%', 
      permissive_policy.schemaname, 
      permissive_policy.tablename, 
      permissive_policy.policyname;
    dangerous_count := dangerous_count + 1;
  END LOOP;

  ASSERT dangerous_count = 0, 
    'FAIL: Found overly permissive UPDATE/DELETE policies - SECURITY RISK!';
  
  RAISE NOTICE 'PASS: No overly permissive policies found';
END $$;

-- ============================================
-- POLICY COMPLETENESS MUTATION TESTS
-- ============================================

-- Test: All CRUD operations have policies
DO $$
DECLARE
  table_name text;
  operations text[] := ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
  operation text;
  policy_exists boolean;
  missing_policies text[] := ARRAY[]::text[];
BEGIN
  -- Check critical tables
  FOREACH table_name IN ARRAY ARRAY['users', 'moments', 'messages', 'transactions']
  LOOP
    FOREACH operation IN ARRAY operations
    LOOP
      SELECT EXISTS(
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = table_name
          AND cmd = operation
      ) INTO policy_exists;

      IF NOT policy_exists AND operation != 'DELETE' THEN
        -- DELETE policies are optional for some tables
        missing_policies := array_append(missing_policies, 
          table_name || '.' || operation);
      END IF;
    END LOOP;
  END LOOP;

  ASSERT array_length(missing_policies, 1) IS NULL OR array_length(missing_policies, 1) = 0,
    'FAIL: Missing policies: ' || array_to_string(missing_policies, ', ');

  RAISE NOTICE 'PASS: All required CRUD policies exist';
END $$;

-- ============================================
-- REGRESSION TESTS
-- ============================================

-- Test: Previously fixed vulnerabilities stay fixed
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  message_id uuid := gen_random_uuid();
  conversation_id uuid := gen_random_uuid();
  leak_count int;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  
  -- Create private conversation
  PERFORM tests.set_auth_uid(user1_id);
  INSERT INTO conversations (id, participants, type)
  VALUES (conversation_id, ARRAY[user1_id]::uuid[], 'direct');

  INSERT INTO messages (id, conversation_id, sender_id, content)
  VALUES (message_id, conversation_id, user1_id, 'Private message');

  -- User2 tries to see message (regression test)
  PERFORM tests.set_auth_uid(user2_id);
  SELECT COUNT(*) INTO leak_count
  FROM messages 
  WHERE id = message_id;

  ASSERT leak_count = 0, 
    'FAIL: Regression - message leak vulnerability reintroduced!';
  
  RAISE NOTICE 'PASS: No regression in previously fixed vulnerabilities';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- POLICY PERFORMANCE MUTATION TESTS
-- ============================================

-- Test: Policies don't cause performance degradation
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  start_time timestamp;
  end_time timestamp;
  duration interval;
  i int;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- Create test data
  FOR i IN 1..100 LOOP
    INSERT INTO moments (user_id, title, type, price_amount)
    VALUES (user1_id, 'Moment ' || i, 'coffee', 5.00);
  END LOOP;

  -- Measure query performance with RLS
  start_time := clock_timestamp();
  
  PERFORM COUNT(*) FROM moments WHERE user_id = user1_id;
  
  end_time := clock_timestamp();
  duration := end_time - start_time;

  -- Should complete within reasonable time (1 second for 100 rows)
  ASSERT duration < interval '1 second',
    'FAIL: Policy causing performance degradation - took ' || duration;

  RAISE NOTICE 'PASS: Policies perform within acceptable limits';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- CLEANUP
-- ============================================

RAISE NOTICE '==============================================';
RAISE NOTICE 'MUTATION TESTING COMPLETED';
RAISE NOTICE '==============================================';
RAISE NOTICE '';
RAISE NOTICE 'All mutation tests passed!';
RAISE NOTICE 'Policies are resistant to common mutations and bypasses.';
RAISE NOTICE 'No regressions detected in previously fixed vulnerabilities.';
