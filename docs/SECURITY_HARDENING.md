# Security Hardening Summary

**Status:** ✅ Completed (Screenshot + Root Detection) | 📋 Backlog (Certificate Pinning)  
**Date:** December 2024

---

## ✅ Implemented Security Features

### 1. Screenshot Protection (Sensitive Screens)

**Implementation:** `useScreenSecurity()` hook  
**Location:** `/apps/mobile/src/hooks/useScreenSecurity.ts`

**How it works:**
- Uses `expo-screen-capture` to prevent screenshots
- Automatically enables when screen mounts
- Automatically disables when screen unmounts
- Platform-specific behavior (Android only)

**Applied to:**
- ✅ `WithdrawScreen` - Withdrawal operations
- ✅ `GiftMomentBottomSheet` - Gift payments
- 🔄 **TODO:** Apply to remaining payment screens:
  - `PaymentMethodScreen`
  - `BankAccountScreen`
  - `AddCardScreen`
  - `ConfirmGiftModal`

**Usage:**
```typescript
import { useScreenSecurity } from '@/hooks/useScreenSecurity';

function SensitiveScreen() {
  useScreenSecurity(); // Blocks screenshots while screen is active
  // ...
}
```

**Testing:**
1. Navigate to WithdrawScreen
2. Try taking screenshot (Android)
3. Should see black screen or "Screenshots disabled" message
4. Navigate away
5. Screenshots should work again

---

### 2. Root/Jailbreak Detection (Warning Mode)

**Implementation:** App startup check  
**Location:** `/App.tsx` (lines 79-96)

**How it works:**
- Uses `expo-device.isRootedExperimentalAsync()`
- Checks on app startup
- Shows **warning dialog** (not blocking)
- Logs to monitoring system
- User can dismiss and continue

**Previous behavior:**
- ❌ Blocked app completely
- ❌ Force exit on rooted devices

**New behavior:**
- ✅ Shows warning dialog
- ✅ Logs security risk
- ✅ User chooses to continue
- ✅ Better UX for power users

**Dialog:**
```
Security Warning
────────────────
This device appears to be rooted or jailbroken. 
This may reduce the security of your data. 
Continue at your own risk.

[I Understand]
```

**Logging:**
```typescript
logger.warn('App', 'Device is rooted/jailbroken - security risk');
```

**Testing:**
1. Run on rooted/jailbroken device
2. Should see warning dialog on startup
3. User can dismiss
4. App continues normally
5. Check logs for warning entry

---

## 📋 Post-Launch Security Improvements (Backlog)

### Certificate Pinning (TLS/SSL Pinning)

**Priority:** High (Post-MVP)  
**Status:** Not Implemented  
**Estimated Effort:** 2-3 days

**Problem:**
Currently, the app trusts any valid SSL certificate signed by a CA. This makes it vulnerable to:
- Man-in-the-middle (MITM) attacks
- Rogue CA certificates
- Corporate proxy inspection
- DNS hijacking with valid certificates

**Solution: Certificate Pinning**

Pin the exact certificate or public key of the Supabase backend to prevent MITM attacks.

#### Implementation Options

**Option 1: React Native SSL Pinning Library**

```bash
npm install react-native-ssl-pinning
```

**Pros:**
- ✅ Easy to implement
- ✅ Supports both iOS and Android
- ✅ Can pin certificate or public key

**Cons:**
- ❌ Requires native module linking
- ❌ Certificate rotation needs app update

**Example:**
```typescript
import { fetch } from 'react-native-ssl-pinning';

await fetch('https://[project].supabase.co/rest/v1/users', {
  method: 'GET',
  sslPinning: {
    certs: ['supabase-cert'], // Certificate in assets
  },
  headers: {
    'apikey': SUPABASE_ANON_KEY,
  },
});
```

---

**Option 2: Expo Config Plugin (Custom)**

Create custom config plugin to modify native code:

**iOS (Info.plist):**
```xml
<key>NSPinnedDomains</key>
<dict>
  <key>[project].supabase.co</key>
  <dict>
    <key>NSIncludesSubdomains</key>
    <true/>
    <key>NSPinnedLeafIdentities</key>
    <array>
      <dict>
        <key>SPKI-SHA256-BASE64</key>
        <string>YOUR_PUBLIC_KEY_HASH</string>
      </dict>
    </array>
  </dict>
</dict>
```

**Android (network_security_config.xml):**
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="false">
    <domain includeSubdomains="true">[project].supabase.co</domain>
    <pin-set>
      <pin digest="SHA-256">YOUR_PRIMARY_PIN_HASH</pin>
      <pin digest="SHA-256">YOUR_BACKUP_PIN_HASH</pin>
    </pin-set>
  </domain-config>
