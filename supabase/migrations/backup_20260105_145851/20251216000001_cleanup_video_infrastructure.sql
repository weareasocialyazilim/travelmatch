-- ============================================
-- CLEANUP: Remove unnecessary video infrastructure
-- ============================================
-- Created: 2025-12-16
-- Purpose: Remove video transcription tables (OpenAI Whisper removed)
-- Reason: Platform is NOT video-focused. Videos are only for:
--   1. Proof verification (AI analysis via Claude)
--   2. Optional thank-you videos in escrow (stored in video-uploads bucket)

-- Drop video_transcriptions table (OpenAI Whisper transcription cache - no longer needed)
DROP TABLE IF EXISTS public.video_transcriptions CASCADE;

-- Drop related functions
DROP FUNCTION IF EXISTS update_video_transcriptions_updated_at() CASCADE;

-- Drop related views (if they exist)
DROP VIEW IF EXISTS public.recent_transcriptions CASCADE;

-- ============================================
-- KEEP: uploaded_images table
-- ============================================
-- This table is NEEDED for:
-- - Moment images
-- - Profile avatars (Cloudflare CDN)
-- - Proof images
-- - Gift images
-- NOT dropping uploaded_images table

-- ============================================
-- KEEP: video-uploads storage bucket
-- ============================================
-- This bucket is NEEDED for:
-- - Proof videos (analyzed by Claude AI)
-- - Thank-you videos in escrow
-- NOT dropping video-uploads bucket

-- ============================================
-- CLEANUP: Remove video processing references
-- ============================================

-- Update uploaded_images type constraint to remove 'video' if it was there
-- (keeping avatar, moment, gift, proof, general)
DO $$
BEGIN
    -- Check if type column has video in constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'uploaded_images' 
        AND column_name = 'type'
    ) THEN
        -- Re-create constraint without video-related types
        ALTER TABLE public.uploaded_images 
        DROP CONSTRAINT IF EXISTS uploaded_images_type_check;
        
        ALTER TABLE public.uploaded_images 
        ADD CONSTRAINT uploaded_images_type_check 
        CHECK (type IN ('avatar', 'moment', 'gift', 'proof', 'general'));
    END IF;
END $$;

-- ============================================
-- DOCUMENTATION
-- ============================================
COMMENT ON TABLE public.uploaded_images IS 
  'Images uploaded via Cloudflare Images CDN. Used for avatars, moments, proofs, and gifts.';

-- Log cleanup
DO $$
BEGIN
    RAISE NOTICE 'Video transcription infrastructure removed. Platform uses videos only for proof verification.';
END $$;
