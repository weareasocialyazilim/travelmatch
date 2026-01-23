-- Regrant public read access for app_config
-- Required for mobile clients to fetch app config without authentication

GRANT SELECT ON TABLE public.app_config TO anon, authenticated;
