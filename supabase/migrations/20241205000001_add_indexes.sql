-- Lovendo Indexes Migration
-- Version: 1.0.0
-- Created: 2024-12-05
-- Description: Performance indexes for all tables

-- ============================================
-- USERS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating DESC);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified) WHERE verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);

-- ============================================
-- MOMENTS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_moments_user_id ON moments(user_id);
CREATE INDEX IF NOT EXISTS idx_moments_category ON moments(category);
CREATE INDEX IF NOT EXISTS idx_moments_status ON moments(status);
CREATE INDEX IF NOT EXISTS idx_moments_date ON moments(date);
CREATE INDEX IF NOT EXISTS idx_moments_location ON moments(location);
CREATE INDEX IF NOT EXISTS idx_moments_coordinates ON moments USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_moments_price ON moments(price);
CREATE INDEX IF NOT EXISTS idx_moments_created_at ON moments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moments_is_featured ON moments(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_moments_active ON moments(status, date) WHERE status = 'active';

-- Composite indexes for common queries (N+1 prevention)
CREATE INDEX IF NOT EXISTS idx_moments_user_status ON moments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_moments_status_created ON moments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moments_category_status ON moments(category, status);
CREATE INDEX IF NOT EXISTS idx_moments_location_status ON moments(location, status) WHERE status = 'active';

-- ============================================
-- REQUESTS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_requests_moment_id ON requests(moment_id);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_pending ON requests(moment_id, status) WHERE status = 'pending';

-- Composite indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_requests_user_status ON requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_requests_moment_status ON requests(moment_id, status);
CREATE INDEX IF NOT EXISTS idx_requests_status_created ON requests(status, created_at DESC);

-- ============================================
-- CONVERSATIONS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_conversations_participant_ids ON conversations USING GIN(participant_ids);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_moment_id ON conversations(moment_id);

-- ============================================
-- MESSAGES INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, read_at) WHERE read_at IS NULL;

-- ============================================
-- REVIEWS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_moment_id ON reviews(moment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================
-- NOTIFICATIONS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;

-- ============================================
-- REPORTS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_moment_id ON reports(reported_moment_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_pending ON reports(status) WHERE status = 'pending';

-- ============================================
-- BLOCKS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_blocks_blocker_id ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON blocks(blocked_id);

-- ============================================
-- FAVORITES INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_moment_id ON favorites(moment_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- ============================================
-- TRANSACTIONS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_moment_id ON transactions(moment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Composite indexes for transaction filtering and reporting
CREATE INDEX IF NOT EXISTS idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type_status ON transactions(type, status);
CREATE INDEX IF NOT EXISTS idx_transactions_status_created ON transactions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_moment_status ON transactions(moment_id, status);

-- ============================================
-- MESSAGES INDEXES (Enhanced)
-- ============================================
-- Covering index for message queries with timestamps
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON messages(sender_id, created_at DESC);

-- ============================================
-- REVIEWS INDEXES (Enhanced)
-- ============================================
-- Composite indexes for review queries
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_rating ON reviews(reviewed_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_moment_rating ON reviews(moment_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_created ON reviews(reviewed_id, created_at DESC);

-- ============================================
-- USERS INDEXES (Enhanced)
-- ============================================
-- Performance indexes for user search and filtering
CREATE INDEX IF NOT EXISTS idx_users_location_verified ON users(location, verified) WHERE verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_rating_verified ON users(rating DESC, verified) WHERE verified = TRUE;

-- ============================================
-- PERFORMANCE ANALYSIS
-- ============================================
-- Use these queries to analyze index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes WHERE schemaname = 'public' ORDER BY idx_scan;
--
-- Check index size:
-- SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid))
-- FROM pg_stat_user_indexes WHERE schemaname = 'public' ORDER BY pg_relation_size(indexrelid) DESC;
