# Moments

## Overview

A **Moment** is an experience offer created by a user (creator). It represents a real-world
experience that other users can claim and consume.

## Moment Data Model

Location: `supabase/migrations/` (search for `moments` table)

```typescript
interface Moment {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  city: string;
  category: string;
  price_tier: '0-30' | '30-100' | '100+';
  max_participants: number;
  status: MomentStatus;
  media_urls: string[];
  location_lat?: number;
  location_lng?: number;
  created_at: Date;
  updated_at: Date;
}
```

## Moment States

| State       | Description              | Who Can Change           |
| ----------- | ------------------------ | ------------------------ |
| `draft`     | Being created            | Creator                  |
| `active`    | Published, discoverable  | System (creator publish) |
| `full`      | Max participants reached | System                   |
| `claimed`   | Someone claimed          | System (claim action)    |
| `consumed`  | Experience occurred      | System (consume action)  |
| `completed` | Full cycle done          | System (admin approve)   |
| `cancelled` | Cancelled                | Creator, Admin           |

## Moment Lifecycle

```
draft → active → [claimed → consumed → proof_submitted] → approved → completed
              ↓                                    ↓
           cancelled                           rejected
```

## Code References

| Feature       | Location                                                          |
| ------------- | ----------------------------------------------------------------- |
| Create screen | `apps/mobile/src/features/moments/screens/CreateMomentScreen.tsx` |
| List/Discover | `apps/mobile/src/features/discover/screens/DiscoverScreen.tsx`    |
| Detail view   | `apps/mobile/src/features/discover/components/moment-detail/`     |
| Admin list    | `apps/admin/src/app/(dashboard)/moments/`                         |
| DB schema     | `supabase/migrations/*_create_moments_table.sql`                  |
| RLS policies  | `supabase/config/rls_policies.sql`                                |

## Moment Rules

1. Creator cannot claim their own moment
2. One active claim per user at a time
3. Published moments are visible to all (RLS-controlled)
4. Editing a published moment re-triggers AI scan
5. Maximum participants set at creation

## NOT IMPLEMENTED

- Moment templates
- Moment categories beyond basic types
- Recurring moments
- Moment bundles/packages
