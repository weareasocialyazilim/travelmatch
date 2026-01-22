-- =====================================================
-- Fix user_safety access for moments visibility policy
-- =====================================================

-- Security definer helper to check user safety without exposing table access
CREATE OR REPLACE FUNCTION public.is_user_safe(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_safety
    WHERE user_id = p_user_id
      AND status IN ('active', 'throttled')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_user_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_safe(UUID) TO anon;

-- Update moments visibility policy to use the helper
DROP POLICY IF EXISTS "Moments visibility" ON public.moments;
CREATE POLICY "Moments visibility"
  ON public.moments
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_user_safe(moments.user_id)
  );
