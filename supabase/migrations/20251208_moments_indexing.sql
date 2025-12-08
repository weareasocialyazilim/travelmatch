-- ============================================
-- MOMENTS TABLE PERFORMANCE INDEXING
-- Date: December 8, 2024
-- Purpose: Critical query pattern optimization
-- Priority: HIGH - Production performance issue
-- ============================================

-- ============================================
-- CRITICAL INDEXES FOR MOMENTS TABLE
-- ============================================

-- 1. Most Common Query: Search by location and date
-- Usage: WHERE location = ? AND date >= ? AND status = 'active'
-- Benefit: 10x-50x faster search queries
CREATE INDEX IF NOT EXISTS idx_moments_location_date_status 
ON moments(location, date, status) 
WHERE status = 'active';

-- 2. Category Browsing
-- Usage: WHERE category = ? AND status = 'active' ORDER BY created_at DESC
-- Benefit: Fast category navigation
CREATE INDEX IF NOT EXISTS idx_moments_category_created 
ON moments(category, created_at DESC) 
WHERE status = 'active';

-- 3. User's Moments List
-- Usage: WHERE user_id = ? ORDER BY created_at DESC
-- Benefit: Fast profile page loading
CREATE INDEX IF NOT EXISTS idx_moments_user_created 
ON moments(user_id, created_at DESC);

-- 4. Availability Search
-- Usage: WHERE date >= ? AND current_participants < max_participants
-- Benefit: "Available spots" filtering
CREATE INDEX IF NOT EXISTS idx_moments_availability 
ON moments(date, current_participants, max_participants) 
WHERE status = 'active';

-- 5. Price Range Filtering
-- Usage: WHERE price BETWEEN ? AND ? AND status = 'active'
-- Benefit: Price-based search
CREATE INDEX IF NOT EXISTS idx_moments_price_status 
ON moments(price, status) 
WHERE status = 'active';

-- 6. Location-based Geospatial Search (PostGIS)
-- Usage: WHERE ST_DWithin(coordinates, ST_MakePoint(?, ?), radius)
-- Benefit: "Near me" queries (crucial for travel app)
CREATE INDEX IF NOT EXISTS idx_moments_coordinates_gist 
ON moments USING GIST(coordinates) 
WHERE status = 'active';

-- 7. Featured Content
-- Usage: WHERE is_featured = true AND status = 'active'
-- Benefit: Homepage/featured section
CREATE INDEX IF NOT EXISTS idx_moments_featured 
ON moments(is_featured, created_at DESC) 
WHERE is_featured = true AND status = 'active';

-- 8. Status-based filtering
-- Usage: WHERE status = ? ORDER BY created_at DESC
-- Benefit: Admin panel, status monitoring
CREATE INDEX IF NOT EXISTS idx_moments_status_created 
ON moments(status, created_at DESC);

