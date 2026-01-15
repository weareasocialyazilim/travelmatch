-- ============================================
-- Lovendo Gifts Table
-- Migration: 20251228500000_create_gifts_table.sql
-- ============================================
--
-- NOT: Bu migration diğerlerinden ÖNCE çalışmalı!
-- Timestamp'i eski tutuyoruz ki sıralamada önce gelsin.
-- ============================================

-- ============================================
-- 1. GIFTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Participants
  giver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moment_id UUID REFERENCES moments(id) ON DELETE SET NULL,

  -- Amount
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'completed', 'cancelled', 'refunded', 'disputed')
  ),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Message (optional)
  message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Constraints
  CONSTRAINT giver_not_receiver CHECK (giver_id != receiver_id)
);

-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_gifts_giver ON gifts(giver_id);
CREATE INDEX IF NOT EXISTS idx_gifts_receiver ON gifts(receiver_id);
CREATE INDEX IF NOT EXISTS idx_gifts_moment ON gifts(moment_id);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);
CREATE INDEX IF NOT EXISTS idx_gifts_created ON gifts(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_gifts_receiver_status
ON gifts(receiver_id, status);

CREATE INDEX IF NOT EXISTS idx_gifts_moment_status
ON gifts(moment_id, status) WHERE moment_id IS NOT NULL;

-- ============================================
-- 3. RLS POLICIES
-- ============================================

ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- Users can view gifts they sent or received
CREATE POLICY "Users can view own gifts" ON gifts
FOR SELECT USING (
  auth.uid() IN (giver_id, receiver_id)
);

-- Users can create gifts (as giver)
CREATE POLICY "Users can create gifts" ON gifts
FOR INSERT WITH CHECK (
  auth.uid() = giver_id
);

-- Only system can update gifts (via functions)
CREATE POLICY "System can update gifts" ON gifts
FOR UPDATE USING (
  -- Allow update through SECURITY DEFINER functions
  current_setting('role') = 'service_role'
  OR auth.uid() IN (giver_id, receiver_id)
);

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- Update completed_at when status changes to completed
CREATE OR REPLACE FUNCTION update_gift_completed_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at := NOW();
  ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_gift_status_change ON gifts;
CREATE TRIGGER trigger_gift_status_change
BEFORE UPDATE ON gifts
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_gift_completed_at();

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Get gifts for a moment
CREATE OR REPLACE FUNCTION get_moment_gifts(p_moment_id UUID)
RETURNS TABLE (
  gift_id UUID,
  giver_id UUID,
  giver_name TEXT,
  giver_avatar TEXT,
  amount DECIMAL(10, 2),
  currency VARCHAR(3),
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    g.id,
    g.giver_id,
    u.full_name,
    u.avatar_url,
    g.amount,
    g.currency,
    g.status,
    g.created_at
  FROM gifts g
  JOIN users u ON u.id = g.giver_id
  WHERE g.moment_id = p_moment_id
    AND g.status NOT IN ('cancelled', 'refunded')
  ORDER BY g.created_at DESC;
$$;

-- Count contributors for a moment
CREATE OR REPLACE FUNCTION get_moment_contributor_count(p_moment_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COUNT(DISTINCT giver_id)::INTEGER
  FROM gifts
  WHERE moment_id = p_moment_id
    AND status NOT IN ('cancelled', 'refunded');
$$;

-- ============================================
-- 6. GRANTS
-- ============================================

GRANT SELECT ON gifts TO authenticated;
GRANT INSERT ON gifts TO authenticated;
GRANT EXECUTE ON FUNCTION get_moment_gifts TO authenticated;
GRANT EXECUTE ON FUNCTION get_moment_contributor_count TO authenticated;

-- ============================================
-- 7. COMMENTS
-- ============================================

COMMENT ON TABLE gifts IS 'Gift transactions between users for moments';
COMMENT ON FUNCTION get_moment_gifts IS 'Get all gifts for a specific moment';
COMMENT ON FUNCTION get_moment_contributor_count IS 'Count unique contributors to a moment';
