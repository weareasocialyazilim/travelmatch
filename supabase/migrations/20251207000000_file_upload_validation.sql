-- File Upload Validation Migration
-- Version: 1.0.0
-- Created: 2025-12-07
-- Description: Security controls for file uploads

-- ============================================
-- FILE UPLOAD CONSTRAINTS
-- ============================================

-- Add file size and type validation columns to storage.objects metadata
-- Note: Supabase Storage handles this automatically, but we can add custom validations

-- ============================================
-- FILE UPLOAD FUNCTIONS
-- ============================================

-- Function to validate file size (max 10MB for images, 5MB for documents)
CREATE OR REPLACE FUNCTION validate_file_size()
RETURNS TRIGGER AS $$
BEGIN
  -- Check file size based on bucket
  IF NEW.bucket_id = 'moment-images' THEN
    IF NEW.metadata->>'size'::INTEGER > 10485760 THEN -- 10MB
      RAISE EXCEPTION 'Image file size must not exceed 10MB';
    END IF;
  ELSIF NEW.bucket_id = 'proof-documents' THEN
    IF NEW.metadata->>'size'::INTEGER > 5242880 THEN -- 5MB
      RAISE EXCEPTION 'Document file size must not exceed 5MB';
    END IF;
  ELSIF NEW.bucket_id = 'avatars' THEN
    IF NEW.metadata->>'size'::INTEGER > 2097152 THEN -- 2MB
      RAISE EXCEPTION 'Avatar file size must not exceed 2MB';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate file type
CREATE OR REPLACE FUNCTION validate_file_type()
RETURNS TRIGGER AS $$
DECLARE
  file_ext TEXT;
  mime_type TEXT;
BEGIN
  -- Extract file extension
  file_ext := lower(substring(NEW.name from '\.([^.]*)$'));
  mime_type := NEW.metadata->>'mimetype';
  
  -- Validate based on bucket
  IF NEW.bucket_id = 'moment-images' OR NEW.bucket_id = 'avatars' THEN
    -- Only allow image files
    IF file_ext NOT IN ('jpg', 'jpeg', 'png', 'webp', 'gif') THEN
      RAISE EXCEPTION 'Invalid image file type. Allowed: jpg, jpeg, png, webp, gif';
    END IF;
    
    IF mime_type NOT LIKE 'image/%' THEN
      RAISE EXCEPTION 'Invalid MIME type for image upload';
    END IF;
  ELSIF NEW.bucket_id = 'proof-documents' THEN
    -- Allow images and PDFs for proof documents
    IF file_ext NOT IN ('jpg', 'jpeg', 'png', 'pdf') THEN
      RAISE EXCEPTION 'Invalid document file type. Allowed: jpg, jpeg, png, pdf';
    END IF;
    
    IF mime_type NOT LIKE 'image/%' AND mime_type != 'application/pdf' THEN
      RAISE EXCEPTION 'Invalid MIME type for document upload';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to prevent malicious filenames
CREATE OR REPLACE FUNCTION sanitize_filename()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for path traversal attempts
  IF NEW.name LIKE '%..%' OR NEW.name LIKE '%/%' THEN
    RAISE EXCEPTION 'Invalid filename: path traversal detected';
  END IF;
  
  -- Check for executable extensions
  IF NEW.name ~* '\.(exe|bat|cmd|sh|ps1|dll|so|dylib|app)$' THEN
    RAISE EXCEPTION 'Executable files are not allowed';
  END IF;
  
  -- Limit filename length
  IF length(NEW.name) > 255 THEN
    RAISE EXCEPTION 'Filename too long (max 255 characters)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STORAGE POLICIES (Enhanced Security)
-- ============================================

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only upload to their own folders
CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id IN ('moment-images', 'avatars', 'proof-documents')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can only view their own files and public moment images
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT
  USING (
    bucket_id IN ('moment-images', 'avatars', 'proof-documents')
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR bucket_id = 'moment-images' -- Public moment images
    )
  );

