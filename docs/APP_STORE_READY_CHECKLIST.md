# App Store Readiness Checklist

Ensuring Lovendo passes Apple/Google review on the first try.

## 1. User Generated Content (UGC) Policy

Must be accepted by the user during signup (Terms of Service).

- [x] **Filtering:** Objectionable content is filtered via AWS Rekognition / Edge Functions.
- [x] **Reporting:** Users can report profiles/content (`reports` table created).
- [x] **Blocking:** Users can block abusive users.
- [x] **Action:** We take action on reports within 24 hours.
- [x] **Contact:** Contact info provided in the App Store description.

## 2. Privacy & Data

- [x] **Data Collection:** "App Privacy" section in App Store Connect must match
      `LEGAL_PRIVACY_POLICY.md`.
- [x] **Data Deletion:** Account deletion feature is fully functional and easy to find.
- [x] **Permissions:** Camera/Location/Photo Library usage strings in `Info.plist` explain _why_ we
      need access.

## 3. In-App Purchases (IAP)

If selling Premium/Boost features:

- [ ] **Restore Purchases:** Button exists on the paywall.
- [ ] **Terms:** EULA link visible on the paywall.
- [ ] **Physical Goods:** Trips/Gifts handled via PayTR must comply with "Physical vs Digital"
      rules. (Dating premium features MUST be IAP).

## 4. Metadata

- [ ] **Screenshots:** No dummy data, no nudity/violence.
- [ ] **Description:** Mention "Travel Dating" clearly.
- [ ] **Keywords:** Travel, Dating, Match, Trip, Companion.
- [ ] **Demo Account:** Provide a test user (email/pass) in "App Review Information" section. **Do
      not use 2FA for this user.**

## 5. Technical

- [x] **IPv6:** Network requests support IPv6 (Supabase/Rest works fine).
- [x] **Login:** Social login (Apple Sign-in is **MANDATORY** if you use Google/Facebook).
- [ ] **Performance:** App doesn't crash on launch (Verified with Maestro smoke tests).

## 6. Age Rating

- **Rating:** 17+ (Mature themes, dating).
- **Unrestricted Web Access:** No (unless you have an in-app browser).

---

**Status:** READY for submission after checking IAP and Demo Account items.
