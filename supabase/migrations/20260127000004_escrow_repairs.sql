-- ============================================================================
// Escrow Repairs Table
// Tracks reconciliation mismatches and auto-repairs
// ============================================================================

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

CREATE INDEX idx_escrow_repairs_escrow ON escrow_repairs(escrow_id);
CREATE INDEX idx_escrow_repairs_detected ON escrow_repairs(detected_at DESC);
CREATE INDEX idx_escrow_repairs_auto_repaired ON escrow_repairs(auto_repaired) WHERE auto_repaired = FALSE;

-- RLS
ALTER TABLE escrow_repairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all repairs" ON escrow_repairs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "Service role can insert repairs" ON escrow_repairs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE escrow_repairs IS 'Tracks escrow reconciliation mismatches and auto-repairs';
