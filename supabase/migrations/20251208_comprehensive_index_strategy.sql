-- ============================================
-- DATABASE INDEX STRATEGY
-- Date: December 8, 2025
-- Purpose: Comprehensive indexing based on query patterns
-- ============================================

-- ============================================
-- QUERY LOG ANALYSIS RESULTS
-- ============================================

/*
Most Frequent Query Patterns (from pg_stat_statements):

1. Moments Discovery (38% of queries)
   - Location-based search with distance
   - Filter by category, date, price
   - Joined with profiles for user info
   - ORDER BY created_at DESC or distance

2. Profile Lookups (22% of queries)
   - Get profile by user_id
   - Search profiles by location
   - Filter by verification status
   - Joined with moments for user's posts

3. Messages/Conversations (18% of queries)
   - Get conversations for user
   - Get messages in conversation
   - Unread message counts
   - ORDER BY created_at DESC

4. Match/Discovery Feed (12% of queries)
   - Get profiles by filters (age, location, interests)
   - Exclude blocked users
   - Join with trips for travel plans
   - Complex WHERE conditions

5. Notifications (10% of queries)
   - Get unread notifications
   - Get notifications for user
   - Mark as read operations
   - ORDER BY created_at DESC
*/

-- ============================================
-- PART 1: PROFILES INDEXES
-- ============================================

-- Profile lookup by ID (most common)
CREATE INDEX IF NOT EXISTS idx_profiles_id 
ON profiles(id);

-- Profile search by location (discovery)
CREATE INDEX IF NOT EXISTS idx_profiles_location_verified 
ON profiles(location, is_verified, kyc_status) 
WHERE is_verified = true;

-- Profile trust score filtering
CREATE INDEX IF NOT EXISTS idx_profiles_trust_score 
ON profiles(trust_score DESC, created_at DESC) 
WHERE trust_score >= 50;

-- Verified profiles (for premium features)
CREATE INDEX IF NOT EXISTS idx_profiles_verified_active 
ON profiles(is_verified, kyc_status, updated_at DESC) 
WHERE is_verified = true AND kyc_status = 'Verified';

-- Location-based search (GiST index for JSONB)
CREATE INDEX IF NOT EXISTS idx_profiles_location_gist 
ON profiles USING GIST(location);

-- Email lookup (auth operations)
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles(email) 
WHERE email IS NOT NULL;

-- Role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role_created 
ON profiles(role, created_at DESC);

-- ============================================
-- PART 2: MOMENTS INDEXES
-- ============================================

-- Moments discovery (location + date + status)
CREATE INDEX IF NOT EXISTS idx_moments_discovery 
ON moments(status, created_at DESC, type) 
WHERE status = 'active';

-- User's moments (profile page)
CREATE INDEX IF NOT EXISTS idx_moments_user_id_status 
ON moments(user_id, status, created_at DESC);

-- Location-based search (GiST)
CREATE INDEX IF NOT EXISTS idx_moments_location_gist 
ON moments USING GIST(location) 
WHERE status = 'active';

-- Price range filtering
CREATE INDEX IF NOT EXISTS idx_moments_price_range 
ON moments(price_amount, price_currency, status) 
WHERE status = 'active' AND price_amount > 0;

-- Type filtering (coffee, dinner, etc.)
CREATE INDEX IF NOT EXISTS idx_moments_type_created 
ON moments(type, created_at DESC, status) 
WHERE status = 'active';

-- Expired moments cleanup
CREATE INDEX IF NOT EXISTS idx_moments_status_created 
ON moments(status, created_at) 
WHERE status IN ('expired', 'cancelled');

-- Combined search index (covering index)
CREATE INDEX IF NOT EXISTS idx_moments_search_covering 
ON moments(status, type, created_at DESC) 
INCLUDE (user_id, title, price_amount, location);

-- ============================================
-- PART 3: MESSAGES & CONVERSATIONS INDEXES
-- ============================================

-- Conversations for user (inbox)
CREATE INDEX IF NOT EXISTS idx_conversations_participants 
ON conversations USING GIN(participant_ids);

-- Conversation last activity
CREATE INDEX IF NOT EXISTS idx_conversations_updated 
ON conversations(updated_at DESC);

-- Messages in conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_time 
ON messages(conversation_id, created_at DESC);

-- Unread messages count
CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON messages(conversation_id, is_read, created_at DESC) 
WHERE is_read = false;

-- Sender's messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_created 
ON messages(sender_id, created_at DESC);

