-- Remove username column from users table
-- Username feature was removed from UI/UX - no longer needed in database
-- Date: 2026-01-08

-- Drop the trigger first
DROP TRIGGER IF EXISTS set_default_username ON users;

-- Drop the function
DROP FUNCTION IF EXISTS generate_default_username();

-- Drop the index
DROP INDEX IF EXISTS idx_users_username;

-- Drop the column
ALTER TABLE users DROP COLUMN IF EXISTS username;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ Username column and related objects removed successfully';
END $$;
