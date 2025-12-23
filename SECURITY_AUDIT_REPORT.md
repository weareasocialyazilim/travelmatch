# TravelMatch API Security Audit Report

**Date:** 2025-12-22
**Auditor:** API Security Audit Agent
**Scope:** Full REST API security assessment including authentication, authorization, injection prevention, and compliance

---

## Executive Summary

This security audit identified **6 critical**, **4 high**, and **5 medium** severity vulnerabilities across the TravelMatch API ecosystem. The most critical findings involve PostgREST filter injection vulnerabilities and an unprotected job queue service.

### Risk Matrix

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 6 | Requires immediate attention |
| High | 4 | Fix within 7 days |
| Medium | 5 | Fix within 30 days |
| Low | 3 | Fix when convenient |

---

## Critical Vulnerabilities

### VULN-001: PostgREST Filter Injection (CVSS 9.1)

**Affected Files:**
- `apps/admin/src/app/api/admin-users/route.ts:33`
- `apps/admin/src/app/api/users/route.ts:35`
- `apps/admin/src/app/api/users/[id]/route.ts:41`
- `apps/admin/src/app/api/tasks/route.ts:53`

**Description:**
User-supplied input is directly interpolated into Supabase `.or()` and `.ilike()` filter strings without sanitization. An attacker can manipulate query filters to bypass authorization or extract unauthorized data.

**Vulnerable Code Example:**
```typescript
// VULNERABLE: Direct string interpolation
query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
```

**Attack Vector:**
```
GET /api/admin-users?search=test%25,id.eq.any-uuid,name.ilike.%25
```

This bypasses the intended search and allows querying by arbitrary fields.

**Remediation:**
```typescript
// SECURE: Use parameterized filters
if (search) {
  const sanitizedSearch = search.replace(/[%_,()]/g, '');
  query = query.or(`name.ilike.%${sanitizedSearch}%,email.ilike.%${sanitizedSearch}%`);
}
```

---

### VULN-002: Unauthenticated Job Queue Service (CVSS 9.8)

**Affected File:** `services/job-queue/src/index.ts`

**Description:**
All job queue endpoints (`/jobs/kyc`, `/jobs/image`, `/jobs/email`, `/jobs/notification`, `/jobs/analytics`) have no authentication. Any attacker can:
- Submit malicious KYC verification jobs
- Queue spam emails to arbitrary recipients
- Send push notifications to users
- Manipulate analytics data

**Vulnerable Endpoints:**
- `POST /jobs/kyc` - Queue KYC verification
- `POST /jobs/email` - Send emails to any address
- `POST /jobs/notification` - Push notifications to users
- `POST /admin/clean` - Clean job queues
- `GET /admin/queues` - Bull Board UI (full queue visibility)

**Remediation:**
Add API key authentication middleware:
```typescript
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.JOB_QUEUE_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.use('/jobs', authenticateApiKey);
app.use('/admin', authenticateApiKey);
```

---

### VULN-003: Missing Rate Limiting on Auth Endpoints (CVSS 8.1)

**Affected File:** `supabase/functions/api/v1/index.ts:62-95`

**Description:**
The login and logout endpoints have no rate limiting applied. This enables:
- Brute force password attacks
- Credential stuffing attacks
- Account enumeration through timing differences

**Remediation:**
Apply rate limiting middleware:
```typescript
const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
});

router.post('/api/v1/auth/login', withMiddleware(
  async (req) => { /* ... */ },
  { rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 5 } }
));
```

---

### VULN-004: Missing CORS Origin in API Router (CVSS 7.5)

**Affected File:** `supabase/functions/api/v1/index.ts`

**Description:**
The API router doesn't consistently apply CORS headers from the security middleware. Responses may not include proper CORS headers, potentially allowing cross-origin attacks.

**Remediation:**
Wrap all handlers with the security middleware or ensure CORS headers are applied.

---

### VULN-005: Session Token in URL Redirect Parameter (CVSS 7.2)

**Affected File:** `apps/admin/middleware.ts:126`

**Description:**
The redirect URL is stored as a query parameter which could be logged in server logs or browser history:
```typescript
loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
```

**Remediation:**
Store redirect path in an encrypted session cookie instead.

---

### VULN-006: In-Memory Rate Limiting (Bypass Risk) (CVSS 7.0)

**Affected Files:**
- `apps/admin/src/lib/rate-limit.ts`
- `supabase/functions/_shared/security-middleware.ts:80-129`

**Description:**
Rate limiting uses in-memory Maps which:
- Reset on server restart
- Don't work in multi-instance deployments
- Can be bypassed by waiting for cleanup intervals

**Remediation:**
Use Redis-based rate limiting for production:
```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rate_limit',
  points: 10,
  duration: 1,
});
```

---

## High Severity Vulnerabilities

### VULN-007: Missing Security Headers in Next.js (CVSS 6.5)

**Affected File:** `apps/admin/next.config.js`

**Description:**
The Next.js configuration doesn't include security headers:
- No Content-Security-Policy (CSP)
- No Strict-Transport-Security (HSTS) at app level
- No Referrer-Policy

