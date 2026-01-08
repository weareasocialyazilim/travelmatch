# 🔐 Secret Management - TravelMatch

## ⚠️ Important Security Notes

1. **NEVER create `.env` files** - All secrets are managed via Infisical
2. **Always use `infisical run`** - Secrets are injected at runtime, never stored on disk
3. **EU Region** - We use `eu.infisical.com` for GDPR compliance

## Quick Start

```bash
# Login to Infisical (EU region)
infisical login

# Run app with secrets injected
cd apps/mobile
pnpm ios:secure    # iOS with secrets
pnpm dev:secure    # Dev server with secrets

# Or manually
infisical run --env=dev -- expo start
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECRET SOURCES                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐          ┌─────────────────────────┐  │
│  │  GitHub Secrets │          │   Infisical (EU)        │  │
│  │   (4 secrets)   │          │   eu.infisical.com      │  │
│  ├─────────────────┤          ├─────────────────────────┤  │
│  │ INFISICAL_*     │─────────▶│ All app secrets:        │  │
│  │ TURBO_*         │          │ - Supabase              │  │
│  └─────────────────┘          │ - Sentry                │  │
│                               │ - PayTR (payments)      │  │
│                               │ - Expo                  │  │
│                               │ - Cloudflare            │  │
│                               │ - Mapbox                │  │
│                               │ - PostHog               │  │
│                               │ - Twilio (SMS)          │  │
│                               │ - SendGrid (Email)      │  │
│                               └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## GitHub Secrets (4 Total)

| Secret                    | Purpose                  | Where to get                                                                             |
| ------------------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| `INFISICAL_CLIENT_ID`     | Infisical authentication | [Infisical Dashboard](https://app.infisical.com) → Project Settings → Machine Identities |
| `INFISICAL_CLIENT_SECRET` | Infisical authentication | Same as above                                                                            |
| `TURBO_TOKEN`             | Turbo remote cache       | [Vercel Dashboard](https://vercel.com/account/tokens)                                    |
| `TURBO_TEAM`              | Turbo team identifier    | Your Vercel team slug                                                                    |

---

## Infisical Secrets

### Production (`prod`) - 41 secrets

```
CLOUDFLARE_ACCOUNT_HASH
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_IMAGES_TOKEN
CODECOV_TOKEN
EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_HASH
EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN
EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN
MAPBOX_SECRET_TOKEN
EXPO_PUBLIC_POSTHOG_API_KEY
EXPO_PUBLIC_POSTHOG_HOST
EXPO_PUBLIC_SENTRY_DSN
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_SUPABASE_URL
EXPO_TOKEN
EXPO_TOKEN_PERSONAL
MAPBOX_DOWNLOAD_TOKEN
SENTRY_AUTH_TOKEN
SENTRY_DSN
SENTRY_ORG
SENTRY_PROJECT
SNYK_TOKEN

# PayTR (Payment Processing)
PAYTR_MERCHANT_ID
PAYTR_MERCHANT_KEY
PAYTR_MERCHANT_SALT
PAYTR_TEST_MODE

SUPABASE_DB_PASSWORD
SUPABASE_SERVICE_ROLE_KEY
TOTP_ENCRYPTION_KEY
TOTP_ENCRYPTION_SALT

# Twilio (SMS & Phone Verification)
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
TWILIO_VERIFY_SERVICE_SID

# SendGrid (Email)
SENDGRID_API_KEY
SENDGRID_FROM_EMAIL
SENDGRID_FROM_NAME
SENDGRID_TEMPLATE_WELCOME
SENDGRID_TEMPLATE_EMAIL_VERIFICATION
SENDGRID_TEMPLATE_PASSWORD_RESET
SENDGRID_TEMPLATE_GIFT_RECEIVED
SENDGRID_TEMPLATE_GIFT_SENT
SENDGRID_TEMPLATE_PAYMENT_RECEIPT
SENDGRID_TEMPLATE_SECURITY_ALERT
SENDGRID_TEMPLATE_NEW_MESSAGE
```

### Staging (`staging`) - 19 secrets

```
CLOUDFLARE_ACCOUNT_HASH
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_IMAGES_TOKEN
CODECOV_TOKEN
EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_HASH
EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN
EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN
MAPBOX_SECRET_TOKEN
EXPO_PUBLIC_POSTHOG_API_KEY
EXPO_PUBLIC_POSTHOG_HOST
EXPO_PUBLIC_SENTRY_DSN
EXPO_TOKEN
SENTRY_AUTH_TOKEN
SENTRY_DSN
SENTRY_ORG
SENTRY_PROJECT
SNYK_TOKEN
STAGING_SUPABASE_ANON_KEY
STAGING_SUPABASE_URL
```

---

## Workflow Integration

All workflows automatically import secrets from Infisical:

```yaml
# Step 1: Import from Infisical
- name: 🔐 Import secrets from Infisical
  uses: Infisical/secrets-action@v2.0.0
  with:
    client-id: ${{ secrets.INFISICAL_CLIENT_ID }}
    client-secret: ${{ secrets.INFISICAL_CLIENT_SECRET }}
    project-slug: travelmatch
    env-slug: prod # or staging
    export-type: env

# Step 2: Use secrets as env vars
- name: Build
  run: eas build --platform ios
  env:
    EXPO_TOKEN: ${{ env.EXPO_TOKEN }}
    SENTRY_AUTH_TOKEN: ${{ env.SENTRY_AUTH_TOKEN }}
```

---

## CLI Commands

### List secrets

```bash
# Production
infisical secrets --env=prod

# Staging
infisical secrets --env=staging
```

### Add secret

```bash
infisical secrets set MY_SECRET="value" --env=prod
```

### Add Twilio Secrets (SMS/Phone)

```bash
# Twilio credentials (from console.twilio.com)
infisical secrets set TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" --env=prod
infisical secrets set TWILIO_AUTH_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" --env=prod
infisical secrets set TWILIO_PHONE_NUMBER="+1xxxxxxxxxx" --env=prod
infisical secrets set TWILIO_VERIFY_SERVICE_SID="VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" --env=prod
```

### Add SendGrid Secrets (Email)

```bash
# SendGrid credentials (from app.sendgrid.com)
infisical secrets set SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx" --env=prod
infisical secrets set SENDGRID_FROM_EMAIL="noreply@travelmatch.app" --env=prod
infisical secrets set SENDGRID_FROM_NAME="TravelMatch" --env=prod

# Optional: Dynamic Template IDs
infisical secrets set SENDGRID_TEMPLATE_WELCOME="d-xxxxxxxx" --env=prod
infisical secrets set SENDGRID_TEMPLATE_EMAIL_VERIFICATION="d-xxxxxxxx" --env=prod
infisical secrets set SENDGRID_TEMPLATE_PASSWORD_RESET="d-xxxxxxxx" --env=prod
```

### Delete secret

```bash
infisical secrets delete MY_SECRET --env=prod
```

### Export to .env file

```bash
infisical export --env=prod > .env.production
```

---

## Security Best Practices

✅ **DO:**

- Use Infisical for all app secrets
- Rotate secrets regularly
- Use different values per environment
- Enable audit logs

❌ **DON'T:**

- Hardcode secrets in code
- Commit .env files
- Share secrets via chat
- Use prod secrets in dev

---

## Troubleshooting

### "Secret not found"

- Check the correct environment (prod/staging)
- Verify Machine Identity has project access

### "Authentication failed"

- Regenerate Machine Identity credentials
- Update GitHub Secrets

### Workflow failing

- Check Infisical action logs
- Verify `export-type: env` is set
