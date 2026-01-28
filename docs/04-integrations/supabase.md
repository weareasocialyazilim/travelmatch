# Supabase Integration

## Overview

Supabase is the core backend: PostgreSQL database, authentication, storage, and edge functions.

## Integration Points

| Feature        | Usage                               |
| -------------- | ----------------------------------- |
| PostgreSQL     | Primary data store                  |
| Auth           | User authentication                 |
| RLS            | Row-level security policies         |
| Storage        | Media file storage (proof, moments) |
| Edge Functions | Business logic, API endpoints       |
| Realtime       | Optional: live updates              |

## Environment Configuration

```bash
# Required environment variables
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=secret-service-role
```

## Code References

| Feature        | Location                           |
| -------------- | ---------------------------------- |
| Mobile client  | `apps/mobile/src/lib/supabase.ts`  |
| Admin client   | `apps/admin/src/lib/supabase.ts`   |
| Edge Functions | `supabase/functions/`              |
| RLS policies   | `supabase/config/rls_policies.sql` |
| Migrations     | `supabase/migrations/`             |

## Common Operations

### Database Migration

```bash
pnpm db:migrate        # Apply migrations
pnpm db:reset          # Reset local DB
pnpm db:generate-types # Generate TypeScript types
```

### Generate Types

```bash
pnpm db:generate-types      # From remote
pnpm db:generate-types:local # From local
```

## NOT IMPLEMENTED

- Supabase Realtime subscriptions
- Database webhooks
- Row-level security for Storage (bucket policies only)
