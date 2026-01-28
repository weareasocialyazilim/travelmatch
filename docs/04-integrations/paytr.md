# PayTR Integration

## Overview

PayTR is used ONLY for creator payouts (withdrawals). Consumer purchases use RevenueCat (IAP).

## Usage Scope

| Action         | Provider         | Reason               |
| -------------- | ---------------- | -------------------- |
| Coin purchase  | RevenueCat (IAP) | App Store compliance |
| Creator payout | PayTR            | Bank transfer        |

## Payout Flow

```
Creator requests withdrawal
    │
    ▼
Check balance and KYC
    │
    ▼
Create PayTR payment request
    │
    ▼
PayTR processes bank transfer
    │
    ▼
Update payout status
```

## Environment Configuration

```bash
PAYTR_MERCHANT_ID=xxx
PAYTR_MERCHANT_KEY=xxx
PAYTR_MERCHANT_SALT=xxx
```

## Code References

| Feature       | Location                                                         |
| ------------- | ---------------------------------------------------------------- |
| Payout API    | `apps/admin/src/app/api/wallet/payouts/route.ts`                 |
| Payout screen | `apps/mobile/src/features/wallet/screens/BankTransferScreen.tsx` |
| PayTR service | `supabase/functions/_shared/paytr.ts`                            |

## NOT IMPLEMENTED

- PayTR consumer checkout
- Direct credit card payments via PayTR
- PayTR installment support
- PayTR wallet integration
