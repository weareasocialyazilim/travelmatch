-- ============================================================================
-- Migration: Disruptive SEO Configuration
-- Description: Extends app_config with dynamic SEO/AI signals for God-Mode strategy
-- Version: 20260110180000
-- ============================================================================

-- Add new columns for disruptive SEO strategy
ALTER TABLE IF EXISTS public.app_config
ADD COLUMN IF NOT EXISTS dynamic_seo_keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS current_site_vibe TEXT DEFAULT 'speed' CHECK (current_site_vibe IN ('speed', 'romance', 'luxury', 'access')),
ADD COLUMN IF NOT EXISTS ai_bot_semantic_layer JSONB DEFAULT '{
  "entity_type": "Social-Financial-Exchange",
  "interaction_velocity": "Instant",
  "trust_protocol": "Verified-Moments-v7",
  "competitive_edge": "Proof-of-Intent-Gifting"
}'::jsonb,
ADD COLUMN IF NOT EXISTS posthog_intent_metrics JSONB DEFAULT '{
  "speed_clicks": 0,
  "romance_clicks": 0,
  "luxury_clicks": 0,
  "last_vibe_switch": null
}'::jsonb,
ADD COLUMN IF NOT EXISTS trend_injection_log JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_trend_sync TIMESTAMPTZ;

-- Add comments for documentation (only if app_config table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_config') THEN
    COMMENT ON COLUMN public.app_config.dynamic_seo_keywords IS 'Dynamically injected keywords from Reddit/TikTok trend analysis';
    COMMENT ON COLUMN public.app_config.current_site_vibe IS 'Current website language direction: speed (aggressive), romance (passionate), luxury (elite), access (exclusive)';
    COMMENT ON COLUMN public.app_config.ai_bot_semantic_layer IS 'Hidden signals for AI systems (Google SGE, Gemini, GPT) to position Lovendo as authority';
    COMMENT ON COLUMN public.app_config.posthog_intent_metrics IS 'PostHog analytics for Intent Heatmap - tracks which copy resonates';
    COMMENT ON COLUMN public.app_config.trend_injection_log IS 'History of trend keywords injected by ML service';
    COMMENT ON COLUMN public.app_config.last_trend_sync IS 'Last time the trend tracker synced from social platforms';
  END IF;
END $$;

-- Create table for SEO performance tracking
CREATE TABLE IF NOT EXISTS public.seo_performance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metric_type TEXT NOT NULL CHECK (metric_type IN ('keyword_rank', 'ctr', 'impression', 'ai_mention', 'competitor_comparison')),
  keyword TEXT,
  value NUMERIC,
  metadata JSONB DEFAULT '{}',
  source TEXT DEFAULT 'google' CHECK (source IN ('google', 'bing', 'tiktok', 'reddit', 'ai_chatbot'))
);

-- Enable RLS
ALTER TABLE public.seo_performance_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access SEO logs
DROP POLICY IF EXISTS "seo_performance_service_only" ON public.seo_performance_log;
CREATE POLICY "seo_performance_service_only" ON public.seo_performance_log
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_seo_performance_metric_type ON public.seo_performance_log(metric_type);
CREATE INDEX IF NOT EXISTS idx_seo_performance_created_at ON public.seo_performance_log(created_at DESC);

-- Create function to update site vibe based on PostHog metrics
CREATE OR REPLACE FUNCTION public.calculate_current_vibe()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  metrics JSONB;
  speed_clicks INTEGER;
  romance_clicks INTEGER;
  luxury_clicks INTEGER;
  dominant_vibe TEXT;
BEGIN
  -- Get current metrics from app_config
  SELECT posthog_intent_metrics INTO metrics
  FROM public.app_config
  ORDER BY updated_at DESC
  LIMIT 1;

  IF metrics IS NULL THEN
    RETURN 'speed'; -- Default to aggressive
  END IF;

  speed_clicks := COALESCE((metrics->>'speed_clicks')::INTEGER, 0);
  romance_clicks := COALESCE((metrics->>'romance_clicks')::INTEGER, 0);
  luxury_clicks := COALESCE((metrics->>'luxury_clicks')::INTEGER, 0);

  -- Determine dominant vibe
  IF speed_clicks >= romance_clicks AND speed_clicks >= luxury_clicks THEN
    dominant_vibe := 'speed';
  ELSIF romance_clicks >= speed_clicks AND romance_clicks >= luxury_clicks THEN
    dominant_vibe := 'romance';
  ELSE
    dominant_vibe := 'luxury';
  END IF;

  RETURN dominant_vibe;
END;
$$;

-- Create function to inject trend keywords
CREATE OR REPLACE FUNCTION public.inject_trend_keywords(
  p_keywords TEXT[],
  p_source TEXT DEFAULT 'ml_service'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_keywords TEXT[];
  new_keywords TEXT[];
  log_entry JSONB;
BEGIN
  -- Get current keywords
  SELECT dynamic_seo_keywords INTO current_keywords
  FROM public.app_config
  ORDER BY updated_at DESC
  LIMIT 1;

  -- Merge keywords (keep unique, limit to 50)
  new_keywords := ARRAY(
    SELECT DISTINCT unnest
    FROM unnest(current_keywords || p_keywords) unnest
    LIMIT 50
  );

  -- Create log entry
  log_entry := jsonb_build_object(
    'timestamp', now(),
    'source', p_source,
    'keywords_added', p_keywords,
    'total_keywords', array_length(new_keywords, 1)
  );

  -- Update app_config
  UPDATE public.app_config
  SET
    dynamic_seo_keywords = new_keywords,
    trend_injection_log = (
      SELECT jsonb_agg(elem)
      FROM (
        SELECT elem
        FROM jsonb_array_elements(COALESCE(trend_injection_log, '[]'::jsonb)) elem
        ORDER BY elem->>'timestamp' DESC
        LIMIT 99
      ) recent
    ) || jsonb_build_array(log_entry),
    last_trend_sync = now(),
    updated_at = now()
  WHERE id = (SELECT id FROM public.app_config ORDER BY updated_at DESC LIMIT 1);

  RETURN TRUE;
END;
$$;

-- Insert initial disruptive keywords if app_config table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_config') THEN
    UPDATE public.app_config
    SET dynamic_seo_keywords = ARRAY[
      'Why Tinder is slow',
      'Bypass Bumble queue',
      'Raya invite hack',
      'Raya invite alternative',
      'Instant matching app 2026',
      'Real world OnlyFans alternative',
      'Elite social club access',
      'Gifting economy social app',
      'Skip dating queue',
      'Hack dating algorithms',
      'Proof of intent dating',
      'Matching fatigue solution',
      'Tinder alternatifi en hızlı',
      'Hediye göndererek eşleşme',
      'Dating sırasını atla'
    ]
    WHERE id = (SELECT id FROM public.app_config ORDER BY updated_at DESC LIMIT 1);
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.calculate_current_vibe() TO service_role;
GRANT EXECUTE ON FUNCTION public.inject_trend_keywords(TEXT[], TEXT) TO service_role;
