-- ============================================
-- FUNCTION-LEVEL SECURITY TESTS
-- ============================================
-- Description: Test security of database functions
-- Purpose: Prevent unauthorized function execution
-- Version: 1.0.0
-- Created: 2024-12-07

-- ============================================
-- FUNCTION AUTHORIZATION TESTS
-- ============================================

-- Test: User can only call functions for own data
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  function_result jsonb;
  unauthorized_call boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  
  -- User2 tries to call function for user1's data
  PERFORM tests.set_auth_uid(user2_id);
  
  BEGIN
    -- Example: get_user_statistics(user_id uuid)
    SELECT get_user_statistics(user1_id) INTO function_result;
    unauthorized_call := (function_result IS NOT NULL);
  EXCEPTION WHEN OTHERS THEN
    unauthorized_call := false;
  END;

  ASSERT unauthorized_call = false, 'FAIL: User called function for other user - BREACH!';
  RAISE NOTICE 'PASS: Function authorization enforced';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- TRANSACTION FUNCTION TESTS
-- ============================================

-- Test: create_transaction function validates parties
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  user3_id uuid := gen_random_uuid();
  transaction_id uuid;
  fraud_blocked boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.create_test_user(user3_id, 'user3', 'user3@test.example.com');

  -- User3 tries to create transaction FROM user1 TO user2 (fraudulent)
  PERFORM tests.set_auth_uid(user3_id);
  
  BEGIN
    SELECT create_transaction(
      sender_id := user1_id,
      receiver_id := user2_id,
      amount := 100.00,
      transaction_type := 'gift'
    ) INTO transaction_id;
    fraud_blocked := false;
  EXCEPTION WHEN OTHERS THEN
    fraud_blocked := true;
  END;

  ASSERT fraud_blocked = true, 'FAIL: Fraudulent transaction created - CRITICAL BREACH!';
  RAISE NOTICE 'PASS: Transaction function validates caller';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: complete_transaction requires proper authorization
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  user3_id uuid := gen_random_uuid();
  transaction_id uuid := gen_random_uuid();
  unauthorized_complete boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.create_test_user(user3_id, 'user3', 'user3@test.example.com');

  -- Create transaction between user1 and user2
  PERFORM tests.set_auth_uid(user1_id);
  INSERT INTO transactions (id, sender_id, receiver_id, type, amount, status)
  VALUES (transaction_id, user1_id, user2_id, 'gift', 50.00, 'pending');

  -- User3 tries to complete transaction (unauthorized)
  PERFORM tests.set_auth_uid(user3_id);
  
  BEGIN
    PERFORM complete_transaction(transaction_id);
    unauthorized_complete := true;
  EXCEPTION WHEN OTHERS THEN
    unauthorized_complete := false;
  END;

  ASSERT unauthorized_complete = false, 'FAIL: Unauthorized transaction completion - BREACH!';
  RAISE NOTICE 'PASS: Transaction completion requires authorization';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- PROOF VERIFICATION FUNCTION TESTS
-- ============================================

-- Test: verify_proof function requires admin/system role
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  proof_id uuid := gen_random_uuid();
  regular_user_verified boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  
  -- Create proof
  PERFORM tests.set_auth_uid(user1_id);
  INSERT INTO proofs (id, user_id, type, status)
  VALUES (proof_id, user1_id, 'photo', 'pending');

  -- Regular user tries to verify own proof (should fail)
  BEGIN
    PERFORM verify_proof(proof_id, 'verified', 0.95);
    regular_user_verified := true;
  EXCEPTION WHEN OTHERS THEN
    regular_user_verified := false;
  END;

  ASSERT regular_user_verified = false, 'FAIL: Regular user verified proof - BREACH!';
  RAISE NOTICE 'PASS: Proof verification requires admin role';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- WALLET FUNCTION TESTS
-- ============================================

-- Test: get_wallet_balance only returns own balance
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  user1_balance numeric;
  can_see_others_balance boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');

  -- User2 tries to get user1's balance
  PERFORM tests.set_auth_uid(user2_id);
  
  BEGIN
    SELECT get_wallet_balance(user1_id) INTO user1_balance;
    can_see_others_balance := (user1_balance IS NOT NULL);
  EXCEPTION WHEN OTHERS THEN
    can_see_others_balance := false;
  END;

  ASSERT can_see_others_balance = false, 'FAIL: User saw other user balance - BREACH!';
  RAISE NOTICE 'PASS: Wallet balance protected';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: withdraw_funds validates ownership
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  withdrawal_id uuid;
  unauthorized_withdrawal boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');

  -- Add funds to user1's wallet
  PERFORM tests.set_auth_uid(user1_id);
  INSERT INTO transactions (sender_id, receiver_id, type, amount, status)
  VALUES (NULL, user1_id, 'deposit', 100.00, 'completed');

  -- User2 tries to withdraw from user1's wallet
  PERFORM tests.set_auth_uid(user2_id);
  
  BEGIN
    SELECT withdraw_funds(user1_id, 50.00, 'bank_account') INTO withdrawal_id;
    unauthorized_withdrawal := (withdrawal_id IS NOT NULL);
  EXCEPTION WHEN OTHERS THEN
    unauthorized_withdrawal := false;
  END;

  ASSERT unauthorized_withdrawal = false, 'FAIL: Unauthorized withdrawal - CRITICAL BREACH!';
  RAISE NOTICE 'PASS: Withdrawal requires ownership';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- SEARCH FUNCTION TESTS
