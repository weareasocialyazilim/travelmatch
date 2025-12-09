# 🔐 Authentication Implementation Guide

**Sprint 1 (Week 1-2): Authentication Flows**  
**Status:** 🔴 BLOCKER - Production launch dependency  
**Priority:** CRITICAL

---

## 📋 OVERVIEW

### Current Status

```
UI Screens:      ✅ All created (8 screens)
Styling:         ✅ Complete
Form Validation: ✅ Complete (Zod schemas)
Navigation:      ✅ Wired up
Backend:         🔴 MISSING (Supabase integration)
Testing:         ⏳ Pending backend implementation
```

### Implementation Gap

All authentication screens exist but use **stub implementations** (setTimeout with mock data). Real
Supabase auth integration is needed.

---

## 🎯 IMPLEMENTATION PLAN

### Week 1: Core Auth Flows

#### Day 1-2: Phone Authentication

**Files:**

- `apps/mobile/src/features/auth/PhoneAuthScreen.tsx`
- `apps/mobile/src/features/auth/VerifyCodeScreen.tsx`

**Current Implementation:**

```typescript
// ❌ STUB (Line 50-60 in PhoneAuthScreen.tsx)
const onSendOTP = (data: PhoneAuthInput) => {
  setLoading(true);
  setTimeout(() => {
    setStep('otp');
    setLoading(false);
  }, 1000);
};
```

**Required Changes:**

```typescript
// ✅ REAL IMPLEMENTATION
import { supabase } from '@/config/supabase';

const onSendOTP = async (data: PhoneAuthInput) => {
  setLoading(true);
  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone: data.phone,
      options: {
        channel: 'sms', // or 'whatsapp'
      },
    });

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setStep('otp');
  } catch (err) {
    Alert.alert('Error', 'Failed to send verification code');
    logger.error('Phone auth error:', err);
  } finally {
    setLoading(false);
  }
};

const onVerifyOTP = async (data: PhoneAuthInput) => {
  setLoading(true);
  try {
    const { data: authData, error } = await supabase.auth.verifyOtp({
      phone: data.phone,
      token: data.otp,
      type: 'sms',
    });

    if (error) {
      Alert.alert('Error', 'Invalid verification code');
      return;
    }

    if (authData.user) {
      // Store session
      await SecureStore.setItemAsync('session', JSON.stringify(authData.session));

      // Navigate to main app or profile completion
      const hasProfile = await checkUserProfile(authData.user.id);
      if (hasProfile) {
        navigation.reset({ index: 0, routes: [{ name: 'Discover' }] });
      } else {
        navigation.navigate('CompleteProfile');
      }
    }
  } catch (err) {
    Alert.alert('Error', 'Verification failed');
    logger.error('OTP verification error:', err);
  } finally {
    setLoading(false);
  }
};
```

**Supabase Dashboard Setup:**

1. Enable Phone Auth: Dashboard → Authentication → Providers → Phone
2. Configure SMS Provider (Twilio recommended):
   ```
   Settings → Auth → Phone Auth:
   - Provider: Twilio
   - Account SID: [Your Twilio SID]
   - Auth Token: [Your Twilio Token]
   - Phone Number: [Your Twilio Number]
   ```
3. Rate Limiting:
   ```
   Settings → Auth → Rate Limits:
   - OTP requests: 10 per hour per phone
   - Verification attempts: 5 per OTP
   ```

**Testing Checklist:**

- [ ] Valid phone number → SMS sent
- [ ] Invalid format → Error shown
- [ ] Correct OTP → User logged in
- [ ] Incorrect OTP → Error shown
- [ ] Rate limiting works
- [ ] Resend code works

---

#### Day 3: Email Authentication

**File:** `apps/mobile/src/features/auth/EmailAuthScreen.tsx`

**Current Implementation:**

```typescript
// ❌ STUB (Line 45 in EmailAuthScreen.tsx)
const handleContinue = async (data: EmailAuthInput) => {
  setLoading(true);
  setTimeout(() => {
    setLoading(false);
    navigation.navigate('CompleteProfile');
  }, 1500);
};
```

**Required Changes:**

