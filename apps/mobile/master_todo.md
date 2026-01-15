# Lovendo Mobile App - Master TODO

## Comprehensive Audit Results (January 9, 2026)

**Last Updated:** January 9, 2026 - Phase 1-6 Implementation Complete

---

## Phase 1: Code Integrity & Clean Slate ✅ COMPLETED

### 1.1 Zombie Files Removed ✅

| File | Status | Action Taken |
|------|--------|--------------|
| `features/payments/screens/BulkThankYouScreen.tsx` | ✅ DELETED | Removed orphan file |
| `features/messages/screens/ChatDetailScreen.tsx` | ✅ DELETED | Duplicate of ChatScreen |
| `navigation/routeParams.ts` | ✅ FIXED | Removed BulkThankYou, ChatDetail routes |

### 1.2 Navigation Type Safety ✅

**File:** `navigation/routeParams.ts`
- [x] Removed orphan route types (BulkThankYou, ChatDetail)
- [x] Fixed MomentDetailScreen navigation to use Chat
- [x] Fixed SearchMapScreen SubscriberOfferModal params

### 1.3 Directory Structure Issues

- [ ] Move `features/inbox/InboxScreen.tsx` logic into `features/messages/` or consolidate
- [ ] Verify all feature folders follow consistent pattern

---

## Phase 2: Critical Feature Fixes

### 2.1 Chat Feature Consolidation

**Current State:** Two parallel implementations
- `ChatScreen.tsx` (221 lines) - Modern, FlashList, feature-complete
- `ChatDetailScreen.tsx` (891 lines) - Legacy, FlatList, incomplete TODOs

**Action Items:**
- [ ] Migrate MomentDetailScreen navigation from `ChatDetail` → `Chat`
- [ ] Remove ChatDetailScreen.tsx after migration
- [ ] Implement missing features in ChatScreen:
  - [ ] Location sharing
  - [ ] Image upload/send completion

**TODOs in ChatDetailScreen (to migrate):**
```
- TODO: Upload image and send as message (camera)
- TODO: Upload image and send as message (gallery)
- TODO: Implement location sharing
- TODO: Implement block user API call
- TODO: Implement report API call
```

### 2.2 Notifications Real-time ✅

**File:** `hooks/useNotifications.ts`
- [x] Enable Supabase Realtime subscription via RealtimeContext
- [ ] Implement NotificationDetailScreen.tsx (currently placeholder)

### 2.3 Moment Creation Flow

**File:** `features/moments/screens/CreateMomentScreen.tsx`

**Critical Issues:**
1. **Guest Blocking at Wrong Step** ✅ FIXED
   - Current: Guest blocked at Step 5 (review/publish)
   - Required: Block at Step 1 or component mount
   - [x] Move `isGuest` check to `useEffect` on mount

2. **Step Count Clarification**
   - Comment says 6 steps, code has 5
   - [ ] Clarify and update to 4 steps as per roadmap

3. **20+ Hardcoded Strings** (Turkish)
   ```
   Line 390: "Anını Görselleştir"
   Line 406: "Fotoğraf Ekle"
   Line 464: "SET THE VIBE" (English - inconsistent!)
   Line 530: "Sonraki: Konum Seç"
   Line 581: "Konum Seç"
   Line 876: "Yayınlanıyor..."
   Line 887: "Anını Yayınla"
   ... and more
   ```
   - [ ] Replace all with i18n keys

4. **Data Persistence on Guest Login**
   - [ ] Store form state before login redirect
   - [ ] Restore form state after successful login

### 2.4 Wallet Pending Balance

**File:** `features/wallet/screens/WalletScreen.tsx`
- [x] Real-time Supabase subscription working
- [x] Pending balance display working
- [ ] Integrate PendingTransactionsModal into flow
- [ ] Translate PendingTransactionsModal (currently English)

---

## Phase 3: Visual Polish & Awwwards UX

### 3.1 Android Neon Glow

**Files affected:**
- `components/ui/TMButton.tsx`
- `components/ui/TMCard.tsx`

- [x] Added colored glow backdrop for TMButton (Phase 1 commit)
- [ ] Verify on physical Android devices
- [ ] Add to TMCard if needed

### 3.2 Responsive Layouts

- [ ] Audit TMCard for tablet/large screen support
- [ ] Implement `useWindowDimensions` for responsive breakpoints

### 3.3 Localization - Hardcoded Strings

**Discover Feature:**
```
Line 562: "Bu civarda henüz an yok 🗺️"
Line 564: "Mesafe filtreni artırmayı dene..."
Line 577: "An Oluştur"
FilterModal.tsx: "Kimlerle Tanışmak İstiyorsun?", "Yaş Aralığı", etc.
```

