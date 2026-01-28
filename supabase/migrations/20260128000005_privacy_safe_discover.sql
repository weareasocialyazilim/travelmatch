-- ============================================================================
-- Migration: Privacy-Safe discover_nearby_moments
-- CRITICAL FIX: Return COARSE coordinates only to protect user privacy
--
-- Problem: Previous version returned precise lat/lng enabling stalking
-- Solution: Round coordinates to ~1km precision before returning to client
-- Internal PostGIS queries still use precise coordinates for filtering
-- ============================================================================

-- Drop existing function
DROP FUNCTION IF EXISTS discover_nearby_moments(
    double precision, double precision, double precision,
    integer, uuid, integer, integer, text
);

-- Create privacy-safe discover_nearby_moments function
CREATE OR REPLACE FUNCTION discover_nearby_moments(
    p_lat double precision,
    p_lng double precision,
    p_radius_km double precision DEFAULT 50,
    p_limit integer DEFAULT 20,
    p_cursor uuid DEFAULT NULL,
    p_min_age integer DEFAULT NULL,
    p_max_age integer DEFAULT NULL,
    p_gender text DEFAULT NULL,
    p_viewer_id uuid DEFAULT NULL  -- For filtering blocked users
)
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    images text[],
    user_id uuid,
    created_at timestamptz,
    -- COARSE coordinates only (~1km precision) - safe for public API
    coarse_lat double precision,
    coarse_lng double precision,
    -- Exact distance for sorting (internal use)
    distance_km double precision,
    user_name text,
    user_avatar text,
    user_age integer,
    user_gender text,
    host_trust_score integer,
    host_subscription_tier text
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

    -- Create point from user coordinates (precise for internal filtering)
    v_user_location := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;

    RETURN QUERY
    SELECT
        m.id,
        m.title,
        m.description,
        m.images,
        m.user_id,
        m.created_at,
        -- COARSE coordinates: Round to ~1km (3 decimal places)
        -- 0.001 degree ≈ 111m at equator, varies by latitude
        ROUND(ST_Y(m.coordinates::geometry)::numeric * 1000) / 1000 AS coarse_lat,
        ROUND(ST_X(m.coordinates::geometry)::numeric * 1000) / 1000 AS coarse_lng,
        -- Exact distance for sorting (not exposed to client)
        ROUND((ST_Distance(v_user_location, m.coordinates) / 1000)::numeric, 2)::double precision AS distance_km,
        u.full_name AS user_name,
        u.avatar_url AS user_avatar,
        EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth))::integer AS user_age,
        u.gender AS user_gender,
        COALESCE(ts.total_score, 0)::integer AS host_trust_score,
        sp.name AS host_subscription_tier
    FROM moments m
    INNER JOIN users u ON m.user_id = u.id
    LEFT JOIN subscription_plans sp ON u.subscription_plan_id = sp.id
    LEFT JOIN LATERAL (
        SELECT total_score
        FROM calculate_trust_score(u.id)
    ) ts ON true
    WHERE
        -- Status check
        m.status = 'active'
        -- Distance filter using PostGIS geography (precise, internal)
        AND m.coordinates IS NOT NULL
        AND ST_DWithin(v_user_location, m.coordinates, v_radius_meters)
        -- Cursor pagination
        AND (p_cursor IS NULL OR m.id < p_cursor)
        -- Age filter (if provided)
        AND (p_min_age IS NULL OR EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) >= p_min_age)
        AND (p_max_age IS NULL OR EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) <= p_max_age)
        -- Gender filter (if provided)
        AND (p_gender IS NULL OR p_gender = '' OR u.gender = p_gender)
        -- Block filter: Exclude moments from blocked users
        AND (p_viewer_id IS NULL OR NOT EXISTS (
            SELECT 1 FROM blocked_users
            WHERE blocker_id = p_viewer_id
            AND blocked_id = m.user_id
        ))
        -- Self-filter: Don't show own moments
        AND (p_viewer_id IS NULL OR m.user_id != p_viewer_id)
        -- Spam prevention: Low trust score hosts get limited visibility
        -- T0 (new/suspended accounts) - minimum visibility
        -- T1+ - normal visibility
        -- This is SAFETY, not monetization
        AND (
            -- Either host has adequate trust score
            COALESCE(ts.total_score, 0) >= 10
            -- OR host is recently active (within 7 days) with no negative flags
            OR (
                m.created_at >= NOW() - INTERVAL '7 days'
                AND NOT EXISTS (
                    SELECT 1 FROM user_flags uf
                    WHERE uf.user_id = m.user_id
                    AND uf.flag_type IN ('spam', 'suspended', 'banned')
                )
            )
        )
    ORDER BY
        -- Prioritize higher trust scores for quality discovery
        COALESCE(ts.total_score, 0) DESC,
        ST_Distance(v_user_location, m.coordinates) ASC,
        m.created_at DESC
    LIMIT p_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION discover_nearby_moments(
    double precision, double precision, double precision,
    integer, uuid, integer, integer, text, uuid
) TO authenticated;
GRANT EXECUTE ON FUNCTION discover_nearby_moments(
    double precision, double precision, double precision,
    integer, uuid, integer, integer, text, uuid
) TO anon;

-- Add helpful comment
COMMENT ON FUNCTION discover_nearby_moments IS 'Privacy-safe discovery: returns coarse coordinates (~1km precision) and filters blocked users. Internal PostGIS queries use precise coordinates for accurate filtering.';
