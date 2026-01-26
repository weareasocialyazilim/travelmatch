-- ============================================================================
// Messaging Eligibility State Machine
//
// States: closed → pending → eligible → active → guided_first → free_form
//
// Messaging never opens automatically - it requires meeting specific intent
// thresholds defined by the business logic of Lovendo's dating platform.
// ============================================================================

-- Messaging eligibility per conversation (tracks when messaging opens)
CREATE TABLE IF NOT EXISTS messaging_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- State machine: closed → pending → eligible → active
  state VARCHAR(20) NOT NULL DEFAULT 'closed' CHECK (
    state IN ('closed', 'pending', 'eligible', 'active', 'suspended')
  ),

  -- Eligibility criteria tracking
  eligibility_type VARCHAR(50), -- 'offer_acceptance', 'lvnd_threshold', 'moment_unlock'
  eligibility_criteria JSONB DEFAULT '{}',

  -- Thresholds
  lvnd_spent_cents INTEGER DEFAULT 0,
  offer_accepted_at TIMESTAMPTZ,
  moment_unlocked_at TIMESTAMPTZ,
  mutual_approval_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,

  -- Unique constraint: one eligibility record per user per conversation
  UNIQUE(conversation_id, user_id)
);

-- Index for fast lookups
CREATE INDEX idx_messaging_eligibility_conversation ON messaging_eligibility(conversation_id);
CREATE INDEX idx_messaging_eligibility_user ON messaging_eligibility(user_id);
CREATE INDEX idx_messaging_eligibility_state ON messaging_eligibility(state) WHERE state != 'closed';

-- First message guided state (tracks guided first message flow)
CREATE TABLE IF NOT EXISTS guided_first_message_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

  -- Flow state
  phase VARCHAR(20) NOT NULL DEFAULT 'prompt' CHECK (
    phase IN ('prompt', 'response', 'complete', 'skipped')
  ),
  prompt_variant VARCHAR(50), -- Which prompt was shown
  user_prompts JSONB DEFAULT '[]', -- Array of prompts shown to user
  user_responses JSONB DEFAULT '[]', -- User's responses

  -- Completion tracking
  first_message_sent_at TIMESTAMPTZ,
  completion_criteria JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One record per conversation
  UNIQUE(conversation_id)
);

-- Guided first message templates
CREATE TABLE IF NOT EXISTS guided_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL, -- 'offer', 'moment', 'general'
  prompt_text TEXT NOT NULL,
  context_requirements JSONB DEFAULT '{}', -- When this prompt applies
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default guided message templates
INSERT INTO guided_message_templates (template_key, category, prompt_text, context_requirements) VALUES
  -- Offer-based opening prompts
  ('offer_why_sent', 'offer', 'Neden bu teklifi gönderdin?', '{"eligibility_type": "offer_acceptance"}'),
  ('offer_expectations', 'offer', 'Bu teklif ile beklentilerin neler?', '{"eligibility_type": "offer_acceptance"}'),
  ('offer_what_like', 'offer', 'Bu kişide seni cezbeden ne oldu?', '{"eligibility_type": "offer_acceptance"}'),

  -- Moment-based opening prompts
  ('moment_why_shared', 'moment', 'Bu anı neden paylaştın?', '{"eligibility_type": "moment_unlock"}'),
  ('moment_feeling', 'moment', 'Bu anı paylaşırken ne hissettin?', '{"eligibility_type": "moment_unlock"}'),

  -- General prompts (LVND threshold or other)
  ('general_why_here', 'general', 'Lovendo\'da ne arıyorsun?', '{"eligibility_type": "lvnd_threshold"}'),
  ('general_introduce', 'general', 'Kendinden bahseder misin?', '{"eligibility_type": "lvnd_threshold"}'),
  ('general_what_seeking', 'general', 'Burada ne arıyorsun?', '{"eligibility_type": "lvnd_threshold"}')
ON CONFLICT (template_key) DO NOTHING;

-- ============================================================================
// STATE MACHINE FUNCTIONS
// ============================================================================

