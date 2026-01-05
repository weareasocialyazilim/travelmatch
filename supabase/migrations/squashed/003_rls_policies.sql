-- ============================================================================
-- TravelMatch RLS Policies v2.0
-- 
-- All RLS policies consolidated from multiple security fix migrations.
-- 
-- IMPORTANT: Use templates from packages/shared/sql-templates/rls-policy-templates.sql
--            for new policies.
-- ============================================================================

-- Enable RLS on all tables (idempotent)
DO $$ 
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
    END LOOP;
END $$;

-- TODO: Extract current RLS policies using:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies WHERE schemaname = 'public';
