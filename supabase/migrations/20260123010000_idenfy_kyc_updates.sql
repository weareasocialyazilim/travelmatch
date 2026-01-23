-- iDenfy KYC alignment (status normalization + metadata columns)

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS idenfy_status TEXT,
  ADD COLUMN IF NOT EXISTS idenfy_scan_ref TEXT;

UPDATE public.users
SET kyc_status = 'not_started'
WHERE kyc_status IS NULL OR kyc_status IN ('unverified', 'none');

ALTER TABLE public.users
  ALTER COLUMN kyc_status SET DEFAULT 'not_started';

-- Add provider column if not exists
ALTER TABLE public.kyc_verifications
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'idenfy';

-- Normalize kyc_verifications providers/statuses
UPDATE public.kyc_verifications
SET status = 'in_review'
WHERE status = 'needs_review';

ALTER TABLE public.kyc_verifications
  DROP CONSTRAINT IF EXISTS kyc_verifications_provider_check;

ALTER TABLE public.kyc_verifications
  DROP CONSTRAINT IF EXISTS kyc_verifications_status_check;

-- Only add constraints if provider column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'kyc_verifications' 
    AND column_name = 'provider'
  ) THEN
    ALTER TABLE public.kyc_verifications
      ADD CONSTRAINT kyc_verifications_provider_check
      CHECK (provider IN ('idenfy', 'onfido', 'mock'));
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'kyc_verifications' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.kyc_verifications
      ADD CONSTRAINT kyc_verifications_status_check
      CHECK (status IN ('pending', 'in_review', 'verified', 'rejected'));
  END IF;
END $$;
