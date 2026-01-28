-- ============================================================================
--  Admin Moderation Queue and Audit Log
--  ============================================================================

-- Moderation queue for human review
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type VARCHAR(50) NOT NULL, -- 'message', 'story', 'user', 'conversation'
  resource_id UUID NOT NULL,
  conversation_id UUID, -- For message-level moderation
  reporter_id UUID, -- Who reported it
  reported_by UUID, -- User who reported

  -- Report details
  report_reason VARCHAR(50),
  report_details TEXT,
  automated_flags JSONB DEFAULT '{}',

  -- Moderation decision
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_review', 'approved', 'rejected', 'escalated')
  ),
  moderator_id UUID,
  moderator_notes TEXT,
  decision VARCHAR(20), -- 'approve', 'reject', 'warn_user', 'ban_user'
  decision_reason TEXT,

  -- Priority and assignment
  priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,

  -- Escalation tracking
  escalation_count INTEGER DEFAULT 0,
  escalated_at TIMESTAMPTZ,
  previous_queue_id UUID
);

-- Indexes
CREATE INDEX idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX idx_moderation_queue_resource ON moderation_queue(resource_type, resource_id);
CREATE INDEX idx_moderation_queue_priority ON moderation_queue(priority) WHERE status = 'pending';
CREATE INDEX idx_moderation_queue_created ON moderation_queue(created_at DESC);

-- Moderation action log (audit trail)
CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES moderation_queue(id) ON DELETE SET NULL,
  moderator_id UUID NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'assign', 'review', 'approve', 'reject', 'escalate'
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  action_details JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moderation_actions_queue ON moderation_actions(queue_id);
CREATE INDEX idx_moderation_actions_moderator ON moderation_actions(moderator_id);
CREATE INDEX idx_moderation_actions_created ON moderation_actions(created_at DESC);

-- User moderation history
CREATE TABLE IF NOT EXISTS user_moderation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'warning', 'suspension', 'ban'
  reason TEXT NOT NULL,
  duration VARCHAR(50), -- 'permanent', '24h', '7d', etc.
  moderator_id UUID,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_mod_history_user ON user_moderation_history(user_id);
CREATE INDEX idx_user_mod_history_created ON user_moderation_history(created_at DESC);

-- Message moderation logs (detailed)
CREATE TABLE IF NOT EXISTS message_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content hash for deduplication
  content_hash VARCHAR(64),

  -- Moderation results
  decision VARCHAR(20) NOT NULL, -- 'allow', 'block', 'review', 'warn'
  flags JSONB DEFAULT '[]',
  reasons TEXT[] DEFAULT '{}',
  confidence DECIMAL(5,4),

  -- Processing
  processing_time_ms INTEGER,
  model_version VARCHAR(20),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_msg_mod_logs_message ON message_moderation_logs(message_id);
CREATE INDEX idx_msg_mod_logs_conversation ON message_moderation_logs(conversation_id);
CREATE INDEX idx_msg_mod_logs_user ON message_moderation_logs(user_id);
CREATE INDEX idx_msg_mod_logs_decision ON message_moderation_logs(decision);
CREATE INDEX idx_msg_mod_logs_created ON message_moderation_logs(created_at DESC);

-- Message media moderation (photos/videos in messages)
CREATE TABLE IF NOT EXISTS message_media_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Media info
  media_url TEXT NOT NULL,
  media_type VARCHAR(20) NOT NULL, -- 'image', 'video'
  placeholder_url TEXT,

  -- Moderation results
  moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (
    moderation_status IN ('pending', 'approved', 'flagged', 'rejected')
  ),
  moderation_labels JSONB DEFAULT '[]',
  confidence DECIMAL(5,4),
  is_approved BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  moderated_at TIMESTAMPTZ
);

CREATE INDEX idx_media_mod_message ON message_media_moderation(message_id);
CREATE INDEX idx_media_mod_status ON message_media_moderation(moderation_status);
CREATE INDEX idx_media_mod_user ON message_media_moderation(user_id);

-- ============================================================================
--  AUTO-QUEUE FUNCTION
--  ============================================================================