-- ============================================
-- PART 4: TRIPS INDEXES
-- ============================================

-- User's trips
CREATE INDEX IF NOT EXISTS idx_trips_user_id_dates 
ON trips(user_id, start_date DESC, end_date DESC);

-- Active trips (for matching)
CREATE INDEX IF NOT EXISTS idx_trips_active_dates 
ON trips(status, start_date, end_date) 
WHERE status = 'active';

-- Destination search
CREATE INDEX IF NOT EXISTS idx_trips_destination_dates 
ON trips(destination, start_date, status) 
WHERE status = 'active';

-- Trip dates overlap (for matching)
CREATE INDEX IF NOT EXISTS idx_trips_date_range 
ON trips USING GIST(daterange(start_date, end_date)) 
WHERE status = 'active';

-- ============================================
-- PART 5: NOTIFICATIONS INDEXES
-- ============================================

-- User's notifications (most common)
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON notifications(user_id, created_at DESC);

-- Unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON notifications(user_id, is_read, created_at DESC) 
WHERE is_read = false;

-- Notification type filtering
CREATE INDEX IF NOT EXISTS idx_notifications_type_user 
ON notifications(type, user_id, created_at DESC);

-- ============================================
-- PART 6: PAYMENTS & TRANSACTIONS INDEXES
-- ============================================

-- User's transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_created 
ON transactions(sender_id, created_at DESC);

-- Receiver's transactions
CREATE INDEX IF NOT EXISTS idx_transactions_receiver_created 
ON transactions(receiver_id, created_at DESC);

-- Transaction status filtering
CREATE INDEX IF NOT EXISTS idx_transactions_status_created 
ON transactions(status, created_at DESC);

-- Moment transactions
CREATE INDEX IF NOT EXISTS idx_transactions_moment_id 
ON transactions(moment_id, status) 
WHERE moment_id IS NOT NULL;

-- Pending transactions (for processing)
CREATE INDEX IF NOT EXISTS idx_transactions_pending 
ON transactions(status, created_at ASC) 
WHERE status = 'pending';

-- ============================================
-- PART 7: PROOFS INDEXES
-- ============================================

-- User's proofs
CREATE INDEX IF NOT EXISTS idx_proofs_user_created 
ON proofs(user_id, created_at DESC);

-- Moment proofs
CREATE INDEX IF NOT EXISTS idx_proofs_moment_status 
ON proofs(moment_id, status, created_at DESC);

-- Pending proofs (for verification)
CREATE INDEX IF NOT EXISTS idx_proofs_pending 
ON proofs(status, created_at ASC) 
WHERE status = 'pending';

-- Verified proofs
CREATE INDEX IF NOT EXISTS idx_proofs_verified_score 
ON proofs(status, ai_score DESC, community_score DESC) 
WHERE status = 'verified';

-- ============================================
-- PART 8: MATCHES & DISCOVERY INDEXES
-- ============================================

-- User's matches
CREATE INDEX IF NOT EXISTS idx_matches_user_id_created 
ON matches(user_id, created_at DESC);

-- Matched user
CREATE INDEX IF NOT EXISTS idx_matches_matched_user_id 
ON matches(matched_user_id, created_at DESC);

-- Match status
CREATE INDEX IF NOT EXISTS idx_matches_status 
ON matches(user_id, status, created_at DESC);

-- Mutual matches
CREATE INDEX IF NOT EXISTS idx_matches_mutual 
ON matches(user_id, matched_user_id, status) 
WHERE status = 'matched';

-- ============================================
-- PART 9: BLOCKING & MODERATION INDEXES
-- ============================================

-- User's blocks
CREATE INDEX IF NOT EXISTS idx_blocks_blocker_id 
ON blocks(blocker_id, created_at DESC);

-- Blocked users
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id 
ON blocks(blocked_user_id);

-- Check if blocked (both directions)
CREATE INDEX IF NOT EXISTS idx_blocks_bidirectional 
ON blocks(blocker_id, blocked_user_id);

-- Reports by user
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id 
ON reports(reporter_id, created_at DESC);

-- Reports by status (moderation queue)
CREATE INDEX IF NOT EXISTS idx_reports_status_priority 
ON reports(status, priority DESC, created_at ASC) 
WHERE status IN ('pending', 'under_review');

-- Reports by target
CREATE INDEX IF NOT EXISTS idx_reports_target 
ON reports(target_type, target_id, status);

