-- Migration: 20260122120000_security_hardening.sql
-- Description: Revoke anon write access, enable RLS heavily, and secure function search paths.

-- 1. REVOKE Write Access from 'anon' (Public Tables)
-- We strictly only allow SELECT for anon, or nothing. 
-- In most Supabase apps, anon might need SELECT for some public data, but never INSERT/UPDATE/DELETE 
-- unless specifically architected (and even then, usually handled via RPC or better policies).
-- Here we revoke all modification rights.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('spatial_ref_sys') -- Exclude PostGIS system table
    ) LOOP
        EXECUTE 'REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.' || quote_ident(r.tablename) || ' FROM anon';
    END LOOP;
END $$;

-- Also update default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLES FROM anon;


-- 2. ENABLE RLS on All Public Tables
-- It is a security best practice to have RLS enabled on all tables, 
-- even if the policy is "ALLOW ALL" (which is explicit).
-- Disabling RLS is dangerous because it bypasses policies completely.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('spatial_ref_sys') -- Exclude PostGIS system table
    ) LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;


-- 3. SECURE 'SECURITY DEFINER' Functions
-- SECURITY DEFINER functions run with the privileges of the creator (usually postgres/superuser in supabase local).
-- If search_path is not set, a malicious user could create a 'public.auth_check' function 
-- that overrides a system function if the search path is loose.
-- We force search_path to 'public, extensions, temp' for all such functions in public schema.
-- EXCLUDING functions belonging to extensions (like PostGIS).

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT n.nspname, p.proname, p.oid
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.prosecdef -- is security definer
        AND n.nspname = 'public' -- scope to public
        AND NOT EXISTS ( -- Exclude extension functions
            SELECT 1 
            FROM pg_depend d 
            WHERE d.objid = p.oid 
            AND d.refclassid = 'pg_extension'::regclass
        )
    ) LOOP
        -- Set search_path to a safe list. 
        -- 'public' for user tables, 'extensions' for extensions, 'temp' is implicit but good to be explicit/last.
        EXECUTE 'ALTER FUNCTION ' || quote_ident(r.nspname) || '.' || quote_ident(r.proname) || '(' || pg_get_function_identity_arguments(r.oid) || ') SET search_path = public, extensions, temp';
    END LOOP;
END $$;