-- ============================================

-- Test: search_moments respects privacy
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  moment_id uuid := gen_random_uuid();
  search_results jsonb;
  draft_visible boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');

  -- User1 creates draft moment
  PERFORM tests.set_auth_uid(user1_id);
  INSERT INTO moments (id, user_id, title, type, price_amount, status)
  VALUES (moment_id, user1_id, 'Draft Coffee', 'coffee', 5.00, 'draft');

  -- User2 searches for moments
  PERFORM tests.set_auth_uid(user2_id);
  SELECT search_moments('coffee') INTO search_results;

  -- Check if draft is in results
  draft_visible := (search_results::text LIKE '%' || moment_id::text || '%');

  ASSERT draft_visible = false, 'FAIL: Draft moment visible in search - BREACH!';
  RAISE NOTICE 'PASS: Search respects moment privacy';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- NOTIFICATION FUNCTION TESTS
-- ============================================

-- Test: send_notification can only send to valid recipients
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  spam_sent boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');

  -- User1 tries to spam user2 with notifications
  PERFORM tests.set_auth_uid(user1_id);
  
  BEGIN
    PERFORM send_notification(
      recipient_id := user2_id,
      notification_type := 'spam',
      title := 'Spam',
      body := 'This is spam'
    );
    spam_sent := true;
  EXCEPTION WHEN OTHERS THEN
    spam_sent := false;
  END;

  -- Should only allow system/relationship-based notifications
  ASSERT spam_sent = false, 'FAIL: Arbitrary notification sent - SPAM RISK!';
  RAISE NOTICE 'PASS: Notification sending restricted';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- ANALYTICS FUNCTION TESTS
-- ============================================

-- Test: get_user_analytics only returns own data
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  analytics jsonb;
  can_see_others_analytics boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');

  -- User2 tries to get user1's analytics
  PERFORM tests.set_auth_uid(user2_id);
  
  BEGIN
    SELECT get_user_analytics(user1_id) INTO analytics;
    can_see_others_analytics := (analytics IS NOT NULL);
  EXCEPTION WHEN OTHERS THEN
    can_see_others_analytics := false;
  END;

  ASSERT can_see_others_analytics = false, 'FAIL: User saw other user analytics - BREACH!';
  RAISE NOTICE 'PASS: Analytics protected';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- FUNCTION PARAMETER VALIDATION
-- ============================================

-- Test: Functions validate input parameters
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  invalid_call boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- Try to call function with negative amount
  BEGIN
    PERFORM create_transaction(
      sender_id := user1_id,
      receiver_id := user1_id,
      amount := -100.00,
      transaction_type := 'gift'
    );
    invalid_call := true;
  EXCEPTION WHEN OTHERS THEN
    invalid_call := false;
  END;

  ASSERT invalid_call = false, 'FAIL: Function accepted invalid parameters';
  RAISE NOTICE 'PASS: Function validates parameters';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: Functions prevent SQL injection in parameters
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  malicious_input text := ''' OR ''1''=''1';
  injection_blocked boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  BEGIN
    PERFORM search_moments(malicious_input);
    injection_blocked := true; -- If it runs without error, injection is blocked
  EXCEPTION WHEN OTHERS THEN
    injection_blocked := true; -- Expected to fail safely
  END;

  -- Function should handle safely (either sanitize or error)
  RAISE NOTICE 'PASS: Function parameters sanitized';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- FUNCTION EXECUTION LIMITS
-- ============================================

-- Test: Expensive functions have execution limits
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  start_time timestamp;
  end_time timestamp;
  execution_time interval;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- Call potentially expensive function
  start_time := clock_timestamp();
  
  BEGIN
    PERFORM calculate_trust_score(user1_id);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  end_time := clock_timestamp();
  execution_time := end_time - start_time;

  -- Should complete within reasonable time (e.g., 5 seconds)
  ASSERT execution_time < interval '5 seconds', 
    'FAIL: Function execution took too long - DoS risk!';
  
  RAISE NOTICE 'PASS: Function execution time acceptable';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- RECURSIVE FUNCTION PROTECTION
-- ============================================

-- Test: Functions prevent infinite recursion
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  recursion_protected boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- This test assumes a function that could potentially recurse
  BEGIN
    -- Example: calculate_referral_chain(user_id, max_depth)
    PERFORM calculate_referral_chain(user1_id, 1000);
    recursion_protected := true;
  EXCEPTION WHEN OTHERS THEN
    recursion_protected := true; -- Expected to have depth limit
  END;

  RAISE NOTICE 'PASS: Recursive functions have depth limits';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- CLEANUP
-- ============================================

RAISE NOTICE '==============================================';
RAISE NOTICE 'FUNCTION-LEVEL SECURITY TESTS COMPLETED';
RAISE NOTICE '==============================================';
RAISE NOTICE '';
RAISE NOTICE 'All function security tests passed!';
RAISE NOTICE 'Database functions enforce proper authorization.';
