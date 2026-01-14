-- Migration: Fix feed_delta_on_message trigger function
-- Date: 21 January 2026
-- Description: Fixes bug where accessing NEW.receiver_id failed because messages table has no such column.
--              Instead, we look up participants from the conversation table.

CREATE OR REPLACE FUNCTION public.track_message_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_participant_ids UUID[];
  v_pid UUID;
BEGIN
  -- Get participants from conversation
  -- For INSERT/UPDATE, use NEW.conversation_id
  -- For DELETE, use OLD.conversation_id
  IF TG_OP = 'DELETE' THEN
      SELECT participant_ids INTO v_participant_ids
      FROM public.conversations
      WHERE id = OLD.conversation_id;
  ELSE
      SELECT participant_ids INTO v_participant_ids
      FROM public.conversations
      WHERE id = NEW.conversation_id;
  END IF;

  -- If conversation deleted or not found, we can't notify participants via this method easily
  -- But typically conversation exists.
  IF v_participant_ids IS NULL THEN
      RETURN COALESCE(NEW, OLD);
  END IF;

  FOREACH v_pid IN ARRAY v_participant_ids
  LOOP
      IF TG_OP = 'INSERT' THEN
        INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
        VALUES ('insert', 'message', NEW.id, v_pid, to_jsonb(NEW));
      ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
        VALUES ('update', 'message', NEW.id, v_pid, to_jsonb(NEW));
      ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
        VALUES ('delete', 'message', OLD.id, v_pid, NULL);
      END IF;
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$$;
