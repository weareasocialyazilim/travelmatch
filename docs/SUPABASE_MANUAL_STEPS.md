# Supabase Manual Configuration Steps

**Last Updated:** 8 January 2026 **Related Audit:** Supabase Performance & Security Lint Analysis

This document outlines manual configuration steps that cannot be automated via SQL migrations.

---

## Quick CLI Setup

Most settings can now be configured via CLI. Run the following command:

```bash
# Configure auth security settings
./scripts/configure-auth-security.sh

# Apply config.toml changes to remote
supabase db push --project-ref bjikxgtbptrvawkguypv
```

---

## Critical Security Settings (Immediate Action Required)

### 1. Enable Leaked Password Protection

**Priority:** CRITICAL **Impact:** Prevents users from using passwords found in data breaches

**Option A: Via CLI (Recommended)**

```bash
# Set your access token (get from Supabase Dashboard > Account > Access Tokens)
export SUPABASE_ACCESS_TOKEN="your-token-here"

# Run the configuration script
./scripts/configure-auth-security.sh
```

**Option B: Via Dashboard**

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Scroll to **Security Settings**
4. Enable **"Check passwords against HIBP (Have I Been Pwned)"**
5. Click **Save**

**Verification:**

- Try to sign up with a known leaked password (e.g., "password123")
- Should receive error: "Password has been found in a data breach"

---

### 2. Database Connection Pooling (Already Configured)

**Priority:** HIGH **Status:** ✅ Configured in `config.toml`

The `[db.pooler]` section in `supabase/config.toml` now includes:

```toml
[db.pooler]
enabled = true
port = 6543
pool_mode = "transaction"
default_pool_size = 20
max_client_conn = 100
```

**To apply changes:**

```bash
supabase db push --project-ref bjikxgtbptrvawkguypv
```

**Recommended Settings:** | Setting | Free Tier | Pro Tier | Enterprise |
|---------|-----------|----------|------------| | Pool Size | 15 | 50-100 | 200+ | | Statement
Timeout | 8s | 30s | Custom |

---

## Performance Optimization Settings

### 3. Enable Query Performance Insights

**Priority:** MEDIUM **Impact:** Helps identify slow queries

**Steps:**

1. Go to Supabase Dashboard
2. Navigate to **Database** → **Query Performance**
3. Enable **Query Performance Insights**
4. Set retention period (7 days recommended)

---

### 4. Configure Realtime Subscriptions

**Priority:** MEDIUM **Impact:** Reduces server load from realtime connections

Based on audit findings (255,138 realtime calls consuming ~24 minutes total):

**Steps:**

1. Go to Supabase Dashboard
2. Navigate to **Database** → **Replication**
3. Review enabled tables for realtime
4. Disable realtime for tables that don't need it:
   - Audit logs
   - Cache tables
   - Administrative tables

**Tables to Review:**

```sql
-- Check current realtime-enabled tables
SELECT * FROM supabase_realtime.subscription;
```

---

## Index Optimization (Production Only)

### 5. Monitor and Clean Unused Indexes

**Priority:** LOW (Monitor First) **Impact:** +5-10% write performance

**DO NOT run immediately.** Monitor for 1-2 weeks first.

**Monitoring Query (run in production):**

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Candidate indexes for removal (after monitoring):**

- Indexes with `idx_scan = 0` for extended period
- Large indexes on write-heavy tables
- Duplicate or redundant indexes

---

## Post-Migration Verification Checklist

After applying the SQL migrations, verify:

### Security Verification

```sql
-- 1. Verify spatial_ref_sys has RLS enabled
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'spatial_ref_sys';
-- Expected: relrowsecurity = true

-- 2. Verify generate_default_username has search_path
SELECT proname, proconfig
FROM pg_proc
WHERE proname = 'generate_default_username';
-- Expected: proconfig contains 'search_path=public, pg_temp'

-- 3. Check for remaining SECURITY DEFINER functions without search_path
SELECT n.nspname, p.proname
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND (p.proconfig IS NULL OR NOT EXISTS (
    SELECT 1 FROM unnest(p.proconfig) AS config
    WHERE config LIKE 'search_path=%'
  ));
-- Expected: 0 rows
```

### Policy Verification

```sql
-- 4. Verify no unoptimized auth.uid() calls remain
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(SELECT auth.uid()%' AND qual NOT LIKE '%(select auth.uid()%')
    OR
    (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(SELECT auth.uid()%' AND with_check NOT LIKE '%(select auth.uid()%')
  );
-- Expected: 0 rows (or very few)

-- 5. Verify no multiple permissive policies on consolidated tables
SELECT tablename, cmd, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('admin_sessions', 'kyc_verifications', 'processed_webhook_events',
                    'trip_participants', 'trip_requests', 'bookings')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1;
-- Expected: 0 rows
```

### Index Verification

```sql
-- 6. Verify duplicate indexes removed
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_escrow_transactions_expires',
    'idx_kyc_verifications_user_id',
    'idx_moments_coordinates'
  );
-- Expected: 0 rows (these should be dropped)
```

---

## Monitoring Dashboard Setup

### Recommended Metrics to Track

1. **Database Performance**
   - Average query time
   - Slow query count (>1s)
   - Connection pool utilization

2. **Security Metrics**
   - Failed login attempts
   - RLS policy violations
   - Rate limit hits

3. **Realtime Usage**
   - Active subscriptions
   - Messages per second
   - Channel count

---

## Rollback Procedures

If issues occur after migration:

### Quick Rollback (Dashboard)

1. Go to **Database** → **Backups**
2. Select most recent backup before migration
3. Click **Restore**

### Selective Rollback (SQL)

```sql
-- Example: Restore old policy pattern
DROP POLICY IF EXISTS "new_policy" ON table_name;
CREATE POLICY "old_policy" ON table_name ...;
```

---

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

## Migration Files Reference

| Migration                                      | Purpose                                   | Risk Level |
| ---------------------------------------------- | ----------------------------------------- | ---------- |
| `20260102000001_critical_security_fixes.sql`   | RLS on spatial_ref_sys, search_path fixes | LOW        |
| `20260102000002_rls_performance_fixes.sql`     | auth.uid() caching optimization           | LOW        |
| `20260102000003_cleanup_duplicate_indexes.sql` | Remove redundant indexes                  | LOW        |
| `20260102000004_consolidate_policies.sql`      | Merge multiple permissive policies        | MEDIUM     |
