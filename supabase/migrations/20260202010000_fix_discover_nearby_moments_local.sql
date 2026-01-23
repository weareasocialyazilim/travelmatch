-- Fix 5-arg discover_nearby_moments to use current schema
CREATE OR REPLACE FUNCTION public.discover_nearby_moments(
  lat double precision,
  lng double precision,
  radius_meters integer DEFAULT 5000,
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  thumbnail_url text,
  distance_meters double precision,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_location geography;
BEGIN
  v_user_location := ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;

  RETURN QUERY
  SELECT
    m.id,
    m.user_id,
    m.title,
    NULLIF(m.images[1], '') AS thumbnail_url,
    ST_Distance(v_user_location, m.coordinates) AS distance_meters,
    m.created_at
  FROM public.moments m
  WHERE
    m.status = 'active'
    AND m.coordinates IS NOT NULL
    AND ST_DWithin(v_user_location, m.coordinates, radius_meters)
  ORDER BY distance_meters ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.discover_nearby_moments(double precision, double precision, integer, integer, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.discover_nearby_moments(double precision, double precision, integer, integer, integer) TO authenticated;