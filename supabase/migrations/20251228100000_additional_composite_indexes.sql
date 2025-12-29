-- ============================================
-- ADDITIONAL COMPOSITE INDEXES
-- Date: 2025-12-28
-- Purpose: Optimize common mobile app queries
-- ============================================

-- ===========================================
-- CONVERSATIONS & MESSAGES OPTIMIZATION
-- ===========================================

-- Optimize conversation list queries (participant + last message)
CREATE INDEX IF NOT EXISTS idx_conversations_participant_updated
ON conversations(participant_1, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_participant2_updated
ON conversations(participant_2, updated_at DESC);

-- Optimize unread message count queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_read
ON messages(conversation_id, read_at) WHERE read_at IS NULL;

-- Optimize message sender lookup for decryption
CREATE INDEX IF NOT EXISTS idx_messages_sender_type
ON messages(sender_id, type) WHERE type = 'text';

-- ===========================================
-- MOMENTS & DISCOVERY OPTIMIZATION
-- ===========================================

-- Optimize moment discovery by location + status
CREATE INDEX IF NOT EXISTS idx_moments_location_status_created
ON moments(location_city, status, created_at DESC)
WHERE status = 'active';

-- Optimize category-based discovery
CREATE INDEX IF NOT EXISTS idx_moments_category_status_created
ON moments(category_id, status, created_at DESC)
WHERE status = 'active';

-- Optimize price range filtering
CREATE INDEX IF NOT EXISTS idx_moments_price_status
ON moments(price, status)
WHERE status = 'active';

-- Optimize user's active moments lookup
CREATE INDEX IF NOT EXISTS idx_moments_user_active
ON moments(user_id, created_at DESC)
WHERE status = 'active' OR status = 'draft';

-- ===========================================
-- TRANSACTIONS & PAYMENTS OPTIMIZATION
-- ===========================================

-- Optimize user transaction history
CREATE INDEX IF NOT EXISTS idx_transactions_user_created
ON transactions(user_id, created_at DESC);

-- Optimize pending transaction lookups
CREATE INDEX IF NOT EXISTS idx_transactions_status_type
ON transactions(status, type)
WHERE status IN ('pending', 'processing');

-- ===========================================
-- USER & PROFILE OPTIMIZATION
-- ===========================================

-- Optimize user search by name
CREATE INDEX IF NOT EXISTS idx_users_name_trgm
ON users USING GIN (full_name gin_trgm_ops);

-- Optimize verified user lookups
CREATE INDEX IF NOT EXISTS idx_users_kyc_verified
ON users(is_kyc_verified, created_at DESC)
WHERE is_kyc_verified = true;

-- ===========================================
-- NOTIFICATIONS OPTIMIZATION
-- ===========================================

-- Optimize unread notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
ON notifications(user_id, created_at DESC)
WHERE read_at IS NULL;

-- ===========================================
-- BOOKINGS & REQUESTS OPTIMIZATION
-- ===========================================

-- Optimize booking status lookups
CREATE INDEX IF NOT EXISTS idx_bookings_user_status
ON bookings(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_moment_status
ON bookings(moment_id, status);

-- Optimize trip request queries
CREATE INDEX IF NOT EXISTS idx_trip_requests_user_status
ON trip_requests(user_id, status, created_at DESC);

-- ===========================================
-- REVIEWS & TRUST OPTIMIZATION
-- ===========================================

-- Optimize review aggregation queries
CREATE INDEX IF NOT EXISTS idx_reviews_target_rating
ON reviews(target_user_id, rating);

-- Trust notes lookup optimization
CREATE INDEX IF NOT EXISTS idx_trust_notes_target_created
ON trust_notes(target_user_id, created_at DESC);

-- ===========================================
-- FAVORITES & SAVED OPTIMIZATION
-- ===========================================

-- Optimize favorites lookup
CREATE INDEX IF NOT EXISTS idx_favorites_user_moment
ON favorites(user_id, moment_id, created_at DESC);

-- ===========================================
-- ANALYZE TABLES
-- ===========================================

-- Update statistics for query planner
ANALYZE conversations;
ANALYZE messages;
ANALYZE moments;
ANALYZE transactions;
ANALYZE users;
ANALYZE notifications;
ANALYZE bookings;
