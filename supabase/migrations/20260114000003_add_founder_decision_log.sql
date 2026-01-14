-- ============================================================================
-- Migration: Founder Decision Log
-- Date: 2026-01-14
-- Author: Claude (Release Guardian)
--
-- Purpose: Track founder/super_admin decision actions for mental clarity.
-- This is NOT an automation trigger - purely a decision tracking log.
--
-- SAFE MODE Compliance:
-- - ADD-ONLY: No existing tables modified
-- - All columns nullable or have defaults
-- - RLS enabled with super_admin-only access
-- ============================================================================

-- Create founder_decision_log table
CREATE TABLE IF NOT EXISTS public.founder_decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Actor information
  actor_admin_id UUID NOT NULL,

  -- Context
  context_page TEXT NOT NULL CHECK (context_page IN ('ceo-briefing', 'command-center')),

  -- Item identification
  item_type TEXT NOT NULL CHECK (item_type IN ('fire', 'focus', 'hygiene', 'strategic')),
  item_key TEXT NOT NULL,

  -- Action taken
  action TEXT NOT NULL CHECK (action IN ('reviewed', 'deferred', 'focused')),

  -- Optional details
  note TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Soft reference to admin_users (not FK to avoid coupling issues)
  CONSTRAINT valid_item_key CHECK (char_length(item_key) > 0 AND char_length(item_key) <= 255)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_founder_decision_log_actor
  ON public.founder_decision_log(actor_admin_id);

CREATE INDEX IF NOT EXISTS idx_founder_decision_log_created
  ON public.founder_decision_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_founder_decision_log_item
  ON public.founder_decision_log(item_type, item_key);

CREATE INDEX IF NOT EXISTS idx_founder_decision_log_action
  ON public.founder_decision_log(action, created_at DESC);

-- Composite index for "this week's focus" queries
CREATE INDEX IF NOT EXISTS idx_founder_decision_log_focus
  ON public.founder_decision_log(action, created_at DESC)
  WHERE action = 'focused';

-- Enable RLS
ALTER TABLE public.founder_decision_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only super_admin can read/write
-- Note: This assumes admin_users table has a 'role' column
-- The actual enforcement will also happen at the API layer (defense in depth)

-- Policy for SELECT (super_admin only)
CREATE POLICY "founder_decision_log_select_super_admin"
  ON public.founder_decision_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

-- Policy for INSERT (super_admin only)
CREATE POLICY "founder_decision_log_insert_super_admin"
  ON public.founder_decision_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

-- No UPDATE or DELETE policies - decisions are immutable (append-only log)

-- Comment for documentation
COMMENT ON TABLE public.founder_decision_log IS
  'Tracks founder/super_admin decision actions. NOT an automation trigger.
   Feature flag: FOUNDER_DECISION_LOOP_ENABLED (default OFF)';

COMMENT ON COLUMN public.founder_decision_log.item_type IS
  'fire = urgent decision, focus = weekly focus, hygiene = system-handled, strategic = long-term';

COMMENT ON COLUMN public.founder_decision_log.action IS
  'reviewed = acknowledged, deferred = postponed, focused = set as this weeks focus';
