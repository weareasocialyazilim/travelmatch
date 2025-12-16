# 🔍 Supabase Comprehensive Audit Report
**Date:** 2025-12-17
**Scope:** All Edge Functions, Shared Utilities, Migrations
**Files Reviewed:** 78 total (.ts/.sql files)

---

## 🎯 Executive Summary

**Status:** ⚠️ **CRITICAL ISSUES FOUND**

- **Critical Issues:** 2 (must fix before production)
- **Medium Issues:** 2 (should fix soon)
- **Minor Issues:** 2 (nice to have)
- **Good Practices:** 7 (keep these!)

---

## 🔴 CRITICAL ISSUES (Must Fix)

### 1. Missing Database Table: `proof_verifications`

**Severity:** 🔴 **CRITICAL** - Will cause runtime errors

**Location:** `supabase/functions/verify-proof/index.ts:214-230`

**Issue:**
```typescript
// This code tries to INSERT into proof_verifications table
await supabase
  .from('proof_verifications')
  .insert({
    moment_id: momentId,
    user_id: userId,
    // ... 15 more fields
  });
```

**Problem:**
- No migration creates this table
- Searched all 37 migrations - table does NOT exist
- Will throw database error: `relation "proof_verifications" does not exist`

**Impact:**
- Proof verification feature is BROKEN
- Users cannot verify their travel moments
- AI verification with Claude will fail

**Fix Required:**
Create migration: `supabase/migrations/YYYYMMDD_create_proof_verifications.sql`

```sql
CREATE TABLE IF NOT EXISTS public.proof_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  claimed_location TEXT NOT NULL,
  claimed_date TIMESTAMPTZ,
  ai_verified BOOLEAN NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  ai_reasoning TEXT,
  detected_location TEXT,
  red_flags JSONB,
  status TEXT NOT NULL CHECK (status IN ('verified', 'rejected', 'needs_review')),
  ai_model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_proof_verifications_moment_id ON proof_verifications(moment_id);
CREATE INDEX idx_proof_verifications_user_id ON proof_verifications(user_id);
CREATE INDEX idx_proof_verifications_status ON proof_verifications(status);
```

---

### 2. 9 Functions Using DEPRECATED Rate Limiter

**Severity:** 🔴 **CRITICAL** - Production scalability issue

**Location:** `supabase/functions/_shared/rateLimit.ts` (DEPRECATED)

**Issue:**
File is marked as **DEPRECATED** (line 1-19) but still used by 9 production functions:

1. `auth-login/index.ts`
2. `confirm-payment/index.ts`
3. `create-payment/index.ts`
4. `create-payment-intent/index.ts`
5. `export-user-data/index.ts`
6. `get-user-profile/index.ts`
7. `setup-2fa/index.ts`
8. `transfer-funds/index.ts`
9. `verify-2fa/index.ts`

**Problem:**
- **OLD:** Uses Supabase table `rate_limits` (not distributed, slower)
- **NEW:** Should use Upstash Redis (distributed, production-ready)
- Only `upload-image` has been migrated to new system

**Impact:**
- Rate limiting won't scale across multiple Edge Function instances
- Database table grows indefinitely (needs cleanup cron job)
- Slower response times (DB query vs Redis)

**Migration Required:**
```typescript
// BEFORE (deprecated):
import { createRateLimiter, RateLimitPresets } from '../_shared/rateLimit.ts';
const limiter = createRateLimiter(RateLimitPresets.api);

// AFTER (production-ready):
import { createUpstashRateLimiter, RateLimitPresets } from '../_shared/upstashRateLimit.ts';
const limiter = createUpstashRateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
});
```

