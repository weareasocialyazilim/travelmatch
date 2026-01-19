-- Appeals System for Banned/Suspended Users
-- Allows users to appeal moderation decisions

CREATE TABLE IF NOT EXISTS public.appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    case_type TEXT CHECK (case_type IN ('account_ban', 'content_removal', 'shadowban', 'trust_score')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    reason_code TEXT, -- 'mistake', 'account_hacked', 'apology'
    description TEXT NOT NULL,
    evidence_url TEXT,
    staff_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Limit 1 active appeal per type per user
    UNIQUE(user_id, case_type, status)
);

-- RLS
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;

-- Users can view their own appeals
DROP POLICY IF EXISTS "Users can view own appeals" ON public.appeals;
CREATE POLICY "Users can view own appeals" 
ON public.appeals FOR SELECT USING (auth.uid() = user_id);

-- Users can create appeals
DROP POLICY IF EXISTS "Users can create appeals" ON public.appeals;
CREATE POLICY "Users can create appeals" 
ON public.appeals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies inferred (admin_users check)
