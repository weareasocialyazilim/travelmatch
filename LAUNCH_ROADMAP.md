# 🚀 TravelMatch Production Launch Roadmap
## 20-Day Sprint to Launch

---

## 📊 Current Status

```
BLOCKER SUMMARY
───────────────────────────────────────────────────────
Security Blockers:     4  (2 fixed via SQL, 2 pending)
Store Blockers:        2  (iOS manifest, Android SDK)
Service Blockers:      4  (Cloudflare, Mapbox, PostHog, Expo Updates)
───────────────────────────────────────────────────────
Total Critical:       10
Estimated Fix Time:   20 days
```

---

## 🔴 PHASE 0: Immediate Blockers
### Days 1-2 | ~8 hours

#### Day 1: Database Security
```bash
# Apply critical security fixes
supabase db push

# Verify fixes applied
psql -c "SELECT conname FROM pg_constraint WHERE conname = 'check_balance_non_negative';"
```

| Task | Time | Owner |
|------|------|-------|
| Apply SQL migration `20251217100000_critical_security_fixes.sql` | 30 min | Backend |
| Test balance constraint (try negative insert) | 15 min | Backend |
| Test escrow functions (should fail from client) | 30 min | Backend |
| Verify audit logging works | 15 min | Backend |

#### Day 2: Service API Keys
| Task | Time | Owner |
|------|------|-------|
| Create Cloudflare account, get Account ID | 30 min | DevOps |
| Create Cloudflare Images API token | 15 min | DevOps |
| Create Mapbox account, get tokens | 30 min | DevOps |
| Create PostHog project (EU), get API key | 30 min | DevOps |
| Update all .env files | 30 min | DevOps |
| Test: Upload image → Should work | 15 min | QA |
| Test: Open map → Should render | 15 min | QA |
| Test: Check PostHog → Events arriving | 15 min | QA |

**Day 2 Environment Variables:**
```env
# Cloudflare - Get from dashboard.cloudflare.com
CLOUDFLARE_ACCOUNT_ID=your_real_account_id
CLOUDFLARE_IMAGES_TOKEN=your_images_api_token

# Mapbox - Get from account.mapbox.com/access-tokens
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91...
MAPBOX_SECRET_TOKEN=sk.eyJ1IjoieW91...

# PostHog - Get from app.posthog.com (EU) or eu.posthog.com
EXPO_PUBLIC_POSTHOG_API_KEY=phc_your_real_key
```

---

## 🟡 PHASE 1: Store Compliance
### Days 3-5 | ~12 hours

#### Day 3: iOS Compliance
```bash
cd apps/mobile

# Generate native projects
expo prebuild --clean

# Create Privacy Manifest
cat > ios/TravelMatch/PrivacyInfo.xcprivacy << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSPrivacyTracking</key>
  <false/>
  <key>NSPrivacyTrackingDomains</key>
  <array/>
  <key>NSPrivacyCollectedDataTypes</key>
  <array/>
  <key>NSPrivacyAccessedAPITypes</key>
  <array>
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array><string>CA92.1</string></array>
    </dict>
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array><string>C617.1</string></array>
    </dict>
  </array>
</dict>
</plist>
EOF

# Test iOS build
eas build --platform ios --profile preview
```

#### Day 4: Android Compliance
```typescript
// app.config.ts - Add these
android: {
  // ... existing config
  targetSdkVersion: 34,
  compileSdkVersion: 34,
}
```

```bash
# Test Android build
eas build --platform android --profile preview
```

#### Day 5: OTA Updates
```bash
# Install expo-updates
npx expo install expo-updates
```

