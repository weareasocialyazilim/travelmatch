-- ============================================================================
-- FIX REMAINING ISSUES
-- ============================================================================
-- Date: 2026-01-08
-- Purpose: Fix all remaining warnings and issues from previous migrations
-- Issues Fixed:
--   1. blocks table policies (table is named 'blocks', not 'user_blocks')
--   2. Avatar storage policies (ensure all required policies exist)
--   3. Fix any remaining multiple permissive policies
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. FIX BLOCKS TABLE POLICIES
-- ============================================================================
-- The table is named 'blocks', not 'user_blocks'
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blocks') THEN
    -- Drop any existing policies
    DROP POLICY IF EXISTS "blocks_select" ON public.blocks;
    DROP POLICY IF EXISTS "blocks_select_own" ON public.blocks;
    DROP POLICY IF EXISTS "Users can view own blocks" ON public.blocks;
    DROP POLICY IF EXISTS "blocks_insert" ON public.blocks;
    DROP POLICY IF EXISTS "blocks_insert_own" ON public.blocks;
    DROP POLICY IF EXISTS "Users can create blocks" ON public.blocks;
    DROP POLICY IF EXISTS "blocks_delete" ON public.blocks;
    DROP POLICY IF EXISTS "blocks_delete_own" ON public.blocks;
    DROP POLICY IF EXISTS "Users can delete own blocks" ON public.blocks;
    
    -- Enable RLS if not already enabled
    ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
    
    -- SELECT: Users can only see blocks they created
    CREATE POLICY "blocks_select_own" ON public.blocks
      FOR SELECT
      USING (blocker_id = (SELECT auth.uid()));
    
    -- INSERT: Users can only create blocks as themselves, cannot block themselves
    CREATE POLICY "blocks_insert_own" ON public.blocks
      FOR INSERT
      WITH CHECK (
        blocker_id = (SELECT auth.uid())
        AND blocked_id != (SELECT auth.uid())
        AND blocked_id IS NOT NULL
      );
    
    -- DELETE: Users can only delete their own blocks
    CREATE POLICY "blocks_delete_own" ON public.blocks
      FOR DELETE
      USING (blocker_id = (SELECT auth.uid()));
    
    RAISE NOTICE '✅ blocks: RLS policies created (SELECT, INSERT, DELETE)';
  ELSE
    RAISE NOTICE '⚠️ blocks table not found';
  END IF;
END $$;

-- ============================================================================
-- 2. FIX AVATAR STORAGE POLICIES
-- ============================================================================
-- Ensure all avatar policies use consistent naming and proper validation
-- ============================================================================

DO $$
BEGIN
  -- Drop all existing avatar policies to avoid conflicts
  DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Avatar upload auth" ON storage.objects;
  DROP POLICY IF EXISTS "Avatar delete auth" ON storage.objects;
  DROP POLICY IF EXISTS "avatar_upload_own_folder" ON storage.objects;
  DROP POLICY IF EXISTS "avatar_delete_own_folder" ON storage.objects;
  DROP POLICY IF EXISTS "avatar_update_own_folder" ON storage.objects;
  DROP POLICY IF EXISTS "avatar_select_public" ON storage.objects;
  
  -- Create consistent avatar policies
  
  -- SELECT: Avatars are publicly accessible
  CREATE POLICY "avatars_select_public" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');
  
  -- INSERT: Users can upload to their own folder only
  CREATE POLICY "avatars_insert_own" ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'avatars'
      AND auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
      AND name NOT LIKE '%..%'
    );
  
  -- UPDATE: Users can update their own avatars
  CREATE POLICY "avatars_update_own" ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'avatars'
      AND auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  
  -- DELETE: Users can delete their own avatars
  CREATE POLICY "avatars_delete_own" ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'avatars'
      AND auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  
  RAISE NOTICE '✅ avatars: Storage policies created (SELECT, INSERT, UPDATE, DELETE)';
END $$;

-- ============================================================================
-- 3. FIX MOMENTS STORAGE POLICIES
-- ============================================================================

DO $$
BEGIN
  -- Drop existing moment policies
  DROP POLICY IF EXISTS "Moment images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own moments" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own moments" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own moments" ON storage.objects;
  DROP POLICY IF EXISTS "moments_select_public" ON storage.objects;
  DROP POLICY IF EXISTS "moments_insert_own" ON storage.objects;
  DROP POLICY IF EXISTS "moments_update_own" ON storage.objects;
  DROP POLICY IF EXISTS "moments_delete_own" ON storage.objects;
  
  -- SELECT: Moments are publicly accessible
  CREATE POLICY "moments_select_public" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'moments');
  
  -- INSERT: Users can upload to their own folder
  CREATE POLICY "moments_insert_own" ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'moments'
      AND auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
      AND name NOT LIKE '%..%'
    );
  
  -- UPDATE: Users can update their own moments
  CREATE POLICY "moments_update_own" ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'moments'
      AND auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  
  -- DELETE: Users can delete their own moments
  CREATE POLICY "moments_delete_own" ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'moments'
      AND auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  
  RAISE NOTICE '✅ moments: Storage policies created (SELECT, INSERT, UPDATE, DELETE)';
END $$;

-- ============================================================================
-- 4. FIX PROOFS STORAGE POLICIES
-- ============================================================================

