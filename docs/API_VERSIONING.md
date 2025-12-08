# API Versioning Strategy

## Overview

TravelMatch API uses URL-based versioning starting with `/v1/` to ensure backward compatibility and smooth API evolution.

## Version Structure

```
https://your-project.supabase.co/functions/v1/api/v1/...
                                            ^      ^
                                            |      |
                                    Edge Function  API Version
```

## Current Versions

### Version 1 (v1) - Current
- **Base URL**: `/api/v1/`
- **Status**: Active
- **Release Date**: December 8, 2025
- **EOL Date**: TBD (minimum 12 months from v2 release)

## Endpoint Organization

```
/api/v1/
├── health              # Health check
├── auth/               # Authentication
│   ├── login
│   ├── logout
│   ├── register
│   └── refresh
├── users/              # User management
│   ├── :id
│   ├── :id/profile
│   ├── :id/moments
│   └── :id/stats
├── moments/            # Moments/Posts
│   ├── /
│   ├── :id
│   ├── :id/comments
│   └── :id/likes
├── discover/           # Discovery/Matching
│   ├── feed
│   ├── matches
│   └── swipe
├── trips/              # Travel plans
│   ├── /
│   ├── :id
│   └── :id/participants
├── messages/           # Messaging
│   ├── conversations
│   ├── conversations/:id
│   └── conversations/:id/messages
├── notifications/      # Notifications
│   ├── /
│   ├── :id/read
│   └── settings
├── payments/           # Payments
│   ├── methods
│   ├── transactions
│   └── wallet
└── moderation/         # Reporting & Blocking
    ├── reports
    ├── blocks
    └── safety
```

## Versioning Rules

### When to Create a New Version

Create a new API version when making **breaking changes**:

1. ✅ **Breaking Changes** (require new version):
   - Removing endpoints
   - Removing request/response fields
   - Changing field types
   - Changing authentication requirements
   - Changing error response format
   - Changing HTTP status codes
   - Renaming endpoints

2. ❌ **Non-Breaking Changes** (same version):
   - Adding new endpoints
   - Adding optional request fields
   - Adding response fields
   - Deprecating endpoints (with notice)
   - Bug fixes
   - Performance improvements

### Version Lifecycle

1. **Alpha** (internal testing)
   - URL: `/api/v2-alpha/`
   - Not for production use

2. **Beta** (public testing)
   - URL: `/api/v2-beta/`
   - May have breaking changes
   - Use for testing only

3. **Stable** (production)
   - URL: `/api/v2/`
   - Production ready
   - Breaking changes only in major versions

4. **Deprecated**
   - URL: `/api/v1/` (with deprecation headers)
   - Minimum 12 months support
   - Migration guide provided

5. **Sunset**
   - Endpoint removed
   - Returns 410 Gone status

## Version Headers

### Request Headers

```http
# Optional: Specify API version in header
X-API-Version: v1

# Required: Authentication
Authorization: Bearer <token>

# Optional: Request ID for tracing
X-Request-ID: <uuid>
```

### Response Headers

```http
# Current API version
X-API-Version: v1

# If deprecated
X-API-Deprecated: true
X-API-Deprecation-Date: 2026-01-01
X-API-Sunset-Date: 2026-06-01
X-API-Deprecation-Link: https://docs.example.com/migration-v2

# Rate limiting
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1638360000

# Request tracing
X-Request-ID: <uuid>
X-Response-Time: 123ms
```

## Migration Strategy

### Step 1: Announce Deprecation (T-12 months)

```http
GET /api/v1/moments

Response:
X-API-Deprecated: true
X-API-Deprecation-Date: 2026-01-01
X-API-Sunset-Date: 2026-06-01
X-API-Deprecation-Link: https://docs.travelmatch.com/api/v1-to-v2
```

### Step 2: Parallel Operation (T-6 to T)

Both v1 and v2 available:
- `/api/v1/moments` - Old version (deprecated)
- `/api/v2/moments` - New version (recommended)

### Step 3: Sunset (T)

v1 returns 410 Gone:
```http
HTTP/1.1 410 Gone
X-API-Version: v1
X-API-Sunset: true

{
  "error": {
    "code": "API_VERSION_SUNSET",
    "message": "API v1 has been sunset. Please use /api/v2/",
    "migration_guide": "https://docs.travelmatch.com/api/v1-to-v2"
  }
}
```

## Backward Compatibility

### Field Additions (Non-Breaking)

```typescript
// v1 Response
{
  "id": "123",
  "title": "Coffee in Rome"
}

// v1.1 Response (backward compatible)
{
  "id": "123",
  "title": "Coffee in Rome",
  "category": "coffee",  // New field added
  "created_at": "2025-01-01T00:00:00Z"  // New field added
}
```

