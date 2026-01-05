-- ============================================
-- Max Contributors & Bulk Thank You System
-- TravelMatch - January 2026 Launch
-- ============================================

-- ============================================
-- 1. ADD MAX_CONTRIBUTORS COLUMNS TO MOMENTS
-- ============================================
ALTER TABLE moments
ADD COLUMN IF NOT EXISTS max_contributors INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS current_contributor_count INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN moments.max_contributors IS 'Maximum number of contributors allowed (NULL = unlimited, 3 for 100+ TL moments)';
COMMENT ON COLUMN moments.current_contributor_count IS 'Current number of unique contributors';

-- ============================================
-- 2. CONTRIBUTION VALIDATION FUNCTION
-- Enforces max 3 contributors for 100+ TL moments
-- ============================================
CREATE OR REPLACE FUNCTION validate_gift_contribution(
  p_moment_id UUID,
  p_giver_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_moment RECORD;
  v_current_count INTEGER;
  v_max_contributors INTEGER;
  v_is_existing_contributor BOOLEAN;
  v_caller_id UUID;
BEGIN
  v_caller_id := COALESCE(p_giver_id, auth.uid());

  -- Get moment
  SELECT * INTO v_moment FROM moments WHERE id = p_moment_id;

  IF v_moment IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'moment_not_found');
  END IF;

  -- Check if moment is still active
  IF v_moment.status != 'active' THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'moment_not_active');
  END IF;

  -- Determine max contributors based on price tier
  -- 100+ TL → max 3 contributors
  IF v_moment.price >= 100 THEN
    v_max_contributors := 3;
  ELSE
    v_max_contributors := NULL; -- Unlimited
  END IF;

  -- Count existing unique contributors (excluding refunded/cancelled)
  SELECT COUNT(DISTINCT giver_id) INTO v_current_count
  FROM gifts
  WHERE moment_id = p_moment_id
    AND status NOT IN ('refunded', 'cancelled');

  -- Check if caller is already a contributor
  SELECT EXISTS(
    SELECT 1 FROM gifts
    WHERE moment_id = p_moment_id
      AND giver_id = v_caller_id
      AND status NOT IN ('refunded', 'cancelled')
  ) INTO v_is_existing_contributor;

  -- If already a contributor, always allow (adding more to existing contribution)
  IF v_is_existing_contributor THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'reason', 'existing_contributor',
      'current_count', v_current_count,
      'max_allowed', v_max_contributors,
      'spots_remaining', CASE
        WHEN v_max_contributors IS NULL THEN NULL
        ELSE v_max_contributors - v_current_count
      END
    );
  END IF;

  -- Check if max contributors reached
  IF v_max_contributors IS NOT NULL AND v_current_count >= v_max_contributors THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'max_contributors_reached',
      'current_count', v_current_count,
      'max_allowed', v_max_contributors,
      'spots_remaining', 0
    );
  END IF;

  -- All checks passed
  RETURN jsonb_build_object(
    'allowed', true,
    'reason', 'new_contributor_allowed',
    'current_count', v_current_count,
    'max_allowed', v_max_contributors,
    'spots_remaining', CASE
      WHEN v_max_contributors IS NULL THEN NULL
      ELSE v_max_contributors - v_current_count
    END
  );
END;
$$;

-- ============================================
-- 3. UPDATE CONTRIBUTOR COUNT TRIGGER
-- Keeps current_contributor_count in sync
-- ============================================
CREATE OR REPLACE FUNCTION update_moment_contributor_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_moment_id UUID;
  v_new_count INTEGER;
BEGIN
  -- Get the moment_id from either NEW or OLD record
  v_moment_id := COALESCE(NEW.moment_id, OLD.moment_id);

  IF v_moment_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Calculate new count
  SELECT COUNT(DISTINCT giver_id) INTO v_new_count
  FROM gifts
  WHERE moment_id = v_moment_id
    AND status NOT IN ('refunded', 'cancelled');

  -- Update moment
  UPDATE moments
  SET current_contributor_count = v_new_count
  WHERE id = v_moment_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trg_update_contributor_count ON gifts;
CREATE TRIGGER trg_update_contributor_count
AFTER INSERT OR UPDATE OR DELETE ON gifts
FOR EACH ROW
EXECUTE FUNCTION update_moment_contributor_count();

