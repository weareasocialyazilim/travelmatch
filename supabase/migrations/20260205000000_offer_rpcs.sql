-- Migration: 20260205000000_offer_rpcs.sql
-- Description: RPCs for Offer-as-Request flow and Anti-Spam Logic

-- ==========================================
-- 1. Helper: Check Inbound Rules (Anti-Spam)
-- ==========================================
CREATE OR REPLACE FUNCTION check_inbound_rules(
  p_sender_id UUID,
  p_receiver_id UUID,
  p_amount_credits INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings JSONB;
  v_is_follower BOOLEAN;
  v_sender_tier INT; -- Placeholder for logic
BEGIN
  -- 1. Get Receiver Settings
  SELECT settings INTO v_settings FROM inbound_settings WHERE owner_id = p_receiver_id;
  
  -- If no settings, default allow (or default restrictive based on product policy? Default allow for MVP)
  IF v_settings IS NULL THEN
    RETURN TRUE;
  END IF;

  -- 2. Check Followers Only
  IF (v_settings->>'followers_only')::BOOLEAN THEN
    SELECT EXISTS (
      SELECT 1 FROM user_follows 
      WHERE follower_id = p_sender_id AND following_id = p_receiver_id
    ) INTO v_is_follower;
    
    IF NOT v_is_follower THEN
      RAISE EXCEPTION 'This user only accepts offers from followers.';
    END IF;
  END IF;

  -- 3. Check Minimum Tier (Amount)
  IF (v_settings->>'min_tier')::INT > 0 THEN
    IF p_amount_credits < (v_settings->>'min_tier')::INT THEN
      RAISE EXCEPTION 'Offer amount is below the user''s minimum threshold.';
    END IF;
  END IF;

  -- 4. Daily Cap (Optional - expensive check, maybe skip for MVP)
  -- ...

  RETURN TRUE;
END;
$$;


-- ==========================================
-- 2. RPC: Create Offer Request
-- ==========================================
CREATE OR REPLACE FUNCTION create_offer_request(
  p_receiver_id UUID,
  p_amount_credits INT,
  p_message TEXT,
  p_drop_id UUID DEFAULT NULL,
  p_template_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_id UUID;
  v_request_id UUID;
  v_sender_balance DECIMAL;
BEGIN
  -- 1. Auth Check
  v_sender_id := auth.uid();
  IF v_sender_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF v_sender_id = p_receiver_id THEN
    RAISE EXCEPTION 'Cannot send offer to yourself';
  END IF;

  -- 2. Check Balance (Credits/Coins)
  SELECT coins_balance INTO v_sender_balance FROM users WHERE id = v_sender_id;
  
  IF v_sender_balance < p_amount_credits THEN
     RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- 3. Check Inbound Rules (Anti-Spam)
  PERFORM check_inbound_rules(v_sender_id, p_receiver_id, p_amount_credits);

  -- 4. Deduct Balance (Escrow/Hold)
  -- Note: We might want to hold funds now or just check. 
  -- Ideally: Deduct now, refund on decline. This prevents "fake" offers.
  UPDATE users 
  SET coins_balance = coins_balance - p_amount_credits 
  WHERE id = v_sender_id;

  -- 5. Create Request
  INSERT INTO offer_requests (
    sender_id,
    receiver_id,
    amount_credits,
    message,
    drop_id,
    moment_template_id,
    status
  ) VALUES (
    v_sender_id,
    p_receiver_id,
    p_amount_credits,
    p_message,
    p_drop_id,
    p_template_id,
    'pending'
  ) RETURNING id INTO v_request_id;

  -- 6. Notification Trigger (handled by DB triggers usually, or we can explicit here)
  -- PERFORM send_push_notification(...);

  RETURN v_request_id;
END;
$$;


-- ==========================================
-- 3. RPC: Accept Offer Request
-- ==========================================
CREATE OR REPLACE FUNCTION accept_offer_request(p_request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_request offer_requests%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  
  -- 1. Get Request
  SELECT * INTO v_request FROM offer_requests WHERE id = p_request_id;
  
  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;
  
  IF v_request.receiver_id != v_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  IF v_request.status != 'pending' THEN
    RAISE EXCEPTION 'Request is already processed';
  END IF;

  -- 2. Update Status
  UPDATE offer_requests 
  SET 
    status = 'accepted',
    accepted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;

  -- 3. Transfer Credits (Realize Income)
  -- Receiver gets the credits (minus platform fee?)
  -- For now, direct transfer full amount. Platform fee logic can be added.
  UPDATE users
  SET coins_balance = coins_balance + v_request.amount_credits
  WHERE id = v_user_id;

  -- 4. Create Moment / Unlock Chat
  -- Logic to create a "Moment" or "Chat" based on this acceptance.
  -- This might fire a trigger or be handled by the client reacting to the state change.
  -- For "Chat Unlock", usually we insert into 'conversations' table.
  
  -- Explicit Chat Unlock Example (idempotent):
  -- INSERT INTO conversations ... ON CONFLICT DO NOTHING;

  RETURN TRUE;
END;
$$;


-- ==========================================
-- 4. RPC: Decline Offer Request
-- ==========================================
CREATE OR REPLACE FUNCTION decline_offer_request(p_request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_request offer_requests%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  
  SELECT * INTO v_request FROM offer_requests WHERE id = p_request_id;
  
  IF v_request IS NULL THEN RAISE EXCEPTION 'Request not found'; END IF;
  
  -- Allow Receiver to Decline OR Sender to Cancel
  IF v_request.receiver_id != v_user_id AND v_request.sender_id != v_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  IF v_request.status != 'pending' THEN
    RAISE EXCEPTION 'Request is not pending';
  END IF;

  -- 1. Update Status
  UPDATE offer_requests 
  SET 
    status = CASE WHEN v_request.sender_id = v_user_id THEN 'cancelled' ELSE 'declined' END,
    declined_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;

  -- 2. Refund Sender
  UPDATE users
  SET coins_balance = coins_balance + v_request.amount_credits
  WHERE id = v_request.sender_id;

  RETURN TRUE;
END;
$$;