**Prerequisites:**
- Set up Upstash Redis: https://console.upstash.com/
- Add environment variables:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`

---

## 🟡 MEDIUM ISSUES (Should Fix Soon)

### 3. Inconsistent Error Handling

**Severity:** 🟡 **MEDIUM** - Code quality and maintainability

**Issue:**
- Standardized `errorHandler.ts` exists with proper error codes
- Only **7 out of 20** functions use it
- **13 functions** manually create error responses (code duplication)

**Functions NOT using errorHandler:**
```
❌ auth-login
❌ confirm-payment
❌ create-payment
❌ create-payment-intent
❌ export-user-data
❌ get-user-profile
❌ setup-2fa
❌ transfer-funds
❌ verify-2fa
❌ verify-proof
❌ geocode
❌ feed-delta
❌ cdn-invalidate
```

**Functions USING errorHandler (good):**
```
✅ upload-image
✅ stripe-webhook
✅ audit-logging
✅ api/v1/index
✅ api/index
✅ get-user-profile (partial)
✅ create-payment-intent (partial)
```

**Impact:**
- Inconsistent error messages to clients
- Harder to maintain error responses
- No standardized HTTP status codes
- Duplicated error handling logic

**Example Fix:**
```typescript
// BEFORE (manual error handling):
return new Response(
  JSON.stringify({ error: 'Missing authorization header' }),
  { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);

// AFTER (standardized):
import { createErrorResponse, toHttpResponse, ErrorCode } from '../_shared/errorHandler.ts';

const error = createErrorResponse({
  code: ErrorCode.UNAUTHORIZED,
  message: 'Missing authorization header',
});
return toHttpResponse(error, corsHeaders, 401);
```

---

### 4. Deprecated CORS Headers Still in Use

**Severity:** 🟡 **MEDIUM** - Inconsistent implementation

**Location:** `supabase/functions/_shared/security-middleware.ts`

**Issue:**
```typescript
// Line 49-55: Deprecated export
/** @deprecated Use getCorsHeaders(origin) instead */
export const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
  // ...
};

// Line 37-47: NEW function (better, origin-aware)
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin', // ← Important for caching
    // ...
  };
}
```

**Problem:**
- Deprecated `corsHeaders` still used in 3 functions within the SAME file:
  - `errorResponse()` (line 237)
  - `successResponse()` (line 248)
  - `handleCors()` (line 257)

**Impact:**
- CORS origin not validated properly
- Potential security issue (allows all origins via `*` in some functions)
- Missing `Vary: Origin` header breaks CDN caching

**Fix:** Update these 3 functions to use `getCorsHeaders(req.headers.get('origin'))`

---

## 🟢 MINOR ISSUES (Nice to Have)

### 5. Variable Ordering in errorHandler.ts

**Severity:** 🟢 **MINOR** - Code clarity

**Location:** `supabase/functions/_shared/errorHandler.ts`

**Issue:**
```typescript
// Line 240: Uses __DEV__
return createErrorResponse(
  __DEV__ ? error.message : 'An unexpected error occurred',
  ErrorCode.INTERNAL_SERVER_ERROR,
  __DEV__ ? { stack: error.stack } : undefined,
);

// Line 273: Defined here (works due to hoisting)
const __DEV__ = Deno.env.get('ENVIRONMENT') === 'development';
```

**Impact:** None (JavaScript hoisting), but could be clearer

**Fix:** Move `const __DEV__` to top of file

---

### 6. Hardcoded CORS Headers in Edge Functions

**Severity:** 🟢 **MINOR** - Code duplication

**Issue:** Many functions hardcode CORS headers instead of importing from `security-middleware.ts`

**Examples:**
```typescript
// create-payment-intent/index.ts (line 21-26)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// verify-proof/index.ts (line 14-17)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

**Impact:**
- Code duplication (harder to update allowed origins)
- Inconsistent CORS configuration across functions
- Security: Some use `*` (allow all), others have specific origins

**Fix:** Import from security-middleware:
```typescript
import { getCorsHeaders } from '../_shared/security-middleware.ts';

// In handler:
const corsHeaders = getCorsHeaders(req.headers.get('origin'));
```

---

## ✅ GOOD PRACTICES FOUND

### 1. ✅ BlurHash Integration (upload-image)
- `upload-image/index.ts` already uses BlurHash correctly
- Generates hash on server-side (line 164-173)
- Stores in database (line 221)
- Returns to client (line 233)

