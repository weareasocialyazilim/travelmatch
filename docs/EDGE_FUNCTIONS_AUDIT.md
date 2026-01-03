# Edge Functions Audit Report

> **Date**: January 2026
> **Status**: Cleanup Complete ✓
> **Last Updated**: 2026-01-03

## Summary

| Category | Count |
|----------|-------|
| Total Edge Functions | 21 |
| Actively Used | 16 |
| Webhook Handlers | 2 |
| Scheduled Jobs | 1 |
| Utility Functions | 2 |
| ~~Deleted~~ | ~~3~~ |

## Actively Used Functions (16)

These functions are referenced in client applications:

| Function | Used In | Purpose |
|----------|---------|---------|
| `api` | apiV1Service.ts | REST API routing proxy |
| `audit-logging` | soc2-compliance.ts | SOC2 audit trail |
| `export-user-data` | userService.ts | GDPR data export |
| `get-secret` | infisicalService.ts | Secrets management |
| `paytr-create-payment` | securePaymentService.ts | PayTR payment creation |
| `paytr-saved-cards` | securePaymentService.ts | Card management |
| `paytr-transfer` | walletService.ts | Fund transfers |
| `sendgrid-email` | sendgridService.ts | Email service |
| `setup-2fa` | Admin panel | 2FA setup |
| `transfer-funds` | securePaymentService.ts | Direct transfers |
| `twilio-sms` | twilioService.ts | SMS/OTP service |
| `upload-cloudflare-image` | cloudflareImages.ts | CDN image upload |
| `upload-image` | imageUploadService.ts | Image handling |
| `verify-2fa` | Admin panel | 2FA verification |
| `verify-kyc` | paymentsApi.ts | KYC verification |
| `verify-proof` | useCeremony.ts | Proof verification |

## Webhook Handlers (2)

These are triggered by external events, not client calls:

| Function | Trigger | Purpose |
|----------|---------|---------|
| `paytr-webhook` | PayTR callback | Payment status updates |
| `handle-storage-upload` | Storage INSERT | Post-upload processing |

## Scheduled Jobs (1)

| Function | Schedule | Purpose |
|----------|----------|---------|
| `update-exchange-rates` | pg_cron | Currency rate updates |

## Utility Functions (2)

Internal utilities not called by clients but needed for infrastructure:

| Function | Purpose | Why Kept |
|----------|---------|----------|
| `cdn-invalidate` | Cloudflare cache purge | Used by CI/CD and handle-storage-upload |
| `geocode` | Mapbox geocoding proxy | Protects API token server-side |

## Deleted Functions (3) - 2026-01-03

These functions were removed after confirming no production usage:

| Function | Reason for Deletion |
|----------|---------------------|
| `auth-login` | Redundant - client uses Supabase SDK directly |
| `feed-delta` | Unimplemented feature - client never integrated |
| `get-user-profile` | Redundant - RLS allows direct table queries |

> **Git Recovery**: `git checkout HEAD~1 -- supabase/functions/{function-name}`

## Action Items

- [x] ~~Review the 5 candidate functions~~
- [x] ~~Delete unused zombie functions~~
- [x] Keep utility functions (cdn-invalidate, geocode)
- [ ] Monitor remaining function usage via Supabase Dashboard
