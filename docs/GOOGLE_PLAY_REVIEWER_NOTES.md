# Lovendo - Google Play Store Review Notes (2026)

## Test Account

- **Email**: demo@lovendo.app
- **Password**: LovD3mo2026!

## App Category

- **Primary**: Social
- **Secondary**: Lifestyle

## Virtual Economy (LVND Coin) - Google Play Billing Compliance

Lovendo implements a **fully compliant Google Play Billing system**:

1. **Purchasing LVND**: Users buy LVND Coins exclusively through Google Play Billing (no external
   payment links)
2. **Gifting**: LVND Coins are sent as virtual gestures to content creators
3. **Content Unlock**: The recipient uploads a "Gratitude Video" to unlock received LVND
4. **Withdrawal**: Users can withdraw earned LVND as real money (subject to identity verification)

## Managed Products (IAP)

| Product ID  | LVND Amount | Price (USD) |
| ----------- | ----------- | ----------- |
| `lvnd_50`   | 50 LVND     | $4.99       |
| `lvnd_100`  | 100 LVND    | $9.99       |
| `lvnd_250`  | 250 LVND    | $24.99      |
| `lvnd_500`  | 500 LVND    | $49.99      |
| `lvnd_1000` | 1000 LVND   | $99.99      |

## Titan Protocol (User Protection)

- Transactions **over 100 LVND** are held in escrow until proof-of-experience is verified
- This protects users from non-delivered experiences
- Users can dispute within 14 days for a full LVND refund

## Identity Verification

- Users complete identity verification via the Identify service before withdrawing funds
- Biometric data is NOT stored by Lovendo — handled entirely by Identify
- Required for anti-money-laundering (AML) compliance

## Content Moderation

- All user-uploaded photos/videos are scanned via AWS Rekognition
- Explicit, violent, or policy-violating content is auto-blocked before publication

## User Safety Disclosures

The app includes prominent safety disclosures:

- Never send LVND to strangers without verifying their identity
- All transactions are subject to Titan Protocol protection
- Report suspicious activity via in-app support

## Key Features to Test

1. Create a Moment (experience listing)
2. Send LVND Coins to a Moment
3. Receive LVND and upload a Gratitude Video
4. View wallet balance updates in real-time
5. Request a withdrawal (requires identity verification)

## Permissions Used

| Permission    | Purpose                           | User Benefit      |
| ------------- | --------------------------------- | ----------------- |
| Camera        | Capture photos/videos for Moments | Create content    |
| Microphone    | Record audio for Gratitude Videos | Reply to donors   |
| Location      | Verify experience location        | Trust & safety    |
| Notifications | Gift/message alerts               | Real-time updates |
| Photos/Videos | Upload from gallery               | Content sharing   |

## Privacy Compliance

- GDPR: Full account deletion cascade
- Data Safety Section: Submitted with accurate declarations

## Support

For any questions during review: support@lovendo.app
