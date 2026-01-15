-- ============================================
-- Lovendo Payment System Enhancements
-- Migration: 20251229000001_payment_enhancements.sql
-- ============================================
--
-- Features:
-- 1. Saved Cards (PayTR Card Storage)
-- 2. Dispute System
-- 3. Payment Analytics
-- 4. Giver/Receiver Gamification
-- ============================================

-- ============================================
-- 1. SAVED CARDS (PayTR Tokenization)
-- ============================================

CREATE TABLE IF NOT EXISTS saved_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- PayTR token info
  paytr_utoken TEXT NOT NULL, -- User token from PayTR
  paytr_ctoken TEXT NOT NULL UNIQUE, -- Card token from PayTR

  -- Card display info (masked)
  card_last_four TEXT NOT NULL, -- Last 4 digits: "4532"
  card_brand TEXT NOT NULL, -- visa, mastercard, amex, troy
  card_bank TEXT, -- Issuing bank name
  card_family TEXT, -- bonus, world, maximum, axess, etc.

  -- Card holder
  card_holder_name TEXT NOT NULL,

  -- Usage
  is_default BOOLEAN DEFAULT FALSE,
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Verification
  is_verified BOOLEAN DEFAULT TRUE,
  require_cvv BOOLEAN DEFAULT FALSE, -- PayTR flag

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Card expiry (if known)

  CONSTRAINT unique_user_card UNIQUE (user_id, paytr_ctoken)
);

CREATE INDEX IF NOT EXISTS idx_saved_cards_user ON saved_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_cards_default ON saved_cards(user_id, is_default) WHERE is_default = TRUE;

-- Ensure only one default card per user
CREATE OR REPLACE FUNCTION ensure_single_default_card()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE saved_cards
    SET is_default = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_single_default_card ON saved_cards;
CREATE TRIGGER trg_ensure_single_default_card
  BEFORE INSERT OR UPDATE ON saved_cards
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION ensure_single_default_card();

-- ============================================
-- 2. DISPUTE SYSTEM
-- ============================================

