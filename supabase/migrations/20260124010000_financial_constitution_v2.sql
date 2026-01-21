-- ============================================
-- FINANCIAL CONSTITUTION (FC2026) UPDATES
-- Description: Trust Score, 1:1 units, and Commission Logic
-- ============================================

-- 1. Ensure users table has Trust and Currency columns (already in types, ensuring in DB)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'TRY';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'unverified';

-- 2. Update Transactions with Escrow Status
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS escrow_status TEXT CHECK (escrow_status IN ('locked', 'released', 'refunded'));

-- 3. Trust Score Update RPC
CREATE OR REPLACE FUNCTION public.update_trust_score(
  p_user_id UUID,
  p_delta INTEGER,
  p_reason TEXT,
  p_content_type TEXT DEFAULT 'profile_bio'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.users
  SET 
    trust_score = GREATEST(0, COALESCE(trust_score, 0) + p_delta),
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log the trust score change in moderation_logs
  -- Using a content hash of p_reason for audit trail
  INSERT INTO public.moderation_logs (
    user_id, 
    content_type, 
    content_hash, 
    severity, 
    action_taken, 
    metadata
  ) VALUES (
    p_user_id,
    p_content_type,
    encode(digest(p_reason, 'sha256'), 'hex'),
    CASE 
      WHEN p_delta < -50 THEN 'high'
      WHEN p_delta < 0 THEN 'medium'
      ELSE 'low'
    END,
    'flagged',
    jsonb_build_object(
      'delta', p_delta,
      'reason', p_reason,
      'source', 'trust_score_system'
    )
  );
END;
$$;

-- 4. Sync Trust Score on verified_at trigger (Optional but good)
-- If the project already has a trigger to sync users/profiles, this is redundant.
-- But since we use 'users' directly for wallet, we update it there.

COMMENT ON FUNCTION update_trust_score IS 'Updates user TrustScore and logs the event in moderation_logs';