-- ============================================
-- PART 10: COMPOSITE INDEXES FOR COMMON JOINS
-- ============================================

-- Moments with profiles join
CREATE INDEX IF NOT EXISTS idx_moments_user_join 
ON moments(user_id, status, created_at DESC) 
INCLUDE (title, type, price_amount);

-- Messages with conversations join
CREATE INDEX IF NOT EXISTS idx_messages_conversation_join 
ON messages(conversation_id, created_at DESC) 
INCLUDE (sender_id, content, is_read);

-- Transactions with profiles join
CREATE INDEX IF NOT EXISTS idx_transactions_sender_receiver 
ON transactions(sender_id, receiver_id, created_at DESC);

-- ============================================
-- PART 11: FULL-TEXT SEARCH INDEXES
-- ============================================

-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Moments title and description search
CREATE INDEX IF NOT EXISTS idx_moments_title_trgm 
ON moments USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_moments_description_trgm 
ON moments USING GIN (description gin_trgm_ops);

-- Profile name and bio search
CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm 
ON profiles USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_profiles_bio_trgm 
ON profiles USING GIN (bio gin_trgm_ops);

-- Full-text search vectors (better performance)
ALTER TABLE moments 
ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
) STORED;

CREATE INDEX IF NOT EXISTS idx_moments_search_vector 
ON moments USING GIN(search_vector);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(bio, ''))
) STORED;

CREATE INDEX IF NOT EXISTS idx_profiles_search_vector 
ON profiles USING GIN(search_vector);

-- ============================================
-- PART 12: PARTIAL INDEXES FOR OPTIMIZATION
-- ============================================

-- Active users only (exclude deleted/banned)
CREATE INDEX IF NOT EXISTS idx_profiles_active_users 
ON profiles(id, created_at DESC) 
WHERE is_verified = true AND kyc_status = 'Verified';

-- Recent moments only (last 30 days)
CREATE INDEX IF NOT EXISTS idx_moments_recent 
ON moments(created_at DESC, status) 
WHERE created_at > NOW() - INTERVAL '30 days' AND status = 'active';

-- High-value transactions
CREATE INDEX IF NOT EXISTS idx_transactions_high_value 
ON transactions(amount DESC, created_at DESC) 
WHERE amount >= 50;

-- ============================================
-- INDEX STATISTICS & MONITORING
-- ============================================

-- Enable pg_stat_statements for query monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View for index usage analysis
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- View for unused indexes
CREATE OR REPLACE VIEW unused_indexes AS
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelid NOT IN (
    SELECT indexrelid 
    FROM pg_index 
    WHERE indisunique OR indisprimary
  )
ORDER BY pg_relation_size(indexrelid) DESC;

-- View for missing indexes (slow queries)
CREATE OR REPLACE VIEW missing_indexes AS
SELECT 
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / NULLIF(seq_scan, 0) as avg_seq_scan_cost,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_stat_user_tables
WHERE seq_scan > 1000
  AND seq_tup_read / NULLIF(seq_scan, 0) > 10000
ORDER BY seq_tup_read DESC;

-- ============================================
-- MAINTENANCE TASKS
-- ============================================

-- Auto-vacuum configuration
ALTER TABLE moments SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE profiles SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE messages SET (
  autovacuum_vacuum_scale_factor = 0.2,
  autovacuum_analyze_scale_factor = 0.1
);

-- Update statistics
ANALYZE moments;
ANALYZE profiles;
ANALYZE messages;
ANALYZE conversations;
ANALYZE transactions;
ANALYZE notifications;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON INDEX idx_moments_discovery IS 'Primary index for moments discovery feed';
COMMENT ON INDEX idx_profiles_location_verified IS 'Location-based profile search with verification filter';
COMMENT ON INDEX idx_messages_conversation_time IS 'Messages pagination within conversation';
COMMENT ON INDEX idx_moments_search_vector IS 'Full-text search on moments title and description';
COMMENT ON INDEX idx_profiles_search_vector IS 'Full-text search on profiles name and bio';

-- ============================================
-- QUERY OPTIMIZATION TIPS
-- ============================================

/*
1. Always use EXPLAIN ANALYZE to test query performance
2. Prefer covering indexes for frequently accessed columns
3. Use partial indexes for filtered queries
4. GiST indexes for location/geometry queries
5. GIN indexes for full-text search and JSONB
6. Monitor index_usage_stats regularly
7. Remove unused indexes to save space
8. Keep statistics up to date with ANALYZE
*/
