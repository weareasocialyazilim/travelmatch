# Row Level Security (RLS)

## Overview

RLS is the primary access control mechanism for all database tables. All tables MUST have RLS
enabled.

## RLS Principles

1. **Default Deny**: All access is denied unless explicitly allowed
2. **Policy-Based**: Access granted via policies, not table permissions
3. **No Bypass**: Service role only for migrations/admin operations

## Common RLS Patterns

### Pattern 1: Owner Access Only

```sql
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can CRUD"
  ON my_table
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Pattern 2: Public Read, Auth Write

```sql
CREATE POLICY "Public can read"
  ON moments
  FOR SELECT
  USING (true);

CREATE POLICY "Auth can create"
  ON moments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

### Pattern 3: Admin Bypass

```sql
CREATE POLICY "Admins can access all"
  ON moments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

## Tables with RLS

| Table               | Read Policy       | Write Policy         |
| ------------------- | ----------------- | -------------------- |
| users               | Owner + Admin     | Owner (profile only) |
| moments             | Public            | Creator only         |
| claims              | Owner + Creator   | Owner + Creator      |
| messages            | Participants only | Participants only    |
| coin_transactions   | Owner + Admin     | System only          |
| escrow_transactions | Owner + Admin     | System only          |

## Code References

| Feature       | Location                                  |
| ------------- | ----------------------------------------- |
| RLS policies  | `supabase/config/rls_policies.sql`        |
| DB migrations | `supabase/migrations/`                    |
| Auth service  | `apps/mobile/src/services/authService.ts` |

## NOT IMPLEMENTED

- RLS for Storage buckets (policy-level only)
- Custom claims/jwt claims
- RLS for Edge Functions (function-level)
