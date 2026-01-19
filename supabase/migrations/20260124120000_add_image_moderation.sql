-- Migration: Add image moderation columns
-- Created: 2026-01-24
-- Purpose: Support automatic content moderation via AWS Rekognition

-- Add moderation columns to uploaded_images
ALTER TABLE public.uploaded_images
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending'
CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'unreviewed')),

ADD COLUMN IF NOT EXISTS moderation_labels JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS moderation_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS moderation_details JSONB DEFAULT '{}'::jsonb;

-- Add index for moderation status
CREATE INDEX IF NOT EXISTS idx_uploaded_images_moderation_status
ON public.uploaded_images(moderation_status);

-- Add index for moderation score (to find high-risk content)
CREATE INDEX IF NOT EXISTS idx_uploaded_images_moderation_score
ON public.uploaded_images(moderation_score DESC);

-- Ensure we have the bucket/storage columns that the function expects (just in case)
ALTER TABLE public.uploaded_images
ADD COLUMN IF NOT EXISTS bucket_id TEXT,
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Comment on columns
COMMENT ON COLUMN public.uploaded_images.moderation_status IS 'Status from AWS Rekognition scan';
COMMENT ON COLUMN public.uploaded_images.moderation_labels IS 'Labels detected by AWS Rekognition (e.g., Explicit Nudity)';
