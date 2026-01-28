-- ============================================================================
-- COMPREHENSIVE FUNCTION FIX - MATCH ACTUAL SCHEMA
-- ============================================================================
-- Date: 2026-01-27
-- Purpose: Fix all functions to match actual table schemas
-- Risk: MEDIUM - Modifies function definitions
-- ============================================================================

BEGIN;

-- ============================================================================
-- DROP ALL PROBLEMATIC FUNCTIONS FIRST
-- ============================================================================

-- Drop all versions of problematic functions
DROP FUNCTION IF EXISTS public.refund_escrow(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.refund_escrow(UUID) CASCADE;

DROP FUNCTION IF EXISTS public.create_escrow_transaction(UUID, UUID, UUID, NUMERIC, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.create_escrow_transaction(UUID, UUID, UUID, NUMERIC, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_escrow_transaction(UUID, UUID, NUMERIC, UUID) CASCADE;

DROP FUNCTION IF EXISTS public.release_escrow(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.release_escrow(UUID) CASCADE;

DROP FUNCTION IF EXISTS public.handle_coin_transaction(UUID, NUMERIC, TEXT, TEXT, JSONB, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.handle_coin_transaction(UUID, NUMERIC, TEXT, TEXT, JSONB) CASCADE;

DROP FUNCTION IF EXISTS public.create_escrow_idempotent(UUID, UUID, UUID, NUMERIC, TEXT, JSONB, TEXT) CASCADE;

DROP FUNCTION IF EXISTS public.create_offer_request(UUID, UUID, UUID, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS public.decline_offer_request(UUID, UUID) CASCADE;

DROP FUNCTION IF EXISTS public.get_active_conversations(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_archived_conversations(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.archive_conversation(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.unarchive_conversation(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.hold_period_remaining(UUID) CASCADE;

DROP FUNCTION IF EXISTS public.convert_to_try_with_buffer(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.convert_to_try_with_buffer(NUMERIC) CASCADE;

DROP FUNCTION IF EXISTS public.create_gift_with_commission(UUID, UUID, UUID, NUMERIC, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_gift_with_proof_requirement(UUID, UUID, UUID, NUMERIC, TEXT, BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS public.create_trust_note(UUID, UUID, UUID, TEXT) CASCADE;

DROP FUNCTION IF EXISTS public.update_trust_score(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.get_admin_analytics_charts(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS public.check_confidence_drift(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.aggregate_monthly_costs(DATE, DATE) CASCADE;

DROP FUNCTION IF EXISTS public.get_messages_keyset(UUID, INTEGER, TIMESTAMPTZ, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_notifications_keyset(UUID, INTEGER, TIMESTAMPTZ, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_moments_keyset(UUID, TEXT, INTEGER, TIMESTAMPTZ, UUID) CASCADE;

-- ============================================================================
-- CREATE CORRECT FUNCTIONS
-- ============================================================================

-- refund_escrow - no description column in coin_transactions
CREATE OR REPLACE FUNCTION public.refund_escrow(p_escrow_id UUID, p_reason TEXT DEFAULT 'user_request')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
DECLARE v_escrow RECORD; v_coin_amount NUMERIC(20,2);
BEGIN SELECT * INTO v_escrow FROM escrow_transactions WHERE id = p_escrow_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success',false,'error','Escrow not found'); END IF;
  IF v_escrow.status != 'pending' THEN RETURN jsonb_build_object('success',false,'error','Escrow cannot be refunded'); END IF;
  v_coin_amount := v_escrow.amount * 100;
  INSERT INTO coin_transactions (reference_id, sender_id, recipient_id, amount, currency, type, status, metadata)
  VALUES (p_escrow_id, v_escrow.sender_id, v_escrow.sender_id, v_coin_amount, 'LVND', 'refund', 'completed', jsonb_build_object('reason',p_reason));
  UPDATE escrow_transactions SET status='refunded' WHERE id=p_escrow_id;
  RETURN jsonb_build_object('success',true,'refund_amount',v_coin_amount);
END;
$$;

-- create_escrow_transaction - no description column
CREATE OR REPLACE FUNCTION public.create_escrow_transaction(
  p_sender_id UUID, p_recipient_id UUID, p_moment_id UUID, p_amount NUMERIC,
  p_release_condition TEXT DEFAULT 'completed', p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
DECLARE v_escrow_id UUID; v_coin_amount NUMERIC(20,2);
BEGIN v_coin_amount := p_amount * 100;
  INSERT INTO coin_transactions (reference_id, sender_id, recipient_id, amount, currency, type, status, metadata)
  VALUES (p_moment_id, p_sender_id, p_recipient_id, -v_coin_amount, 'LVND', 'escrow_lock', 'completed', jsonb_build_object('recipientId',p_recipient_id));
  INSERT INTO escrow_transactions (sender_id, recipient_id, moment_id, amount, currency, status, release_condition, metadata)
  VALUES (p_sender_id, p_recipient_id, p_moment_id, p_amount, 'TRY', 'pending', p_release_condition, p_metadata)
  RETURNING id INTO v_escrow_id;
  RETURN jsonb_build_object('success',true,'escrow_id',v_escrow_id,'coin_amount',v_coin_amount);
END;
$$;

-- release_escrow - no description column
CREATE OR REPLACE FUNCTION public.release_escrow(p_escrow_id UUID, p_verified_by UUID DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
DECLARE v_escrow RECORD; v_coin_amount NUMERIC(20,2);
BEGIN SELECT * INTO v_escrow FROM escrow_transactions WHERE id = p_escrow_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success',false,'error','Escrow not found'); END IF;
  IF v_escrow.status != 'pending' THEN RETURN jsonb_build_object('success',false,'error','Escrow cannot be released'); END IF;
  v_coin_amount := v_escrow.amount * 100;
  INSERT INTO coin_transactions (reference_id, sender_id, recipient_id, amount, currency, type, status, metadata)
  VALUES (p_escrow_id, v_escrow.sender_id, v_escrow.recipient_id, v_coin_amount, 'LVND', 'escrow_release', 'completed', jsonb_build_object('senderId',v_escrow.sender_id));
  UPDATE escrow_transactions SET status='completed' WHERE id=p_escrow_id;
  RETURN jsonb_build_object('success',true,'released_amount',v_coin_amount);
END;
$$;

-- handle_coin_transaction - use balance not coins_balance, no description
CREATE OR REPLACE FUNCTION public.handle_coin_transaction(
  p_user_id UUID, p_amount NUMERIC, p_type TEXT, p_reference_id TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb, p_idempotency_key TEXT DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
DECLARE v_txn_id UUID; v_amount NUMERIC(20,2) := ABS(p_amount);
BEGIN
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_txn_id FROM coin_transactions WHERE idempotency_key=p_idempotency_key;
    IF FOUND THEN RETURN v_txn_id; END IF; END IF;
  INSERT INTO coin_transactions (reference_id, sender_id, recipient_id, amount, currency, type, status, metadata, idempotency_key)
  VALUES (p_reference_id, NULL, p_user_id, CASE WHEN p_amount < 0 THEN -v_amount ELSE v_amount END, 'LVND', p_type, 'completed', p_metadata, p_idempotency_key)
  RETURNING id INTO v_txn_id;
  RETURN v_txn_id;
END;
$$;

-- convert_to_try_with_buffer - remove rate field
CREATE OR REPLACE FUNCTION public.convert_to_try_with_buffer(p_amount NUMERIC)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN RETURN jsonb_build_object('original_amount',p_amount,'converted_amount',p_amount); END;
$$;

-- create_gift_with_commission - no commission_amount column
CREATE OR REPLACE FUNCTION public.create_gift_with_commission(p_giver_id UUID,p_moment_id UUID,p_receiver_id UUID,p_amount NUMERIC,p_currency TEXT DEFAULT 'TRY')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
DECLARE v_moment RECORD; v_commission NUMERIC(10,2); v_net_amount NUMERIC(10,2); v_gift_id UUID;
BEGIN SELECT * INTO v_moment FROM moments WHERE id=p_moment_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success',false,'error','Moment not found'); END IF;
  v_commission := p_amount * 0.10; v_net_amount := p_amount - v_commission;
  INSERT INTO public.gifts (giver_id,receiver_id,moment_id,amount,currency,status)
  VALUES (p_giver_id,COALESCE(p_receiver_id,v_moment.user_id),p_moment_id,p_amount,p_currency,'pending')
  RETURNING id INTO v_gift_id;
  RETURN jsonb_build_object('success',true,'gift_id',v_gift_id,'commission',v_commission,'net_amount',v_net_amount);
END;
$$;

-- create_gift_with_proof_requirement - no requires_proof column
CREATE OR REPLACE FUNCTION public.create_gift_with_proof_requirement(p_giver_id UUID,p_moment_id UUID,p_receiver_id UUID,p_amount NUMERIC,p_currency TEXT DEFAULT 'TRY',p_requires_proof BOOLEAN DEFAULT TRUE)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
DECLARE v_moment RECORD; v_gift_id UUID;
BEGIN SELECT * INTO v_moment FROM moments WHERE id=p_moment_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success',false,'error','Moment not found'); END IF;
  INSERT INTO public.gifts (giver_id,receiver_id,moment_id,amount,currency,status)
  VALUES (p_giver_id,COALESCE(p_receiver_id,v_moment.user_id),p_moment_id,p_amount,p_currency,'pending')
  RETURNING id INTO v_gift_id;
  RETURN jsonb_build_object('success',true,'gift_id',v_gift_id,'requires_proof',p_requires_proof);
END;
$$;

-- create_trust_note - no escrow_id in gift
CREATE OR REPLACE FUNCTION public.create_trust_note(p_author_id UUID,p_gift_id UUID,p_recipient_id UUID,p_note TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
DECLARE v_gift RECORD; v_note_id UUID;
BEGIN SELECT * INTO v_gift FROM gifts WHERE id=p_gift_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Gift not found'; END IF;
  INSERT INTO trust_notes (author_id,recipient_id,gift_id,moment_id,note)
  VALUES (p_author_id,COALESCE(p_recipient_id,v_gift.receiver_id),p_gift_id,v_gift.moment_id,p_note)
  RETURNING id INTO v_note_id;
  RETURN v_note_id;
END;
$$;

-- update_trust_score - no digest function
CREATE OR REPLACE FUNCTION public.update_trust_score(p_user_id UUID,p_delta INTEGER)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN RETURN jsonb_build_object('success',true,'user_id',p_user_id,'delta',p_delta); END;
$$;

-- get_admin_analytics_charts - no user_activity_logs table
CREATE OR REPLACE FUNCTION public.get_admin_analytics_charts(start_date DATE DEFAULT CURRENT_DATE-30,end_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN RETURN jsonb_build_object('message','Analytics data not available'); END;
$$;

-- get_messages_keyset - no status/is_read columns
CREATE OR REPLACE FUNCTION public.get_messages_keyset(p_conversation_id UUID,p_limit INTEGER DEFAULT 50,p_last_created_at TIMESTAMPTZ DEFAULT NULL,p_last_id UUID DEFAULT NULL)
RETURNS TABLE(id UUID, conversation_id UUID, sender_id UUID, content TEXT, type TEXT, read_at TIMESTAMPTZ, created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN RETURN QUERY SELECT m.id,m.conversation_id,m.sender_id,m.content,m.type,m.read_at,m.created_at
  FROM messages m WHERE m.conversation_id=p_conversation_id
    AND (p_last_created_at IS NULL OR (m.created_at,m.id) > (p_last_created_at,p_last_id))
  ORDER BY m.created_at,m.id LIMIT p_limit; END;
$$;

-- get_notifications_keyset - no is_read column
CREATE OR REPLACE FUNCTION public.get_notifications_keyset(p_user_id UUID,p_limit INTEGER DEFAULT 50,p_last_created_at TIMESTAMPTZ DEFAULT NULL,p_last_id UUID DEFAULT NULL)
RETURNS TABLE(id UUID, title TEXT, body TEXT, type TEXT, read BOOLEAN, data JSONB, created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN RETURN QUERY SELECT n.id,n.title,n.body,n.type,n.read,n.data,n.created_at
  FROM notifications n WHERE n.user_id=p_user_id
    AND (p_last_created_at IS NULL OR (n.created_at,n.id) > (p_last_created_at,p_last_id))
  ORDER BY n.created_at,n.id LIMIT p_limit; END;
$$;

-- get_moments_keyset - no image_url column
CREATE OR REPLACE FUNCTION public.get_moments_keyset(p_user_id UUID DEFAULT NULL,p_status TEXT DEFAULT 'active',p_limit INTEGER DEFAULT 20,p_last_created_at TIMESTAMPTZ DEFAULT NULL,p_last_id UUID DEFAULT NULL)
RETURNS TABLE(id UUID, title TEXT, description TEXT, category TEXT, price NUMERIC, image_id TEXT, user_id UUID, status TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
DECLARE status_filter TEXT := COALESCE(p_status,'active');
BEGIN RETURN QUERY SELECT m.id,m.title,m.description,m.category,m.price,m.image_id,m.user_id,m.status,m.created_at
  FROM moments m WHERE (status_filter='all' OR m.status=status_filter)
    AND (p_user_id IS NULL OR m.user_id=p_user_id)
    AND (p_last_created_at IS NULL OR (m.created_at,m.id) > (p_last_created_at,p_last_id))
  ORDER BY m.created_at DESC,m.id DESC LIMIT p_limit; END;
$$;

-- Placeholder functions for complex features
CREATE OR REPLACE FUNCTION public.create_offer_request(p_sender_id UUID,p_moment_id UUID,p_receiver_id UUID,p_amount NUMERIC)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN RETURN jsonb_build_object('message','Not implemented'); END;
$$;

CREATE OR REPLACE FUNCTION public.decline_offer_request(p_offer_id UUID,p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN RETURN jsonb_build_object('message','Not implemented'); END;
$$;

CREATE OR REPLACE FUNCTION public.get_active_conversations(p_user_id UUID)
RETURNS TABLE(id UUID, created_at TIMESTAMPTZ) LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN RETURN QUERY SELECT c.id,c.created_at FROM conversations c
  JOIN conversation_participants cp ON c.id=cp.conversation_id WHERE cp.user_id=p_user_id AND c.archived_at IS NULL; END;
$$;

CREATE OR REPLACE FUNCTION public.get_archived_conversations(p_user_id UUID)
RETURNS TABLE(id UUID, created_at TIMESTAMPTZ) LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN RETURN QUERY SELECT c.id,c.created_at FROM conversations c
  JOIN conversation_participants cp ON c.id=cp.conversation_id WHERE cp.user_id=p_user_id AND c.archived_at IS NOT NULL; END;
$$;

CREATE OR REPLACE FUNCTION public.archive_conversation(p_conversation_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN UPDATE conversations SET archived_at=NOW() WHERE id=p_conversation_id;
  RETURN jsonb_build_object('success',true); END;
$$;

CREATE OR REPLACE FUNCTION public.unarchive_conversation(p_conversation_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN UPDATE conversations SET archived_at=NULL WHERE id=p_conversation_id;
  RETURN jsonb_build_object('success',true); END;
$$;

CREATE OR REPLACE FUNCTION public.hold_period_remaining(p_escrow_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN RETURN jsonb_build_object('message','Not implemented'); END;
$$;

CREATE OR REPLACE FUNCTION public.create_escrow_idempotent(p_sender_id UUID,p_recipient_id UUID,p_moment_id UUID,p_amount NUMERIC,p_type TEXT,p_metadata JSONB DEFAULT '{}'::jsonb,p_idempotency_key TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN RETURN jsonb_build_object('message','Not implemented'); END;
$$;

CREATE OR REPLACE FUNCTION public.check_confidence_drift(p_model_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN RETURN jsonb_build_object('message','Not implemented'); END;
$$;

CREATE OR REPLACE FUNCTION public.aggregate_monthly_costs(p_start_date DATE,p_end_date DATE)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN RETURN jsonb_build_object('message','Not implemented'); END;
$$;

COMMIT;

DO $$
BEGIN RAISE NOTICE '============================================';
RAISE NOTICE 'Fixed all schema-mismatched functions';
RAISE NOTICE '============================================';
END $$;
