-- Admin-Mobile Data Consistency Migration
-- Migration: 20251230100000_admin_mobile_data_consistency
-- Description: Adds user status fields, moment moderation status, and notification triggers
--              to ensure data consistency between admin panel and mobile app.

-- =====================================================
-- PART 1: USER STATUS FIELDS
-- =====================================================

-- Add user status enum type
DO $$ BEGIN
  CREATE TYPE user_account_status AS ENUM (
    'active',
    'suspended',
    'banned',
    'pending',
    'deleted'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add status fields to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'banned', 'pending', 'deleted')),
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ban_reason TEXT,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
  ADD COLUMN IF NOT EXISTS banned_by UUID,
  ADD COLUMN IF NOT EXISTS suspended_by UUID,
  ADD COLUMN IF NOT EXISTS suspension_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reinstated_at TIMESTAMPTZ;

-- Add indexes for status queries
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON users(is_banned) WHERE is_banned = true;
CREATE INDEX IF NOT EXISTS idx_users_is_suspended ON users(is_suspended) WHERE is_suspended = true;

-- Update existing users to have 'active' status if null
UPDATE users SET status = 'active' WHERE status IS NULL;

-- =====================================================
-- PART 2: MOMENT MODERATION STATUS
-- =====================================================

-- Add moderation status to moments table
ALTER TABLE moments
  ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending_review'
    CHECK (moderation_status IN ('pending_review', 'approved', 'rejected', 'flagged')),
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES admin_users(id),
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- Create index for moderation queries
CREATE INDEX IF NOT EXISTS idx_moments_moderation_status ON moments(moderation_status);
CREATE INDEX IF NOT EXISTS idx_moments_pending_moderation ON moments(moderation_status, created_at)
  WHERE moderation_status = 'pending_review';

-- =====================================================
-- PART 3: NOTIFICATION CREATION HELPER
-- =====================================================

-- Helper function to create notifications (if not exists)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_data JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;

-- =====================================================
-- PART 4: USER STATUS CHANGE NOTIFICATION TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION notify_user_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_title TEXT;
  notification_body TEXT;
  notification_type TEXT;
BEGIN
  -- Handle ban
  IF NEW.is_banned = TRUE AND (OLD.is_banned = FALSE OR OLD.is_banned IS NULL) THEN
    notification_type := 'account_banned';
    notification_title := 'Hesabınız askıya alındı';
    notification_body := COALESCE(NEW.ban_reason, 'Hesabınız platform kurallarını ihlal ettiği için askıya alındı.');

    PERFORM create_notification(
      NEW.id,
      notification_type,
      notification_title,
      notification_body,
      jsonb_build_object(
        'banned_at', NEW.banned_at,
        'reason', NEW.ban_reason,
        'action', 'ban'
      )
    );
  END IF;

  -- Handle unban (reinstatement from ban)
  IF NEW.is_banned = FALSE AND OLD.is_banned = TRUE THEN
    notification_type := 'account_reinstated';
    notification_title := 'Hesabınız yeniden aktif';
    notification_body := 'Hesabınız yeniden aktif edildi. Lovendo''e tekrar hoş geldiniz!';

    PERFORM create_notification(
      NEW.id,
      notification_type,
      notification_title,
      notification_body,
      jsonb_build_object(
        'reinstated_at', NOW(),
        'action', 'unban'
      )
    );
  END IF;

  -- Handle suspension
  IF NEW.is_suspended = TRUE AND (OLD.is_suspended = FALSE OR OLD.is_suspended IS NULL) THEN
    notification_type := 'account_suspended';
    notification_title := 'Hesabınız geçici olarak askıya alındı';
    notification_body := COALESCE(NEW.suspension_reason, 'Hesabınız geçici olarak askıya alındı.');

    IF NEW.suspension_ends_at IS NOT NULL THEN
      notification_body := notification_body || ' Askı süresi: ' || to_char(NEW.suspension_ends_at, 'DD.MM.YYYY HH24:MI');
    END IF;

    PERFORM create_notification(
      NEW.id,
      notification_type,
      notification_title,
      notification_body,
      jsonb_build_object(
        'suspended_at', NEW.suspended_at,
        'reason', NEW.suspension_reason,
        'ends_at', NEW.suspension_ends_at,
        'action', 'suspend'
      )
    );
  END IF;

  -- Handle unsuspension
  IF NEW.is_suspended = FALSE AND OLD.is_suspended = TRUE THEN
    notification_type := 'account_reinstated';
    notification_title := 'Hesabınız yeniden aktif';
    notification_body := 'Hesabınızın askı süresi sona erdi. Lovendo''e tekrar hoş geldiniz!';

    PERFORM create_notification(
      NEW.id,
      notification_type,
      notification_title,
      notification_body,
      jsonb_build_object(
        'reinstated_at', NOW(),
        'action', 'unsuspend'
      )
    );
  END IF;

  -- Update status field based on ban/suspend state
  IF NEW.is_banned = TRUE THEN
    NEW.status := 'banned';
  ELSIF NEW.is_suspended = TRUE THEN
    NEW.status := 'suspended';
  ELSIF OLD.is_banned = TRUE OR OLD.is_suspended = TRUE THEN
    -- User was unbanned/unsuspended, set back to active
    NEW.status := 'active';
    NEW.reinstated_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_user_status_change ON users;
