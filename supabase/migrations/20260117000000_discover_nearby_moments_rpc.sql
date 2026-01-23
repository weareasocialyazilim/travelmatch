-- ============================================================================
-- Migration: discover_nearby_moments RPC Function
-- Description: PostGIS-optimized function for discovering nearby moments
-- ============================================================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS discover_nearby_moments(double precision, double precision, double precision, integer, uuid, integer, integer, text);

-- Create the discover_nearby_moments function using PostGIS geography
CREATE OR REPLACE FUNCTION discover_nearby_moments(
    p_lat double precision,
    p_lng double precision,
    p_radius_km double precision DEFAULT 50,
    p_limit integer DEFAULT 20,
    p_cursor uuid DEFAULT NULL,
    p_min_age integer DEFAULT NULL,
    p_max_age integer DEFAULT NULL,
    p_gender text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    images text[],
    user_id uuid,
    created_at timestamptz,
    latitude double precision,
    longitude double precision,
    distance_km double precision,
    user_name text,
    user_avatar text,
    user_age integer,
    user_gender text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_location geography;
    v_radius_meters double precision;
BEGIN
    -- Convert km to meters for PostGIS
    v_radius_meters := p_radius_km * 1000;
    
    -- Create point from user coordinates
    v_user_location := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;
    
    RETURN QUERY
    SELECT 
        m.id,
        m.title,
        m.description,
        m.images,
        m.user_id,
        m.created_at,
        ST_Y(m.coordinates::geometry) as latitude,
        ST_X(m.coordinates::geometry) as longitude,
        ROUND((ST_Distance(v_user_location, m.coordinates) / 1000)::numeric, 2)::double precision as distance_km,
        u.full_name as user_name,
        u.avatar_url as user_avatar,
        EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth))::integer as user_age,
        u.gender as user_gender
    FROM moments m
    INNER JOIN users u ON m.user_id = u.id
    WHERE 
        -- Status check
        m.status = 'active'
        -- Distance filter using PostGIS geography
        AND m.coordinates IS NOT NULL
        AND ST_DWithin(v_user_location, m.coordinates, v_radius_meters)
        -- Cursor pagination
        AND (p_cursor IS NULL OR m.id < p_cursor)
        -- Age filter (if provided)
        AND (p_min_age IS NULL OR EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) >= p_min_age)
        AND (p_max_age IS NULL OR EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) <= p_max_age)
        -- Gender filter (if provided)
        AND (p_gender IS NULL OR p_gender = '' OR u.gender = p_gender)
    ORDER BY 
        ST_Distance(v_user_location, m.coordinates) ASC,
        m.created_at DESC
    LIMIT p_limit;
END;
$$;

-- Grant execute permission to authenticated and anonymous users (for guest browse)
GRANT EXECUTE ON FUNCTION discover_nearby_moments(double precision, double precision, double precision, integer, uuid, integer, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION discover_nearby_moments(double precision, double precision, double precision, integer, uuid, integer, integer, text) TO anon;

-- Add helpful comment (with full signature to avoid ambiguity)
COMMENT ON FUNCTION discover_nearby_moments(double precision, double precision, double precision, integer, uuid, integer, integer, text) IS 'Discovers nearby moments using PostGIS geography for accurate distance calculations. Returns moments within specified radius ordered by distance.';
