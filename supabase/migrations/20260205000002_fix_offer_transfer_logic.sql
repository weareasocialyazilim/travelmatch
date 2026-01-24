-- Migration: 20260205000002_fix_offer_transfer_logic.sql
-- Description: Remove Peer-to-Peer coin transfer in accept_offer_request. Coins are consumed by Sender only.

-- ==========================================
-- 1. UPDATE RPC: Accept Offer Request (v2)
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

  -- 3. REMOVED: Coin Transfer to Receiver
  -- "Kimse kimseye coin atamıyor" (No P2P coin transfer).
  -- The coins deducted from sender at creation remain deducted (consumed as service fee).
  -- Receiver simply accepts the engagement/request.

  RETURN TRUE;
END;
$$;
