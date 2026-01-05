-- ============================================
-- TRIGGER: Auto-create user profile on auth.users insert
-- Migration: 20251215000000_auto_profile_creation
-- Description: Automatically creates public.users record when auth.users signup occurs
-- Security: SECURITY DEFINER ensures trigger runs with elevated privileges
-- ============================================

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
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Idempotent (safe to re-run)

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add helpful comments
COMMENT ON FUNCTION public.handle_new_user() IS
  'Auto-creates profile in public.users when user signs up via auth.users. Extracts name and avatar from OAuth metadata if available.';

DO $$
BEGIN
  BEGIN
    EXECUTE 'COMMENT ON TRIGGER on_auth_user_created ON auth.users IS ''Ensures every authenticated user has a corresponding profile in public.users''';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping COMMENT ON TRIGGER on_auth_user_created: %', SQLERRM;
  END;
END $$;

-- ============================================
-- VERIFY TRIGGER
-- ============================================
-- To test manually:
-- 1. INSERT INTO auth.users (id, email) VALUES ('test-id', 'test@example.com');
-- 2. SELECT * FROM public.users WHERE id = 'test-id';
-- Expected: Profile auto-created with email and default name
