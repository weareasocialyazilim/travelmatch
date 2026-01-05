-- ============================================
-- PERFORMANCE INDEXES MIGRATION
-- Date: 2025-12-19
-- Note: Using regular CREATE INDEX (not CONCURRENTLY)
-- for Supabase CLI compatibility
-- ============================================

-- Escrow transactions indexes
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_moment_id
ON escrow_transactions(moment_id);

CREATE INDEX IF NOT EXISTS idx_escrow_transactions_status_created
ON escrow_transactions(status, created_at);

CREATE INDEX IF NOT EXISTS idx_escrow_transactions_expires
ON escrow_transactions(expires_at) WHERE status = 'pending';

-- Moments performance indexes
CREATE INDEX IF NOT EXISTS idx_moments_status_created
ON moments(status, created_at);

CREATE INDEX IF NOT EXISTS idx_moments_user_status
ON moments(user_id, status);

-- Messages performance indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
ON messages(conversation_id, created_at);

-- Proof verifications indexes
CREATE INDEX IF NOT EXISTS idx_proof_verifications_moment_status
ON proof_verifications(moment_id, status);

CREATE INDEX IF NOT EXISTS idx_proof_verifications_user_status
ON proof_verifications(user_id, status);
