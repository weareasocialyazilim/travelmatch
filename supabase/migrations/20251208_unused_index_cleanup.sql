-- ============================================
-- UNUSED INDEX DETECTION AND CLEANUP
-- Date: December 8, 2024
-- Purpose: Identify and remove unused indexes
-- ============================================

-- ============================================
-- STEP 1: DETECT UNUSED INDEXES
-- ============================================

-- Find indexes with zero scans (never used)
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as size,
  pg_relation_size(indexrelid) as size_bytes
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0  -- Never used
  AND indexrelid::regclass::text NOT LIKE '%_pkey'  -- Exclude primary keys
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find low-usage indexes (< 100 scans but taking space)
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  pg_size_pretty(pg_relation_size(indexrelid)) as size,
  CASE 
    WHEN idx_scan = 0 THEN 'NEVER USED - SAFE TO DROP'
    WHEN idx_scan < 10 THEN 'RARELY USED - REVIEW'
    WHEN idx_scan < 100 THEN 'LOW USAGE - MONITOR'
    ELSE 'ACTIVE'
  END as recommendation
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan < 100
  AND indexrelid::regclass::text NOT LIKE '%_pkey'
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;

-- ============================================
-- STEP 2: ANALYZE DUPLICATE/REDUNDANT INDEXES
-- ============================================

-- Find duplicate indexes (same columns, different names)
SELECT 
  t.tablename,
  array_agg(t.indexname) as duplicate_indexes,
  t.indexdef,
  pg_size_pretty(sum(pg_relation_size(t.indexrelid))) as total_wasted_space
FROM (
  SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef,
    indexrelid
  FROM pg_indexes
  WHERE schemaname = 'public'
) t
GROUP BY t.tablename, t.indexdef
HAVING count(*) > 1
ORDER BY sum(pg_relation_size(t.indexrelid)) DESC;

-- Find redundant indexes (covered by other indexes)
-- Example: idx(a,b,c) makes idx(a) and idx(a,b) redundant
WITH index_columns AS (
  SELECT 
    schemaname,
    tablename,
    indexname,
    array_agg(attname ORDER BY attnum) as columns
  FROM pg_index i
  JOIN pg_class c ON c.oid = i.indexrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
  WHERE n.nspname = 'public'
  GROUP BY schemaname, tablename, indexname
)
SELECT 
  i1.tablename,
  i1.indexname as potentially_redundant,
  i1.columns as redundant_columns,
  i2.indexname as covered_by,
  i2.columns as covering_columns
FROM index_columns i1
JOIN index_columns i2 ON i1.tablename = i2.tablename
WHERE i1.indexname != i2.indexname
  AND i1.columns <@ i2.columns  -- i1 is subset of i2
ORDER BY i1.tablename, i1.indexname;

-- ============================================
-- STEP 3: CLEANUP RECOMMENDATIONS
-- ============================================

-- Generate DROP statements for unused indexes
SELECT 
  format('-- %s: %s scans, size: %s', 
    indexname, 
    idx_scan, 
    pg_size_pretty(pg_relation_size(indexrelid))
  ) as comment,
  format('DROP INDEX IF EXISTS %I.%I;', schemaname, indexname) as drop_statement
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexrelid::regclass::text NOT LIKE '%_pkey'
  AND indexrelid::regclass::text NOT LIKE '%_fkey'
  AND indexrelid::regclass::text NOT LIKE 'idx_audit%'  -- Keep audit indexes even if unused
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================
-- STEP 4: SAFE CLEANUP (CONSERVATIVE)
-- ============================================

-- Only drop indexes that meet ALL criteria:
-- 1. Zero scans (never used)
-- 2. Older than 7 days (had time to be used)
-- 3. Not system-generated
-- 4. Not primary/foreign keys
-- 5. Not audit/compliance related

DO $$
DECLARE
  idx_record RECORD;
  total_freed BIGINT := 0;
BEGIN
  -- Log cleanup start
  RAISE NOTICE 'Starting unused index cleanup at %', NOW();
  
  FOR idx_record IN 
    SELECT 
      schemaname,
      tablename,
      indexname,
      pg_relation_size(indexrelid) as size_bytes
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
      AND idx_scan = 0
      AND indexrelid::regclass::text NOT LIKE '%_pkey'
      AND indexrelid::regclass::text NOT LIKE '%_fkey'
      AND indexrelid::regclass::text NOT LIKE 'idx_audit%'
      AND pg_relation_size(indexrelid) > 0
      -- Only drop if database has been running > 7 days
      AND (SELECT pg_postmaster_start_time()) < NOW() - INTERVAL '7 days'
  LOOP
    RAISE NOTICE 'Dropping unused index: %.% (size: %)', 
      idx_record.schemaname, 
      idx_record.indexname,
      pg_size_pretty(idx_record.size_bytes);
    
    EXECUTE format('DROP INDEX IF EXISTS %I.%I', 
      idx_record.schemaname, 
      idx_record.indexname
    );
    
    total_freed := total_freed + idx_record.size_bytes;
  END LOOP;
  
  RAISE NOTICE 'Cleanup complete. Total space freed: %', pg_size_pretty(total_freed);
END $$;

-- ============================================
-- STEP 5: INDEX BLOAT DETECTION
-- ============================================

