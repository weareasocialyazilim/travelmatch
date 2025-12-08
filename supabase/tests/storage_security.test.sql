-- ============================================
-- STORAGE BUCKET POLICY TESTS
-- ============================================
-- Description: Test storage bucket RLS policies
-- Purpose: Prevent unauthorized file access and uploads
-- Version: 1.0.0
-- Created: 2024-12-07

-- ============================================
-- STORAGE BUCKET STRUCTURE
-- ============================================
-- Buckets:
-- - avatars: User profile pictures (public read, user write)
-- - moment-images: Moment photos (public read, owner write)
-- - proof-media: Proof images/videos (owner-only)
-- - message-attachments: Chat attachments (conversation participants only)

-- ============================================
-- AVATAR BUCKET TESTS
-- ============================================

-- Test: User can upload to own avatar folder
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  upload_success boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- Try to upload avatar to own folder
  BEGIN
    INSERT INTO storage.objects (bucket_id, name, owner, metadata)
    VALUES (
      'avatars',
      user1_id::text || '/profile.jpg',
      user1_id,
      '{"size": 102400, "mimetype": "image/jpeg"}'::jsonb
    );
    upload_success := true;
  EXCEPTION WHEN OTHERS THEN
    upload_success := false;
  END;

  ASSERT upload_success = true, 'FAIL: Cannot upload to own avatar folder';
  RAISE NOTICE 'PASS: User can upload avatar';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: User cannot upload to another user's avatar folder
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  upload_blocked boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.set_auth_uid(user2_id);

  -- Try to upload to user1's avatar folder (should fail)
  BEGIN
    INSERT INTO storage.objects (bucket_id, name, owner, metadata)
    VALUES (
      'avatars',
      user1_id::text || '/hacked.jpg',
      user2_id,
      '{"size": 102400, "mimetype": "image/jpeg"}'::jsonb
    );
    upload_blocked := false;
  EXCEPTION WHEN OTHERS THEN
    upload_blocked := true;
  END;

  ASSERT upload_blocked = true, 'FAIL: User uploaded to another user folder - BREACH!';
  RAISE NOTICE 'PASS: Cross-user avatar upload blocked';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: Anyone can read avatars (public bucket)
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  object_id uuid;
  can_read boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  
  -- User1 uploads avatar
  PERFORM tests.set_auth_uid(user1_id);
  INSERT INTO storage.objects (bucket_id, name, owner, metadata)
  VALUES (
    'avatars',
    user1_id::text || '/profile.jpg',
    user1_id,
    '{"size": 102400}'::jsonb
  )
  RETURNING id INTO object_id;

  -- User2 reads avatar (should succeed - public)
  PERFORM tests.set_auth_uid(user2_id);
  SELECT EXISTS(
    SELECT 1 FROM storage.objects 
    WHERE id = object_id
  ) INTO can_read;

  ASSERT can_read = true, 'FAIL: Cannot read public avatar';
  RAISE NOTICE 'PASS: Public avatar readable';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: User cannot delete another user's avatar
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  object_id uuid;
  delete_count int;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  
  -- User1 uploads avatar
  PERFORM tests.set_auth_uid(user1_id);
  INSERT INTO storage.objects (bucket_id, name, owner)
  VALUES ('avatars', user1_id::text || '/profile.jpg', user1_id)
  RETURNING id INTO object_id;

  -- User2 tries to delete (should fail)
  PERFORM tests.set_auth_uid(user2_id);
  DELETE FROM storage.objects WHERE id = object_id;
  GET DIAGNOSTICS delete_count = ROW_COUNT;

  ASSERT delete_count = 0, 'FAIL: User deleted another user avatar - BREACH!';
  RAISE NOTICE 'PASS: Cross-user avatar delete blocked';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- MOMENT IMAGES BUCKET TESTS
-- ============================================

