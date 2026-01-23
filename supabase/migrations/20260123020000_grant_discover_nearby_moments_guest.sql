-- Grant guest/auth access to 5-arg discover_nearby_moments if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'discover_nearby_moments'
      AND oidvectortypes(p.proargtypes) = 'double precision, double precision, integer, integer, integer'
  ) THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.discover_nearby_moments(double precision, double precision, integer, integer, integer) TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.discover_nearby_moments(double precision, double precision, integer, integer, integer) TO authenticated';
  END IF;
END $$;