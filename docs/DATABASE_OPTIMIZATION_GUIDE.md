# Lovendo Database Optimization Guide

## Overview

This guide provides actionable recommendations for optimizing database performance, ensuring
scalability, and maintaining operational excellence.

---

## Table of Contents

1. [Query Optimization](#query-optimization)
2. [Index Strategy](#index-strategy)
3. [RLS Performance](#rls-performance)
4. [Connection Management](#connection-management)
5. [Caching Strategies](#caching-strategies)
6. [Scaling Roadmap](#scaling-roadmap)
7. [Monitoring & Alerting](#monitoring--alerting)
8. [Maintenance Procedures](#maintenance-procedures)

---

## Query Optimization

### Common Anti-Patterns to Avoid

#### 1. N+1 Query Problem

```typescript
// ❌ BAD: N+1 queries
const moments = await supabase.from('moments').select('*');
for (const moment of moments.data) {
  const user = await supabase.from('users').select('*').eq('id', moment.user_id);
  // This creates N additional queries!
}

// ✅ GOOD: Single query with join
const moments = await supabase.from('moments').select(`
    *,
    user:users(id, full_name, avatar_url, rating)
  `);
```

#### 2. Selecting All Columns

```typescript
// ❌ BAD: Selecting all columns
const users = await supabase.from('users').select('*');

// ✅ GOOD: Select only needed columns
const users = await supabase.from('users').select('id, full_name, avatar_url, rating');
```

#### 3. Missing Pagination

```typescript
// ❌ BAD: Fetching all records
const moments = await supabase.from('moments').select('*');

// ✅ GOOD: Paginated with range
const moments = await supabase
  .from('moments')
  .select('*')
  .range(0, 19) // First 20 records
  .order('created_at', { ascending: false });
```

### Optimized Query Patterns

#### Feed Query (Home Screen)

```typescript
// Optimized feed query with all necessary joins
const { data: feed } = await supabase
  .from('moments')
  .select(
    `
    id,
    title,
    description,
    category,
    location,
    date,
    price,
    images,
    status,
    current_participants,
    max_participants,
    created_at,
    user:users!user_id(
      id,
      full_name,
      avatar_url,
      rating,
      verified
    ),
    favorite_count:favorites(count),
    is_favorited:favorites!inner(id)
  `,
  )
  .eq('status', 'active')
  .gt('date', new Date().toISOString())
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);
```

#### Conversation List Query

```typescript
// Optimized conversation list with last message
const { data: conversations } = await supabase
  .from('conversations')
  .select(
    `
    id,
    updated_at,
    moment:moments(id, title),
    last_message:messages!last_message_id(
      id,
      content,
      sender_id,
      created_at
    ),
    participants:conversation_participants(
      user:users(id, full_name, avatar_url)
    )
  `,
  )
  .contains('participant_ids', [userId])
  .order('updated_at', { ascending: false })
  .limit(50);
```

#### Nearby Moments (Geospatial)

```sql
-- Use the optimized RPC function
SELECT * FROM search_moments_nearby(
  p_latitude := 41.0082,
  p_longitude := 28.9784,
  p_radius_km := 25,
  p_category := 'adventure',
  p_limit := 20
);
```

---

## Index Strategy

### Index Audit Query

Run this monthly to find missing or unused indexes:

```sql
-- Find tables without primary key indexes on foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    CASE WHEN ix.indexname IS NULL THEN '❌ MISSING' ELSE '✅ EXISTS' END as index_status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN pg_indexes ix
    ON ix.tablename = tc.table_name
    AND ix.indexdef LIKE '%' || kcu.column_name || '%'
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Find unused indexes (candidates for removal)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
    AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find missing indexes (high seq_scan tables)
SELECT
    schemaname,
    tablename,
    seq_scan,
    idx_scan,
    CASE WHEN seq_scan > 0
         THEN ROUND(100.0 * idx_scan / (seq_scan + idx_scan), 2)
         ELSE 100 END as idx_scan_pct
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY seq_scan DESC
LIMIT 20;
```

### Recommended Index Additions

Based on common query patterns:

```sql
-- Covering index for moment feed (reduces heap lookups)
CREATE INDEX CONCURRENTLY idx_moments_feed_covering
ON moments(status, date DESC, created_at DESC)
INCLUDE (id, title, category, location, price, user_id, images, current_participants, max_participants)
WHERE status = 'active';

-- Partial index for pending escrow (reduces index size)
CREATE INDEX CONCURRENTLY idx_escrow_pending_expires
ON escrow_transactions(expires_at)
WHERE status = 'pending';

-- Composite index for user transaction history
CREATE INDEX CONCURRENTLY idx_transactions_user_history
ON transactions(user_id, created_at DESC, type)
INCLUDE (amount, status, description);

-- BRIN index for time-series data (messages)
CREATE INDEX CONCURRENTLY idx_messages_created_brin
ON messages USING BRIN(created_at);
```

### Index Maintenance

```sql
-- Rebuild bloated indexes (run during low-traffic periods)
REINDEX INDEX CONCURRENTLY idx_moments_coordinates;

-- Analyze tables to update statistics
ANALYZE moments;
ANALYZE messages;
ANALYZE transactions;

-- Check index bloat
SELECT
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;
```

---

## RLS Performance

### Optimization Techniques

#### 1. Cache Auth Calls (CRITICAL)

```sql
-- ❌ SLOW: auth.uid() called per row
CREATE POLICY "bad" ON users
FOR SELECT USING (auth.uid() = id);

-- ✅ FAST: Cached with subquery (auth_rls_initplan)
CREATE POLICY "good" ON users
FOR SELECT USING ((select auth.uid()) = id);
```

#### 2. Avoid Correlated Subqueries

```sql
-- ❌ SLOW: Correlated subquery
CREATE POLICY "slow_policy" ON messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversations
        WHERE id = messages.conversation_id
        AND auth.uid() = ANY(participant_ids)
    )
);

-- ✅ FAST: Use helper function with STABLE
CREATE OR REPLACE FUNCTION user_conversation_ids()
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT ARRAY_AGG(id)
    FROM conversations
    WHERE (select auth.uid()) = ANY(participant_ids);
$$;

CREATE POLICY "fast_policy" ON messages
FOR SELECT USING (
    conversation_id = ANY(user_conversation_ids())
);
```

#### 3. Avoid Multiple Permissive Policies

```sql
-- ❌ BAD: Multiple permissive SELECT policies cause OR overhead
CREATE POLICY "policy_1" ON reviews FOR SELECT USING (reviewer_id = auth.uid());
CREATE POLICY "policy_2" ON reviews FOR SELECT USING (reviewed_id = auth.uid());

-- ✅ GOOD: Single consolidated policy
CREATE POLICY "reviews_select" ON reviews
FOR SELECT USING (
    (select auth.uid()) = reviewer_id
    OR (select auth.uid()) = reviewed_id
    OR EXISTS (SELECT 1 FROM moments WHERE id = moment_id AND status = 'completed')
);
```

### RLS Performance Testing

```sql
-- Benchmark RLS overhead
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM moments
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 20;

-- Check which policies are being applied
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

---

## Connection Management

### Supabase Connection Pool Configuration

The Supabase managed connection pool (Supavisor) handles most connection management automatically.
For optimization:

```javascript
// apps/mobile/src/services/supabase.ts

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-client-info': 'lovendo-mobile',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,  // Rate limit realtime events
      },
    },
  }
);
```

### Connection Monitoring

```sql
-- Current connections by state
SELECT state, COUNT(*) as count
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state
ORDER BY count DESC;

-- Long-running queries
SELECT
    pid,
    now() - query_start as duration,
    state,
    query
FROM pg_stat_activity
WHERE state != 'idle'
    AND query_start < now() - interval '5 minutes'
ORDER BY duration DESC;

-- Kill a stuck query (use with caution)
-- SELECT pg_terminate_backend(pid);
```

---

## Caching Strategies

### Cache Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    CACHE ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  L1: Client Memory Cache (React Query / Zustand)                │
│  └── TTL: 5 minutes                                             │
│  └── Scope: Per-device                                          │
│                                                                  │
│  L2: CDN Cache (Cloudflare Images + Edge Cache)                 │
│  └── TTL: 1 year (immutable images)                             │
│  └── Scope: Global edge                                         │
│                                                                  │
│  L3: Application Cache (In-Memory + Supabase)                   │
│  └── TTL: Variable (5 min - 1 hour)                             │
│  └── Scope: Per-instance / Database                             │
│                                                                  │
│  L4: Database (PostgreSQL)                                       │
│  └── Connection pool: Supavisor                                 │
│  └── Query cache: Shared buffers                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Cache Keys Design

```typescript
// supabase/functions/_shared/cache.ts

export const CACHE_KEYS = {
  // User-specific
  userProfile: (userId: string) => `user:${userId}:profile`,
  userBalance: (userId: string) => `user:${userId}:balance`,
  userNotifications: (userId: string) => `user:${userId}:notifications:count`,

  // Feed caches (shared)
  feedPage: (page: number, category?: string) => `feed:${category || 'all'}:page:${page}`,
  momentDetail: (momentId: string) => `moment:${momentId}`,
  momentParticipants: (momentId: string) => `moment:${momentId}:participants`,

  // Conversation caches
  conversationList: (userId: string) => `user:${userId}:conversations`,
  conversationMessages: (convId: string, page: number) => `conversation:${convId}:messages:${page}`,

  // Geo caches
  nearbyMoments: (lat: number, lng: number, radius: number) =>
    `geo:${lat.toFixed(2)}:${lng.toFixed(2)}:${radius}:moments`,
};

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};
```

### Cache Invalidation

```sql
-- Trigger-based cache invalidation
CREATE OR REPLACE FUNCTION invalidate_cache_on_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Insert invalidation record
  INSERT INTO cache_invalidation (cache_key, invalidated_at)
  VALUES (
    TG_TABLE_NAME || ':' || COALESCE(NEW.id::text, OLD.id::text),
    NOW()
  )
  ON CONFLICT (cache_key) DO UPDATE SET invalidated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply to frequently updated tables
CREATE TRIGGER invalidate_moments_cache
AFTER INSERT OR UPDATE OR DELETE ON moments
FOR EACH ROW EXECUTE FUNCTION invalidate_cache_on_update();
```

---

## Scaling Roadmap

### Phase 1: Current State (0-50K users)

**Architecture:**

- Single Supabase project
- PostgreSQL 15 with 4 vCPUs
- Connection pool: 100 connections

**Optimizations:**

- [ ] Implement all covering indexes
- [ ] Enable read replicas
- [ ] Configure Cloudflare caching rules
- [ ] Implement feed delta sync

### Phase 2: Growth (50K-200K users)

**Architecture:**

- Supabase Pro plan
- Read replicas enabled
- Dedicated compute (8 vCPUs)

**Optimizations:**

- [ ] Table partitioning for `messages` (by month)
- [ ] Archive old completed moments
- [ ] Implement materialized views for analytics
- [ ] Add time-series DB for metrics (InfluxDB)

```sql
-- Partition messages by month
CREATE TABLE messages_partitioned (
    LIKE messages INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE messages_y2025m01 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE messages_y2025m02 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

### Phase 3: Scale (200K-1M users)

**Architecture:**

- Multi-region deployment
- Read replicas per region
- Dedicated compute (16+ vCPUs)

**Optimizations:**

- [ ] Horizontal sharding by user geography
- [ ] Event sourcing for audit trail
- [ ] Separate OLAP database for analytics
- [ ] CDN-based edge caching

```python
# Sharding strategy example
class ShardRouter:
    SHARDS = {
        'eu': 'supabase-eu.lovendo.app',
        'us': 'supabase-us.lovendo.app',
        'asia': 'supabase-asia.lovendo.app',
    }

    def get_shard(self, user_country: str) -> str:
        if user_country in ['DE', 'FR', 'GB', 'TR', 'IT', 'ES']:
            return self.SHARDS['eu']
        elif user_country in ['US', 'CA', 'MX', 'BR']:
            return self.SHARDS['us']
        else:
            return self.SHARDS['asia']
```

### Phase 4: Enterprise (1M+ users)

**Architecture:**

- Global load balancing
- Multi-master replication
- Dedicated infrastructure

**Considerations:**

- [ ] Custom PostgreSQL cluster (Citus)
- [ ] Event-driven microservices
- [ ] Dedicated search (Elasticsearch)
- [ ] Real-time analytics (ClickHouse)

---

## Monitoring & Alerting

### Key Metrics Dashboard

```sql
-- Create monitoring view
CREATE OR REPLACE VIEW monitoring.database_health AS
SELECT
    -- Connection metrics
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE wait_event IS NOT NULL) as waiting_queries,

    -- Performance metrics
    (SELECT ROUND(100.0 * sum(blks_hit) / NULLIF(sum(blks_hit + blks_read), 0), 2)
     FROM pg_stat_database WHERE datname = current_database()) as cache_hit_ratio,

    -- Table metrics
    (SELECT pg_size_pretty(pg_database_size(current_database()))) as database_size,
    (SELECT COUNT(*) FROM moments WHERE status = 'active') as active_moments,
    (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as active_users,

    -- Recent activity
    (SELECT COUNT(*) FROM messages WHERE created_at > NOW() - INTERVAL '1 hour') as messages_last_hour,
    (SELECT COUNT(*) FROM transactions WHERE created_at > NOW() - INTERVAL '1 hour') as transactions_last_hour;
```

### Alert Thresholds

| Metric             | Warning | Critical | Action                               |
| ------------------ | ------- | -------- | ------------------------------------ |
| Active connections | > 80    | > 95     | Scale connection pool                |
| Cache hit ratio    | < 95%   | < 90%    | Add indexes, increase shared_buffers |
| Query time P95     | > 100ms | > 500ms  | Optimize query, add index            |
| Replication lag    | > 1s    | > 10s    | Check network, replica health        |
| Disk usage         | > 70%   | > 85%    | Archive data, scale storage          |
| Lock wait time     | > 1s    | > 5s     | Review transaction locks             |

### Supabase Dashboard Monitoring

1. **Database → Health**: Monitor connections, disk, memory
2. **Database → Query Performance**: Identify slow queries
3. **Edge Functions → Logs**: Monitor function execution
4. **Realtime → Metrics**: Track subscription counts

---

## Maintenance Procedures

### Daily Tasks (Automated)

```sql
-- pg_cron scheduled jobs

-- Cleanup expired escrow (2 AM daily)
SELECT cron.schedule(
  'cleanup-expired-escrow',
  '0 2 * * *',
  $$
    SELECT refund_escrow(id, 'auto_refund_expired')
    FROM escrow_transactions
    WHERE status = 'pending' AND expires_at < NOW()
    LIMIT 100;
  $$
);

-- Cleanup old rate limits (3 AM daily)
SELECT cron.schedule(
  'cleanup-rate-limits',
  '0 3 * * *',
  $$
    DELETE FROM rate_limits
    WHERE window_start < NOW() - INTERVAL '1 day';
  $$
);

-- Cleanup old feed deltas (4 AM daily)
SELECT cron.schedule(
  'cleanup-feed-delta',
  '0 4 * * *',
  $$
    DELETE FROM feed_delta
    WHERE created_at < NOW() - INTERVAL '7 days';
  $$
);
```

### Weekly Tasks

```sql
-- Analyze tables for query planner
ANALYZE moments;
ANALYZE messages;
ANALYZE users;
ANALYZE transactions;

-- Check for bloated tables
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC
LIMIT 20;
```

### Monthly Tasks

```sql
-- Rebuild bloated indexes
REINDEX INDEX CONCURRENTLY idx_moments_coordinates;
REINDEX INDEX CONCURRENTLY idx_messages_created_at;

-- Archive old data
INSERT INTO moments_archive
SELECT * FROM moments
WHERE status IN ('completed', 'cancelled')
AND updated_at < NOW() - INTERVAL '6 months';

DELETE FROM moments
WHERE status IN ('completed', 'cancelled')
AND updated_at < NOW() - INTERVAL '6 months';

-- Vacuum full on archive tables (requires maintenance window)
-- VACUUM FULL moments_archive;
```

### Backup Verification

```bash
# Verify backup integrity (monthly)
#!/bin/bash

# Download latest backup from Supabase
supabase db dump -f backup_$(date +%Y%m%d).sql

# Restore to test database
psql -h localhost -U postgres -d test_restore < backup_$(date +%Y%m%d).sql

# Verify data integrity
psql -h localhost -U postgres -d test_restore -c "
  SELECT
    (SELECT COUNT(*) FROM users) as user_count,
    (SELECT COUNT(*) FROM moments) as moment_count,
    (SELECT COUNT(*) FROM transactions) as transaction_count;
"

# Cleanup
dropdb test_restore
```

---

## Quick Reference

### Performance Checklist

- [ ] All foreign keys have indexes
- [ ] RLS policies use `(select auth.uid())` pattern
- [ ] No multiple permissive SELECT policies per table
- [ ] Queries use appropriate LIMIT/pagination
- [ ] Covering indexes for hot queries
- [ ] Partial indexes for status filters
- [ ] ANALYZE run after bulk operations
- [ ] Connection pool sized appropriately
- [ ] Cache invalidation working correctly
- [ ] Monitoring alerts configured

### Emergency Procedures

```sql
-- Kill all idle connections (use with caution)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND query_start < NOW() - INTERVAL '10 minutes';

-- Cancel long-running queries
SELECT pg_cancel_backend(pid)
FROM pg_stat_activity
WHERE state = 'active'
AND query_start < NOW() - INTERVAL '5 minutes';

-- Check for lock contention
SELECT
    blocked.pid AS blocked_pid,
    blocked.query AS blocked_query,
    blocking.pid AS blocking_pid,
    blocking.query AS blocking_query
FROM pg_stat_activity blocked
JOIN pg_stat_activity blocking ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))
WHERE NOT blocked.granted;
```

---

_Document Version: 1.0.0_ _Last Updated: 2025-12-22_
