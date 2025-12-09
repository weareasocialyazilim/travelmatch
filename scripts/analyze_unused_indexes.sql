-- Analyze unused indexes in the database
-- This query shows indexes that have never been scanned

WITH index_stats AS (
    SELECT
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        pg_size_pretty(pg_relation_size(indexrelid)) as size,
        pg_relation_size(indexrelid) as size_bytes
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
),
table_stats AS (
    SELECT
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_rows
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
)
SELECT
    i.tablename,
    i.indexname,
    i.idx_scan as scans,
    i.size,
    t.live_rows,
    t.inserts + t.updates + t.deletes as write_ops,
    CASE
        WHEN i.idx_scan = 0 AND t.live_rows > 0 THEN '🔴 NEVER USED'
        WHEN i.idx_scan < 10 AND t.live_rows > 100 THEN '🟡 RARELY USED'
        WHEN i.idx_scan > 100 THEN '🟢 ACTIVELY USED'
        ELSE '⚪ LOW DATA'
    END as status,
    -- Index definition for context
    pg_get_indexdef(i.indexrelid::regclass) as definition
FROM pg_stat_user_indexes i
JOIN table_stats t ON i.tablename = t.tablename AND i.schemaname = t.schemaname
WHERE i.schemaname = 'public'
    AND i.indexname NOT LIKE '%_pkey'  -- Exclude primary keys
    AND i.indexname NOT LIKE '%_key'   -- Exclude unique constraints
ORDER BY
    CASE
        WHEN i.idx_scan = 0 THEN 1
        WHEN i.idx_scan < 10 THEN 2
        ELSE 3
    END,
    i.size_bytes DESC;
