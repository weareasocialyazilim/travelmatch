-- Video Infrastructure Schema
-- Supports video upload, transcoding, streaming, and analytics

-- Videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playback_id TEXT NOT NULL UNIQUE, -- Mux playback ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  moment_id UUID REFERENCES public.moments(id) ON DELETE CASCADE,
  
  -- Video metadata
  status TEXT NOT NULL CHECK (status IN ('uploading', 'processing', 'ready', 'error')),
  duration REAL, -- Seconds
  width INTEGER,
  height INTEGER,
  size BIGINT, -- Bytes
  format TEXT,
  
  -- Thumbnails and previews
  thumbnails JSONB DEFAULT '[]'::jsonb,
  preview_gif TEXT,
  
  -- Streaming URLs
  streaming_urls JSONB, -- { hls: string, dash: string }
  
  -- Processing info
  error_message TEXT,
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Video analytics table
CREATE TABLE IF NOT EXISTS public.video_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  
  -- View metrics
  total_views INTEGER NOT NULL DEFAULT 0,
  unique_viewers INTEGER NOT NULL DEFAULT 0,
  total_watch_time REAL NOT NULL DEFAULT 0, -- Seconds
  avg_view_duration REAL, -- Seconds
  completion_rate REAL, -- Percentage (0-100)
  
  -- Engagement metrics
  replays INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  
  -- Quality metrics
  buffering_events INTEGER NOT NULL DEFAULT 0,
  errors INTEGER NOT NULL DEFAULT 0,
  startup_time_avg REAL, -- Milliseconds
  
  -- Calculated at
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Video view events (raw data)
CREATE TABLE IF NOT EXISTS public.video_view_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  
  -- View details
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  watch_time REAL, -- Seconds actually watched
  completed BOOLEAN DEFAULT FALSE,
  
  -- Technical details
  device_type TEXT, -- mobile, tablet, desktop
  browser TEXT,
  os TEXT,
  ip_address INET,
  location_country TEXT,
  location_city TEXT,
  
  -- Quality metrics
  video_quality TEXT, -- 360p, 720p, 1080p
  buffering_count INTEGER DEFAULT 0,
  startup_time INTEGER, -- Milliseconds
  error_code TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs table (SOC 2 compliance)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- User information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  
  -- Event details
  event TEXT NOT NULL,
  category TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('success', 'failure')),
  
  -- Request details
  ip_address INET,
  user_agent TEXT,
  
  -- Additional data
  metadata JSONB,
  
  -- Immutable - prevent updates/deletes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security events table
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Event classification
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  event_type TEXT NOT NULL,
  
  -- Affected resources
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resource_type TEXT,
  resource_id TEXT,
  
  -- Event details
  description TEXT NOT NULL,
  source_ip INET,
  action_taken TEXT,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  assigned_to TEXT,
  resolved_at TIMESTAMPTZ,
  
  -- Additional data
  metadata JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_videos_user_id ON public.videos(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_videos_moment_id ON public.videos(moment_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_videos_status ON public.videos(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_videos_created_at ON public.videos(created_at DESC) WHERE deleted_at IS NULL;

CREATE INDEX idx_video_analytics_video_id ON public.video_analytics(video_id);
CREATE INDEX idx_video_analytics_calculated_at ON public.video_analytics(calculated_at DESC);

CREATE INDEX idx_video_view_events_video_id ON public.video_view_events(video_id);
CREATE INDEX idx_video_view_events_user_id ON public.video_view_events(user_id);
CREATE INDEX idx_video_view_events_started_at ON public.video_view_events(started_at DESC);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_category ON public.audit_logs(category);
CREATE INDEX idx_audit_logs_event ON public.audit_logs(event);

CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_security_events_status ON public.security_events(status);
CREATE INDEX idx_security_events_timestamp ON public.security_events(timestamp DESC);

-- Updated_at trigger for videos
CREATE OR REPLACE FUNCTION update_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION update_videos_updated_at();

-- Aggregate video analytics (runs periodically)
CREATE OR REPLACE FUNCTION aggregate_video_analytics(video_id_param UUID)
RETURNS void AS $$
DECLARE
  analytics_data RECORD;
BEGIN
  SELECT
    COUNT(DISTINCT id) AS total_views,
    COUNT(DISTINCT user_id) AS unique_viewers,
    COALESCE(SUM(watch_time), 0) AS total_watch_time,
    COALESCE(AVG(watch_time), 0) AS avg_view_duration,
    COALESCE(AVG(CASE WHEN completed THEN 100 ELSE 0 END), 0) AS completion_rate,
    COALESCE(SUM(buffering_count), 0) AS buffering_events,
    COUNT(*) FILTER (WHERE error_code IS NOT NULL) AS errors,
    COALESCE(AVG(startup_time), 0) AS startup_time_avg
  INTO analytics_data
  FROM public.video_view_events
  WHERE video_id = video_id_param;

  INSERT INTO public.video_analytics (
    video_id,
    total_views,
    unique_viewers,
    total_watch_time,
    avg_view_duration,
    completion_rate,
    buffering_events,
    errors,
    startup_time_avg,
    calculated_at
  ) VALUES (
    video_id_param,
    analytics_data.total_views,
    analytics_data.unique_viewers,
    analytics_data.total_watch_time,
    analytics_data.avg_view_duration,
    analytics_data.completion_rate,
    analytics_data.buffering_events,
    analytics_data.errors,
    analytics_data.startup_time_avg,
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS)
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_view_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Videos policies
CREATE POLICY "Users can view their own videos"
  ON public.videos FOR SELECT
  USING (auth.uid() = user_id OR deleted_at IS NULL);

CREATE POLICY "Users can insert their own videos"
  ON public.videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own videos"
  ON public.videos FOR DELETE
  USING (auth.uid() = user_id);

-- Video analytics policies (public read)
CREATE POLICY "Anyone can view video analytics"
  ON public.video_analytics FOR SELECT
  USING (true);

-- Service role full access
CREATE POLICY "Service role full access to videos"
  ON public.videos FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to analytics"
  ON public.video_analytics FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to view events"
  ON public.video_view_events FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to audit logs"
  ON public.audit_logs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to security events"
  ON public.security_events FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Admin users can view audit logs
CREATE POLICY "Admin users can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admin users can view security events
CREATE POLICY "Admin users can view security events"
  ON public.security_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Prevent audit log modifications (immutable)
CREATE POLICY "Audit logs are immutable"
  ON public.audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "Audit logs cannot be deleted"
  ON public.audit_logs FOR DELETE
  USING (false);
