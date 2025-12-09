-- Migration: Add video transcriptions and uploaded images tables
-- Created: 2025-12-08
-- Purpose: Support secure server-side video transcription and image uploads

-- ============================================================================
-- Video Transcriptions Table
-- ============================================================================
-- Stores cached transcription results from OpenAI Whisper API
-- Prevents duplicate API calls and reduces costs

CREATE TABLE IF NOT EXISTS public.video_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcription_text TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  duration NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one transcription per video
  CONSTRAINT video_transcriptions_video_id_unique UNIQUE(video_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_video_transcriptions_user_id 
  ON public.video_transcriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_video_transcriptions_video_id 
  ON public.video_transcriptions(video_id);

CREATE INDEX IF NOT EXISTS idx_video_transcriptions_created_at 
  ON public.video_transcriptions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.video_transcriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own transcriptions
DROP POLICY IF EXISTS "Users can read own transcriptions" ON public.video_transcriptions;
CREATE POLICY "Users can read own transcriptions"
  ON public.video_transcriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can insert (Edge Function uses service role)
DROP POLICY IF EXISTS "Service role can insert transcriptions" ON public.video_transcriptions;
CREATE POLICY "Service role can insert transcriptions"
  ON public.video_transcriptions
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Users can update their own transcriptions
DROP POLICY IF EXISTS "Users can update own transcriptions" ON public.video_transcriptions;
CREATE POLICY "Users can update own transcriptions"
  ON public.video_transcriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_video_transcriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS video_transcriptions_updated_at ON public.video_transcriptions;
CREATE TRIGGER video_transcriptions_updated_at
  BEFORE UPDATE ON public.video_transcriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_video_transcriptions_updated_at();

-- ============================================================================
-- Uploaded Images Table
-- ============================================================================
-- Tracks images uploaded via Cloudflare Images CDN
-- Stores metadata and CDN URLs for fast retrieval

CREATE TABLE IF NOT EXISTS public.uploaded_images (
  id TEXT PRIMARY KEY, -- Cloudflare image ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  variants TEXT[] NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL,
  metadata JSONB,
  type TEXT NOT NULL DEFAULT 'general' 
    CHECK (type IN ('avatar', 'moment', 'gift', 'proof', 'general')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_uploaded_images_user_id 
  ON public.uploaded_images(user_id);

CREATE INDEX IF NOT EXISTS idx_uploaded_images_type 
  ON public.uploaded_images(type);

CREATE INDEX IF NOT EXISTS idx_uploaded_images_created_at 
  ON public.uploaded_images(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_uploaded_images_uploaded_at 
  ON public.uploaded_images(uploaded_at DESC);

-- GIN index for JSONB metadata queries
CREATE INDEX IF NOT EXISTS idx_uploaded_images_metadata 
  ON public.uploaded_images USING GIN (metadata);

-- Enable Row Level Security
ALTER TABLE public.uploaded_images ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own uploads
DROP POLICY IF EXISTS "Users can read own uploads" ON public.uploaded_images;
CREATE POLICY "Users can read own uploads"
  ON public.uploaded_images
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can insert (Edge Function uses service role)
DROP POLICY IF EXISTS "Service role can insert uploads" ON public.uploaded_images;
CREATE POLICY "Service role can insert uploads"
  ON public.uploaded_images
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Users can delete their own uploads
DROP POLICY IF EXISTS "Users can delete own uploads" ON public.uploaded_images;
CREATE POLICY "Users can delete own uploads"
  ON public.uploaded_images
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_uploaded_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS uploaded_images_updated_at ON public.uploaded_images;
CREATE TRIGGER uploaded_images_updated_at
  BEFORE UPDATE ON public.uploaded_images
  FOR EACH ROW
  EXECUTE FUNCTION update_uploaded_images_updated_at();

-- ============================================================================
-- Helpful Views (Optional - only if profiles table exists)
-- ============================================================================

-- View: Recent transcriptions with user info
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    EXECUTE '
      CREATE OR REPLACE VIEW public.recent_transcriptions AS
      SELECT 
        vt.id,
        vt.video_id,
        vt.transcription_text,
        vt.language,
        vt.duration,
        vt.created_at,
        p.email,
        p.name
      FROM public.video_transcriptions vt
      LEFT JOIN auth.users u ON vt.user_id = u.id
      LEFT JOIN public.profiles p ON vt.user_id = p.id
      ORDER BY vt.created_at DESC
    ';
  END IF;
END $$;

-- View: Recent uploads with user info
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    EXECUTE '
      CREATE OR REPLACE VIEW public.recent_uploads AS
      SELECT 
        ui.id,
        ui.filename,
        ui.url,
        ui.type,
        ui.uploaded_at,
        ui.created_at,
        p.email,
        p.name
      FROM public.uploaded_images ui
      LEFT JOIN auth.users u ON ui.user_id = u.id
      LEFT JOIN public.profiles p ON ui.user_id = p.id
      ORDER BY ui.created_at DESC
    ';
  END IF;
END $$;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.video_transcriptions IS 
  'Cached video transcription results from OpenAI Whisper API';

COMMENT ON COLUMN public.video_transcriptions.video_id IS 
  'Unique identifier for the video (from video service)';

COMMENT ON COLUMN public.video_transcriptions.duration IS 
  'Video duration in seconds';

COMMENT ON TABLE public.uploaded_images IS 
  'Images uploaded via Cloudflare Images CDN with metadata';

COMMENT ON COLUMN public.uploaded_images.id IS 
  'Cloudflare Images ID (unique identifier from CDN)';

COMMENT ON COLUMN public.uploaded_images.variants IS 
  'Array of CDN URLs for different image sizes/formats';

COMMENT ON COLUMN public.uploaded_images.metadata IS 
  'Additional metadata (purpose, dimensions, etc.)';
