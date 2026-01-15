-- Lovendo Functions and Triggers Migration
-- Version: 1.0.0
-- Created: 2024-12-05
-- Description: Database functions and triggers

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user rating after review
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET 
    rating = (SELECT COALESCE(AVG(rating)::DECIMAL(2,1), 0) FROM reviews WHERE reviewed_id = NEW.reviewed_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE reviewed_id = NEW.reviewed_id)
  WHERE id = NEW.reviewed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update moment participant count
CREATE OR REPLACE FUNCTION update_moment_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE moments
    SET current_participants = current_participants + 1
    WHERE id = NEW.moment_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
      UPDATE moments
      SET current_participants = current_participants + 1
      WHERE id = NEW.moment_id;
    ELSIF OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
      UPDATE moments
      SET current_participants = GREATEST(0, current_participants - 1)
      WHERE id = NEW.moment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE moments
    SET current_participants = GREATEST(0, current_participants - 1)
    WHERE id = OLD.moment_id;
  END IF;
  
  -- Update moment status if full
  UPDATE moments
  SET status = CASE 
    WHEN current_participants >= max_participants THEN 'full'
    WHEN status = 'full' AND current_participants < max_participants THEN 'active'
    ELSE status
  END
  WHERE id = COALESCE(NEW.moment_id, OLD.moment_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update last message in conversation
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_id = NEW.id,
    updated_at = TIMEZONE('utc', NOW())
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- NOTIFICATION FUNCTIONS
-- ============================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data)
  RETURNING id INTO notification_id;
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  IF p_notification_ids IS NULL THEN
    UPDATE notifications
    SET read = TRUE
    WHERE user_id = p_user_id AND read = FALSE;
  ELSE
    UPDATE notifications
    SET read = TRUE
    WHERE user_id = p_user_id AND id = ANY(p_notification_ids);
  END IF;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEARCH FUNCTIONS
-- ============================================

-- Function to search moments by location
CREATE OR REPLACE FUNCTION search_moments_nearby(
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_radius_km DOUBLE PRECISION DEFAULT 50,
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  location TEXT,
  date TIMESTAMP WITH TIME ZONE,
  price DECIMAL,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.category,
    m.location,
    m.date,
    m.price,
    ST_Distance(
      m.coordinates::geography,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
    ) / 1000 AS distance_km
  FROM moments m
  WHERE 
    m.status = 'active'
    AND m.date > NOW()
    AND (p_category IS NULL OR m.category = p_category)
    AND ST_DWithin(
      m.coordinates::geography,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
      p_radius_km * 1000
    )
  ORDER BY distance_km
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- CLEANUP FUNCTIONS
-- ============================================

-- Function to soft delete user
CREATE OR REPLACE FUNCTION soft_delete_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users
  SET 
    deleted_at = TIMEZONE('utc', NOW()),
    email = email || '_deleted_' || EXTRACT(EPOCH FROM NOW())::TEXT,
    phone = NULL,
    push_token = NULL
  WHERE id = p_user_id AND deleted_at IS NULL;
  
  -- Cancel active moments
  UPDATE moments
  SET status = 'cancelled'
  WHERE user_id = p_user_id AND status IN ('active', 'draft');
  
  -- Cancel pending requests
  UPDATE requests
  SET status = 'cancelled'
  WHERE user_id = p_user_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_moments_updated_at') THEN
        CREATE TRIGGER update_moments_updated_at
  BEFORE UPDATE ON moments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_requests_updated_at') THEN
        CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at') THEN
        CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

-- Update user rating trigger
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rating_after_review') THEN
        CREATE TRIGGER update_rating_after_review
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_user_rating();
    END IF;
END $$;

-- Update moment participants trigger
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_participants_on_request') THEN
        CREATE TRIGGER update_participants_on_request
  AFTER INSERT OR UPDATE OR DELETE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_moment_participants();
    END IF;
END $$;

-- Update conversation last message trigger
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversation_on_message') THEN
        CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();
    END IF;
END $$;
