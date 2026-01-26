-- ============================================
-- ADDITIONAL PERFORMANCE INDEXES
-- Date: 2026-01-26
-- Purpose: Optimize common query patterns identified in Edge Functions
-- ============================================

-- ============================================
-- TRANSACTIONS INDEXES
-- Common query: WHERE status = ? AND created_at >= ?
-- ============================================
CREATE INDEX IF NOT EXISTS idx_transactions_status_created_at
ON transactions(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_sender_created
ON transactions(sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_recipient_created
ON transactions(recipient_id, created_at DESC);

-- ============================================
-- AUDIT LOGS INDEXES
-- Common query: WHERE user_id = ? AND event = ? ORDER BY timestamp DESC
-- ============================================
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_event_timestamp
ON audit_logs(user_id, event, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_category_timestamp
ON audit_logs(category, timestamp DESC);

-- ============================================
-- GIFTS INDEXES
-- Common query: WHERE user_id = ? AND status = ?
-- ============================================
CREATE INDEX IF NOT EXISTS idx_gifts_user_status
ON gifts(user_id, status);

CREATE INDEX IF NOT EXISTS idx_gifts_moment_status
ON gifts(moment_id, status);

-- ============================================
-- CONVERSATIONS INDEXES
-- Common query: WHERE user1_id = ? OR user2_id = ?
-- ============================================
CREATE INDEX IF NOT EXISTS idx_conversations_user1
ON conversations(user1_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user2
ON conversations(user2_id);

-- ============================================
-- BANK ACCOUNTS INDEXES
-- Common query: WHERE user_id = ? AND is_active = true AND is_default = true
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_active_default
ON bank_accounts(user_id, is_active, is_default);

-- ============================================
-- MOMENTS (for moments list queries)
-- Common query: WHERE status = ? ORDER BY created_at DESC
-- ============================================
CREATE INDEX IF NOT EXISTS idx_moments_status_created_desc
ON moments(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_moments_user_status_created
ON moments(user_id, status, created_at DESC);

-- ============================================
-- CLAIMS INDEXES
-- Common query: WHERE moment_id = ? AND status = ?
-- ============================================
CREATE INDEX IF NOT EXISTS idx_claims_moment_status
ON claims(moment_id, status);

CREATE INDEX IF NOT EXISTS idx_claims_user_status
ON claims(user_id, status);

-- ============================================
-- PROOFS INDEXES
-- Common query: WHERE user_id = ? AND status = ?
-- ============================================
CREATE INDEX IF NOT EXISTS idx_proofs_user_status_created
ON proof_verifications(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_proofs_moment_status
ON proof_verifications(moment_id, status);

-- ============================================
-- WALLET TRANSACTIONS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_created
ON coin_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type_created
ON coin_transactions(type, created_at DESC);

-- ============================================
-- NOTIFICATIONS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
ON notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_type_created
ON notifications(user_id, type, created_at DESC);

-- ============================================
-- REPORTS (ADMIN) INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reports_type_status
ON reports(type, status);

CREATE INDEX IF NOT EXISTS idx_reports_reporter_status
ON reports(reporter_id, status);

CREATE INDEX IF NOT EXISTS idx_reports_reviewed_status
ON reports(reviewed_id, status);

-- ============================================
-- TRUST NOTES INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_trust_notes_recipient_created
ON trust_notes(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trust_notes_approved
ON trust_notes(is_approved, created_at DESC);

-- ============================================
-- DEVICES (PUSH NOTIFICATIONS) INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_devices_user_platform
ON user_devices(user_id, platform);

CREATE INDEX IF NOT EXISTS idx_devices_token
ON user_devices(token);

-- ============================================
-- STORAGE UPLOADS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_storage_uploads_user_created
ON storage_uploads(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_storage_uploads_bucket
ON storage_uploads(bucket_name, created_at DESC);

-- ============================================
-- COMMENTS/REVIEWS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reviews_moment_created
ON reviews(moment_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_user_created
ON reviews(user_id, created_at DESC);

-- ============================================
-- SUBSCRIPTIONS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
ON subscriptions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_status
ON subscriptions(expires_at, status);

-- ============================================
-- RATE LIMIT ENTRIES INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_rate_limit_key_expiry
ON rate_limit_entries(key, expires_at);

COMMENT ON INDEX idx_transactions_status_created_at IS 'Optimizes transaction list queries with status filter';
COMMENT ON INDEX idx_audit_logs_user_event_timestamp IS 'Optimizes audit log filtering by user and event';
COMMENT ON INDEX idx_conversations_user1 IS 'Optimizes conversation lookups for user1';
COMMENT ON INDEX idx_bank_accounts_user_active_default IS 'Optimizes default bank account lookup';
