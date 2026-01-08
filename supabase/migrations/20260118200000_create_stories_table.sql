-- Migration: Create Stories and Story Views Tables
-- Description: Adds tables for Instagram-like stories feature
-- Author: TravelMatch Team
-- Date: 2026-01-18

-- Create stories table
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    video_url TEXT,
    moment_id UUID REFERENCES public.moments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours') NOT NULL,
    view_count INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Create story_views table to track who viewed each story
CREATE TABLE IF NOT EXISTS public.story_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(story_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_active_expires ON public.stories(is_active, expires_at) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON public.story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_user_id ON public.story_views(user_id);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stories
-- Anyone can view active, non-expired stories
CREATE POLICY "stories_select_active"
    ON public.stories
    FOR SELECT
    TO authenticated
    USING (is_active = TRUE AND expires_at > NOW());

-- Users can create their own stories
CREATE POLICY "stories_insert_own"
    ON public.stories
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own stories
CREATE POLICY "stories_update_own"
    ON public.stories
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own stories
CREATE POLICY "stories_delete_own"
    ON public.stories
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS Policies for story_views
-- Users can view their own view records
CREATE POLICY "story_views_select_own"
    ON public.story_views
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can create view records for themselves
CREATE POLICY "story_views_insert_own"
    ON public.story_views
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Story owners can see who viewed their stories
CREATE POLICY "story_views_select_story_owner"
    ON public.story_views
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stories s
            WHERE s.id = story_id AND s.user_id = auth.uid()
        )
    );

-- Function to increment story view count
CREATE OR REPLACE FUNCTION increment_story_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.stories
    SET view_count = view_count + 1
    WHERE id = NEW.story_id;
    RETURN NEW;
END;
$$;

-- Trigger to auto-increment view count
DROP TRIGGER IF EXISTS trigger_increment_story_view ON public.story_views;
CREATE TRIGGER trigger_increment_story_view
    AFTER INSERT ON public.story_views
    FOR EACH ROW
    EXECUTE FUNCTION increment_story_view_count();

-- Function to cleanup expired stories (can be run by pg_cron)
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM public.stories
        WHERE expires_at < NOW() - INTERVAL '7 days'
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    RETURN deleted_count;
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stories TO authenticated;
GRANT SELECT, INSERT ON public.story_views TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE public.stories IS 'Instagram-like stories that expire after 24 hours';
COMMENT ON TABLE public.story_views IS 'Tracks which users have viewed which stories';
