-- Re-grant guest/auth access to discover_nearby_moments after strict baseline revokes
DO $$
BEGIN
  -- 5-arg signature (local)
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

  -- 8-arg signature (remote)
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'discover_nearby_moments'
      AND oidvectortypes(p.proargtypes) = 'double precision, double precision, double precision, integer, uuid, integer, integer, text'
  ) THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.discover_nearby_moments(double precision, double precision, double precision, integer, uuid, integer, integer, text) TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.discover_nearby_moments(double precision, double precision, double precision, integer, uuid, integer, integer, text) TO authenticated';
  END IF;
END $$;