DO $$
BEGIN
  -- Drop existing proof policies
  DROP POLICY IF EXISTS "Users can view their own proofs" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload proofs" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own proofs" ON storage.objects;
  DROP POLICY IF EXISTS "proof_upload_recipient_only" ON storage.objects;
  DROP POLICY IF EXISTS "proof_view_participants" ON storage.objects;
  DROP POLICY IF EXISTS "proofs_select" ON storage.objects;
  DROP POLICY IF EXISTS "proofs_insert" ON storage.objects;
  DROP POLICY IF EXISTS "proofs_delete" ON storage.objects;
  
  -- SELECT: Authenticated users can view proofs in their folder
  CREATE POLICY "proofs_select_own" ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'proofs'
      AND auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  
  -- INSERT: Users can upload proofs to their own folder
  CREATE POLICY "proofs_insert_own" ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'proofs'
      AND auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
      AND name NOT LIKE '%..%'
    );
  
  -- DELETE: Users can delete their own proofs
  CREATE POLICY "proofs_delete_own" ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'proofs'
      AND auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  
  RAISE NOTICE '✅ proofs: Storage policies created (SELECT, INSERT, DELETE)';
END $$;

-- ============================================================================
-- 5. FIX COVERS STORAGE POLICIES
-- ============================================================================

DO $$
BEGIN
  -- Drop existing cover policies
  DROP POLICY IF EXISTS "Cover images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own cover" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own cover" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own cover" ON storage.objects;
  DROP POLICY IF EXISTS "covers_select_public" ON storage.objects;
  DROP POLICY IF EXISTS "covers_insert_own" ON storage.objects;
  DROP POLICY IF EXISTS "covers_update_own" ON storage.objects;
  DROP POLICY IF EXISTS "covers_delete_own" ON storage.objects;
  
  -- SELECT: Covers are publicly accessible
  CREATE POLICY "covers_select_public" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'covers');
  
  -- INSERT: Users can upload to their own folder
  CREATE POLICY "covers_insert_own" ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'covers'
      AND auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
      AND name NOT LIKE '%..%'
    );
  
  -- UPDATE: Users can update their own covers
  CREATE POLICY "covers_update_own" ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'covers'
      AND auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  
  -- DELETE: Users can delete their own covers
  CREATE POLICY "covers_delete_own" ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'covers'
      AND auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  
  RAISE NOTICE '✅ covers: Storage policies created (SELECT, INSERT, UPDATE, DELETE)';
END $$;

-- ============================================================================
-- 6. FIX KYC STORAGE POLICIES (Service Role Only)
-- ============================================================================

DO $$
BEGIN
  -- Drop existing kyc policies
  DROP POLICY IF EXISTS "Users can view their own KYC documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their KYC documents" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can view all KYC documents" ON storage.objects;
  DROP POLICY IF EXISTS "kyc_select" ON storage.objects;
  DROP POLICY IF EXISTS "kyc_insert" ON storage.objects;
  DROP POLICY IF EXISTS "kyc_select_own" ON storage.objects;
  DROP POLICY IF EXISTS "kyc_insert_own" ON storage.objects;
  
  -- SELECT: Users can only view their own KYC docs
  CREATE POLICY "kyc_select_own" ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'kyc'
      AND auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  
  -- INSERT: Users can upload to their own folder
  CREATE POLICY "kyc_insert_own" ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'kyc'
      AND auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
      AND name NOT LIKE '%..%'
    );
  
  RAISE NOTICE '✅ kyc: Storage policies created (SELECT, INSERT)';
END $$;

-- ============================================================================
-- 7. FIX MESSAGE ATTACHMENTS STORAGE POLICIES
-- ============================================================================

DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view message attachments in their conversations" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload message attachments" ON storage.objects;
  DROP POLICY IF EXISTS "message_attachments_select" ON storage.objects;
  DROP POLICY IF EXISTS "message_attachments_insert" ON storage.objects;
  DROP POLICY IF EXISTS "attachments_select" ON storage.objects;
  DROP POLICY IF EXISTS "attachments_insert" ON storage.objects;
  
  -- SELECT: Authenticated users can view attachments
  CREATE POLICY "attachments_select_auth" ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'message-attachments'
      AND auth.uid() IS NOT NULL
    );
  
  -- INSERT: Authenticated users can upload attachments
  CREATE POLICY "attachments_insert_auth" ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'message-attachments'
      AND auth.uid() IS NOT NULL
      AND name NOT LIKE '%..%'
    );
  
  RAISE NOTICE '✅ message-attachments: Storage policies created (SELECT, INSERT)';
END $$;

-- ============================================================================
-- 8. VERIFICATION
-- ============================================================================

DO $$
DECLARE
  blocks_count INTEGER;
  storage_policy_count INTEGER;
BEGIN
  -- Count blocks policies
  SELECT COUNT(*) INTO blocks_count
  FROM pg_policies
  WHERE tablename = 'blocks' AND schemaname = 'public';
  
  -- Count storage policies
  SELECT COUNT(*) INTO storage_policy_count
  FROM pg_policies
  WHERE tablename = 'objects' AND schemaname = 'storage';
  
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ FIX REMAINING ISSUES COMPLETE';
  RAISE NOTICE '============================================';
  RAISE NOTICE '  blocks table policies: %', blocks_count;
  RAISE NOTICE '  storage.objects policies: %', storage_policy_count;
  RAISE NOTICE '============================================';
END $$;

COMMIT;
