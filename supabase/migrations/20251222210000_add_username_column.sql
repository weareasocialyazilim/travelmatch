-- Add username column to users table
-- This enables unique usernames for user profiles

ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add trigger to generate default username from email if not provided
CREATE OR REPLACE FUNCTION generate_default_username()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NULL THEN
    -- Generate username from email (before @) with random suffix
    NEW.username := LOWER(SPLIT_PART(NEW.email, '@', 1)) || '_' || SUBSTR(MD5(RANDOM()::TEXT), 1, 6);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new users
DROP TRIGGER IF EXISTS set_default_username ON users;
CREATE TRIGGER set_default_username
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION generate_default_username();

-- Update existing users to have usernames
UPDATE users 
SET username = LOWER(SPLIT_PART(email, '@', 1)) || '_' || SUBSTR(MD5(id::TEXT), 1, 6)
WHERE username IS NULL;