-- 9. Full-text search preparation (optional but recommended)
-- Usage: WHERE title ILIKE ? OR description ILIKE ?
-- Note: Will be used for text search functionality
CREATE INDEX IF NOT EXISTS idx_moments_title_trgm 
ON moments USING GIN(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_moments_description_trgm 
ON moments USING GIN(description gin_trgm_ops);

-- Enable pg_trgm extension if not already enabled (for text search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- RELATED TABLES INDEXING
-- ============================================

-- Requests table optimization
CREATE INDEX IF NOT EXISTS idx_requests_user_status 
ON requests(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_requests_moment_status 
ON requests(moment_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_requests_moment_pending 
ON requests(moment_id, status, created_at DESC) 
WHERE status = 'pending';

-- Messages table optimization
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender_created 
ON messages(sender_id, created_at DESC);

-- Conversations table optimization
CREATE INDEX IF NOT EXISTS idx_conversations_participant 
ON conversations USING GIN(participant_ids);

CREATE INDEX IF NOT EXISTS idx_conversations_moment 
ON conversations(moment_id) 
WHERE moment_id IS NOT NULL;

-- Favorites table optimization
CREATE INDEX IF NOT EXISTS idx_favorites_user_moment 
ON favorites(user_id, moment_id);

CREATE INDEX IF NOT EXISTS idx_favorites_moment 
ON favorites(moment_id);

-- Transactions table optimization
CREATE INDEX IF NOT EXISTS idx_transactions_user_created 
ON transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_moment 
ON transactions(moment_id) 
WHERE moment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_status 
ON transactions(status, created_at DESC);

-- ============================================
-- INDEX STATISTICS & VERIFICATION
-- ============================================

-- Update table statistics for query planner
ANALYZE moments;
ANALYZE requests;
ANALYZE messages;
ANALYZE conversations;
ANALYZE favorites;
ANALYZE transactions;

-- ============================================
-- PERFORMANCE MONITORING QUERIES
-- ============================================

COMMENT ON INDEX idx_moments_location_date_status IS 
'Critical composite index for location + date + status queries. 
Expected usage: High (primary search pattern).
Created: 2024-12-08';

COMMENT ON INDEX idx_moments_coordinates_gist IS 
'PostGIS spatial index for geolocation queries.
Usage: "Find moments near me" functionality.
Performance: Enables sub-second geo-queries.
Created: 2024-12-08';

-- Verification query (run after deployment)
/*
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('moments', 'requests', 'messages', 'conversations')
ORDER BY tablename, idx_scan DESC;

-- Expected output: All indexes should show usage within 24 hours
*/

-- ============================================
-- QUERY PERFORMANCE COMPARISON
-- ============================================

/*
-- BEFORE (Sequential Scan):
EXPLAIN ANALYZE 
SELECT * FROM moments 
WHERE location = 'Istanbul' 
  AND date >= NOW() 
  AND status = 'active'
ORDER BY created_at DESC 
LIMIT 20;
-- Expected: Seq Scan on moments (cost=0.00..1500.00 rows=1000)
-- Execution time: 500-2000ms ❌

-- AFTER (Index Scan):
EXPLAIN ANALYZE 
SELECT * FROM moments 
WHERE location = 'Istanbul' 
  AND date >= NOW() 
  AND status = 'active'
ORDER BY created_at DESC 
LIMIT 20;
-- Expected: Index Scan using idx_moments_location_date_status (cost=0.42..50.00 rows=20)
-- Execution time: 5-50ms ✅
-- Performance improvement: 10x-100x faster
*/

-- ============================================
-- MAINTENANCE RECOMMENDATIONS
-- ============================================

/*
Weekly maintenance (automated via cron):
  - ANALYZE moments; -- Update query planner statistics
  
Monthly maintenance:
  - SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0; -- Find unused indexes
  - REINDEX TABLE CONCURRENTLY moments; -- Rebuild fragmented indexes
  
Quarterly review:
  - Monitor index size growth
  - Review slow query logs
  - Adjust indexes based on actual usage patterns
*/

-- ============================================
-- ROLLBACK (if needed)
-- ============================================

/*
-- Drop all created indexes:
DROP INDEX IF EXISTS idx_moments_location_date_status;
DROP INDEX IF EXISTS idx_moments_category_created;
DROP INDEX IF EXISTS idx_moments_user_created;
DROP INDEX IF EXISTS idx_moments_availability;
DROP INDEX IF EXISTS idx_moments_price_status;
DROP INDEX IF EXISTS idx_moments_coordinates_gist;
DROP INDEX IF EXISTS idx_moments_featured;
DROP INDEX IF EXISTS idx_moments_status_created;
DROP INDEX IF EXISTS idx_moments_title_trgm;
DROP INDEX IF EXISTS idx_moments_description_trgm;
DROP INDEX IF EXISTS idx_requests_user_status;
DROP INDEX IF EXISTS idx_requests_moment_status;
DROP INDEX IF EXISTS idx_requests_moment_pending;
DROP INDEX IF EXISTS idx_messages_conversation_created;
DROP INDEX IF EXISTS idx_messages_sender_created;
DROP INDEX IF EXISTS idx_conversations_participant;
DROP INDEX IF EXISTS idx_conversations_moment;
DROP INDEX IF EXISTS idx_favorites_user_moment;
DROP INDEX IF EXISTS idx_favorites_moment;
DROP INDEX IF EXISTS idx_transactions_user_created;
DROP INDEX IF EXISTS idx_transactions_moment;
DROP INDEX IF EXISTS idx_transactions_status;
*/
