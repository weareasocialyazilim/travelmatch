-- ============================================
-- THANK YOU SYSTEM SCHEMA
-- Post-flow thank you with audit logging and rate limiting
-- ============================================

-- ============================================
-- THANK YOU EVENTS TABLE (Audit Log)
-- ============================================

CREATE TABLE IF NOT EXISTS thank_you_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_id UUID REFERENCES gifts(id) ON DELETE SET NULL,
  escrow_id UUID REFERENCES escrow_transactions(id) ON DELETE SET NULL,

  -- Message content (denormalized for audit)
  message TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('single', 'bulk')),

  -- Moderation
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'flagged', 'rejected', 'pending_review')),
  flagged_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT thank_you_length CHECK (char_length(message) >= 10 AND char_length(message) <= 280)
);

-- Indexes for performance
CREATE INDEX idx_thank_you_events_moment ON thank_you_events(moment_id);
CREATE INDEX idx_thank_you_events_author ON thank_you_events(author_id);
CREATE INDEX idx_thank_you_events_recipient ON thank_you_events(recipient_id);
CREATE INDEX idx_thank_you_events_created ON thank_you_events(created_at DESC);
CREATE INDEX idx_thank_you_events_moderation ON thank_you_events(moderation_status) WHERE moderation_status = 'flagged';

-- ============================================
-- THANK YOU SNOOZE TABLE (User-level snooze)
-- ============================================

CREATE TABLE IF NOT EXISTS thank_you_snooze (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  snoozed_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT single_snooze_per_user_moment UNIQUE (user_id, moment_id)
);

CREATE INDEX idx_thank_you_snooze ON thank_you_snooze(snoozed_until);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE thank_you_events ENABLE ROW LEVEL SECURITY;

-- Authors can see their own thank yous
CREATE POLICY "Authors can view own thank yous" ON thank_you_events
  FOR SELECT USING (auth.uid() = author_id);

-- Recipients can see thank yous sent to them
CREATE POLICY "Recipients can view thank yous" ON thank_you_events
  FOR SELECT USING (
    recipient_id IS NOT NULL AND auth.uid() = recipient_id
    OR
    recipient_id IS NULL AND EXISTS (
      SELECT 1 FROM gifts
      WHERE moment_id = thank_you_events.moment_id
      AND giver_id = auth.uid()
    )
  );

-- Admins can view all
CREATE POLICY "Admins can view all thank yous" ON thank_you_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role IN ('super_admin', 'manager', 'moderator'))
  );

-- System can insert (for triggers)
CREATE POLICY "System can insert thank you events" ON thank_you_events
  FOR INSERT WITH CHECK (true);