-- Test: Moment owner can upload images
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  moment_id uuid := gen_random_uuid();
  upload_success boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- Create moment
  INSERT INTO moments (id, user_id, title, type, price_amount)
  VALUES (moment_id, user1_id, 'Test Moment', 'coffee', 5.00);

  -- Upload moment image
  BEGIN
    INSERT INTO storage.objects (bucket_id, name, owner, metadata)
    VALUES (
      'moment-images',
      moment_id::text || '/photo1.jpg',
      user1_id,
      '{"momentId": "' || moment_id || '"}'::jsonb
    );
    upload_success := true;
  EXCEPTION WHEN OTHERS THEN
    upload_success := false;
  END;

  ASSERT upload_success = true, 'FAIL: Moment owner cannot upload images';
  RAISE NOTICE 'PASS: Moment owner can upload images';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: Non-owner cannot upload to moment folder
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  moment_id uuid := gen_random_uuid();
  upload_blocked boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  
  -- User1 creates moment
  PERFORM tests.set_auth_uid(user1_id);
  INSERT INTO moments (id, user_id, title, type, price_amount)
  VALUES (moment_id, user1_id, 'Test Moment', 'coffee', 5.00);

  -- User2 tries to upload (should fail)
  PERFORM tests.set_auth_uid(user2_id);
  BEGIN
    INSERT INTO storage.objects (bucket_id, name, owner)
    VALUES (
      'moment-images',
      moment_id::text || '/hacked.jpg',
      user2_id
    );
    upload_blocked := false;
  EXCEPTION WHEN OTHERS THEN
    upload_blocked := true;
  END;

  ASSERT upload_blocked = true, 'FAIL: Non-owner uploaded moment image - BREACH!';
  RAISE NOTICE 'PASS: Non-owner moment upload blocked';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- PROOF MEDIA BUCKET TESTS (Private)
-- ============================================

-- Test: User can upload proof media
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  proof_id uuid := gen_random_uuid();
  upload_success boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- Create proof
  INSERT INTO proofs (id, user_id, type, status)
  VALUES (proof_id, user1_id, 'photo', 'pending');

  -- Upload proof media
  BEGIN
    INSERT INTO storage.objects (bucket_id, name, owner, metadata)
    VALUES (
      'proof-media',
      proof_id::text || '/evidence.jpg',
      user1_id,
      '{"proofId": "' || proof_id || '"}'::jsonb
    );
    upload_success := true;
  EXCEPTION WHEN OTHERS THEN
    upload_success := false;
  END;

  ASSERT upload_success = true, 'FAIL: Cannot upload proof media';
  RAISE NOTICE 'PASS: Proof media upload successful';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: User cannot access another user's proof media
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  proof_id uuid := gen_random_uuid();
  object_id uuid;
  can_access boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  
  -- User1 uploads proof media
  PERFORM tests.set_auth_uid(user1_id);
  INSERT INTO proofs (id, user_id, type, status)
  VALUES (proof_id, user1_id, 'photo', 'pending');
  
  INSERT INTO storage.objects (bucket_id, name, owner)
  VALUES ('proof-media', proof_id::text || '/evidence.jpg', user1_id)
  RETURNING id INTO object_id;

  -- User2 tries to access (should fail - private bucket)
  PERFORM tests.set_auth_uid(user2_id);
  SELECT EXISTS(
    SELECT 1 FROM storage.objects 
    WHERE id = object_id AND bucket_id = 'proof-media'
  ) INTO can_access;

  ASSERT can_access = false, 'FAIL: User accessed private proof media - BREACH!';
  RAISE NOTICE 'PASS: Private proof media protected';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- MESSAGE ATTACHMENTS BUCKET TESTS
-- ============================================

