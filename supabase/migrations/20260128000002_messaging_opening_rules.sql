-- ============================================================================
--  Message Opening Rules and Thresholds
-- 
--  Defines exact conditions under which messaging becomes available.
--  Messaging is an EARNED REWARD, never automatic.
--  ============================================================================

-- ============================================================================
--  THRESHOLD CONFIGURATION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS messaging_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threshold_key VARCHAR(100) NOT NULL UNIQUE,
  threshold_type VARCHAR(50) NOT NULL, -- 'lvnd_spent', 'offer_value', 'moment_type'
  threshold_value DECIMAL NOT NULL,
  threshold_unit VARCHAR(20) DEFAULT 'cents',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default threshold configurations
INSERT INTO messaging_thresholds (threshold_key, threshold_type, threshold_value, threshold_unit, description) VALUES
  -- LVND spending thresholds (in cents)
  ('lvnd_basic', 'lvnd_spent', 5000, 'cents', 'Basic messaging: 50 LVND spent'),
  ('lvnd_standard', 'lvnd_spent', 10000, 'cents', 'Standard messaging: 100 LVND spent'),
  ('lvnd_premium', 'lvnd_spent', 25000, 'cents', 'Premium messaging: 250 LVND spent'),

  -- Offer value thresholds (in cents)
  ('offer_basic', 'offer_value', 1000, 'cents', 'Any accepted offer unlocks messaging'),
  ('offer_premium', 'offer_value', 5000, 'cents', 'Premium offer unlocks extended features'),

  -- Moment unlock thresholds
  ('moment_premium', 'moment_type', 1, 'count', 'Premium moment unlock grants messaging'),
  ('moment_mutual', 'moment_type', 2, 'count', 'Mutual moment exchange grants messaging')
ON CONFLICT (threshold_key) DO NOTHING;

-- ============================================================================
--  OFFERING ELIGIBILITY RULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS offering_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(100) NOT NULL UNIQUE,
  offer_type VARCHAR(50) NOT NULL,
  min_lvnd_cents DECIMAL NOT NULL DEFAULT 0,
  grants_messaging BOOLEAN DEFAULT FALSE,
  messaging_delay_hours INTEGER DEFAULT 0, -- Optional delay after acceptance
  requires_response BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default offering rules
INSERT INTO offering_rules (rule_name, offer_type, min_lvnd_cents, grants_messaging, messaging_delay_hours, requires_response) VALUES
  ('gift_basic', 'gift', 1000, TRUE, 0, FALSE),
  ('gift_premium', 'gift', 5000, TRUE, 0, TRUE),
  ('date_invite', 'date', 2000, TRUE, 0, TRUE),
  ('moment_share', 'moment', 0, FALSE, 0, FALSE),
  ('super_like', 'super_like', 0, TRUE, 0, FALSE)
ON CONFLICT (rule_name) DO NOTHING;

-- ============================================================================
--  MUTUAL APPROVAL RULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS mutual_approval_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) NOT NULL UNIQUE,
  approval_type VARCHAR(50) NOT NULL, -- 'moment', 'gesture', 'offer'
  required_approvals INTEGER DEFAULT 2, -- Both must approve
  grants_messaging BOOLEAN DEFAULT TRUE,
  requires_guided_first_message BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO mutual_approval_config (config_key, approval_type, required_approvals, grants_messaging, requires_guided_first_message) VALUES
  ('moment_mutual_approval', 'moment', 2, TRUE, TRUE),
  ('gesture_mutual_approval', 'gesture', 2, TRUE, TRUE),
  ('offer_mutual_acceptance', 'offer', 2, TRUE, FALSE)
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================================
--  STATE TRANSITION LOG
--  ============================================================================

CREATE TABLE IF NOT EXISTS messaging_state_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  from_state VARCHAR(20),
  to_state VARCHAR(20) NOT NULL,
  transition_reason VARCHAR(100), -- Why the transition happened
  criteria_met JSONB DEFAULT '{}', -- Which criteria were met
  lvnd_amount DECIMAL, -- LVND involved in this transition
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_state_log_conversation ON messaging_state_log(conversation_id);
CREATE INDEX idx_state_log_user ON messaging_state_log(user_id);
CREATE INDEX idx_state_log_created ON messaging_state_log(created_at DESC);