### 2. ✅ Idempotency (stripe-webhook)
- Prevents duplicate webhook processing
- Uses `processed_webhook_events` table
- Checks before processing (line 395)

### 3. ✅ Upstash Rate Limiting (Production-Ready)
- `upstashRateLimit.ts` implements sliding window algorithm
- Distributed across Edge Function instances
- Fails open on error (good UX)

### 4. ✅ Comprehensive Error Codes
- `errorHandler.ts` has 20+ error codes
- Maps to proper HTTP status codes
- Includes validation, auth, payment, external service errors

### 5. ✅ Security Validations
- Amount validation (max value, decimal places)
- UUID validation
- Currency validation (3-letter codes)
- Input sanitization (XSS prevention)

### 6. ✅ Self-Gifting Prevention
- All payment functions check `moment.user_id !== user.id`
- Prevents users from gifting their own moments

### 7. ✅ Audit Logging
- Payment and webhook functions log to `audit_logs` table
- Includes metadata (user_id, amount, payment_intent_id)
- Enables compliance and debugging

---

## 📊 Statistics

### Edge Functions by Category:
- **Payment:** 6 functions (create-payment, create-payment-intent, confirm-payment, transfer-funds, stripe-webhook, stripe-create-intent)
- **Authentication:** 4 functions (auth-login, setup-2fa, verify-2fa, verify-kyc)
- **Media:** 2 functions (upload-image, cdn-invalidate)
- **User Data:** 3 functions (get-user-profile, export-user-data, feed-delta)
- **Verification:** 2 functions (verify-proof, verify-kyc)
- **API Gateway:** 2 functions (api/index, api/v1/index)
- **Utility:** 2 functions (geocode, audit-logging)

### Code Quality Metrics:
- **Using errorHandler:** 7/20 (35%)
- **Using upstashRateLimit:** 1/9 (11%) - 8 need migration
- **Hardcoded CORS:** ~15/20 (75%)
- **Database Queries:** 37 migrations total

---

## 🔧 Recommended Action Plan

### Phase 1: CRITICAL (Do Now)
1. ✅ Create `proof_verifications` table migration
2. ✅ Migrate 9 functions to upstashRateLimit.ts
3. ✅ Test proof verification flow end-to-end
4. ✅ Set up Upstash Redis (add env vars)

### Phase 2: MEDIUM (This Week)
1. Standardize error handling across all 13 functions
2. Update security-middleware.ts internal functions to use getCorsHeaders()
3. Remove hardcoded CORS headers from all functions

### Phase 3: MINOR (Next Sprint)
1. Move `__DEV__` to top of errorHandler.ts
2. Create shared CORS import pattern
3. Add ESLint rule to prevent hardcoded CORS

---

## 📝 Notes

### Database Tables Used (Verified):
✅ `audit_logs` - Created in 20241207000000_payment_security.sql
✅ `cache_invalidation` - Created in 20241207000000_payment_security.sql
✅ `processed_webhook_events` - Created in 20241207000000_payment_security.sql
✅ `rate_limits` - Created in 20251209000013_create_rate_limits.sql
✅ `uploaded_images` - Exists (with BlurHash support)
❌ `proof_verifications` - **MISSING** (needs creation)

### Environment Variables Required:
```bash
# Existing (verified):
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_IMAGES_TOKEN
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
ANTHROPIC_API_KEY

# MISSING (need to add):
UPSTASH_REDIS_REST_URL      # For production rate limiting
UPSTASH_REDIS_REST_TOKEN    # For production rate limiting
```

---

## 🎯 Conclusion

The Supabase infrastructure is **mostly solid** with good security practices, but has **2 critical issues** that will cause production failures:

1. **Missing `proof_verifications` table** - Proof verification is completely broken
2. **Deprecated rate limiter** - Won't scale in production

These must be fixed before production deployment. The medium/minor issues are quality improvements that can be addressed iteratively.

**Overall Grade:** B- (would be A- after fixing critical issues)

---

**Audit Completed By:** Claude Code
**Next Review:** After critical fixes are applied