-- Auto-queue content for review when flagged
CREATE OR REPLACE FUNCTION auto_queue_for_moderation(
  p_resource_type VARCHAR,
  p_resource_id UUID,
  p_conversation_id UUID DEFAULT NULL,
  p_flags JSONB DEFAULT '{}'::JSONB,
  p_priority VARCHAR(10) DEFAULT 'normal'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  INSERT INTO moderation_queue (
    resource_type,
    resource_id,
    conversation_id,
    automated_flags,
    priority,
    status
  )
  VALUES (
    p_resource_type,
    p_resource_id,
    p_conversation_id,
    p_flags,
    p_priority,
    'pending'
  )
  RETURNING id INTO v_queue_id;

  RETURN v_queue_id;
END;
$$;

-- Trigger to auto-queue messages when moderation blocks them
-- FIXED: Changed from 'moderation_decision' (non-existent) to 'visibility' check
CREATE OR REPLACE FUNCTION queue_blocked_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  -- If message was shadowbanned (visibility = 'ghost'), queue for review
  IF NEW.visibility = 'ghost' AND (OLD.visibility IS NULL OR OLD.visibility != 'ghost') THEN
    SELECT auto_queue_for_moderation(
      'message',
      NEW.id,
      NEW.conversation_id,
      jsonb_build_object(
        'risk_score', COALESCE(NEW.risk_score, 0),
        'moderation_flags', NEW.moderation_flags,
        'sender_id', NEW.sender_id
      ),
      CASE
        WHEN COALESCE(NEW.risk_score, 0) >= 80 THEN 'urgent'
        WHEN COALESCE(NEW.risk_score, 0) >= 50 THEN 'high'
        ELSE 'normal'
      END
    ) INTO v_queue_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_blocked
  AFTER UPDATE ON messages
  FOR EACH ROW
  WHEN (NEW.visibility = 'ghost' AND (OLD.visibility IS NULL OR OLD.visibility != 'ghost'))
  EXECUTE FUNCTION queue_blocked_message();

-- ============================================================================
--  MODERATION ACTIONS
--  ============================================================================

-- Record moderation action
CREATE OR REPLACE FUNCTION record_moderation_action(
  p_queue_id UUID,
  p_moderator_id UUID,
  p_action_type VARCHAR,
  p_new_status VARCHAR,
  p_notes TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::JSONB
)
RETURNS moderation_actions
LANGUAGE plpgsql
AS $$
DECLARE
  v_action moderation_actions;
  v_current_status VARCHAR;
BEGIN
  -- Get current status
  SELECT status INTO v_current_status
  FROM moderation_queue
  WHERE id = p_queue_id;

  -- Insert action record
  INSERT INTO moderation_actions (
    queue_id,
    moderator_id,
    action_type,
    previous_status,
    new_status,
    notes,
    action_details
  )
  VALUES (
    p_queue_id,
    p_moderator_id,
    p_action_type,
    v_current_status,
    p_new_status,
    p_notes,
    p_details
  )
  RETURNING * INTO v_action;

  -- Update queue status
  UPDATE moderation_queue
  SET
    status = p_new_status,
    moderator_id = p_moderator_id,
    updated_at = NOW(),
    reviewed_at = CASE WHEN p_new_status IN ('approved', 'rejected') THEN NOW() ELSE reviewed_at END
  WHERE id = p_queue_id;

  RETURN v_action;
END;
$$;

-- ============================================================================
--  VIEW: Pending Moderation Queue
-- ============================================================================

CREATE OR REPLACE VIEW v_moderation_queue AS
SELECT
  mq.id,
  mq.resource_type,
  mq.resource_id,
  mq.conversation_id,
  mq.report_reason,
  mq.report_details,
  mq.status,
  mq.priority,
  mq.automated_flags,
  mq.created_at,
  mq.escalation_count,
  u.username AS reporter_username,
  CASE
    WHEN mq.resource_type = 'message' THEN (
      SELECT content FROM messages WHERE id = mq.resource_id
    )
    ELSE NULL
  END AS reported_content
FROM moderation_queue mq
LEFT JOIN users u ON mq.reporter_id = u.id
WHERE mq.status IN ('pending', 'in_review');

-- ============================================================================
--  VIEW: Moderator Stats
-- ============================================================================

CREATE OR REPLACE VIEW v_moderator_stats AS
SELECT
  ma.moderator_id,
  u.username,
  COUNT(*) FILTER (WHERE ma.action_type = 'review') AS reviews_count,
  COUNT(*) FILTER (WHERE ma.new_status = 'approved') AS approvals_count,
  COUNT(*) FILTER (WHERE ma.new_status = 'rejected') AS rejections_count,
  COUNT(*) FILTER (WHERE ma.new_status = 'escalated') AS escalations_count,
  COUNT(*) FILTER (WHERE ma.new_status = 'warn_user') AS warnings_count,
  MAX(ma.created_at) AS last_action_at
FROM moderation_actions ma
JOIN users u ON ma.moderator_id = u.id
WHERE ma.created_at > NOW() - INTERVAL '7 days'
GROUP BY ma.moderator_id, u.username;

-- ============================================================================
--  RLS POLICIES
--  ============================================================================

ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_moderation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_media_moderation ENABLE ROW LEVEL SECURITY;

-- Admins can view/modify queue
CREATE POLICY "Admins view moderation queue" ON moderation_queue
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins update moderation queue" ON moderation_queue
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Moderators can view/modify queue
CREATE POLICY "Moderators view queue" ON moderation_queue
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_moderator = true)
  );

CREATE POLICY "Moderators update queue" ON moderation_queue
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_moderator = true)
  );

-- Users can view their own moderation history
CREATE POLICY "Users view own mod history" ON user_moderation_history
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all mod history
CREATE POLICY "Admins view all mod history" ON user_moderation_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Logs are admin-only
CREATE POLICY "Admins view moderation logs" ON message_moderation_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins view media moderation" ON message_media_moderation
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================================
--  GRANT EXECUTE
-- ============================================================================

GRANT EXECUTE ON FUNCTION auto_queue_for_moderation TO authenticated;
GRANT EXECUTE ON FUNCTION queue_blocked_message TO authenticated;
GRANT EXECUTE ON FUNCTION record_moderation_action TO authenticated;

GRANT SELECT ON v_moderation_queue TO authenticated;
GRANT SELECT ON v_moderator_stats TO authenticated;

COMMENT ON TABLE moderation_queue IS 'Queue for human moderation of flagged content';
COMMENT ON TABLE moderation_actions IS 'Audit trail of all moderation actions';
COMMENT ON FUNCTION auto_queue_for_moderation IS 'Automatically queues content for human review when flagged';