CREATE TRIGGER trg_user_status_change
  BEFORE UPDATE ON users
  FOR EACH ROW
  WHEN (
    OLD.is_banned IS DISTINCT FROM NEW.is_banned OR
    OLD.is_suspended IS DISTINCT FROM NEW.is_suspended
  )
  EXECUTE FUNCTION notify_user_status_change();

-- =====================================================
-- PART 5: MOMENT MODERATION NOTIFICATION TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION notify_moment_moderation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_title TEXT;
  notification_body TEXT;
  notification_type TEXT;
  moment_owner_id UUID;
BEGIN
  -- Get moment owner
  moment_owner_id := NEW.user_id;

  -- Only notify on moderation status changes
  IF OLD.moderation_status IS DISTINCT FROM NEW.moderation_status THEN

    -- Moment approved
    IF NEW.moderation_status = 'approved' THEN
      notification_type := 'moment_approved';
      notification_title := 'Momentiniz onaylandı!';
      notification_body := '"' || NEW.title || '" momentiniz incelenerek onaylandı ve artık herkese açık.';

      PERFORM create_notification(
        moment_owner_id,
        notification_type,
        notification_title,
        notification_body,
        jsonb_build_object(
          'moment_id', NEW.id,
          'moment_title', NEW.title,
          'moderated_at', NEW.moderated_at
        )
      );

    -- Moment rejected
    ELSIF NEW.moderation_status = 'rejected' THEN
      notification_type := 'moment_rejected';
      notification_title := 'Momentiniz reddedildi';
      notification_body := '"' || NEW.title || '" momentiniz platform kurallarına uymadığı için reddedildi.';

      IF NEW.moderation_notes IS NOT NULL THEN
        notification_body := notification_body || ' Sebep: ' || NEW.moderation_notes;
      END IF;

      PERFORM create_notification(
        moment_owner_id,
        notification_type,
        notification_title,
        notification_body,
        jsonb_build_object(
          'moment_id', NEW.id,
          'moment_title', NEW.title,
          'moderated_at', NEW.moderated_at,
          'reason', NEW.moderation_notes
        )
      );

    -- Moment flagged for review
    ELSIF NEW.moderation_status = 'flagged' THEN
      notification_type := 'moment_flagged';
      notification_title := 'Momentiniz incelemeye alındı';
      notification_body := '"' || NEW.title || '" momentiniz topluluk tarafından bildirildiği için incelemeye alındı.';

      PERFORM create_notification(
        moment_owner_id,
        notification_type,
        notification_title,
        notification_body,
        jsonb_build_object(
          'moment_id', NEW.id,
          'moment_title', NEW.title
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_moment_moderation ON moments;
CREATE TRIGGER trg_moment_moderation
  AFTER UPDATE ON moments
  FOR EACH ROW
  WHEN (OLD.moderation_status IS DISTINCT FROM NEW.moderation_status)
  EXECUTE FUNCTION notify_moment_moderation();

-- =====================================================
-- PART 6: KYC STATUS NOTIFICATION TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION notify_kyc_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_title TEXT;
  notification_body TEXT;
  notification_type TEXT;
BEGIN
  -- Only notify on status changes
  IF OLD.kyc_status IS DISTINCT FROM NEW.kyc_status THEN

    -- KYC approved
    IF NEW.kyc_status = 'verified' THEN
      notification_type := 'kyc_approved';
      notification_title := 'Kimlik doğrulamanız tamamlandı!';
      notification_body := 'Kimliğiniz başarıyla doğrulandı. Artık tüm platform özelliklerini kullanabilirsiniz.';

      PERFORM create_notification(
        NEW.id,
        notification_type,
        notification_title,
        notification_body,
        jsonb_build_object(
          'kyc_status', NEW.kyc_status,
          'verified_at', NOW()
        )
      );

    -- KYC rejected
    ELSIF NEW.kyc_status = 'rejected' THEN
      notification_type := 'kyc_rejected';
      notification_title := 'Kimlik doğrulama reddedildi';
      notification_body := 'Kimlik doğrulama başvurunuz reddedildi. Lütfen belgelerinizi kontrol edip tekrar deneyin.';

      PERFORM create_notification(
        NEW.id,
        notification_type,
        notification_title,
        notification_body,
        jsonb_build_object(
          'kyc_status', NEW.kyc_status,
          'rejected_at', NOW()
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_kyc_status_change ON users;
CREATE TRIGGER trg_kyc_status_change
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.kyc_status IS DISTINCT FROM NEW.kyc_status)
  EXECUTE FUNCTION notify_kyc_status_change();

-- =====================================================
-- PART 7: REALTIME PUBLICATION UPDATES
-- =====================================================

-- Enable realtime for users table status changes
-- This allows mobile app to subscribe to user profile changes
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Note: If the publication doesn't exist or table is already added,
-- this will fail silently in most cases

-- =====================================================
-- PART 8: HELPER FUNCTIONS FOR ADMIN ACTIONS
-- =====================================================

-- Ban user function (for admin API)
CREATE OR REPLACE FUNCTION admin_ban_user(
  p_user_id UUID,
  p_reason TEXT DEFAULT NULL,
  p_admin_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users
  SET
    is_banned = TRUE,
    banned_at = NOW(),
    ban_reason = p_reason,
    banned_by = p_admin_id,
    status = 'banned'
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$;

-- Unban user function
CREATE OR REPLACE FUNCTION admin_unban_user(
  p_user_id UUID,
  p_admin_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users
  SET
    is_banned = FALSE,
    reinstated_at = NOW(),
    status = 'active'
  WHERE id = p_user_id AND is_banned = TRUE;

  RETURN FOUND;
END;
$$;

-- Suspend user function
CREATE OR REPLACE FUNCTION admin_suspend_user(
  p_user_id UUID,
  p_reason TEXT DEFAULT NULL,
  p_ends_at TIMESTAMPTZ DEFAULT NULL,
  p_admin_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users
  SET
    is_suspended = TRUE,
    suspended_at = NOW(),
    suspension_reason = p_reason,
    suspension_ends_at = p_ends_at,
    suspended_by = p_admin_id,
    status = 'suspended'
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$;

-- Unsuspend user function
CREATE OR REPLACE FUNCTION admin_unsuspend_user(
  p_user_id UUID,
  p_admin_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users
  SET
    is_suspended = FALSE,
    reinstated_at = NOW(),
    status = 'active'
  WHERE id = p_user_id AND is_suspended = TRUE;

  RETURN FOUND;
END;
$$;

-- Moderate moment function
CREATE OR REPLACE FUNCTION admin_moderate_moment(
  p_moment_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL,
  p_admin_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate status
  IF p_status NOT IN ('pending_review', 'approved', 'rejected', 'flagged') THEN
    RAISE EXCEPTION 'Invalid moderation status: %', p_status;
  END IF;

  UPDATE moments
  SET
    moderation_status = p_status,
    moderated_by = p_admin_id,
    moderated_at = NOW(),
    moderation_notes = p_notes
  WHERE id = p_moment_id;

  RETURN FOUND;
END;
$$;

-- =====================================================
-- PART 9: AUTO-UNSUSPEND CRON JOB
-- =====================================================

-- Function to auto-unsuspend users when suspension period ends
CREATE OR REPLACE FUNCTION auto_unsuspend_users()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  unsuspended_count INTEGER;
BEGIN
  WITH unsuspended AS (
    UPDATE users
    SET
      is_suspended = FALSE,
      reinstated_at = NOW(),
      status = 'active'
    WHERE
      is_suspended = TRUE
      AND suspension_ends_at IS NOT NULL
      AND suspension_ends_at <= NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO unsuspended_count FROM unsuspended;

  RETURN unsuspended_count;
END;
$$;

-- Schedule the cron job (requires pg_cron extension)
-- This will run every 15 minutes
DO $$
BEGIN
  -- Try to schedule the cron job, fail silently if pg_cron is not available
  PERFORM cron.schedule(
    'auto-unsuspend-users',
    '*/15 * * * *',
    'SELECT auto_unsuspend_users()'
  );
EXCEPTION
  WHEN undefined_table THEN
    -- pg_cron not installed, skip
    RAISE NOTICE 'pg_cron extension not available, skipping cron job setup';
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not schedule cron job: %', SQLERRM;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN users.status IS 'User account status: active, suspended, banned, pending, deleted';
COMMENT ON COLUMN users.is_banned IS 'Whether user is permanently banned';
COMMENT ON COLUMN users.is_suspended IS 'Whether user is temporarily suspended';
COMMENT ON COLUMN users.banned_at IS 'Timestamp when user was banned';
COMMENT ON COLUMN users.suspended_at IS 'Timestamp when user was suspended';
COMMENT ON COLUMN users.suspension_ends_at IS 'Timestamp when suspension automatically ends';
COMMENT ON COLUMN users.ban_reason IS 'Reason for the ban';
COMMENT ON COLUMN users.suspension_reason IS 'Reason for the suspension';
COMMENT ON COLUMN moments.moderation_status IS 'Content moderation status: pending_review, approved, rejected, flagged';
COMMENT ON COLUMN moments.moderated_by IS 'Admin who moderated this moment';
COMMENT ON COLUMN moments.moderated_at IS 'Timestamp of moderation action';
COMMENT ON COLUMN moments.moderation_notes IS 'Notes from moderator (e.g., rejection reason)';

COMMENT ON FUNCTION notify_user_status_change IS 'Creates notification when user is banned/suspended/reinstated';
COMMENT ON FUNCTION notify_moment_moderation IS 'Creates notification when moment moderation status changes';
COMMENT ON FUNCTION notify_kyc_status_change IS 'Creates notification when KYC status changes';
COMMENT ON FUNCTION admin_ban_user IS 'Admin function to ban a user';
COMMENT ON FUNCTION admin_unban_user IS 'Admin function to unban a user';
COMMENT ON FUNCTION admin_suspend_user IS 'Admin function to temporarily suspend a user';
COMMENT ON FUNCTION admin_unsuspend_user IS 'Admin function to unsuspend a user';
COMMENT ON FUNCTION admin_moderate_moment IS 'Admin function to moderate a moment';
COMMENT ON FUNCTION auto_unsuspend_users IS 'Automatically unsuspends users when their suspension period ends';
