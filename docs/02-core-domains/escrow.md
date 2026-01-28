# Escrow System

## Overview

Escrow protects both giver and creator for high-value moments. It holds funds until proof of
experience is verified.

## Escrow Tiers

| Tier   | Price Range (USD) | Escrow Rule        | Max Contributors |
| ------ | ----------------- | ------------------ | ---------------- |
| Tier 0 | 0-30              | No escrow required | Unlimited        |
| Tier 1 | 30-100            | Escrow optional    | Unlimited        |
| Tier 2 | 100+              | Escrow mandatory   | 3 unique         |

## Escrow States

| State      | Description                      |
| ---------- | -------------------------------- |
| `pending`  | Payment received, held in escrow |
| `released` | Proof approved, funds to creator |
| `refunded` | Proof rejected, funds returned   |
| `disputed` | Under admin review               |

## Escrow Flow

```
Gift initiated
    │
    ▼
Check moment tier
    │
    ├─────────────────────────────────┐
    ▼                                 ▼
0-30 tier                        30+/100+ tier
    │                                 │
    ▼                                 ▼
No escrow                    Create escrow record
Direct transfer                  Hold payment
    │                                 │
    │                                 ▼
    │                         Status: pending
    │                                 │
    │                                 ▼
    │                         Proof submitted
    │                                 │
    │                                 ▼
    │                         Admin review
    │                                 │
    ├───────────────────────────────┤
    ▼                               ▼
Transfer complete            Approved → Released
                            Rejected → Refunded
```

## Code References

| Feature              | Location                                               |
| -------------------- | ------------------------------------------------------ |
| Escrow service       | `apps/mobile/src/services/escrowService.ts`            |
| Escrow determination | `apps/mobile/src/utils/escrowUtils.ts`                 |
| Escrow DB            | `supabase/migrations/*_create_escrow_transactions.sql` |
| Escrow RPC           | `supabase/functions/_shared/escrow.ts`                 |

## Escrow Rules

1. 100+ moments: max 3 unique contributors per moment
2. Same contributor can give multiple times
3. Escrow release requires admin proof approval
4. Refund requires admin rejection
5. No partial releases

## NOT IMPLEMENTED

- Multi-escrow (split payments)
- Time-based escrow release
- Auto-release based on time
- Escrow dispute resolution flow
- Partial holds
