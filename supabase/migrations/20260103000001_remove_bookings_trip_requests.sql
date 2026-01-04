-- Rollback Migration: Remove bookings and trip_requests tables
-- This migration removes the deprecated Trip/Booking system
-- The platform is now focused on Moments & Gifting

-- ============================================================================
-- DROP TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
DROP TRIGGER IF EXISTS update_trip_requests_updated_at ON trip_requests;

-- ============================================================================
-- DROP POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Trip owners can view bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Trip owners can manage bookings" ON bookings;

DROP POLICY IF EXISTS "Users can view own requests" ON trip_requests;
DROP POLICY IF EXISTS "Trip owners can view requests" ON trip_requests;
DROP POLICY IF EXISTS "Users can create requests" ON trip_requests;
DROP POLICY IF EXISTS "Users can update own requests" ON trip_requests;
DROP POLICY IF EXISTS "Trip owners can respond to requests" ON trip_requests;

-- ============================================================================
-- DROP TABLES
-- ============================================================================
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
