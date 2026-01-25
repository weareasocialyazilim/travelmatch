-- Migration: 20260120000001_auto_cleanup.sql
-- Purpose: Automate "Right to be Forgotten" for Apple Compliance (Guideline 5.1.1)
-- Triggered when a user is deleted from auth.users

CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Anonymize or Delete Profile
  DELETE FROM public.profiles WHERE id = OLD.id;
  
  -- 2. Delete Wallets & Transactions (Financial Records kept for auditing if needed, but for "Right to be Forgotten" we usually soft-delete or strict delete)
  -- For strict "Delete Account" feature in app, we remove traces.
  DELETE FROM public.wallets WHERE user_id = OLD.id;
  DELETE FROM public.transactions WHERE user_id = OLD.id;
  DELETE FROM public.escrow_transactions WHERE sender_id = OLD.id OR recipient_id = OLD.id;
  
  -- 3. Delete Social Data
  DELETE FROM public.moments WHERE user_id = OLD.id;
  DELETE FROM public.connections WHERE user_id = OLD.id OR connected_user_id = OLD.id;
  DELETE FROM public.gifts WHERE sender_id = OLD.id OR receiver_id = OLD.id;
  
  -- 4. Delete Messages (Cleanup conversation participation)
  -- Note: Actual messages might remain if the other user needs them, 
  -- but we remove the user's association.
  DELETE FROM public.conversation_participants WHERE user_id = OLD.id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow re-run
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Bind trigger to auth.users
CREATE TRIGGER on_auth_user_deleted
BEFORE DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();
