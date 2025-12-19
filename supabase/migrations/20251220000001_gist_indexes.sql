-- ============================================
-- GIST INDEXES FOR GEOSPATIAL QUERIES
-- Date: 2025-12-20
-- Forensic Audit Fix: D2-003
-- ============================================
-- PostGIS GIST indexes are essential for performant
-- spatial queries (ST_DWithin, ST_Distance, etc.)
-- ============================================

-- Check if PostGIS extension is enabled
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
    RAISE NOTICE 'PostGIS extension not found. Attempting to enable...';
    CREATE EXTENSION IF NOT EXISTS postgis;
  END IF;
END $$;

-- ============================================
-- MOMENTS TABLE - GIST INDEX FOR COORDINATES
-- Used by: search_moments_nearby(), discover feed
-- ============================================

-- Create GIST index on moments.coordinates for spatial queries
-- This dramatically improves ST_DWithin and ST_Distance performance
CREATE INDEX IF NOT EXISTS idx_moments_coordinates_gist 
ON public.moments USING GIST (coordinates);

-- Composite index for common filter: active moments with coordinates
CREATE INDEX IF NOT EXISTS idx_moments_active_coordinates_gist
ON public.moments USING GIST (coordinates)
WHERE status = 'active' AND coordinates IS NOT NULL;

-- ============================================
-- USERS TABLE - GIST INDEX (if location exists)
-- Used by: nearby users, matching algorithms
-- ============================================

-- Check if users table has a coordinates/location column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'coordinates'
    AND table_schema = 'public'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_users_coordinates_gist 
    ON public.users USING GIST (coordinates);
    RAISE NOTICE 'Created GIST index on users.coordinates';
  ELSE
    RAISE NOTICE 'users.coordinates column not found - skipping GIST index';
  END IF;
END $$;

-- ============================================
-- PROOF VERIFICATIONS - GIST INDEX
-- Used by: location-based proof validation
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'proof_verifications' 
    AND column_name = 'location_point'
    AND table_schema = 'public'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_proof_verifications_location_gist 
    ON public.proof_verifications USING GIST (location_point);
    RAISE NOTICE 'Created GIST index on proof_verifications.location_point';
  END IF;
END $$;

-- ============================================
-- ADDITIONAL PERFORMANCE INDEXES
-- Based on common query patterns
-- ============================================

-- Active moments sorted by date (for feed pagination)
CREATE INDEX IF NOT EXISTS idx_moments_active_date 
ON public.moments(date DESC) 
WHERE status = 'active';

-- Requests by user with status (for inbox)
CREATE INDEX IF NOT EXISTS idx_requests_user_status_date 
ON public.requests(user_id, status, created_at DESC);

-- Conversations by participant (for chat list)
CREATE INDEX IF NOT EXISTS idx_conversations_updated 
ON public.conversations(updated_at DESC)
WHERE archived_at IS NULL;

-- ============================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================

ANALYZE public.moments;
ANALYZE public.users;
ANALYZE public.requests;
ANALYZE public.conversations;

-- ============================================
-- COMMENT FOR DOCUMENTATION
-- ============================================

COMMENT ON INDEX idx_moments_coordinates_gist IS 
'GIST spatial index for PostGIS queries on moments.coordinates. 
Improves ST_DWithin and ST_Distance by 10-100x for location-based searches.';

COMMENT ON INDEX idx_moments_active_coordinates_gist IS
'Partial GIST index for active moments with coordinates.
Optimized for the discover feed which filters by status=active.';
