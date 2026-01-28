# Logging and Analytics

## Logging Standards

### What Must Be Logged

| Event                 | Data                             | Retention |
| --------------------- | -------------------------------- | --------- |
| Auth success/failure  | User ID, timestamp, IP           | 1 year    |
| Authorization denials | User ID, resource, reason        | 1 year    |
| Admin actions         | Actor, action, target, timestamp | 1 year    |
| Payment events        | Transaction ID, amount, status   | 1 year    |
| Moderation decisions  | Moderator, decision, content ID  | 1 year    |

### What Must NOT Be Logged

- PII (email, phone, full name)
- Payment card numbers
- Message content
- Proof media URLs
- Chat transcripts

## Logging Services

| Service             | Purpose                  |
| ------------------- | ------------------------ |
| Sentry              | Error and crash tracking |
| PostHog             | Product analytics        |
| Supabase Audit Logs | Database access logs     |

## Code References

| Feature        | Location                              |
| -------------- | ------------------------------------- |
| Sentry config  | `apps/mobile/src/config/sentry.ts`    |
| PostHog config | `apps/mobile/src/config/posthog.ts`   |
| Audit logging  | `supabase/functions/_shared/audit.ts` |

## Privacy-Safe Analytics

### Allowed Events

- `moment_view`
- `discover_filter_apply`
- `moment_created`
- `moment_claimed`
- `gift_created`
- `chat_unlock_request`
- `signup_started`

### NOT Tracked

- Message content
- Proof details
- Chat conversations
- Location history
- Browsing behavior patterns

## NOT IMPLEMENTED

- Custom event tracking beyond allowlist
- Session replay
- Heatmaps
- A/B testing framework
