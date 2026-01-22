-- =====================================================
-- Fix admin checks, users select policy, and public plan access
-- =====================================================

-- Ensure admin check uses SECURITY DEFINER to avoid permission errors
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
    AND is_active = true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin TO anon;

-- Update policies that referenced admin_users directly
DROP POLICY IF EXISTS "Admins can full access user_safety" ON public.user_safety;
CREATE POLICY "Admins can full access user_safety" ON public.user_safety
FOR ALL
USING (public.check_is_admin());

DROP POLICY IF EXISTS "Messages visibility" ON public.messages;
CREATE POLICY "Messages visibility" ON public.messages
FOR SELECT
USING (
  auth.uid() = sender_id
  OR (auth.uid() = receiver_id AND visibility = 'public')
  OR public.check_is_admin()
);

-- Simplify users SELECT policy to avoid recursion
DROP POLICY IF EXISTS "Users can view connected profiles" ON public.users;
DROP POLICY IF EXISTS "users_select_all" ON public.users;
DROP POLICY IF EXISTS "users_select_public" ON public.users;

CREATE POLICY "users_select_public" ON public.users
FOR SELECT
USING (id = auth.uid() OR deleted_at IS NULL);

-- Ensure public access to subscription plans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Plans are viewable by everyone'
      AND tablename = 'subscription_plans'
  ) THEN
    CREATE POLICY "Plans are viewable by everyone" ON public.subscription_plans
    FOR SELECT
    USING (true);
  END IF;
END $$;

GRANT SELECT ON public.subscription_plans TO authenticated;
GRANT SELECT ON public.subscription_plans TO anon;