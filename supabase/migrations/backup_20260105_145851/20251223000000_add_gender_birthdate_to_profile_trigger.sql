-- ============================================
-- MIGRATION: Add gender and date_of_birth to profile auto-creation
-- Migration: 20251223000000_add_gender_birthdate_to_profile_trigger
-- Description: Updates handle_new_user() to extract gender and date_of_birth from auth metadata
-- ============================================

-- Update the handle_new_user function to include gender and date_of_birth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Insert into public.users when new auth.users record created
  INSERT INTO public.users (
    id,
    email,
    full_name,
    avatar_url,
    gender,
    date_of_birth,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      'New User'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    -- Extract gender from metadata (validates against allowed values)
    CASE
      WHEN NEW.raw_user_meta_data->>'gender' IN ('male', 'female', 'other', 'prefer_not_to_say')
      THEN NEW.raw_user_meta_data->>'gender'
      ELSE NULL
    END,
    -- Extract date_of_birth from metadata (expects YYYY-MM-DD format)
    CASE
      WHEN NEW.raw_user_meta_data->>'date_of_birth' ~ '^\d{4}-\d{2}-\d{2}$'
      THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE
      ELSE NULL
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Update gender and date_of_birth if they were provided but not set initially
    gender = COALESCE(
      users.gender,
      CASE
        WHEN NEW.raw_user_meta_data->>'gender' IN ('male', 'female', 'other', 'prefer_not_to_say')
        THEN NEW.raw_user_meta_data->>'gender'
        ELSE NULL
      END
    ),
    date_of_birth = COALESCE(
      users.date_of_birth,
      CASE
        WHEN NEW.raw_user_meta_data->>'date_of_birth' ~ '^\d{4}-\d{2}-\d{2}$'
        THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE
        ELSE NULL
      END
    ),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Update the comment
COMMENT ON FUNCTION public.handle_new_user() IS
  'Auto-creates/updates profile in public.users when user signs up via auth.users. Extracts name, avatar, gender, and date_of_birth from metadata.';

-- ============================================
-- VERIFY
-- ============================================
-- To test:
-- 1. Sign up a new user with gender and date_of_birth in metadata
-- 2. Check: SELECT id, email, gender, date_of_birth FROM public.users WHERE email = 'test@example.com';
