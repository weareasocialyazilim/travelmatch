-- Migration: Abuse & Moderation System v1
-- Created: 2026-01-24
-- Purpose: Implement robust risk scoring, shadowbanning, and automated moderation

-- 1. Enum for Moderation Status
DO $$ BEGIN
    CREATE TYPE moderation_status_type AS ENUM ('active', 'soft_throttled', 'shadowbanned', 'temp_locked', 'permanent_ban');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Enhance USERS table with Risk Scoring
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS moderation_status moderation_status_type DEFAULT 'active',
ADD COLUMN IF NOT EXISTS device_fingerprint TEXT,
ADD COLUMN IF NOT EXISTS last_known_ip TEXT,
ADD COLUMN IF NOT EXISTS shadowbanned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_risk_score ON public.users(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_moderation_status ON public.users(moderation_status);

-- 3. Create Moderation Actions Table (Admin/System Actions)
CREATE TABLE IF NOT EXISTS public.moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Null implies System/Auto
    action TEXT NOT NULL, -- 'risk_increase', 'shadowban', 'ban', 'warning', 'status_change'
    reason TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Store old vs new score, trigger details
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_user_id ON public.moderation_actions(user_id);

-- 4. Function: Auto-Calculate Moderation Status based on Risk Score
CREATE OR REPLACE FUNCTION public.update_moderation_status()
RETURNS TRIGGER AS $$
DECLARE
    new_status moderation_status_type;
BEGIN
    -- Only proceed if risk_score changed
    IF OLD.risk_score = NEW.risk_score THEN
        RETURN NEW;
    END IF;

    -- Define Thresholds
    -- 0-29: Active
    -- 30-49: Soft Throttle
    -- 50-79: Shadowban
    -- 80-99: Temp Lock
    -- 100+: Permanent Ban

    IF NEW.risk_score >= 100 THEN
        new_status := 'permanent_ban';
    ELSIF NEW.risk_score >= 80 THEN
        new_status := 'temp_locked';
    ELSIF NEW.risk_score >= 50 THEN
        new_status := 'shadowbanned';
    ELSIF NEW.risk_score >= 30 THEN
        new_status := 'soft_throttled';
    ELSE
        new_status := 'active';
    END IF;

    -- If status is changing, log it and update
    IF NEW.moderation_status != new_status THEN
        INSERT INTO public.moderation_actions (user_id, action, reason, metadata)
        VALUES (
            NEW.id, 
            'status_change', 
            'Risk score threshold crossed', 
            jsonb_build_object('old_score', OLD.risk_score, 'new_score', NEW.risk_score, 'old_status', OLD.moderation_status, 'new_status', new_status)
        );
        
        NEW.moderation_status := new_status;
        
        -- Timestamp updates
        IF new_status = 'shadowbanned' AND OLD.moderation_status != 'shadowbanned' THEN
            NEW.shadowbanned_at := NOW();
        END IF;
        
        IF new_status = 'permanent_ban' AND OLD.moderation_status != 'permanent_ban' THEN
            NEW.banned_at := NOW();
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for User Risk Updates
DROP TRIGGER IF EXISTS trg_update_moderation_status ON public.users;
CREATE TRIGGER trg_update_moderation_status
    BEFORE UPDATE OF risk_score ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_moderation_status();


-- 5. Helper Function to Increment Risk Score safely
CREATE OR REPLACE FUNCTION public.increment_risk_score(
    target_user_id UUID, 
    increment_amount INTEGER, 
    reason_text TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users
    SET risk_score = risk_score + increment_amount
    WHERE id = target_user_id;

    INSERT INTO public.moderation_actions (user_id, action, reason, metadata)
    VALUES (target_user_id, 'risk_increase', reason_text, jsonb_build_object('amount', increment_amount));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. Trigger: Spamming Requests (Replaces "Swipes")
-- Rule: > 50 requests in 1 hour -> Risk +20
CREATE OR REPLACE FUNCTION public.check_request_spam()
RETURNS TRIGGER AS $$
DECLARE
    recent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO recent_count
    FROM public.requests
    WHERE user_id = NEW.user_id
      AND created_at > NOW() - INTERVAL '1 hour';

    IF recent_count > 50 THEN
        PERFORM public.increment_risk_score(NEW.user_id, 20, 'Spam behavior: >50 requests/hour');
    ELSIF recent_count > 20 THEN
        PERFORM public.increment_risk_score(NEW.user_id, 5, 'High activity: >20 requests/hour');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_request_spam ON public.requests;
CREATE TRIGGER trg_check_request_spam
    AFTER INSERT ON public.requests
    FOR EACH ROW
    EXECUTE FUNCTION public.check_request_spam();


-- 7. Trigger: Report Handling
-- Rule: Each report adds +30 risk
-- Note: 'reports' table must exist 
CREATE OR REPLACE FUNCTION public.handle_new_report()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process user reports if reported_user_id is present
    IF NEW.reported_user_id IS NOT NULL THEN
        PERFORM public.increment_risk_score(NEW.reported_user_id, 30, 'User reported: ' || NEW.reason);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger creation for reports
DROP TRIGGER IF EXISTS trg_handle_new_report ON public.reports;
CREATE TRIGGER trg_handle_new_report
    AFTER INSERT ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_report();



-- 8. Apply Shadowban Visibility Rules via RLS

-- Moments: Shadowbanned users' moments are hidden from others
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
        SELECT 1 FROM public.users owner 
        WHERE owner.id = moments.user_id 
          AND owner.moderation_status IN ('active', 'soft_throttled')
      )
    )
  );

-- Requests: Shadowbanned users can create requests, but recipient won't see them (Ghosting)
-- Or we prevent them from creating? "Messages sent appear sent but not delivered" -> Ghosting.
-- For requests, we can let them insert, but hide from the receiver.

DROP POLICY IF EXISTS "Requests visibility" ON public.requests;
CREATE POLICY "Requests visibility"
  ON public.requests
  FOR SELECT
  USING (
    -- Sender always sees
    auth.uid() = user_id 
    OR 
    -- Recipient sees ONLY IF sender is NOT shadowbanned
    (
      auth.uid() = (SELECT user_id FROM moments WHERE id = requests.moment_id) -- Owner of moment
      AND
      EXISTS (
        SELECT 1 FROM public.users sender 
        WHERE sender.id = requests.user_id 
          AND sender.moderation_status IN ('active', 'soft_throttled')
      )
    )
  );

