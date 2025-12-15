-- ============================================
-- TravelMatch Combined Migrations
-- ============================================
-- This file contains ALL migrations combined for manual deployment
-- If using Supabase CLI, use individual migration files instead
--
-- Project: bjikxgtbptrvawkguypv
-- Generated: 2025-12-15
-- Total Migrations: 42
--
-- USAGE:
-- 1. Go to Supabase Dashboard SQL Editor
-- 2. Copy-paste this entire file
-- 3. Run the query
-- 4. Verify all objects created successfully
--
-- Dashboard: https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/editor
-- ============================================

-- NOTE: This is a placeholder file
-- To generate the actual combined SQL, run:
--
-- cat supabase/migrations/*.sql > supabase/migrations/combined-migrations.sql
--
-- Or use the Supabase Dashboard to apply migrations one by one

BEGIN;

-- Informational message
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'TravelMatch Migrations';
  RAISE NOTICE 'Project: bjikxgtbptrvawkguypv';
  RAISE NOTICE 'Total migrations: 42';
  RAISE NOTICE '============================================';
END $$;

-- Migrations will be concatenated here when generated
-- For now, please use one of these methods:
--
-- METHOD 1: Supabase CLI (Recommended)
-- npx supabase db push
--
-- METHOD 2: GitHub Actions
-- Push to main branch (automatic deployment)
--
-- METHOD 3: Manual SQL Editor
-- Copy each migration file from supabase/migrations/
-- and run them in order in the SQL Editor

COMMIT;

-- ============================================
-- Migration Files to Apply (in order):
-- ============================================
-- 01. 20241205000000_initial_schema.sql
-- 02. 20241205000001_add_indexes.sql
-- 03. 20241205000002_enable_rls.sql
-- 04. 20241205000003_create_functions.sql
-- 05. 20241207000000_payment_security.sql
-- 06. 20251206000000_add_subscriptions.sql
-- 07. 20251206000001_strict_security.sql
-- 08. 20251207000000_file_upload_validation.sql
-- 09. 20251208_add_transcriptions_and_uploads_tables.sql
-- 10. 20251209000000_add_kyc_verifications.sql
-- ... (32 more migrations)
--
-- See: supabase/migrations/ directory for all files
