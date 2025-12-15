# 📱 TravelMatch App Store Submission Guide

**Status:** 🟡 Assets Needed
**Priority:** HIGH
**Timeline:** 2-3 hours
**Blocking Submission:** YES

---

## 🎯 Current Status

### ✅ Already Have
- [x] Basic icon (apps/mobile/assets/icon.png - 22KB)
- [x] Adaptive icon (apps/mobile/assets/adaptive-icon.png - 18KB)
- [x] Splash screen (apps/mobile/assets/splash-icon.png - 18KB)
- [x] Favicon (apps/mobile/assets/favicon.png - 1.5KB)

### ❌ Missing (Required for Submission)
- [ ] **App Store Icon** (1024x1024 px)
- [ ] **Screenshots** (5+ per platform)
- [ ] **High-resolution icons** (various sizes)
- [ ] **Feature Graphic** (Android, 1024x500 px)
- [ ] **Promo Video** (Optional but recommended)

---

## 📐 Required Assets

### iOS App Store

#### 1. App Icon (CRITICAL)
```
Required: 1024x1024 px PNG (no alpha channel)
Location: apps/mobile/assets/icon-1024.png

Specs:
- Format: PNG (RGB, no transparency)
- Size: Exactly 1024x1024 pixels
- Color space: sRGB or P3
- No rounded corners (Apple adds them)
- File size: < 1MB recommended

Generation command:
```bash
# From existing icon
convert apps/mobile/assets/icon.png -resize 1024x1024 \
  -background white -alpha remove -alpha off \
  apps/mobile/assets/icon-1024.png
```

#### 2. Screenshots (6.7" iPhone 15 Pro Max)
```
Required: 1290x2796 px PNG (portrait)
Minimum: 3 screenshots
Recommended: 5-10 screenshots

Scenes to capture:
1. Login/Onboarding (first impression)
2. Discover Moments (main feature)
3. Create Moment (user action)
4. Chat/Messages (social proof)
5. Profile/Wallet (user dashboard)
6. Gift Flow (monetization)

Tips:
- Use actual app on simulator
- Clean, realistic data (no "Test User 1, 2, 3")
- Show value proposition in first 3 screens
- Add captions/text overlays for context
```

#### 3. Optional Assets
- **Promo Video:** 30 seconds max, 1920x1080 px (highly recommended for featuring)
- **Apple Watch Icon:** 1024x1024 px (if Watch app exists)

---

### Android (Google Play)

#### 1. High-Resolution Icon
```
Required: 512x512 px PNG (with transparency allowed)
Location: apps/mobile/assets/icon-512.png

Specs:
- Format: PNG-32
- Size: Exactly 512x512 pixels
- Transparency: Allowed
- File size: < 1MB
```

#### 2. Feature Graphic (CRITICAL)
```
Required: 1024x500 px PNG/JPG
Location: apps/mobile/assets/feature-graphic.png

Specs:
- Displays at top of Play Store listing
- Showcase brand + key features
- No text (Google may localize)
- High-quality, professional design

Example content:
- App logo/wordmark
- Key UI screenshots (2-3 merged)
- Tagline: "Match. Travel. Share."
```

#### 3. Screenshots (Phone)
```
Required: 1080x1920 px PNG/JPG (portrait) or 1920x1080 px (landscape)
Minimum: 2 screenshots
Recommended: 8 screenshots

Same scenes as iOS, optimized for Android:
1. Discover Screen
2. Moment Detail
3. Create Moment
4. Chat
5. Profile
6. Payments
7. Notifications
8. Settings
```

#### 4. Optional Assets
- **Promo Video:** YouTube URL, 30 seconds - 2 minutes
- **Tablet Screenshots:** 1536x2048 px (if tablet support)

---

## 🛠️ Asset Generation Workflow

### Option 1: Manual (Expo + Simulator)
```bash
# 1. Start Expo
cd apps/mobile
npx expo start

# 2. Open iOS Simulator
Press 'i' for iOS or 'a' for Android

# 3. Navigate to each screen
# 4. Take screenshots (Cmd+S on Mac)

# 5. Resize screenshots
for file in screenshot-*.png; do
  convert "$file" -resize 1290x2796 "store-$file"
done
```

### Option 2: Automated (Fastlane + Snapshot)
```ruby
# fastlane/Snapfile
devices([
  "iPhone 15 Pro Max",
  "iPhone 15",
  "iPad Pro (12.9-inch)"
])

languages([
  "en-US",
  "tr-TR"
])

scheme("TravelMatch")
```

```bash
# Install fastlane
gem install fastlane

# Generate screenshots
fastlane snapshot
```

### Option 3: Design Tool (Figma/Sketch)
```
1. Export app UI as images
2. Create frames in Figma
3. Place screenshots in device mockups
4. Add captions/text overlays
5. Export at required dimensions
```

---

## 📋 Pre-Submission Checklist

### Assets
- [ ] **Icon 1024x1024** (iOS) ✅ Generated
- [ ] **Icon 512x512** (Android) ✅ Generated
- [ ] **Feature Graphic 1024x500** (Android) ✅ Designed
- [ ] **Screenshots iPhone** (5+ screens) ✅ Captured
- [ ] **Screenshots Android** (8+ screens) ✅ Captured
- [ ] **Promo Video** (Optional) ⏳ In progress

### Metadata
- [ ] **App Name:** "TravelMatch" ✅
- [ ] **Subtitle:** "Match. Travel. Share." ✅
- [ ] **Description:** 4000 characters max ✅ Drafted
- [ ] **Keywords:** (iOS, 100 characters) ✅ Researched
- [ ] **Privacy Policy URL** ⚠️ Required
- [ ] **Support URL** ⚠️ Required
- [ ] **Marketing URL** ✅ Optional

### Legal
- [ ] **Age Rating:** 17+ (User-generated content) ✅
- [ ] **Content Rights:** Verified ✅
- [ ] **Export Compliance:** Encryption usage declared ⚠️ Required

---

## 🎨 Asset Templates

### App Store Description (Template)
```markdown
# TravelMatch - Share Your Travel Moments

