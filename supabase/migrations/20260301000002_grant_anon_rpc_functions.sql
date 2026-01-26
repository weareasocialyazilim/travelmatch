-- ============================================================================
-- Migration: Grant anon role access to public RPC functions
-- Description: Enable guest browse by granting execute on discover and search functions
-- Created: 2026-01-26
-- ============================================================================

-- Enable anon role execute on discover_nearby_moments (8-arg version)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'discover_nearby_moments'
      AND oidvectortypes(p.proargtypes) = 'double precision, double precision, double precision, integer, uuid, integer, integer, text'
  ) THEN
    GRANT EXECUTE ON FUNCTION public.discover_nearby_moments(
      double precision, double precision, double precision, integer, uuid, integer, integer, text
    ) TO anon;
  END IF;
END $$;

-- Enable anon role execute on discover_nearby_moments (5-arg version for mobile)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'discover_nearby_moments'
      AND oidvectortypes(p.proargtypes) = 'double precision, double precision, integer, integer, integer'
  ) THEN
    GRANT EXECUTE ON FUNCTION public.discover_nearby_moments(
      double precision, double precision, integer, integer, integer
    ) TO anon;
  END IF;
END $$;

-- Enable anon role execute on get_active_moments (feed)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'get_active_moments'
  ) THEN
    GRANT EXECUTE ON FUNCTION public.get_active_moments TO anon;
  END IF;
END $$;

-- Enable anon role execute on search_moments (search functionality)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'search_moments'
  ) THEN
    GRANT EXECUTE ON FUNCTION public.search_moments TO anon;
  END IF;
END $$;

-- Enable anon role execute on search_cities (city search)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'search_cities'
  ) THEN
    GRANT EXECUTE ON FUNCTION public.search_cities TO anon;
  END IF;
END $$;

-- Enable anon role execute on get_public_moments (public moments list)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'get_public_moments'
  ) THEN
    GRANT EXECUTE ON FUNCTION public.get_public_moments TO anon;
  END IF;
END $$;

-- Enable anon role execute on get_moment_by_id (single moment view)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'get_moment_by_id'
  ) THEN
    GRANT EXECUTE ON FUNCTION public.get_moment_by_id TO anon;
  END IF;
END $$;
