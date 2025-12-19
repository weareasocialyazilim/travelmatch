-- ============================================================================
-- Security Audit Fixes Migration
-- Date: 2025-12-18
-- Purpose: Fix critical issues identified in GOD MODE forensic audit
-- ============================================================================

-- 1. Add sender_id and recipient_id columns to transactions table
-- This fixes the atomic_transfer function schema mismatch
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES public.users(id);

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_transactions_sender_id
  ON public.transactions(sender_id)
  WHERE sender_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_recipient_id
  ON public.transactions(recipient_id)
  WHERE recipient_id IS NOT NULL;

-- Add constraint for transfer types
ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS check_transfer_participants;

ALTER TABLE public.transactions
  ADD CONSTRAINT check_transfer_participants
  CHECK (
    (type IN ('transfer', 'escrow_hold', 'escrow_release', 'gift')
     AND (sender_id IS NOT NULL OR recipient_id IS NOT NULL))
    OR (type NOT IN ('transfer', 'escrow_hold', 'escrow_release', 'gift'))
  );

-- 2. Create table for used 2FA codes (replay attack prevention)
CREATE TABLE IF NOT EXISTS public.used_2fa_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup and cleanup
CREATE INDEX IF NOT EXISTS idx_used_2fa_codes_user_hash
  ON public.used_2fa_codes(user_id, code_hash);

CREATE INDEX IF NOT EXISTS idx_used_2fa_codes_expires
  ON public.used_2fa_codes(expires_at);

-- RLS for used_2fa_codes - only service_role can access
ALTER TABLE public.used_2fa_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only for used_2fa_codes" ON public.used_2fa_codes;
CREATE POLICY "Service role only for used_2fa_codes" ON public.used_2fa_codes
  FOR ALL
  USING ((SELECT auth.role()) = 'service_role')
  WITH CHECK ((SELECT auth.role()) = 'service_role');

-- 3. Create KYC verifications table if not exists
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('onfido', 'stripe_identity', 'manual_review', 'mock')),
  provider_check_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'pending_review', 'verified', 'rejected', 'expired')),
  document_type TEXT,
  document_number_hash TEXT,
  front_image_url TEXT,
  back_image_url TEXT,
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user
  ON public.kyc_verifications(user_id);

CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status
  ON public.kyc_verifications(status)
  WHERE status IN ('pending', 'processing', 'pending_review');

-- Add provider_check_id column if not exists, then create index
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'kyc_verifications' AND column_name = 'provider_check_id') THEN
    ALTER TABLE public.kyc_verifications ADD COLUMN provider_check_id TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_kyc_verifications_provider_check
  ON public.kyc_verifications(provider, provider_check_id);

-- RLS for kyc_verifications
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own KYC status
DROP POLICY IF EXISTS "Users can view own KYC" ON public.kyc_verifications;
CREATE POLICY "Users can view own KYC" ON public.kyc_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service_role can insert/update
DROP POLICY IF EXISTS "Service role can manage KYC" ON public.kyc_verifications;
CREATE POLICY "Service role can manage KYC" ON public.kyc_verifications
  FOR ALL
  USING ((SELECT auth.role()) = 'service_role')
  WITH CHECK ((SELECT auth.role()) = 'service_role');

-- 4. Add balance index for users table (performance optimization)
CREATE INDEX IF NOT EXISTS idx_users_balance_positive
  ON public.users(balance DESC)
  WHERE balance > 0;

-- 5. Webhook idempotency - ensure unique constraint exists
CREATE TABLE IF NOT EXISTS public.processed_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add unique constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_webhook_events_event_id_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_webhook_events_event_id_unique
      ON public.processed_webhook_events(event_id);
  END IF;
END $$;

-- RLS for webhook events
ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only for webhook events" ON public.processed_webhook_events;
CREATE POLICY "Service role only for webhook events" ON public.processed_webhook_events
  FOR ALL
  USING ((SELECT auth.role()) = 'service_role')
  WITH CHECK ((SELECT auth.role()) = 'service_role');

-- 6. Cleanup job for expired 2FA codes (run daily via pg_cron)
-- Note: Requires pg_cron extension to be enabled
DO $cronblock$
BEGIN
  -- Check if pg_cron is available
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Remove any existing job
    PERFORM cron.unschedule('cleanup-expired-2fa-codes');

    -- Schedule daily cleanup at 3 AM
    PERFORM cron.schedule(
      'cleanup-expired-2fa-codes',
      '0 3 * * *',
      'DELETE FROM public.used_2fa_codes WHERE expires_at < NOW()'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- pg_cron not available, skip scheduling
  RAISE NOTICE 'pg_cron not available, skipping 2FA cleanup job scheduling';
END $cronblock$;

-- 7. Update updated_at trigger for kyc_verifications
CREATE OR REPLACE FUNCTION update_kyc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_kyc_verifications_updated_at ON public.kyc_verifications;
CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_kyc_updated_at();

-- ============================================================================
-- Migration complete
-- ============================================================================

COMMENT ON TABLE public.used_2fa_codes IS 'Stores used 2FA codes to prevent replay attacks';
COMMENT ON TABLE public.kyc_verifications IS 'Stores KYC verification records and status';
COMMENT ON TABLE public.processed_webhook_events IS 'Idempotency tracking for webhook processing';
