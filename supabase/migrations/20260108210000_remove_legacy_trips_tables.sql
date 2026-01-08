-- ============================================================================
-- Migration: Remove Legacy trips and trip_participants Tables
-- ============================================================================
-- 
-- REASON: The platform uses 'moments' table (from initial_schema.sql)
-- The 'trips' and 'trip_participants' tables were created by mistake
-- in add_missing_tables.sql and are not used by the platform.
-- 
-- The momentsService.ts was incorrectly using 'trips' table but this
-- has been fixed to use 'moments' table.
-- ============================================================================

-- ============================================================================
-- 1. DROP POLICIES FIRST (to avoid dependency issues)
-- ============================================================================

-- trips policies
DROP POLICY IF EXISTS "Users can view public trips" ON public.trips;
DROP POLICY IF EXISTS "Users can view own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can create own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can update own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON public.trips;
DROP POLICY IF EXISTS "trips_select" ON public.trips;

-- trip_participants policies
DROP POLICY IF EXISTS "Participants can view own participation" ON public.trip_participants;
DROP POLICY IF EXISTS "Trip owners can view participants" ON public.trip_participants;
DROP POLICY IF EXISTS "Users can join trips" ON public.trip_participants;
DROP POLICY IF EXISTS "Users can leave trips" ON public.trip_participants;
DROP POLICY IF EXISTS "Trip owners can manage participants" ON public.trip_participants;
DROP POLICY IF EXISTS "trip_participants_select" ON public.trip_participants;
DROP POLICY IF EXISTS "trip_participants_insert" ON public.trip_participants;
DROP POLICY IF EXISTS "trip_participants_update" ON public.trip_participants;
DROP POLICY IF EXISTS "trip_participants_delete" ON public.trip_participants;

-- ============================================================================
-- 2. UPDATE DISPUTES TABLE (remove trip_id FK before dropping trips)
-- ============================================================================

-- Remove trip_id column from disputes (if it has any data, set to null first)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'disputes' 
        AND column_name = 'trip_id'
    ) THEN
        -- Drop the foreign key constraint first
        ALTER TABLE public.disputes DROP CONSTRAINT IF EXISTS disputes_trip_id_fkey;
        -- Drop the column
        ALTER TABLE public.disputes DROP COLUMN IF EXISTS trip_id;
    END IF;
END;
$$;

-- ============================================================================
-- 3. DROP INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_trips_user_id;
DROP INDEX IF EXISTS idx_trips_status;
DROP INDEX IF EXISTS idx_trips_destination;
DROP INDEX IF EXISTS idx_trips_start_date;

DROP INDEX IF EXISTS idx_trip_participants_trip_id;
DROP INDEX IF EXISTS idx_trip_participants_user_id;
DROP INDEX IF EXISTS idx_trip_participants_status;

DROP INDEX IF EXISTS idx_disputes_trip_id;

-- ============================================================================
-- 4. DROP TABLES
-- ============================================================================

-- Drop trip_participants first (has FK to trips)
DROP TABLE IF EXISTS public.trip_participants CASCADE;

-- Drop trips table
DROP TABLE IF EXISTS public.trips CASCADE;

-- ============================================================================
-- 5. DROP VIDEOS TABLE (not used in platform)
-- ============================================================================

-- videos policies
DROP POLICY IF EXISTS "Users can view all videos" ON public.videos;
DROP POLICY IF EXISTS "Users can create own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can update own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can delete own videos" ON public.videos;
DROP POLICY IF EXISTS "videos_select" ON public.videos;

-- videos indexes
DROP INDEX IF EXISTS idx_videos_user_id;
DROP INDEX IF EXISTS idx_videos_status;

-- videos trigger
DROP TRIGGER IF EXISTS update_videos_updated_at ON public.videos;

-- Drop videos table
DROP TABLE IF EXISTS public.videos CASCADE;

-- ============================================================================
-- CLEANUP COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Legacy tables removed:';
    RAISE NOTICE '  - trips (use moments table instead)';
    RAISE NOTICE '  - trip_participants (not needed for moments/gifts system)';
    RAISE NOTICE '  - videos (not used in platform)';
    RAISE NOTICE '';
    RAISE NOTICE 'The platform now uses:';
    RAISE NOTICE '  - moments: for hosting experiences';
    RAISE NOTICE '  - gifts: for contributions to moments';
    RAISE NOTICE '  - requests: for moment participation requests';
END;
$$;
