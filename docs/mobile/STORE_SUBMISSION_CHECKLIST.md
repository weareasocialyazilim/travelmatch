# TravelMatch - App Store & Play Store Submission Checklist

## Version Information

- **App Version**: 1.0.0
- **iOS Build Number**: 24
- **Android Version Code**: 1

---

## 🍎 App Store (iOS) Requirements

### App Store Connect Setup

- [ ] Create app record in App Store Connect
- [ ] Set app name: **TravelMatch**
- [ ] Set bundle ID: `com.travelmatch.app`
- [ ] Set primary category: **Travel** (or Social Networking)
- [ ] Set secondary category: **Lifestyle**
- [ ] Set content rating: Complete the questionnaire
- [ ] Set age rating: 17+ (due to user-generated content)

### Required Metadata

- [ ] App Name (30 characters max): `TravelMatch`
- [ ] Subtitle (30 characters max): `Share Moments, Gift Experiences`
- [ ] Description (4000 characters max)
- [ ] Keywords (100 characters max): `travel, gift, moments, experiences, local, meet, share`
- [ ] Support URL: `https://travelmatch.app/support`
- [ ] Marketing URL: `https://travelmatch.app`
- [ ] Privacy Policy URL: `https://travelmatch.app/privacy`
- [ ] Terms of Service URL: `https://travelmatch.app/terms`

### Screenshots Required

- [ ] iPhone 6.9" (iPhone 16 Pro Max) - 1320 x 2868 or 2868 x 1320
- [ ] iPhone 6.5" (iPhone 15 Plus) - 1290 x 2796 or 2796 x 1290
- [ ] iPhone 5.5" (iPhone 8 Plus) - 1242 x 2208 or 2208 x 1242
- [ ] iPad Pro 12.9" (6th gen) - 2048 x 2732 or 2732 x 2048
- [ ] iPad Pro 12.9" (2nd gen) - 2048 x 2732 or 2732 x 2048

### App Icon Requirements

- [ ] 1024x1024 PNG (no alpha/transparency)
- [ ] No rounded corners (iOS adds them)
- [ ] No text unless part of logo

### App Review Information

- [ ] Demo account credentials (for reviewer)
- [ ] Notes for reviewer explaining app functionality
- [ ] Contact information for review team

### Compliance

- [x] ITSAppUsesNonExemptEncryption: false (configured)
- [x] Privacy permissions configured:
  - [x] NSLocationWhenInUseUsageDescription
  - [x] NSLocationAlwaysAndWhenInUseUsageDescription
  - [x] NSCameraUsageDescription
  - [x] NSPhotoLibraryUsageDescription
  - [x] NSPhotoLibraryAddUsageDescription
  - [x] NSFaceIDUsageDescription
  - [x] NSMicrophoneUsageDescription
  - [x] NSContactsUsageDescription
- [x] App Transport Security configured
- [x] Push notification entitlements

### Build & Submit

```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production
```

---

## 🤖 Play Store (Android) Requirements

### Google Play Console Setup

- [ ] Create app in Google Play Console
- [ ] Set app name: **TravelMatch**
- [ ] Set package name: `com.travelmatch.app`
- [ ] Set default language: English (US)
- [ ] Set app category: Travel & Local (or Social)
- [ ] Set content rating: Complete questionnaire
- [ ] Complete Data Safety form

### Required Metadata

- [ ] Short description (80 characters max)
- [ ] Full description (4000 characters max)
- [ ] App icon: 512x512 PNG
- [ ] Feature graphic: 1024x500 PNG
- [ ] Privacy Policy URL: `https://travelmatch.app/privacy`

### Screenshots Required

- [ ] Phone screenshots: Min 2, max 8 (16:9 aspect ratio recommended)
  - Minimum dimensions: 320px
  - Maximum dimensions: 3840px
- [ ] 7-inch tablet screenshots (optional but recommended)
- [ ] 10-inch tablet screenshots (optional but recommended)

### Compliance

- [x] Permissions declared in app.config.ts:
  - [x] ACCESS_COARSE_LOCATION
  - [x] ACCESS_FINE_LOCATION
  - [x] CAMERA
  - [x] RECORD_AUDIO
  - [x] USE_BIOMETRIC
  - [x] INTERNET
  - [x] ACCESS_NETWORK_STATE
- [x] Blocked sensitive permissions:
  - [x] READ_PHONE_STATE
  - [x] SYSTEM_ALERT_WINDOW

### Data Safety Declaration

Fill out the Data Safety form in Google Play Console:

- [x] Data collection: Yes
- [x] Data types collected:
  - Personal info (name, email)
  - Location (approximate and precise)
  - Photos/Videos
  - Financial info (payment methods)
- [x] Data is encrypted in transit: Yes
- [x] Users can request data deletion: Yes (GDPR compliant)

### iOS Privacy Nutrition Labels (App Store Connect)

Configure in App Store Connect > App Privacy:

- [x] **Contact Info** (Name, Email - Optional, linked to identity)
- [x] **Location** (Precise Location - Used for moments, linked to identity)
- [x] **User Content** (Photos, Videos - Linked to identity)
- [x] **Financial Info** (Payment Info - Linked to identity)
- [x] **Identifiers** (User ID, Device ID - Linked to identity)
- [x] **Usage Data** (Product Interaction - Linked to identity)
- [x] **Diagnostics** (Crash Data, Performance Data - Not linked)