-- Check if messaging is eligible for a user in a conversation
CREATE OR REPLACE FUNCTION is_messaging_eligible(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_eligibility messaging_eligibility;
BEGIN
  SELECT * INTO v_eligibility
  FROM messaging_eligibility
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  RETURN v_eligibility.state IN ('eligible', 'active', 'suspended') = FALSE
         AND v_eligibility.state = 'active';
END;
$$;

-- Check if user can send first message (guided flow)
CREATE OR REPLACE FUNCTION can_send_first_message(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_state messaging_eligibility;
  v_guided guided_first_message_state;
BEGIN
  -- Must have active messaging eligibility
  SELECT * INTO v_state
  FROM messaging_eligibility
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id;

  IF NOT FOUND OR v_state.state != 'active' THEN
    RETURN FALSE;
  END IF;

  -- Check guided flow state
  SELECT * INTO v_guided
  FROM guided_first_message_state
  WHERE conversation_id = p_conversation_id;

  -- If no guided state exists, first message needs guidance
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Can send if guided flow is complete or not required
  RETURN v_guided.phase IN ('complete', 'skipped');
END;
$$;

-- Update messaging eligibility state
CREATE OR REPLACE FUNCTION update_messaging_state(
  p_conversation_id UUID,
  p_user_id UUID,
  p_new_state VARCHAR(20),
  p_eligibility_type VARCHAR(50) DEFAULT NULL,
  p_criteria JSONB DEFAULT '{}'::JSONB
)
RETURNS messaging_eligibility
LANGUAGE plpgsql
AS $$
DECLARE
  v_record messaging_eligibility;
BEGIN
  -- Upsert the eligibility record
  INSERT INTO messaging_eligibility (
    conversation_id, user_id, state, eligibility_type, eligibility_criteria,
    updated_at, activated_at
  )
  VALUES (
    p_conversation_id, p_user_id, p_new_state,
    p_eligibility_type, p_criteria,
    NOW(),
    CASE WHEN p_new_state = 'active' THEN NOW() ELSE NULL END
  )
  ON CONFLICT (conversation_id, user_id)
  DO UPDATE SET
    state = p_new_state,
    eligibility_type = COALESCE(p_eligibility_type, EXCLUDED.eligibility_type),
    eligibility_criteria = COALESCE(p_criteria, EXCLUDED.eligibility_criteria),
    updated_at = NOW(),
    activated_at = COALESCE(
      messaging_eligibility.activated_at,
      CASE WHEN p_new_state = 'active' THEN NOW() ELSE NULL END
    );

  SELECT * INTO v_record
  FROM messaging_eligibility
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id;

  RETURN v_record;
END;
$$;

-- ============================================================================
// ELIGIBILITY TRIGGER FUNCTIONS
// ============================================================================

-- Function to auto-create eligibility record when conversation is created
CREATE OR REPLACE FUNCTION handle_conversation_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create eligibility record for both participants (closed by default)
  INSERT INTO messaging_eligibility (conversation_id, user_id, state)
  VALUES (NEW.user_id, NEW.user_id, 'closed')
  ON CONFLICT (conversation_id, user_id) DO NOTHING;

  INSERT INTO messaging_eligibility (conversation_id, user_id, state)
  VALUES (NEW.user_id, NEW.recipient_id, 'closed')
  ON CONFLICT (conversation_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger to auto-create eligibility records
CREATE TRIGGER on_conversation_created
  AFTER INSERT ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION handle_conversation_created();

-- ============================================================================
// OFF-PLATFORM PREVENTION: Message type enforcement
// ============================================================================

-- Allowed message types enum
CREATE TYPE allowed_message_type AS ENUM (
  'text',
  'image',
  'short_video',  -- Max 15 seconds
  'emoji'
);

-- Forbidden message types (for reference/enforcement)
CREATE TYPE forbidden_message_type AS ENUM (
  'voice',
  'phone_call',
  'video_call',
  'screen_recording',
  'file_transfer',
  'external_link'
);

-- Function to validate message type is allowed
CREATE OR REPLACE FUNCTION is_message_type_allowed(p_type VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN p_type IN ('text', 'image', 'short_video', 'emoji');
END;
$$;

-- ============================================================================
// OFF-PLATFORM CONTACT DETECTION
// ============================================================================

-- Off-platform detection patterns
CREATE TABLE IF NOT EXISTS off_platform_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type VARCHAR(50) NOT NULL, -- 'phone', 'email', 'social', 'url'
  pattern_regex VARCHAR(500) NOT NULL,
  severity VARCHAR(20) DEFAULT 'block' CHECK (severity IN ('block', 'warn', 'log')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default patterns
INSERT INTO off_platform_patterns (pattern_type, pattern_regex, severity) VALUES
  -- Phone patterns (Turkey focus)
  ('phone', '\+?90?[5-7][0-9]{9}', 'block'),
  ('phone', '05[0-9]{2}[-\s]?[0-9]{3}[-\s]?[0-9]{4}', 'block'),
  ('phone', '\(?0[0-9]{3}\)?[-\s]?[0-9]{3}[-\s]?[0-9]{4}', 'block'),

  -- Email patterns
  ('email', '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', 'block'),

  -- Social media handles
  ('social', '@[a-zA-Z0-9_.]{3,30}', 'block'),
  ('social', 'instagram\.com/[a-zA-Z0-9_.]+', 'block'),
  ('social', 'twitter\.com/[a-zA-Z0-9_]+', 'block'),
  ('social', 'tiktok\.com/@[a-zA-Z0-9_.]+', 'block'),

  -- Messaging apps
  ('url', 't\.me/[a-zA-Z0-9_]+', 'block'),
  ('url', 'wa\.me/[0-9]+', 'block'),
  ('url', 'whatsapp\.com/[a-zA-Z0-9]+', 'block'),
  ('url', 'telegram\.me/[a-zA-Z0-9_]+', 'block'),

  -- Generic URLs (last resort)
  ('url', 'https?://[^\s]+', 'block'),
  ('url', 'www\.[^\s]+', 'block')
ON CONFLICT DO NOTHING;

-- Function to detect off-platform content
CREATE OR REPLACE FUNCTION detect_off_platform_content(p_content TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB := '{"detected": false, "matches": []}';
  v_match RECORD;
BEGIN
  FOR v_match IN
    SELECT pattern_type, pattern_regex
    FROM off_platform_patterns
    WHERE is_active = true
  LOOP
    IF p_content ~ v_match.pattern_regex THEN
      v_result := v_result || jsonb_build_object(
        'detected', true,
        'matches', v_result->'matches' || jsonb_build_array(
          jsonb_build_object(
            'type', v_match.pattern_type,
            'pattern', v_match.pattern_regex
          )
        )
      );
    END IF;
  END LOOP;

  RETURN v_result;
END;
$$;

-- ============================================================================
// MESSAGE CONTENT AUDIT LOG
// ============================================================================

CREATE TABLE IF NOT EXISTS message_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,

  -- Content analysis
  content_hash VARCHAR(64), -- SHA-256 of content
  off_platform_detected JSONB,
  moderation_result JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index for audit queries
  UNIQUE(message_id)
);

CREATE INDEX idx_message_audit_message ON message_audit_log(message_id);
CREATE INDEX idx_message_audit_conversation ON message_audit_log(conversation_id);
CREATE INDEX idx_message_audit_created ON message_audit_log(created_at DESC);

-- Function to log message content
CREATE OR REPLACE FUNCTION log_message_content(
  p_message_id UUID,
  p_conversation_id UUID,
  p_user_id UUID,
  p_content TEXT
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_off_platform JSONB;
  v_content_hash VARCHAR;
BEGIN
  -- Detect off-platform content
  v_off_platform := detect_off_platform_content(p_content);

  -- Calculate content hash
  v_content_hash := encode(digest(p_content::bytea, 'sha256'), 'hex');

  INSERT INTO message_audit_log (message_id, conversation_id, user_id, content_hash, off_platform_detected)
  VALUES (p_message_id, p_conversation_id, p_user_id, v_content_hash, v_off_platform);
END;
$$;

-- ============================================================================
// RLS POLICIES
// ============================================================================

ALTER TABLE messaging_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE guided_first_message_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE guided_message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE off_platform_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own eligibility
CREATE POLICY "Users view own messaging eligibility" ON messaging_eligibility
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own eligibility (via state machine function)
CREATE POLICY "Users update own messaging eligibility" ON messaging_eligibility
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view guided state for their conversations
CREATE POLICY "Users view guided state" ON guided_first_message_state
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = guided_first_message_state.conversation_id
      AND (user_id = auth.uid() OR recipient_id = auth.uid())
    )
  );

-- Users can view templates (read-only)
CREATE POLICY "Users view message templates" ON guided_message_templates
  FOR SELECT USING (is_active = true);

-- Admins can view all audit logs
CREATE POLICY "Admins view audit logs" ON message_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================================
// GRANT EXECUTE
// ============================================================================

GRANT EXECUTE ON FUNCTION is_messaging_eligible TO authenticated;
GRANT EXECUTE ON FUNCTION can_send_first_message TO authenticated;
GRANT EXECUTE ON FUNCTION update_messaging_state TO authenticated;
GRANT EXECUTE ON FUNCTION detect_off_platform_content TO authenticated;
GRANT EXECUTE ON FUNCTION log_message_content TO authenticated;

COMMENT ON TABLE messaging_eligibility IS 'Tracks messaging eligibility state per conversation - messaging never opens automatically';
COMMENT ON FUNCTION is_messaging_eligible IS 'Returns true if messaging is active for user in conversation';
COMMENT ON FUNCTION update_messaging_state IS 'Updates state machine state for messaging eligibility';
