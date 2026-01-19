-- Add Quiet Hours to Users/Profiles table
-- Allows users to mute notifications during specific hours
-- Trying both tables to be safe as codebase uses mixed references

DO $$
BEGIN
    -- Try adding to users table if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        ALTER TABLE public.users 
        ADD COLUMN IF NOT EXISTS quiet_hours_start TIME WITHOUT TIME ZONE,
        ADD COLUMN IF NOT EXISTS quiet_hours_end TIME WITHOUT TIME ZONE;
        
        COMMENT ON COLUMN public.users.quiet_hours_start IS 'Start time for quiet hours';
    END IF;

    -- Try adding to profiles table if it exists (and is a table, not a view)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS quiet_hours_start TIME WITHOUT TIME ZONE,
        ADD COLUMN IF NOT EXISTS quiet_hours_end TIME WITHOUT TIME ZONE;

        COMMENT ON COLUMN public.profiles.quiet_hours_start IS 'Start time for quiet hours';
    END IF;
END $$;
