-- Deferred Deep Linking System (Branch.io alternative)
-- Supports basic install attribution and deep link deferral

CREATE TABLE IF NOT EXISTS public.deferred_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint TEXT NOT NULL, -- Hashed device identifiers (IP, User Agent, basic device info)
    deep_link TEXT NOT NULL, -- The original URL (e.g., lovendo://profile/123)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '2 hour', -- Short TTL for fingerprint matching reliability
    claimed_at TIMESTAMPTZ,
    claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who claimed this link
    metadata JSONB DEFAULT '{}' -- Campaign info, source, etc.
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_deferred_links_fingerprint 
ON public.deferred_links(fingerprint) 
WHERE claimed_at IS NULL;

-- Function to claim a link
CREATE OR REPLACE FUNCTION claim_deferred_link(
    p_fingerprint TEXT,
    p_user_id UUID DEFAULT NULL
)
RETURNS TEXT -- Returns the deep_link if found, else NULL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_link TEXT;
    v_id UUID;
BEGIN
    SELECT id, deep_link INTO v_id, v_link
    FROM public.deferred_links
    WHERE fingerprint = p_fingerprint
      AND claimed_at IS NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_id IS NOT NULL THEN
        UPDATE public.deferred_links
        SET claimed_at = NOW(),
            claimed_by = p_user_id
        WHERE id = v_id;
        
        RETURN v_link;
    END IF;

    RETURN NULL;
END;
$$;