-- ============================================
-- 4. BULK THANK YOU FUNCTION
-- Send thank you to all contributors at once
-- ============================================
CREATE OR REPLACE FUNCTION send_bulk_thank_you(
  p_moment_id UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_receiver_id UUID;
  v_moment RECORD;
  v_giver RECORD;
  v_count INTEGER := 0;
  v_default_message TEXT := 'Hediyeniz için çok teşekkürler! 💜';
  v_final_message TEXT;
BEGIN
  v_receiver_id := auth.uid();

  -- Validate message length if provided
  IF p_message IS NOT NULL AND char_length(p_message) > 280 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'message_too_long',
      'max_length', 280
    );
  END IF;

  v_final_message := COALESCE(NULLIF(TRIM(p_message), ''), v_default_message);

  -- Get moment and verify ownership
  SELECT * INTO v_moment FROM moments WHERE id = p_moment_id;

  IF v_moment IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'moment_not_found');
  END IF;

  IF v_moment.creator_id != v_receiver_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_moment_owner');
  END IF;

  -- Get all unique givers for this moment (completed gifts only)
  FOR v_giver IN
    SELECT DISTINCT
      g.giver_id,
      g.id as gift_id,
      g.amount,
      u.full_name as giver_name
    FROM gifts g
    JOIN users u ON u.id = g.giver_id
    WHERE g.moment_id = p_moment_id
      AND g.receiver_id = v_receiver_id
      AND g.status = 'completed'
  LOOP
    -- Check if already thanked (prevent duplicate notifications)
    IF NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE user_id = v_giver.giver_id
        AND type = 'thank_you_received'
        AND data->>'momentId' = p_moment_id::TEXT
        AND data->>'senderId' = v_receiver_id::TEXT
        AND created_at > NOW() - INTERVAL '24 hours'
    ) THEN
      -- Create notification for each giver
      INSERT INTO notifications (
        user_id,
        type,
        title,
        body,
        data,
        read
      ) VALUES (
        v_giver.giver_id,
        'thank_you_received',
        'Teşekkür aldın! 💜',
        v_final_message,
        jsonb_build_object(
          'momentId', p_moment_id,
          'momentTitle', v_moment.title,
          'senderId', v_receiver_id,
          'giftId', v_giver.gift_id,
          'amount', v_giver.amount
        ),
        false
      );

      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'recipients_count', v_count,
    'message_sent', v_final_message
  );
END;
$$;

-- ============================================
-- 5. GET MOMENT CONTRIBUTORS FUNCTION
-- Returns list of contributors for a moment
-- ============================================
CREATE OR REPLACE FUNCTION get_moment_contributors(
  p_moment_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_moment RECORD;
  v_contributors JSONB;
  v_max_contributors INTEGER;
BEGIN
  -- Get moment
  SELECT * INTO v_moment FROM moments WHERE id = p_moment_id;

  IF v_moment IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'moment_not_found');
  END IF;

  -- Determine max contributors
  IF v_moment.price >= 100 THEN
    v_max_contributors := 3;
  ELSE
    v_max_contributors := NULL;
  END IF;

  -- Get contributors
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'userId', g.giver_id,
      'name', u.full_name,
      'avatar', u.avatar_url,
      'amount', SUM(g.amount),
      'isAnonymous', BOOL_OR(g.is_anonymous),
      'lastContributedAt', MAX(g.created_at)
    )
  ), '[]'::jsonb) INTO v_contributors
  FROM (
    SELECT DISTINCT ON (giver_id) *
    FROM gifts
    WHERE moment_id = p_moment_id
      AND status NOT IN ('refunded', 'cancelled')
    ORDER BY giver_id, created_at DESC
  ) g
  JOIN users u ON u.id = g.giver_id
  GROUP BY g.giver_id, u.full_name, u.avatar_url;

  RETURN jsonb_build_object(
    'success', true,
    'momentId', p_moment_id,
    'momentTitle', v_moment.title,
    'momentPrice', v_moment.price,
    'maxContributors', v_max_contributors,
    'currentCount', jsonb_array_length(v_contributors),
    'slotsRemaining', CASE
      WHEN v_max_contributors IS NULL THEN NULL
      ELSE GREATEST(0, v_max_contributors - jsonb_array_length(v_contributors))
    END,
    'contributors', v_contributors
  );
END;
$$;

-- ============================================
-- 6. ESCROW AUTO-RESOLVE FUNCTIONS
-- Separate functions for auto-release and auto-refund
-- ============================================

-- Auto-release: Proof submitted but not approved in 72 hours
CREATE OR REPLACE FUNCTION auto_release_pending_escrows()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_escrow RECORD;
  v_count INTEGER := 0;
  v_released_ids UUID[] := '{}';
