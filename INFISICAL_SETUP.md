# 🔐 Infisical Secrets Management Setup

## Overview

Infisical is a centralized secrets management platform that replaces manual `.env` file management.

**Benefits:**
- ✅ Centralized secret storage
- ✅ Automatic syncing across environments
- ✅ Secret versioning and audit logs
- ✅ Team access control
- ✅ CLI integration for local development
- ✅ CI/CD integration for automated deployments

---

## 🚀 Quick Start

### 1. Install Infisical CLI

**macOS (Homebrew):**
```bash
brew install infisical/get-cli/infisical
```

**Linux/Windows:**
```bash
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical
```

**Verify installation:**
```bash
infisical --version
```

---

### 2. Create Infisical Account & Project

1. **Sign up:** https://app.infisical.com/signup
2. **Create Organization:** `TravelMatch`
3. **Create Project:** `TravelMatch Mobile`
4. **Copy Project ID** (Workspace ID) from Project Settings

---

### 3. Configure Project

**Update `.infisical.json`:**
```json
{
  "workspaceId": "your-project-id-here",
  "defaultEnvironment": "dev"
}
```

**Login to Infisical:**
```bash
cd apps/mobile
infisical login
```

---

### 4. Add Secrets to Infisical Dashboard

Go to: https://app.infisical.com/project/{workspaceId}/secrets

**Add these secrets for each environment (dev, staging, prod):**

#### Production Environment (`prod`)

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://bjikxgtbptrvawkguypv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Mapbox
EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN=pk.eyJ1...
EXPO_PUBLIC_MAPBOX_SECRET_TOKEN=sk.eyJ1...

# PostHog
EXPO_PUBLIC_POSTHOG_API_KEY=phc_...
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# App Config
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_APP_NAME=TravelMatch
EXPO_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_ERROR_TRACKING=true
EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
```

---

### 5. Sync Secrets Locally

**Pull secrets from Infisical to .env file:**
```bash
cd apps/mobile

# Pull dev environment secrets
infisical secrets

# Pull production secrets
infisical secrets --env=prod

# Export to .env file (auto-sync)
infisical export --env=prod --format=dotenv > .env.production
```

**Add to your workflow:**
```bash
# Before running the app
infisical run --env=dev -- pnpm dev

# Before building production
infisical export --env=prod --format=dotenv > .env.production
eas build --platform all --profile production
```

---

### 6. Add Infisical Scripts to package.json

```json
{
  "scripts": {
    "secrets:pull": "infisical export --env=dev --format=dotenv > .env",
    "secrets:pull:prod": "infisical export --env=prod --format=dotenv > .env.production",
    "dev:secure": "infisical run --env=dev -- pnpm dev",
    "build:secure": "infisical run --env=prod -- pnpm build:all"
  }
}
```

---

## 🔧 Local Development Workflow

### Option 1: Manual Sync
```bash
# Pull latest secrets
pnpm secrets:pull

# Run app normally
pnpm dev
```

### Option 2: Auto-Inject (Recommended)
```bash
# Infisical auto-injects secrets at runtime
pnpm dev:secure
```

---

## 🚀 CI/CD Integration

### GitHub Actions

**Add Infisical secrets to GitHub:**
1. Go to GitHub repo → Settings → Secrets
2. Add: `INFISICAL_TOKEN` (get from Infisical Dashboard → Project Settings → Service Tokens)

**Update `.github/workflows/build.yml`:**
```yaml
- name: Install Infisical CLI
  run: |
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
    sudo apt-get update && sudo apt-get install -y infisical

- name: Pull secrets from Infisical
  env:
    INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
  run: |
    cd apps/mobile
    infisical export --env=prod --format=dotenv > .env.production

- name: Build app
  run: |
    cd apps/mobile
    eas build --platform all --profile production --non-interactive
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Store ALL sensitive secrets in Infisical
- Use service tokens for CI/CD (not personal tokens)
- Rotate tokens regularly (every 90 days)
- Enable audit logs in Infisical Dashboard
- Use environment-specific secrets (dev, staging, prod)

### ❌ DON'T:
- Commit `.env` files to git
- Share personal Infisical login credentials
- Use production secrets in development
- Store secrets in plaintext anywhere

---

## 📊 Secrets Organization

### Mobile App Secrets (Infisical Project: TravelMatch Mobile)

**Environment: `dev`**
- Development API endpoints (localhost, ngrok)
- Test API keys (Stripe test mode, Mapbox dev token)
- Relaxed feature flags

**Environment: `staging`**
- Staging API endpoints
- Test API keys
- Production-like feature flags

**Environment: `prod`**
- Production API endpoints
- Live API keys
- Production feature flags

### Backend Secrets (Supabase Dashboard → Edge Functions)

These should remain in Supabase Dashboard (not Infisical):
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `MAPBOX_SECRET_TOKEN`

**Why?** Edge Functions run server-side and need direct access to Supabase env vars.

---

## 🆘 Troubleshooting

### Error: "Invalid token"
```bash
# Re-login to Infisical
infisical login
```

### Error: "Workspace not found"
```bash
# Check .infisical.json has correct workspaceId
cat .infisical.json
```

### Secrets not syncing
```bash
# Force refresh
infisical secrets --force
```

### CI/CD failing
```bash
# Verify service token has correct permissions
# Infisical Dashboard → Project Settings → Service Tokens → Check scopes
```

---

## 📈 Migration from .env to Infisical

**Step 1: Backup existing .env files**
```bash
cp .env .env.backup
cp .env.production .env.production.backup
```

**Step 2: Import secrets to Infisical**
```bash
# Option 1: Manual (Recommended for security review)
# Copy each secret from .env to Infisical Dashboard

# Option 2: Bulk import (faster but less secure)
infisical import --env=dev --file=.env
infisical import --env=prod --file=.env.production
```

**Step 3: Verify sync**
```bash
infisical secrets --env=prod
```

**Step 4: Delete local .env files**
```bash
# Ensure .gitignore includes .env files
echo ".env*" >> .gitignore
rm .env .env.production
```

**Step 5: Test with Infisical**
```bash
pnpm dev:secure
```

---

## 🎯 Next Steps

1. ✅ Install Infisical CLI
2. ✅ Create Infisical account and project
3. ✅ Add secrets to Infisical Dashboard
4. ✅ Update `.infisical.json` with project ID
5. ✅ Test local sync with `infisical secrets`
6. ✅ Update CI/CD workflows
7. ✅ Delete local `.env` files after successful migration
8. ✅ Train team on Infisical usage

---

**Documentation:** https://infisical.com/docs
**Dashboard:** https://app.infisical.com
**Support:** support@infisical.com
