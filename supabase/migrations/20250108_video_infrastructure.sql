-- Video Content Infrastructure Schema
-- Supports video uploads, captions, transcripts, and analytics

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY, -- Cloudflare Stream UID
  moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- seconds
  status TEXT NOT NULL DEFAULT 'processing', -- processing, ready, failed
  thumbnail_url TEXT,
  playback_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  width INTEGER,
  height INTEGER,
  bitrate INTEGER,
  file_size BIGINT,
  
  -- Accessibility
  has_captions BOOLEAN DEFAULT FALSE,
  has_transcript BOOLEAN DEFAULT FALSE,
  has_audio_description BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT valid_status CHECK (status IN ('processing', 'ready', 'failed'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_videos_moment_id ON videos(moment_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- Video captions/subtitles
CREATE TABLE IF NOT EXISTS video_captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT REFERENCES videos(id) ON DELETE CASCADE,
  language TEXT NOT NULL, -- en, tr, de, etc. (ISO 639-1)
  label TEXT NOT NULL, -- "English", "Turkish", etc.
  url TEXT NOT NULL, -- WebVTT file URL
  is_auto_generated BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(video_id, language)
);

CREATE INDEX IF NOT EXISTS idx_video_captions_video_id ON video_captions(video_id);

-- Video transcripts (plain text)
CREATE TABLE IF NOT EXISTS video_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT REFERENCES videos(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(video_id, language)
);

CREATE INDEX IF NOT EXISTS idx_video_transcripts_video_id ON video_transcripts(video_id);

-- Enable full-text search on transcripts
CREATE INDEX IF NOT EXISTS idx_video_transcripts_content_search 
ON video_transcripts USING gin(to_tsvector('english', content));

-- Video analytics
CREATE TABLE IF NOT EXISTS video_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Viewing metrics
  view_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  view_ended_at TIMESTAMPTZ,
  duration_watched INTEGER, -- seconds
  percentage_watched INTEGER, -- 0-100
  completed BOOLEAN DEFAULT FALSE,
  
  -- Device info
  device_type TEXT, -- mobile, tablet, desktop
  os TEXT,
  browser TEXT,
  
  -- Accessibility usage
  captions_enabled BOOLEAN DEFAULT FALSE,
  transcript_viewed BOOLEAN DEFAULT FALSE,
  playback_speed DECIMAL(3,2) DEFAULT 1.0,
  
  CONSTRAINT valid_percentage CHECK (percentage_watched >= 0 AND percentage_watched <= 100)
);

CREATE INDEX IF NOT EXISTS idx_video_analytics_video_id ON video_analytics(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_user_id ON video_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_started_at ON video_analytics(view_started_at DESC);

-- Aggregated video stats (materialized view for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS video_stats AS
SELECT 
  v.id AS video_id,
  v.moment_id,
  COUNT(DISTINCT va.user_id) AS unique_views,
  COUNT(va.id) AS total_views,
  AVG(va.duration_watched) AS avg_watch_time,
  AVG(va.percentage_watched) AS avg_completion_rate,
  COUNT(CASE WHEN va.completed THEN 1 END) AS completions,
  COUNT(CASE WHEN va.captions_enabled THEN 1 END) AS captions_usage,
  COUNT(CASE WHEN va.transcript_viewed THEN 1 END) AS transcript_usage,
  MAX(va.view_started_at) AS last_viewed_at
FROM videos v
LEFT JOIN video_analytics va ON v.id = va.video_id
GROUP BY v.id, v.moment_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_video_stats_video_id ON video_stats(video_id);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_video_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY video_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh stats periodically
CREATE TRIGGER refresh_video_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON video_analytics
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_video_stats();

-- RLS Policies
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;

-- Videos: Anyone can view, only owner can modify
CREATE POLICY "Videos are viewable by everyone"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own videos"
  ON videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON videos FOR DELETE
  USING (auth.uid() = user_id);

-- Captions: Anyone can view
CREATE POLICY "Captions are viewable by everyone"
  ON video_captions FOR SELECT
  USING (true);

CREATE POLICY "Service can manage captions"
  ON video_captions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Transcripts: Anyone can view
CREATE POLICY "Transcripts are viewable by everyone"
  ON video_transcripts FOR SELECT
  USING (true);

CREATE POLICY "Service can manage transcripts"
  ON video_transcripts FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Analytics: Users can insert their own views
CREATE POLICY "Users can insert their own analytics"
  ON video_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own analytics"
  ON video_analytics FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt()->>'role' = 'service_role');

-- Function: Get video with all accessibility features
CREATE OR REPLACE FUNCTION get_video_with_accessibility(video_id_param TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'video', row_to_json(v.*),
    'captions', (
      SELECT json_agg(row_to_json(c.*))
      FROM video_captions c
      WHERE c.video_id = video_id_param
    ),
    'transcript', (
      SELECT row_to_json(t.*)
      FROM video_transcripts t
      WHERE t.video_id = video_id_param
      LIMIT 1
    ),
    'stats', (
      SELECT row_to_json(s.*)
      FROM video_stats s
      WHERE s.video_id = video_id_param
    )
  ) INTO result
  FROM videos v
  WHERE v.id = video_id_param;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Track video view with accessibility metrics
CREATE OR REPLACE FUNCTION track_video_view(
  video_id_param TEXT,
  user_id_param UUID,
  duration_watched_param INTEGER,
  captions_enabled_param BOOLEAN DEFAULT FALSE,
  transcript_viewed_param BOOLEAN DEFAULT FALSE,
  playback_speed_param DECIMAL DEFAULT 1.0
)
RETURNS UUID AS $$
DECLARE
  video_duration INTEGER;
  percentage INTEGER;
  is_completed BOOLEAN;
  analytics_id UUID;
BEGIN
  -- Get video duration
  SELECT duration INTO video_duration
  FROM videos
  WHERE id = video_id_param;
  
  -- Calculate percentage
  IF video_duration > 0 THEN
    percentage := LEAST(100, (duration_watched_param * 100) / video_duration);
    is_completed := percentage >= 90; -- 90% completion = completed
  ELSE
    percentage := 0;
    is_completed := FALSE;
  END IF;
  
  -- Insert analytics
  INSERT INTO video_analytics (
    video_id,
    user_id,
    duration_watched,
    percentage_watched,
    completed,
    captions_enabled,
    transcript_viewed,
    playback_speed,
    view_ended_at
  ) VALUES (
    video_id_param,
    user_id_param,
    duration_watched_param,
    percentage,
    is_completed,
    captions_enabled_param,
    transcript_viewed_param,
    playback_speed_param,
    NOW()
  )
  RETURNING id INTO analytics_id;
  
  RETURN analytics_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE videos IS 'User-uploaded videos with accessibility features';
COMMENT ON TABLE video_captions IS 'Video captions/subtitles in multiple languages (WebVTT format)';
COMMENT ON TABLE video_transcripts IS 'Full text transcripts for videos (searchable)';
COMMENT ON TABLE video_analytics IS 'Video viewing analytics with accessibility metrics';
COMMENT ON MATERIALIZED VIEW video_stats IS 'Aggregated video statistics for performance';
