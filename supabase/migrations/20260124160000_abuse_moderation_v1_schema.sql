-- Migration: Abuse & Moderation V1 - Schema Enhancements
-- Created: 2026-01-24
-- Purpose: Complete the Abuse & Moderation system for Lovendo

-- 1. Message Visibility (Ghosting Support)
DO $$ BEGIN
    CREATE TYPE message_visibility_type AS ENUM ('public', 'ghost');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS visibility message_visibility_type DEFAULT 'public';

CREATE INDEX IF NOT EXISTS idx_messages_visibility ON public.messages(visibility);

-- 2. Appeals Table (for Ban/Lock challenges)
CREATE TABLE IF NOT EXISTS public.appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    appeal_type TEXT NOT NULL CHECK (appeal_type IN ('permanent_ban', 'temp_locked', 'content_removal', 'shadowban')),
    reason TEXT NOT NULL, -- User's defense
    evidence_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appeals_status ON public.appeals(status);
CREATE INDEX IF NOT EXISTS idx_appeals_user_id ON public.appeals(user_id);

-- RLS: Users can create appeals and view their own
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create appeals" ON public.appeals;
CREATE POLICY "Users can create appeals"
ON public.appeals FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own appeals" ON public.appeals;
CREATE POLICY "Users can view own appeals"
ON public.appeals FOR SELECT
USING (auth.uid() = user_id);


-- 3. Admin Moderation Inbox (View)
-- Aggregates high risk users and reports into a single actionable queue
CREATE OR REPLACE VIEW public.admin_moderation_inbox AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.risk_score,
    u.moderation_status,
    u.created_at,
    'high_risk' as trigger_type,
    jsonb_build_object('score', u.risk_score) as details,
    (SELECT COUNT(*) FROM public.reports r WHERE r.reported_user_id = u.id) as report_count,
    NOW() as updated_at
FROM public.users u
WHERE u.risk_score >= 80 AND u.moderation_status NOT IN ('permanent_ban')

UNION ALL

SELECT 
    r.reported_user_id as user_id,
    u.full_name,
    u.risk_score,
    u.moderation_status,
    u.created_at,
    'reported' as trigger_type,
    jsonb_build_object('reason', r.reason, 'report_id', r.id) as details,
    (SELECT COUNT(*) FROM public.reports rep WHERE rep.reported_user_id = u.id) as report_count,
    r.created_at as updated_at
FROM public.reports r
JOIN public.users u ON u.id = r.reported_user_id
WHERE r.status = 'pending';


-- 4. Daily Risk Decay Function
-- Reduces risk score over time to forgive minor offenses
CREATE OR REPLACE FUNCTION public.decay_user_risk_scores()
RETURNS VOID AS $$
BEGIN
    -- Standard Decay: -10 points per day for non-banned users
    UPDATE public.users
    SET risk_score = GREATEST(0, risk_score - 10)
    WHERE risk_score > 0 
      AND moderation_status NOT IN ('permanent_ban', 'temp_locked');

    -- Slower Decay for Locked users: -2 points (so they don't auto-unlock too fast)
    UPDATE public.users
    SET risk_score = GREATEST(0, risk_score - 2)
    WHERE risk_score > 0 
      AND moderation_status = 'temp_locked';
      
    -- Log the run
    INSERT INTO public.moderation_actions (action, reason, metadata)
    VALUES ('system_decay', 'Daily risk decay job run', jsonb_build_object('timestamp', NOW()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