Discover authentic travel experiences from locals around the world.
Create, share, and monetize your unique travel moments.

## ✨ Key Features

🌍 **Discover Local Gems**
Find hidden spots and authentic experiences shared by locals

📸 **Create Moments**
Share your travel stories with photos, videos, and detailed descriptions

💬 **Connect with Travelers**
Chat with locals and fellow travelers, build your trust network

💰 **Earn Rewards**
Get gifted for sharing your best moments and recommendations

🔒 **Secure Payments**
Built-in wallet with Stripe integration for safe transactions

🌟 **Trust & Verification**
KYC verification and community reviews ensure safety

## 🎯 Perfect For

- Travelers seeking authentic local experiences
- Locals wanting to share their city's hidden gems
- Digital nomads building connections worldwide
- Content creators monetizing travel knowledge

## 🛡️ Privacy & Security

Your data is protected with bank-level encryption. We never share
your personal information without consent.

## 📞 Support

Email: support@travelmatch.app
Website: https://travelmatch.app

---
Made with ❤️ for travelers, by travelers
```

### Keywords (iOS, 100 char limit)
```
travel,moments,local,guide,recommendations,trips,vacation,tourism,authentic,experiences
```

### Keywords (Android, unlimited)
```
travel moments, local guides, authentic travel, travel recommendations,
vacation planning, tourism, travel experiences, local experiences,
travel sharing, travel social, trip planning, destination guide,
travel tips, hidden gems, travel community, travel rewards
```

---

## 🚀 Submission Workflow

### iOS (App Store Connect)
```
1. Login to https://appstoreconnect.apple.com
2. Create new app
   - Bundle ID: com.travelmatch.app
   - SKU: travelmatch-ios-2025
   - Primary Language: English (U.S.)
3. Upload build via Xcode or EAS
4. Fill metadata
   - Upload 1024x1024 icon
   - Upload 5+ screenshots
   - Add description, keywords
   - Set pricing (Free with IAP)
5. Add privacy details
   - Data collection: Location, Email, Name
   - Usage: App functionality, Analytics
6. Submit for review
   - Review notes: Test account credentials
   - Expected review time: 1-2 days
```

### Android (Google Play Console)
```
1. Login to https://play.google.com/console
2. Create new app
   - App name: TravelMatch
   - Default language: English (United States)
   - Type: App or game
3. Upload AAB via EAS
4. Fill store listing
   - Upload 512x512 icon
   - Upload 1024x500 feature graphic
   - Upload 2+ screenshots
   - Add description
5. Content rating questionnaire
   - Social features: YES
   - User-generated content: YES
   - Location sharing: YES
6. Pricing & distribution
   - Free with in-app purchases
   - Available countries: Select all
7. Submit for review
   - Expected review time: 3-7 days
```

---

## 📊 Asset Quality Checklist

### Icon
- [ ] Clear at small sizes (64x64 preview)
- [ ] No text (unless it's logo wordmark)
- [ ] Distinctive color palette
- [ ] Recognizable shape/silhouette
- [ ] Matches brand identity

### Screenshots
- [ ] High resolution (no pixelation)
- [ ] Real app content (no mockups)
- [ ] Clean data (no "Test User")
- [ ] Consistent style across all screens
- [ ] Text readable on mobile
- [ ] Value proposition clear in first 3 screens

### Feature Graphic
- [ ] Professional design
- [ ] Brand colors consistent
- [ ] No text (or minimal, large font)
- [ ] Works at small size
- [ ] Eye-catching composition

---

## 🎯 Next Steps

1. **Generate 1024x1024 icon** (5 minutes)
   ```bash
   # Quick resize
   convert apps/mobile/assets/icon.png -resize 1024x1024! \
     -background white -alpha remove -alpha off \
     apps/mobile/assets/icon-1024.png
   ```

2. **Capture screenshots** (1 hour)
   - Start Expo dev server
   - Login with seed data user
   - Navigate through app
   - Take 8+ screenshots

3. **Design feature graphic** (1 hour)
   - Use Figma/Canva template
   - Combine logo + key screenshots
   - Export 1024x500 PNG

4. **Write metadata** (30 minutes)
   - App description
   - Keywords research
   - Privacy policy URL

5. **Submit for review** (30 minutes)
   - Upload all assets
   - Fill questionnaires
   - Submit

**Total Time:** ~3 hours
**Blocking:** YES (required for submission)
**Priority:** HIGH

---

## 📚 Resources

- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Material Design](https://material.io/design)
- [App Store Screenshots Best Practices](https://developer.apple.com/app-store/product-page/)
- [Google Play Store Listing Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Fastlane Screenshot Guide](https://docs.fastlane.tools/getting-started/ios/screenshots/)

---

**Status:** 🟡 Ready for Asset Generation
**Next Action:** Generate 1024x1024 icon → Capture screenshots → Submit
