-- =====================================================
-- LINTER FIXES - December 18, 2024
-- Fixes for Supabase Performance & Security Lints
-- =====================================================

-- =====================================================
-- 1. FIX: Duplicate Index on escrow_transactions (WARN)
-- idx_escrow_pending_expires and idx_escrow_status_expires are identical
-- =====================================================
DROP INDEX IF EXISTS idx_escrow_status_expires;

-- Keeping idx_escrow_pending_expires:
-- CREATE INDEX idx_escrow_pending_expires ON escrow_transactions 
--   USING btree (status, expires_at) WHERE (status = 'pending');

-- =====================================================
-- 2. FIX: SECURITY DEFINER View (ERROR)
-- v_user_conversations was created with SECURITY DEFINER
-- Recreating with SECURITY INVOKER for proper RLS enforcement
-- =====================================================
DROP VIEW IF EXISTS v_user_conversations;

CREATE VIEW v_user_conversations 
WITH (security_invoker = true) AS
SELECT 
  cp.user_id,
  cp.conversation_id,
  c.moment_id,
  c.last_message_id,
  c.updated_at AS conversation_updated_at,
  cp.last_read_at,
  cp.is_archived
FROM conversation_participants cp
JOIN conversations c ON c.id = cp.conversation_id;

-- Grant appropriate permissions
GRANT SELECT ON v_user_conversations TO authenticated;

-- =====================================================
-- NOT ACTIONABLE ITEMS (Documented)
-- =====================================================

-- PostGIS in public schema (WARN):
-- PostGIS extension does not support SET SCHEMA operation
-- This is a known limitation and cannot be changed

-- RLS disabled on spatial_ref_sys (ERROR - FALSE POSITIVE):
-- This table is owned by supabase_admin and is part of PostGIS
-- It's a reference table for coordinate systems, not user data
-- Cannot and should not enable RLS on system tables

-- Unused indexes (INFO):
-- 70+ indexes flagged as unused because:
-- 1. Application is not in production yet
-- 2. No real user traffic to utilize indexes
-- These will be used once application goes live
-- Do NOT remove these indexes

-- Auth DB Connection Strategy (INFO):
-- Current setting: 10 fixed connections
-- Recommendation: Use percentage-based allocation
-- This can be changed in Supabase Dashboard > Settings > Database
-- Only relevant when scaling instance size
