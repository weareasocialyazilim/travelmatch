# Google Services Configuration for Production

## 🚨 CRITICAL: Production Build Blocker

**Issue:** `google-services.json` is required for Android production builds but currently only `google-services-dev.json` exists.

**Impact:**
- Android builds will fail in production
- Firebase services (Analytics, Crashlytics, FCM) won't work properly
- App Store submission will be rejected

---

## ✅ Setup Instructions

### 1. Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **Lovendo Production**
3. Click the gear icon ⚙️ → **Project Settings**

### 2. Download Production Config

#### For Android (`google-services.json`)

1. In Project Settings, scroll to **Your apps**
2. Find your Android app or click **Add app** if it doesn't exist
3. **Package name:** `com.lovendo.app` (must match `app.config.ts`)
4. Click **Download google-services.json**
5. Save to: `apps/mobile/google-services.json`

#### For iOS (`GoogleService-Info.plist`)

1. In Project Settings, scroll to **Your apps**
2. Find your iOS app or click **Add app** if it doesn't exist
3. **Bundle ID:** `com.lovendo.app` (must match `app.config.ts`)
4. Click **Download GoogleService-Info.plist**
5. Save to: `apps/mobile/GoogleService-Info.plist`

### 3. Verify File Contents

#### `google-services.json` should contain:

```json
{
  "project_info": {
    "project_number": "YOUR_PROJECT_NUMBER",
    "project_id": "lovendo-production",
    "storage_bucket": "lovendo-production.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:YOUR_APP_ID:android:YOUR_ANDROID_ID",
        "android_client_info": {
          "package_name": "com.lovendo.app"
        }
      },
      "oauth_client": [...],
      "api_key": [
        {
          "current_key": "YOUR_ANDROID_API_KEY"
        }
      ],
      "services": {
        "appinvite_service": {...},
        "analytics_service": {...}
      }
    }
  ]
}
```

#### `GoogleService-Info.plist` should contain:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>API_KEY</key>
  <string>YOUR_IOS_API_KEY</string>
  <key>BUNDLE_ID</key>
  <string>com.lovendo.app</string>
  <key>CLIENT_ID</key>
  <string>YOUR_CLIENT_ID</string>
  <key>GCM_SENDER_ID</key>
  <string>YOUR_SENDER_ID</string>
  <key>GOOGLE_APP_ID</key>
  <string>1:YOUR_APP_ID:ios:YOUR_IOS_ID</string>
  <key>PROJECT_ID</key>
  <string>lovendo-production</string>
</dict>
</plist>
```

### 4. Update .gitignore

**SECURITY:** Production Firebase config files contain API keys and should NOT be committed to git.

Verify these lines exist in `.gitignore`:

```gitignore
# Firebase Config (Production)
apps/mobile/google-services.json
apps/mobile/GoogleService-Info.plist

# Keep dev configs (already in repo)
!apps/mobile/google-services-dev.json
!apps/mobile/GoogleService-Info-dev.plist
```

### 5. Configure EAS Build Secrets

For production builds, upload the config files to EAS secrets:

```bash
# Upload google-services.json
eas secret:create --scope project --name GOOGLE_SERVICES_JSON --value "$(cat apps/mobile/google-services.json)" --type file

# Upload GoogleService-Info.plist
eas secret:create --scope project --name GOOGLE_SERVICE_INFO_PLIST --value "$(cat apps/mobile/GoogleService-Info.plist)" --type file
```

Then update `eas.json`:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      },
      "ios": {
        "buildConfiguration": "Release"
      },
      "env": {
        "GOOGLE_SERVICES_JSON": "@eas-secret:GOOGLE_SERVICES_JSON",
        "GOOGLE_SERVICE_INFO_PLIST": "@eas-secret:GOOGLE_SERVICE_INFO_PLIST"
      }
    }
  }
}
```

---

## 🔍 Verification

### Test Android Build Locally

```bash
cd apps/mobile

# Ensure google-services.json exists
ls -la google-services.json

# Build Android app bundle
eas build --platform android --profile production --local
```

### Test iOS Build Locally

```bash
cd apps/mobile

# Ensure GoogleService-Info.plist exists
ls -la GoogleService-Info.plist

# Build iOS archive
eas build --platform ios --profile production --local
```

### Verify Firebase Connection

After installing the production build on a device:

1. Open Firebase Console → **Analytics**
2. Check **Events** tab → Should see `first_open` event within 24 hours
3. Check **Crashlytics** tab → Should see "No crashes reported" (not "SDK not initialized")

---

## 📋 Checklist

- [ ] Created Firebase project for production
- [ ] Added Android app with package name `com.lovendo.app`
- [ ] Added iOS app with bundle ID `com.lovendo.app`
- [ ] Downloaded `google-services.json`
- [ ] Downloaded `GoogleService-Info.plist`
- [ ] Verified file contents match package/bundle IDs
- [ ] Added files to `.gitignore`
- [ ] Uploaded secrets to EAS
- [ ] Updated `eas.json` to use secrets
- [ ] Test build succeeded for Android
- [ ] Test build succeeded for iOS
- [ ] Verified Firebase Analytics connection
- [ ] Verified Firebase Crashlytics initialization

---

## ⚠️ Security Notes

1. **Never commit** production Firebase config files to git
2. **Rotate API keys** if accidentally committed
3. **Restrict API keys** in Firebase Console:
   - Android API Key → Restrict to package name `com.lovendo.app`
   - iOS API Key → Restrict to bundle ID `com.lovendo.app`
4. **Monitor usage** in Firebase Console → Usage & billing

---

## 🆘 Troubleshooting

### Build fails with "google-services.json not found"

```bash
# Check file exists
ls -la apps/mobile/google-services.json

# Check file permissions
chmod 644 apps/mobile/google-services.json
```

### Firebase Analytics not working

1. Wait 24 hours for first data
2. Verify app is running in production mode (not debug)
3. Check package name/bundle ID matches exactly

### "Default Firebase app has not been configured"

1. Verify `google-services.json` / `GoogleService-Info.plist` is in app bundle
2. Clean build: `eas build --clear-cache`
3. Check Expo config includes Firebase plugin

---

## 📞 Support

For Firebase-related issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