### Build & Submit

```bash
# Build for Play Store (AAB format)
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --profile production
```

---

## 📋 Pre-Submission Checklist

### Code Quality

- [x] All lint errors fixed
- [x] No hardcoded API keys or secrets in code
- [x] Environment variables properly configured
- [x] Error boundaries implemented
- [x] Crash reporting (Sentry) configured

### Testing

- [ ] All unit tests passing
- [ ] E2E tests completed
- [ ] Manual testing on physical devices:
  - [ ] iPhone (various models)
  - [ ] Android phone (various manufacturers)
  - [ ] iPad
  - [ ] Android tablet

### Performance

- [ ] App size optimized (<100MB recommended)
- [ ] Images optimized
- [ ] No memory leaks
- [ ] Smooth animations (60fps)

### Security

- [x] Secure storage for sensitive data
- [x] HTTPS only connections
- [x] Input validation implemented
- [x] Authentication properly implemented
- [x] Biometric authentication available

### Legal

- [x] Privacy Policy published at https://travelmatch.app/privacy
- [x] Terms of Service published at https://travelmatch.app/terms
- [x] GDPR compliance (data export, deletion via DataPrivacyScreen)
- [x] KVKK compliance (Turkey - data breach notification in docs/LEGAL_PROCEDURES.md)
- [x] Age verification (17+ content rating configured)

---

## 🚀 Build Commands

### Development Build

```bash
eas build --platform all --profile development
```

### Preview Build (Internal Testing)

```bash
eas build --platform all --profile preview
```

### Production Build

```bash
eas build --platform all --profile production
```

### Submit to Stores

```bash
# iOS
eas submit --platform ios --profile production

# Android
eas submit --platform android --profile production
```

---

## 📱 Required Assets Checklist

### App Icons

- [x] `assets/icon.png` - 1024x1024 (App icon)
- [x] `assets/adaptive-icon.png` - Android adaptive icon foreground
- [x] `assets/splash-icon.png` - Splash screen icon
- [x] `assets/favicon.png` - Web favicon
- [ ] `assets/notification-icon.png` - Push notification icon (required)

### Store Assets (to be created)

Create folder: `apps/mobile/store-assets/`

#### iOS (App Store)

- [ ] `ios/screenshots/iphone-6.9/` - iPhone 16 Pro Max screenshots
- [ ] `ios/screenshots/iphone-6.5/` - iPhone 15 Plus screenshots
- [ ] `ios/screenshots/iphone-5.5/` - iPhone 8 Plus screenshots
- [ ] `ios/screenshots/ipad-12.9/` - iPad Pro screenshots
- [ ] `ios/app-preview/` - App preview videos (optional)

#### Android (Play Store)

- [ ] `android/feature-graphic.png` - 1024x500
- [ ] `android/screenshots/phone/` - Phone screenshots
- [ ] `android/screenshots/tablet-7/` - 7" tablet screenshots
- [ ] `android/screenshots/tablet-10/` - 10" tablet screenshots

---

## 📝 App Description Template

### Short Description (Play Store - 80 chars)

```
Share travel moments, gift experiences. Connect with travelers worldwide.
```

### Full Description

```
TravelMatch - Where Travel Moments Become Shared Experiences

🌍 DISCOVER AUTHENTIC MOMENTS
Browse unique experiences shared by travelers and locals worldwide. From hidden coffee shops to breathtaking viewpoints, find moments that matter.

🎁 GIFT EXPERIENCES
See a moment that would make someone's day? Gift it to them! Our secure escrow system ensures safe transactions for both givers and receivers.

📸 SHARE YOUR MOMENTS
Create and share your own travel moments. Whether it's a sunset view, a local delicacy, or a hidden gem - inspire others with your experiences.

🔒 TRUST & SAFETY
- Verified profiles with Trust Score system
- Secure payment processing with escrow protection
- GDPR-compliant data handling
- Face ID / Fingerprint authentication

✨ KEY FEATURES
• Create and share travel moments with photos
• Discover experiences near you
• Gift moments to friends and strangers
• Secure messaging with travelers
• Real-time notifications
• Offline support for saved content
• Dark mode support

Join TravelMatch today and transform the way you travel!
```

---

## ⚠️ Common Rejection Reasons to Avoid

### App Store

1. **Incomplete Information** - Ensure all metadata is filled
2. **Bugs or Crashes** - Test thoroughly before submission
3. **Placeholder Content** - Remove all TODO comments and placeholder images
4. **Privacy Issues** - Proper usage descriptions for all permissions
5. **Guideline 4.2** - App must have sufficient functionality

### Play Store

1. **Policy Violation** - Review all Google Play policies
2. **Metadata Issues** - Ensure descriptions match app functionality
3. **Permission Issues** - Only request necessary permissions
4. **Data Safety Issues** - Accurately complete Data Safety form
5. **Content Rating** - Properly rate content

---

## 📞 Support Information

- **Support Email**: support@travelmatch.app
- **Support URL**: https://travelmatch.app/support
- **Marketing URL**: https://travelmatch.app
- **Privacy Policy**: https://travelmatch.app/privacy
- **Terms of Service**: https://travelmatch.app/terms

---

**Last Updated**: December 2024 **Prepared For**: TravelMatch v1.0.0
