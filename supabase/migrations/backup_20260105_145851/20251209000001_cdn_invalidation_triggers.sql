-- Migration: Add CDN invalidation triggers
-- Description: Automatically invalidate CDN cache when content changes

-- ============================================================================
-- CDN Invalidation Logs Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cdn_invalidation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  item_ids TEXT[] NOT NULL,
  urls TEXT[] NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error TEXT,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cdn_invalidation_logs_created_at ON public.cdn_invalidation_logs(created_at DESC);
CREATE INDEX idx_cdn_invalidation_logs_type ON public.cdn_invalidation_logs(type);

COMMENT ON TABLE public.cdn_invalidation_logs IS 'Logs of CDN cache invalidation requests';

-- ============================================================================
-- Trigger Function: Invalidate CDN on Moment Changes
-- ============================================================================

CREATE OR REPLACE FUNCTION invalidate_cdn_on_moment_change()
RETURNS TRIGGER AS $$
DECLARE
  moment_id TEXT;
BEGIN
  -- Get moment ID
  IF TG_OP = 'DELETE' THEN
    moment_id := OLD.id::text;
  ELSE
    moment_id := NEW.id::text;
  END IF;

  -- Call Edge Function asynchronously using pg_net
  PERFORM
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/cdn-invalidate',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
      ),
      body := jsonb_build_object(
        'type', 'moment',
        'ids', jsonb_build_array(moment_id)
      )
    );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (disabled by default - enable when ready)
DROP TRIGGER IF EXISTS moments_cdn_invalidation ON public.moments;
-- Uncomment to enable:
-- CREATE TRIGGER moments_cdn_invalidation
-- AFTER INSERT OR UPDATE OR DELETE ON public.moments
-- FOR EACH ROW EXECUTE FUNCTION invalidate_cdn_on_moment_change();

-- ============================================================================
-- Trigger Function: Invalidate CDN on User Profile Changes
-- ============================================================================

CREATE OR REPLACE FUNCTION invalidate_cdn_on_user_change()
RETURNS TRIGGER AS $$
DECLARE
  user_id TEXT;
BEGIN
  user_id := NEW.id::text;

  -- Only invalidate if profile images changed
  IF (TG_OP = 'UPDATE' AND (
    OLD.avatar_url IS DISTINCT FROM NEW.avatar_url OR
    OLD.cover_url IS DISTINCT FROM NEW.cover_url
  )) OR TG_OP = 'INSERT' THEN

    PERFORM
      net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/cdn-invalidate',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
        ),
        body := jsonb_build_object(
          'type', 'profile',
          'ids', jsonb_build_array(user_id)
        )
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (disabled by default)
DROP TRIGGER IF EXISTS users_cdn_invalidation ON public.users;
-- Uncomment to enable:
-- CREATE TRIGGER users_cdn_invalidation
-- AFTER INSERT OR UPDATE ON public.users
-- FOR EACH ROW EXECUTE FUNCTION invalidate_cdn_on_user_change();

-- ============================================================================
-- Manual Invalidation Function (for scripts/maintenance)
-- ============================================================================

CREATE OR REPLACE FUNCTION invalidate_cdn_manually(
  p_type TEXT,
  p_ids TEXT[]
) RETURNS void AS $$
BEGIN
  PERFORM
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/cdn-invalidate',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_key')
      ),
      body := jsonb_build_object(
        'type', p_type,
        'ids', to_jsonb(p_ids)
      )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION invalidate_cdn_manually IS 'Manually invalidate CDN cache for specific items';

-- ============================================================================
-- Example Usage
-- ============================================================================

-- Invalidate specific moment
-- SELECT invalidate_cdn_manually('moment', ARRAY['moment-uuid-here']);

-- Invalidate specific user profile
-- SELECT invalidate_cdn_manually('profile', ARRAY['user-uuid-here']);

-- Invalidate multiple moments
-- SELECT invalidate_cdn_manually('moment', ARRAY['uuid1', 'uuid2', 'uuid3']);
