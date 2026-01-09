-- Remove username column and related infrastructure
-- Username feature is being removed from the platform

-- Drop trigger first
DROP TRIGGER IF EXISTS set_default_username ON users;

-- Drop the function
DROP FUNCTION IF EXISTS generate_default_username();

-- Drop the index
DROP INDEX IF EXISTS idx_users_username;

-- Remove the column
ALTER TABLE users DROP COLUMN IF EXISTS username;

-- Add comment documenting the removal
COMMENT ON TABLE users IS 'User profiles - username column removed 2026-01-09, using full_name only';