```typescript
// ✅ REAL IMPLEMENTATION

// Option 1: Magic Link (Passwordless)
const handleMagicLink = async (data: EmailAuthInput) => {
  setLoading(true);
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: 'travelmatch://auth/callback',
      },
    });

    if (error) throw error;

    Alert.alert('Check Your Email', 'We sent you a magic link. Click it to sign in.', [
      { text: 'OK' },
    ]);
  } catch (err) {
    Alert.alert('Error', 'Failed to send magic link');
  } finally {
    setLoading(false);
  }
};

// Option 2: Email + Password
const handleEmailPassword = async (data: { email: string; password: string }) => {
  setLoading(true);
  try {
    // Sign up
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: 'travelmatch://auth/callback',
      },
    });

    if (error) throw error;

    if (authData.user?.identities?.length === 0) {
      // User already exists
      Alert.alert('Account Exists', 'Please sign in instead.');
      return;
    }

    Alert.alert('Verify Email', 'We sent a verification link to your email.', [{ text: 'OK' }]);
  } catch (err) {
    Alert.alert('Error', 'Sign up failed');
  } finally {
    setLoading(false);
  }
};

// Option 3: Social OAuth (Apple, Google)
const handleSocialLogin = async (provider: 'apple' | 'google') => {
  setLoading(true);
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'travelmatch://auth/callback',
        skipBrowserRedirect: true, // For React Native
      },
    });

    if (error) throw error;

    // Open OAuth URL in browser
    const { url } = data;
    await WebBrowser.openAuthSessionAsync(url, 'travelmatch://auth/callback');
  } catch (err) {
    Alert.alert('Error', `${provider} sign in failed`);
  } finally {
    setLoading(false);
  }
};
```

**Deep Link Handler (for callbacks):**

```typescript
// apps/mobile/src/utils/deepLinkHandler.ts

export const handleAuthCallback = async (url: string) => {
  const { data, error } = await supabase.auth.getSessionFromUrl({ url });

  if (error) {
    Alert.alert('Error', 'Authentication failed');
    return;
  }

  if (data.session) {
    await SecureStore.setItemAsync('session', JSON.stringify(data.session));

    // Navigate to app
    navigation.reset({ index: 0, routes: [{ name: 'Discover' }] });
  }
};
```

**Supabase Dashboard Setup:**

1. Enable Email Auth: Dashboard → Authentication → Providers → Email
2. Email Templates: Settings → Auth → Email Templates
   - Confirmation: Customize welcome email
   - Magic Link: Customize login email
   - Recovery: Customize password reset
3. OAuth Providers:
   - Apple: Add Client ID, Team ID, Key ID
   - Google: Add Client ID, Client Secret

**Testing Checklist:**

- [ ] Magic link sent and works
- [ ] Email verification sent
- [ ] Duplicate email handled
- [ ] Apple Sign In works
- [ ] Google Sign In works
- [ ] Deep links handled correctly

---

#### Day 4-5: Password Management

**Files:**

- `apps/mobile/src/features/auth/ForgotPasswordScreen.tsx`
- `apps/mobile/src/features/auth/SetPasswordScreen.tsx`
- `apps/mobile/src/features/auth/ChangePasswordScreen.tsx`

**1. Forgot Password**

**Current (Line 24-28):**

```typescript
// ❌ STUB
const onSubmit = async (data: ForgotPasswordInput) => {
  setLoading(true);
  setTimeout(() => {
    setLoading(false);
    setSent(true);
  }, 1500);
};
```

**Required:**

```typescript
// ✅ REAL
const onSubmit = async (data: ForgotPasswordInput) => {
  setLoading(true);
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: 'travelmatch://auth/reset-password',
    });

    if (error) throw error;

    setSent(true); // Show success screen
  } catch (err) {
    Alert.alert('Error', 'Failed to send reset link');
  } finally {
    setLoading(false);
  }
};
```

**2. Set Password (from reset link)**

**Current (Line 67):**

```typescript
// ❌ STUB
const handleSetPassword = (data: ResetPasswordInput) => {
  navigation.navigate('CompleteProfile');
};
```

**Required:**

```typescript
// ✅ REAL
const handleSetPassword = async (data: ResetPasswordInput) => {
  setLoading(true);
  try {
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (error) throw error;

    Alert.alert('Success', 'Password updated successfully', [
      { text: 'OK', onPress: () => navigation.navigate('Login') },
    ]);
  } catch (err) {
    Alert.alert('Error', 'Failed to set password');
  } finally {
    setLoading(false);
  }
};
```

