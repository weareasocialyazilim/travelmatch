-- Migration: Advanced Trigger Helpers
-- Created: 2026-01-24
-- Purpose: Provide efficient SQL functions for Edge Functions to check abuse triggers

-- 1. Check Message Burst (Last 10 minutes)
CREATE OR REPLACE FUNCTION public.check_trigger_message_burst(
    p_sender_id UUID,
    p_minutes INT DEFAULT 10,
    p_threshold INT DEFAULT 15
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.messages
    WHERE sender_id = p_sender_id
      AND created_at > NOW() - (p_minutes || ' minutes')::INTERVAL;
    
    RETURN v_count > p_threshold;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Check Unique DM Recipients (Last 1 hour)
CREATE OR REPLACE FUNCTION public.check_trigger_dm_uniques(
    p_sender_id UUID,
    p_hours INT DEFAULT 1,
    p_threshold INT DEFAULT 12
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(DISTINCT receiver_id) INTO v_count
    FROM public.messages
    WHERE sender_id = p_sender_id
      AND created_at > NOW() - (p_hours || ' hours')::INTERVAL;
      
    RETURN v_count > p_threshold;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Check Repeat Messages (Last 24 hours) - Basic content match
-- Note: Ideally we should use a hash, but this works for exact matches
CREATE OR REPLACE FUNCTION public.check_trigger_repeat_message(
    p_sender_id UUID,
    p_content_hash TEXT, -- Client or Server should hash the content
    p_threshold INT DEFAULT 3
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INT;
BEGIN
    -- Check how many distinct receivers got the SAME content from this sender
    -- We assume 'metadata->>content_hash' exists OR we check content directly if short
    -- Ideally, add 'content_hash' column to messages for performance
    
    -- Fallback to regex/substring check if hash not available, but for v1 let's assume raw content
    -- WARN: This is expensive if body is large.
    
    SELECT COUNT(DISTINCT receiver_id) INTO v_count
    FROM public.messages
    WHERE sender_id = p_sender_id
      AND content = p_content_hash -- Here we treat input as content for simplicity in v1
      AND created_at > NOW() - INTERVAL '24 hours';
      
    RETURN v_count >= p_threshold;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Check Profile View Scrape (Last 5 minutes)
-- Requires 'profile_views' table which might need to be created if not exists
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    viewed_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_recent 
ON public.profile_views(viewer_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.check_trigger_profile_scrape(
    p_viewer_id UUID,
    p_minutes INT DEFAULT 5,
    p_threshold INT DEFAULT 80
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.profile_views
    WHERE viewer_id = p_viewer_id
      AND created_at > NOW() - (p_minutes || ' minutes')::INTERVAL;
      
    RETURN v_count > p_threshold;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Check Invite Abuse (Last 1 hour)
CREATE TABLE IF NOT EXISTS public.invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invites_creator_recent 
ON public.invites(creator_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.check_trigger_invite_abuse(
    p_creator_id UUID,
    p_minutes INT DEFAULT 60,
    p_threshold INT DEFAULT 30
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.invites
    WHERE creator_id = p_creator_id
      AND created_at > NOW() - (p_minutes || ' minutes')::INTERVAL;
      
    RETURN v_count > p_threshold;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
