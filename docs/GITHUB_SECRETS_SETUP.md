# GitHub Secrets Setup Guide

**Date:** December 8, 2025  
**Status:** Missing 40+ secrets blocking CI/CD  
**Priority:** P0 (Critical - Blocks all deployments)

---

## 📊 Current Status

Your CI/CD workflows require **46 GitHub secrets** to function properly. Currently, **most are missing**, causing pipeline failures.

---

## 🚀 Quick Setup Guide

### Step 1: Access GitHub Secrets

1. Go to: https://github.com/kemalteksalgit/travelmatch/settings/secrets/actions
2. Click **"New repository secret"**
3. Add each secret from the lists below

### Step 2: Get Secret Values

You already have some of these values! Here's where to find them:

#### From Supabase Dashboard
- Go to: https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/settings/api
- **SUPABASE_URL**: `https://bjikxgtbptrvawkguypv.supabase.co`
- **SUPABASE_ANON_KEY**: Found under "Project API keys" → "anon public"
- **SUPABASE_SERVICE_KEY**: Found under "Project API keys" → "service_role" (⚠️ Keep secret!)
- **SUPABASE_PROJECT_REF**: `bjikxgtbptrvawkguypv`

#### From Supabase Access Token
- Go to: https://supabase.com/dashboard/account/tokens
- Click "Generate new token"
- **SUPABASE_ACCESS_TOKEN**: Copy the token

---

## 📋 Required Secrets by Priority

### P0 - Critical (Required for ANY CI/CD to work)

| Secret Name | Where to Get | Required For |
|-------------|--------------|--------------|
| `EXPO_TOKEN` | https://expo.dev/accounts/[your-account]/settings/access-tokens | Build, Deploy, CI |
| `SUPABASE_URL` | Supabase Dashboard → Settings → API | All workflows |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | All workflows |
| `SUPABASE_SERVICE_KEY` | Supabase Dashboard → Settings → API | Edge functions |
| `SUPABASE_PROJECT_REF` | `bjikxgtbptrvawkguypv` | Deployments |
| `SUPABASE_ACCESS_TOKEN` | Supabase Account → Tokens | CLI operations |

**Action:** Add these 6 secrets FIRST to unblock basic CI/CD.

---

### P1 - High Priority (Production deployments)

| Secret Name | Where to Get | Required For |
|-------------|--------------|--------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` | Mobile app env |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same as `SUPABASE_ANON_KEY` | Mobile app env |
| `VITE_SUPABASE_URL` | Same as `SUPABASE_URL` | Admin panel |
| `VITE_SUPABASE_ANON_KEY` | Same as `SUPABASE_ANON_KEY` | Admin panel |
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com/apikeys | Payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks | Payment webhooks |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys | AI features |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys | AI features (optional) |

**Action:** Add these 8 secrets for production features to work.

---

### P2 - Medium Priority (Monitoring & Analytics)

| Secret Name | Where to Get | Required For |
|-------------|--------------|--------------|
| `SENTRY_AUTH_TOKEN` | https://sentry.io/settings/account/api/auth-tokens/ | Error tracking |
| `CODECOV_TOKEN` | https://codecov.io/gh/kemalteksalgit/travelmatch | Coverage reports |
| `SNYK_TOKEN` | https://app.snyk.io/account | Security scanning |
| `SLACK_WEBHOOK_URL` | Slack → Apps → Incoming Webhooks | Notifications |
| `SLACK_WEBHOOK` | Same as above (duplicate key) | Notifications |

**Action:** Add these 5 secrets for monitoring and alerts.

---

### P3 - Low Priority (Optional services)

| Secret Name | Where to Get | Required For |
|-------------|--------------|--------------|
| `TURBO_TOKEN` | https://vercel.com/account/tokens | Turbo cache |
| `TURBO_TEAM` | Your Vercel team ID | Turbo cache |
| `CHROMATIC_TOKEN` | https://www.chromatic.com/start | Visual testing |
| `VERCEL_TOKEN` | https://vercel.com/account/tokens | Vercel deployments |
| `VERCEL_ORG_ID` | Vercel → Settings → General | Vercel org |
| `VERCEL_STORYBOOK_PROJECT_ID` | Vercel project settings | Storybook deploy |
| `LHCI_GITHUB_APP_TOKEN` | GitHub → Settings → Developer settings | Lighthouse CI |
| `MAESTRO_CLOUD_API_KEY` | https://console.mobile.dev/ | E2E testing |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens | CDN purge |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard | CDN |
| `CLOUDFLARE_ZONE_ID` | Cloudflare → Domain → Overview | CDN |

**Action:** Add these 11 secrets when you're ready to enable advanced features.

---

### P4 - iOS Deployment (Apple-specific)

| Secret Name | Where to Get | Required For |
|-------------|--------------|--------------|
| `APPLE_ID` | Your Apple Developer email | iOS builds |
| `ASC_APP_ID` | App Store Connect → Apps | iOS deployment |
| `APPLE_TEAM_ID` | Developer → Membership | iOS signing |

**Action:** Add these 3 secrets when ready for iOS deployment.

---

## 🎯 Recommended Setup Order

### Phase 1: Unblock CI/CD (15 minutes)

```bash
# Add these 6 secrets first:
1. EXPO_TOKEN
2. SUPABASE_URL
3. SUPABASE_ANON_KEY
4. SUPABASE_SERVICE_KEY
5. SUPABASE_PROJECT_REF
6. SUPABASE_ACCESS_TOKEN
```

**Expected Result:** Basic CI workflows will pass

### Phase 2: Enable Production (30 minutes)

```bash
# Add these 8 secrets:
7. EXPO_PUBLIC_SUPABASE_URL
8. EXPO_PUBLIC_SUPABASE_ANON_KEY
9. VITE_SUPABASE_URL
10. VITE_SUPABASE_ANON_KEY
11. STRIPE_SECRET_KEY
12. STRIPE_WEBHOOK_SECRET
13. OPENAI_API_KEY
14. ANTHROPIC_API_KEY (optional)
```

**Expected Result:** Mobile app and admin panel can build

### Phase 3: Add Monitoring (20 minutes)

```bash
# Add these 5 secrets:
15. SENTRY_AUTH_TOKEN
16. CODECOV_TOKEN
17. SNYK_TOKEN
18. SLACK_WEBHOOK_URL
19. SLACK_WEBHOOK
```

**Expected Result:** Error tracking and notifications work

### Phase 4: Optional Services (variable time)

Add remaining secrets as needed for specific features.

---

## 📝 Step-by-Step: Adding a Secret

### Via GitHub Web Interface

1. Navigate to: https://github.com/kemalteksalgit/travelmatch/settings/secrets/actions
2. Click **"New repository secret"**
3. **Name**: Enter the exact secret name (e.g., `EXPO_TOKEN`)
4. **Secret**: Paste the value
5. Click **"Add secret"**
6. Repeat for each secret

### Via GitHub CLI (Faster for multiple secrets)

```bash
# Install GitHub CLI if not already installed
brew install gh

