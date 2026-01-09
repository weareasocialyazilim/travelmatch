-- App Configuration Table
-- Stores maintenance mode and version requirements per platform

CREATE TABLE IF NOT EXISTS app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  is_maintenance BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT,
  min_version TEXT NOT NULL DEFAULT '1.0.0',
  update_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform)
);

-- Insert default configs for each platform
INSERT INTO app_config (platform, min_version, is_maintenance, maintenance_message) 
VALUES 
  ('ios', '1.0.0', false, NULL),
  ('android', '1.0.0', false, NULL),
  ('web', '1.0.0', false, NULL)
ON CONFLICT (platform) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read app config (public access)
CREATE POLICY "Allow public read on app_config"
  ON app_config FOR SELECT
  USING (true);

-- Policy: Only authenticated admins can update config
CREATE POLICY "Only admins can update app_config"
  ON app_config FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_app_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
CREATE TRIGGER app_config_updated_at
  BEFORE UPDATE ON app_config
  FOR EACH ROW
  EXECUTE FUNCTION update_app_config_timestamp();

-- Add comment
COMMENT ON TABLE app_config IS 'Platform-specific app configuration for maintenance mode and version requirements';
