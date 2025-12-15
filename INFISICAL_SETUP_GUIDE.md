# 🔐 Infisical Secrets Management Setup

**Organization:** travelmatch
**Organization ID:** `cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9`
**Status:** Ready for Configuration
**Last Updated:** 2025-12-15

---

## 📋 OVERVIEW

Infisical centralizes all sensitive secrets (API keys, tokens, database credentials) in a secure, encrypted vault. This eliminates the need for `.env` files in production and provides:

- ✅ **Secret Versioning:** Track changes to secrets over time
- ✅ **Access Control:** Role-based permissions for team members
- ✅ **Audit Logs:** See who accessed which secrets and when
- ✅ **Multi-Environment:** Separate secrets for dev, staging, production
- ✅ **Auto-Sync:** Secrets sync to CI/CD pipelines automatically

---

## 🚀 SETUP STEPS

### Step 1: Create Infisical Project

```bash
# Login to Infisical Dashboard
# https://app.infisical.com/org/cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9

# Create new project: "TravelMatch"
# Project slug: travelmatch-mobile
# Environments: development, staging, production
```

### Step 2: Add Secrets to Infisical

Navigate to **Secrets** tab for each environment:

#### 🟢 Development Environment
```bash
# Supabase
SUPABASE_URL=https://bjikxgtbptrvawkguypv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaWt4Z3RicHRydmF3a2d1eXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTQzNDgsImV4cCI6MjA0OTc3MDM0OH0.jKSPE6XGKHsYZC6R90aeU6V2hMF3xE1hLQs7p6VLbEo
SUPABASE_SERVICE_ROLE_KEY=<get-from-supabase-dashboard>

# Stripe (Test Keys)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx

# Analytics
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Feature Flags
ENABLE_ANALYTICS=false
ENABLE_DEBUG_LOGGING=true
```

#### 🟡 Staging Environment
```bash
# Same as production but with staging URLs
SUPABASE_URL=https://bjikxgtbptrvawkguypv.supabase.co
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # Still test keys
ENABLE_ANALYTICS=true
ENABLE_DEBUG_LOGGING=false
```

#### 🔴 Production Environment
```bash
# Supabase (Production)
SUPABASE_URL=https://bjikxgtbptrvawkguypv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaWt4Z3RicHRydmF3a2d1eXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTQzNDgsImV4cCI6MjA0OTc3MDM0OH0.jKSPE6XGKHsYZC6R90aeU6V2hMF3xE1hLQs7p6VLbEo
SUPABASE_SERVICE_ROLE_KEY=<CRITICAL-get-from-supabase-dashboard>

# Stripe (Live Keys - CRITICAL)
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_live_xxxxx

# Third-Party APIs
OPENAI_API_KEY=sk-xxxxx
CLOUDFLARE_STREAM_API_KEY=xxxxx
CLOUDFLARE_STREAM_ACCOUNT_ID=xxxxx
GOOGLE_MAPS_SERVER_KEY=AIzaSy...
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# Analytics (Production)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_DEBUG_LOGGING=false
```

---

## 🔌 INTEGRATION

### Option 1: Infisical CLI (Recommended for Development)

```bash
# Install Infisical CLI
brew install infisical/get-cli/infisical

# Or via NPM
npm install -g @infisical/cli

# Login to Infisical
infisical login

# Initialize project (run in /apps/mobile)
cd apps/mobile
infisical init

# Select organization: travelmatch
# Select project: travelmatch-mobile
# Select environment: development

# Run app with Infisical secrets
infisical run -- npx expo start

# This automatically injects all secrets as environment variables
```

### Option 2: Infisical SDK (Recommended for Production)

```bash
# Install SDK
npm install @infisical/sdk
```

Create `apps/mobile/src/config/infisical.config.ts`:

```typescript
import { InfisicalSDK } from '@infisical/sdk';

const infisical = new InfisicalSDK({
  clientId: process.env.INFISICAL_CLIENT_ID!,
  clientSecret: process.env.INFISICAL_CLIENT_SECRET!,
  cacheTTL: 300, // 5 minutes
});

export async function getSecrets(environment: 'development' | 'staging' | 'production') {
  const secrets = await infisical.listSecrets({
    environment,
    projectId: 'cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9',
  });

  return secrets.reduce((acc, secret) => {
    acc[secret.secretKey] = secret.secretValue;
    return acc;
  }, {} as Record<string, string>);
}
```

### Option 3: GitHub Actions Integration

Add to `.github/workflows/build.yml`:

```yaml
- name: Fetch secrets from Infisical
  uses: Infisical/secrets-action@v1
  with:
    client-id: ${{ secrets.INFISICAL_CLIENT_ID }}
    client-secret: ${{ secrets.INFISICAL_CLIENT_SECRET }}
    env-slug: production
    project-id: cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9

- name: Build app
  run: npx expo build:ios
  env:
    SUPABASE_URL: ${{ env.SUPABASE_URL }}
    SUPABASE_ANON_KEY: ${{ env.SUPABASE_ANON_KEY }}
```

