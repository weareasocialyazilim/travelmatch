-- ============================================
// Invite Code System
// Generates and manages user invite codes
-- ============================================

-- Function to generate a random invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  -- Generate code: LV-XXXXX format
  LOOP
    v_code := 'LV-' || upper(
      substring(md5(random()::text) from 1 for 6)
    );

    -- Check if code already exists
    SELECT EXISTS (
      SELECT 1 FROM user_invite_codes WHERE code = v_code
    ) INTO v_exists;

    IF NOT v_exists THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN v_code;
END;
$$;

-- Function to get or create user's invite code
CREATE OR REPLACE FUNCTION get_or_create_invite_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Check if user already has a code
  SELECT code INTO v_code
  FROM user_invite_codes
  WHERE user_id = p_user_id;

  IF v_code IS NULL THEN
    -- Generate and insert new code
    v_code := generate_invite_code();
    INSERT INTO user_invite_codes (user_id, code)
    VALUES (p_user_id, v_code);
  END IF;

  RETURN v_code;
END;
$$;

-- User invite codes table
CREATE TABLE IF NOT EXISTS user_invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_user_invite_codes_user ON user_invite_codes(user_id);
CREATE INDEX idx_user_invite_codes_code ON user_invite_codes(code);

-- Function to validate and use an invite code
CREATE OR REPLACE FUNCTION use_invite_code(p_code TEXT, p_new_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invite RECORD;
BEGIN
  -- Find the invite code
  SELECT * INTO v_invite
  FROM user_invite_codes
  WHERE code = p_code
  AND is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Record the usage
  INSERT INTO invite_code_usages (invite_code_id, used_by_user_id)
  VALUES (v_invite.id, p_new_user_id);

  -- Update usage count
  UPDATE user_invite_codes
  SET used_count = used_count + 1
  WHERE id = v_invite.id;

  RETURN TRUE;
END;
$$;

-- Table to track invite code usages
CREATE TABLE IF NOT EXISTS invite_code_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code_id UUID NOT NULL REFERENCES user_invite_codes(id) ON DELETE CASCADE,
  used_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(invite_code_id, used_by_user_id)
);

CREATE INDEX idx_invite_code_usages_code ON invite_code_usages(invite_code_id);
CREATE INDEX idx_invite_code_usages_user ON invite_code_usages(used_by_user_id);

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_invite_code TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_invite_code TO authenticated;
GRANT EXECUTE ON FUNCTION use_invite_code TO authenticated;

COMMENT ON TABLE user_invite_codes IS 'Stores invite codes for each user';
COMMENT ON TABLE invite_code_usages IS 'Tracks who used which invite code';
