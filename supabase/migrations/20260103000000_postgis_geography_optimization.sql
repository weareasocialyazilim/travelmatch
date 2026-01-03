-- ============================================
-- POSTGIS GEOGRAPHY OPTIMIZATION
-- Date: 2026-01-03
-- Purpose: Optimize spatial queries by removing unnecessary casts
-- RISK: LOW | ROLLBACK: See comments below
-- ============================================
--
-- The moments.coordinates column is already GEOGRAPHY(POINT, 4326) type.
-- However, search_moments_nearby() was performing redundant ::geography casts.
-- This migration optimizes the function to use native geography operations.
--
-- Performance Impact:
-- - Eliminates runtime type casting overhead
-- - Direct GIST index utilization (no cast barrier)
-- - KNN ordering using <-> operator for faster proximity sorting
-- ============================================

-- Ensure PostGIS extension is enabled
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
    CREATE EXTENSION IF NOT EXISTS postgis;
  END IF;
END $$;

-- ============================================
-- OPTIMIZED search_moments_nearby FUNCTION
-- ============================================
-- Removes unnecessary ::geography casts since column is already geography type
-- Uses KNN <-> operator for efficient proximity ordering

CREATE OR REPLACE FUNCTION search_moments_nearby(
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_radius_km DOUBLE PRECISION DEFAULT 50,
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  location TEXT,
  date TIMESTAMP WITH TIME ZONE,
  price DECIMAL,
  distance_km DOUBLE PRECISION
) AS $$
DECLARE
  search_point GEOGRAPHY;
BEGIN
  -- Pre-compute search point once (avoids repeated function calls)
  search_point := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography;
  
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.category,
    m.location,
    m.date,
    m.price,
    -- Direct geography distance (no cast needed - column is geography)
    ST_Distance(m.coordinates, search_point) / 1000.0 AS distance_km
  FROM moments m
  WHERE 
    m.status = 'active'
    AND m.date > NOW()
    AND m.coordinates IS NOT NULL
    AND (p_category IS NULL OR m.category = p_category)
    -- ST_DWithin on native geography type (meters)
    AND ST_DWithin(m.coordinates, search_point, p_radius_km * 1000)
  -- KNN ordering using <-> operator for optimal index usage
  ORDER BY m.coordinates <-> search_point
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = public, pg_temp;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_moments_nearby(
  DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, INTEGER
) TO authenticated;

-- ============================================
-- VERIFY INDEX EXISTS
-- ============================================
-- Ensure GIST index is present for optimal performance

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_moments_coordinates_gist'
  ) THEN
    CREATE INDEX idx_moments_coordinates_gist 
    ON public.moments USING GIST (coordinates);
    RAISE NOTICE 'Created GIST index on moments.coordinates';
  ELSE
    RAISE NOTICE 'GIST index idx_moments_coordinates_gist already exists';
  END IF;
END $$;

-- ============================================
-- ADD COMMENT FOR DOCUMENTATION
-- ============================================

COMMENT ON FUNCTION search_moments_nearby IS 
'Optimized spatial search for nearby moments.
Uses native geography type (no casts) with KNN ordering.
Parameters:
  - p_latitude: Search center latitude (WGS84)
  - p_longitude: Search center longitude (WGS84)  
  - p_radius_km: Search radius in kilometers (default: 50)
  - p_category: Optional category filter
  - p_limit: Maximum results (default: 20)
Returns moments within radius ordered by proximity.
Optimized: 2026-01-03 - Removed redundant geography casts.';
