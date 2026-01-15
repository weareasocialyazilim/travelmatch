-- ============================================
-- Lovendo Dynamic Proof Requirements
-- Migration: 20251229000003_dynamic_proof_system.sql
-- ============================================
--
-- Proof Gereksinimleri:
-- $0-30: Direct Pay (proof yok, anında transfer)
-- $30-100: Opsiyonel (giver isterse proof gerekli)
-- $100+: Zorunlu (her zaman proof gerekli)
-- ============================================

-- ============================================
-- 1. PROOF REQUIREMENT TIERS
-- ============================================

DO $$ BEGIN
  CREATE TYPE proof_requirement_type AS ENUM (
    'none',      -- Direct pay, proof gerekmez
    'optional',  -- Giver seçebilir
    'required'   -- Her zaman gerekli
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS proof_requirement_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  min_amount DECIMAL(10,2) NOT NULL,
  max_amount DECIMAL(10,2), -- NULL = sınırsız
  requirement proof_requirement_type NOT NULL,

  -- Transfer timing
  transfer_delay_hours INTEGER DEFAULT 0, -- Direct pay için 0

  -- Açıklama
  description_tr TEXT,
  description_en TEXT,

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tiers
INSERT INTO proof_requirement_tiers (name, min_amount, max_amount, requirement, transfer_delay_hours, description_tr, description_en) VALUES
  ('direct', 0, 30, 'none', 0,
   'Küçük tutarlı hediyeler anında alıcıya ulaşır.',
   'Small gifts are transferred instantly.'),
  ('optional', 30, 100, 'optional', 24,
   'Orta tutarlı hediyeler için kanıt talep edebilirsiniz.',
   'You can request proof for medium-sized gifts.'),
  ('required', 100, NULL, 'required', 0,
   'Büyük tutarlı hediyeler için kanıt zorunludur.',
   'Proof is required for large gifts.')
ON CONFLICT (name) DO UPDATE SET
  min_amount = EXCLUDED.min_amount,
  max_amount = EXCLUDED.max_amount,
  requirement = EXCLUDED.requirement,
  transfer_delay_hours = EXCLUDED.transfer_delay_hours,
  description_tr = EXCLUDED.description_tr,
  description_en = EXCLUDED.description_en;

-- ============================================
-- 2. UPDATE GIFTS TABLE (add proof columns if not exists)
-- ============================================

DO $$
BEGIN
  -- Add proof_requirement column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifts' AND column_name = 'proof_requirement') THEN
    ALTER TABLE gifts ADD COLUMN proof_requirement TEXT DEFAULT 'required';
  END IF;

  -- Add proof_requested_by_giver column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifts' AND column_name = 'proof_requested_by_giver') THEN
    ALTER TABLE gifts ADD COLUMN proof_requested_by_giver BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add is_direct_pay column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifts' AND column_name = 'is_direct_pay') THEN
    ALTER TABLE gifts ADD COLUMN is_direct_pay BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add direct_pay_transferred_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifts' AND column_name = 'direct_pay_transferred_at') THEN
    ALTER TABLE gifts ADD COLUMN direct_pay_transferred_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================
-- 3. DETERMINE PROOF REQUIREMENT FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_proof_requirement(p_amount DECIMAL)
RETURNS TABLE (
  requirement proof_requirement_type,
  tier_name TEXT,
  transfer_delay_hours INTEGER,
  description_tr TEXT,
  description_en TEXT,
  is_direct_pay BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.requirement,
    t.name,
    t.transfer_delay_hours,
    t.description_tr,
    t.description_en,
    (t.requirement = 'none') AS is_direct_pay
  FROM proof_requirement_tiers t
  WHERE t.is_active = TRUE
    AND p_amount >= t.min_amount
    AND (t.max_amount IS NULL OR p_amount < t.max_amount)
  LIMIT 1;
END;
$$;

-- ============================================
-- 4. CREATE GIFT WITH DYNAMIC PROOF
-- ============================================

CREATE OR REPLACE FUNCTION create_gift_with_proof_requirement(
  p_giver_id UUID,
  p_receiver_id UUID,
  p_moment_id UUID,
  p_base_amount DECIMAL,
  p_currency TEXT DEFAULT 'TRY',
  p_giver_requests_proof BOOLEAN DEFAULT FALSE -- Giver'ın seçimi (optional tier için)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_gift_id UUID;
  v_escrow_id UUID;
  v_tier RECORD;
  v_commission RECORD;
  v_proof_req TEXT;
  v_is_direct_pay BOOLEAN;
  v_escrow_hours INTEGER;
BEGIN
  -- 1. Get proof requirement tier
  SELECT * INTO v_tier
  FROM get_proof_requirement(p_base_amount);

  IF v_tier IS NULL THEN
    RAISE EXCEPTION 'No matching proof tier found for amount %', p_base_amount;
  END IF;

  -- 2. Determine final proof requirement
  IF v_tier.requirement::TEXT = 'optional' THEN
    -- Giver's choice
    IF p_giver_requests_proof THEN
      v_proof_req := 'required';
      v_is_direct_pay := FALSE;
    ELSE
      v_proof_req := 'none';
      v_is_direct_pay := TRUE;
    END IF;
  ELSE
    v_proof_req := v_tier.requirement::TEXT;
    v_is_direct_pay := (v_tier.requirement::TEXT = 'none');
  END IF;

  -- 3. Get commission
  SELECT * INTO v_commission
  FROM calculate_commission(p_base_amount, p_receiver_id, p_currency);

  -- 4. Create gift record
  INSERT INTO gifts (
    giver_id,
    receiver_id,
    moment_id,
    amount,
    currency,
    status,
    proof_requirement,
    proof_requested_by_giver,
    is_direct_pay
  ) VALUES (
    p_giver_id,
    p_receiver_id,
    p_moment_id,
    p_base_amount,
    p_currency,
    CASE WHEN v_is_direct_pay THEN 'completed' ELSE 'pending' END,
    v_proof_req,
    p_giver_requests_proof,
    v_is_direct_pay
  )
  RETURNING id INTO v_gift_id;

  -- 5. Handle based on proof requirement
  IF v_is_direct_pay THEN
    -- Direct pay: No escrow, mark for immediate transfer
    UPDATE gifts
    SET
      direct_pay_transferred_at = NOW(),
      completed_at = NOW()
    WHERE id = v_gift_id;

    -- Create commission ledger for tracking
    INSERT INTO commission_ledger (
      giver_id,
      receiver_id,
      moment_id,
      gift_id,
      base_amount,
      currency,
      tier_name,
      total_rate,
      total_commission,
      giver_commission,
      receiver_commission,
      platform_revenue,
      giver_pays,
      receiver_gets,
      receiver_account_type,
      was_vip_transaction,
      status,
      is_direct_pay
    ) VALUES (
      p_giver_id,
      p_receiver_id,
      p_moment_id,
      v_gift_id,
      p_base_amount,
      p_currency,
      v_commission.tier_name,
      v_commission.total_rate,
      v_commission.total_commission,
      v_commission.giver_commission,
      v_commission.receiver_commission,
      v_commission.total_commission,
      v_commission.giver_pays,
      v_commission.receiver_gets,
      'standard',
      v_commission.is_vip,
      'pending', -- Will be updated to 'transferred' after PayTR callback
      TRUE
    );

  ELSE
    -- Proof required: Create escrow
    v_escrow_hours := COALESCE(
      get_escrow_duration_hours(p_receiver_id),
      168 -- Default 7 days
    );

    INSERT INTO escrow_transactions (
      gift_id,
      sender_id,
      recipient_id,
      moment_id,
      amount,
      currency,
      status,
      escrow_until
    ) VALUES (
      v_gift_id,
      p_giver_id,
      p_receiver_id,
      p_moment_id,
      v_commission.receiver_gets,
      p_currency,
      'pending',
      NOW() + (v_escrow_hours || ' hours')::INTERVAL
    )
    RETURNING id INTO v_escrow_id;

    -- Commission ledger
    INSERT INTO commission_ledger (
      giver_id,
      receiver_id,
      moment_id,
      gift_id,
      escrow_id,
      base_amount,
      currency,
      tier_name,
      total_rate,
      total_commission,
      giver_commission,
      receiver_commission,
      platform_revenue,
      giver_pays,
      receiver_gets,
      receiver_account_type,
      was_vip_transaction,
      status,
      is_direct_pay
    ) VALUES (
      p_giver_id,
      p_receiver_id,
      p_moment_id,
      v_gift_id,
      v_escrow_id,
      p_base_amount,
      p_currency,
      v_commission.tier_name,
      v_commission.total_rate,
      v_commission.total_commission,
      v_commission.giver_commission,
      v_commission.receiver_commission,
      v_commission.total_commission,
      v_commission.giver_pays,
      v_commission.receiver_gets,
      'standard',
      v_commission.is_vip,
      'pending',
      FALSE
    );
  END IF;

  -- 6. Return result
  RETURN jsonb_build_object(
    'success', true,
    'gift_id', v_gift_id,
    'escrow_id', v_escrow_id,
    'proof_requirement', v_proof_req,
    'is_direct_pay', v_is_direct_pay,
    'tier', v_tier.tier_name,
    'giver_pays', v_commission.giver_pays,
    'receiver_gets', v_commission.receiver_gets,
    'commission', v_commission.total_commission,
    'description_tr', v_tier.description_tr
  );
END;
$$;

-- ============================================
-- 5. HANDLE DIRECT PAY TRANSFER
-- ============================================

-- Called after PayTR payment success for direct pay gifts
CREATE OR REPLACE FUNCTION process_direct_pay_transfer(
  p_gift_id UUID,
  p_paytr_merchant_oid TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_gift RECORD;
  v_ledger RECORD;
BEGIN
  -- Get gift
  SELECT * INTO v_gift
  FROM gifts
  WHERE id = p_gift_id AND is_direct_pay = TRUE;

  IF v_gift IS NULL THEN
    RAISE EXCEPTION 'Direct pay gift not found';
  END IF;

  -- Get commission ledger
  SELECT * INTO v_ledger
  FROM commission_ledger
  WHERE gift_id = p_gift_id;

  -- Update commission ledger
  UPDATE commission_ledger
  SET
    status = 'collected',
    paytr_merchant_oid = p_paytr_merchant_oid,
    collected_at = NOW()
  WHERE gift_id = p_gift_id;

  -- Notify receiver
  INSERT INTO notifications (
    user_id,
    type,
    title,
    body,
    data
  ) VALUES (
    v_gift.receiver_id,
    'gift_received_direct',
    'Hediye Aldın! 🎁',
    format('%s TL değerinde bir hediye aldın! Para hesabına aktarılıyor.', v_ledger.receiver_gets),
    jsonb_build_object(
      'gift_id', p_gift_id,
      'amount', v_ledger.receiver_gets,
      'is_direct_pay', true
    )
  );

  -- Notify giver
  INSERT INTO notifications (
    user_id,
    type,
    title,
    body,
    data
  ) VALUES (
    v_gift.giver_id,
    'gift_sent_direct',
    'Hediye Gönderildi! ✨',
    'Hediyen başarıyla iletildi!',
    jsonb_build_object(
      'gift_id', p_gift_id,
      'receiver_id', v_gift.receiver_id
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'gift_id', p_gift_id,
    'receiver_gets', v_ledger.receiver_gets,
    'status', 'transfer_initiated'
  );
END;
$$;

-- ============================================
-- 6. PROOFS TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  gift_id UUID REFERENCES gifts(id),
  escrow_id UUID REFERENCES escrow_transactions(id),
  moment_id UUID REFERENCES moments(id),

  -- Proof content
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,

  -- Location verification
  location_lat DECIMAL(10,7),
  location_lng DECIMAL(10,7),
  location_accuracy DECIMAL(10,2),
  location_verified BOOLEAN DEFAULT FALSE,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'verified', 'rejected', 'needs_review')
  ),

  -- Verification
  verified_at TIMESTAMPTZ,
  verified_by UUID, -- Can be NULL for AI verification
  verification_method TEXT, -- 'ai', 'manual', 'auto'
  verification_notes TEXT,

  -- AI Analysis
  ai_confidence DECIMAL(5,4), -- 0-1
  ai_analysis JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proofs_user ON proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_proofs_gift ON proofs(gift_id);
CREATE INDEX IF NOT EXISTS idx_proofs_escrow ON proofs(escrow_id);
CREATE INDEX IF NOT EXISTS idx_proofs_status ON proofs(status);

-- ============================================
-- 7. VERIFY PROOF AND RELEASE ESCROW
-- ============================================

CREATE OR REPLACE FUNCTION verify_proof_and_release(
  p_proof_id UUID,
  p_verified_by UUID DEFAULT NULL,
  p_verification_method TEXT DEFAULT 'manual',
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_proof RECORD;
  v_escrow RECORD;
  v_ledger RECORD;
BEGIN
  -- Get proof
  SELECT * INTO v_proof
  FROM proofs
  WHERE id = p_proof_id;

  IF v_proof IS NULL THEN
    RAISE EXCEPTION 'Proof not found';
  END IF;

  IF v_proof.status = 'verified' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Proof already verified');
  END IF;

  -- Update proof status
  UPDATE proofs
  SET
    status = 'verified',
    verified_at = NOW(),
    verified_by = p_verified_by,
    verification_method = p_verification_method,
    verification_notes = p_notes,
    updated_at = NOW()
  WHERE id = p_proof_id;

  -- Get and update escrow
  SELECT * INTO v_escrow
  FROM escrow_transactions
  WHERE id = v_proof.escrow_id;

  IF v_escrow IS NOT NULL AND v_escrow.status = 'pending' THEN
    UPDATE escrow_transactions
    SET
      status = 'released',
      released_at = NOW(),
      release_reason = 'proof_verified'
    WHERE id = v_escrow.id;

    -- Update commission ledger
    UPDATE commission_ledger
    SET
      status = 'transferred',
      transferred_at = NOW()
    WHERE escrow_id = v_escrow.id;

    -- Notify receiver
    SELECT * INTO v_ledger
    FROM commission_ledger
    WHERE escrow_id = v_escrow.id;

    INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      data
    ) VALUES (
      v_escrow.recipient_id,
      'escrow_released',
      'Para Hesabına Geçti! 💰',
      format('%s TL hesabına aktarıldı!', v_ledger.receiver_gets),
      jsonb_build_object(
        'escrow_id', v_escrow.id,
        'amount', v_ledger.receiver_gets
      )
    );

    -- Notify giver
    INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      data
    ) VALUES (
      v_escrow.sender_id,
      'proof_verified',
      'Kanıt Onaylandı! ✅',
      'Hediyenin alıcıya ulaştığı onaylandı.',
      jsonb_build_object(
        'escrow_id', v_escrow.id,
        'proof_id', p_proof_id
      )
    );
  END IF;

  -- Update gift status
  UPDATE gifts
  SET
    status = 'completed',
    completed_at = NOW()
  WHERE id = v_proof.gift_id;

  RETURN jsonb_build_object(
    'success', true,
    'proof_id', p_proof_id,
    'escrow_released', v_escrow IS NOT NULL,
    'receiver_gets', v_ledger.receiver_gets
  );
END;
$$;

-- ============================================
-- 8. RLS POLICIES
-- ============================================

ALTER TABLE proof_requirement_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;

-- Proof tiers - public read
CREATE POLICY "Anyone can view proof tiers"
  ON proof_requirement_tiers FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- Proofs - parties can view
CREATE POLICY "Users can view related proofs"
  ON proofs FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM gifts g
      WHERE g.id = proofs.gift_id
      AND (g.giver_id = auth.uid() OR g.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert own proofs"
  ON proofs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 9. GRANTS
-- ============================================

GRANT SELECT ON proof_requirement_tiers TO authenticated;
GRANT SELECT, INSERT ON proofs TO authenticated;

GRANT EXECUTE ON FUNCTION get_proof_requirement TO authenticated;
GRANT EXECUTE ON FUNCTION create_gift_with_proof_requirement TO authenticated;
GRANT EXECUTE ON FUNCTION process_direct_pay_transfer TO service_role;
GRANT EXECUTE ON FUNCTION verify_proof_and_release TO authenticated;

-- ============================================
-- 10. COMMENTS
-- ============================================

COMMENT ON TABLE proof_requirement_tiers IS 'Tutara göre proof gereksinim seviyeleri';
COMMENT ON TABLE proofs IS 'Deneyim kanıtları (fotoğraf, konum, vb.)';
COMMENT ON FUNCTION get_proof_requirement IS 'Verilen tutar için proof gereksinimini döner';
COMMENT ON FUNCTION create_gift_with_proof_requirement IS 'Dinamik proof gereksinimiyle gift oluşturur';
COMMENT ON FUNCTION verify_proof_and_release IS 'Proof onaylar ve escrow serbest bırakır';
