-- Migration: Auto-create conversation on Request Accept
-- Date: 21 January 2026
-- Description: Triggers chat creation when a host accepts a request

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_accepted_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_host_id UUID;
    v_conversation_id UUID;
    v_moment_title TEXT;
BEGIN
    -- Get the Host ID and Moment Title from the moment linked to the request
    SELECT user_id, title INTO v_host_id, v_moment_title
    FROM public.moments
    WHERE id = NEW.moment_id;

    -- Safety check
    IF v_host_id IS NULL THEN
        RAISE WARNING 'Moment % not found for request %', NEW.moment_id, NEW.id;
        RETURN NEW;
    END IF;

    -- Create or Get Conversation using the existing atomic function
    -- The participants are the Host and the Requester (NEW.user_id)
    SELECT id INTO v_conversation_id
    FROM public.get_or_create_conversation(ARRAY[v_host_id, NEW.user_id]);

    -- Identify context (optional: send system message)
    INSERT INTO public.messages (conversation_id, sender_id, content, type)
    VALUES (
        v_conversation_id,
        v_host_id, -- Message appears to come from Host
        'I accepted your request for ' || COALESCE(v_moment_title, 'the moment') || '! Let''s chat.',
        'text'
    );

    RETURN NEW;
END;
$$;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS on_request_accepted ON public.requests;

CREATE TRIGGER on_request_accepted
    AFTER UPDATE OF status ON public.requests
    FOR EACH ROW
    WHEN (OLD.status != 'accepted' AND NEW.status = 'accepted')
    EXECUTE FUNCTION public.handle_accepted_request();

-- 3. Backfill for testing (Optional but useful)
-- We won't backfill to avoid spamming old chats, only new actions will trigger this.