-- ============================================================================
--  THRESHOLD CHECK FUNCTIONS
-- ============================================================================

-- Check LVND spending threshold
CREATE OR REPLACE FUNCTION check_lvnd_threshold(
  p_user_id UUID,
  p_threshold_key VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_threshold messaging_thresholds;
  v_spent DECIMAL;
BEGIN
  SELECT * INTO v_threshold
  FROM messaging_thresholds
  WHERE threshold_key = p_threshold_key AND is_active = true;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Calculate total LVND spent by user
  SELECT COALESCE(SUM(amount_cents), 0) INTO v_spent
  FROM transactions
  WHERE user_id = p_user_id
  AND transaction_type = 'spend'
  AND status = 'completed';

  RETURN v_spent >= v_threshold.threshold_value;
END;
$$;

-- Check offer acceptance triggers messaging
CREATE OR REPLACE FUNCTION check_offer_messaging_eligibility(
  p_offer_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_offer offers;
  v_rule offering_rules;
BEGIN
  SELECT * INTO v_offer FROM offers WHERE id = p_offer_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  SELECT * INTO v_rule
  FROM offering_rules
  WHERE offer_type = v_offer.offer_type AND is_active = true
  ORDER BY min_lvnd_cents DESC
  LIMIT 1;

  IF NOT FOUND OR NOT v_rule.grants_messaging THEN
    RETURN FALSE;
  END IF;

  RETURN v_offer.amount_cents >= v_rule.min_lvnd_cents;
END;
$$;

-- ============================================================================
--  MAIN ELIGIBILITY EVALUATION FUNCTION
--  ============================================================================

-- Evaluate all eligibility criteria for a conversation
CREATE OR REPLACE FUNCTION evaluate_messaging_eligibility(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB := '{"eligible": false, "reasons": [], "criteria": {}}';
  v_criteria JSONB := '{}';
  v_offer RECORD;
  v_moment RECORD;
  v_lvnd_spent DECIMAL;
  v_count INTEGER;
BEGIN
  -- Check 1: LVND Threshold
  SELECT COALESCE(SUM(amount_cents), 0) INTO v_lvnd_spent
  FROM transactions
  WHERE user_id = p_user_id
  AND transaction_type = 'spend'
  AND status = 'completed';

  v_criteria := v_criteria || jsonb_build_object(
    'lvnd_spent',
    jsonb_build_object(
      'value', v_lvnd_spent,
      'required', 5000,
      'meets', v_lvnd_spent >= 5000
    )
  );

  IF v_lvnd_spent >= 5000 THEN
    v_result := jsonb_set(v_result, '{criteria, lvnd_spent, meets}', 'true'::JSONB);
  END IF;

  -- Check 2: Accepted Offer
  SELECT o.* INTO v_offer
  FROM offers o
  JOIN conversations c ON (
    (c.user_id = p_user_id AND o.sender_id = p_user_id) OR
    (c.recipient_id = p_user_id AND o.sender_id = p_user_id)
  )
  JOIN conversations conv ON conv.id = p_conversation_id
  WHERE o.conversation_id = p_conversation_id
  AND o.status = 'accepted'
  ORDER BY o.created_at DESC
  LIMIT 1;

  IF v_offer.id IS NOT NULL THEN
    v_criteria := v_criteria || jsonb_build_object(
      'accepted_offer',
      jsonb_build_object(
        'offer_id', v_offer.id,
        'amount', v_offer.amount_cents,
        'meets', TRUE
      )
    );
  ELSE
    v_criteria := v_criteria || jsonb_build_object(
      'accepted_offer',
      jsonb_build_object('meets', FALSE)
    );
  END IF;

  -- Check 3: Moment Unlock (both users must share moments)
  SELECT COUNT(*) INTO v_count
  FROM moments
  WHERE conversation_id = p_conversation_id
  AND is_shared = true
  AND (sender_id = p_user_id OR recipient_id = p_user_id);

  v_criteria := v_criteria || jsonb_build_object(
    'moment_unlock',
    jsonb_build_object('count', v_count, 'required', 1, 'meets', v_count >= 1)
  );

  -- Check 4: Mutual Approval
  SELECT COUNT(*) INTO v_count
  FROM moment_approvals
  WHERE conversation_id = p_conversation_id
  AND approved = true;

  v_criteria := v_criteria || jsonb_build_object(
    'mutual_approval',
    jsonb_build_object('count', v_count, 'required', 2, 'meets', v_count >= 2)
  );

  v_result := jsonb_set(v_result, '{criteria}', v_criteria);

  -- Determine overall eligibility: ANY of these conditions met
  -- 1. LVND >= 5000 OR
  -- 2. Accepted offer exists OR
  -- 3. Moment shared AND mutual approval
  IF v_lvnd_spent >= 5000 OR v_offer.id IS NOT NULL OR (v_count >= 1 AND v_count >= 2) THEN
    v_result := jsonb_set(v_result, '{eligible}', 'true'::JSONB);

    IF v_offer.id IS NOT NULL THEN
      v_result := jsonb_set(v_result, '{reasons}', '["offer_accepted"]'::JSONB);
    ELSIF v_lvnd_spent >= 5000 THEN
      v_result := jsonb_set(v_result, '{reasons}', '["lvnd_threshold"]'::JSONB);
    ELSE
      v_result := jsonb_set(v_result, '{reasons}', '["moment_unlock"]'::JSONB);
    END IF;
  END IF;

  RETURN v_result;
END;
$$;

-- ============================================================================
--  TRIGGER: Auto-evaluate eligibility on relevant events
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_evaluate_messaging_eligibility()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_eligibility JSONB;
  v_conv conversations;
  v_current_state messaging_eligibility;
BEGIN
  -- Get conversation
  SELECT * INTO v_conv
  FROM conversations
  WHERE id = COALESCE(NEW.conversation_id, OLD.conversation_id);

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Evaluate for both participants
  FOR v_current_state IN
    SELECT * FROM messaging_eligibility
    WHERE conversation_id = v_conv.id
  LOOP
    v_eligibility := evaluate_messaging_eligibility(v_conv.id, v_current_state.user_id);

    IF (v_eligibility->>'eligible')::BOOLEAN
       AND v_current_state.state = 'closed' THEN
      -- Transition to eligible
      PERFORM update_messaging_state(
        v_conv.id,
        v_current_state.user_id,
        'eligible',
        (v_eligibility->'reasons'->>0)::VARCHAR,
        v_eligibility->'criteria'
      );

      -- Log transition
      INSERT INTO messaging_state_log (
        conversation_id, user_id, from_state, to_state,
        transition_reason, criteria_met
      ) VALUES (
        v_conv.id, v_current_state.user_id, 'closed', 'eligible',
        v_eligibility->'reasons'->>0,
        v_eligibility->'criteria'
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create triggers for auto-evaluation
CREATE TRIGGER on_offer_accepted_messaging
  AFTER UPDATE ON offers
  FOR EACH ROW
  WHEN (NEW.status = 'accepted' AND OLD.status != 'accepted')
  EXECUTE FUNCTION auto_evaluate_messaging_eligibility();

CREATE TRIGGER on_moment_shared_messaging
  AFTER UPDATE ON moments
  FOR EACH ROW
  WHEN (NEW.is_shared = true AND OLD.is_shared = false)
  EXECUTE FUNCTION auto_evaluate_messaging_eligibility();

CREATE TRIGGER on_moment_approval_messaging
  AFTER UPDATE ON moment_approvals
  FOR EACH ROW
  WHEN (NEW.approved = true AND OLD.approved = false)
  EXECUTE FUNCTION auto_evaluate_messaging_eligibility();

-- ============================================================================
--  RLS POLICIES
-- ============================================================================

ALTER TABLE messaging_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE offering_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutual_approval_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_state_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view thresholds" ON messaging_thresholds
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users view offering rules" ON offering_rules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users view approval config" ON mutual_approval_config
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users view own state log" ON messaging_state_log
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
--  GRANT EXECUTE
-- ============================================================================

GRANT EXECUTE ON FUNCTION check_lvnd_threshold TO authenticated;
GRANT EXECUTE ON FUNCTION check_offer_messaging_eligibility TO authenticated;
GRANT EXECUTE ON FUNCTION evaluate_messaging_eligibility TO authenticated;
GRANT EXECUTE ON FUNCTION update_messaging_state TO authenticated;

COMMENT ON TABLE messaging_thresholds IS 'Configurable thresholds for when messaging opens';
COMMENT ON FUNCTION evaluate_messaging_eligibility IS 'Evaluates all criteria and returns eligibility status';
