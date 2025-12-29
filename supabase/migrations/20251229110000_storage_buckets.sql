-- ============================================
-- Storage Buckets Configuration for TravelMatch
-- 2025/2026 Image Standards
-- ============================================

-- ============================================
-- 1. AVATARS BUCKET
-- 500x500, max 5MB
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Avatars RLS policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 2. MOMENTS BUCKET
-- 1080x1350 (4:5), max 15MB
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'moments',
  'moments',
  true,
  15728640,  -- 15MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Moments RLS policies
DROP POLICY IF EXISTS "Moment images are publicly accessible" ON storage.objects;
CREATE POLICY "Moment images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'moments');

DROP POLICY IF EXISTS "Users can upload moment images" ON storage.objects;
CREATE POLICY "Users can upload moment images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'moments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update their moment images" ON storage.objects;
CREATE POLICY "Users can update their moment images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'moments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their moment images" ON storage.objects;
CREATE POLICY "Users can delete their moment images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'moments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 3. PROOFS BUCKET (Private)
-- 1920x1440 (4:3), max 20MB - High quality for verification
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proofs',
  'proofs',
  false,  -- Private bucket
  20971520,  -- 20MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Proofs RLS policies (more restrictive)
DROP POLICY IF EXISTS "Users can view their own proofs" ON storage.objects;
CREATE POLICY "Users can view their own proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users involved in escrow can view proofs" ON storage.objects;
CREATE POLICY "Users involved in escrow can view proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'proofs'
  AND EXISTS (
    SELECT 1 FROM escrow_transactions et
    WHERE et.proof_photos @> ARRAY[storage.filename(name)]
    AND (et.sender_id = auth.uid() OR et.receiver_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can upload proofs" ON storage.objects;
CREATE POLICY "Users can upload proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own proofs" ON storage.objects;
CREATE POLICY "Users can delete their own proofs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 4. MESSAGES BUCKET (Private)
-- max 10MB for chat attachments
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'messages',
  'messages',
  false,  -- Private bucket
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Messages RLS policies
DROP POLICY IF EXISTS "Users can view message attachments in their conversations" ON storage.objects;
CREATE POLICY "Users can view message attachments in their conversations"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'messages'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id::text = (storage.foldername(name))[2]
      AND auth.uid() = ANY(c.participants)
    )
  )
);

DROP POLICY IF EXISTS "Users can upload message attachments" ON storage.objects;
CREATE POLICY "Users can upload message attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'messages'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 5. COVERS BUCKET
-- 1500x500 (3:1), max 10MB
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Covers RLS policies
DROP POLICY IF EXISTS "Cover images are publicly accessible" ON storage.objects;
CREATE POLICY "Cover images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Users can upload their own cover" ON storage.objects;
CREATE POLICY "Users can upload their own cover"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update their own cover" ON storage.objects;
CREATE POLICY "Users can update their own cover"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own cover" ON storage.objects;
CREATE POLICY "Users can delete their own cover"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 6. VIDEOS BUCKET
-- max 100MB
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  104857600,  -- 100MB
  ARRAY['video/mp4', 'video/quicktime', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Videos RLS policies
DROP POLICY IF EXISTS "Video files are publicly accessible" ON storage.objects;
CREATE POLICY "Video files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "Users can upload videos" ON storage.objects;
CREATE POLICY "Users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 7. KYC DOCUMENTS BUCKET (Private, Admin access)
-- max 10MB for ID documents
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false,  -- Private bucket
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- KYC Documents RLS policies (very restrictive)
DROP POLICY IF EXISTS "Users can view their own KYC documents" ON storage.objects;
CREATE POLICY "Users can view their own KYC documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can upload their KYC documents" ON storage.objects;
CREATE POLICY "Users can upload their KYC documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin can view all KYC documents (for verification)
DROP POLICY IF EXISTS "Admins can view all KYC documents" ON storage.objects;
CREATE POLICY "Admins can view all KYC documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- ============================================
-- SUMMARY
-- ============================================
-- Bucket          | Public | Max Size | Aspect Ratio
-- ----------------|--------|----------|-------------
-- avatars         | Yes    | 5MB      | 1:1 (500x500)
-- moments         | Yes    | 15MB     | 4:5 (1080x1350)
-- proofs          | No     | 20MB     | 4:3 (1920x1440)
-- messages        | No     | 10MB     | Free
-- covers          | Yes    | 10MB     | 3:1 (1500x500)
-- videos          | Yes    | 100MB    | 9:16, 1:1, 16:9
-- kyc-documents   | No     | 10MB     | Document
