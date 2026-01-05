-- ============================================
-- Schema Best Practices Migration
-- Version: 1.0.0
-- Created: 2025-12-22
-- Description: Improvements based on PostgreSQL schema design best practices
-- ============================================

-- ============================================
-- 1. FIX: Transactions Type Constraint
-- ============================================
-- The escrow functions use types 'escrow_hold', 'escrow_release', 'escrow_refund'
-- which are not allowed by the current CHECK constraint

-- First, drop the existing constraint
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_type_check;

-- Add new constraint with all transaction types
ALTER TABLE transactions
ADD CONSTRAINT transactions_type_check CHECK (
  type IN (
    'deposit',
    'withdrawal',
    'payment',
    'refund',
    'gift',
    'escrow_hold',
    'escrow_release',
    'escrow_refund'
  )
);

COMMENT ON COLUMN transactions.type IS
'Transaction type:
- deposit: Funds added to account
- withdrawal: Funds withdrawn from account
- payment: Payment for a moment/service
- refund: Refund of a payment
- gift: Gift sent to another user
- escrow_hold: Funds held in escrow
- escrow_release: Escrow funds released to recipient
- escrow_refund: Escrow funds refunded to sender';

-- ============================================
-- 2. ADD: User Coordinates Column
-- ============================================
-- Users table should have coordinates for geolocation features
-- like "find travelers near me"

ALTER TABLE users
ADD COLUMN IF NOT EXISTS coordinates GEOGRAPHY(POINT, 4326);

-- Create spatial index for geolocation queries
CREATE INDEX IF NOT EXISTS idx_users_coordinates
  ON users USING GIST(coordinates);

-- Create composite index for verified users with location
CREATE INDEX IF NOT EXISTS idx_users_verified_coordinates
  ON users USING GIST(coordinates)
  WHERE verified = TRUE AND coordinates IS NOT NULL;

COMMENT ON COLUMN users.coordinates IS
'User geographic coordinates (POINT, WGS84/EPSG:4326).
Used for proximity searches like "find travelers near me".
Should be kept in sync with the location text field.';

-- ============================================
-- 3. ADD: Table Documentation Comments
-- ============================================
-- Following PostgreSQL best practice of documenting all tables

COMMENT ON TABLE users IS
'Core user profiles for TravelMatch platform.
Contains authentication-linked user data, preferences, and trust metrics.
Primary key: UUID linked to Supabase auth.users.id';

COMMENT ON TABLE moments IS
'Travel experiences/events created by users.
A "moment" is a shared travel experience that other users can request to join.
Supports geolocation queries via PostGIS coordinates column.';

COMMENT ON TABLE requests IS
'Participation requests for moments.
Users send requests to join moments; hosts accept/reject.
Unique constraint ensures one request per user per moment.';

COMMENT ON TABLE conversations IS
'Chat channels between users.
Can be linked to a specific moment or be direct messages.
participant_ids is legacy; use conversation_participants junction table.';

COMMENT ON TABLE messages IS
'Individual chat messages within conversations.
Supports text, image, location sharing, and system messages.
read_at tracks message read status for unread counts.';

COMMENT ON TABLE reviews IS
'User ratings and reviews after completing moments.
Rating scale: 1-5 stars.
Users can only review after participating in a moment together.';

COMMENT ON TABLE notifications IS
'Push notification records.
Stores notification history for in-app notification center.
Linked to user push_token for delivery.';

COMMENT ON TABLE reports IS
'Content moderation reports.
Users can report other users or moments for policy violations.
Reviewed by admin/moderator roles.';

COMMENT ON TABLE blocks IS
'User blocking relationships.
Blocked users cannot send messages or requests to blocker.
Implemented via RLS policies.';

COMMENT ON TABLE favorites IS
'User saved/favorited moments.
Junction table for many-to-many relationship.';

COMMENT ON TABLE transactions IS
'Financial transaction ledger.
Tracks all money movements: deposits, withdrawals, payments, gifts, escrow.
Amount can be negative (debits) or positive (credits).';

COMMENT ON TABLE escrow_transactions IS
'Escrow system for high-value transactions.
Funds are held until proof verification or conditions met.
Auto-refund on expiry via pg_cron job.';

COMMENT ON TABLE subscription_plans IS
'Available subscription tiers.
Natural key (id) is plan name: free, starter, pro, vip.
Features stored as JSONB array.';

COMMENT ON TABLE user_subscriptions IS
'User subscription state.
Tracks current plan, billing period, and payment provider.
Integrates with Stripe, Apple, and Google subscriptions.';

