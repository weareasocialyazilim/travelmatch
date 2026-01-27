# 🚀 LOVENDO SUPABASE RELEASE CHECKLIST
## v1.0.0 - Zero Defect Database & Backend

### Date: 2026-01-27
### Status: [ ] PENDING

---

## ✅ PRE-CHECK: Current State
Run this to see current linter status:
```bash
supabase dashboard
# Go to Database > Linter
```

Expected before release:
- ❌ 0 **ERROR** level issues
- ⚠️ 0 **WARN** level issues (optional)

---

## 🔴 CRITICAL: Security Issues (MUST FIX)

### 1. SECURITY DEFINER Views
**Problem:** Views run with owner privileges, bypass RLS

**Check:**
```sql
SELECT viewname FROM pg_views WHERE schemaname = 'public'
AND EXISTS (
  SELECT 1 FROM pg_proc
  WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'pg_catalog')
  AND prokind = 'v'
);
```

**Fix Applied:** `20260127000000_fix_linter_jan2026.sql`
```bash
supabase db push
```

**Verification:**
```sql
-- After migration, run:
SELECT * FROM supabase_dashboard.get_lint_results()
WHERE name = 'security_definer_view';
-- Expected: 0 rows
```

---

### 2. RLS Disabled on Tables
**Problem:** Tables without Row Level Security

**Check:**
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = pg_tables.tablename
);
```

**Expected Result:**
| Table | Action |
|-------|--------|
| spatial_ref_sys | FALSE POSITIVE (PostGIS system catalog) |
| Others | 0 rows expected |

**Fix:** For non-system tables, enable RLS:
```sql
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated select" ON public.table_name
  FOR SELECT TO authenticated USING (true);
```

---

### 3. Function Search Path (WARN)
**Problem:** Functions without secure search_path

**Check:**
```sql
SELECT proname FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND prokind = 'f'
AND NOT EXISTS (
  SELECT 1 FROM pg_proc
  WHERE oid = pg_proc.oid
  AND prosrc ILIKE '%search_path%'
);
```

**Fix Applied:** `20260127000000_fix_linter_jan2026.sql`

**New functions should use:**
```sql
CREATE OR REPLACE FUNCTION public.my_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- or INVOKER
SET search_path = 'pg_catalog', 'public'  -- CRITICAL!
AS $$
BEGIN
  -- function body
END;
$$;
```

---

## 🟠 HIGH: Performance Issues

### 4. Auth RLS InitPlan (WARN)
**Problem:** `auth.uid()` called per-row instead of once

**Check:**
```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND (
  polqual ILIKE '%auth.uid()%'
  OR polqual ILIKE '%auth.jwt()%'
  OR polwithcheck ILIKE '%auth.uid()%'
  OR polwithcheck ILIKE '%auth.jwt()%'
)
AND polqual NOT ILIKE '%(SELECT auth%'
AND polwithcheck NOT ILIKE '%(SELECT auth%';
```

**Fix Applied:** `20260127000001_fix_rls_initplan_performance.sql`

**Before:**
```sql
CREATE POLICY "User select" ON public.table
  FOR SELECT USING (user_id = auth.uid());
```

**After:**
```sql
CREATE POLICY "User select" ON public.table
  FOR SELECT USING (user_id = (SELECT auth.uid()));
```

---

## 🟡 MEDIUM: Data Integrity

### 5. Required Columns
**Check for tables missing NOT NULL constraints:**
```sql
SELECT c.relname AS table_name, a.attname AS column_name
FROM pg_class c
JOIN pg_attribute a ON c.oid = a.attrelid
JOIN pg_type t ON a.atttypid = t.oid
LEFT JOIN pg_constraint con ON con.conrelid = c.oid
  AND con.conkey[1] = a.attnum
