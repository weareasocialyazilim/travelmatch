# 🔐 API Keys Setup Guide

## ⚠️ CRITICAL: Required for Production Launch

Before launching to App Store / Google Play, you **MUST** add these API keys to `.env.production`:

---

## 📍 1. Mapbox (REQUIRED - Maps won't work without this!)

**Where to get:** https://account.mapbox.com/

### Steps:
1. Create Mapbox account (Free tier: 50,000 map loads/month)
2. Go to "Access Tokens" → "Create a token"
3. **Public token:**
   - Scopes: `styles:read`, `fonts:read`, `tiles:read`
   - URL restrictions (optional): `lovendo.app`, `localhost`
   - Copy token → Add to `.env.production`:
     ```bash
     EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN=pk.eyJ1Ijoi...
     ```

4. **Secret token (for downloads, build-time only):**
   - Scopes: `downloads:read`
   - Copy token → Add to `.env.production`:
     ```bash
     EXPO_PUBLIC_MAPBOX_SECRET_TOKEN=sk.eyJ1Ijoi...
     ```

---

## 📊 2. PostHog Analytics (REQUIRED - Analytics won't work!)

**Where to get:** https://posthog.com/

### Steps:
1. Sign up for PostHog (Free tier: 1M events/month)
2. Create a new project
3. Go to "Project Settings" → "API Keys" → "Project API Key"
4. Copy key → Add to `.env.production`:
   ```bash
   EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxxxxxxxxxxxxxxxxxxxx
   EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

---

## 🐛 3. Sentry Error Tracking (RECOMMENDED)

**Where to get:** https://sentry.io/

### Steps:
1. Sign up for Sentry
2. Create new project → Select "React Native"
3. Copy DSN (looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)
4. Add to `.env.production`:
   ```bash
   EXPO_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

---

## ☁️ 4. Cloudflare Images (RECOMMENDED - 60-80% faster image loading)

**Where to get:** https://dash.cloudflare.com/

### Steps:
1. Create Cloudflare account
2. Enable "Cloudflare Images"
3. Copy Account ID from Images dashboard URL
4. Add to `.env.production`:
   ```bash
   EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your-account-id
   ```

**Note:** Cloudflare Images API Token should be added to **Supabase Edge Functions** (server-side), NOT in `.env.production`!

---

## ✅ Verification Checklist

After adding all keys, verify:

```bash
# 1. Check all required keys are present
cd apps/mobile
cat .env.production | grep -E "MAPBOX_PUBLIC_TOKEN|MAPBOX_SECRET_TOKEN|POSTHOG_API_KEY|SENTRY_DSN"

# 2. Validate environment
pnpm dev

# 3. Check logs for "Environment validation passed"
# You should see: ✅ Environment validation passed

# 4. Test each integration:
# - Mapbox: Open Discover screen → Map should load
# - PostHog: App.tsx logs "PostHog initialized successfully"
# - Sentry: Check Sentry dashboard for events
# - Cloudflare: Images should load faster
```

---

## 🚨 Security Warnings

### ✅ SAFE to expose (EXPO_PUBLIC_* prefix):
- Mapbox Public Token (`pk.xxx`)
- PostHog API Key (`phc_xxx`)
- Sentry DSN
- Cloudflare Account ID

### ❌ NEVER expose to client:
- Mapbox Secret Token (only used during build, not in bundle)
- Supabase Service Role Key → Add to Supabase Dashboard only!
- Stripe Secret Key → Backend only!
- Cloudflare Images Token → Backend only!

---

## 📝 Production Launch Checklist

Before submitting to stores:

- [ ] All required API keys added to `.env.production`
- [ ] Environment validation passes (`pnpm dev`)
- [ ] Maps load correctly in Discover screen
- [ ] Analytics events visible in PostHog dashboard
- [ ] Sentry receives error reports
- [ ] Images load via Cloudflare CDN
- [ ] No hardcoded localhost URLs
- [ ] No console.log in production code
- [ ] Build succeeds: `eas build --platform all`

---

## 🔗 Quick Links

- Mapbox Tokens: https://account.mapbox.com/access-tokens
- PostHog Dashboard: https://app.posthog.com
- Sentry Projects: https://sentry.io/organizations/YOUR_ORG/projects/
- Cloudflare Images: https://dash.cloudflare.com/

---

**Need help?** See `INFISICAL_SETUP.md` for centralized secrets management (recommended for team workflows).
