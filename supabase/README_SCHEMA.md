# Schema Management

## Source of Truth: Migrations

The database schema is **exclusively defined by migrations** in `supabase/migrations/`.

**DO NOT** manually edit `schema.sql` or create it separately.

## Regenerating Schema (if needed)

If you need a full schema dump for documentation:

```bash
# Reset database to apply all migrations
supabase db reset

# Generate schema.sql from current database state
supabase db dump -f supabase/schema.sql

# Or use direct pg_dump
pg_dump --schema-only --no-owner --no-privileges \
  postgresql://postgres:postgres@localhost:54322/postgres \
  > supabase/schema.sql
```

## Migration Workflow

1. **Create Migration:**
   ```bash
   supabase migration new your_migration_name
   ```

2. **Edit Migration:**
   Edit the generated SQL file in `supabase/migrations/`

3. **Apply Locally:**
   ```bash
   supabase db reset  # Applies all migrations from scratch
   ```

4. **Deploy to Production:**
   ```bash
   supabase db push
   ```

## Why Migrations Are Source of Truth

- ✅ **Version Control**: Every schema change is tracked
- ✅ **Rollback**: Can revert to any point in history
- ✅ **Idempotent**: Safe to re-run (uses IF NOT EXISTS)
- ✅ **Collaborative**: Team members see exact schema evolution
- ✅ **Production Safety**: Prevents manual schema drift

## Previous Schema Conflict

**Issue:** `schema.sql` defined `profiles` table while migrations defined `users` table.

**Resolution:** Deleted `schema.sql` on 2025-12-15. Migrations are now the single source of truth.

**Backup:** `schema.sql.backup` preserved for historical reference.
