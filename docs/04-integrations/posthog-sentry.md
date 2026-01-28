# PostHog and Sentry Integration

## PostHog (Analytics)

### Purpose

Product analytics for understanding user behavior and feature usage.

### Allowed Events

```typescript
const ALLOWED_EVENTS = [
  'moment_view',
  'discover_filter_apply',
  'moment_created',
  'moment_claimed',
  'gift_created',
  'chat_unlock_request',
  'signup_started',
  'app_opened',
] as const;
```

### Privacy Rules

- No PII in events
- No message content
- No proof details
- No chat conversations

### Configuration

```bash
NEXT_PUBLIC_POSTHOG_API_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

## Sentry (Error Tracking)

### Purpose

Crash reporting and error monitoring for mobile and web apps.

### Data Excluded

- User email/names
- Message content
- Payment details
- Authentication tokens

### Configuration

```bash
SENTRY_DSN=https://xxx@sentry.io/xxx
```

## Code References

| Feature        | Location                                |
| -------------- | --------------------------------------- |
| PostHog config | `apps/mobile/src/config/posthog.ts`     |
| Sentry config  | `apps/mobile/src/config/sentry.ts`      |
| Analytics hook | `apps/mobile/src/hooks/useAnalytics.ts` |

## NOT IMPLEMENTED

- Session replay
- Heatmaps
- A/B testing
- Feature flags
- Custom event tracking
- Error breadcrumbs in production
