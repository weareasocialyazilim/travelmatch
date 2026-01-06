-- Rollback Migration: Remove bookings and trip_requests tables
-- This migration removes the deprecated Trip/Booking system
-- The platform is now focused on Moments & Gifting

-- ============================================================================
-- NOTE: bookings and trip_requests tables were already removed in earlier migrations
-- This migration is now a no-op to maintain migration history
-- ============================================================================

-- Tables already removed - these DROP statements are safe no-ops
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS trip_requests CASCADE;

-- ============================================================================
-- DROP TRIPS TABLE IF EXISTS (Legacy)
-- ============================================================================
-- Note: Only drop if trips table is not being used elsewhere
-- Check for foreign key dependencies first
-- DROP TABLE IF EXISTS trips CASCADE;

-- ============================================================================
-- CLEANUP COMPLETED
-- Platform now uses: moments, gifts, gift_requests, escrow_transactions
-- ============================================================================