**3. Change Password (in settings)**

**Current (Line 74 in ChangePasswordScreen.tsx):**

```typescript
// ❌ STUB
const onSubmit = async (data: ChangePasswordInput) => {
  setLoading(true);
  setTimeout(() => {
    setLoading(false);
    Alert.alert('Success', 'Password changed successfully');
  }, 1500);
};
```

**Required:**

```typescript
// ✅ REAL
const onSubmit = async (data: ChangePasswordInput) => {
  setLoading(true);
  try {
    // Verify current password first
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) throw new Error('User not found');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: data.currentPassword,
    });

    if (signInError) {
      Alert.alert('Error', 'Current password is incorrect');
      return;
    }

    // Update to new password
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (error) throw error;

    Alert.alert('Success', 'Password changed successfully', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  } catch (err) {
    Alert.alert('Error', 'Failed to change password');
  } finally {
    setLoading(false);
  }
};
```

**Testing Checklist:**

- [ ] Forgot password → Email received
- [ ] Reset link works and expires after 1 hour
- [ ] Set password validates strength
- [ ] Change password verifies current password
- [ ] All flows update session properly

---

### Week 2: Advanced Auth Features

#### Day 6: 2FA Setup

**File:** `apps/mobile/src/features/auth/TwoFactorSetupScreen.tsx`

**Current (Lines 58-64):**

```typescript
// ❌ STUB
const handleSendCode = () => {
  setIsLoading(true);
  setTimeout(() => {
    setIsLoading(false);
    setQrCode('mock-qr-code');
    setStep('verify');
  }, 1000);
};
```

**Required:**

```typescript
// ✅ REAL (using TOTP)
import { generateSecret, generateQRCode } from '@/utils/totp';

const handleSetup2FA = async () => {
  setIsLoading(true);
  try {
    // Generate TOTP secret
    const secret = generateSecret();

    // Get user info
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not found');

    // Generate QR code
    const qrCode = await generateQRCode({
      secret,
      email: user.email,
      issuer: 'TravelMatch',
    });

    setQrCode(qrCode);
    setSecret(secret);
    setStep('verify');
  } catch (err) {
    Alert.alert('Error', 'Failed to set up 2FA');
  } finally {
    setIsLoading(false);
  }
};

const onVerify = async (data: { code: string }) => {
  setIsLoading(true);
  try {
    // Verify TOTP code
    const isValid = verifyTOTP(secret, data.code);

    if (!isValid) {
      Alert.alert('Error', 'Invalid code');
      return;
    }

    // Save to user metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        totp_secret: secret,
        totp_enabled: true,
      },
    });

    if (error) throw error;

    // Generate backup codes
    const backupCodes = generateBackupCodes(8);

    // Save backup codes
    await supabase.from('backup_codes').insert(
      backupCodes.map((code) => ({
        user_id: user.id,
        code: hashBackupCode(code),
      })),
    );

    setBackupCodes(backupCodes);
    setStep('backup-codes');
  } catch (err) {
    Alert.alert('Error', 'Verification failed');
  } finally {
    setIsLoading(false);
  }
};
```

**Utilities Needed:**

```typescript
// apps/mobile/src/utils/totp.ts
import * as crypto from 'expo-crypto';
import { encode } from 'base32-encode';
import QRCode from 'qrcode';

export const generateSecret = (): string => {
  const buffer = crypto.getRandomBytes(20);
  return encode(buffer, 'RFC4648');
};

export const generateQRCode = async (options: {
  secret: string;
  email: string;
  issuer: string;
}): Promise<string> => {
  const otpauth = `otpauth://totp/${encodeURIComponent(options.issuer)}:${encodeURIComponent(
    options.email,
  )}?secret=${options.secret}&issuer=${encodeURIComponent(options.issuer)}`;
  return await QRCode.toDataURL(otpauth);
};

export const verifyTOTP = (secret: string, token: string): boolean => {
  // Use library like `otplib`
  const totp = new TOTP({ secret });
  return totp.verify({ token });
};

export const generateBackupCodes = (count: number): string[] => {
  return Array.from({ length: count }, () => {
    const bytes = crypto.getRandomBytes(4);
    return bytes
      .toString('hex')
      .toUpperCase()
      .match(/.{1,4}/g)!
      .join('-');
  });
};

export const hashBackupCode = (code: string): string => {
  return crypto.digest('SHA256', code);
};
```

