# 🔐 Security Quick Reference

**Quick guide for developers on secure coding practices**

---

## ✅ DO's

### Storing Sensitive Data

```typescript
// ✅ DO: Use SecureStore for tokens, keys, credentials
import { secureStorage } from '@/utils/secureStorage';

await secureStorage.setItem('secure:access_token', token);
const token = await secureStorage.getItem('secure:access_token');
```

### Storing Non-Sensitive Data

```typescript
// ✅ DO: Use AsyncStorage for public data only
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.setItem('user_preferences', JSON.stringify({ theme: 'dark' }));
```

### Environment Variables

```typescript
// ✅ DO: Use EXPO_PUBLIC_* for public, non-sensitive values
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
```

### Server-Side API Calls

```typescript
// ✅ DO: Use Edge Functions for sensitive operations
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/upload-image`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`, // From SecureStore
      'apikey': SUPABASE_ANON_KEY,
    },
    body: formData,
  }
);
```

### Image Uploads

```typescript
// ✅ DO: Use secure image upload service
import { uploadImage } from '@/services/imageUploadService';

const result = await uploadImage(imageUri, {
  type: 'avatar',
  metadata: { purpose: 'profile-update' },
});
```

### Video Transcription

```typescript
// ✅ DO: Use video service (calls Edge Function)
import { videoService } from '@/services/video-service';

const transcript = await videoService.generateTranscript(videoId, 'en');
```

---

## ❌ DON'Ts

### Never Store in AsyncStorage

```typescript
// ❌ DON'T: Store sensitive data in AsyncStorage
await AsyncStorage.setItem('access_token', token); // INSECURE!
await AsyncStorage.setItem('password', password); // INSECURE!
await AsyncStorage.setItem('api_key', apiKey); // INSECURE!
```

### Never Use EXPO_PUBLIC_* for Secrets

```bash
# ❌ DON'T: Expose secrets in environment variables
EXPO_PUBLIC_OPENAI_API_KEY=sk-xxxxx # EXPOSED TO CLIENT!
EXPO_PUBLIC_STRIPE_SECRET_KEY=sk_live_xxxxx # EXPOSED!
EXPO_PUBLIC_CLOUDFLARE_TOKEN=xxxxx # EXPOSED!
```

### Never Call Sensitive APIs Directly

```typescript
// ❌ DON'T: Call external APIs with secrets from client
const response = await fetch('https://api.openai.com/v1/...', {
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // EXPOSED!
  },
});
```

### Never Hardcode Secrets

```typescript
// ❌ DON'T: Hardcode API keys or secrets
const STRIPE_KEY = 'sk_live_xxxxxxxxxxxxx'; // NEVER DO THIS!
const API_SECRET = 'super-secret-key-123'; // NEVER DO THIS!
```

### Never Log Sensitive Data

```typescript
// ❌ DON'T: Log tokens or sensitive info
console.log('Access token:', accessToken); // EXPOSED IN LOGS!
logger.info('User password:', password); // NEVER LOG THIS!

// ✅ DO: Sanitize logs
import { sanitizeLog } from '@/utils/securityChecks';
console.log(sanitizeLog(message)); // Redacts tokens automatically
```

---

## 🔑 Common Patterns

### Authentication

```typescript
// Get session from SecureStore
const { data: { session }, error } = await supabase.auth.getSession();

if (!session) {
  throw new Error('Not authenticated');
}

// Use in API calls
const response = await fetch(apiUrl, {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
  },
});
```

### File Uploads (Secure)

```typescript
import { uploadImage } from '@/services/imageUploadService';

// Single upload
const result = await uploadImage(imageUri, { type: 'moment' });

// Batch upload
const results = await uploadImages([uri1, uri2, uri3], { type: 'gallery' });

// Use CDN URLs
console.log(result.url); // Optimized delivery URL
```

### Video Operations (Secure)

```typescript
import { videoService } from '@/services/video-service';

// Upload video
const videoId = await videoService.uploadVideo(videoUri);

// Generate transcript (calls Edge Function)
const transcript = await videoService.generateTranscript(videoId, 'en');

// Get captions
const captions = await videoService.generateCaptions(videoId, 'en');
```

---

## 🛡️ Security Checks

### Run Security Audit (DEV mode)

```typescript
import { runSecurityAudit } from '@/utils/securityChecks';

// Manual audit
const result = await runSecurityAudit();

if (!result.passed) {
  console.error('Security issues found:', result.issues);
}

// Automatic monitoring (runs every 5 min in DEV)
// Already initialized in App.tsx
```

### Check for Exposed Secrets

```typescript
import { checkEnvironmentVariables } from '@/utils/securityChecks';

const issues = checkEnvironmentVariables();

issues.forEach(issue => {
  console.error(`[${issue.severity}] ${issue.message}`);
  if (issue.fix) console.log(`Fix: ${issue.fix}`);
});
```

### Check AsyncStorage Safety

```typescript
import { checkAsyncStorageUsage } from '@/utils/securityChecks';

const issues = await checkAsyncStorageUsage();

if (issues.length > 0) {
  console.error('⚠️ Sensitive data in AsyncStorage:', issues);
}
```

---

## 📋 Security Checklist

Before committing code, verify:

- [ ] No API keys in source code
- [ ] No secrets in EXPO_PUBLIC_* variables
- [ ] Tokens stored in SecureStore (not AsyncStorage)
- [ ] Sensitive API calls go through Edge Functions
- [ ] Logs are sanitized (no tokens/passwords)
- [ ] User input is validated
- [ ] Error messages don't leak sensitive info
- [ ] File uploads use secure service
- [ ] Authentication required for sensitive operations

---

## 🚨 If You Find a Security Issue

1. **Don't commit it** - Stop immediately
2. **Don't share publicly** - Use private channels
3. **Contact security team** - #security-team on Slack
4. **Document the issue** - Note file, line, vulnerability type
5. **Wait for fix** - Let security team handle it

**Emergency Contact:** security-oncall@travelmatch.com

---

## 📚 Learn More

- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) - Complete security documentation
- [EDGE_FUNCTIONS_DEPLOYMENT.md](./EDGE_FUNCTIONS_DEPLOYMENT.md) - Deployment guide
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)

---

## 💡 Pro Tips

1. **When in doubt, ask** - Security team is here to help
2. **Use the tools** - Runtime security checks catch issues early
3. **Think server-side** - If it's sensitive, it belongs on the server
4. **Review your PRs** - Check for exposed secrets before submitting
5. **Keep secrets secret** - Never share API keys in chat/email

---

**Last Updated:** December 8, 2025  
**Maintained by:** Security Team
