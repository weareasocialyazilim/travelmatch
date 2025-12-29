# TravelMatch - Store Submission Guide

## Pre-Submission Checklist

### App Store (iOS)

#### Required Assets
- [ ] App Icon: 1024x1024px PNG (no alpha, no rounded corners)
- [ ] Screenshots:
  - iPhone 6.7" (1290 x 2796px) - Required
  - iPhone 6.5" (1284 x 2778px) - Required
  - iPhone 5.5" (1242 x 2208px) - Required
  - iPad Pro 12.9" (2048 x 2732px) - If supports iPad
- [ ] App Preview Video (optional): 15-30 seconds

#### App Information
- **App Name**: TravelMatch
- **Subtitle**: Connect Through Travel Moments
- **Category**: Primary - Travel, Secondary - Social Networking
- **Age Rating**: 12+ (Infrequent/Mild User Generated Content)
- **Privacy Policy URL**: https://travelmatch.app/privacy
- **Support URL**: https://travelmatch.app/support
- **Marketing URL**: https://travelmatch.app

#### Description (4000 chars max)
```
TravelMatch connects travelers through unique experiences. Share your travel moments, discover local guides, and create unforgettable memories.

KEY FEATURES:

🌍 Discover Moments
Browse unique travel experiences shared by locals and travelers. From hidden cafes to secret viewpoints, find authentic moments you won't find in guidebooks.

💝 Gift Experiences
Send gifts to moment creators as a thank you. Our secure escrow system protects both parties for larger transactions.

💬 Real-time Chat
Connect with hosts through encrypted messaging. Share photos, voice messages, and plan your adventure together.

🔒 Trust & Safety
- KYC verification for hosts
- Secure payment processing
- 24/7 customer support
- User reviews and ratings

📍 Location-Based Discovery
Find moments near you or explore destinations worldwide. Filter by category, price, and ratings.

🎁 Wallet System
- Add funds easily
- Send and receive gifts
- Withdraw to your bank account
- Transaction history

WHY TRAVELMATCH?
We believe the best travel experiences come from real connections. Whether you're a local sharing your favorite spots or a traveler seeking authentic experiences, TravelMatch brings people together.

Download now and start your journey!
```

#### Keywords (100 chars max)
```
travel,experiences,local guide,tourism,gifts,moments,discover,adventure,trip,vacation,explore
```

#### What's New (Release Notes)
```
Version 1.0.0
- Initial release
- Discover and share travel moments
- Secure gift system with escrow protection
- Real-time encrypted messaging
- KYC verification for trusted hosts
- Apple Pay and card payments
```

---

### Google Play Store (Android)

#### Required Assets
- [ ] App Icon: 512x512px PNG (32-bit, no alpha)
- [ ] Feature Graphic: 1024x500px JPG/PNG
- [ ] Screenshots:
  - Phone: 2-8 screenshots (16:9 or 9:16 ratio)
  - 7" Tablet: (if applicable)
  - 10" Tablet: (if applicable)
- [ ] Video (optional): YouTube URL

#### Store Listing
- **App Name**: TravelMatch - Travel Moments
- **Short Description** (80 chars):
```
Connect with travelers. Share moments. Gift experiences. Travel differently.
```

- **Full Description** (4000 chars): Same as iOS description above

#### Categorization
- **Category**: Travel & Local
- **Tags**: Travel, Social, Experiences, Local Guide

---

## Data Safety (Play Store)

### Data Collected
| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Name | Yes | No | Account, Profile |
| Email | Yes | No | Account, Communication |
| Phone | Optional | No | Verification |
| Location | Yes | No | App Functionality |
| Photos | Yes | Yes* | User Content |
| Payment Info | Yes | With Stripe | Purchases |
| Messages | Yes | No | App Functionality |

*Photos shared only within the app with other users

### Security Practices
- [x] Data encrypted in transit (TLS 1.3)
- [x] Data encrypted at rest
- [x] Users can request data deletion
- [x] Independent security review

---

## App Privacy (App Store)

### Data Used to Track You
- None

### Data Linked to You
- Contact Info (Name, Email, Phone)
- Location (Precise Location)
- User Content (Photos, Messages)
- Identifiers (User ID)
- Financial Info (Payment Info)

### Data Not Linked to You
- Diagnostics (Crash Data, Performance Data)
- Usage Data (Product Interaction)

---

## Content Rating

### ESRB / PEGI Questionnaire Answers

| Question | Answer |
|----------|--------|
| Violence | None |
| Sexual Content | None |
| Profanity | None |
| Drugs/Alcohol | None |
| User Generated Content | Yes - Moderated |
| User Interaction | Yes - Chat |
| Shares Location | Yes - Optional |
| Digital Purchases | Yes - In-App |

**Recommended Rating**: 12+ (iOS) / Everyone 10+ (Android)

---

## Build Commands

### iOS Production Build
```bash
cd apps/mobile
eas build --platform ios --profile production
```

### Android Production Build
```bash
cd apps/mobile
eas build --platform android --profile production
```

### Submit to App Store
```bash
eas submit --platform ios --profile production
```

### Submit to Play Store
```bash
eas submit --platform android --profile production
```

---

## Pre-Launch Testing

### TestFlight (iOS)
1. Build uploaded via EAS
2. Internal testing: 25 testers
3. External testing: Up to 10,000 testers
4. Beta review required for external testing

### Internal Testing (Android)
1. Create internal testing track
2. Add testers via email
3. Share opt-in link

---

## Review Guidelines Compliance

### iOS App Store Review Guidelines
- [x] 1.1 App Completeness - App is complete and functional
- [x] 2.1 Performance - No crashes, smooth operation
- [x] 3.0 Business - Clear business model, transparent pricing
- [x] 4.0 Design - Follows HIG, native feel
- [x] 5.0 Legal - Privacy policy, terms of service
- [x] 5.1.1 Data Collection - Clear disclosure
- [x] 5.1.2 Data Use - Proper consent

### Google Play Policies
- [x] Restricted Content - No violations
- [x] Impersonation - Original content
- [x] Privacy - Data disclosure complete
- [x] Payments - Using Google-approved methods
- [x] Ads - No deceptive ads
- [x] Families - Not targeted at children

---

## Post-Launch

### Monitoring
- Sentry for crash reporting
- Analytics for user behavior
- Store reviews monitoring

### Update Strategy
- OTA updates for minor fixes (Expo Updates)
- Full builds for native changes
- Regular release cadence (bi-weekly)

---

## Contacts

- **Developer Account Owner**: kemalteksal@me.com
- **Apple Team ID**: ZWCGM5V955
- **App Store Connect App ID**: 6740496053
- **Support Email**: support@travelmatch.app