BEGIN
  -- Find escrows with proof but no approval in 72 hours
  FOR v_escrow IN
    SELECT id, receiver_id, amount
    FROM escrow_transactions
    WHERE status = 'pending'
      AND proof_submitted = TRUE
      AND proof_verification_date < NOW() - INTERVAL '72 hours'
  LOOP
    -- Release escrow to receiver
    UPDATE escrow_transactions
    SET
      status = 'released',
      released_at = NOW(),
      release_reason = 'auto_release_72h_timeout'
    WHERE id = v_escrow.id;

    -- Credit receiver's wallet
    UPDATE wallets
    SET
      balance = balance + v_escrow.amount,
      updated_at = NOW()
    WHERE user_id = v_escrow.receiver_id;

    -- Create transaction record
    INSERT INTO transactions (
      user_id,
      type,
      amount,
      status,
      description,
      metadata
    ) VALUES (
      v_escrow.receiver_id,
      'escrow_release',
      v_escrow.amount,
      'completed',
      'Otomatik onay (72 saat zaman aşımı)',
      jsonb_build_object('escrow_id', v_escrow.id, 'auto_release', true)
    );

    -- Send notification
    INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      data
    ) VALUES (
      v_escrow.receiver_id,
      'escrow_auto_released',
      'Ödeme onaylandı! ✅',
      'Hediye ödemesi otomatik olarak hesabınıza aktarıldı.',
      jsonb_build_object('escrow_id', v_escrow.id, 'amount', v_escrow.amount)
    );

    v_released_ids := array_append(v_released_ids, v_escrow.id);
    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'action', 'auto_release',
    'count', v_count,
    'escrow_ids', to_jsonb(v_released_ids)
  );
END;
$$;

-- Auto-refund: No proof in 7 days
CREATE OR REPLACE FUNCTION auto_refund_expired_escrows()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_escrow RECORD;
  v_count INTEGER := 0;
  v_refunded_ids UUID[] := '{}';
BEGIN
  -- Find escrows expired without proof
  FOR v_escrow IN
    SELECT id, sender_id, receiver_id, amount
    FROM escrow_transactions
    WHERE status = 'pending'
      AND proof_submitted = FALSE
      AND expires_at < NOW()
  LOOP
    -- Refund escrow to sender
    UPDATE escrow_transactions
    SET
      status = 'refunded',
      refunded_at = NOW(),
      refund_reason = 'auto_refund_no_proof'
    WHERE id = v_escrow.id;

    -- Credit sender's wallet
    UPDATE wallets
    SET
      balance = balance + v_escrow.amount,
      updated_at = NOW()
    WHERE user_id = v_escrow.sender_id;

    -- Create transaction record
    INSERT INTO transactions (
      user_id,
      type,
      amount,
      status,
      description,
      metadata
    ) VALUES (
      v_escrow.sender_id,
      'escrow_refund',
      v_escrow.amount,
      'completed',
      'Otomatik iade (kanıt yüklenmedi)',
      jsonb_build_object('escrow_id', v_escrow.id, 'auto_refund', true)
    );

    -- Notify sender
    INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      data
    ) VALUES (
      v_escrow.sender_id,
      'escrow_auto_refunded',
      'Ödeme iade edildi 💸',
      'Alıcı 7 gün içinde kanıt yüklemedi, ödemeniz iade edildi.',
      jsonb_build_object('escrow_id', v_escrow.id, 'amount', v_escrow.amount)
    );

    -- Notify receiver
    INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      data
    ) VALUES (
      v_escrow.receiver_id,
      'escrow_expired',
      'Hediye süresi doldu ⏰',
      'Kanıt yüklemediğiniz için hediye iade edildi.',
      jsonb_build_object('escrow_id', v_escrow.id, 'amount', v_escrow.amount)
    );

    v_refunded_ids := array_append(v_refunded_ids, v_escrow.id);
    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'action', 'auto_refund',
    'count', v_count,
    'escrow_ids', to_jsonb(v_refunded_ids)
  );
END;
$$;

-- ============================================
-- 7. CRON JOB FOR AUTO-RESOLVE (if pg_cron is available)
-- Run every 4 hours
-- ============================================
-- Note: Execute this separately if pg_cron is installed
-- SELECT cron.schedule('escrow-auto-release', '0 */4 * * *', 'SELECT auto_release_pending_escrows()');
-- SELECT cron.schedule('escrow-auto-refund', '0 */4 * * *', 'SELECT auto_refund_expired_escrows()');

-- ============================================
-- SUMMARY
-- ============================================
-- Functions created:
-- 1. validate_gift_contribution(moment_id, giver_id) - Check if contribution allowed
-- 2. update_moment_contributor_count() - Trigger to sync count
-- 3. send_bulk_thank_you(moment_id, message) - Thank all contributors
-- 4. get_moment_contributors(moment_id) - List contributors with slots info
-- 5. auto_release_pending_escrows() - Auto-approve after 72h
-- 6. auto_refund_expired_escrows() - Auto-refund after 7 days no proof
