-- ============================================================================
-- CLEANUP BROKEN FUNCTIONS
-- ============================================================================
-- Date: 2026-01-27
-- Purpose: Remove broken functions that reference non-existent tables/columns
-- Note: PostGIS functions are excluded as they are part of the extension
-- ============================================================================

-- Drop other broken functions that reference non-existent columns/tables
-- (PostGIS functions are kept as they are part of the extension)

DROP FUNCTION IF EXISTS public.check_and_award_badges(uuid);
DROP FUNCTION IF EXISTS public.soft_delete_account(uuid);
DROP FUNCTION IF EXISTS public.update_trust_score(uuid, integer);
DROP FUNCTION IF EXISTS public.convert_to_try_with_buffer(text);
DROP FUNCTION IF EXISTS public.get_escrow_duration_hours(uuid);
DROP FUNCTION IF EXISTS public.get_admin_analytics_charts(date, date);
DROP FUNCTION IF EXISTS public.create_trust_note(uuid, uuid, text);
DROP FUNCTION IF EXISTS tests.create_test_user(text, text, text);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Cleaned up broken functions:';
    RAISE NOTICE '- check_and_award_badges - wrong column reference';
    RAISE NOTICE '- soft_delete_account - wrong column reference';
    RAISE NOTICE '- update_trust_score - missing digest function';
    RAISE NOTICE '- convert_to_try_with_buffer - wrong field reference';
    RAISE NOTICE '- get_escrow_duration_hours - missing trust_scores';
    RAISE NOTICE '- get_admin_analytics_charts - missing table';
    RAISE NOTICE '- create_trust_note - wrong field reference';
    RAISE NOTICE '- tests.create_test_user - missing username column';
    RAISE NOTICE '';
    RAISE NOTICE 'PostGIS functions kept (extension dependency)';
    RAISE NOTICE '============================================';
END $$;
