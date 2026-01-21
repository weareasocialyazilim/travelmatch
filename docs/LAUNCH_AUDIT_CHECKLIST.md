# Lovendo - Pre-Launch Technical Audit Checklist

## ✅ Bundle ID & Package

- [x] iOS Bundle ID: `com.lovendo.app`
- [x] Android Package: `com.lovendo.app`
- [x] `project.pbxproj`: Updated
- [x] `build.gradle`: Updated

## ✅ Identity & KYC

- [x] Identify SDK integration
- [x] Webhook endpoint for verification results
- [ ] **ACTION**: Verify live Identify webhook URL is configured

## ✅ AWS Secrets (Supabase Edge Functions)

- [ ] `AWS_ACCESS_KEY_ID`: Set in Supabase Secrets
- [ ] `AWS_SECRET_ACCESS_KEY`: Set in Supabase Secrets
- [ ] `AWS_REGION`: Set (us-east-1)

## ✅ IAP Sync (In-App Purchases)

| Product ID  | VALUES.ts | App Store Connect | Google Play Console |
| ----------- | --------- | ----------------- | ------------------- |
| `lvnd_50`   | ✅        | ⏳                | ⏳                  |
| `lvnd_100`  | ✅        | ⏳                | ⏳                  |
| `lvnd_250`  | ✅        | ⏳                | ⏳                  |
| `lvnd_500`  | ✅        | ⏳                | ⏳                  |
| `lvnd_1000` | ✅        | ⏳                | ⏳                  |

## ✅ Privacy & Legal

- [x] `PrivacyInfo.xcprivacy`: Complete
- [x] GDPR deletion trigger: `handle_full_user_deletion`
- [ ] **ACTION**: Publish Privacy Policy to `lovendo.app/privacy`
- [ ] **ACTION**: Publish Terms of Service to `lovendo.app/terms`
- [ ] **ACTION**: Publish EULA to `lovendo.app/eula`

## ✅ Firebase & Notifications

- [x] iOS: APNs configured in `app.config.ts`
- [ ] Android: Replace `google-services.json` with Firebase project config

## ✅ Signing & Build

### iOS

- [x] Bundle ID in Xcode
- [ ] **ACTION**: Archive in Xcode
- [ ] **ACTION**: Upload to App Store Connect

### Android

- [x] `signingConfigs.release` in `build.gradle`
- [ ] **ACTION**: Generate keystore
- [ ] **ACTION**: Fill `gradle.properties` signing values
- [ ] **ACTION**: Run `./gradlew bundleRelease`
- [ ] **ACTION**: Upload `.aab` to Google Play Console

## ✅ Final Tests

- [ ] IAP Sandbox test (iOS)
- [ ] License Tester test (Android)
- [ ] Push notification test (both platforms)
- [ ] Deep link test (`lovendo://moment/123`)
- [ ] Wallet Realtime update test

## 🚀 Launch Commands

```bash
# iOS
cd apps/mobile && npx expo prebuild --clean
# Then: Open Xcode → Product → Archive

# Android
cd apps/mobile && npx expo prebuild --clean
cd android && ./gradlew bundleRelease
```
