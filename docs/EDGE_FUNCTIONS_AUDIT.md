# Edge Functions Audit Report

> **Date**: January 2026
> **Status**: Review Complete

## Summary

| Category | Count |
|----------|-------|
| Total Edge Functions | 26 |
| Actively Used | 16 |
| Webhook Handlers | 2 |
| Scheduled Jobs | 1 |
| Candidates for Review | 5 |

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

## Candidates for Review (5)

These functions are implemented but have no client references:

| Function | Status | Recommendation |
|----------|--------|----------------|
| `auth-login` | Unused | Evaluate if legacy or planned |
| `cdn-invalidate` | Unused | May be used in CI/CD |
| `feed-delta` | Unused | Planned feature? |
| `geocode` | Metrics only | Server-side geocoding |
| `get-user-profile` | Unused | Has Redis caching - evaluate need |

## Action Items

1. **Keep**: Webhook handlers and scheduled jobs (they work correctly)
2. **Review**: The 5 candidate functions with team before removal
3. **Document**: Add usage comments to webhook/scheduled functions
