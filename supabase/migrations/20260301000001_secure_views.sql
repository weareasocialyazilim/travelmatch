-- Migration: Secure Public Views
-- Description: Creates a safe view for public profile data to replace direct table access.

-- 1. Create Public Profiles View
-- This view exposes only safe fields that are meant to be public
DROP VIEW IF EXISTS public_profiles;
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
    id,
    full_name,
    avatar_url,
    bio,
    location,
    is_verified,
    created_at,
    (
        SELECT count(*) 
        FROM reviews r 
        WHERE r.reviewed_id = users.id
    ) as reviews_count,
    (
        SELECT coalesce(avg(rating), 0) 
        FROM reviews r 
        WHERE r.reviewed_id = users.id
    ) as rating
FROM users
WHERE deleted_at IS NULL;

-- 2. Grant Access to Authenticated and Anon
GRANT SELECT ON public_profiles TO authenticated, anon;

-- Comments for documentation
COMMENT ON VIEW public_profiles IS 'Safe public view of user profiles with PII excluded';
