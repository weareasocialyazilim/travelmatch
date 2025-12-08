-- Migration: Add triggers to auto-track feed changes
-- Description: Automatically insert records into feed_delta when moments/matches/messages change

-- ============================================================================
-- Trigger Function: Track Moment Changes
-- ============================================================================

CREATE OR REPLACE FUNCTION track_moment_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES ('insert', 'moment', NEW.id, NEW.user_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES ('update', 'moment', NEW.id, NEW.user_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES ('delete', 'moment', OLD.id, OLD.user_id, NULL);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on moments table
DROP TRIGGER IF EXISTS moments_change_tracker ON public.moments;
CREATE TRIGGER moments_change_tracker
AFTER INSERT OR UPDATE OR DELETE ON public.moments
FOR EACH ROW EXECUTE FUNCTION track_moment_changes();

-- ============================================================================
-- Trigger Function: Track Match Changes
-- ============================================================================

CREATE OR REPLACE FUNCTION track_match_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Insert for both users in the match
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES 
      ('insert', 'match', NEW.id, NEW.user_a_id, to_jsonb(NEW)),
      ('insert', 'match', NEW.id, NEW.user_b_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update for both users
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES 
      ('update', 'match', NEW.id, NEW.user_a_id, to_jsonb(NEW)),
      ('update', 'match', NEW.id, NEW.user_b_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Delete for both users
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES 
      ('delete', 'match', OLD.id, OLD.user_a_id, NULL),
      ('delete', 'match', OLD.id, OLD.user_b_id, NULL);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on matches table
DROP TRIGGER IF EXISTS matches_change_tracker ON public.matches;
CREATE TRIGGER matches_change_tracker
AFTER INSERT OR UPDATE OR DELETE ON public.matches
FOR EACH ROW EXECUTE FUNCTION track_match_changes();

-- ============================================================================
-- Trigger Function: Track Message Changes
-- ============================================================================

CREATE OR REPLACE FUNCTION track_message_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Insert for both sender and receiver
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES 
      ('insert', 'message', NEW.id, NEW.sender_id, to_jsonb(NEW)),
      ('insert', 'message', NEW.id, NEW.receiver_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update for both users
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES 
      ('update', 'message', NEW.id, NEW.sender_id, to_jsonb(NEW)),
      ('update', 'message', NEW.id, NEW.receiver_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Delete for both users
    INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
    VALUES 
      ('delete', 'message', OLD.id, OLD.sender_id, NULL),
      ('delete', 'message', OLD.id, OLD.receiver_id, NULL);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on messages table
DROP TRIGGER IF EXISTS messages_change_tracker ON public.messages;
CREATE TRIGGER messages_change_tracker
AFTER INSERT OR UPDATE OR DELETE ON public.messages
FOR EACH ROW EXECUTE FUNCTION track_message_changes();

-- ============================================================================
-- Cleanup Function: Remove old delta records
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_feed_delta()
RETURNS void AS $$
BEGIN
  DELETE FROM public.feed_delta
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-feed-delta', '0 2 * * *', 'SELECT cleanup_old_feed_delta();');

COMMENT ON FUNCTION track_moment_changes() IS 'Automatically track changes to moments table in feed_delta';
COMMENT ON FUNCTION track_match_changes() IS 'Automatically track changes to matches table in feed_delta';
COMMENT ON FUNCTION track_message_changes() IS 'Automatically track changes to messages table in feed_delta';
COMMENT ON FUNCTION cleanup_old_feed_delta() IS 'Remove delta records older than 7 days';
