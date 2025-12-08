# 🚀 TravelMatch Deployment Guide
**Version:** 1.0.0  
**Last Updated:** December 8, 2024  
**Status:** Production-Ready ✅

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Deployment Workflows](#deployment-workflows)
5. [Mobile App Deployment](#mobile-app-deployment)
6. [Edge Functions Deployment](#edge-functions-deployment)
7. [Database Migrations](#database-migrations)
8. [Monitoring & Rollback](#monitoring--rollback)
9. [Troubleshooting](#troubleshooting)

---

## 🌐 Overview

TravelMatch uses a **fully automated CI/CD pipeline** for deployments:

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Mobile     │  │    Edge      │  │  Database    │ │
│  │   (EAS)      │  │  Functions   │  │  Migrations  │ │
│  │              │  │  (Supabase)  │  │  (Supabase)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                 │                  │          │
│         ▼                 ▼                  ▼          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ App Store    │  │ Supabase     │  │ PostgreSQL   │ │
│  │ Google Play  │  │ Edge Runtime │  │ Prod DB      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Deployment Triggers

| Component | Trigger | Workflow | Target |
|-----------|---------|----------|--------|
| **Mobile Apps** | GitHub Release | `deploy.yml` | App Store + Google Play |
| **Edge Functions** | Push to `main` | `monorepo-ci.yml` | Supabase Edge Runtime |
| **Database** | Manual | Supabase Dashboard | PostgreSQL Production |
| **Storybook** | Push to `main` | `design-system.yml` | Vercel |

---

## ✅ Prerequisites

### Required Accounts

1. **GitHub** 
   - Repository access with admin rights
   - GitHub Actions enabled

2. **Expo/EAS**
   - Expo account ([expo.dev](https://expo.dev))
   - EAS Build subscription ($29/month for production)
   - Generate `EXPO_TOKEN` from [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens)

3. **Apple Developer**
   - Apple Developer Account ($99/year)
   - App Store Connect access
   - Apple Team ID
   - App-specific password for Apple ID

4. **Google Play Console**
   - Google Play Developer Account ($25 one-time)
   - Service Account with API access
   - App signing key uploaded

5. **Supabase**
   - Supabase project created
   - Production database configured
   - Edge Functions enabled
   - Generate access token from [app.supabase.com/account/tokens](https://app.supabase.com/account/tokens)

6. **Cloudflare** (Optional - for CDN)
   - Cloudflare account
   - R2 storage configured
   - Images API enabled

### Required Secrets

Add these to **GitHub Repository Settings → Secrets and Variables → Actions**:

```bash
# Expo/EAS
EXPO_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Apple
APPLE_ID=your-apple-id@email.com
ASC_APP_ID=1234567890
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Google Play
GOOGLE_PLAY_SERVICE_ACCOUNT_KEY=<base64-encoded-json>

# Supabase
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_DB_PASSWORD=your-db-password

# Cloudflare (Optional)
CLOUDFLARE_API_TOKEN=your-cloudflare-token
CLOUDFLARE_ACCOUNT_ID=your-account-id

# Chromatic (Visual Testing)
CHROMATIC_TOKEN=chpt_xxxxxxxxxxxxxxxxxxxxxxxx

# Other Services
SENTRY_AUTH_TOKEN=your-sentry-token
CODECOV_TOKEN=your-codecov-token
```

---

## 🔧 Environment Setup

### 1. Clone Environment Templates

```bash
# Root environment
cp .env.example .env

# Mobile app environment
cp apps/mobile/.env.example apps/mobile/.env

# OAuth configuration
cp .env.oauth.example .env.oauth

# Admin panel
cp admin/.env.example admin/.env

# Services
cp services/.env.example services/.env
```

### 2. Configure Environment Variables

#### **Root `.env`**
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Redis (Optional - for caching)
REDIS_URL=redis://user:password@your-redis-host:6379

# App Configuration
NODE_ENV=production
APP_ENV=production
API_URL=https://api.travelmatch.app
```

#### **Mobile `.env`** (`apps/mobile/.env`)
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_API_URL=https://api.travelmatch.app
EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_HASH=your-cloudflare-hash
EXPO_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

#### **OAuth `.env.oauth`**
See `docs/OAUTH_SETUP_GUIDE.md` for detailed OAuth setup.

```bash
# Google OAuth
GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com

# Apple OAuth
APPLE_SERVICE_ID=com.travelmatch.app.signin

# Facebook OAuth
FACEBOOK_APP_ID=1234567890
```

---

## 📱 Mobile App Deployment

### Overview
Mobile apps are deployed using **Expo Application Services (EAS)** which handles:
- Native builds (iOS & Android)
- App Store & Google Play submissions
- Over-the-air (OTA) updates
- Build artifacts & logs

### Deployment Process

#### **Step 1: Create a GitHub Release**

```bash
# Tag the release
git tag v1.0.0
git push origin v1.0.0

# Create release on GitHub
gh release create v1.0.0 \
  --title "v1.0.0 - Production Release" \
  --notes "Release notes here"
```

Or via GitHub UI: **Releases → Draft a new release**

#### **Step 2: Automatic Build & Submit**

The `deploy.yml` workflow automatically:
1. ✅ Builds iOS & Android production binaries
2. ✅ Submits to App Store Connect & Google Play Console
3. ✅ Notifies team on completion

**Workflow Logs:** GitHub → Actions → Deploy

#### **Step 3: Manual App Store Steps**

##### **iOS (App Store Connect)**
1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Select your app → TestFlight
3. Verify build appears (usually 5-10 minutes)
4. Add to TestFlight for beta testing (optional)
5. Submit for App Store Review:
   - App Store → App Information
   - Add screenshots, description
   - Select build → Submit for Review
   - Review time: 1-3 days

##### **Android (Google Play Console)**
1. Go to [play.google.com/console](https://play.google.com/console)
2. Select your app → Production
3. Verify build uploaded
4. Create new release:
   - Release name: v1.0.0
   - Release notes
   - Roll out to production (or staged rollout)
5. Review time: Usually a few hours

### Manual Deployment (if needed)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for production
cd apps/mobile
eas build --platform all --profile production

# Submit manually
eas submit --platform ios --profile production
eas submit --platform android --profile production

# Check build status
eas build:list
```

### Over-the-Air (OTA) Updates

For **non-native changes** (JS, assets), use OTA updates:

```bash
cd apps/mobile

# Publish update
eas update --branch production --message "Fix: Button alignment"

# Check update status
eas update:list --branch production
```

**Important:** OTA updates work for:
- ✅ JavaScript code changes
- ✅ Asset updates (images, fonts)
- ❌ Native code changes (requires new build)
- ❌ Expo SDK upgrades (requires new build)

---

## ⚡ Edge Functions Deployment

### Overview
Supabase Edge Functions are deployed automatically on push to `main` via `monorepo-ci.yml`.

### Auto-Deployment

**Deployed Functions:**
1. `process-payment` - Payment processing
2. `proof-validator` - Travel proof validation
3. `moment-suggestions` - AI-powered suggestions
4. `smart-notifications` - Intelligent notifications
5. `real-time-insights` - Analytics & insights

**Workflow:** `.github/workflows/monorepo-ci.yml`

```yaml
deploy-edge-functions:
  if: github.ref == 'refs/heads/main'
  steps:
    - name: Deploy to Supabase
      run: |
        supabase functions deploy process-payment
        supabase functions deploy proof-validator
        # ... etc
```

### Manual Deployment

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Deploy single function
supabase functions deploy process-payment

# Deploy all functions
supabase functions deploy

# View function logs
supabase functions logs process-payment --tail
```

### Function Secrets

Set secrets via Supabase Dashboard or CLI:

```bash
# Via CLI
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
supabase secrets set OPENAI_API_KEY=sk-xxxxx

# Via Dashboard
# Supabase Dashboard → Edge Functions → Secrets
```

### Testing Edge Functions

```bash
# Local testing
supabase functions serve process-payment

# Test with curl
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/process-payment' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"amount": 100, "currency": "USD"}'
```

---

## 🗄️ Database Migrations

### Overview
Database schema changes are managed via **Supabase Migrations**.

### Migration Workflow

#### **Step 1: Create Migration Locally**

```bash
# Generate migration file
supabase migration new add_user_preferences

# Edit migration file
# supabase/migrations/20241208_add_user_preferences.sql
```

Example migration:
```sql
-- Add user preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);
```

#### **Step 2: Test Locally**

```bash
# Reset local DB
supabase db reset

# Run migrations
supabase migration up

# Verify
supabase db diff
```

#### **Step 3: Deploy to Production**

```bash
# Push migration to remote
supabase db push

# Or via Dashboard:
# Supabase Dashboard → Database → Migrations → Upload
```

### Rollback Strategy

```bash
# Create rollback migration
supabase migration new rollback_user_preferences

# In rollback file:
DROP TABLE IF EXISTS public.user_preferences;

# Deploy rollback
supabase db push
```

### Database Seeding

See `scripts/seed-database.ts` for test data seeding.

```bash
# Seed local database
pnpm seed:local

# Seed staging database
pnpm seed:staging

# NEVER seed production - use migrations only
```

---

## 📊 Monitoring & Rollback

### Health Checks

#### **Mobile App Health**
```bash
# Check app status
eas build:list --limit 5

# View crash reports
# Sentry Dashboard: sentry.io
```

#### **Edge Functions Health**
```bash
# Function logs
supabase functions logs <function-name> --tail

# Metrics
# Supabase Dashboard → Edge Functions → Analytics
```

#### **Database Health**
```bash
# Connection test
psql $DATABASE_URL -c "SELECT 1;"

# Performance metrics
# Supabase Dashboard → Database → Performance
```

### Rollback Procedures

#### **Mobile App Rollback**

**Option 1: OTA Update** (if JS-only issue)
```bash
cd apps/mobile
eas update --branch production --message "Rollback to v1.0.0"
```

**Option 2: Binary Rollback** (if native issue)
1. GitHub → Releases → Previous release
2. Re-run deploy workflow for that tag
3. Or manually submit previous build from EAS

#### **Edge Functions Rollback**
```bash
# Re-deploy previous version
git checkout <previous-commit>
supabase functions deploy <function-name>
git checkout main
```

#### **Database Rollback**
```bash
# Run rollback migration (see Database Migrations section)
supabase migration new rollback_<feature>
supabase db push
```

---

## 🔍 Troubleshooting

### Common Issues

#### **1. EAS Build Fails**

**Error:** `EXPO_TOKEN is not set`
```bash
# Solution: Add to GitHub Secrets
# Settings → Secrets → Actions → New secret
```

**Error:** `Provisioning profile invalid`
```bash
# Solution: Update provisioning profile
eas credentials
# Select: iOS → Production → Update Provisioning Profile
```

**Error:** `Out of disk space`
```bash
# Solution: Use --clear-cache flag
eas build --platform ios --profile production --clear-cache
```

#### **2. Edge Function Deployment Fails**

**Error:** `Unauthorized`
```bash
# Solution: Re-login
supabase login
supabase link --project-ref your-project-ref
```

**Error:** `Function size too large`
```bash
# Solution: Remove node_modules, use deno deploy
# Edge Functions use Deno, not Node.js
# Only import needed dependencies
```

#### **3. Database Migration Fails**

**Error:** `Migration already applied`
```bash
# Solution: Check migration history
supabase migration list

# Skip migration
supabase db push --skip-migration <migration-name>
```

**Error:** `RLS policy conflicts`
```bash
# Solution: Drop conflicting policies first
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

#### **4. GitHub Actions Fails**

**Check logs:**
```bash
# Via CLI
gh run list --workflow=deploy.yml
gh run view <run-id>

# Via UI
# GitHub → Actions → Deploy → Select failed run
```

**Common fixes:**
- Check all secrets are set
- Verify Node version matches (20.x)
- Check dependency installation logs
- Re-run failed jobs

---

## 📝 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing locally (`pnpm test`)
- [ ] Lint checks pass (`pnpm lint`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] E2E tests pass (`pnpm test:e2e`)
- [ ] Version bumped in `package.json`
- [ ] Changelog updated (`CHANGELOG.md`)
- [ ] Environment variables configured
- [ ] Database migrations tested locally
- [ ] All secrets added to GitHub Actions

### Mobile App Deployment

- [ ] Create GitHub release
- [ ] Wait for build to complete (20-30 min)
- [ ] Verify build in EAS Dashboard
- [ ] Test on physical device (TestFlight/Internal Testing)
- [ ] Submit for App Store review
- [ ] Submit for Google Play review
- [ ] Monitor crash reports (Sentry)
- [ ] Monitor user feedback

### Edge Functions Deployment

- [ ] Merge PR to `main`
- [ ] Wait for auto-deployment (2-5 min)
- [ ] Verify function logs (Supabase Dashboard)
- [ ] Test function endpoint
- [ ] Monitor error rates
- [ ] Check performance metrics

### Database Deployment

- [ ] Backup production database
- [ ] Test migration on staging
- [ ] Schedule maintenance window (if needed)
- [ ] Run migration
- [ ] Verify schema changes
- [ ] Test dependent functions
- [ ] Monitor query performance

### Post-Deployment

- [ ] Smoke test critical paths
- [ ] Monitor error rates (24 hours)
- [ ] Check analytics for anomalies
- [ ] Update documentation
- [ ] Notify team in Slack/Discord
- [ ] Archive old builds (if needed)

---

## 🔗 Quick Links

### Documentation
- [OAuth Setup Guide](./OAUTH_SETUP_GUIDE.md)
- [GitHub Secrets Setup](./GITHUB_SECRETS_SETUP.md)
- [ESLint Issues Report](./ESLINT_ISSUES_REPORT.md)
- [IDOR Protection](./IDOR_PROTECTION.md)

### External Resources
- [Expo EAS Docs](https://docs.expo.dev/eas/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)

### Dashboards
- [GitHub Actions](https://github.com/kemalteksalgit/travelmatch/actions)
- [Expo Dashboard](https://expo.dev/accounts/travelmatch/projects)
- [Supabase Dashboard](https://app.supabase.com/project/your-project)
- [Sentry](https://sentry.io/organizations/travelmatch)

---

## 📞 Support

**Deployment Issues:**
- Check GitHub Actions logs first
- Review Supabase function logs
- Contact DevOps team if needed

**Emergency Rollback:**
1. Stop auto-deployment (disable GitHub Actions workflow)
2. Execute rollback procedure (see section above)
3. Notify team immediately
4. Document incident in post-mortem

---

**Last Updated:** December 8, 2024  
**Maintained by:** TravelMatch DevOps Team  
**Version:** 1.0.0
