# 🎯 Database Action Items

**Created:** 9 Aralık 2025  
**Status:** Active Development  
**Priority:** HIGH

---

## 📋 Current Status

### ✅ Completed (From DB_PENDING_ITEMS.md)
- Week 1-4: Security & Performance (11 migrations)
- Security Score: C- → A+
- RLS Policies: Optimized
- Index Coverage: 100% FK coverage
- Function Security: SECURITY DEFINER protected

### 🔧 Active Issues

---

## 🚨 CRITICAL - Must Fix Now

### 1. **Database Type Generation**
**Status:** ✅ **COMPLETE**

**Generated File:** `apps/mobile/src/types/database.types.ts`
- **Lines:** 2,332 lines of TypeScript types
- **Tables:** All public schema tables included
- **Quality:** Full type safety with Row/Insert/Update types

**Command:**
```bash
supabase gen types typescript --project-id isvstmzuyxuwptrrhkyi
```

**Benefits:**
✅ Type safety across all database operations
✅ Autocomplete for table/column names
✅ Compile-time error detection
✅ No manual type definitions needed

---

### 2. **N+1 Query Problems**
**Status:** ✅ **COMPLETED**

**Verified Services (All Optimized):**
```
apps/mobile/src/services/
├── supabaseDbService.ts        ✅ All queries use JOINs
│   ├── momentsService.list     ✅ Includes users, categories
│   ├── momentsService.getById  ✅ Includes users, categories, requests
│   ├── momentsService.getSaved ✅ Nested joins via favorites
│   ├── requestsService.list    ✅ Includes requester, moment, user
│   ├── messagesService.list    ✅ Includes sender
│   └── conversationsService    ✅ Includes last_message, participants
├── securePaymentService.ts     ✅ Transaction queries with request details
├── video-infrastructure.ts     ✅ No N+1 issues (single record operations)
├── viral-loop-engine.ts        ✅ No N+1 issues (single queries)
└── pushTokenService.ts         ✅ No N+1 issues (user updates only)
```

**Example Fix:**
```typescript
// ❌ BAD: N+1
const users = await supabase.from('users').select('*');
for (const user of users) {
  const moments = await supabase
    .from('moments')
    .select('*')
    .eq('user_id', user.id);
}

// ✅ GOOD: Single query with JOIN
const { data } = await supabase
  .from('users')
  .select(`
    *,
    moments(*)
  `);
```

**Priority:** HIGH - Performance impact  
**Estimated Effort:** 2-3 hours

---

### 3. **Query Helpers**
**Status:** ✅ **COMPLETED**

**Created:** `apps/mobile/src/services/db/queries.ts`
```typescript
export const dbQueries = {
  // Optimized moment queries
  getMomentsWithUser: (filters) => 
    supabase
      .from('moments')
      .select('*, user:users(*)')
      .match(filters),
  
  // Optimized request queries
  getRequestsWithDetails: (userId) =>
    supabase
      .from('requests')
      .select(`
        *,
        moment:moments(*, user:users(*)),
        requester:users(*)
      `)
      .eq('user_id', userId),
};
```

**Priority:** MEDIUM  
**Estimated Effort:** 1-2 hours

---

## 🔍 MONITORING - Post-Launch

### 1. **Index Usage Tracking**
**Action:** Run weekly after launch

```sql
-- Check unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
    AND idx_scan < 10
    AND indexname NOT LIKE '%_pkey'
ORDER BY idx_scan ASC;
```

**Schedule:** Every Monday  
**Owner:** Backend Team

---

### 2. **Slow Query Monitoring**
**Action:** Track queries > 100ms

```sql
-- Enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Check slow queries
SELECT 
    calls,
    mean_exec_time,
    max_exec_time,
    query
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;
```

**Schedule:** Daily (first week), then weekly  
**Threshold:** 100ms

---

### 3. **RLS Performance Check**
**Action:** Monitor RLS policy overhead

```sql
-- Check tables with frequent sequential scans
SELECT 
    schemaname,
    tablename,
    n_tup_ins + n_tup_upd + n_tup_del as write_ops,
    seq_scan,
    idx_scan,
    ROUND(100.0 * seq_scan / NULLIF(seq_scan + idx_scan, 0), 2) as seq_scan_pct
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND seq_scan > 1000
ORDER BY seq_scan DESC;
```

**Schedule:** Weekly  
**Action If:** seq_scan_pct > 30% → Add indexes or optimize RLS

---

## 📈 OPTIMIZATION - Future Enhancements

### 1. **Connection Pooling** (Month 2)
**Condition:** When active users > 1,000

**Actions:**
- Review PgBouncer/Supavisor settings
- Implement connection pool monitoring
- Add read replicas if needed

**Estimated Effort:** 1 day

---

### 2. **Table Partitioning** (Month 2-3)
**Tables:**
- `messages` (by created_at, monthly)
- `audit_logs` (by created_at, weekly)
- `feed_delta` (by created_at, daily)

**Benefits:**
- Faster queries on recent data
- Easier archival
- Better vacuum performance

**Estimated Effort:** 3-5 days per table

---

### 3. **Index Optimization Round 2** (Month 2)
**Actions:**
- Convert to BRIN indexes for time-series data
- Add partial indexes for specific filters
- Add covering indexes for hot queries

**Example:**
```sql
-- Replace B-tree with BRIN for large tables
CREATE INDEX idx_messages_created_brin 
  ON messages USING BRIN(created_at);

-- Add covering index
CREATE INDEX idx_moments_user_data 
  ON moments(user_id) 
  INCLUDE (title, price, status);
```

**Estimated Effort:** 1-2 days

---

## 🛠️ IMMEDIATE ACTIONS (This Week)

### Priority Matrix

| Task | Priority | Effort | Status |
|------|----------|--------|--------|
| Type generation setup | 🔴 HIGH | 30 min | ✅ Script ready |
| Fix N+1 queries | 🔴 HIGH | 2-3 hrs | ✅ **COMPLETE** |
| Create query helpers | 🟡 MEDIUM | 1-2 hrs | ✅ **COMPLETE** |
| Setup monitoring | 🟢 LOW | 1 hr | ⏳ Post-launch |

---

## 📝 Implementation Order

**Phase 1: Critical Fixes (Today)** ✅ **COMPLETE**
1. ✅ Create this action plan
2. ✅ Setup type generation script
3. ✅ Generate fresh types from production (2,332 lines)
4. ✅ Create query helper utilities
5. ✅ Verify all services (no N+1 issues found)
6. ✅ Update securePaymentService with JOINs

**Phase 2: Quality Improvements (This Week)**
6. ⏳ Create query helper utilities
7. ⏳ Add query optimization tests
8. ⏳ Document query patterns

**Phase 3: Monitoring Setup (Next Week)**
9. ⏳ Setup slow query alerts
10. ⏳ Create monitoring dashboard
11. ⏳ Schedule weekly reviews

---

## 🎯 Success Metrics

**Type Safety:**
- [ ] All database types auto-generated
- [ ] Zero manual type definitions
- [ ] TypeScript errors < 5

**Performance:**
- [ ] N+1 queries eliminated
- [ ] Avg query time < 50ms
- [ ] p95 query time < 200ms

**Monitoring:**
- [ ] Weekly index usage reports
- [ ] Daily slow query alerts
- [ ] RLS performance dashboard

---

**Next Review:** After Phase 1 completion  
**Owner:** Database Team  
**Updated:** 9 Aralık 2025
