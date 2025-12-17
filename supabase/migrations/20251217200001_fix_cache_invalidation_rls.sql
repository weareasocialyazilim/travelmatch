-- ============================================
-- FIX: cache_invalidation RLS Policy
-- Date: 2025-12-17
-- ============================================
-- Issue: Original policy allowed all authenticated users to read
-- cache invalidation records, exposing cache key patterns.
-- Fix: Restrict to service_role only.
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS cache_invalidation_select_policy ON public.cache_invalidation;

-- Create restrictive policy - only service role can access
CREATE POLICY cache_invalidation_service_role_only ON public.cache_invalidation
  FOR ALL
  USING ((SELECT auth.role()) = 'service_role')
  WITH CHECK ((SELECT auth.role()) = 'service_role');

-- Add comment for documentation
COMMENT ON POLICY cache_invalidation_service_role_only ON public.cache_invalidation IS 
'Only service_role can access cache invalidation records. This prevents users from seeing cache key patterns which could reveal sensitive data structures.';