WHERE c.relkind = 'r'
AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND a.attnotnull = false
AND a.attnum > 0
AND con.contype IS NULL;
```

---

### 6. Foreign Key Validation
**Check for orphaned records:**
```sql
-- For each table with foreign keys, run:
SELECT 'Table: ' || t.relname || ' - Missing FK: ' || a.attname
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_class r ON c.confrelid = r.oid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = c.conkey[1]
WHERE c.contype = 'f'
AND NOT EXISTS (
  SELECT 1 FROM pg_constraint c2
  WHERE c2.confrelid = r.oid
  AND c2.conkey[1] = a.attnum
);
```

---

## 🟢 VERIFICATION: Final Checks

### 7. All Tables Have RLS
```sql
-- Count tables without RLS
SELECT COUNT(*) AS tables_without_rls
FROM pg_tables
WHERE schemaname = 'public'
AND NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = pg_tables.tablename
);

-- Result should be: 0 (except system tables)
```

### 8. All Policies Are Secure
```sql
-- Check for overly permissive policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND (
  (cmd = 'SELECT' AND polqual IS NULL)
  OR (cmd = 'ALL' AND polwithcheck IS NULL)
);
```

### 9. No Duplicate Policies
```sql
SELECT tablename, cmd, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename, cmd
HAVING COUNT(*) > 3;  -- More than 3 policies per action
```

---

## 📊 MIGRATION STATUS

| Migration | Status | Applied At |
|-----------|--------|------------|
| `20260127000000_fix_linter_jan2026.sql` | [ ] PENDING | - |
| `20260127000001_fix_rls_initplan_performance.sql` | [ ] PENDING | - |

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Backup Database (CRITICAL!)
```bash
supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Apply Migrations
```bash
supabase db push
```

### Step 3: Verify in Dashboard
```bash
# Open browser to:
# https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/database/linter
```

### Step 4: Commit Schema Changes
```bash
supabase db remote commit
git add .
git commit -m "fix: Apply linter fixes for v1.0 release"
```

---

## 🧪 FUNCTIONAL TESTS

### Test 1: Authentication
```sql
-- As authenticated user
SELECT auth.uid();  -- Should return user ID
SELECT auth.jwt();  -- Should return JWT claims
```

### Test 2: RLS Policies
```sql
-- Create test user
INSERT INTO auth.users (id, email, encrypted_password)
VALUES ('test-user-id', 'test@example.com', 'xxx');

-- Test RLS - should fail if policy is correct
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub TO 'test-user-id';

-- Should only see own data
SELECT * FROM public.profiles WHERE user_id = auth.uid();
```

### Test 3: Edge Functions
```bash
supabase functions list
# Verify all functions are deployed and working
```

---

## 📋 KNOWN FALSE POSITIVES

| Issue | Reason | Action |
|-------|--------|--------|
| `spatial_ref_sys` RLS disabled | PostGIS system catalog | Ignore |
| `topology` schema warnings | PostGIS system schema | Ignore |

---

## ✅ SIGN-OFF CHECKLIST

Before marking as DONE:

- [ ] **0 security_definer_view errors**
- [ ] **0 auth_rls_initplan warnings** (optional)
- [ ] **0 function_search_path_mutable warnings**
- [ ] **All tables have RLS** (except system tables)
- [ ] **All policies use (SELECT auth.uid())** pattern
- [ ] **No duplicate indexes**
- [ ] **Foreign keys validated**
- [ ] **Database backup taken**
- [ ] **Dashboard linter shows 0 errors**

---

## 🔗 USEFUL QUERIES

```sql
-- All RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- All tables with RLS
SELECT tablename FROM pg_policies WHERE schemaname = 'public'
GROUP BY tablename;

-- Tables without RLS
SELECT tablename FROM pg_tables WHERE schemaname = 'public'
AND tablename NOT IN (SELECT tablename FROM pg_policies WHERE schemaname = 'public');

-- Function details
SELECT proname, prokind, prosecurity, prosrc ILIKE '%search_path%' as has_search_path
FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

---

## 📞 EMERGENCY ROLLBACK

If issues found after deploy:

```bash
# 1. Revert migration
supabase migration repair --version 20260127000000 --status reverted
supabase migration repair --version 20260127000001 --status reverted
supabase db push

# 2. Or restore from backup
supabase db reset < backup_YYYYMMDD_HHMMSS.sql
```

---

**Last Updated:** 2026-01-27
**Maintained By:** Development Team
