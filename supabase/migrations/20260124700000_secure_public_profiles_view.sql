-- Migration: Secure Public Profiles View
-- Description: Create a secure view for public profile data to replace direct access to the users table.
--              This allows restricting the users table RLS in the future.

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  location,
  date_of_birth,
  gender,
  languages,
  interests,
  rating,
  review_count,
  verified,
  kyc_status,
  created_at,
  last_seen_at
FROM public.users;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Comment: Future Step
-- Once the frontend is updated to use 'public_profiles' instead of 'users',
-- run the following to lock down the users table:
-- DROP POLICY "users_select_all" ON public.users;
-- CREATE POLICY "users_select_self" ON public.users FOR SELECT USING (auth.uid() = id);
