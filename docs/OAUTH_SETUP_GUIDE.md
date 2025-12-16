# OAuth Provider Configuration Guide

This guide walks you through setting up OAuth providers (Google, Apple, Facebook) for TravelMatch.

## Prerequisites

- Access to Supabase dashboard (https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv)
- Developer accounts for each provider:
  - Google Cloud Console (https://console.cloud.google.com)
  - Apple Developer Account (https://developer.apple.com)
  - Meta for Developers (https://developers.facebook.com)

## Setup Steps

### 1. Google OAuth Setup

#### Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing "TravelMatch"
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth Client ID**

#### Web Application

- **Application type**: Web application
- **Name**: TravelMatch Web
- **Authorized redirect URIs**:
  ```
  https://bjikxgtbptrvawkguypv.supabase.co/auth/v1/callback
  ```
- Copy the **Client ID** and **Client Secret**

#### Android Application

- **Application type**: Android
- **Name**: TravelMatch Android
- **Package name**: `com.travelmatch.app` (from `android/app/build.gradle`)
- **SHA-1 certificate fingerprint**:
  ```bash
  # Debug keystore
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  
  # Production keystore (from your signing config)
  keytool -list -v -keystore android/app/travelmatch-release.keystore -alias travelmatch
  ```
- Copy the **Client ID**

#### iOS Application

- **Application type**: iOS
- **Name**: TravelMatch iOS
- **Bundle ID**: `com.travelmatch.app` (from `ios/TravelMatch.xcodeproj`)
- Copy the **Client ID**

### 2. Apple Sign In Setup

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers)
2. Navigate to **Certificates, Identifiers & Profiles** → **Identifiers**
3. Create a new **App ID** if not exists:
   - **Bundle ID**: `com.travelmatch.app`
   - Enable **Sign in with Apple** capability

4. Create **Services ID** for web:
   - **Identifier**: `com.travelmatch.service`
   - **Description**: TravelMatch Web Sign In
   - Enable **Sign in with Apple**
   - Configure:
     - **Primary App ID**: `com.travelmatch.app`
     - **Return URLs**:
       ```
       https://bjikxgtbptrvawkguypv.supabase.co/auth/v1/callback
       ```

5. Create **Key** for Server-to-Server Authentication:
   - Navigate to **Keys** → **Create a new key**
   - **Key Name**: TravelMatch Apple Sign In Key
   - Enable **Sign in with Apple**
   - Download the `.p8` file (save securely, cannot re-download)
   - Note the **Key ID** and **Team ID**

### 3. Facebook Login Setup

1. Go to [Meta for Developers](https://developers.facebook.com/apps)
2. Create a new app or select existing
3. Add **Facebook Login** product
4. Configure OAuth redirect URIs:
   - **Valid OAuth Redirect URIs**:
     ```
     https://bjikxgtbptrvawkguypv.supabase.co/auth/v1/callback
     ```
5. Navigate to **Settings** → **Basic**
6. Copy **App ID** and **App Secret**
7. Add platform configurations:
   - **iOS**:
     - Bundle ID: `com.travelmatch.app`
     - Enable Single Sign On
   - **Android**:
     - Package Name: `com.travelmatch.app`
     - Class Name: `com.travelmatch.MainActivity`
     - Key Hashes:
       ```bash
       # Debug keystore
       keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
       
       # Production keystore
       keytool -exportcert -alias travelmatch -keystore android/app/travelmatch-release.keystore | openssl sha1 -binary | openssl base64
       ```

### 4. Configure Supabase Dashboard

1. Go to [Supabase Authentication Settings](https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/auth/providers)

#### Enable Google Provider

- Navigate to **Auth** → **Providers** → **Google**
- Enable **Google provider**
- Add credentials:
  - **Google Client ID (Web)**: `<from Google Cloud Console>`
  - **Google Client Secret**: `<from Google Cloud Console>`
- **Additional settings**:
  - Enable **Skip nonce check** (for mobile)
  - Add iOS and Android client IDs to **Authorized Client IDs**:
    ```
    <iOS Client ID>
    <Android Client ID>
    ```

#### Enable Apple Provider

- Navigate to **Auth** → **Providers** → **Apple**
- Enable **Apple provider**
- Add credentials:
  - **Services ID**: `com.travelmatch.service`
  - **Team ID**: `<from Apple Developer>`
  - **Key ID**: `<from Apple Key creation>`
  - **Secret Key**: `<contents of .p8 file>`

#### Enable Facebook Provider

- Navigate to **Auth** → **Providers** → **Facebook**
- Enable **Facebook provider**
- Add credentials:
  - **Facebook App ID**: `<from Meta for Developers>`
  - **Facebook App Secret**: `<from Meta for Developers>`

### 5. Update Mobile App Configuration

#### iOS Configuration (ios/TravelMatch/Info.plist)

```xml
<!-- Google Sign In -->
<key>GIDClientID</key>
<string>YOUR_IOS_CLIENT_ID</string>

<!-- URL Schemes -->
<key>CFBundleURLTypes</key>
<array>
  <!-- Google -->
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID</string>
    </array>
  </dict>
  
  <!-- Facebook -->
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>fb YOUR_FACEBOOK_APP_ID</string>
    </array>
  </dict>
  
  <!-- Deep linking -->
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>travelmatch</string>
    </array>
  </dict>
</array>

<!-- Facebook App ID -->
<key>FacebookAppID</key>
<string>YOUR_FACEBOOK_APP_ID</string>
<key>FacebookDisplayName</key>
<string>TravelMatch</string>

<!-- Queries Schemes -->
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>fbapi</string>
  <string>fb-messenger-share-api</string>
  <string>fbauth2</string>
  <string>fbshareextension</string>
</array>
```

#### Android Configuration (android/app/src/main/AndroidManifest.xml)

```xml
<!-- Deep linking -->
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="travelmatch" android:host="auth" />
</intent-filter>

<!-- Facebook -->
<meta-data
  android:name="com.facebook.sdk.ApplicationId"
  android:value="@string/facebook_app_id"/>
```

Add to `android/app/src/main/res/values/strings.xml`:
```xml
<string name="facebook_app_id">YOUR_FACEBOOK_APP_ID</string>
```

### 6. Test OAuth Flow

#### Manual Testing

1. **Google Sign In**:
   ```bash
   # iOS Simulator
   pnpm ios
   
   # Android Emulator
   pnpm android
   ```
   - Tap "Sign in with Google"
   - Select Google account
   - Verify successful authentication

2. **Apple Sign In**:
   - Only works on physical devices or Xcode simulator with signed-in Apple ID
   - Tap "Sign in with Apple"
   - Use Face ID / Touch ID
   - Verify successful authentication

3. **Facebook Login**:
   - Tap "Sign in with Facebook"
   - Enter Facebook credentials
   - Approve permissions
   - Verify successful authentication

#### Automated Testing

Run E2E tests to verify OAuth flows:
```bash
pnpm test:e2e
```

### 7. Production Checklist

- [ ] All OAuth credentials created for production environments
- [ ] Callback URLs configured correctly in all providers
- [ ] Supabase providers enabled and configured
- [ ] iOS Info.plist updated with correct values
- [ ] Android AndroidManifest.xml updated with correct values
- [ ] SHA-1/SHA-256 fingerprints added for production keystores
- [ ] Facebook app reviewed and published (if required)
- [ ] Apple Services ID verified and active
- [ ] Tested OAuth flow on:
  - [ ] iOS Simulator
  - [ ] iOS Physical Device
  - [ ] Android Emulator
  - [ ] Android Physical Device
  - [ ] Web (if applicable)

## Troubleshooting

### Google Sign In Issues

**Error: `DEVELOPER_ERROR`**
- Verify SHA-1 fingerprint matches your keystore
- Check package name matches `android/app/build.gradle`
- Ensure Android OAuth client created in Google Console

**Error: `idpiframe_initialization_failed`**
- Clear browser cache and cookies
- Check redirect URI in Google Console
- Verify client ID in Supabase dashboard

### Apple Sign In Issues

**Error: Invalid client**
- Verify Services ID matches Supabase configuration
- Check Bundle ID matches iOS app
- Ensure Return URLs configured correctly

**Error: Invalid_grant**
- Regenerate Apple Key (.p8 file)
- Verify Key ID and Team ID are correct
- Check Secret Key in Supabase has no extra whitespace

### Facebook Login Issues

**Error: Invalid redirect_uri**
- Verify OAuth redirect URI in Facebook app settings
- Check URL scheme in iOS Info.plist
- Ensure package name matches Android app

**Error: App Not Setup**
- Add iOS/Android platform in Facebook app settings
- Configure key hashes for Android
- Enable Single Sign On for iOS

## Security Considerations

1. **Never commit secrets to Git**:
   - Add `.env.oauth.example` but not `.env`
   - Use GitHub Secrets for CI/CD
   - Rotate keys regularly

2. **Use different credentials for staging/production**:
   - Create separate OAuth apps for each environment
   - Use environment variables to switch between them

3. **Enable additional security**:
   - Restrict OAuth client IDs to specific domains
   - Enable App Verification for Facebook
   - Use PKCE flow for enhanced security

4. **Monitor OAuth usage**:
   - Check Google Cloud Console quotas
   - Review Apple Services ID analytics
   - Monitor Facebook app dashboard for abuse

## References

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