```typescript
// app.config.ts - Add updates config
export default {
  // ... existing config
  updates: {
    url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID}`,
    fallbackToCacheTimeout: 0,
    checkAutomatically: 'ON_LOAD',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
};
```

---

## 🟢 PHASE 2: Performance & UX
### Days 6-10 | ~20 hours

#### Days 6-7: Performance Fixes

| File | Issue | Fix |
|------|-------|-----|
| `RequestsScreen.tsx` | .map() instead of FlashList | Replace with FlashList |
| `ProfileMomentCard.tsx` | Regular Image | Use OptimizedImage |
| `ChatHeader.tsx` | Regular Image | Use OptimizedImage |
| `MessageBubble.tsx` | Regular Image | Use OptimizedImage |
| `RequestCard.tsx` | Regular Image | Use OptimizedImage |
| `NotificationCard.tsx` | Regular Image | Use OptimizedImage |
| `MessagesScreen.tsx:96` | setTimeout leak | Add cleanup |

#### Days 8-9: UX Polish

| Component | Fix |
|-----------|-----|
| `Button.tsx` | Add haptic feedback via useHaptics |
| `NotificationCard.tsx` | Add hitSlop for 44pt touch target |
| `PaymentMethodsScreen.tsx` | Increase back button to 48x48 |
| `LoadingState.tsx` | Add shimmer animation |
| Payment flows | Add accessibilityLabel |

#### Day 10: KYC Integration
- Choose provider: **Stripe Identity** (recommended - already using Stripe)
- Update `verify-kyc/index.ts` with real verification
- Test full KYC flow

---

## 🔵 PHASE 3: Code Quality
### Days 11-15 | ~20 hours

#### Days 11-12: Type Safety
- Fix 195 `any` usages (target: <50)
- Priority files:
  - `hooks/useMoments.ts`
  - `navigation/AppNavigator.tsx`
  - `services/deepLinkHandler.ts`
  - `supabase/functions/export-user-data/index.ts`

#### Days 13-14: Refactoring
```
services/
├── db/
│   ├── usersDbService.ts      (from supabaseDbService.ts)
│   ├── momentsDbService.ts
│   ├── requestsDbService.ts
│   └── reviewsDbService.ts
├── user/
│   ├── profileService.ts      (from userService.ts)
│   ├── preferencesService.ts
│   └── relationshipsService.ts
```

#### Day 15: Cleanup
- Remove 39 TODO comments
- Delete 30+ commented code blocks
- Remove 8 incomplete auth screens or implement them

---

## ⚫ PHASE 4: Launch
### Days 16-20 | ~20 hours

#### Days 16-17: Testing
- [ ] E2E test suite pass
- [ ] Payment flow (Stripe test mode)
- [ ] Multi-device testing
- [ ] Offline mode testing
- [ ] Load testing

#### Day 18: Production Build
```bash
# Set production environment
eas secret:push --scope project --env-file .env.production

# Build production
eas build --platform all --profile production

# Install and verify on devices
```

#### Days 19-20: Store Submission
```bash
# Submit to App Store
eas submit --platform ios --profile production

# Submit to Play Store
eas submit --platform android --profile production
```

---

## 📋 Quick Reference: Service Setup

### Cloudflare
1. https://dash.cloudflare.com → Create account
2. Overview → Copy **Account ID**
3. Images → Enable → Create API Token
4. Add to `.env`:
   ```
   CLOUDFLARE_ACCOUNT_ID=xxx
   CLOUDFLARE_IMAGES_TOKEN=xxx
   ```

### Mapbox
1. https://account.mapbox.com → Create account
2. Access Tokens → Create token (public)
3. Create secret token for builds
4. Add to `.env`:
   ```
   EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.xxx
   MAPBOX_SECRET_TOKEN=sk.xxx
   ```

### PostHog
1. https://eu.posthog.com → Create account (EU for GDPR)
2. Project Settings → Project API Key
3. Add to `.env`:
   ```
   EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxx
   EXPO_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
   ```

### Infisical (Optional)
**Decision:** Implement fully or remove from codebase
- If keeping: Create machine identity at app.infisical.com
- If removing: Delete `infisicalService.ts`

---

## ✅ Launch Day Checklist

```
PRE-LAUNCH (T-24h)
□ All environment variables set
□ Production builds completed
□ TestFlight/Internal Testing verified
□ Sentry monitoring active
□ PostHog tracking verified
□ On-call rotation scheduled

LAUNCH DAY
□ Submit to App Store
□ Submit to Play Store
□ Monitor Sentry for crashes
□ Monitor PostHog for user flow issues
□ Check Supabase dashboard for errors
□ Verify push notifications working

POST-LAUNCH (T+24h)
□ Review crash-free rate (target: >99.5%)
□ Review API error rates
□ First OTA update test
□ Gather initial user feedback
```

---

## 📞 Escalation Contacts

| Service | Issue Type | Contact |
|---------|------------|---------|
| Supabase | Database/Auth | support@supabase.io |
| Cloudflare | Images/CDN | Cloudflare Dashboard Support |
| Mapbox | Maps/Geocoding | support@mapbox.com |
| Expo | Build/OTA | Expo Discord / support |
| Stripe | Payments | Stripe Dashboard |
| PostHog | Analytics | PostHog Slack Community |

---

**Last Updated:** 2025-12-17
**Version:** 1.0
