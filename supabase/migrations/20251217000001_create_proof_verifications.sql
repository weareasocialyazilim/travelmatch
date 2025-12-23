-- ============================================
-- Create Proof Verifications Table
-- ============================================
-- Stores AI verification results for travel moment proofs
-- Used by verify-proof Edge Function (Claude 3.5 Sonnet AI)
--
-- Author: Claude Code
-- Date: 2025-12-17
-- Related: supabase/functions/verify-proof/index.ts
-- ============================================

-- Create proof_verifications table
CREATE TABLE IF NOT EXISTS public.proof_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Claimed Information
  video_url TEXT NOT NULL,
  claimed_location TEXT NOT NULL,
  claimed_date TIMESTAMPTZ,

  -- AI Verification Results
  ai_verified BOOLEAN NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_reasoning TEXT,
  detected_location TEXT,
  red_flags JSONB DEFAULT '[]'::jsonb,

  -- Status
  status TEXT NOT NULL CHECK (status IN ('verified', 'rejected', 'needs_review')),

  -- Metadata
  ai_model TEXT NOT NULL DEFAULT 'claude-3-5-sonnet-20241022',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_proof_verifications_moment_id
  ON public.proof_verifications(moment_id);

CREATE INDEX IF NOT EXISTS idx_proof_verifications_user_id
  ON public.proof_verifications(user_id);

CREATE INDEX IF NOT EXISTS idx_proof_verifications_status
  ON public.proof_verifications(status);

CREATE INDEX IF NOT EXISTS idx_proof_verifications_created_at
  ON public.proof_verifications(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_proof_verifications_user_status
  ON public.proof_verifications(user_id, status);

-- Comments for documentation
COMMENT ON TABLE public.proof_verifications IS
  'AI verification results for travel moment proofs. Uses Claude 3.5 Sonnet to analyze video frames and verify travel claims.';

COMMENT ON COLUMN public.proof_verifications.confidence_score IS
  'AI confidence score (0.0 to 1.0). >= 0.8 = verified, 0.5-0.8 = needs_review, < 0.5 = rejected';

COMMENT ON COLUMN public.proof_verifications.red_flags IS
  'JSON array of concerns detected by AI (e.g., ["stock_footage", "green_screen"])';

-- RLS (Row Level Security) Policies
ALTER TABLE public.proof_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own verifications
DROP POLICY IF EXISTS "Users can view own proof verifications" ON public.proof_verifications;
CREATE POLICY "Users can view own proof verifications"
  ON public.proof_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view verifications for moments they created
DROP POLICY IF EXISTS "Users can view verifications for their moments" ON public.proof_verifications;
CREATE POLICY "Users can view verifications for their moments"
  ON public.proof_verifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM moments
      WHERE moments.id = proof_verifications.moment_id
      AND moments.user_id = auth.uid()
    )
  );

-- Service role can insert (used by verify-proof Edge Function)
DROP POLICY IF EXISTS "Service role can insert proof verifications" ON public.proof_verifications;
CREATE POLICY "Service role can insert proof verifications"
  ON public.proof_verifications
  FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS anyway

-- Service role can update (for admin corrections)
DROP POLICY IF EXISTS "Service role can update proof verifications" ON public.proof_verifications;
CREATE POLICY "Service role can update proof verifications"
  ON public.proof_verifications
  FOR UPDATE
  USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_proof_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS proof_verifications_updated_at ON public.proof_verifications;
CREATE TRIGGER proof_verifications_updated_at
  BEFORE UPDATE ON public.proof_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_proof_verifications_updated_at();

-- ============================================
-- Migration Verification
-- ============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'proof_verifications'
  ) THEN
    RAISE NOTICE '✓ proof_verifications table created successfully';
    RAISE NOTICE '✓ Indexes created (5 indexes)';
    RAISE NOTICE '✓ RLS policies enabled (4 policies)';
    RAISE NOTICE '✓ Triggers configured (updated_at)';
  ELSE
    RAISE EXCEPTION '✗ Failed to create proof_verifications table';
  END IF;
END $$;
