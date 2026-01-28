# Admin Escrow Controls

## Escrow Management

Admins can view and manage escrow transactions from the admin panel.

## Escrow Actions

| Action       | Description                    |
| ------------ | ------------------------------ |
| View Details | See escrow transaction details |
| Release      | Approve proof, release funds   |
| Refund       | Reject proof, return funds     |
| Dispute      | Flag for further review        |

## Escrow Status Flow

```
pending → [release | refund | dispute]
                 ↓           ↓
            released    refunded
```

## Code References

| Feature           | Location                                            |
| ----------------- | --------------------------------------------------- |
| Wallet operations | `apps/admin/src/app/(dashboard)/wallet-operations/` |
| Escrow API        | `apps/admin/src/app/api/escrow/`                    |
| Payout API        | `apps/admin/src/app/api/wallet/payouts/`            |

## NOT IMPLEMENTED

- Partial releases
- Escrow auto-release timers
- Escrow dispute arbitration
- Batch escrow operations
