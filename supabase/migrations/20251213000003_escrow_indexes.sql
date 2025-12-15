-- ============================================
-- ESCROW INDEXES - Performance Optimization
-- ============================================
-- Created: 2025-12-13
-- Purpose: Add missing indexes for escrow_transactions table

-- Sender queries (getUserEscrowTransactions)
CREATE INDEX IF NOT EXISTS idx_escrow_sender_status
ON escrow_transactions(sender_id, status);

-- Recipient queries
CREATE INDEX IF NOT EXISTS idx_escrow_recipient_status
ON escrow_transactions(recipient_id, status);

-- Expiry cleanup job (pg_cron)
CREATE INDEX IF NOT EXISTS idx_escrow_status_expires
ON escrow_transactions(status, expires_at)
WHERE status = 'pending';

-- Moment-based queries
CREATE INDEX IF NOT EXISTS idx_escrow_moment
ON escrow_transactions(moment_id)
WHERE moment_id IS NOT NULL;

-- Created date for sorting
CREATE INDEX IF NOT EXISTS idx_escrow_created
ON escrow_transactions(created_at DESC);

-- Composite for common query pattern
CREATE INDEX IF NOT EXISTS idx_escrow_sender_created
ON escrow_transactions(sender_id, created_at DESC)
WHERE status = 'pending';

-- Analyze table for query planner
ANALYZE escrow_transactions;
