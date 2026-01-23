-- Harden handle_new_user to avoid signup failures on duplicate email rows
-- Allows auth signup to complete while keeping user profile consistent

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_full_name TEXT;
  v_avatar_url TEXT;
  v_gender TEXT;
  v_dob DATE;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    'New User'
  );

  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  v_gender := CASE
    WHEN NEW.raw_user_meta_data->>'gender' IN ('male', 'female', 'other', 'prefer_not_to_say')
    THEN NEW.raw_user_meta_data->>'gender'
    ELSE NULL
  END;

  v_dob := CASE
    WHEN NEW.raw_user_meta_data->>'date_of_birth' ~ '^\d{4}-\d{2}-\d{2}$'
    THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE
    ELSE NULL
  END;

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
    v_full_name,
    v_avatar_url,
    v_gender,
    v_dob,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(users.full_name, v_full_name),
    avatar_url = COALESCE(users.avatar_url, v_avatar_url),
    gender = COALESCE(users.gender, v_gender),
    date_of_birth = COALESCE(users.date_of_birth, v_dob),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Handle rare case where email already exists with a different id
    UPDATE public.users
    SET
      id = NEW.id,
      full_name = COALESCE(public.users.full_name, v_full_name),
      avatar_url = COALESCE(public.users.avatar_url, v_avatar_url),
      gender = COALESCE(public.users.gender, v_gender),
      date_of_birth = COALESCE(public.users.date_of_birth, v_dob),
      updated_at = NOW()
    WHERE email = NEW.email;

    RETURN NEW;
  WHEN OTHERS THEN
    -- Avoid blocking auth sign-up if profile creation fails
    RAISE WARNING 'handle_new_user failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Auto-creates/updates profile in public.users on auth.users insert. Resilient to duplicate email and metadata issues.';