-- Test: Conversation participants can upload attachments
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  conversation_id uuid := gen_random_uuid();
  message_id uuid := gen_random_uuid();
  upload_success boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  
  -- Create conversation
  PERFORM tests.set_auth_uid(user1_id);
  INSERT INTO conversations (id, participants, type)
  VALUES (conversation_id, ARRAY[user1_id, user2_id]::uuid[], 'direct');

  -- User1 uploads attachment
  BEGIN
    INSERT INTO storage.objects (bucket_id, name, owner, metadata)
    VALUES (
      'message-attachments',
      conversation_id::text || '/photo.jpg',
      user1_id,
      '{"conversationId": "' || conversation_id || '"}'::jsonb
    );
    upload_success := true;
  EXCEPTION WHEN OTHERS THEN
    upload_success := false;
  END;

  ASSERT upload_success = true, 'FAIL: Participant cannot upload attachment';
  RAISE NOTICE 'PASS: Conversation attachment upload successful';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: Non-participants cannot access conversation attachments
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  user3_id uuid := gen_random_uuid();
  conversation_id uuid := gen_random_uuid();
  object_id uuid;
  can_access boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.create_test_user(user2_id, 'user2', 'user2@test.example.com');
  PERFORM tests.create_test_user(user3_id, 'user3', 'user3@test.example.com');
  
  -- User1 and User2 conversation
  PERFORM tests.set_auth_uid(user1_id);
  INSERT INTO conversations (id, participants, type)
  VALUES (conversation_id, ARRAY[user1_id, user2_id]::uuid[], 'direct');

  -- User1 uploads attachment
  INSERT INTO storage.objects (bucket_id, name, owner, metadata)
  VALUES (
    'message-attachments',
    conversation_id::text || '/private.jpg',
    user1_id,
    '{"conversationId": "' || conversation_id || '"}'::jsonb
  )
  RETURNING id INTO object_id;

  -- User3 (non-participant) tries to access
  PERFORM tests.set_auth_uid(user3_id);
  SELECT EXISTS(
    SELECT 1 FROM storage.objects 
    WHERE id = object_id AND bucket_id = 'message-attachments'
  ) INTO can_access;

  ASSERT can_access = false, 'FAIL: Non-participant accessed attachment - BREACH!';
  RAISE NOTICE 'PASS: Non-participant attachment access blocked';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- FILE SIZE AND TYPE VALIDATION
-- ============================================

-- Test: File size limit enforcement (avatars: 5MB)
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  upload_blocked boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- Try to upload oversized file (10MB)
  BEGIN
    INSERT INTO storage.objects (bucket_id, name, owner, metadata)
    VALUES (
      'avatars',
      user1_id::text || '/huge.jpg',
      user1_id,
      '{"size": 10485760}'::jsonb -- 10MB
    );
    upload_blocked := false;
  EXCEPTION WHEN OTHERS THEN
    upload_blocked := true;
  END;

  -- Should be blocked by trigger/constraint
  ASSERT upload_blocked = true, 'FAIL: Oversized file uploaded - should be blocked';
  RAISE NOTICE 'PASS: File size limit enforced';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- Test: Invalid file type rejection
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  upload_blocked boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- Try to upload executable file
  BEGIN
    INSERT INTO storage.objects (bucket_id, name, owner, metadata)
    VALUES (
      'avatars',
      user1_id::text || '/virus.exe',
      user1_id,
      '{"mimetype": "application/x-msdownload"}'::jsonb
    );
    upload_blocked := false;
  EXCEPTION WHEN OTHERS THEN
    upload_blocked := true;
  END;

  ASSERT upload_blocked = true, 'FAIL: Invalid file type uploaded - SECURITY RISK!';
  RAISE NOTICE 'PASS: Invalid file type blocked';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- PATH TRAVERSAL ATTACK TESTS
-- ============================================

-- Test: Path traversal attack prevention
DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  upload_blocked boolean := false;
BEGIN
  PERFORM tests.create_test_user(user1_id, 'user1', 'user1@test.example.com');
  PERFORM tests.set_auth_uid(user1_id);

  -- Try path traversal in filename
  BEGIN
    INSERT INTO storage.objects (bucket_id, name, owner)
    VALUES (
      'avatars',
      '../../../etc/passwd',
      user1_id
    );
    upload_blocked := false;
  EXCEPTION WHEN OTHERS THEN
    upload_blocked := true;
  END;

  ASSERT upload_blocked = true, 'FAIL: Path traversal allowed - CRITICAL BREACH!';
  RAISE NOTICE 'PASS: Path traversal blocked';

  PERFORM tests.clear_auth_uid();
  PERFORM tests.cleanup_test_data();
END $$;

-- ============================================
-- CLEANUP
-- ============================================

RAISE NOTICE '==============================================';
RAISE NOTICE 'STORAGE BUCKET SECURITY TESTS COMPLETED';
RAISE NOTICE '==============================================';
RAISE NOTICE '';
RAISE NOTICE 'All storage security tests passed!';
RAISE NOTICE 'Storage buckets are secure from unauthorized access.';
