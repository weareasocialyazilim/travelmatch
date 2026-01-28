# Gifting and Offers

## Overview

Gifting allows users to send coins to creators as support for their moments. This is NOT
crowdfunding or donations—it is direct support with tier-based protection.

## Key Concepts

### Coin vs Offer

| Term      | Description                       | Implementation                     |
| --------- | --------------------------------- | ---------------------------------- |
| **Coin**  | In-app currency purchased via IAP | `coin_transactions` table          |
| **Offer** | NOT IMPLEMENTED                   | This is NOT a crowdfunding feature |

### Gift Types

| Type        | Tier   | Escrow    | Max Contributors    |
| ----------- | ------ | --------- | ------------------- |
| Direct Gift | 0-30   | None      | Unlimited           |
| Escrow Gift | 30-100 | Optional  | Unlimited           |
| Escrow Gift | 100+   | Mandatory | 3 unique per moment |

## Gift Flow

```
User selects amount
    │
    ▼
Check tier (0-30 / 30-100 / 100+)
    │
    ├─────────────────────────────────┐
    ▼                                 ▼
0-30 tier                        30+/100+ tier
    │                                 │
    ▼                                 ▼
Direct transfer              Escrow hold
(coin_transactions)          (escrow_transactions)
                                    │
                                    ▼
                              Proof + admin approve
                                    │
                                    ▼
                              Release to creator
```

## Code References

| Feature             | Location                                                              |
| ------------------- | --------------------------------------------------------------------- |
| Gift screen         | `apps/mobile/src/features/payments/screens/UnifiedGiftFlowScreen.tsx` |
| Gift hook           | `apps/mobile/src/features/payments/hooks/usePayments.ts`              |
| Escrow service      | `apps/mobile/src/services/escrowService.ts`                           |
| Coin transactions   | `supabase/migrations/*_create_coin_transactions.sql`                  |
| Escrow transactions | `supabase/migrations/*_create_escrow_transactions.sql`                |

## Gift Rules

1. User cannot gift to themselves
2. 100+ moments: max 3 unique contributors
3. Escrow releases only after proof approved
4. Partial releases not allowed
5. Gift amounts are final

## NOT IMPLEMENTED

- Gift customization/个性化
- Scheduled gifts
- Gift refunds (except escrow releases)
- Gift tiers/subscription gifts
- Crowdfunding/pledge system
- Offer marketplace
