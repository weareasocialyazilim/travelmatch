# Deep Link Infrastructure - Complete Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Supported Links](#supported-links)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
- [Testing](#testing)

---

## Overview

Comprehensive deep link system with:

✅ **Zod Validation** - All link params validated with schemas  
✅ **404/410 Handling** - Expired and not-found links detected  
✅ **Fallback Screens** - User-friendly error UIs  
✅ **Type Safety** - Full TypeScript support  
✅ **Auto Navigation** - Seamless routing to screens  
✅ **Resource Checking** - Backend existence validation  

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DEEP LINK FLOW                            │
│                                                              │
│  1. User clicks link                                        │
│     ↓                                                       │
│  2. App receives URL                                        │
│     ↓                                                       │
│  3. DeepLinkHandler.handleDeepLink(url)                    │
│     ├─ Parse URL → Extract type & params                   │
│     ├─ Validate with Zod → Check format                    │
│     ├─ Check existence (optional) → Backend HEAD request   │
│     └─ Navigate or Show Error                              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Success Path                                        │    │
│  │  → Navigate to screen with validated params        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Error Paths                                         │    │
│  │  → Invalid URL → LinkInvalidScreen                 │    │
│  │  → Invalid params → LinkInvalidScreen              │    │
│  │  → 404 Not Found → LinkNotFoundScreen              │    │
│  │  → 410 Expired → LinkExpiredScreen                 │    │
│  │  → 401/403 Unauthorized → LinkInvalidScreen        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Supported Links

### URL Formats

| Type | URL Format | Example |
|------|------------|---------|
| **Profile** | `/profile/:userId` or `/p/:userId` | `https://travelmatch.app/profile/123e4567-e89b-12d3-a456-426614174000` |
| **Moment** | `/moment/:momentId` or `/m/:momentId` | `https://travelmatch.app/moment/123e4567-e89b-12d3-a456-426614174001` |
| **Trip** | `/trip/:tripId` or `/t/:tripId` | `https://travelmatch.app/trip/123e4567-e89b-12d3-a456-426614174002` |
| **Gift** | `/gift/:giftId` or `/g/:giftId` | `https://travelmatch.app/gift/123e4567-e89b-12d3-a456-426614174003` |
| **Chat** | `/chat/:conversationId` or `/c/:conversationId` | `https://travelmatch.app/chat/123e4567-e89b-12d3-a456-426614174004` |
| **Request** | `/request/:requestId` or `/r/:requestId` | `https://travelmatch.app/request/123e4567-e89b-12d3-a456-426614174005` |
| **Notifications** | `/notifications` | `https://travelmatch.app/notifications` |
| **Settings** | `/settings` | `https://travelmatch.app/settings` |

### URL Schemes

Both schemes supported:
- **HTTPS**: `https://travelmatch.app/profile/123`
- **App Scheme**: `travelmatch://profile/123`

### UTM Parameters

All links support UTM tracking:

```
https://travelmatch.app/profile/123?utm_source=instagram&utm_campaign=summer&utm_medium=story
```

Supported params:
- `utm_source` - Traffic source (instagram, facebook, email, etc)
- `utm_campaign` - Campaign name
- `utm_medium` - Medium type (story, post, email, etc)
- `utm_content` - Content identifier
- `utm_term` - Keyword term

---

## Validation

### Zod Schemas

All link params are validated with Zod before navigation:

```typescript
const DeepLinkSchemas = {
  profile: z.object({
    userId: z.string().uuid('ID geçersiz format'),
  }),
  moment: z.object({
    momentId: z.string().uuid('ID geçersiz format'),
  }),
  trip: z.object({
    tripId: z.string().uuid('ID geçersiz format'),
  }),
  gift: z.object({
    giftId: z.string().uuid('ID geçersiz format'),
  }),
  chat: z.object({
    conversationId: z.string().uuid('ID geçersiz format'),
  }),
  request: z.object({
    requestId: z.string().uuid('ID geçersiz format'),
  }),
};
```

### Validation Errors

**Invalid Format:**
```
URL: travelmatch://profile/not-a-uuid
❌ Error: "ID geçersiz format"
→ Navigate to LinkInvalidScreen
```

**Missing Params:**
```
URL: travelmatch://profile/
❌ Error: "Link formatı geçersiz"
→ Navigate to LinkInvalidScreen
```

**Unknown Type:**
```
URL: travelmatch://unknown/123
❌ Error: "Link tipi desteklenmiyor"
→ Navigate to LinkInvalidScreen
```

---

## Error Handling

### Error Types

```typescript
export enum DeepLinkError {
  INVALID_URL = 'INVALID_URL',        // Malformed URL
  INVALID_PARAMS = 'INVALID_PARAMS',  // Zod validation failed
  NOT_FOUND = 'NOT_FOUND',            // 404 from backend
  EXPIRED = 'EXPIRED',                // 410 from backend
  UNAUTHORIZED = 'UNAUTHORIZED',      // 401/403 from backend
  NETWORK_ERROR = 'NETWORK_ERROR',    // Network failure
  UNKNOWN = 'UNKNOWN',                // Unexpected error
}
```

### Error Screens

#### 1. LinkNotFoundScreen (404)

**When shown:**
- Resource deleted
- Wrong ID
- Backend returns 404

**UI:**
```
┌────────────────────────────────┐
│   🔗❌  İçerik Bulunamadı        │
│                                │
│   Aradığınız içerik kaldırılmış│
│   veya mevcut değil olabilir.  │
│                                │
│   [Ana Sayfaya Dön]            │
│   [Geri Dön]                   │
└────────────────────────────────┘
```

#### 2. LinkExpiredScreen (410)

**When shown:**
- Resource expired
- Time-limited content
- Backend returns 410

**UI:**
```
┌────────────────────────────────┐
│   ⏱️  Link Süresi Dolmuş        │
│                                │
│   Bu içerik artık mevcut değil │
│   veya kaldırılmış olabilir.   │
│                                │
│   [Keşfet]                     │
│   [Ana Sayfaya Dön]            │
└────────────────────────────────┘
```

#### 3. LinkInvalidScreen

**When shown:**
- Invalid URL format
- Zod validation failed
- Malformed params

**UI:**
```
┌────────────────────────────────┐
│   🔗  Geçersiz Link             │
│                                │
│   Link hatalı veya bozuk       │
│   görünüyor.                   │
│                                │
│   [Ana Sayfaya Dön]            │
└────────────────────────────────┘
```

### Backend Status Code Mapping

| Status Code | Error Type | Screen |
|------------|------------|--------|
| 200-299 | Success ✅ | Navigate to resource |
| 404 | NOT_FOUND | LinkNotFoundScreen |
| 410 | EXPIRED | LinkExpiredScreen |
| 401/403 | UNAUTHORIZED | LinkInvalidScreen |
| 500+ | NETWORK_ERROR | LinkInvalidScreen |

---

## Usage Examples

### 1. Basic Deep Link Handling

```typescript
// App.tsx or AppNavigator.tsx
import { deepLinkHandler } from '@/services/deepLinkHandler';
import { navigationRef } from '@/services/navigationService';

useEffect(() => {
  // Set navigation reference
  if (navigationRef.current) {
    deepLinkHandler.setNavigation(navigationRef.current);
  }
  
  // Initialize deep link listening
  const unsubscribe = deepLinkHandler.initialize();
  
  return unsubscribe;
}, []);
```

### 2. Handle Link Manually

```typescript
import { deepLinkHandler } from '@/services/deepLinkHandler';

const handleShareLink = async (url: string) => {
  const result = await deepLinkHandler.handleDeepLink(url, {
    checkExists: true, // Validate with backend
  });
  
  if (!result.success) {
    Alert.alert('Link Hatası', result.error?.message);
  }
};
```

### 3. Generate Share Links

```typescript
import { deepLinkHandler, DeepLinkType } from '@/services/deepLinkHandler';

// Simple link
const profileLink = deepLinkHandler.generateLink(
  DeepLinkType.PROFILE,
  userId
);
// https://travelmatch.app/profile/123e4567-...

// With UTM tracking
const momentLink = deepLinkHandler.generateLink(
  DeepLinkType.MOMENT,
  momentId,
  {
    source: 'instagram',
    campaign: 'summer_2025',
    medium: 'story',
    content: 'beach_moment',
  }
);
// https://travelmatch.app/moment/123e4567-...?utm_source=instagram&...
```

### 4. Share to Social Media

```typescript
import { Share } from 'react-native';
import { deepLinkHandler, DeepLinkType } from '@/services/deepLinkHandler';

const shareMoment = async (momentId: string) => {
  const link = deepLinkHandler.generateLink(
    DeepLinkType.MOMENT,
    momentId,
    { source: 'share', campaign: 'organic' }
  );
  
  await Share.share({
    message: 'Check out this amazing moment!',
    url: link,
  });
};
```

### 5. Check Link Validity

```typescript
const validateLink = async (url: string) => {
  const result = await deepLinkHandler.handleDeepLink(url, {
    checkExists: true,
  });
  
  if (result.success) {
    console.log('Valid link to:', result.screen);
  } else {
    console.error('Invalid:', result.error?.code);
    
    switch (result.error?.code) {
      case DeepLinkError.NOT_FOUND:
        // Handle 404
        break;
      case DeepLinkError.EXPIRED:
        // Handle 410
        break;
      case DeepLinkError.INVALID_PARAMS:
        // Handle validation error
        break;
    }
  }
};
```

### 6. Custom Error Handling

```typescript
import { deepLinkHandler } from '@/services/deepLinkHandler';

const result = await deepLinkHandler.handleDeepLink(url);

if (!result.success) {
  // Manual navigation to error screen
  deepLinkHandler.navigateToError(
    result.error!.code,
    result.error!.message
  );
}
```

---

## Testing

### Test Cases

#### 1. Valid Links

```typescript
describe('Deep Link Validation', () => {
  it('should handle valid profile link', async () => {
    const url = 'https://travelmatch.app/profile/123e4567-e89b-12d3-a456-426614174000';
    const result = await deepLinkHandler.handleDeepLink(url);
    
    expect(result.success).toBe(true);
    expect(result.screen).toBe('ProfileDetail');
    expect(result.params.userId).toBe('123e4567-e89b-12d3-a456-426614174000');
  });
  
  it('should handle short URL formats', async () => {
    const url = 'https://travelmatch.app/p/123e4567-e89b-12d3-a456-426614174000';
    const result = await deepLinkHandler.handleDeepLink(url);
    
    expect(result.success).toBe(true);
    expect(result.type).toBe(DeepLinkType.PROFILE);
  });
});
```

#### 2. Invalid Links

```typescript
it('should reject invalid UUID format', async () => {
  const url = 'https://travelmatch.app/profile/not-a-uuid';
  const result = await deepLinkHandler.handleDeepLink(url);
  
  expect(result.success).toBe(false);
  expect(result.error?.code).toBe(DeepLinkError.INVALID_PARAMS);
});

it('should reject unknown link types', async () => {
  const url = 'https://travelmatch.app/unknown/123';
  const result = await deepLinkHandler.handleDeepLink(url);
  
  expect(result.success).toBe(false);
  expect(result.error?.code).toBe(DeepLinkError.INVALID_URL);
});
```

#### 3. Backend Validation

```typescript
it('should detect 404 not found', async () => {
  // Mock backend response
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 404,
  });
  
  const url = 'https://travelmatch.app/profile/123e4567-e89b-12d3-a456-426614174000';
  const result = await deepLinkHandler.handleDeepLink(url, { checkExists: true });
  
  expect(result.success).toBe(false);
  expect(result.error?.code).toBe(DeepLinkError.NOT_FOUND);
});

it('should detect 410 expired', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 410,
  });
  
  const url = 'https://travelmatch.app/trip/123e4567-e89b-12d3-a456-426614174002';
  const result = await deepLinkHandler.handleDeepLink(url, { checkExists: true });
  
  expect(result.success).toBe(false);
  expect(result.error?.code).toBe(DeepLinkError.EXPIRED);
});
```

#### 4. UTM Parameters

```typescript
it('should extract UTM parameters', () => {
  const url = 'https://travelmatch.app/moment/123?utm_source=instagram&utm_campaign=summer';
  const parsed = deepLinkHandler.parseURL(url);
  
  expect(parsed.queryParams.utm_source).toBe('instagram');
  expect(parsed.queryParams.utm_campaign).toBe('summer');
});
```

#### 5. Link Generation

```typescript
it('should generate valid links', () => {
  const link = deepLinkHandler.generateLink(
    DeepLinkType.PROFILE,
    '123e4567-e89b-12d3-a456-426614174000'
  );
  
  expect(link).toBe('https://travelmatch.app/profile/123e4567-e89b-12d3-a456-426614174000');
});

it('should include UTM params in generated links', () => {
  const link = deepLinkHandler.generateLink(
    DeepLinkType.MOMENT,
    '123e4567-e89b-12d3-a456-426614174001',
    { source: 'instagram', campaign: 'test' }
  );
  
  expect(link).toContain('utm_source=instagram');
  expect(link).toContain('utm_campaign=test');
});
```

---

## Implementation Details

### File Structure

```
apps/mobile/src/
├── services/
│   └── deepLinkHandler.ts       # Main deep link handler (600 lines)
├── screens/
│   ├── LinkNotFoundScreen.tsx   # 404 error screen
│   ├── LinkExpiredScreen.tsx    # 410 error screen
│   └── LinkInvalidScreen.tsx    # Invalid format screen
└── navigation/
    └── AppNavigator.tsx          # Navigation integration
```

### Key Components

#### DeepLinkHandler Class

```typescript
class DeepLinkHandler {
  // Set navigation reference
  setNavigation(nav: NavigationContainerRef): void
  
  // Main handler
  handleDeepLink(url: string, options?: ValidationOptions): Promise<DeepLinkResult>
  
  // Parse URL
  private parseURL(url: string): ParsedDeepLink
  
  // Validate with Zod
  private validateParams<T>(type: DeepLinkType, params): ValidationResult<T>
  
  // Check backend
  private checkResourceExists(type: DeepLinkType, id: string): Promise<{exists, expired}>
  
  // Map to screen
  private mapToScreen(type, params): {screen, params}
  
  // Navigate to error
  navigateToError(error: DeepLinkError, message: string): void
  
  // Generate link
  generateLink(type, id, utmParams?): string
  
  // Initialize listeners
  initialize(): () => void
}
```

---

## Migration Guide

### From Old deepLinking.ts

**Before:**
```typescript
import { handleDeepLink } from '@/utils/deepLinking';

handleDeepLink(url, navigation);
```

**After:**
```typescript
import { deepLinkHandler } from '@/services/deepLinkHandler';

// Setup once
deepLinkHandler.setNavigation(navigationRef.current);

// Handle links
const result = await deepLinkHandler.handleDeepLink(url, {
  checkExists: true
});
```

### Benefits

| Feature | Old | New |
|---------|-----|-----|
| Validation | ❌ None | ✅ Zod schemas |
| Error Screens | ❌ Generic | ✅ Specific (404, 410, invalid) |
| Backend Check | ❌ No | ✅ Optional HEAD requests |
| Type Safety | ⚠️ Partial | ✅ Full TypeScript |
| Link Generation | ⚠️ Manual | ✅ Automated |
| UTM Tracking | ⚠️ Basic | ✅ Complete |

---

## Troubleshooting

### Link not working

1. **Check URL format**: Must match supported patterns
2. **Validate ID format**: Must be valid UUID
3. **Enable logging**: Check console for detailed errors
4. **Test backend**: Verify resource exists with HEAD request

### Error screen not showing

1. **Navigation ref set**: Call `deepLinkHandler.setNavigation()`
2. **Screens registered**: Check AppNavigator has error screens
3. **Error handling**: Verify `navigateToError()` is called

### Backend check failing

1. **API endpoint**: Verify endpoint exists in API
2. **Auth token**: Check `sessionManager.getValidToken()` returns token
3. **Network**: Test with `checkExists: false` to skip

---

## Summary

| Feature | Status |
|---------|--------|
| URL Parsing | ✅ |
| Zod Validation | ✅ |
| Backend Check (404/410) | ✅ |
| Error Screens | ✅ |
| Link Generation | ✅ |
| UTM Tracking | ✅ |
| Type Safety | ✅ |
| Navigation Integration | ✅ |
| Documentation | ✅ |

**🎯 Complete deep link infrastructure ready for production!**
