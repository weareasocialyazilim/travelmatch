# Lovendo - Master Test Checklist (Golden Path)

**Instruction**: Test each step manually. Mark ✅ if PASS, ❌ if FAIL. **Do NOT launch if any ❌
exists.**

---

## 🔐 Auth & Security

| #   | Test                 | Expected Result                          | Status |
| --- | -------------------- | ---------------------------------------- | ------ |
| 1   | Register with Phone  | Twilio SMS arrives within 10s            | [ ]    |
| 2   | OTP Verification     | Code validates, user logs in             | [ ]    |
| 3   | iDenfy (KYC)         | SDK opens, documents scan successfully   | [ ]    |
| 4   | Profile Verification | `is_verified=true` after iDenfy approval | [ ]    |

---

## 💎 Economy (LVND Coin)

| #   | Test                | Expected Result                    | Status |
| --- | ------------------- | ---------------------------------- | ------ |
| 5   | Open Coin Store     | IAP modal opens (Apple/Google)     | [ ]    |
| 6   | Purchase LVND       | Wallet balance updates instantly   | [ ]    |
| 7   | Transaction History | Purchase appears in wallet history | [ ]    |

---

## 📸 Social & Moments

| #   | Test          | Expected Result                                | Status |
| --- | ------------- | ---------------------------------------------- | ------ |
| 8   | Create Moment | Photo uploads, AWS Rekognition logs moderation | [ ]    |
| 9   | View on Map   | Moment appears on Discover map                 | [ ]    |
| 10  | Moment Detail | Can view moment, photos load correctly         | [ ]    |

---

## 🛡️ Titan Protocol (Escrow)

| #   | Test                   | Expected Result                                  | Status |
| --- | ---------------------- | ------------------------------------------------ | ------ |
| 11  | Send LVND (>100)       | Amount locked in escrow, NOT in recipient wallet | [ ]    |
| 12  | Escrow Dashboard       | Admin sees escrow in `/finance` widget           | [ ]    |
| 13  | Upload Gratitude Video | Video submitted for moderation                   | [ ]    |
| 14  | Video Approved         | LVND released to recipient wallet                | [ ]    |

---

## 💰 Financial (Withdrawal)

| #   | Test               | Expected Result                     | Status |
| --- | ------------------ | ----------------------------------- | ------ |
| 15  | Request Withdrawal | Withdraw button works               | [ ]    |
| 16  | Pending in Admin   | Request appears in Admin `/finance` | [ ]    |
| 17  | Video Debt Check   | User blocked if video not uploaded  | [ ]    |

---

## 🚀 Stability & Compliance

| #   | Test             | Expected Result                             | Status |
| --- | ---------------- | ------------------------------------------- | ------ |
| 18  | No "Coming Soon" | All buttons lead to functional screens      | [ ]    |
| 19  | Offline Mode     | App shows friendly error, no crash          | [ ]    |
| 20  | Error Boundary   | Force error → fallback UI shown             | [ ]    |
| 21  | Deep Link        | `lovendo://moment/123` opens correct screen | [ ]    |

---

## 📱 Platform-Specific

### iOS

| #   | Test        | Expected Result           | Status |
| --- | ----------- | ------------------------- | ------ |
| 22  | APNs Push   | Notification received     | [ ]    |
| 23  | IAP Sandbox | TestFlight purchase works | [ ]    |

### Android

| #   | Test           | Expected Result                        | Status |
| --- | -------------- | -------------------------------------- | ------ |
| 24  | FCM Push       | Notification received                  | [ ]    |
| 25  | License Tester | Play Console tester purchase works     | [ ]    |
| 26  | Back Button    | Double-tap exits, single-tap goes back | [ ]    |

---

## ✍️ Sign-Off

| Role      | Name | Date | Signature |
| --------- | ---- | ---- | --------- |
| Developer |      |      |           |
| QA        |      |      |           |
| Founder   |      |      |           |

---

**Launch Approval**: [ ] READY [ ] NOT READY