DO $$ BEGIN
  CREATE TYPE dispute_status AS ENUM (
    'pending',           -- Just created
    'under_review',      -- Admin reviewing
    'awaiting_response', -- Waiting for other party
    'resolved_refund',   -- Resolved: full refund to giver
    'resolved_partial',  -- Resolved: partial refund
    'resolved_release',  -- Resolved: funds released to receiver
    'cancelled',         -- Dispute cancelled
    'expired'            -- No response, auto-resolved
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE dispute_reason AS ENUM (
    'proof_invalid',       -- Proof doesn't match moment
    'proof_fake',          -- Proof appears fabricated
    'proof_incomplete',    -- Proof missing required elements
    'experience_not_done', -- Experience wasn't completed
    'wrong_person',        -- Someone else did the experience
    'other'                -- Other reason
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS payment_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  escrow_id UUID REFERENCES escrow_transactions(id),
  commission_ledger_id UUID REFERENCES commission_ledger(id),
  gift_id UUID REFERENCES gifts(id),
  proof_id UUID,
  moment_id UUID REFERENCES moments(id),

  -- Parties
  giver_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),
  opened_by UUID NOT NULL REFERENCES users(id), -- Who opened the dispute

  -- Dispute details
  reason dispute_reason NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[], -- Screenshots, etc.

  -- Status
  status dispute_status NOT NULL DEFAULT 'pending',

  -- Response from other party
  response_text TEXT,
  response_evidence_urls TEXT[],
  response_at TIMESTAMPTZ,

  -- Resolution
  resolved_by UUID,
  resolution_notes TEXT,
  resolution_type TEXT, -- 'full_refund', 'partial_refund', 'release', 'no_action'
  refund_amount DECIMAL(10,2),
  resolved_at TIMESTAMPTZ,

  -- Deadlines
  response_deadline TIMESTAMPTZ, -- 48 hours to respond
  review_deadline TIMESTAMPTZ,   -- 72 hours for admin review

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disputes_status ON payment_disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_giver ON payment_disputes(giver_id);
CREATE INDEX IF NOT EXISTS idx_disputes_receiver ON payment_disputes(receiver_id);
CREATE INDEX IF NOT EXISTS idx_disputes_escrow ON payment_disputes(escrow_id);
CREATE INDEX IF NOT EXISTS idx_disputes_pending ON payment_disputes(created_at)
  WHERE status IN ('pending', 'under_review', 'awaiting_response');

-- Function to open a dispute
CREATE OR REPLACE FUNCTION open_dispute(
  p_user_id UUID,
  p_escrow_id UUID,
  p_reason dispute_reason,
  p_description TEXT,
  p_evidence_urls TEXT[] DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_escrow RECORD;
  v_dispute_id UUID;
BEGIN
  -- Get escrow details
  SELECT * INTO v_escrow
  FROM escrow_transactions
  WHERE id = p_escrow_id;

  IF v_escrow IS NULL THEN
    RAISE EXCEPTION 'Escrow transaction not found';
  END IF;

  -- Verify user is party to this escrow
  IF p_user_id NOT IN (v_escrow.sender_id, v_escrow.recipient_id) THEN
    RAISE EXCEPTION 'Not authorized to dispute this transaction';
  END IF;

  -- Can only dispute pending escrow
  IF v_escrow.status != 'pending' THEN
    RAISE EXCEPTION 'Can only dispute pending escrow transactions';
  END IF;

  -- Check for existing active dispute
  IF EXISTS (
    SELECT 1 FROM payment_disputes
    WHERE escrow_id = p_escrow_id
    AND status IN ('pending', 'under_review', 'awaiting_response')
  ) THEN
    RAISE EXCEPTION 'An active dispute already exists for this transaction';
  END IF;

  -- Create dispute
  INSERT INTO payment_disputes (
    escrow_id,
    moment_id,
    giver_id,
    receiver_id,
    opened_by,
    reason,
    description,
    evidence_urls,
    status,
    response_deadline,
    review_deadline
  ) VALUES (
    p_escrow_id,
    v_escrow.moment_id,
    v_escrow.sender_id,
    v_escrow.recipient_id,
    p_user_id,
    p_reason,
    p_description,
    p_evidence_urls,
    'awaiting_response',
    NOW() + INTERVAL '48 hours',
    NOW() + INTERVAL '120 hours' -- 5 days total
  )
  RETURNING id INTO v_dispute_id;

  -- Update escrow status
  UPDATE escrow_transactions
  SET status = 'disputed'
  WHERE id = p_escrow_id;

  -- Notify other party
  INSERT INTO notifications (
    user_id,
    type,
    title,
    body,
    data
  ) VALUES (
    CASE WHEN p_user_id = v_escrow.sender_id
         THEN v_escrow.recipient_id
         ELSE v_escrow.sender_id END,
    'dispute_opened',
    'İtiraz Açıldı ⚠️',
    'Bir işlem için itiraz açıldı. 48 saat içinde yanıt vermeniz gerekiyor.',
    jsonb_build_object(
      'dispute_id', v_dispute_id,
      'escrow_id', p_escrow_id,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'dispute_id', v_dispute_id,
    'response_deadline', NOW() + INTERVAL '48 hours'
  );
END;
$$;

-- Function to respond to dispute
CREATE OR REPLACE FUNCTION respond_to_dispute(
  p_user_id UUID,
  p_dispute_id UUID,
  p_response_text TEXT,
  p_evidence_urls TEXT[] DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_dispute RECORD;
BEGIN
  -- Get dispute
  SELECT * INTO v_dispute
  FROM payment_disputes
  WHERE id = p_dispute_id;

  IF v_dispute IS NULL THEN
    RAISE EXCEPTION 'Dispute not found';
  END IF;

  -- Verify user is the other party
  IF p_user_id = v_dispute.opened_by THEN
    RAISE EXCEPTION 'Cannot respond to your own dispute';
  END IF;

  IF p_user_id NOT IN (v_dispute.giver_id, v_dispute.receiver_id) THEN
    RAISE EXCEPTION 'Not authorized to respond to this dispute';
  END IF;

  IF v_dispute.status != 'awaiting_response' THEN
    RAISE EXCEPTION 'Dispute is not awaiting response';
  END IF;

  -- Update dispute with response
  UPDATE payment_disputes
  SET
    response_text = p_response_text,
    response_evidence_urls = p_evidence_urls,
    response_at = NOW(),
    status = 'under_review',
    updated_at = NOW()
  WHERE id = p_dispute_id;

  -- Notify opener
  INSERT INTO notifications (
    user_id,
    type,
    title,
    body,
    data
  ) VALUES (
    v_dispute.opened_by,
    'dispute_response',
    'İtiraz Yanıtlandı',
    'İtirazınız yanıtlandı. Admin incelemesi bekleniyor.',
    jsonb_build_object('dispute_id', p_dispute_id)
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', 'under_review'
  );
END;
$$;

-- ============================================
-- 3. PAYMENT ANALYTICS
-- ============================================

CREATE TABLE IF NOT EXISTS payment_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,

  -- Volume metrics
  total_transactions INTEGER DEFAULT 0,
  successful_transactions INTEGER DEFAULT 0,
  failed_transactions INTEGER DEFAULT 0,

  -- GMV (Gross Merchandise Value)
  total_gmv DECIMAL(12,2) DEFAULT 0,
  total_gmv_try DECIMAL(12,2) DEFAULT 0,
  total_gmv_usd DECIMAL(12,2) DEFAULT 0,
  total_gmv_eur DECIMAL(12,2) DEFAULT 0,

  -- Commission
  total_commission DECIMAL(12,2) DEFAULT 0,
  commission_from_givers DECIMAL(12,2) DEFAULT 0,
  commission_from_receivers DECIMAL(12,2) DEFAULT 0,

  -- VIP metrics
  vip_transactions INTEGER DEFAULT 0,
  vip_gmv DECIMAL(12,2) DEFAULT 0,

  -- Averages
  avg_transaction_amount DECIMAL(10,2) DEFAULT 0,
  avg_commission_rate DECIMAL(5,4) DEFAULT 0,

  -- Escrow metrics
  escrow_created INTEGER DEFAULT 0,
  escrow_released INTEGER DEFAULT 0,
  escrow_refunded INTEGER DEFAULT 0,
  escrow_disputed INTEGER DEFAULT 0,

  -- Timing
  avg_escrow_release_hours DECIMAL(6,2) DEFAULT 0,
  avg_proof_verification_hours DECIMAL(6,2) DEFAULT 0,

  -- Updated at
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON payment_analytics_daily(date DESC);

-- ============================================
-- 4. GAMIFICATION - BADGES & ACHIEVEMENTS
-- ============================================

DO $$ BEGIN
  CREATE TYPE badge_category AS ENUM (
    'giver',    -- For people who give gifts
    'receiver', -- For people who receive gifts
    'trust',    -- Trust-related
    'special'   -- Special achievements
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_tr TEXT NOT NULL,
  description TEXT NOT NULL,
  description_tr TEXT NOT NULL,
  category badge_category NOT NULL,
  icon TEXT NOT NULL, -- emoji or icon name
  color TEXT NOT NULL DEFAULT '#FFD700',

  -- Requirements
  requirement_type TEXT NOT NULL, -- 'gift_count', 'gift_amount', 'trust_score', etc.
  requirement_value INTEGER NOT NULL,

  -- Display
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed badges
INSERT INTO badges (slug, name, name_tr, description, description_tr, category, icon, requirement_type, requirement_value, sort_order) VALUES
  -- Giver badges
  ('first_gift', 'First Gift', 'İlk Hediye', 'Gave your first gift', 'İlk hediyeni verdin', 'giver', '🎁', 'gift_count', 1, 1),
  ('generous_5', 'Generous', 'Cömert', 'Gave 5 gifts', '5 hediye verdin', 'giver', '💝', 'gift_count', 5, 2),
  ('generous_25', 'Super Generous', 'Süper Cömert', 'Gave 25 gifts', '25 hediye verdin', 'giver', '🌟', 'gift_count', 25, 3),
  ('generous_100', 'Gift Master', 'Hediye Ustası', 'Gave 100 gifts', '100 hediye verdin', 'giver', '👑', 'gift_count', 100, 4),
  ('big_spender', 'Big Spender', 'Büyük Harcama', 'Spent over 500 on gifts', 'Hediyelere 500+ harcadın', 'giver', '💎', 'gift_amount', 500, 5),

  -- Receiver badges
  ('dream_starter', 'Dream Starter', 'Hayalci', 'Received your first gift', 'İlk hediyeni aldın', 'receiver', '✨', 'received_count', 1, 1),
  ('dream_achiever', 'Dream Achiever', 'Hayal Gerçekleştirici', 'Completed 5 experiences', '5 deneyim tamamladın', 'receiver', '🏆', 'completed_count', 5, 2),
  ('storyteller', 'Storyteller', 'Hikaye Anlatıcı', 'Uploaded 10 detailed proofs', '10 detaylı kanıt yükledin', 'receiver', '📖', 'proof_count', 10, 3),

  -- Trust badges
  ('trusted', 'Trusted Member', 'Güvenilir Üye', 'Reached 70 trust score', '70 güven puanına ulaştın', 'trust', '✅', 'trust_score', 70, 1),
  ('highly_trusted', 'Highly Trusted', 'Çok Güvenilir', 'Reached 90 trust score', '90 güven puanına ulaştın', 'trust', '🛡️', 'trust_score', 90, 2),

  -- Special badges
  ('early_adopter', 'Early Adopter', 'Erken Kullanıcı', 'Joined in 2024', '2024''te katıldın', 'special', '🚀', 'join_year', 2024, 1),
  ('vip', 'VIP Member', 'VIP Üye', 'VIP status', 'VIP statüsü', 'special', '⭐', 'is_vip', 1, 2)
ON CONFLICT (slug) DO NOTHING;

-- User badges (earned badges)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),

  -- Additional context
  context JSONB DEFAULT '{}'::jsonb,

  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned ON user_badges(earned_at DESC);

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_badge RECORD;
  v_value INTEGER;
  v_awarded_badges UUID[] := '{}';
  v_gifts_given INTEGER;
  v_total_gifted DECIMAL;
  v_gifts_received INTEGER;
  v_proofs_verified INTEGER;
  v_trust_score DECIMAL;
  v_join_year INTEGER;
  v_account_type TEXT;
BEGIN
  -- Get user stats
  SELECT COUNT(*) INTO v_gifts_given FROM gifts WHERE giver_id = p_user_id AND status = 'completed';
  SELECT COALESCE(SUM(amount), 0) INTO v_total_gifted FROM gifts WHERE giver_id = p_user_id AND status = 'completed';
  SELECT COUNT(*) INTO v_gifts_received FROM gifts WHERE receiver_id = p_user_id AND status = 'completed';
  SELECT COUNT(*) INTO v_proofs_verified FROM proofs WHERE user_id = p_user_id AND status = 'verified';
  SELECT trust_score INTO v_trust_score FROM profiles WHERE id = p_user_id;
  SELECT EXTRACT(YEAR FROM created_at) INTO v_join_year FROM users WHERE id = p_user_id;
  SELECT account_type INTO v_account_type FROM user_commission_settings WHERE user_id = p_user_id;

  -- Check each badge
  FOR v_badge IN
    SELECT * FROM badges WHERE is_active = TRUE
    AND id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = p_user_id)
  LOOP
    v_value := CASE v_badge.requirement_type
      WHEN 'gift_count' THEN v_gifts_given
      WHEN 'gift_amount' THEN v_total_gifted
      WHEN 'received_count' THEN v_gifts_received
      WHEN 'completed_count' THEN v_gifts_received
      WHEN 'proof_count' THEN v_proofs_verified
      WHEN 'trust_score' THEN v_trust_score
      WHEN 'join_year' THEN v_join_year
      WHEN 'is_vip' THEN CASE WHEN v_account_type IN ('vip', 'influencer') THEN 1 ELSE 0 END
      ELSE 0
    END;

    IF v_value >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;

      IF FOUND THEN
        v_awarded_badges := v_awarded_badges || v_badge.id;

        -- Notify user
        INSERT INTO notifications (user_id, type, title, body, data)
        VALUES (
          p_user_id,
          'badge_earned',
          'Yeni Rozet Kazandın! ' || v_badge.icon,
          v_badge.name_tr || ': ' || v_badge.description_tr,
          jsonb_build_object('badge_id', v_badge.id, 'badge_slug', v_badge.slug)
        );
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'awarded_badges', v_awarded_badges,
    'count', array_length(v_awarded_badges, 1)
  );
END;
$$;

-- ============================================
-- 5. USER PAYMENT STATS
-- ============================================

CREATE TABLE IF NOT EXISTS user_payment_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Giver stats
  total_gifts_given INTEGER DEFAULT 0,
  total_amount_gifted DECIMAL(12,2) DEFAULT 0,
  total_commission_paid DECIMAL(12,2) DEFAULT 0,
  avg_gift_amount DECIMAL(10,2) DEFAULT 0,
  last_gift_at TIMESTAMPTZ,

  -- Receiver stats
  total_gifts_received INTEGER DEFAULT 0,
  total_amount_received DECIMAL(12,2) DEFAULT 0,
  total_commission_deducted DECIMAL(12,2) DEFAULT 0,
  avg_receive_amount DECIMAL(10,2) DEFAULT 0,
  last_receive_at TIMESTAMPTZ,

  -- Trust impact
  successful_proofs INTEGER DEFAULT 0,
  disputed_transactions INTEGER DEFAULT 0,
  dispute_win_rate DECIMAL(5,2) DEFAULT 0,

  -- Escrow performance
  avg_proof_time_hours DECIMAL(6,2) DEFAULT 0,
  fast_release_count INTEGER DEFAULT 0,

  -- Updated
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. RLS POLICIES
-- ============================================

ALTER TABLE saved_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payment_stats ENABLE ROW LEVEL SECURITY;

-- Saved cards - users can only manage their own
CREATE POLICY "Users can view own saved cards"
  ON saved_cards FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own saved cards"
  ON saved_cards FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own saved cards"
  ON saved_cards FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Disputes - parties can view their own
CREATE POLICY "Users can view own disputes"
  ON payment_disputes FOR SELECT
  TO authenticated
  USING (auth.uid() IN (giver_id, receiver_id, opened_by));

CREATE POLICY "Users can insert disputes"
  ON payment_disputes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = opened_by);

-- Badges - public read
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- User badges - public view
CREATE POLICY "Anyone can view user badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (TRUE);

-- User payment stats - users can view own
CREATE POLICY "Users can view own payment stats"
  ON user_payment_stats FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- 7. GRANTS
-- ============================================

GRANT SELECT, INSERT, DELETE ON saved_cards TO authenticated;
GRANT SELECT, INSERT ON payment_disputes TO authenticated;
GRANT SELECT ON badges TO authenticated;
GRANT SELECT ON user_badges TO authenticated;
GRANT SELECT ON user_payment_stats TO authenticated;

GRANT EXECUTE ON FUNCTION open_dispute TO authenticated;
GRANT EXECUTE ON FUNCTION respond_to_dispute TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_award_badges TO authenticated;

-- ============================================
-- 8. COMMENTS
-- ============================================

COMMENT ON TABLE saved_cards IS 'Tokenized card storage via PayTR for quick payments';
COMMENT ON TABLE payment_disputes IS 'Dispute resolution system for escrow transactions';
COMMENT ON TABLE payment_analytics_daily IS 'Daily aggregated payment metrics';
COMMENT ON TABLE badges IS 'Gamification badges definitions';
COMMENT ON TABLE user_badges IS 'Badges earned by users';
COMMENT ON TABLE user_payment_stats IS 'Aggregated payment statistics per user';