-- ============================================
-- RATE LIMITING FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION check_thank_you_rate_limit(
  p_user_id UUID,
  p_moment_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_daily_count INTEGER;
  v_moment_count INTEGER;
BEGIN
  -- Daily limit: 5 thank yous per user per day
  SELECT COUNT(*) INTO v_daily_count
  FROM thank_you_events
  WHERE author_id = p_user_id
  AND created_at > NOW() - INTERVAL '24 hours';

  IF v_daily_count >= 5 THEN
    RETURN FALSE;
  END IF;

  -- Per moment limit: 1 thank you per user per moment per week
  SELECT COUNT(*) INTO v_moment_count
  FROM thank_you_events
  WHERE author_id = p_user_id
  AND moment_id = p_moment_id
  AND created_at > NOW() - INTERVAL '7 days';

  IF v_moment_count >= 1 THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION check_thank_you_rate_limit TO authenticated;

-- ============================================
-- THANK YOU EVENT FROM TRUST NOTE TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION create_thank_you_event_from_note()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO thank_you_events (
    moment_id, author_id, recipient_id, gift_id, escrow_id,
    message, message_type, moderation_status
  )
  SELECT
    NEW.moment_id, NEW.author_id, NEW.recipient_id,
    NEW.gift_id, NEW.escrow_id,
    NEW.note, 'single',
    CASE WHEN NEW.is_flagged THEN 'pending_review' ELSE 'approved' END
  WHERE NEW.is_approved = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger (apply to existing trust_notes table)
CREATE TRIGGER trigger_thank_you_event_on_note
  AFTER INSERT ON trust_notes
  FOR EACH ROW
  WHEN (NEW.is_approved = true)
  EXECUTE FUNCTION create_thank_you_event_from_note();

-- ============================================
-- BULK THANK YOU FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION send_bulk_thank_you(
  p_moment_id UUID,
  p_message TEXT,
  p_author_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_recipient_count INTEGER;
  v_event_id UUID;
BEGIN
  -- Validate message length
  IF char_length(p_message) < 10 OR char_length(p_message) > 280 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Message must be 10-280 characters');
  END IF;

  -- Check rate limit
  IF NOT check_thank_you_rate_limit(p_author_id, p_moment_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rate limit exceeded');
  END IF;

  -- Count gifters (exclude cancelled/refunded)
  SELECT COUNT(DISTINCT giver_id) INTO v_recipient_count
  FROM gifts
  WHERE moment_id = p_moment_id
  AND status NOT IN ('cancelled', 'refunded')
  AND giver_id <> p_author_id;

  IF v_recipient_count = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'No gifters to thank');
  END IF;

  -- Create thank you event
  INSERT INTO thank_you_events (
    moment_id, author_id, recipient_id,
    message, message_type, moderation_status
  )
  VALUES (
    p_moment_id, p_author_id, NULL,
    p_message, 'bulk', 'approved'
  )
  RETURNING id INTO v_event_id;

  -- Send notifications to all gifters
  INSERT INTO notifications (user_id, type, title, body, data)
  SELECT
    DISTINCT g.giver_id,
    'bulk_thank_you',
    'Teşekkür Aldınız! 🎁',
    p_message,
    jsonb_build_object(
      'moment_id', p_moment_id,
      'event_id', v_event_id,
      'message', p_message
    )
  FROM gifts g
  WHERE g.moment_id = p_moment_id
  AND g.giver_id <> p_author_id
  AND g.status NOT IN ('cancelled', 'refunded');

  RETURN jsonb_build_object(
    'success', true,
    'event_id', v_event_id,
    'recipient_count', v_recipient_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION send_bulk_thank_you TO authenticated;

-- ============================================
-- ESCROW TERMINAL STATE → THANK YOU TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION notify_thank_you_available()
RETURNS TRIGGER AS $$
DECLARE
  v_moment_owner UUID;
BEGIN
  -- Only trigger on terminal states
  IF NEW.status NOT IN ('released', 'refunded', 'expired', 'cancelled') THEN
    RETURN NEW;
  END IF;

  -- Get moment owner
  SELECT user_id INTO v_moment_owner
  FROM moments WHERE id = NEW.moment_id;

  -- Send notification to moment owner
  IF v_moment_owner IS NOT NULL AND v_moment_owner <> NEW.sender_id THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      v_moment_owner,
      'thank_you_available',
      'Teşekkür Bırakabilirsiniz 🎁',
      'Bu hediye için bir teşekkür notu bırakabilirsiniz.',
      jsonb_build_object(
        'moment_id', NEW.moment_id,
        'gift_id', NEW.gift_id,
        'escrow_id', NEW.id,
        'escrow_status', NEW.status
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_thank_you
  AFTER UPDATE ON escrow_transactions
  FOR EACH ROW
  WHEN (OLD.status <> NEW.status AND NEW.status IN ('released', 'refunded', 'expired', 'cancelled'))
  EXECUTE FUNCTION notify_thank_you_available();

COMMENT ON FUNCTION notify_thank_you_available IS 'Sends notification when escrow reaches terminal state, allowing thank you to be sent.';
