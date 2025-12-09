# 📋 Remaining TODO Items - Action Plan

**Date:** 9 Aralık 2025  
**Status:** Database work complete, moving to feature implementation  
**Priority:** Categorized by business impact

---

## 🔴 **CRITICAL - User-Facing Features (High Priority)**

### 1. Authentication Screens (6 screens missing)
**Impact:** Users cannot complete auth flows  
**Effort:** Medium (2-3 days total)

**Missing Screens:**
- [ ] `PhoneAuthScreen.tsx` - Phone number authentication
- [ ] `EmailAuthScreen.tsx` - Email authentication  
- [ ] `ForgotPasswordScreen.tsx` - Password reset flow
- [ ] `SetPasswordScreen.tsx` - Password setup
- [ ] `ChangePasswordScreen.tsx` - Password change
- [ ] `VerifyCodeScreen.tsx` - OTP verification
- [ ] `TwoFactorSetupScreen.tsx` - 2FA setup
- [ ] `WaitingForCodeScreen.tsx` - Loading state

**Recommendation:** 
- Phase 1: Phone/Email auth (2 screens) - **CRITICAL**
- Phase 2: Password management (3 screens) - **HIGH**
- Phase 3: 2FA/OTP (3 screens) - **MEDIUM**

---

### 2. Payment Methods Implementation
**Impact:** Users cannot manage payment methods  
**Effort:** Small (1 day)

**Missing Features:**
- [ ] Apple Pay / PassKit integration (`usePaymentMethods.ts:33`)
- [ ] Google Pay availability check (`usePaymentMethods.ts:36`)
- [ ] Card edit modal (`PaymentMethodsScreen.tsx:208`)
- [ ] Wallet configuration modal (`PaymentMethodsScreen.tsx:224`)

**Files:**
```
apps/mobile/src/features/payments/
├── hooks/usePaymentMethods.ts
├── screens/PaymentMethodsScreen.tsx
└── screens/PaymentMethodsScreen.backup.tsx (can be deleted)
```

**Recommendation:** Implement after auth screens

---

## 🟡 **MEDIUM - Enhanced Features**

### 3. Location/Place Selection
**Impact:** Better UX for moment creation  
**Effort:** Medium (1-2 days)

**Missing:**
- [ ] Google Places integration (`CreateMomentScreen.tsx:158`)
- [ ] Autocomplete for location selection
- [ ] Map preview integration

**Alternative:** Can use simple text input for MVP

---

### 4. Escrow Reminder Logic
**Impact:** User notifications for pending escrow  
**Effort:** Small (2-4 hours)

**Missing:**
- [ ] Reminder scheduling (`EscrowStatusScreen.tsx:160`)
- [ ] Push notification integration
- [ ] Reminder preferences

**Recommendation:** Implement with notification system

---

## 📊 **Priority Matrix**

| Feature | Priority | Effort | Business Impact | Technical Complexity |
|---------|----------|--------|----------------|---------------------|
| Phone/Email Auth | 🔴 CRITICAL | 1 day | Very High | Low |
| Password Screens | 🔴 HIGH | 1 day | High | Low |
| Payment Methods | 🟡 MEDIUM | 1 day | Medium | Medium |
| 2FA/OTP Screens | 🟡 MEDIUM | 1 day | Medium | Medium |
| Google Places | 🟢 LOW | 2 days | Low | Medium |
| Escrow Reminders | 🟢 LOW | 4 hours | Low | Low |

---

## 🎯 **Recommended Implementation Order**

### **Phase 1: Authentication (Week 1)** - CRITICAL
**Goal:** Users can sign up and log in

1. **Day 1-2:** Phone Authentication
   - `PhoneAuthScreen.tsx` - Phone input UI
   - `VerifyCodeScreen.tsx` - OTP verification
   - Backend: Supabase phone auth integration

2. **Day 3:** Email Authentication  
   - `EmailAuthScreen.tsx` - Email/password UI
   - Link to existing auth service

3. **Day 4:** Password Management
   - `ForgotPasswordScreen.tsx` - Reset flow
   - `SetPasswordScreen.tsx` - Initial setup
   - `ChangePasswordScreen.tsx` - Update password

4. **Day 5:** Polish & Testing
   - `WaitingForCodeScreen.tsx` - Loading states
   - Error handling
   - E2E auth tests

---

### **Phase 2: Payments (Week 2)** - HIGH
**Goal:** Users can add payment methods

1. **Day 1:** Payment Method Detection
   - Apple Pay / PassKit check
   - Google Pay availability
   - Platform-specific logic

2. **Day 2:** Payment Modals
   - Card edit modal
   - Wallet configuration
   - Form validation

---

### **Phase 3: Enhancements (Week 3)** - MEDIUM
**Goal:** Improved UX

1. **2FA Setup**
   - `TwoFactorSetupScreen.tsx`
   - QR code generation
   - TOTP verification

2. **Location Picker**
   - Google Places autocomplete
   - Map integration
   - Location validation

3. **Reminders**
   - Escrow reminder logic
   - Push notification setup

---

## 🚀 **Quick Wins (Can Do Now)**

### 1. Delete Backup File
```bash
rm apps/mobile/src/features/payments/screens/PaymentMethodsScreen.backup.tsx
```
**Reason:** Unused backup file cluttering codebase

---

### 2. Stub Implementation (30 min)
Create basic UI for critical screens to unblock navigation:

```typescript
// PhoneAuthScreen.tsx - Minimal viable version
export const PhoneAuthScreen = () => {
  const [phone, setPhone] = useState('');
  
  return (
    <SafeAreaView>
      <Text>Enter Phone Number</Text>
      <TextInput 
        value={phone} 
        onChangeText={setPhone}
        placeholder="+1 (555) 000-0000"
      />
      <Button title="Send Code" onPress={handleSendCode} />
    </SafeAreaView>
  );
};
```

**Benefit:** Allows app navigation testing while building full implementation

---

## 📝 **Next Steps**

### Immediate (Today)
1. ✅ Review this action plan
2. ⏳ Decide on implementation priority
3. ⏳ Choose: Full implementation or MVP stubs first?

### This Week
1. ⏳ Implement Phase 1: Authentication screens
2. ⏳ Test auth flows end-to-end
3. ⏳ Deploy to staging

### Next Week  
1. ⏳ Implement Phase 2: Payment methods
2. ⏳ Implement Phase 3: Enhancements (optional)

---

## 🎯 **Success Criteria**

**MVP Ready (Minimum):**
- [x] Database optimized ✅
- [x] Type generation complete ✅
- [ ] Phone/Email auth working
- [ ] Basic payment method support
- [ ] Core user flows functional

**Production Ready (Full):**
- [ ] All auth screens implemented
- [ ] Payment methods fully functional
- [ ] 2FA available
- [ ] Location picker integrated
- [ ] Reminder system working

---

## 💡 **Recommendations**

### Option A: Quick Launch (MVP)
**Timeline:** 1 week  
**Scope:** Phone auth + email auth only  
**Trade-off:** Limited features, faster launch

### Option B: Complete Auth (Recommended)
**Timeline:** 2 weeks  
**Scope:** All auth + payment methods  
**Trade-off:** Better UX, slight delay

### Option C: Full Feature Set
**Timeline:** 3 weeks  
**Scope:** Everything including 2FA, places, reminders  
**Trade-off:** Complete product, longer timeline

---

**Your Decision:** Which approach do you prefer? 🚀

---

**Last Updated:** 9 Aralık 2025  
**Database Work:** ✅ Complete  
**Next Focus:** Authentication Implementation
