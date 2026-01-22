-- iDenfy KYC alignment (status normalization + metadata columns)

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS idenfy_status TEXT,
  ADD COLUMN IF NOT EXISTS idenfy_scan_ref TEXT;

UPDATE public.users
SET kyc_status = 'not_started'
WHERE kyc_status IS NULL OR kyc_status IN ('unverified', 'none');

ALTER TABLE public.users
  ALTER COLUMN kyc_status SET DEFAULT 'not_started';

-- Normalize kyc_verifications providers/statuses
UPDATE public.kyc_verifications
SET status = 'in_review'
WHERE status = 'needs_review';

ALTER TABLE public.kyc_verifications
  DROP CONSTRAINT IF EXISTS kyc_verifications_provider_check;

ALTER TABLE public.kyc_verifications
  DROP CONSTRAINT IF EXISTS kyc_verifications_status_check;

ALTER TABLE public.kyc_verifications
  ADD CONSTRAINT kyc_verifications_provider_check
  CHECK (provider IN ('idenfy', 'onfido', 'mock'));

ALTER TABLE public.kyc_verifications
  ADD CONSTRAINT kyc_verifications_status_check
  CHECK (status IN ('pending', 'in_review', 'verified', 'rejected'));