**Wallet Feature:**
```
PendingTransactionsModal.tsx: "Incomplete Actions", "Resume", "Dismiss" (English!)
```

- [ ] Create/update translation files
- [ ] Replace all hardcoded strings with `t()` calls

### 3.4 Profile & KYC UI

- [ ] Audit ProfileScreen for UI issues
- [ ] Review KYC flow screens for text/layout problems

---

## Phase 4: Backend & Security

### 4.1 RLS Policies

- [ ] Audit new tables for RLS policies
- [ ] Verify `escrow_idempotency_keys` table has proper RLS

### 4.2 Security Headers ✅

- [x] Screenshot protection added to ChatDetailScreen (Phase 1)
- [x] PayTRWebViewScreen - already has useScreenSecurity() hook
- [x] WithdrawScreen - added useScreenSecurity() hook
- [x] AddCardScreen - added useScreenSecurity() hook

### 4.3 Performance

- [x] Reanimated 3 verified (existing)
- [ ] Audit for unnecessary re-renders
- [ ] Verify FlashList usage throughout app

---

## Phase 5: Final Verification

### 5.1 E2E Test Walkthrough

- [ ] Guest browsing flow
- [ ] Registration → Profile completion → Verification
- [ ] Moment creation flow
- [ ] Payment/Gift flow
- [ ] Chat functionality

### 5.2 Production Build

- [ ] Android release build
- [ ] iOS release build
- [ ] Verify no console warnings/errors

---

## Phase 6: User Feedback & Polish

### 6.1 Counter Offer Feature ✅

- [x] Audit existing implementation - SubscriberOfferModal.tsx reviewed
- [x] Implement restricted access logic - Added upgrade gate for free/basic users
- [x] Add i18n support - All strings now translated (tr/en)
- [x] Created moment_offers database table with RLS policies

### 6.2 Trust Garden ✅

- [x] Fix logic issues - Fixed response rate calculation overflow
- [x] Review gamification math - Scaled percentage to maxValue correctly
- [ ] Polish design

### 6.3 Archived Messages ✅

**File:** `features/messages/screens/ArchivedChatsScreen.tsx`
- [x] Added i18n support for all strings
- [ ] Connect to real data (verify backend integration)

### 6.4 Inbox UI ✅

**Files:** `features/inbox/InboxScreen.tsx`, `features/messages/MessagesScreen.tsx`
- [ ] Decide: Keep both or consolidate?
- [x] Added i18n support for all strings
- [ ] Fix layout problems

### 6.5 Settings UI ✅

- [x] Remove ambiguous search bar - Removed searchQuery state and filtering logic
- [x] Simplify UI structure - Shows all sections directly

---

## Orphan Components Summary

| Component | Location | Action |
|-----------|----------|--------|
| BulkThankYouScreen | payments/screens | DELETE |
| PhoneAuthScreen | auth/screens | DELETE (or deprecate) |
| EmailAuthScreen | auth/screens | DELETE (or deprecate) |
| ChatDetailScreen | messages/screens | MERGE into ChatScreen, DELETE |
| AwwwardsOnboardingScreen | auth/screens | KEEP (fix navigation inconsistency) |
| BiometricSetupScreen | auth/screens | INTEGRATE into auth flow |

---

## Duplicate/Redundant Screens

| Screen A | Screen B | Resolution |
|----------|----------|------------|
| ChatScreen | ChatDetailScreen | Keep ChatScreen, delete ChatDetailScreen |
| MessagesScreen | InboxScreen | Evaluate - InboxScreen has gift segment |

---

## Missing Feature Implementation

| Feature | Location | Status |
|---------|----------|--------|
| Share moment/story | DiscoverScreen.tsx | TODO - not implemented |
| Location sharing | ChatScreen | TODO - not implemented |
| Block/Report API | ChatDetailScreen | TODO - migrate to ChatScreen |
| Notification realtime | useNotifications.ts | Commented out |
| NotificationDetail view | NotificationDetailScreen | Placeholder only |

---

## Translation Keys Needed

Create i18n entries for all hardcoded strings in:
1. CreateMomentScreen.tsx (20+ strings)
2. FilterModal.tsx (15+ strings)
3. DiscoverScreen.tsx (5+ strings)
4. PendingTransactionsModal.tsx (20+ strings - currently English!)

---

**Last Updated:** January 9, 2026
**Audit Performed By:** Claude AI Assistant
