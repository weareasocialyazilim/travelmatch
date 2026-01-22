-- =====================================================
-- Fix public SELECT access for moments
-- =====================================================

-- Ensure basic SELECT is allowed for browsing active moments
DROP POLICY IF EXISTS "moments_select_public" ON public.moments;
DROP POLICY IF EXISTS "Anyone can view active moments" ON public.moments;

CREATE POLICY "moments_select_public" ON public.moments
FOR SELECT
USING (
  status = 'active'
  OR user_id = auth.uid()
  OR public.check_is_admin()
);

GRANT SELECT ON public.moments TO authenticated;
GRANT SELECT ON public.moments TO anon;