**Database Migration:**

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_add_backup_codes.sql
CREATE TABLE backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_backup_codes_user_id ON backup_codes(user_id);
```

**Testing Checklist:**

- [ ] QR code generates correctly
- [ ] Authenticator app (Google/Microsoft) scans QR
- [ ] TOTP verification works
- [ ] Backup codes generated (8 codes)
- [ ] Backup codes saved securely
- [ ] 2FA enforced on next login

---

#### Day 7-8: Login Flow with 2FA

**Update Login Screen:**

```typescript
// apps/mobile/src/features/auth/LoginScreen.tsx

const onSubmit = async (data: LoginInput) => {
  setLoading(true);
  try {
    // Step 1: Sign in with email/password
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    // Step 2: Check if 2FA is enabled
    const { data: userData } = await supabase
      .from('users')
      .select('totp_enabled')
      .eq('id', authData.user.id)
      .single();

    if (userData?.totp_enabled) {
      // Require 2FA verification
      navigation.navigate('VerifyCode', {
        userId: authData.user.id,
        verificationType: '2fa',
      });
    } else {
      // Direct login
      await SecureStore.setItemAsync('session', JSON.stringify(authData.session));
      navigation.reset({ index: 0, routes: [{ name: 'Discover' }] });
    }
  } catch (err) {
    Alert.alert('Error', 'Invalid credentials');
  } finally {
    setLoading(false);
  }
};
```

**VerifyCodeScreen Updates:**

```typescript
// apps/mobile/src/features/auth/VerifyCodeScreen.tsx

const verify2FACode = async (code: string, userId: string) => {
  try {
    // Get user's TOTP secret
    const { data: userData } = await supabase
      .from('users')
      .select('totp_secret')
      .eq('id', userId)
      .single();

    if (!userData?.totp_secret) throw new Error('2FA not configured');

    // Verify TOTP
    const isValid = verifyTOTP(userData.totp_secret, code);

    if (!isValid) {
      // Try backup codes
      const isBackupCode = await verifyBackupCode(userId, code);
      if (!isBackupCode) {
        throw new Error('Invalid code');
      }
    }

    // Success - create session
    const { data: session } = await supabase.auth.getSession();
    await SecureStore.setItemAsync('session', JSON.stringify(session));

    navigation.reset({ index: 0, routes: [{ name: 'Discover' }] });
  } catch (err) {
    Alert.alert('Error', 'Invalid verification code');
  }
};

const verifyBackupCode = async (userId: string, code: string): Promise<boolean> => {
  const hashedCode = hashBackupCode(code);

  const { data, error } = await supabase
    .from('backup_codes')
    .select('*')
    .eq('user_id', userId)
    .eq('code', hashedCode)
    .is('used_at', null)
    .single();

  if (error || !data) return false;

  // Mark as used
  await supabase
    .from('backup_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', data.id);

  return true;
};
```

---

#### Day 9-10: Testing & Polish

**E2E Tests (Maestro):**

```yaml
# .maestro/08-phone-auth.yaml
appId: com.travelmatch.app
---
- launchApp
- tapOn: 'Sign Up'
- tapOn: 'Phone Number'
- inputText: '+15551234567'
- tapOn: 'Send Code'
- waitForAnimationToEnd
- inputText: '123456' # Mock OTP in test env
- tapOn: 'Verify'
- assertVisible: 'Welcome'
```

```yaml
# .maestro/09-email-auth.yaml
appId: com.travelmatch.app
---
- launchApp
- tapOn: 'Sign Up'
- tapOn: 'Email'
- inputText: 'test@example.com'
- tapOn: 'Continue'
- assertVisible: 'Check Your Email'
```

```yaml
# .maestro/10-2fa-setup.yaml
appId: com.travelmatch.app
---
- launchApp
- tapOn: 'Settings'
- tapOn: 'Security'
- tapOn: 'Set Up 2FA'
- waitForAnimationToEnd
- assertVisible: 'Scan QR Code'
- inputText: '123456' # Mock TOTP
- tapOn: 'Verify'
- assertVisible: 'Backup Codes'
```

**Unit Tests:**

```typescript
// apps/mobile/src/__tests__/auth/phoneAuth.test.tsx

