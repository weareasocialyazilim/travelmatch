-- Migration: Add missing columns needed by application code

-- Add verified_at to users table (for KYC verification timestamp)
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Add host_id to requests table (to link request to moment owner)
ALTER TABLE requests ADD COLUMN IF NOT EXISTS host_id UUID REFERENCES users(id);

-- Create videos table (for video content)
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER, -- in seconds
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Indexes for videos
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status) WHERE deleted_at IS NULL;

-- Enable RLS on videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Videos policies
CREATE POLICY "Users can view all videos" ON videos
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Users can create own videos" ON videos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos" ON videos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos" ON videos
    FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for videos updated_at
DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update index on users for verified_at
CREATE INDEX IF NOT EXISTS idx_users_verified_at ON users(verified_at) WHERE verified_at IS NOT NULL;