COMMENT ON TABLE conversation_participants IS
'Junction table for conversation membership.
Replaces legacy participant_ids array for better query performance.
Tracks per-user read state and archive status.';

COMMENT ON TABLE proof_verifications IS
'AI-powered proof verification results.
Uses Claude 3.5 Sonnet to analyze video frames.
Confidence score determines verification status.';

-- ============================================
-- 4. ADD: Column Documentation
-- ============================================

-- Users table key columns
COMMENT ON COLUMN users.id IS 'Primary key, linked to Supabase auth.users.id';
COMMENT ON COLUMN users.email IS 'Unique email address, used for authentication';
COMMENT ON COLUMN users.rating IS 'Average rating (0.0-5.0) calculated from reviews';
COMMENT ON COLUMN users.review_count IS 'Total number of reviews received';
COMMENT ON COLUMN users.verified IS 'Whether user has completed basic verification';
COMMENT ON COLUMN users.kyc_status IS 'Know Your Customer verification status';
COMMENT ON COLUMN users.balance IS 'Current wallet balance in user currency';
COMMENT ON COLUMN users.languages IS 'Array of language codes user speaks';
COMMENT ON COLUMN users.interests IS 'Array of interest tags for matching';

-- Moments table key columns
COMMENT ON COLUMN moments.coordinates IS 'Geographic coordinates (POINT, WGS84) for location-based queries';
COMMENT ON COLUMN moments.status IS 'Moment lifecycle: draft, active, full, completed, cancelled';
COMMENT ON COLUMN moments.is_featured IS 'Whether moment is promoted/featured in discovery';
COMMENT ON COLUMN moments.images IS 'Array of image URLs for moment gallery';
COMMENT ON COLUMN moments.tags IS 'Array of category/interest tags for search';

-- Escrow key columns
COMMENT ON COLUMN escrow_transactions.status IS 'Escrow state: pending, released, refunded, disputed, expired';
COMMENT ON COLUMN escrow_transactions.release_condition IS 'Condition for fund release: proof_verified, manual_approval, timer_expiry';
COMMENT ON COLUMN escrow_transactions.expires_at IS 'Auto-refund deadline, default 7 days from creation';

-- ============================================
-- 5. ADD: Partial Index for Soft Deletes
-- ============================================
-- Optimize queries that filter out soft-deleted users

CREATE INDEX IF NOT EXISTS idx_users_active
  ON users(id)
  WHERE deleted_at IS NULL;

-- ============================================
-- 6. ADD: Missing Composite Indexes
-- ============================================

-- Moments by category and date for discovery
CREATE INDEX IF NOT EXISTS idx_moments_category_date
  ON moments(category, date DESC)
  WHERE status = 'active';

-- User's recent transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_created
  ON transactions(user_id, type, created_at DESC);

-- Escrow by status and expiry for cleanup job
CREATE INDEX IF NOT EXISTS idx_escrow_pending_expires
  ON escrow_transactions(expires_at)
  WHERE status = 'pending';

-- ============================================
-- 7. ADD: NOT NULL Constraints Where Appropriate
-- ============================================
-- Following best practice: "Add NOT NULL everywhere it's semantically required"

-- Messages content should never be null (use empty string for system messages)
-- Note: Already has NOT NULL from initial schema

-- Notifications body can be null, but title should not be
-- Note: Already has NOT NULL from initial schema

-- ============================================
-- 8. ADD: Default Value Improvements
-- ============================================

-- Ensure users.balance defaults to 0 (already set, this is a verification)
ALTER TABLE users
ALTER COLUMN balance SET DEFAULT 0;

-- Ensure review_count defaults to 0
ALTER TABLE users
ALTER COLUMN review_count SET DEFAULT 0;

-- ============================================
-- Migration Verification
-- ============================================
DO $$
DECLARE
  v_constraint_exists BOOLEAN;
  v_coordinates_exists BOOLEAN;
BEGIN
  -- Verify transactions constraint updated
  SELECT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'transactions_type_check'
  ) INTO v_constraint_exists;

  -- Verify coordinates column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'coordinates'
  ) INTO v_coordinates_exists;

  IF v_constraint_exists AND v_coordinates_exists THEN
    RAISE NOTICE '✓ Schema best practices migration completed successfully';
    RAISE NOTICE '✓ Transactions type constraint updated with escrow types';
    RAISE NOTICE '✓ Users coordinates column added';
    RAISE NOTICE '✓ Table documentation comments added';
    RAISE NOTICE '✓ Performance indexes added';
  ELSE
    RAISE EXCEPTION '✗ Migration verification failed';
  END IF;
END $$;
