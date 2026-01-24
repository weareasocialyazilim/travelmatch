-- Migration: 20260205000001_update_offer_rpc_and_trigger.sql
-- Description: Update create_offer_request for metadata support and add Notification Trigger

-- ==========================================
-- 1. UPDATE RPC: Create Offer Request (v2)
-- ==========================================
CREATE OR REPLACE FUNCTION create_offer_request(
  p_receiver_id UUID,
  p_amount_credits INT,
  p_message TEXT,
  p_drop_id UUID DEFAULT NULL,
  p_template_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
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
  UPDATE users 
  SET coins_balance = coins_balance - p_amount_credits 
  WHERE id = v_sender_id;

  -- 5. Create Request (Now with METADATA)
  INSERT INTO offer_requests (
    sender_id,
    receiver_id,
    amount_credits,
    message,
    drop_id,
    moment_template_id,
    status,
    metadata
  ) VALUES (
    v_sender_id,
    p_receiver_id,
    p_amount_credits,
    p_message,
    p_drop_id,
    p_template_id,
    'pending',
    p_metadata
  ) RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$;

-- ==========================================
-- 2. NOTIFICATION TRIGGER
-- ==========================================
-- Function to be called by trigger
CREATE OR REPLACE FUNCTION handle_new_offer_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- We inserts a record into 'notifications' table if it exists, 
  -- or calls an Edge Function via pg_net (if available) or simply relies on Realtime.
  
  -- Assuming a 'notifications' table exists based on app structure usage of NotificationService.
  -- If not, we'll create a basic one or just rely on the 'offer_requests' insert for Realtime clients.
  
  -- For robustness, let's assume we want to call an http endpoint (Supabase Edge Function)
  -- or insert into a queue.
  -- For this MVP, we will rely on Supabase Realtime on the 'offer_requests' table 
  -- which the recipient client should be listening to.
  
  -- However, to support Push Notifications (which need server-side triggers),
  -- we normally insert into a notifications table which triggers the Push service.
  
  INSERT INTO notifications (
    user_id,
    type,
    title,
    body,
    data,
    created_at
  ) VALUES (
    NEW.receiver_id,
    'offer_received',
    'New Offer Received! 🎁',
    'You have received an offer of ' || NEW.amount_credits || ' credits.',
    jsonb_build_object('offer_id', NEW.id, 'amount', NEW.amount_credits),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN undefined_table THEN
    -- Fallback if notifications table doesn't match or exist, just return
    RETURN NEW;
END;
$$;

-- Drop trigger if exists to avoid duplication
DROP TRIGGER IF EXISTS on_offer_created ON offer_requests;

-- Create Trigger
CREATE TRIGGER on_offer_created
  AFTER INSERT ON offer_requests
  FOR EACH ROW EXECUTE FUNCTION handle_new_offer_notification();
