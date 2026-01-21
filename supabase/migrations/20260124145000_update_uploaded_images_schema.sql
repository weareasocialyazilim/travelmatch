-- Migration: Update uploaded_images schema for Rekognition and Admin Panel
-- Created: 2026-01-24 14:00:00
-- Purpose: Add columns required by the handle-storage-upload Edge Function and Admin Panel

-- Add missing columns to uploaded_images
ALTER TABLE public.uploaded_images
  ADD COLUMN IF NOT EXISTS bucket_id TEXT,
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS public_url TEXT,
  ADD COLUMN IF NOT EXISTS image_type TEXT DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS file_size BIGINT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending', -- pending, approved, rejected, pending_review
  ADD COLUMN IF NOT EXISTS moderation_labels JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS moderation_score NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS moderation_details JSONB DEFAULT '{}'::jsonb;

-- Update existing columns if necessary or map them
-- (No data migration needed as the table is likely empty or data is from Cloudflare calls)

-- Create index for moderation status to speed up Admin Panel queries
CREATE INDEX IF NOT EXISTS idx_uploaded_images_moderation_status 
  ON public.uploaded_images(moderation_status);

-- RLS: Allow Admins to read all uploads
-- Assuming we identify admins by the presence of a row in admin_users or via specific email domain/claim.
-- For now, we will add a policy that allows reading if the user is in the admin_users table (by email matching)

DO $$
BEGIN
    DROP POLICY IF EXISTS "Admins can view all uploads" ON public.uploaded_images;
    
    CREATE POLICY "Admins can view all uploads"
      ON public.uploaded_images
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_users au
          WHERE au.email = (SELECT auth.email())
        )
      );
END $$;
