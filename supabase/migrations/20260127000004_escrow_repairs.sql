-- ============================================================================
-- Escrow Repairs Table (FIXED)
-- ============================================================================
-- Note: Fixed RLS policy to not use is_admin column

CREATE TABLE IF NOT EXISTS escrow_repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL REFERENCES escrow_transactions(id) ON DELETE CASCADE,
  mismatch_type VARCHAR(50) NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  auto_repaired BOOLEAN NOT NULL DEFAULT FALSE,
  repair_action VARCHAR(50),
  repaired_at TIMESTAMPTZ,
  admin_note TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_escrow_repairs_escrow ON escrow_repairs(escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrow_repairs_detected ON escrow_repairs(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_repairs_auto_repaired ON escrow_repairs(auto_repaired) WHERE auto_repaired = FALSE;

-- RLS - Fixed to use raw_user_meta_data instead of is_admin
ALTER TABLE escrow_repairs ENABLE ROW LEVEL SECURITY;

-- Admins can view all repairs (check admin_users table or raw_user_meta_data)
DROP POLICY IF EXISTS "Admins can view all repairs" ON escrow_repairs;
CREATE POLICY "Admins can view all repairs" ON escrow_repairs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'role' = 'admin'
        OR raw_user_meta_data->>'role' = 'moderator'
        OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
      )
    )
  );

-- Service role can insert repairs
CREATE POLICY "Service role can insert repairs" ON escrow_repairs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Authenticated users can view auto-repaired entries
CREATE POLICY "Users can view auto-repaired entries" ON escrow_repairs
  FOR SELECT USING (auto_repaired = true);

COMMENT ON TABLE escrow_repairs IS 'Tracks escrow reconciliation mismatches and auto-repairs';

GRANT SELECT ON escrow_repairs TO authenticated;
GRANT ALL ON escrow_repairs TO service_role;

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Escrow repairs table created';
  RAISE NOTICE '- Fixed RLS policies (raw_user_meta_data)';
  RAISE NOTICE '============================================';
END $$;
