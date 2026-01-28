# Infisical Integration

## Overview

Infisical manages secrets and sensitive configuration across environments.

## What Infisical Stores

| Secret Type          | Examples                   |
| -------------------- | -------------------------- |
| API Keys             | Mapbox, SendGrid, Twilio   |
| Provider Secrets     | PayTR merchant credentials |
| Webhook Secrets      | Stripe, PayTR callbacks    |
| Database Credentials | Connection strings         |

## What NOT Stored in Infisical

- Public environment variables (NEXT*PUBLIC*\*)
- Frontend-only config
- User data

## Usage Pattern

```bash
# Pull secrets
infisical run -- pnpm dev

# Or use Infisical CLI in CI/CD
infisical run --env=production -- npm run deploy
```

## Code References

| Feature        | Location             |
| -------------- | -------------------- |
| Secrets config | `.infisical/`        |
| CI/CD pipeline | `.github/workflows/` |

## NOT IMPLEMENTED

- Automatic secret rotation
- Secret versioning
- Self-hosted Infisical
