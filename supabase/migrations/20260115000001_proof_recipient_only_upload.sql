-- ============================================
-- ProofService RLS: Recipient-Only Upload
-- Migration: 20260115000001_proof_recipient_only_upload.sql
-- ============================================
--
-- MASTER Requirement: ProofService RLS
-- "gifts tablosunda recipient_id == auth.uid() olan kişi upload edebilir"
--
-- Bu migration, proof upload işlemlerinde sadece hediye alıcısının
-- (recipient_id) upload yapabilmesini sağlar.
-- ============================================

-- ============================================
-- 1. PROOF_SUBMISSIONS TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS public.proof_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Gift reference
  gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,

  -- Who submitted (must be recipient)
  submitter_id UUID NOT NULL REFERENCES users(id),

  -- Proof content
  photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  video_url TEXT,
  description TEXT,

  -- Location verification
  submitted_location GEOGRAPHY(POINT, 4326),
  location_accuracy_meters DECIMAL(10,2),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  rejection_reason TEXT,

  -- Timestamps
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES users(id)
);

-- ============================================
-- 2. ENABLE RLS ON PROOF_SUBMISSIONS
-- ============================================

ALTER TABLE public.proof_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "proof_submissions_recipient_insert" ON public.proof_submissions;
DROP POLICY IF EXISTS "proof_submissions_participant_select" ON public.proof_submissions;
DROP POLICY IF EXISTS "proof_submissions_service_role" ON public.proof_submissions;

-- ============================================
-- 3. RLS POLICY: Only recipient can upload proof
-- ============================================

-- Insert Policy: Only gift recipient can submit proof
CREATE POLICY "proof_submissions_recipient_insert"
  ON public.proof_submissions
  FOR INSERT
  WITH CHECK (
    -- Submitter must be the authenticated user
    submitter_id = auth.uid()
    AND
    -- Submitter must be the gift recipient
    EXISTS (
      SELECT 1 FROM gifts g
      WHERE g.id = proof_submissions.gift_id
      AND g.receiver_id = auth.uid()
      -- Gift must be in a state that allows proof submission
      AND g.status IN ('pending', 'pending_proof', 'proof_requested')
    )
  );

-- Select Policy: Both gift parties can view proof
CREATE POLICY "proof_submissions_participant_select"
  ON public.proof_submissions
  FOR SELECT
  USING (
    -- Submitter can view their own submissions
    submitter_id = auth.uid()
    OR
    -- Gift sender can view proof for their gifts
    EXISTS (
      SELECT 1 FROM gifts g
      WHERE g.id = proof_submissions.gift_id
      AND (g.giver_id = auth.uid() OR g.receiver_id = auth.uid())
    )
  );

-- Update Policy: Only submitter can update their pending submissions
CREATE POLICY "proof_submissions_submitter_update"
  ON public.proof_submissions
  FOR UPDATE
  USING (
    submitter_id = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    submitter_id = auth.uid()
    AND status = 'pending'
  );

-- Service role policy for admin/system operations
CREATE POLICY "proof_submissions_service_role"
  ON public.proof_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. STORAGE BUCKET RLS FOR PROOFS
-- ============================================

-- Create proofs bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proofs',
  'proofs',
  false, -- private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "proof_upload_recipient_only" ON storage.objects;
DROP POLICY IF EXISTS "proof_view_participants" ON storage.objects;

-- Storage Policy: Only gift recipient can upload to proofs bucket
CREATE POLICY "proof_upload_recipient_only"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'proofs'
    AND auth.uid() IS NOT NULL
    -- Path format: proofs/{gift_id}/{user_id}/{filename}
    -- Verify user is the recipient of the gift
    AND EXISTS (
      SELECT 1 FROM gifts g
      WHERE g.id::TEXT = (string_to_array(name, '/'))[1]
      AND g.receiver_id = auth.uid()
    )
  );

-- Storage Policy: Participants can view proof files
CREATE POLICY "proof_view_participants"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'proofs'
    AND EXISTS (
      SELECT 1 FROM gifts g
      WHERE g.id::TEXT = (string_to_array(name, '/'))[1]
      AND (g.giver_id = auth.uid() OR g.receiver_id = auth.uid())
    )
  );

-- ============================================
-- 5. FUNCTION: Validate proof submission
-- ============================================

CREATE OR REPLACE FUNCTION validate_proof_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_gift RECORD;
BEGIN
  -- Get gift details
  SELECT * INTO v_gift
  FROM gifts
  WHERE id = NEW.gift_id;

  -- Verify gift exists
  IF v_gift IS NULL THEN
    RAISE EXCEPTION 'Gift not found: %', NEW.gift_id;
  END IF;

  -- Verify submitter is recipient
  IF v_gift.receiver_id != NEW.submitter_id THEN
    RAISE EXCEPTION 'Only gift recipient can submit proof. Expected: %, Got: %',
      v_gift.receiver_id, NEW.submitter_id;
  END IF;

  -- Verify gift status allows proof
  IF v_gift.status NOT IN ('pending', 'pending_proof', 'proof_requested') THEN
    RAISE EXCEPTION 'Gift status does not allow proof submission. Status: %', v_gift.status;
  END IF;

  -- Verify at least one photo
  IF jsonb_array_length(COALESCE(NEW.photo_urls, '[]'::jsonb)) = 0 THEN
    RAISE EXCEPTION 'At least one proof photo is required';
  END IF;

  -- All checks passed
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS validate_proof_submission_trigger ON proof_submissions;

CREATE TRIGGER validate_proof_submission_trigger
  BEFORE INSERT ON proof_submissions
  FOR EACH ROW
  EXECUTE FUNCTION validate_proof_submission();

-- ============================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_proof_submissions_gift_id
  ON proof_submissions(gift_id);

CREATE INDEX IF NOT EXISTS idx_proof_submissions_submitter
  ON proof_submissions(submitter_id);

CREATE INDEX IF NOT EXISTS idx_proof_submissions_status
  ON proof_submissions(status);

CREATE INDEX IF NOT EXISTS idx_proof_submissions_submitted_at
  ON proof_submissions(submitted_at DESC);

-- ============================================
-- 7. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE public.proof_submissions IS
  'Proof submissions for gifts. RLS ensures only gift recipients can upload proofs.';

COMMENT ON POLICY "proof_submissions_recipient_insert" ON public.proof_submissions IS
  'MASTER Requirement: Only gift recipient (recipient_id == auth.uid()) can upload proof';

COMMENT ON COLUMN public.proof_submissions.submitter_id IS
  'Must equal auth.uid() and must match gifts.receiver_id for the gift_id';

-- ============================================
-- Migration Verification
-- ============================================

DO $$
BEGIN
  -- Verify table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'proof_submissions'
  ) THEN
    RAISE NOTICE '✓ proof_submissions table exists';
  END IF;

  -- Verify RLS is enabled
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'proof_submissions' AND rowsecurity = TRUE
  ) THEN
    RAISE NOTICE '✓ RLS enabled on proof_submissions';
  END IF;

  -- Verify recipient-only policy exists
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'proof_submissions'
    AND policyname = 'proof_submissions_recipient_insert'
  ) THEN
    RAISE NOTICE '✓ proof_submissions_recipient_insert policy created';
    RAISE NOTICE '  → Only gift recipients can upload proofs';
  END IF;

  RAISE NOTICE '✓ ProofService RLS migration complete';
END $$;
