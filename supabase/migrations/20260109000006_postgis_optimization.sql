-- PostGIS Performance Optimization
-- Improves geospatial query performance for discover/map features

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Create geography column for accurate distance calculations
-- Geography type accounts for Earth's curvature (critical for long distances)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'moments' AND column_name = 'location_geography'
  ) THEN
    ALTER TABLE moments ADD COLUMN location_geography geography(Point, 4326);
  END IF;
END $$;

-- 2. Create GIST index for fast radius queries
CREATE INDEX IF NOT EXISTS idx_moments_location_geography
  ON moments USING GIST(location_geography);

-- 3. Create composite index for filtered location queries
CREATE INDEX IF NOT EXISTS idx_moments_status_category_location
  ON moments(status, category)
  INCLUDE (id, title, price, created_at)
  WHERE location_geography IS NOT NULL AND status = 'active';

-- 4. Analyze table to update statistics for query planner
ANALYZE moments;

-- 5. Add comments for documentation
COMMENT ON COLUMN moments.location_geography IS 'Geography type for accurate global distance calculations. Must be populated by application on moment creation/update.';
COMMENT ON INDEX idx_moments_location_geography IS 'GIST index for fast spatial queries on location_geography';
