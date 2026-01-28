# Memberships

## Overview

Memberships (subscriptions) provide access to premium features. The platform uses RevenueCat for IAP
management.

## Plan Structure

| Plan    | Features                                     | Price |
| ------- | -------------------------------------------- | ----- |
| Free    | Basic browse, limited filters                | $0    |
| Premium | Unlimited filters, location change, priority | TBD   |

## Plan Features (from code)

Location: `apps/mobile/src/features/payments/constants/plans.ts`

```typescript
interface Plan {
  id: string;
  name: string;
  price: number;
  features: {
    unlimited_filters: boolean;
    location_change: boolean;
    priority_support: boolean;
    extended_distance: boolean;
  };
}
```

## Membership Gates

| Feature          | Free | Premium |
| ---------------- | ---- | ------- |
| Browse moments   | Yes  | Yes     |
| Basic filters    | Yes  | Yes     |
| Advanced filters | No   | Yes     |
| Change location  | No   | Yes     |
| Priority support | No   | Yes     |

## Code References

| Feature            | Location                                                     |
| ------------------ | ------------------------------------------------------------ |
| Plans config       | `apps/mobile/src/features/payments/constants/plans.ts`       |
| Subscription hook  | `apps/mobile/src/features/payments/hooks/useSubscription.ts` |
| RevenueCat service | `apps/mobile/src/services/revenueCatService.ts`              |
| Subscription DB    | `supabase/migrations/*_create_subscriptions.sql`             |

## NOT IMPLEMENTED

- Freemium trial periods
- Annual plans
- Family sharing
- Plan upgrades/downgrades
- Prorated charges
