-- ============================================================================
-- TravelMatch Seed Data v2.0
-- 
-- Essential data for application startup.
-- NOT for test data - use supabase/seed.sql for development data.
-- ============================================================================

-- System configuration
INSERT INTO public.system_config (key, value, description)
VALUES 
    ('app_version', '2.0.0', 'Current application version'),
    ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
    ('min_app_version', '1.0.0', 'Minimum supported app version')
ON CONFLICT (key) DO NOTHING;

-- Default categories (if applicable)
-- INSERT INTO public.categories ...

-- Default settings
-- INSERT INTO public.default_settings ...
