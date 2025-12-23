# ADR-002: Supabase as Backend

## Status

Accepted

## Date

December 2024

## Context

TravelMatch needs a backend infrastructure that provides:

1. User authentication with social providers
2. Real-time capabilities for messaging
3. PostgreSQL database with geospatial support
4. File storage for images
5. Serverless functions for custom logic
6. Scalability without ops overhead

### Options Considered

1. **Custom Node.js Backend**: Full control but high maintenance
2. **Firebase**: Google's BaaS, but NoSQL only
3. **AWS Amplify**: Powerful but complex setup
4. **Supabase**: Open-source Firebase alternative with PostgreSQL

## Decision

We chose **Supabase** as our primary backend platform.

### Key Components Used

| Component | Purpose |
|-----------|---------|
| PostgreSQL | Primary database with PostGIS |
| GoTrue | Authentication service |
| PostgREST | Auto-generated REST API |
| Realtime | WebSocket subscriptions |
| Storage | S3-compatible file storage |
| Edge Functions | Serverless Deno functions |

### Architecture Pattern

```
Mobile App
    │
    ▼
Supabase Client SDK
    │
    ├── Auth (GoTrue) ──────────► JWT tokens
    │
    ├── Database (PostgREST) ──► PostgreSQL with RLS
    │
    ├── Realtime ──────────────► WebSocket subscriptions
    │
    ├── Storage ───────────────► S3-compatible storage
    │
    └── Edge Functions ────────► Custom business logic
```

### Database Design

We leverage PostgreSQL features:
- **Row Level Security (RLS)**: Authorization at database level
- **PostGIS**: Geospatial queries for location features
- **Triggers**: Automatic notifications and updates
- **Functions**: Reusable business logic in SQL

### Edge Functions

Custom business logic is implemented as Deno-based Edge Functions:
- Payment processing (Stripe integration)
- KYC verification (Onfido integration)
- Image processing
- Complex queries

## Consequences

### Positive

1. **Rapid Development**: Auto-generated APIs from schema
2. **Built-in Auth**: OAuth providers, JWT, MFA support
3. **Real-time Built-in**: No separate WebSocket infrastructure
4. **PostgreSQL**: Full SQL, ACID, extensions support
5. **Self-hostable**: Can migrate to self-hosted if needed
6. **Cost Effective**: Generous free tier, predictable pricing

### Negative

1. **Vendor Lock-in**: Some Supabase-specific patterns
2. **Edge Function Limits**: Cold starts, execution time limits
3. **Complex Joins**: Need PostgREST understanding for complex queries
4. **RLS Complexity**: Requires careful policy design

### Neutral

1. **Learning Curve**: Team needs to learn Supabase patterns
2. **Local Development**: Docker-based local stack available
3. **Migration**: Standard PostgreSQL backup/restore works

## Implementation Details

### Client Initialization

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
```

### RLS Policy Example

```sql
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

## Related

- [ADR-005: Row Level Security](./ADR-005-row-level-security.md)
- [Supabase Documentation](https://supabase.com/docs)