</network-security-config>
```

**Pros:**
- ✅ Native OS-level security
- ✅ No JavaScript overhead
- ✅ Most secure approach

**Cons:**
- ❌ Complex setup
- ❌ Requires ejecting from Expo managed workflow (or custom dev client)
- ❌ Certificate rotation requires app update

---

**Option 3: Supabase Edge Function Proxy (Recommended)**

Use Supabase Edge Function as a proxy with custom certificate validation.

**Pros:**
- ✅ No native modules needed
- ✅ Works with Expo managed workflow
- ✅ Certificate rotation without app update
- ✅ Can implement additional security checks

**Cons:**
- ❌ Adds latency (extra hop)
- ❌ More complex architecture

**Architecture:**
```
Mobile App → Supabase Edge Function (pinned) → Supabase API
```

---

#### Recommended Approach

**Phase 1 (MVP):** No pinning
- Use HTTPS with standard CA validation
- Monitor for security incidents

**Phase 2 (Post-Launch):** Public Key Pinning
- Implement Option 1 (react-native-ssl-pinning)
- Pin Supabase public key hash
- Include 2 backup pins (for rotation)

**Phase 3 (Long-term):** Native Pinning
- Move to Option 2 (OS-level) if needed
- Only if security requirements increase

---

#### Getting Supabase Certificate Hash

```bash
# Get certificate
openssl s_client -servername [project].supabase.co \
  -connect [project].supabase.co:443 < /dev/null \
  | openssl x509 -outform DER > supabase.der

# Get public key hash (SHA-256)
openssl x509 -in supabase.der -inform DER -pubkey -noout \
  | openssl pkey -pubin -outform DER \
  | openssl dgst -sha256 -binary \
  | openssl base64
```

**Example Output:**
```
sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=
```

---

#### Certificate Rotation Plan

**Problem:** Pinned certificates expire or get rotated.

**Solutions:**
1. **Multiple Pins:** Pin 2-3 certificates (current + backup)
2. **Public Key Pinning:** Pin public key (survives cert renewal)
3. **Remote Config:** Store pins in Firebase Remote Config
4. **Fallback Mode:** Disable pinning if all pins fail (with logging)

**Example (Multi-pin):**
```typescript
const CERTIFICATE_PINS = [
  'sha256/PRIMARY_HASH_HERE',    // Current cert
  'sha256/BACKUP_HASH_1_HERE',   // Backup cert 1
  'sha256/BACKUP_HASH_2_HERE',   // Backup cert 2
];
```

---

#### Security vs. UX Trade-offs

| Feature | Security | UX Impact | Maintenance |
|---------|----------|-----------|-------------|
| No Pinning | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Library Pinning | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Native Pinning | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

**Recommendation:** Start without pinning (MVP), add library-based pinning post-launch.

---

#### Testing Certificate Pinning

**Test Cases:**
1. ✅ Normal API call works
2. ✅ MITM attack blocked (Charles Proxy)
3. ✅ Wrong certificate rejected
4. ✅ Expired pin fallback works
5. ✅ Certificate rotation handled

**Tools:**
- Charles Proxy (MITM testing)
- Burp Suite
- mitmproxy

**Test Scenario:**
1. Install Charles Proxy
2. Enable SSL Proxying for Supabase domain
3. Install Charles root certificate on device
4. Make API call from app
5. **Without pinning:** Call succeeds (vulnerable)
6. **With pinning:** Call fails with certificate error (secure)

---

## 📊 Security Posture Summary

| Security Layer | Status | Coverage |
|----------------|--------|----------|
| **HTTPS/TLS** | ✅ Enabled | All network traffic |
| **Screenshot Protection** | ✅ Implemented | Payment screens |
| **Root Detection** | ✅ Warning mode | App startup |
| **Certificate Pinning** | 📋 Backlog | Post-launch |
| **Biometric Auth** | ✅ Implemented | Payments |
| **SecureStore** | ✅ Implemented | Sensitive data |
| **Rate Limiting** | ✅ Implemented | API endpoints |
| **RLS Policies** | ✅ Implemented | Database |

**Overall Security:** ⭐⭐⭐⭐ (4/5)  
**Post-Pinning:** ⭐⭐⭐⭐⭐ (5/5)

---

## 🎯 Action Items

### Immediate (Pre-Launch)
- [x] Screenshot protection on sensitive screens
- [x] Root/jailbreak detection (warning mode)
- [ ] Apply `useScreenSecurity()` to remaining payment screens
- [ ] Security audit of sensitive screens
- [ ] Document security features in user docs

### Post-Launch (Q1 2025)
- [ ] Implement certificate pinning (Option 1)
- [ ] Get Supabase certificate hashes
- [ ] Setup certificate rotation monitoring
- [ ] Load testing with pinning enabled
- [ ] Security penetration testing
- [ ] MITM attack testing with Charles Proxy

### Long-Term (Q2 2025+)
- [ ] Evaluate native pinning (Option 2)
- [ ] Implement backup pin rotation
- [ ] Remote config for certificate pins
- [ ] Automated certificate expiry monitoring
- [ ] Security incident response plan

---

## 📚 References

**Libraries:**
- [react-native-ssl-pinning](https://github.com/MaxToyberman/react-native-ssl-pinning)
- [expo-screen-capture](https://docs.expo.dev/versions/latest/sdk/screen-capture/)
- [expo-device](https://docs.expo.dev/versions/latest/sdk/device/)

**Documentation:**
- [OWASP Mobile Security Testing Guide](https://mobile-security.gitbook.io/mobile-security-testing-guide/)
- [Apple App Transport Security](https://developer.apple.com/documentation/security/preventing_insecure_network_connections)
- [Android Network Security Config](https://developer.android.com/training/articles/security-config)

**Tools:**
- [Charles Proxy](https://www.charlesproxy.com/)
- [Burp Suite](https://portswigger.net/burp)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

---

**Last Updated:** December 2024  
**Owner:** Security Team  
**Review Cycle:** Quarterly
