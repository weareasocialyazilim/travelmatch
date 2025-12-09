# Token & Session Yönetimi

## 📋 İçindekiler
- [Mimari Genel Bakış](#mimari-genel-bakış)
- [SessionManager](#sessionmanager)
- [Token Storage Model](#token-storage-model)
- [Request Interceptor](#request-interceptor)
- [Session Expiry Flow](#session-expiry-flow)
- [Kullanım Örnekleri](#kullanım-örnekleri)

---

## Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────────┐
│                       APP STARTUP                           │
│  1. SessionManager.initialize()                             │
│  2. Token validation from storage                           │
│  3. Auto-refresh if expired                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API REQUEST FLOW                         │
│                                                              │
│  User Action → apiV1Service → SessionManager.getValidToken()│
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Token valid?                                         │   │
│  │  ✓ Yes → Use cached token                           │   │
│  │  ✗ No  → Auto-refresh → Get new token               │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│                    Make API Request                         │
│                            │                                │
│                ┌───────────┴────────────┐                   │
│                │                        │                   │
│             Success                  401 Error              │
│                │                        │                   │
│          Return Data              Refresh Token             │
│                                         │                   │
│                              ┌──────────┴─────────┐         │
│                              │                    │         │
│                        Refresh OK          Refresh Failed   │
│                              │                    │         │
│                         Retry Request      Clear Session    │
│                                                   │         │
│                                          SessionExpired     │
│                                              Screen         │
└─────────────────────────────────────────────────────────────┘
```

---

## SessionManager

### Özellikleri

**✅ Unified Token Management**
- Tek merkezi token yönetim katmanı
- Memory + SecureStore hibrit yaklaşım
- Automatic token refresh (5 dk önce)
- Deduplication (aynı anda birden fazla refresh'i engeller)

**✅ Storage Strategy**
```typescript
// Sensitive (SecureStore - hardware encrypted)
- access_token
- refresh_token  
- token_expires_at

// Non-sensitive (AsyncStorage - plain)
- user_profile (name, avatar, email)
```

**✅ Event System**
```typescript
sessionManager.addListener((event, data) => {
  switch (event) {
    case 'session_created':
    case 'session_refreshed':
    case 'session_expired':
    case 'session_cleared':
    case 'refresh_failed':
      // Handle events
  }
});
```

### API

#### `initialize(): Promise<SessionState>`
Uygulama başlangıcında çağrılır. Storage'dan session'ı yükler ve validate eder.

```typescript
// App.tsx
const sessionState = await sessionManager.initialize();
// Returns: 'valid' | 'expired' | 'invalid' | 'unknown'

if (sessionState === 'expired') {
  await sessionManager.isSessionValid(); // Auto-refresh
}
```

#### `saveSession(data: SessionData): Promise<void>`
Yeni session kaydet (login sonrası)

```typescript
await sessionManager.saveSession({
  user: { id, email, name, avatar },
  tokens: { accessToken, refreshToken, expiresAt }
});
```

#### `getValidToken(): Promise<string | null>`
**En önemli method**. Her API isteğinden önce kullanılır.
- Token geçerliyse → anında döner
- Token yakın zamanda sona erecekse → otomatik refresh → yeni token
- Refresh başarısızsa → null döner

```typescript
const token = await sessionManager.getValidToken();
if (token) {
  // Make API request
} else {
  // Session expired
}
```

#### `clearSession(): Promise<void>`
Logout - tüm session'ı temizle

```typescript
await sessionManager.clearSession();
```

#### `isSessionValid(): Promise<boolean>`
Session geçerli mi kontrol et (gerekirse refresh yap)

```typescript
const isValid = await sessionManager.isSessionValid();
if (!isValid) {
  // Navigate to login
}
```

---

## Token Storage Model

### Storage Classification

```typescript
StorageKeys = {
  // SECURE (SecureStore - encrypted)
  SECURE: {
    ACCESS_TOKEN: 'secure:access_token',
    REFRESH_TOKEN: 'secure:refresh_token',
    TOKEN_EXPIRES_AT: 'secure:token_expires_at',
    BIOMETRIC_KEY: 'secure:biometric_key',
    PIN_CODE: 'secure:pin_code',
    PAYMENT_METHOD: 'secure:payment_method',
  },
  
  // PUBLIC (AsyncStorage - plain)
  PUBLIC: {
    USER_PROFILE: 'user_profile',
    APP_SETTINGS: 'app_settings',
    THEME_PREFERENCE: 'theme_preference',
    ONBOARDING_COMPLETED: 'onboarding_completed',
  }
}
```

### Migration

Eski AsyncStorage token'ları SecureStore'a otomatik migrate edilir:

```typescript
// App.tsx - one-time migration
await migrateSensitiveDataToSecure();
// auth_access_token → secure:access_token
// auth_refresh_token → secure:refresh_token
// auth_token_expires → secure:token_expires_at
```

---

## Request Interceptor

### 401 Auto-Refresh Flow

`apiV1Service` içinde otomatik token refresh interceptor:

```typescript
// Request flow
1. checkNetwork() - Offline check
2. getValidToken() - Get token (auto-refreshes if needed)
3. Make request with Bearer token
4. Response check:
   ├─ 200-299 → Success ✓
   ├─ 401 Unauthorized → Refresh token → Retry
   │   ├─ Refresh success → Retry with new token
   │   └─ Refresh failed → Navigate to SessionExpired
   └─ Other error → Return error
```

### Kod İmplementasyonu

```typescript
// apiV1Service.ts
async request<T>(method, path, body?, isRetry = false) {
  // ... network check ...
  
  const response = await fetch(url, { method, headers, body });
  
  // 401 INTERCEPTOR
  if (response.status === 401 && !isRetry) {
    const newToken = await sessionManager.getValidToken();
    
    if (newToken) {
      // Retry with new token
      return this.request<T>(method, path, body, true);
    } else {
      // Session expired
      this.sessionExpiredCallback?.();
      return {
        success: false,
        error: {
          code: 'SESSION_EXPIRED',
          message: 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.'
        }
      };
    }
  }
  
  // ... normal response handling ...
}
```

### Retry Logic

- **isRetry flag** prevents infinite loops
- Only 1 retry attempt per request
- If retry also fails → session truly expired

---

## Session Expiry Flow

### 1. Token Expiry Detection

**Timing:**
- Access token valid: 3600 seconds (1 hour)
- Refresh buffer: 5 minutes before expiry
- Auto-refresh triggers at: t + 55 minutes

```typescript
// sessionManager.ts
private readonly REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 min

private isTokenExpiringSoon(expiresAt: number): boolean {
  return Date.now() >= expiresAt - this.REFRESH_BUFFER_MS;
}
```

### 2. Refresh Attempt

```typescript
async getValidToken(): Promise<string | null> {
  if (!this.isTokenExpiringSoon(this.tokens.expiresAt)) {
    return this.tokens.accessToken; // Still valid
  }
  
  return this.refreshToken(); // Auto-refresh
}
```

### 3. Refresh Success

- New tokens saved to SecureStore + memory
- Session continues seamlessly
- User unaware of refresh

### 4. Refresh Failure

**Scenarios:**
- ❌ Refresh token expired (30 days limit)
- ❌ Refresh token revoked
- ❌ User deleted/banned
- ❌ Security policy changed

**Response:**
```typescript
1. sessionManager.clearSession() - Clear all tokens
2. apiClient.sessionExpiredCallback() - Trigger callback
3. Navigate to SessionExpiredScreen
4. User must re-login
```

---

## SessionExpiredScreen

### UI Flow

```
┌────────────────────────────────────┐
│   🕐  Oturumunuz Sona Erdi         │
│                                    │
│   Güvenliğiniz için oturumunuz     │
│   sonlandırıldı. Devam etmek için  │
│   lütfen tekrar giriş yapın.       │
│                                    │
│   ┌───────────────────────────┐   │
│   │  🔑 Tekrar Giriş Yap      │   │
│   └───────────────────────────┘   │
│                                    │
│   ℹ️  Verileriniz güvende. Giriş  │
│      yaptıktan sonra kaldığınız   │
│      yerden devam edebilirsiniz.  │
└────────────────────────────────────┘
```

### Kod

```typescript
const handleLogin = async () => {
  await sessionManager.clearSession();
  navigation.reset({
    index: 0,
    routes: [{ name: 'Login' }]
  });
};
```

---

## Kullanım Örnekleri

### 1. App Startup Token Validation

```typescript
// App.tsx
useEffect(() => {
  async function prepare() {
    // Initialize session
    const state = await sessionManager.initialize();
    
    if (state === 'expired') {
      // Try auto-refresh
      const isValid = await sessionManager.isSessionValid();
      if (!isValid) {
        logger.warn('Session expired, user needs to re-login');
      }
    }
  }
  prepare();
}, []);
```

### 2. Login Flow

```typescript
// LoginScreen.tsx
const handleLogin = async () => {
  const { user, session } = await authService.signInWithEmail(email, password);
  
  // Save to SessionManager
  await sessionManager.saveSession({
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata.name,
      avatar: user.user_metadata.avatar_url
    },
    tokens: {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at * 1000
    }
  });
  
  navigation.navigate('Home');
};
```

### 3. API Request

```typescript
// Any service
const response = await apiV1Service.listMoments({ limit: 10 });

// Behind the scenes:
// 1. sessionManager.getValidToken() - auto-refresh if needed
// 2. Add Bearer token to request
// 3. If 401 → refresh → retry
// 4. If refresh fails → SessionExpired screen
```

### 4. Logout Flow

```typescript
// LogoutButton.tsx
const handleLogout = async () => {
  await authService.signOut(); // Supabase logout
  await sessionManager.clearSession(); // Clear local storage
  navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
};
```

### 5. Token Events

```typescript
// Monitor session events
useEffect(() => {
  const unsubscribe = sessionManager.addListener((event, data) => {
    switch (event) {
      case 'session_expired':
        Alert.alert('Session Expired', 'Please login again');
        break;
      case 'refresh_failed':
        logger.error('Token refresh failed:', data.error);
        break;
      case 'session_refreshed':
        logger.info('Token refreshed, expires at:', data.expiresAt);
        break;
    }
  });
  
  return unsubscribe;
}, []);
```

### 6. Manual Session Check

```typescript
// Before sensitive operation
const isValid = await sessionManager.isSessionValid();
if (!isValid) {
  Alert.alert('Session Expired', 'Please login again');
  navigation.navigate('Login');
  return;
}

// Proceed with operation
await performSensitiveOperation();
```

---

## Security Best Practices

### ✅ DO

- **Use SessionManager for all token operations**
- **Never store tokens in plain AsyncStorage**
- **Always check session before sensitive operations**
- **Clear session on logout/security events**
- **Use refresh buffer (5 min) to prevent expiry during requests**

### ❌ DON'T

- **Don't access SecureStore directly**
- **Don't store sensitive data in AsyncStorage**
- **Don't retry 401 infinitely**
- **Don't ignore refresh failures**
- **Don't hardcode token values**

---

## Troubleshooting

### Problem: "Session Expired" loop

**Cause:** Refresh token also expired
**Solution:** User must re-login (expected behavior)

### Problem: Token refresh fails immediately

**Cause:** Network offline or Supabase down
**Solution:** Check network, sessionManager returns cached token for offline mode

### Problem: Multiple refresh requests

**Cause:** Concurrent API calls trigger multiple refreshes
**Solution:** SessionManager deduplicates with `refreshPromise` lock

### Problem: SessionExpired screen not showing

**Cause:** Navigation callback not set
**Solution:** Check `AppNavigator.tsx` has `apiClient.setSessionExpiredCallback()`

---

## Testing

```typescript
// Test token expiry
const mockExpiredToken = {
  accessToken: 'expired_token',
  refreshToken: 'valid_refresh',
  expiresAt: Date.now() - 1000 // Expired 1 second ago
};

await sessionManager.saveSession({ user, tokens: mockExpiredToken });
const token = await sessionManager.getValidToken();
// Should trigger refresh automatically

// Test 401 interceptor
jest.spyOn(global, 'fetch').mockResolvedValueOnce({
  status: 401,
  json: async () => ({ error: 'Unauthorized' })
});

const response = await apiV1Service.listMoments();
// Should auto-refresh and retry
```

---

## Migration Guide

### From AuthContext to SessionManager

**Before:**
```typescript
const { getAccessToken } = useAuth();
const token = await getAccessToken();
```

**After:**
```typescript
import { sessionManager } from '@/services/sessionManager';
const token = await sessionManager.getValidToken();
```

**Benefits:**
- ✅ Works outside React components
- ✅ Better performance (memory cache)
- ✅ Centralized token logic
- ✅ Event system for monitoring

---

## Files Structure

```
apps/mobile/src/
├── services/
│   ├── sessionManager.ts      # Core session management
│   ├── apiV1Service.ts        # API client with 401 interceptor
│   ├── navigationService.ts   # Global navigation helper
│   └── index.ts               # Exports
├── screens/
│   └── SessionExpiredScreen.tsx
├── utils/
│   └── secureStorage.ts       # SecureStore wrapper
└── context/
    └── AuthContext.tsx        # High-level auth state (uses SessionManager)
```

---

## Summary

| Feature | Implementation |
|---------|---------------|
| **Token Storage** | SecureStore (encrypted) + memory cache |
| **Auto-Refresh** | 5 min before expiry |
| **401 Handling** | Intercept → Refresh → Retry |
| **Refresh Failure** | Clear session → SessionExpired screen |
| **Deduplication** | Single refresh promise lock |
| **Offline Mode** | Return cached token (graceful degradation) |
| **Startup Check** | Auto-validate on app launch |
| **Event System** | Listen to session lifecycle events |

**🎯 Goal:** Zero-touch token management. Developer calls `getValidToken()`, everything else is automatic.