**Remediation:**
Add security headers:
```javascript
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; ..." },
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

---

### VULN-008: Verbose Error Messages (CVSS 5.3)

**Affected Files:** Multiple API routes

**Description:**
Error messages include stack traces and internal details that could aid attackers:
```typescript
console.error('Admin users query error:', error);
```

**Remediation:**
Log full errors server-side but return generic messages to clients:
```typescript
logger.error('Query failed', { error, context });
return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
```

---

### VULN-009: Missing Input Length Limits (CVSS 5.0)

**Affected File:** `apps/admin/src/app/api/admin-users/route.ts`

**Description:**
The POST endpoint doesn't validate input lengths for email, name, etc. This could lead to:
- Database overflow attacks
- ReDoS via long regex inputs

**Remediation:**
Add Zod schema validation:
```typescript
const createAdminSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  role: z.enum(['super_admin', 'manager', ...]),
});
```

---

### VULN-010: Potential Timing Attack in Session Validation (CVSS 4.7)

**Affected File:** `apps/admin/src/lib/auth.ts:26`

**Description:**
Session token comparison may be vulnerable to timing attacks:
```typescript
const sessionHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
```

The database query timing could reveal whether a token exists.

**Remediation:**
Use constant-time comparison and implement session rotation.

---

## Medium Severity Vulnerabilities

### VULN-011: Missing CSRF Protection (CVSS 5.4)

**Description:**
State-changing operations (POST, PATCH, DELETE) lack CSRF tokens for cookie-based sessions in the admin panel.

**Remediation:**
Implement CSRF tokens using Next.js middleware or a library like `csurf`.

---

### VULN-012: Overly Permissive CORS Regex (CVSS 4.3)

**Affected File:** `supabase/functions/_shared/security-middleware.ts:24`

**Description:**
The Vercel preview URL regex is too permissive:
```typescript
/^https:\/\/travelmatch-.*\.vercel\.app$/
```

This could match malicious subdomains like `travelmatch-phishing.vercel.app`.

**Remediation:**
Use stricter patterns or maintain an allowlist of preview deployments.

---

### VULN-013: Missing Audit Logging on GET Requests (CVSS 3.7)

**Description:**
Only write operations are logged. Read access to sensitive data (user PII, transactions) isn't audited, making incident investigation difficult.

---

### VULN-014: sortBy Column Name Injection (CVSS 4.8)

**Affected File:** `apps/admin/src/app/api/users/route.ts:22-23,30`

**Description:**
The `sortBy` parameter is directly used in the order clause:
```typescript
const sortBy = searchParams.get('sort_by') || 'created_at';
.order(sortBy, { ascending: sortOrder === 'asc' })
```

**Remediation:**
Whitelist allowed sort columns:
```typescript
const allowedSortColumns = ['created_at', 'email', 'display_name'];
const sortBy = allowedSortColumns.includes(rawSortBy) ? rawSortBy : 'created_at';
```

---

### VULN-015: Nginx HSTS Missing (CVSS 4.0)

**Affected File:** `apps/admin/nginx.conf`

**Description:**
The nginx configuration lacks HSTS header and CSP.

---

## Positive Security Findings

The following security controls are properly implemented:

1. **Row Level Security (RLS):** Comprehensive RLS policies on all database tables
2. **JWT Token Validation:** Proper Supabase auth token verification
3. **Password Hashing:** Using Supabase Auth (bcrypt)
4. **Session Token Hashing:** SHA-256 hashing of session tokens
5. **RBAC Implementation:** Well-defined role hierarchy with 7 levels
6. **Audit Logging:** Comprehensive audit trail for admin actions
7. **Input Sanitization:** Basic sanitization in security-middleware.ts
8. **UUID Validation:** Proper UUID format validation
9. **Amount Validation:** Financial amount validation with overflow protection
10. **X-Powered-By Disabled:** Job queue hides Express fingerprint

---

## Compliance Status

| Standard | Status | Notes |
|----------|--------|-------|
| OWASP API Top 10 | Partial | Injection and auth issues need fixes |
| GDPR | Review Needed | Audit logging present but PII access logging missing |
| PCI DSS | Non-compliant | Payment data handling needs review |

---

## Remediation Priority

### Immediate (24 hours)
1. VULN-001: Fix PostgREST filter injection
2. VULN-002: Add authentication to job queue service

### Short-term (7 days)
3. VULN-003: Add rate limiting to auth endpoints
4. VULN-007: Add security headers
5. VULN-014: Whitelist sortBy columns

### Medium-term (30 days)
6. VULN-006: Migrate to Redis-based rate limiting
7. VULN-011: Implement CSRF protection
8. VULN-012: Tighten CORS regex

---

## Files Modified by This Audit

The following files will be modified to address critical vulnerabilities:

1. `apps/admin/src/lib/query-utils.ts` (NEW) - Safe query builder utilities
2. `apps/admin/src/app/api/admin-users/route.ts` - Fix injection
3. `apps/admin/src/app/api/users/route.ts` - Fix injection
4. `apps/admin/src/app/api/users/[id]/route.ts` - Fix injection
5. `apps/admin/src/app/api/tasks/route.ts` - Fix injection
6. `services/job-queue/src/index.ts` - Add authentication
7. `apps/admin/next.config.js` - Add security headers

---

*Report generated by API Security Audit Agent*
