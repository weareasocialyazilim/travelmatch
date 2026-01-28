# Admin Audits

## Audit Logging

All critical actions are logged for accountability.

## What Is Audited

| Category       | Actions Logged                         |
| -------------- | -------------------------------------- |
| Authentication | Login, logout, failure, password reset |
| Authorization  | Permission changes, role grants        |
| Content        | Create, update, delete moments         |
| Moderation     | Approve, reject, ban actions           |
| Financial      | Payout requests, escrow releases       |
| User           | Profile changes, subscription changes  |

## Audit Log Format

```json
{
  "timestamp": "2026-01-28T10:00:00Z",
  "actor_id": "user-uuid",
  "action": "moderation.approve",
  "target_type": "moment",
  "target_id": "moment-uuid",
  "metadata": {
    "reason": "Content approved",
    "previous_status": "pending"
  },
  "ip_address": "1.2.3.4"
}
```

## Code References

| Feature          | Location                                      |
| ---------------- | --------------------------------------------- |
| Audit service    | `supabase/functions/_shared/audit.ts`         |
| Audit logs table | `supabase/migrations/*_create_audit_logs.sql` |

## Retention

- Audit logs: 1 year retention
- Financial records: Per regulatory requirements

## NOT IMPLEMENTED

- Real-time audit dashboards
- Custom audit queries
- Automated audit reports
- Audit log exports
