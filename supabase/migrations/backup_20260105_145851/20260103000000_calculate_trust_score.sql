-- Migration: Trust Score Calculation Function
-- Created: 2026-01-03
-- 
-- Purpose: Single source of truth for trust score calculation
--          Trust score should NEVER be calculated client-side
--
-- Scoring Logic (100 points max):
--   - PayTR successful payments: up to 30 points
--   - Verified proofs: up to 30 points
--   - Trust Notes received: up to 15 points
--   - Identity verification (KYC): up to 15 points
--   - Social connections: up to 10 points
--
-- Risk Level: MEDIUM (business logic, no direct data modification)

-- ============================================
-- TRUST SCORE CALCULATION FUNCTION
-- ============================================

DROP FUNCTION IF EXISTS calculate_trust_score(UUID);

CREATE OR REPLACE FUNCTION calculate_trust_score(p_user_id UUID)
RETURNS TABLE (
  total_score INTEGER,
  payment_score INTEGER,
  proof_score INTEGER,
  trust_notes_score INTEGER,
  kyc_score INTEGER,
  social_score INTEGER,
  level TEXT,
  level_progress DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_payment_score INTEGER := 0;
  v_proof_score INTEGER := 0;
  v_trust_notes_score INTEGER := 0;
  v_kyc_score INTEGER := 0;
  v_social_score INTEGER := 0;
  v_total_score INTEGER := 0;
  v_level TEXT := 'Sprout';
  v_level_progress DECIMAL := 0;
  
  -- User data
  v_kyc_status TEXT;
  v_instagram TEXT;
  v_twitter TEXT;
  v_website TEXT;
  
  -- Counts
  v_successful_payments INTEGER := 0;
  v_verified_proofs INTEGER := 0;
  v_trust_notes_count INTEGER := 0;
BEGIN
  -- Get user verification data
  SELECT 
    kyc,
    instagram,
    twitter,
    website
  INTO 
    v_kyc_status,
    v_instagram,
    v_twitter,
    v_website
  FROM public.users
  WHERE id = p_user_id;
  
  -- Count successful PayTR payments (escrow released or direct transfer)
  SELECT COUNT(*)
  INTO v_successful_payments
  FROM public.transactions t
  WHERE t.sender_id = p_user_id
    AND t.status = 'completed'
    AND t.type IN ('gift', 'payment', 'escrow_release');
  
  -- Count verified proofs
  SELECT COUNT(*)
  INTO v_verified_proofs
  FROM public.proof_verifications pv
  WHERE pv.user_id = p_user_id
    AND pv.status = 'verified';
  
  -- Count approved trust notes received
  SELECT COUNT(*)
  INTO v_trust_notes_count
  FROM public.trust_notes tn
  WHERE tn.recipient_id = p_user_id
    AND tn.is_approved = true;
  
  -- Calculate Payment Score (max 30 points)
  -- 1 point per successful payment, max 30
  v_payment_score := LEAST(v_successful_payments, 30);
  
  -- Calculate Proof Score (max 30 points)
  -- 5 points per verified proof, max 30
  v_proof_score := LEAST(v_verified_proofs * 5, 30);
  
  -- Calculate Trust Notes Score (max 15 points)
  -- 3 points per approved trust note, max 15
  v_trust_notes_score := LEAST(v_trust_notes_count * 3, 15);
  
  -- Calculate KYC Score (max 15 points)
  CASE v_kyc_status
    WHEN 'Verified' THEN v_kyc_score := 15;
    WHEN 'Pending' THEN v_kyc_score := 5;
    ELSE v_kyc_score := 0;
  END CASE;
  
  -- Calculate Social Score (max 10 points)
  -- 3 points for Instagram, 3 for Twitter, 4 for website
  IF v_instagram IS NOT NULL AND v_instagram != '' THEN
    v_social_score := v_social_score + 3;
  END IF;
  IF v_twitter IS NOT NULL AND v_twitter != '' THEN
    v_social_score := v_social_score + 3;
  END IF;
  IF v_website IS NOT NULL AND v_website != '' THEN
    v_social_score := v_social_score + 4;
  END IF;
  
  -- Calculate Total Score
  v_total_score := v_payment_score + v_proof_score + v_trust_notes_score + v_kyc_score + v_social_score;
  
  -- Determine Trust Level
  IF v_total_score >= 91 THEN
    v_level := 'Blooming';
    v_level_progress := ((v_total_score - 91)::DECIMAL / 9) * 100;
  ELSIF v_total_score >= 71 THEN
    v_level := 'Growing';
    v_level_progress := ((v_total_score - 71)::DECIMAL / 20) * 100;
  ELSIF v_total_score >= 41 THEN
    v_level := 'Developing';
    v_level_progress := ((v_total_score - 41)::DECIMAL / 30) * 100;
  ELSE
    v_level := 'Sprout';
    v_level_progress := (v_total_score::DECIMAL / 40) * 100;
  END IF;
  
  -- Update user's trust_score column
  UPDATE public.users
  SET trust_score = v_total_score
  WHERE id = p_user_id;
  
  -- Return results
  RETURN QUERY SELECT 
    v_total_score,
    v_payment_score,
    v_proof_score,
    v_trust_notes_score,
    v_kyc_score,
    v_social_score,
    v_level,
    LEAST(v_level_progress, 100);
END;
$$;

COMMENT ON FUNCTION calculate_trust_score(UUID) IS 
'Calculates user trust score based on PayTR payments, verified proofs, 
trust notes, KYC status, and social connections. 
Single source of truth - never calculate client-side.
Returns detailed breakdown and trust level (Sprout/Developing/Growing/Blooming).';

-- ============================================
-- GET DETAILED TRUST STATS FUNCTION
-- ============================================

DROP FUNCTION IF EXISTS get_detailed_trust_stats(UUID);

CREATE OR REPLACE FUNCTION get_detailed_trust_stats(p_user_id UUID)
RETURNS TABLE (
  -- Overall
  total_score INTEGER,
  trust_level TEXT,
  level_progress DECIMAL,
  
  -- Breakdown
  payment_score INTEGER,
  payment_max INTEGER,
  proof_score INTEGER,
  proof_max INTEGER,
  trust_notes_score INTEGER,
  trust_notes_max INTEGER,
  kyc_score INTEGER,
  kyc_max INTEGER,
  social_score INTEGER,
  social_max INTEGER,
  
  -- Raw counts
  successful_payments INTEGER,
  verified_proofs INTEGER,
  trust_notes_received INTEGER,
  
  -- Status flags
  has_instagram BOOLEAN,
  has_twitter BOOLEAN,
  has_website BOOLEAN,
  kyc_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_score_record RECORD;
  v_user_record RECORD;
  v_successful_payments INTEGER := 0;
  v_verified_proofs INTEGER := 0;
  v_trust_notes_count INTEGER := 0;
BEGIN
  -- Get calculated scores
  SELECT * INTO v_score_record
  FROM calculate_trust_score(p_user_id);
  
  -- Get user data
  SELECT 
    kyc,
    instagram,
    twitter,
    website
  INTO v_user_record
  FROM public.users
  WHERE id = p_user_id;
  
  -- Get raw counts
  SELECT COUNT(*) INTO v_successful_payments
  FROM public.transactions t
  WHERE t.sender_id = p_user_id
    AND t.status = 'completed'
    AND t.type IN ('gift', 'payment', 'escrow_release');
    
  SELECT COUNT(*) INTO v_verified_proofs
  FROM public.proof_verifications pv
  WHERE pv.user_id = p_user_id
    AND pv.status = 'verified';
    
  SELECT COUNT(*) INTO v_trust_notes_count
  FROM public.trust_notes tn
  WHERE tn.recipient_id = p_user_id
    AND tn.is_approved = true;
  
  -- Return detailed stats
  RETURN QUERY SELECT 
    v_score_record.total_score,
    v_score_record.level,
    v_score_record.level_progress,
    v_score_record.payment_score,
    30 AS payment_max,
    v_score_record.proof_score,
    30 AS proof_max,
    v_score_record.trust_notes_score,
    15 AS trust_notes_max,
    v_score_record.kyc_score,
    15 AS kyc_max,
    v_score_record.social_score,
    10 AS social_max,
    v_successful_payments,
    v_verified_proofs,
    v_trust_notes_count,
    (v_user_record.instagram IS NOT NULL AND v_user_record.instagram != '') AS has_instagram,
    (v_user_record.twitter IS NOT NULL AND v_user_record.twitter != '') AS has_twitter,
    (v_user_record.website IS NOT NULL AND v_user_record.website != '') AS has_website,
    v_user_record.kyc;
END;
$$;

COMMENT ON FUNCTION get_detailed_trust_stats(UUID) IS 
'Returns detailed trust statistics for a user including score breakdown,
raw counts, and status flags. Frontend should call this instead of 
calculating trust score client-side.';

-- ============================================
-- RLS POLICY FOR TRUST NOTES
-- Ensure proofs must exist before escrow release
-- ============================================

-- Add RLS check that proof must be verified before escrow can release
CREATE OR REPLACE FUNCTION check_proof_before_escrow_release()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_moment_id UUID;
  v_has_verified_proof BOOLEAN := false;
BEGIN
  -- Only check on status change to 'released'
  IF NEW.status = 'released' AND OLD.status = 'pending' THEN
    v_moment_id := NEW.moment_id;
    
    -- Check if there's a verified proof for this moment
    SELECT EXISTS (
      SELECT 1 
      FROM public.proof_verifications 
      WHERE moment_id = v_moment_id 
        AND status = 'verified'
    ) INTO v_has_verified_proof;
    
    IF NOT v_has_verified_proof THEN
      RAISE EXCEPTION 'Cannot release escrow: No verified proof exists for this moment';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'enforce_proof_before_escrow_release'
  ) THEN
    CREATE TRIGGER enforce_proof_before_escrow_release
      BEFORE UPDATE ON public.escrow_transactions
      FOR EACH ROW
      EXECUTE FUNCTION check_proof_before_escrow_release();
  END IF;
END;
$$;

COMMENT ON FUNCTION check_proof_before_escrow_release() IS 
'Trigger function that prevents escrow release without a verified proof.
Part of the security-at-DB-level strategy.';
