-- Migration: Add type column to disputes table

-- Add type column for dispute categorization
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS type VARCHAR(50) CHECK (type IN ('transaction', 'proof', 'trip', 'user', 'other'));

-- Add proof_id reference column  
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS proof_id UUID;

-- Create index for type
CREATE INDEX IF NOT EXISTS idx_disputes_type ON disputes(type);
