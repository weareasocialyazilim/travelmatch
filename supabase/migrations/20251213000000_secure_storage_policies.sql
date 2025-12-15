-- ============================================================================
-- SECURE STORAGE BUCKET POLICIES
-- Migration: 20251213000000_secure_storage_policies
-- Description: Implements secure RLS policies for all storage buckets
-- CRITICAL: These policies protect user uploads and sensitive documents
-- ============================================================================

-- =============================================================================
-- 1. AVATARS BUCKET - Public read, owner write
-- =============================================================================

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- PUBLIC READ: Anyone can view avatar images
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- OWNER WRITE: Only authenticated users can upload to their own folder
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- OWNER UPDATE: Only owner can update their avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- OWNER DELETE: Only owner can delete their avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================================================
-- 2. KYC_DOCS BUCKET - STRICTLY PRIVATE (sensitive identity documents)
-- =============================================================================

-- Create bucket if not exists - PRIVATE (not public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc_docs', 'kyc_docs', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop existing policies
DROP POLICY IF EXISTS "KYC docs are strictly private" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own KYC docs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view KYC docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own KYC docs" ON storage.objects;

-- PRIVATE READ: Only owner can view their own KYC documents
CREATE POLICY "Users can view their own KYC docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc_docs' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ADMIN READ: Admins can view KYC docs for verification
-- Uses secure helper function to check admin role
CREATE POLICY "Admins can view KYC docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc_docs' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- OWNER UPLOAD: Only owner can upload to their folder
CREATE POLICY "Users can upload their own KYC docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kyc_docs' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- NO UPDATE: KYC docs should not be modified after upload (audit trail)
-- If update is needed, user must delete and re-upload

-- OWNER DELETE: Only owner can delete their docs
CREATE POLICY "Users can delete their own KYC docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'kyc_docs' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================================================
-- 3. MOMENT-IMAGES BUCKET - Public read, owner write
-- =============================================================================

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('moment-images', 'moment-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies
DROP POLICY IF EXISTS "Moment images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload moment images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their moment images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their moment images" ON storage.objects;

-- PUBLIC READ: Anyone can view moment images
CREATE POLICY "Moment images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'moment-images');

-- OWNER WRITE: Only owner can upload to their folder
CREATE POLICY "Users can upload moment images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'moment-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- OWNER UPDATE: Only owner can update their moment images
CREATE POLICY "Users can update their moment images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'moment-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- OWNER DELETE: Only owner can delete their moment images
CREATE POLICY "Users can delete their moment images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'moment-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================================================
-- 4. PROFILE-PROOFS BUCKET - Owner only (sensitive verification photos)
-- =============================================================================

-- Create bucket if not exists - PRIVATE
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-proofs', 'profile-proofs', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload profile proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their profile proofs" ON storage.objects;

-- OWNER READ: Only owner can view their proofs
CREATE POLICY "Users can view their own profile proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-proofs' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- OWNER UPLOAD: Only owner can upload
CREATE POLICY "Users can upload profile proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-proofs' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- OWNER DELETE: Only owner can delete
CREATE POLICY "Users can delete their profile proofs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-proofs' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================================================
-- 5. VIDEO-UPLOADS BUCKET - Owner only until published
-- =============================================================================

-- Create bucket if not exists - PRIVATE
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-uploads', 'video-uploads', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own video uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their video uploads" ON storage.objects;

-- OWNER READ: Only owner can view their uploads
CREATE POLICY "Users can view their own video uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'video-uploads' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- OWNER UPLOAD: Only owner can upload
CREATE POLICY "Users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'video-uploads' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- OWNER DELETE: Only owner can delete
CREATE POLICY "Users can delete their video uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'video-uploads' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================================================
-- 6. FILE SIZE AND MIME TYPE VALIDATION TRIGGERS
-- =============================================================================

-- Function to validate file uploads
CREATE OR REPLACE FUNCTION storage.validate_file_upload()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = storage, public
LANGUAGE plpgsql AS $$
DECLARE
  max_size_bytes BIGINT;
  allowed_mimes TEXT[];
BEGIN
  -- Define limits per bucket
  CASE NEW.bucket_id
    WHEN 'avatars' THEN
      max_size_bytes := 5 * 1024 * 1024; -- 5MB
      allowed_mimes := ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    WHEN 'kyc_docs' THEN
      max_size_bytes := 10 * 1024 * 1024; -- 10MB
      allowed_mimes := ARRAY['image/jpeg', 'image/png', 'application/pdf'];
    WHEN 'moment-images' THEN
      max_size_bytes := 20 * 1024 * 1024; -- 20MB
      allowed_mimes := ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    WHEN 'profile-proofs' THEN
      max_size_bytes := 10 * 1024 * 1024; -- 10MB
      allowed_mimes := ARRAY['image/jpeg', 'image/png'];
    WHEN 'video-uploads' THEN
      max_size_bytes := 500 * 1024 * 1024; -- 500MB
      allowed_mimes := ARRAY['video/mp4', 'video/quicktime', 'video/webm'];
    ELSE
      max_size_bytes := 10 * 1024 * 1024; -- 10MB default
      allowed_mimes := ARRAY['image/jpeg', 'image/png', 'application/pdf'];
  END CASE;

  -- Check file size (metadata should contain size)
  IF (NEW.metadata->>'size')::BIGINT > max_size_bytes THEN
    RAISE EXCEPTION 'File size exceeds maximum allowed (% bytes)', max_size_bytes;
  END IF;

  -- Check MIME type
  IF NOT (NEW.metadata->>'mimetype' = ANY(allowed_mimes)) THEN
    RAISE EXCEPTION 'File type not allowed for this bucket. Allowed: %', array_to_string(allowed_mimes, ', ');
  END IF;

  RETURN NEW;
END;
$$;

-- Apply trigger to storage.objects
DROP TRIGGER IF EXISTS validate_file_upload_trigger ON storage.objects;
CREATE TRIGGER validate_file_upload_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION storage.validate_file_upload();

-- =============================================================================
-- 7. AUDIT LOG FOR SENSITIVE BUCKET ACCESS
-- =============================================================================

CREATE OR REPLACE FUNCTION storage.log_sensitive_access()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = storage, public
LANGUAGE plpgsql AS $$
BEGIN
  -- Log access to sensitive buckets
  IF NEW.bucket_id IN ('kyc_docs', 'profile-proofs') THEN
    INSERT INTO public.audit_logs (
      id,
      timestamp,
      user_id,
      event,
      category,
      resource,
      resource_id,
      action,
      result,
      metadata
    ) VALUES (
      gen_random_uuid(),
      NOW(),
      auth.uid(),
      'storage_access',
      'security',
      NEW.bucket_id,
      NEW.id::TEXT,
      TG_OP,
      'success',
      jsonb_build_object(
        'path', NEW.name,
        'size', NEW.metadata->>'size',
        'mimetype', NEW.metadata->>'mimetype'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply trigger for audit logging
DROP TRIGGER IF EXISTS log_sensitive_access_trigger ON storage.objects;
CREATE TRIGGER log_sensitive_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION storage.log_sensitive_access();

-- =============================================================================
-- SUMMARY
-- =============================================================================
-- Bucket: avatars       | Public: YES | Read: Public | Write: Owner only
-- Bucket: kyc_docs      | Public: NO  | Read: Owner+Admin | Write: Owner only
-- Bucket: moment-images | Public: YES | Read: Public | Write: Owner only
-- Bucket: profile-proofs| Public: NO  | Read: Owner only | Write: Owner only
-- Bucket: video-uploads | Public: NO  | Read: Owner only | Write: Owner only
-- 
-- Additional Security:
-- - File size limits enforced per bucket
-- - MIME type validation per bucket
-- - Audit logging for sensitive bucket access
-- ============================================================================