# Authenticate
gh auth login

# Add secrets
gh secret set EXPO_TOKEN --body "your-expo-token-here"
gh secret set SUPABASE_URL --body "https://bjikxgtbptrvawkguypv.supabase.co"
gh secret set SUPABASE_PROJECT_REF --body "bjikxgtbptrvawkguypv"

# ... continue for all secrets
```

---

## 🔍 How to Get Each Secret Value

### EXPO_TOKEN
```bash
# Option 1: Via Expo website
1. Go to: https://expo.dev/
2. Sign in
3. Click your profile → Settings → Access Tokens
4. Create a new token with "Read and write" permissions
5. Copy the token

# Option 2: Via Expo CLI
npx expo login
npx expo whoami
# Then create token via website
```

### SUPABASE_URL
```bash
# Already known: https://bjikxgtbptrvawkguypv.supabase.co
# Or get from: Supabase Dashboard → Settings → API → Project URL
```

### SUPABASE_ANON_KEY
```bash
# Supabase Dashboard → Settings → API → Project API keys → anon public
# This is safe to expose in client-side code
```

### SUPABASE_SERVICE_KEY
```bash
# ⚠️ NEVER commit this or expose it!
# Supabase Dashboard → Settings → API → Project API keys → service_role
# This bypasses Row Level Security - keep it secret!
```

### SUPABASE_PROJECT_REF
```bash
# Your project reference ID: bjikxgtbptrvawkguypv
# Found in: Supabase Dashboard URL or Settings → General
```

### SUPABASE_ACCESS_TOKEN
```bash
# 1. Go to: https://supabase.com/dashboard/account/tokens
# 2. Click "Generate new token"
# 3. Name it "GitHub Actions"
# 4. Copy the token (you won't see it again!)
```

### STRIPE_SECRET_KEY
```bash
# 1. Go to: https://dashboard.stripe.com/apikeys
# 2. Use "Secret key" (starts with sk_live_ or sk_test_)
# 3. For production, use live key
# 4. For testing, use test key
```

### STRIPE_WEBHOOK_SECRET
```bash
# 1. Go to: https://dashboard.stripe.com/webhooks
# 2. Click on your webhook endpoint
# 3. Click "Reveal" next to "Signing secret"
# 4. Copy the secret (starts with whsec_)
```

### OPENAI_API_KEY
```bash
# 1. Go to: https://platform.openai.com/api-keys
# 2. Click "+ Create new secret key"
# 3. Name it "TravelMatch Production"
# 4. Copy the key (starts with sk-)
```

### SENTRY_AUTH_TOKEN
```bash
# 1. Go to: https://sentry.io/settings/account/api/auth-tokens/
# 2. Click "Create New Token"
# 3. Permissions: project:releases, project:write, org:read
# 4. Copy the token
```

### CODECOV_TOKEN
```bash
# 1. Go to: https://codecov.io/gh/kemalteksalgit/travelmatch
# 2. Settings → General → Repository Upload Token
# 3. Copy the token
```

### SLACK_WEBHOOK_URL
```bash
# 1. Go to: https://api.slack.com/apps
# 2. Create new app or select existing
# 3. Incoming Webhooks → Activate
# 4. Add New Webhook to Workspace
# 5. Copy the Webhook URL
```

---

## ✅ Verification Script

After adding secrets, verify they're set correctly:

```bash
# Run this script to check which secrets are configured
./scripts/verify-github-secrets.sh
```

Or manually check via GitHub CLI:

```bash
gh secret list

