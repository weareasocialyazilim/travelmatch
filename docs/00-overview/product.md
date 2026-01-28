# Lovendo Product Overview

**Lovendo** is a real-world experience orchestration platform where users create and consume
"moments" (experience offers). Not a dating app, not a marketplace, not AI-recommendation based.

## Core Product Laws (Non-Negotiable)

1. **Experience-only**: Only in-person experiences, no physical products
2. **No cash out**: User-to-user money transfer is disabled
3. **No shipping**: No cargo, delivery, or fulfillment
4. **No swipe/like**: Consent-based interactions only
5. **No AI decision-making**: AI flags, humans decide
6. **Escrow protection**: Tiered based on moment value

## User Types

| Type    | Description                                           |
| ------- | ----------------------------------------------------- |
| Guest   | Unauthenticated user; can browse but not act          |
| Free    | Authenticated, no paid subscription                   |
| Paid    | Active subscription holder                            |
| Creator | User who creates moments (same account, action-based) |
| Admin   | Platform operations and moderation                    |

## Terminology

- **Moment**: An experience offer created by a creator
- **Claim**: User's intent to consume a moment
- **Proof**: Evidence that a moment was consumed (photos, verification)
- **Gift/Coin**: In-app currency for supporting creators
- **Escrow**: Payment protection tier based on moment value
- **Trust Score**: User reputation metric (affects limits)

## What Lovendo Is NOT

- Dating app (no swipe/like matching)
- Marketplace (no product listing/sales)
- Crowdfunding platform (no donations to causes)
- Trip/booking service (no reservations/travel planning)
- AI content platform (AI does not generate or decide)

## Code References

- Mobile app: `apps/mobile/src/features/moments/`
- Admin panel: `apps/admin/src/app/(dashboard)/`
- Backend: `supabase/functions/`, `apps/admin/src/app/api/`
