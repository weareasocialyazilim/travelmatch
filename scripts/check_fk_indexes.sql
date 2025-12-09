-- Check for foreign keys without indexes
-- This can cause performance issues on JOIN queries

WITH foreign_keys AS (
    SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
),
table_indexes AS (
    SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
)
SELECT
    fk.table_name,
    fk.column_name,
    fk.foreign_table_name,
    fk.foreign_column_name,
    fk.constraint_name,
    CASE
        WHEN ti.indexname IS NOT NULL THEN 'INDEXED: ' || ti.indexname
        ELSE '❌ NO INDEX'
    END AS index_status
FROM foreign_keys fk
LEFT JOIN table_indexes ti
    ON ti.tablename = fk.table_name
    AND ti.indexdef LIKE '%' || fk.column_name || '%'
WHERE ti.indexname IS NULL  -- Only show unindexed FKs
ORDER BY fk.table_name, fk.column_name;
