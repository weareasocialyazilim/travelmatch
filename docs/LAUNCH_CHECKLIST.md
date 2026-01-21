# 🚀 Lovendo Launch Checklist

## Pre-Launch Status

### ✅ Infrastructure & CI/CD

- [x] GitHub Actions workflows configured
- [x] Infisical secrets management (27 secrets)
- [x] GitHub secrets (8 secrets)
- [x] Turbo remote caching enabled
- [x] CI pipeline (lint, test, build)
- [x] Security scanning (Snyk, CodeQL, TruffleHog)
- [x] Performance CI (bundle analysis, TypeScript check)
- [x] Production deploy workflow
- [x] Database migrations workflow
- [x] EAS production environment variables (12 vars)

### ✅ Backend (Supabase)

- [x] Supabase project: `bjikxgtbptrvawkguypv`
- [x] Region: Southeast Asia (Singapore)
- [x] Database URL configured
- [x] Service role key configured
- [x] RLS policies reviewed (33 tables, 184 policies)
- [x] Database indexes defined (production will optimize via pg_stat)
- [x] Edge Functions deployed (21 functions ACTIVE)
- [ ] Realtime subscriptions tested

### ✅ Third-Party Integrations

| Service           | Status        | Notes                       |
| ----------------- | ------------- | --------------------------- |
| Sentry            | ✅ Ready      | DSN + Auth Token configured |
| PostHog           | ✅ Ready      | API Key configured          |
| Mapbox            | ✅ Ready      | Public + Secret tokens      |
| Cloudflare Images | ✅ Ready      | Account + Token             |
| PayTR             | ✅ Production | Payment provider configured |
| Codecov           | ✅ Ready      | Token configured            |
| Snyk              | ✅ Ready      | Token configured            |

### ✅ Mobile App (Expo/EAS)

- [x] EAS project linked (`55ca9fff-1a53-4190-b368-f9facf1febfd`)
- [x] Development build profile
- [x] Preview build profile
- [x] Production build profile
- [x] App icons (icon.png, adaptive-icon.png, splash-icon.png)
- [x] Splash screen configured
- [x] Privacy Policy screen (in-app)
- [x] Terms of Service screen (in-app)
- [ ] App Store screenshots
- [ ] Store metadata & descriptions

### 📋 Store Submission Requirements

#### Apple App Store

- [ ] Apple Developer Account ($99/year)
- [ ] App Store Connect app created
- [x] Provisioning profiles (managed by EAS)
- [x] Privacy Policy URL (in-app screen ready)
- [x] Terms of Service URL (in-app screen ready)
- [ ] App screenshots (6.7", 6.5", 5.5")
- [ ] App description (4000 chars max)
- [ ] Keywords
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] Age rating questionnaire
- [ ] Export compliance

#### Google Play Store

- [ ] Google Developer Account ($25 one-time)
- [ ] Play Console app created
- [x] Upload key / signing configured (via EAS)
- [x] Privacy Policy URL (in-app screen ready)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone, tablet)
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Content rating questionnaire
- [ ] Data safety form

---

## 🔧 Pre-Launch Actions

### 1. Database Preparation

```bash
# Run pending migrations
pnpm supabase db push

# Verify RLS policies
pnpm supabase db lint

# Check for missing indexes
psql -f scripts/analyze_unused_indexes.sql
```

### 2. Build Production App

```bash
# iOS
cd apps/mobile && eas build --platform ios --profile production

# Android
cd apps/mobile && eas build --platform android --profile production
```

### 3. Test Production Build

```bash
# Install on device and test:
# - Authentication flow
# - Profile creation
# - Moment creation + upload
# - Chat/messaging
# - Payments (sandbox)
# - Push notifications
# - Deep links
```

### 4. Submit to Stores

```bash
# iOS
eas submit --platform ios --latest

# Android
eas submit --platform android --latest
```

---

## 🚨 Launch Day Checklist

### Morning of Launch

- [ ] Verify Supabase status (status.supabase.com)
- [ ] Check all edge functions are deployed
- [ ] Verify Sentry is receiving events
- [ ] Check PostHog tracking is working
- [ ] Test one complete user flow

### After Store Approval

- [ ] Enable PayTR production mode
- [ ] Update app.config.ts with production keys if needed
- [ ] Monitor Sentry for new errors
- [ ] Monitor PostHog for user activity
- [ ] Check Supabase dashboard for connections

### First 24 Hours

- [ ] Monitor error rates in Sentry
- [ ] Check user signups in Supabase
- [ ] Review PostHog session recordings
- [ ] Respond to any App Store/Play Store reviews
- [ ] Monitor social media mentions

---

## 📊 Key Metrics to Track

### Technical Health

- Error rate (Sentry) - Target: < 1%
- API response time - Target: < 200ms
- App crash rate - Target: < 0.1%
- Database connection count

### User Engagement

- Daily Active Users (DAU)
- Session duration
- Onboarding completion rate
- Feature adoption rates

### Business Metrics

- User signups
- Profile completions
- Matches made
- Messages sent
- Transaction volume (when payments go live)

---

## 🆘 Emergency Contacts

- **Supabase Support**: support@supabase.io
- **Expo/EAS Support**: https://expo.dev/contact
- **Sentry Support**: support@sentry.io
- **App Store Review**: Contact via App Store Connect
- **Play Store Review**: Contact via Play Console

---

## 📅 Timeline

| Phase                              | Target Date | Status |
| ---------------------------------- | ----------- | ------ |
| Internal Testing                   | Current     | ✅     |
| Beta Testing (TestFlight/Internal) | TBD         | ⏳     |
| App Store Submission               | TBD         | ⏳     |
| Play Store Submission              | TBD         | ⏳     |
| Public Launch                      | TBD         | ⏳     |

---

_Last updated: December 22, 2025_