---

## 📱 MOBILE APP INTEGRATION

### Update `apps/mobile/.env.example`

```bash
# ============================================
# 🔐 INFISICAL - Secrets Management
# ============================================
# All sensitive secrets are managed via Infisical
# https://app.infisical.com/org/cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9

# Machine Identity Credentials (for CI/CD and server-side access)
INFISICAL_CLIENT_ID=your-machine-identity-client-id
INFISICAL_CLIENT_SECRET=your-machine-identity-client-secret
INFISICAL_PROJECT_ID=cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9

# Public variables (safe to expose in client bundle)
EXPO_PUBLIC_SUPABASE_URL=https://bjikxgtbptrvawkguypv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_APP_ENV=development
```

### Create `.infisical.json` (Project Config)

```json
{
  "workspaceId": "cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9",
  "defaultEnvironment": "development",
  "gitBranchToEnvironmentMapping": {
    "main": "production",
    "staging": "staging",
    "*": "development"
  }
}
```

**Add to `.gitignore`:**
```bash
# Already added in previous cleanup
.infisical/
.infisical.json
```

---

## 🧪 TESTING

### Test Infisical Integration

```bash
# 1. Login
infisical login

# 2. List secrets (verify connection)
infisical secrets list --env development

# 3. Run app with secrets
cd apps/mobile
infisical run -- npx expo start

# 4. Verify secrets are loaded
# Check console output for: ✅ Environment validation passed
```

### Test Secret Rotation

```bash
# 1. Update a secret in Infisical dashboard
# 2. Restart app
infisical run -- npx expo start

# 3. Verify new secret is loaded (check cache TTL)
```

---

## 🔒 SECURITY BEST PRACTICES

### ✅ DO
- Store ALL sensitive keys in Infisical (Stripe, OpenAI, etc.)
- Use Machine Identities for CI/CD pipelines
- Enable audit logging for all secret access
- Rotate secrets every 90 days
- Use separate projects for mobile app vs backend
- Set short cache TTL (5 minutes) for critical secrets

### ❌ DON'T
- Never commit `.env` files with real secrets
- Never use EXPO_PUBLIC_ prefix for sensitive keys
- Never hardcode API keys in source code
- Never share Machine Identity credentials in chat/email
- Never disable audit logging

---

## 🚨 EMERGENCY SECRET ROTATION

If a secret is compromised:

```bash
# 1. Immediately rotate in Infisical dashboard
# 2. Revoke old API keys from provider (Stripe, OpenAI, etc.)
# 3. Update secret in Infisical
# 4. Restart all services
infisical run -- npm run restart:all

# 5. Review audit logs
# https://app.infisical.com/org/cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9/audit-logs

# 6. Notify team via Slack/Email
```

---

## 📊 MONITORING

### Audit Logs

Monitor secret access in Infisical dashboard:
- Who accessed which secrets
- When secrets were updated
- Failed access attempts
- Secret export events

### Alerts

Set up alerts for:
- Unauthorized access attempts
- Secrets accessed outside business hours
- Secrets not rotated in 90+ days
- Machine Identity token near expiration

---

## 🎯 CHECKLIST

### Initial Setup
- [ ] Create Infisical project: "TravelMatch"
- [ ] Add all secrets to development environment
- [ ] Add all secrets to staging environment
- [ ] Add all secrets to production environment
- [ ] Create Machine Identity for CI/CD
- [ ] Install Infisical CLI on dev machines

### Integration
- [ ] Add `.infisical.json` to project root
- [ ] Update `.env.example` with Infisical variables
- [ ] Test `infisical run -- npx expo start`
- [ ] Add Infisical GitHub Action to CI/CD
- [ ] Update deployment docs with Infisical instructions

### Security
- [ ] Enable audit logging
- [ ] Set up secret rotation schedule
- [ ] Configure access controls (role-based)
- [ ] Test secret rotation procedure
- [ ] Document emergency rotation process

---

## 📚 RESOURCES

- [Infisical Docs](https://infisical.com/docs)
- [Infisical SDK](https://infisical.com/docs/sdks/overview)
- [Infisical CLI](https://infisical.com/docs/cli/overview)
- [GitHub Actions Integration](https://infisical.com/docs/integrations/cicd/githubactions)
- [Expo + Infisical Guide](https://infisical.com/docs/integrations/frameworks/expo)

---

## 🎉 QUICK START

```bash
# 1. Install CLI
brew install infisical/get-cli/infisical

# 2. Login
infisical login

# 3. Initialize project
cd apps/mobile
infisical init

# 4. Run app with secrets
infisical run -- npx expo start

# Done! All secrets loaded securely 🔐
```

---

**Status:** 🟢 Ready for Setup
**Organization ID:** cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9
**Next Action:** Create project in Infisical dashboard → Add secrets → Test integration
