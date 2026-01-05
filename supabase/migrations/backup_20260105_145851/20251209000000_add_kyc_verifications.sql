-- Migration: Add kyc_verifications table for tracking KYC verification history
-- Description: Stores detailed verification results from providers (Onfido, Stripe Identity)

-- Create kyc_verifications table
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('onfido', 'stripe_identity', 'mock')),
  provider_id TEXT, -- ID from external provider
  status TEXT NOT NULL CHECK (status IN ('verified', 'rejected', 'needs_review')),
  confidence NUMERIC(3, 2) CHECK (confidence >= 0 AND confidence <= 1), -- 0.00 to 1.00
  rejection_reasons TEXT[], -- Array of rejection reasons
  metadata JSONB, -- Additional data from provider
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on user_id for fast lookups
CREATE INDEX idx_kyc_verifications_user_id ON public.kyc_verifications(user_id);

-- Create index on created_at for recent verifications
CREATE INDEX idx_kyc_verifications_created_at ON public.kyc_verifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own verification history
CREATE POLICY "Users can view their own KYC verifications"
  ON public.kyc_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert/update verification records
CREATE POLICY "Service role can manage KYC verifications"
  ON public.kyc_verifications
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.kyc_verifications IS 'Stores KYC verification history from external providers (Onfido, Stripe Identity)';