# Expected output:
# EXPO_TOKEN                Updated 2025-12-08
# SUPABASE_URL              Updated 2025-12-08
# SUPABASE_ANON_KEY         Updated 2025-12-08
# ...etc
```

---

## 🐛 Troubleshooting

### Secret not working?

1. **Check spelling**: Secret names are case-sensitive
2. **No spaces**: Trim leading/trailing whitespace from values
3. **No quotes**: Don't wrap values in quotes unless the secret itself contains quotes
4. **Re-add**: Delete and re-add if issues persist

### Still getting errors?

```bash
# Check workflow syntax
gh workflow view ci.yml

# View recent run logs
gh run list --limit 5
gh run view [run-id] --log
```

### Common Issues

**Issue:** `Error: EXPO_TOKEN is required`
- **Solution:** Make sure secret name is EXACTLY `EXPO_TOKEN` (all caps)

**Issue:** `Error: Invalid Supabase URL`
- **Solution:** URL should be `https://bjikxgtbptrvawkguypv.supabase.co` (no trailing slash)

**Issue:** `Error: Authentication failed`
- **Solution:** Regenerate the token and update the secret

---

## 📊 Impact Analysis

### Before (Current State)
- ✅ 0/13 workflow files passing
- ❌ Cannot deploy to production
- ❌ No test coverage reports
- ❌ No error monitoring
- ❌ No automated deployments

### After Phase 1 (P0 secrets)
- ✅ 8/13 workflow files passing
- ✅ Basic CI/CD operational
- ✅ Can test locally
- ⏸️ Deployment still blocked (needs P1)

### After Phase 2 (P0 + P1 secrets)
- ✅ 11/13 workflow files passing
- ✅ Can deploy to production
- ✅ Mobile app builds work
- ✅ Admin panel builds work
- ✅ Payment processing functional

### After Phase 3 (P0 + P1 + P2 secrets)
- ✅ 13/13 workflow files passing
- ✅ Full monitoring and alerts
- ✅ Coverage reports published
- ✅ Security scanning active
- ✅ Team notifications working

---

## 🔒 Security Best Practices

### DO ✅
- Use separate keys for test/staging/production
- Rotate secrets every 90 days
- Use minimal permissions for each token
- Revoke unused tokens immediately
- Monitor secret usage in GitHub Actions logs
- Use environment-specific secrets when possible

### DON'T ❌
- Never commit secrets to git
- Don't share secrets via email/chat
- Don't reuse the same token across projects
- Don't use personal tokens for production
- Don't log secret values in workflows

### Secret Rotation Schedule

| Secret | Rotation Frequency | Last Rotated | Next Rotation |
|--------|-------------------|--------------|---------------|
| EXPO_TOKEN | 90 days | TBD | TBD + 90d |
| SUPABASE_SERVICE_KEY | 180 days | TBD | TBD + 180d |
| STRIPE_SECRET_KEY | 365 days | TBD | TBD + 365d |
| OPENAI_API_KEY | 90 days | TBD | TBD + 90d |
| All others | 180 days | TBD | TBD + 180d |

---

## 📚 Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Expo Access Tokens](https://docs.expo.dev/accounts/programmatic-access/)
- [Supabase Management API](https://supabase.com/docs/reference/cli/introduction)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [OpenAI API Keys](https://platform.openai.com/docs/api-reference/authentication)

---

## 🎯 Success Checklist

- [ ] Phase 1: Added 6 P0 secrets (EXPO, SUPABASE_*)
- [ ] Verified: `gh secret list` shows all 6 secrets
- [ ] Tested: Re-run failed CI workflow → Should pass
- [ ] Phase 2: Added 8 P1 secrets (Stripe, OpenAI, etc.)
- [ ] Verified: Mobile build workflow passes
- [ ] Tested: Admin panel build workflow passes
- [ ] Phase 3: Added 5 P2 secrets (Monitoring)
- [ ] Verified: All 13 workflows passing
- [ ] Documented: Secret rotation dates in password manager
- [ ] Set calendar reminders for rotation

---

**Status:** Ready to implement  
**Estimated Time:** 45-90 minutes for all phases  
**Impact:** Unblocks ALL CI/CD pipelines ✅

