# Trust Score

## Overview

Trust Score is a user reputation metric that influences platform behavior and limits.

## Trust Score Levels

| Level      | Score Range | Description              |
| ---------- | ----------- | ------------------------ |
| Sprout     | 0-29        | New user, building trust |
| Growing    | 30-49       | Established user         |
| Blooming   | 50-69       | Trusted contributor      |
| Vibrant    | 70-89       | Highly trusted           |
| Ambassador | 90-100      | Top tier, verified       |

## Trust Score Factors

Score is calculated based on:

- Completed moments (positive)
- Proof approvals (positive)
- Proof rejections (negative)
- Reports against user (negative)
- Admin bans (negative)

## Code References

| Feature       | Location                                        |
| ------------- | ----------------------------------------------- |
| Trust service | `apps/mobile/src/services/TrustScoreService.ts` |
| Trust RPC     | `supabase/functions/_shared/trustScore.ts`      |
| Trust levels  | `apps/mobile/src/constants/trust.ts`            |

## NOT IMPLEMENTED

- Trust score recovery mechanisms
- Trust score decay over time
- Trust-based feature gating beyond basic tiers
- Trust score appeals
