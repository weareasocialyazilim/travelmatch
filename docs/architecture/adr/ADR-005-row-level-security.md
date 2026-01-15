# ADR-005: Row Level Security Strategy

## Status

Accepted

## Date

December 2024

## Context

Lovendo handles sensitive user data including:
- Personal information (profiles, preferences)
- Financial transactions
- Private messages
- Location data

We needed a robust authorization strategy that:
1. Prevents unauthorized data access at the database level
2. Works with Supabase's PostgREST auto-generated APIs
3. Scales without complex application logic
4. Provides defense in depth

### Options Considered

1. **Application-level Authorization**: Check permissions in API handlers
2. **API Gateway Authorization**: Middleware checks before database
3. **Row Level Security (RLS)**: PostgreSQL native access control
4. **Hybrid Approach**: Combination of above

## Decision

We chose **Row Level Security (RLS)** as our primary authorization mechanism, with Edge Functions for complex business logic.

### Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layers                        │
├─────────────────────────────────────────────────────────────┤
│  1. API Gateway (Kong)     - JWT validation                 │
│  2. PostgREST              - Request parsing                │
│  3. RLS Policies           - Row-level access control       │
│  4. Database Functions     - Complex authorization logic    │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### RLS Enabled on All Tables

```sql
-- Enable RLS (required for policies to take effect)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ... all tables
```

### Users Table Policies

```sql
-- Users can read their own profile
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can read public profiles of non-blocked users
CREATE POLICY "users_select_public"
  ON users FOR SELECT
  USING (
    id != auth.uid() AND
    NOT is_blocked(auth.uid(), id)
  );

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only service role can delete users (GDPR)
CREATE POLICY "users_delete_service"
  ON users FOR DELETE
  USING (auth.role() = 'service_role');
```

### Moments Table Policies

```sql
-- Anyone can read active, non-blocked moments
CREATE POLICY "moments_select_public"
  ON moments FOR SELECT
  USING (
    status = 'active' AND
    NOT is_blocked(auth.uid(), user_id)
  );

-- Users can read their own moments (any status)
CREATE POLICY "moments_select_own"
  ON moments FOR SELECT
  USING (user_id = auth.uid());

-- Authenticated users can create moments
CREATE POLICY "moments_insert_authenticated"
  ON moments FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    user_id = auth.uid()
  );

-- Users can update their own moments
CREATE POLICY "moments_update_own"
  ON moments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Messages Table Policies

```sql
-- Users can read messages in their conversations
CREATE POLICY "messages_select_participant"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND auth.uid() = ANY(participant_ids)
    )
  );

-- Users can send messages to conversations they're part of
CREATE POLICY "messages_insert_participant"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND auth.uid() = ANY(participant_ids)
    )
  );
```

### Transactions Table Policies

```sql
-- Users can only read their own transactions
CREATE POLICY "transactions_select_own"
  ON transactions FOR SELECT
  USING (user_id = auth.uid());

-- Only Edge Functions (service role) can insert/update
CREATE POLICY "transactions_insert_service"
  ON transactions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "transactions_update_service"
  ON transactions FOR UPDATE
  USING (auth.role() = 'service_role');
```

### Helper Functions

```sql
-- Check if user A has blocked user B
CREATE OR REPLACE FUNCTION is_blocked(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM blocks
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  );
$$;

-- Check if user is conversation participant
CREATE OR REPLACE FUNCTION is_conversation_participant(conv_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conv_id
    AND auth.uid() = ANY(participant_ids)
  );
$$;
```

### Security Definer Functions

For complex operations that need elevated privileges:

```sql
-- Transfer funds between users (service role only via Edge Function)
CREATE OR REPLACE FUNCTION transfer_funds(
  from_user UUID,
  to_user UUID,
  amount DECIMAL,
  moment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  from_balance DECIMAL;
BEGIN
  -- Check caller is service role
  IF auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get current balance
  SELECT balance INTO from_balance
  FROM users WHERE id = from_user
  FOR UPDATE;

  -- Check sufficient funds
  IF from_balance < amount THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;

  -- Perform transfer
  UPDATE users SET balance = balance - amount WHERE id = from_user;
  UPDATE users SET balance = balance + amount WHERE id = to_user;

  -- Record transactions
  INSERT INTO transactions (user_id, type, amount, moment_id)
  VALUES
    (from_user, 'payment', -amount, moment_id),
    (to_user, 'payment', amount, moment_id);

  RETURN TRUE;
END;
$$;
```

## Consequences

### Positive

1. **Defense in Depth**: Security at database level, not just API
2. **Automatic Enforcement**: Works with all PostgREST queries
3. **Declarative**: Policies are easy to audit and review
4. **Performance**: PostgreSQL optimizes RLS checks
5. **Consistency**: Same rules apply regardless of access method

### Negative

1. **Complexity**: Policies can become complex for intricate rules
2. **Testing**: Requires testing at database level
3. **Debugging**: Errors can be opaque ("no rows returned")
4. **Migration**: Schema changes may require policy updates

### Neutral

1. **Learning Curve**: Team needs to understand RLS
2. **Documentation**: Policies must be well-documented
3. **Supabase Integration**: Works seamlessly with Supabase client

## Testing RLS

```bash
# Run RLS tests
pnpm db:test:rls

# Test specific policies
pnpm db:test:rls:staging
```

Example test:
```sql
-- Test: User cannot read other users' transactions
BEGIN;
  SET LOCAL role TO authenticated;
  SET LOCAL request.jwt.claim.sub TO 'user-a-uuid';

  -- Should return 0 rows
  SELECT count(*) FROM transactions
  WHERE user_id = 'user-b-uuid';

  -- Verify
  ASSERT (SELECT count(*) = 0);
ROLLBACK;
```

## Related

- [ADR-002: Supabase as Backend](./ADR-002-supabase-backend.md)
- [Security Architecture](../SECURITY_ARCHITECTURE.md)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