-- Detect bloated indexes (fragmented, need REINDEX)
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  pg_size_pretty(pg_table_size(tablename::regclass)) as table_size,
  round(100.0 * pg_relation_size(indexrelid) / NULLIF(pg_table_size(tablename::regclass), 0), 2) as index_ratio,
  CASE 
    WHEN pg_relation_size(indexrelid) > pg_table_size(tablename::regclass) * 0.5 THEN 'BLOATED - REINDEX RECOMMENDED'
    WHEN pg_relation_size(indexrelid) > pg_table_size(tablename::regclass) * 0.3 THEN 'MONITOR CLOSELY'
    ELSE 'HEALTHY'
  END as status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND pg_relation_size(indexrelid) > 1024 * 1024  -- > 1MB
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================
-- STEP 6: MANUAL CLEANUP (SAFE LIST)
-- ============================================

-- These indexes are confirmed unused and safe to drop:
-- Review before executing!

/*
-- Example unused indexes (check your specific database):

-- If events table doesn't use anonymous_id filtering:
DROP INDEX IF EXISTS public.idx_events_anonymous;

-- If no geospatial queries are performed:
-- DROP INDEX IF EXISTS public.idx_moments_coordinates_gist;  -- CAREFUL! This is critical

-- If full-text search is not implemented yet:
DROP INDEX IF EXISTS public.idx_moments_title_trgm;
DROP INDEX IF EXISTS public.idx_moments_description_trgm;

-- If featured moments are not used:
-- DROP INDEX IF EXISTS public.idx_moments_featured;  -- CAREFUL! Check usage first

-- Custom indexes that were created for testing:
-- DROP INDEX IF EXISTS public.idx_test_*;
*/

-- ============================================
-- STEP 7: PREVENT FUTURE INDEX BLOAT
-- ============================================

-- Create monitoring function
CREATE OR REPLACE FUNCTION monitor_unused_indexes()
RETURNS TABLE (
  table_name TEXT,
  index_name TEXT,
  scans BIGINT,
  size TEXT,
  age INTERVAL,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.tablename::TEXT,
    s.indexname::TEXT,
    s.idx_scan,
    pg_size_pretty(pg_relation_size(s.indexrelid)),
    NOW() - pg_stat_get_last_analyze_time(s.relid),
    CASE 
      WHEN s.idx_scan = 0 AND NOW() - pg_stat_get_last_analyze_time(s.relid) > INTERVAL '7 days' 
        THEN 'DROP - Never used in 7 days'
      WHEN s.idx_scan < 10 AND pg_relation_size(s.indexrelid) > 10485760 
        THEN 'REVIEW - Low usage, large size'
      WHEN s.idx_scan > 1000 
        THEN 'KEEP - Actively used'
      ELSE 'MONITOR'
    END
  FROM pg_stat_user_indexes s
  WHERE s.schemaname = 'public'
    AND s.indexrelid::regclass::text NOT LIKE '%_pkey'
  ORDER BY s.idx_scan ASC, pg_relation_size(s.indexrelid) DESC;
END;
$$ LANGUAGE plpgsql;

-- Schedule weekly index audit (requires pg_cron extension)
/*
SELECT cron.schedule(
  'unused-index-audit',
  '0 3 * * 0',  -- Every Sunday at 3 AM
  $$
    SELECT * FROM monitor_unused_indexes() 
    WHERE recommendation LIKE 'DROP%' OR recommendation LIKE 'REVIEW%';
  $$
);
*/

-- ============================================
-- STEP 8: REINDEX BLOATED INDEXES
-- ============================================

-- Rebuild fragmented indexes (CONCURRENTLY = no locks)
DO $$
DECLARE
  idx_record RECORD;
BEGIN
  FOR idx_record IN 
    SELECT 
      schemaname,
      indexname
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
      AND pg_relation_size(indexrelid) > pg_table_size(tablename::regclass) * 0.3
  LOOP
    RAISE NOTICE 'Reindexing bloated index: %.%', 
      idx_record.schemaname, 
      idx_record.indexname;
    
    EXECUTE format('REINDEX INDEX CONCURRENTLY %I.%I', 
      idx_record.schemaname, 
      idx_record.indexname
    );
  END LOOP;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- After cleanup, verify improvements:

-- 1. Check total index size reduction
SELECT 
  pg_size_pretty(sum(pg_relation_size(indexrelid))) as total_index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public';

-- 2. List remaining indexes
SELECT 
  tablename,
  count(*) as index_count,
  pg_size_pretty(sum(pg_relation_size(indexrelid))) as total_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY sum(pg_relation_size(indexrelid)) DESC;

-- 3. Confirm all active indexes are being used
SELECT 
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexrelid::regclass::text NOT LIKE '%_pkey'
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC
LIMIT 20;

-- ============================================
-- BEST PRACTICES SUMMARY
-- ============================================

COMMENT ON FUNCTION monitor_unused_indexes IS '
Index Cleanup Best Practices:

1. DETECTION:
   - Run detection queries weekly
   - Wait at least 7 days before dropping new indexes
   - Check idx_scan = 0 AND age > 7 days

2. SAFETY:
   - Never drop primary key indexes (_pkey)
   - Never drop foreign key indexes (_fkey)
   - Keep audit/compliance indexes even if unused
   - Test in staging before production

3. EXCEPTIONS (Keep even if unused):
   - Audit log indexes (compliance)
   - Security event indexes (incident response)
   - Unique constraints (data integrity)
   - Indexes for scheduled batch jobs

4. MAINTENANCE:
   - Weekly: ANALYZE tables
   - Monthly: Review unused indexes
   - Quarterly: REINDEX bloated indexes
   - Yearly: Full index strategy review

5. MONITORING:
   - Alert if total index size > 50% of table size
   - Alert if idx_scan = 0 for 30+ days
   - Monitor query performance after drops

Created: 2024-12-08
';