### Field Changes (Breaking)

```typescript
// v1 Response
{
  "price": 5.00  // Number
}

// v2 Response (breaking change)
{
  "price": {     // Object (BREAKING)
    "amount": 5.00,
    "currency": "USD"
  }
}
```

## Client Usage

### JavaScript/TypeScript

```typescript
const API_BASE_URL = 'https://your-project.supabase.co/functions/v1/api';
const API_VERSION = 'v1';

class APIClient {
  private baseUrl = `${API_BASE_URL}/${API_VERSION}`;

  async getMoments() {
    const response = await fetch(`${this.baseUrl}/moments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Version': API_VERSION,
      },
    });

    // Check for deprecation
    if (response.headers.get('X-API-Deprecated')) {
      console.warn(
        'API Deprecated:',
        response.headers.get('X-API-Deprecation-Link')
      );
    }

    return response.json();
  }
}
```

### Mobile (React Native)

```typescript
import { API_CONFIG } from '@/config/api';

export const apiClient = {
  baseUrl: `${API_CONFIG.baseUrl}/v1`,

  async request(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${await getToken()}`,
        'X-API-Version': 'v1',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Handle deprecation
    this.checkDeprecation(response);

    return response.json();
  },

  checkDeprecation(response: Response) {
    if (response.headers.get('X-API-Deprecated')) {
      // Log to analytics
      logEvent('api_deprecated_used', {
        version: response.headers.get('X-API-Version'),
        sunset_date: response.headers.get('X-API-Sunset-Date'),
      });
    }
  },
};
```

## Testing Different Versions

```bash
# Test v1
curl -H "Authorization: Bearer $TOKEN" \
     https://your-project.supabase.co/functions/v1/api/v1/moments

# Test v2 (when available)
curl -H "Authorization: Bearer $TOKEN" \
     https://your-project.supabase.co/functions/v1/api/v2/moments

# Test with version header
curl -H "Authorization: Bearer $TOKEN" \
     -H "X-API-Version: v1" \
     https://your-project.supabase.co/functions/v1/api/v1/moments
```

## Documentation

Each API version has separate documentation:

- **v1 Docs**: `https://docs.travelmatch.com/api/v1`
- **v2 Docs** (future): `https://docs.travelmatch.com/api/v2`
- **Migration Guide**: `https://docs.travelmatch.com/api/migration`

## Change Log

### v1.0.0 (December 8, 2025)
- ✅ Initial release
- ✅ Auth endpoints
- ✅ User management
- ✅ Moments CRUD
- ✅ Discovery feed
- ✅ Messaging
- ✅ Notifications
- ✅ Payments
- ✅ Moderation

### v1.1.0 (Planned)
- 🔄 Add materialized view endpoints
- 🔄 Add batch operations
- 🔄 Add webhook support

### v2.0.0 (Planned Q2 2026)
- 🔄 GraphQL support
- 🔄 WebSocket real-time
- 🔄 Improved error responses
- 🔄 Breaking: New authentication flow

## Error Handling

All versions follow the same error format:

```typescript
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {
      // Additional context
    },
    "request_id": "uuid",
    "timestamp": "2025-12-08T00:00:00Z",
    "api_version": "v1"
  }
}
```

## Rate Limiting

Same across all versions:
- **Authenticated**: 1000 requests/hour
- **Unauthenticated**: 100 requests/hour
- **Burst**: 20 requests/second

## Monitoring

Track version usage:

```sql
-- Version usage stats
SELECT 
  headers->>'X-API-Version' as api_version,
  COUNT(*) as request_count,
  AVG(response_time) as avg_response_time
FROM api_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY api_version;

-- Deprecated endpoint usage
SELECT 
  path,
  COUNT(*) as usage_count
FROM api_logs
WHERE headers->>'X-API-Deprecated' = 'true'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY path
ORDER BY usage_count DESC;
```

## Best Practices

1. **Always specify version in URL**: `/api/v1/`
2. **Never rely on default version**: Explicitly set version
3. **Monitor deprecation headers**: Watch for upcoming changes
4. **Test against beta versions**: Early adoption
5. **Update docs**: Keep API docs in sync with version
6. **Communicate changes**: Email users about deprecations
7. **Version SDKs**: Match SDK version with API version
8. **Log version usage**: Track adoption rates

## Support

- **Current version (v1)**: Full support
- **Deprecated versions**: Bug fixes only
- **Sunset versions**: No support (410 Gone)

## References

- [Semantic Versioning](https://semver.org/)
- [API Evolution Best Practices](https://cloud.google.com/apis/design/versioning)
- [HTTP Status Codes](https://httpstatuses.com/)