-- Policy: Users can only delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE
  USING (
    bucket_id IN ('moment-images', 'avatars', 'proof-documents')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- TRIGGERS (Commented out - uncomment when storage.objects triggers are supported)
-- ============================================
-- Note: Supabase Storage may not support triggers on storage.objects
-- These are provided for reference and can be applied to custom tables if needed

-- CREATE TRIGGER validate_file_size_trigger
--   BEFORE INSERT ON storage.objects
--   FOR EACH ROW
--   EXECUTE FUNCTION validate_file_size();

-- CREATE TRIGGER validate_file_type_trigger
--   BEFORE INSERT ON storage.objects
--   FOR EACH ROW
--   EXECUTE FUNCTION validate_file_type();

-- CREATE TRIGGER sanitize_filename_trigger
--   BEFORE INSERT ON storage.objects
--   FOR EACH ROW
--   EXECUTE FUNCTION sanitize_filename();

-- ============================================
-- FILE UPLOAD TRACKING TABLE
-- ============================================

-- Create table to track file uploads for monitoring
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bucket_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  upload_status TEXT NOT NULL DEFAULT 'pending',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  
  CONSTRAINT valid_upload_status CHECK (upload_status IN ('pending', 'completed', 'failed', 'rejected'))
);

-- Add indexes for file upload tracking
CREATE INDEX idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX idx_file_uploads_uploaded_at ON file_uploads(uploaded_at DESC);
CREATE INDEX idx_file_uploads_status ON file_uploads(upload_status);
CREATE INDEX idx_file_uploads_user_status ON file_uploads(user_id, upload_status);

-- Enable RLS
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for file_uploads
CREATE POLICY "Users can view own uploads" ON file_uploads
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads" ON file_uploads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FILE UPLOAD LIMITS
-- ============================================

-- Function to check upload limits (max 10 uploads per hour per user)
CREATE OR REPLACE FUNCTION check_upload_rate_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  upload_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO upload_count
  FROM file_uploads
  WHERE user_id = p_user_id
    AND uploaded_at > NOW() - INTERVAL '1 hour';
    
  RETURN upload_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check total storage per user (max 100MB)
CREATE OR REPLACE FUNCTION check_storage_quota(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  total_size BIGINT;
BEGIN
  SELECT COALESCE(SUM(file_size), 0)
  INTO total_size
  FROM file_uploads
  WHERE user_id = p_user_id
    AND upload_status = 'completed';
    
  RETURN total_size < 104857600; -- 100MB
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIRUS SCANNING PLACEHOLDER
-- ============================================

-- Table to track virus scan results
CREATE TABLE IF NOT EXISTS file_scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_upload_id UUID REFERENCES file_uploads(id) ON DELETE CASCADE,
  scan_status TEXT NOT NULL DEFAULT 'pending',
  scan_result TEXT,
  scanned_at TIMESTAMP WITH TIME ZONE,
  scanner_version TEXT,
  
  CONSTRAINT valid_scan_status CHECK (scan_status IN ('pending', 'clean', 'infected', 'error'))
);

CREATE INDEX idx_file_scan_results_upload_id ON file_scan_results(file_upload_id);
CREATE INDEX idx_file_scan_results_status ON file_scan_results(scan_status);

-- Enable RLS
ALTER TABLE file_scan_results ENABLE ROW LEVEL SECURITY;

-- Only admins can view scan results
CREATE POLICY "Only admins can view scan results" ON file_scan_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- CLEANUP FUNCTIONS
-- ============================================

-- Function to clean up old failed uploads (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_failed_uploads()
RETURNS void AS $$
BEGIN
  DELETE FROM file_uploads
  WHERE upload_status = 'failed'
    AND uploaded_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to clean up orphaned upload records
CREATE OR REPLACE FUNCTION cleanup_orphaned_uploads()
RETURNS void AS $$
BEGIN
  DELETE FROM file_uploads fu
  WHERE NOT EXISTS (
    SELECT 1 FROM storage.objects so
    WHERE so.name LIKE '%' || fu.file_name || '%'
      AND so.bucket_id = fu.bucket_id
  )
  AND fu.uploaded_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE file_uploads IS 'Tracks all file upload attempts for monitoring and quota management';
COMMENT ON TABLE file_scan_results IS 'Stores virus scan results for uploaded files';
COMMENT ON FUNCTION validate_file_size() IS 'Validates file size based on bucket type';
COMMENT ON FUNCTION validate_file_type() IS 'Validates file type and MIME type based on bucket';
COMMENT ON FUNCTION sanitize_filename() IS 'Prevents malicious filenames and path traversal';
COMMENT ON FUNCTION check_upload_rate_limit(UUID) IS 'Checks if user has exceeded upload rate limit (10/hour)';
COMMENT ON FUNCTION check_storage_quota(UUID) IS 'Checks if user has exceeded storage quota (100MB)';
