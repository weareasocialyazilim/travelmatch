# Lovendo - App Store Review Notes (2026)

## Test Account

- **Email**: demo@lovendo.app
- **Password**: LovD3mo2026!

## Virtual Economy (LVND Coin) - Guideline 3.1.1 Compliance

Lovendo implements a **fully compliant In-App Purchase system**:

1. **Purchasing LVND**: Users buy LVND Coins exclusively through Apple IAP (no external payment
   links)
2. **Gifting**: LVND Coins are sent as virtual gestures to other users
3. **Content Unlock**: The recipient uploads a "Gratitude Video" to unlock received LVND
4. **Withdrawal**: Users can withdraw earned LVND as real money (subject to KYC)

## Titan Protocol (Escrow Protection)

- Transactions **over 100 LVND** are held in escrow until proof-of-experience is verified
- This protects users from non-delivered experiences
- Users can dispute within 14 days for a full refund

## Identity Verification (iDenfy SDK - idenfy.com)

- Users complete KYC via iDenfy service before withdrawing funds
- HMAC-SHA256 webhook security prevents spoofing
- Biometric data is NOT stored by Lovendo — handled entirely by iDenfy
- Declared in `PrivacyInfo.xcprivacy` under Financial Information

## Content Moderation

- All user-uploaded photos/videos are scanned via AWS Rekognition
- Explicit, violent, or policy-violating content is auto-blocked before publication

## Key Features to Test

1. Create a Moment (experience listing)
2. Send LVND Coins to a Moment
3. Receive LVND and upload a Gratitude Video
4. View wallet balance updates in real-time
5. Request a withdrawal (requires KYC)

## Privacy Compliance

- GDPR: Full account deletion cascade (`DELETE /users/:id`)
- Xcode 26 Privacy Manifest: All required APIs declared with reasons

## Support

For any questions during review: support@lovendo.app
