-- ============================================
-- ADDITIONAL COMPOSITE INDEXES
-- Date: 2025-12-28
-- Purpose: Optimize common mobile app queries
-- ============================================

-- ===========================================
-- CONVERSATIONS & MESSAGES OPTIMIZATION
-- ===========================================

-- Optimize conversation list queries by updated_at
-- Note: conversations table uses conversation_participants junction table
-- so we index on updated_at for efficient sorting
CREATE INDEX IF NOT EXISTS idx_conversations_updated
ON conversations(updated_at DESC);

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
-- Note: Using 'location' column (not location_city) as per actual schema
-- This index already exists as idx_moments_location_status, skip
-- CREATE INDEX IF NOT EXISTS idx_moments_location_status_created
-- ON moments(location, status, created_at DESC)
-- WHERE status = 'active';

-- Optimize category-based discovery  
-- Note: Using 'category' column (not category_id) as per actual schema
-- This index already exists as idx_moments_category_date, skip
-- CREATE INDEX IF NOT EXISTS idx_moments_category_status_created
-- ON moments(category, status, created_at DESC)
-- WHERE status = 'active';

-- Note: idx_moments_price already exists, skip price index

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

-- Enable pg_trgm extension for fuzzy text search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Optimize user search by name
CREATE INDEX IF NOT EXISTS idx_users_name_trgm
ON users USING GIN (full_name gin_trgm_ops);

-- Optimize verified user lookups (kyc_status column)
-- Note: idx_users_kyc_status already exists
CREATE INDEX IF NOT EXISTS idx_users_kyc_verified_created
ON users(kyc_status, created_at DESC)
WHERE kyc_status = 'verified';

-- ===========================================
-- NOTIFICATIONS OPTIMIZATION
-- ===========================================

-- Optimize unread notification queries
-- Note: idx_notifications_unread already exists with (user_id, read)
-- Creating additional index for sorted unread lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_sorted
ON notifications(user_id, created_at DESC)
WHERE read = false;

-- ===========================================
-- BOOKINGS & REQUESTS OPTIMIZATION (REMOVED - tables no longer exist)
-- See: 20260103000001_remove_bookings_trip_requests.sql
-- ===========================================

-- ===========================================
-- REVIEWS & TRUST OPTIMIZATION
-- ===========================================

-- Optimize review aggregation queries
-- Note: using reviewed_id (not target_user_id), idx_reviews_reviewed_rating already exists
-- Skip creating duplicate index

-- Trust notes lookup optimization
-- Note: trust_notes table doesn't exist in current schema, skip

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
-- ANALYZE bookings; -- REMOVED - table no longer exists