describe('Phone Authentication', () => {
  it('should send OTP successfully', async () => {
    const { getByPlaceholderText, getByText } = render(<PhoneAuthScreen />);

    fireEvent.changeText(getByPlaceholderText('(555) 123-4567'), '+15551234567');
    fireEvent.press(getByText('Send Code'));

    await waitFor(() => {
      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        phone: '+15551234567',
        options: { channel: 'sms' },
      });
    });
  });

  it('should verify OTP and navigate', async () => {
    const { getByTestId } = render(<PhoneAuthScreen />);

    // Enter OTP
    for (let i = 0; i < 6; i++) {
      fireEvent.changeText(getByTestId(`otp-input-${i}`), '1');
    }

    await waitFor(() => {
      expect(navigation.reset).toHaveBeenCalled();
    });
  });
});
```

---

## 📦 REQUIRED PACKAGES

```bash
# TOTP & QR Code
pnpm add otplib qrcode base32-encode
pnpm add -D @types/qrcode

# OAuth Browser (for social login)
pnpm add expo-web-browser

# Crypto (already included in Expo)
# expo-crypto
```

---

## ⚙️ ENVIRONMENT VARIABLES

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx

# Supabase secrets (set via CLI)
supabase secrets set TWILIO_ACCOUNT_SID=xxx
supabase secrets set TWILIO_AUTH_TOKEN=xxx
supabase secrets set TWILIO_PHONE_NUMBER=xxx
```

---

## 🎯 SUCCESS CRITERIA

### Week 1 Deliverables

- [ ] Phone auth: Send OTP working
- [ ] Phone auth: Verify OTP working
- [ ] Email auth: Magic link working
- [ ] Email auth: Email/password working
- [ ] Social auth: Apple Sign In working
- [ ] Social auth: Google Sign In working
- [ ] Password reset: Email sent
- [ ] Password reset: Link works
- [ ] All flows navigate correctly

### Week 2 Deliverables

- [ ] 2FA: QR code generation
- [ ] 2FA: TOTP verification
- [ ] 2FA: Backup codes
- [ ] Login: 2FA enforcement
- [ ] E2E tests: 3 flows passing
- [ ] Unit tests: 80%+ coverage
- [ ] Documentation: Updated

---

## 📋 TESTING CHECKLIST

### Manual Testing

- [ ] Phone auth: Valid phone → OTP sent (check phone)
- [ ] Phone auth: Enter OTP → Logged in
- [ ] Email auth: Magic link → Check email → Click link → Logged in
- [ ] Email auth: Password → Account created → Email verified
- [ ] Social auth: Apple → OAuth flow → Logged in
- [ ] Social auth: Google → OAuth flow → Logged in
- [ ] Password reset: Email → Link received → Password changed
- [ ] 2FA: Setup → QR scan → TOTP verified
- [ ] 2FA: Login → TOTP required → Backup code works

### Automated Testing

- [ ] Unit tests: All auth screens 80%+ coverage
- [ ] E2E tests: 3 Maestro flows passing
- [ ] Integration tests: Supabase auth flows
- [ ] Error handling: Network failures
- [ ] Error handling: Invalid inputs
- [ ] Error handling: Rate limiting

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: OTP Not Received

**Cause:** Twilio config incorrect  
**Solution:** Check Supabase → Settings → Auth → Phone

### Issue 2: Magic Link Opens Browser Instead of App

**Cause:** Deep link not configured  
**Solution:** Add `travelmatch://` scheme to `app.config.ts`

### Issue 3: OAuth Redirect Not Working

**Cause:** Redirect URI mismatch  
**Solution:** Match OAuth provider config with app scheme

### Issue 4: 2FA QR Code Not Scanning

**Cause:** Invalid TOTP format  
**Solution:** Use `otpauth://totp/` format correctly

---

## 📚 REFERENCES

- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- TOTP Spec (RFC 6238): https://tools.ietf.org/html/rfc6238
- Twilio Setup: https://www.twilio.com/docs/sms/quickstart
- Expo WebBrowser: https://docs.expo.dev/versions/latest/sdk/webbrowser/

---

**Status:** Ready to implement  
**Owner:** Frontend Team  
**Timeline:** 2 weeks (10 working days)  
**Blockers:** None (all dependencies available)
