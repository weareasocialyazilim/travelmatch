-- Migration: Remove stripe_customer_id from users table
-- Date: 2025-01-24
-- Description: Lovendo uses PayTR for payments, not Stripe. 
--              This removes the legacy stripe_customer_id column.

-- =============================================================================
-- REMOVE STRIPE COLUMN FROM USERS TABLE
-- =============================================================================

-- Step 1: Check if column exists and remove it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE public.users DROP COLUMN stripe_customer_id;
    RAISE NOTICE 'Removed stripe_customer_id column from users table';
  ELSE
    RAISE NOTICE 'stripe_customer_id column does not exist, skipping';
  END IF;
END $$;

-- =============================================================================
-- ADD PAYTR COLUMNS IF NEEDED (OPTIONAL - FOR FUTURE USE)
-- =============================================================================

-- Uncomment if you need PayTR customer tracking:
-- ALTER TABLE public.users 
-- ADD COLUMN IF NOT EXISTS paytr_customer_id TEXT;

-- COMMENT ON COLUMN public.users.paytr_customer_id IS 'PayTR customer identifier for recurring payments';
