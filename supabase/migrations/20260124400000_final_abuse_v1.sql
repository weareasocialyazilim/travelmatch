-- Migration: Final Abuse & Moderation V1 - Schema Consolidation
-- Created: 2026-01-24
-- Purpose: Separate safety data to user_safety table and finalize RLS/Indexes

-- 1. Create user_safety table (Separation of Concern)
CREATE TABLE IF NOT EXISTS public.user_safety (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    risk_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'throttled', 'shadowbanned', 'temp_locked', 'permanent_ban')),
    device_hash TEXT,
    last_known_ip TEXT,
    ban_reason TEXT,
    ban_expires_at TIMESTAMPTZ,
    shadowbanned_at TIMESTAMPTZ,
    last_risk_at TIMESTAMPTZ,
    decay_last_run TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrating existing data from users table if any (Optional cleanup)
INSERT INTO public.user_safety (user_id, risk_score, status, device_hash, last_known_ip, shadowbanned_at, created_at)
SELECT id, risk_score, moderation_status, device_fingerprint, last_known_ip, shadowbanned_at, created_at
FROM public.users
ON CONFLICT (user_id) DO UPDATE 
SET risk_score = EXCLUDED.risk_score, status = EXCLUDED.status;

-- 2. Indexes for Performance (Checklist Items)
-- Ensure receiver_id exists on messages for RLS performance
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES public.users(id);

-- Backfill receiver_id if null (CRITICAL for RLS)
DO $$
BEGIN
    -- Temporary disable triggers to prevent side-effects (feed_delta) during backfill
    ALTER TABLE public.messages DISABLE TRIGGER USER;

    UPDATE public.messages m
    SET receiver_id = (
        SELECT pid 
        FROM unnest(c.participant_ids) AS pid
        JOIN public.users u ON u.id = pid -- Ensure user exists to avoid FK violations
        WHERE pid != m.sender_id
        LIMIT 1
    )
    FROM public.conversations c
    WHERE m.conversation_id = c.id
      AND m.receiver_id IS NULL;
      
    ALTER TABLE public.messages ENABLE TRIGGER USER;
END $$;

CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_safety_device_hash ON public.user_safety(device_hash);
CREATE INDEX IF NOT EXISTS idx_user_safety_status ON public.user_safety(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON public.messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reported_created ON public.reports(reported_user_id, created_at DESC);
-- profile_views and invites indexes were added in previous step

-- 3. RLS Policies Verification & Hardening

-- A) user_safety:
ALTER TABLE public.user_safety ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can full access user_safety" ON public.user_safety;
CREATE POLICY "Admins can full access user_safety" ON public.user_safety
FOR ALL
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users read own safety status" ON public.user_safety;
CREATE POLICY "Users read own safety status" ON public.user_safety
FOR SELECT
USING (auth.uid() = user_id);

-- B) Messages Visibility (Shadowban Enforcement)
DROP POLICY IF EXISTS "Messages visibility" ON public.messages;
CREATE POLICY "Messages visibility" ON public.messages
FOR SELECT
USING (
  -- 1. User sees own messages
  auth.uid() = sender_id
  OR
  -- 2. Receiver sees message ONLY IF visibility is public
  (auth.uid() = receiver_id AND visibility = 'public')
  OR
  -- 3. Admins see all
  (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()))
);

-- C) Moments Visibility (Recoded to use user_safety)
DROP POLICY IF EXISTS "Moments visibility" ON public.moments;
CREATE POLICY "Moments visibility"
  ON public.moments
  FOR SELECT
  USING (
    -- User sees their own moments
    auth.uid() = user_id 
    OR 
    -- Others see moments ONLY IF owner is NOT shadowbanned/banned
    (
      EXISTS (
        SELECT 1 FROM public.user_safety owner_safety
        WHERE owner_safety.user_id = moments.user_id 
          AND owner_safety.status IN ('active', 'throttled')
      )
    )
  );


-- 4. User Status Sync Trigger
-- When user_safety.status changes, we might want to log it to moderation_actions automatically
CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO public.moderation_actions (user_id, action, reason, metadata)
        VALUES (NEW.user_id, 'status_change', 'Status changed via DB update', jsonb_build_object('old', OLD.status, 'new', NEW.status));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_status_change ON public.user_safety;
CREATE TRIGGER trg_log_status_change
    AFTER UPDATE OF status ON public.user_safety
    FOR EACH ROW
    EXECUTE FUNCTION public.log_status_change();


-- 5. Helper Function to Increment Risk Score safely (UPDATED to use user_safety)
CREATE OR REPLACE FUNCTION public.increment_risk_score(
    target_user_id UUID, 
    increment_amount INTEGER, 
    reason_text TEXT
)
RETURNS VOID AS $$
DECLARE
  current_status TEXT;
  current_score INTEGER;
  new_score INTEGER;
  new_status TEXT;
BEGIN
    -- Ensure record exists
    INSERT INTO public.user_safety (user_id) VALUES (target_user_id) ON CONFLICT DO NOTHING;

    -- Update score
    UPDATE public.user_safety
    SET risk_score = risk_score + increment_amount,
        last_risk_at = NOW()
    WHERE user_id = target_user_id
    RETURNING status, risk_score INTO current_status, new_score;

    -- Log action
    INSERT INTO public.moderation_actions (user_id, action, reason, metadata)
    VALUES (target_user_id, 'risk_increase', reason_text, jsonb_build_object('amount', increment_amount, 'new_score', new_score));

    -- Auto-Escalation Logic
    IF current_status = 'active' OR current_status = 'throttled' THEN
       IF new_score >= 100 THEN
          new_status := 'permanent_ban';
       ELSIF new_score >= 80 THEN
          new_status := 'temp_locked';
       ELSIF new_score >= 50 THEN
          new_status := 'shadowbanned';
       ELSIF new_score >= 30 THEN
          new_status := 'throttled';
       ELSE
          new_status := current_status;
       END IF;

       IF new_status != current_status THEN
          UPDATE public.user_safety SET status = new_status WHERE user_id = target_user_id;
       END IF;
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. Update Admin Moderation Inbox View to use user_safety
DROP VIEW IF EXISTS public.admin_moderation_inbox;
CREATE OR REPLACE VIEW public.admin_moderation_inbox AS
SELECT 
    u.id as user_id,
    u.full_name,
    us.risk_score,
    us.status as moderation_status,
    u.created_at,
    'high_risk' as trigger_type,
    jsonb_build_object('score', us.risk_score) as details,
    (SELECT COUNT(*) FROM public.reports r WHERE r.reported_user_id = u.id) as report_count,
    NOW() as updated_at
FROM public.users u
JOIN public.user_safety us ON us.user_id = u.id
WHERE us.risk_score >= 80 AND us.status NOT IN ('permanent_ban')

UNION ALL

SELECT 
    r.reported_user_id as user_id,
    u.full_name,
    us.risk_score,
    us.status as moderation_status,
    u.created_at,
    'reported' as trigger_type,
    jsonb_build_object('reason', r.reason, 'report_id', r.id) as details,
    (SELECT COUNT(*) FROM public.reports rep WHERE rep.reported_user_id = u.id) as report_count,
    r.created_at as updated_at
FROM public.reports r
JOIN public.users u ON u.id = r.reported_user_id
JOIN public.user_safety us ON us.user_id = u.id
WHERE r.status = 'pending';

