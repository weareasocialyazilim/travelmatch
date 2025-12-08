# TravelMatch API Reference

**Complete API documentation with error handling**  
**Version**: 1.0.0  
**Last Updated**: December 8, 2025  
**Base URL**: `https://your-project.supabase.co`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Pagination](#pagination)
4. [Rate Limiting](#rate-limiting)
5. [Error Handling](#error-handling)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Code Examples](#code-examples)
9. [Error Reference](#error-reference)

---

## Overview

TravelMatch API provides access to user profiles, travel moments, gift transactions, and payment processing. The API follows RESTful conventions and uses Supabase as the backend infrastructure.

**Key Features:**
- 🔐 JWT-based authentication
- 📄 Cursor-based pagination for infinite scroll
- ⚡ Real-time subscriptions via Supabase Realtime
- 💳 Secure payment processing via Stripe Edge Functions
- 🛡️ Row Level Security (RLS) for data isolation
- 📊 Rate limiting on sensitive endpoints
- 🌍 i18n error messages (English & Turkish)

---

## Authentication

### Getting Started

All API requests require authentication using JWT tokens from Supabase Auth.

**Authorization Header:**
```http
Authorization: Bearer <YOUR_JWT_TOKEN>
```

**Get JWT Token:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

const token = data.session?.access_token;
```

### Session Management

- **Token Expiry**: 3600 seconds (1 hour)
- **Refresh Token**: Valid for 30 days
- **Auto-refresh**: Client SDK handles automatically

```typescript
// Manual refresh
const { data, error } = await supabase.auth.refreshSession();
```

### Authentication Errors

| Error Code | HTTP Status | Description | Recovery |
|-----------|-------------|-------------|----------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Wrong email/password | Check credentials, use "Forgot Password" |
| `AUTH_SESSION_EXPIRED` | 401 | Session expired | Log in again |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | Email not verified | Check email for verification link |
| `AUTH_ACCOUNT_DISABLED` | 403 | Account disabled | Contact support |
| `AUTH_TOO_MANY_ATTEMPTS` | 429 | Too many login attempts | Wait 5 minutes |

---

## Pagination

### Cursor-Based Pagination

TravelMatch uses **cursor-based pagination** for better performance and consistency, especially for real-time data like feeds and infinite scroll.

#### Why Cursor-Based?

| Feature | Offset-Based | Cursor-Based |
|---------|--------------|--------------|
| **Performance** | ❌ Slow for large offsets (O(n)) | ✅ Constant time (O(1)) |
| **Consistency** | ❌ Items can be duplicated/missed | ✅ Consistent results |
| **Real-time** | ❌ Poor with live data | ✅ Excellent |
| **Infinite Scroll** | ⚠️ Works but inefficient | ✅ Perfect |

#### Standard Pagination Response

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;  // Use this for next page
    prevCursor: string | null;  // Use this for previous page (optional)
    hasMore: boolean;            // True if more items exist
    limit: number;               // Items per page
  };
}
```

#### Making Paginated Requests

**First Page:**
```http
GET /api/moments?limit=20
```

**Next Page:**
```http
GET /api/moments?limit=20&cursor=eyJpZCI6IjEyMyIsImNyZWF0ZWRfYXQiOiIyMDI0LTEyLTA3In0
```

**Response:**
```json
{
  "data": [
    { "id": "uuid", "title": "Coffee in Paris", "..." }
  ],
  "pagination": {
    "nextCursor": "eyJpZCI6IjQ1NiIsImNyZWF0ZWRfYXQiOiIyMDI0LTEyLTA2In0",
    "prevCursor": null,
    "hasMore": true,
    "limit": 20
  }
}
```

#### Client Implementation

```typescript
import { useState } from 'react';

function useCursorPagination<T>(
  fetcher: (cursor?: string) => Promise<PaginatedResponse<T>>
) {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await fetcher(cursor || undefined);
      setItems(prev => [...prev, ...response.data]);
      setCursor(response.pagination.nextCursor);
      setHasMore(response.pagination.hasMore);
    } finally {
      setLoading(false);
    }
  };

  return { items, loadMore, hasMore, loading };
}

// Usage
const { items, loadMore, hasMore, loading } = useCursorPagination(
  (cursor) => fetchMoments({ limit: 20, cursor })
);
```

---

## Rate Limiting

### Global Rate Limits

| Endpoint Type | Limit | Window | Error Code |
|---------------|-------|--------|-----------|
| Read endpoints | 100 requests | 1 minute | `RATE_LIMIT_EXCEEDED` |
| Write endpoints | 30 requests | 1 minute | `RATE_LIMIT_EXCEEDED` |
| Payment endpoints | 10 requests | 1 minute | `RATE_LIMIT_EXCEEDED` |
| Auth endpoints | 5 requests | 5 minutes | `AUTH_TOO_MANY_ATTEMPTS` |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1670400000
```

### Rate Limit Error

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please wait a moment and try again.",
    "retryAfter": 45
  }
}
```

---

## Error Handling

### Standard Error Response

All errors follow this structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### Error Handling Best Practices

```typescript
import { showErrorAlert, withErrorHandling } from '@/utils/friendlyErrorHandler';
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  // Method 1: Try-catch with manual handling
  const handleAction = async () => {
    try {
      await someAsyncOperation();
    } catch (error) {
      showErrorAlert(error, t, {
        onRetry: handleAction,
      });
    }
  };

  // Method 2: Automatic wrapper
  const handleActionAuto = () => {
    withErrorHandling(
      async () => {
        await someAsyncOperation();
      },
      t,
      { onRetry: handleActionAuto }
    );
  };
}
```

### Error Helper Functions

#### `showErrorAlert(error, t, options?)`

Shows localized error alert with retry option.

**Parameters:**
- `error: unknown` - Any error type
- `t: TFunction` - Translation function from `useTranslation()`
- `options?: { onRetry?, onDismiss?, customTitle?, customMessage? }`

#### `withErrorHandling(fn, t, options?)`

Wraps async function with automatic error handling.

**Parameters:**
- `fn: () => Promise<T>` - Async function to execute
- `t: TFunction` - Translation function
- `options?: { onError?, showAlert?, onRetry?, customErrorMessage? }`

**Returns:** `Promise<T | null>`

#### `parseError(error)`

Converts any error to standardized `AppError` format.

---

## API Endpoints

### Profiles

#### Get User Profile

```http
GET /rest/v1/profiles?id=eq.{userId}
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://...",
  "role": "Traveler",
  "kyc_status": "Verified",
  "bio": "Passionate traveler...",
  "location": {
    "lat": 48.8566,
    "lng": 2.3522,
    "city": "Paris",
    "country": "France"
  },
  "trust_score": 95,
  "is_verified": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-12-07T00:00:00Z"
}
```

**RLS Policy:** Users can view any non-deleted profile.

#### Update Profile

```http
PATCH /rest/v1/profiles?id=eq.{userId}
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "name": "Jane Doe",
  "bio": "Updated bio",
  "avatar_url": "https://new-avatar.jpg"
}
```

**RLS Policy:** Users can only update their own profile.

**Possible Errors:**
- `AUTH_SESSION_EXPIRED` (401) - Session expired
- `VALIDATION_REQUIRED_FIELD` (400) - Missing required field
- `PERMISSION_DENIED` (403) - Attempting to update another user's profile

---

### Moments

#### List Moments (Cursor-Based)

```http
GET /api/moments?limit=20&cursor={cursor}
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `limit` (optional): Items per page (default: 20, max: 100)
- `cursor` (optional): Cursor from previous response
- `type` (optional): Filter by type (`coffee`, `ticket`, `dinner`, `other`)
- `status` (optional): Filter by status (`active`, `completed`, `cancelled`)
- `location` (optional): Filter by location (`lat,lng,radius_km`)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Coffee at Café de Flore",
      "description": "Join me for a coffee in Paris",
      "type": "coffee",
      "status": "active",
      "location": {
        "lat": 48.8566,
        "lng": 2.3522,
        "city": "Paris",
        "country": "France"
      },
      "image_url": "https://...",
      "price_amount": 5.50,
      "price_currency": "USD",
      "created_at": "2024-12-07T10:00:00Z"
    }
  ],
  "pagination": {
    "nextCursor": "eyJpZCI6IjEyMyJ9",
    "hasMore": true,
    "limit": 20
  }
}
```

**RLS Policy:** Users can view active moments. Draft moments are only visible to the owner.

#### Create Moment

```http
POST /rest/v1/moments
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "title": "Dinner in Barcelona",
  "description": "Traditional tapas experience",
  "type": "dinner",
  "location": {
    "lat": 41.3851,
    "lng": 2.1734,
    "city": "Barcelona",
    "country": "Spain"
  },
  "image_url": "https://...",
  "price_amount": 25.00,
  "price_currency": "EUR"
}
```

**Validation:**
- `title`: Min 5 characters (`VALIDATION_REQUIRED_FIELD`)
- `price_amount`: Must be positive (`VALIDATION_INVALID_AMOUNT`)
- `type`: Must be one of: `coffee`, `ticket`, `dinner`, `other`

**Possible Errors:**
- `VALIDATION_REQUIRED_FIELD` (400) - Missing required field
- `VALIDATION_INVALID_AMOUNT` (400) - Invalid price
- `UPLOAD_FILE_TOO_LARGE` (400) - Image too large (max 5MB)

---

### Transactions

#### List Transactions (Cursor-Based)

```http
GET /api/transactions?limit=20&cursor={cursor}
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `limit`: Items per page
- `cursor`: Pagination cursor
- `type`: Filter by type (`gift`, `withdrawal`, `refund`, `deposit`)
- `status`: Filter by status (`pending`, `completed`, `failed`)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "receiver_id": "uuid",
      "moment_id": "uuid",
      "type": "gift",
      "status": "completed",
      "amount": 10.00,
      "currency": "USD",
      "created_at": "2024-12-07T12:00:00Z",
      "completed_at": "2024-12-07T12:01:00Z"
    }
  ],
  "pagination": {
    "nextCursor": "eyJpZCI6IjQ1NiJ9",
    "hasMore": true,
    "limit": 20
  }
}
```

**RLS Policy:** Users can only see transactions where they are sender OR receiver.

---

### Proofs

#### Submit Proof

```http
POST /rest/v1/proofs
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "moment_id": "uuid",
  "type": "photo",
  "media_urls": ["https://image1.jpg", "https://image2.jpg"],
  "description": "Had an amazing coffee!",
  "location": {
    "lat": 48.8566,
    "lng": 2.3522
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "moment_id": "uuid",
  "user_id": "uuid",
  "type": "photo",
  "status": "pending",
  "media_urls": ["https://..."],
  "description": "Had an amazing coffee!",
  "ai_score": null,
  "community_score": null,
  "verified_at": null,
  "created_at": "2024-12-07T13:00:00Z"
}
```

**Proof Verification Flow:**
1. User submits proof → `status: "pending"`
2. AI analyzes proof → `ai_score` calculated (0-100)
3. Community votes (optional) → `community_score` calculated
4. Admin approves → `status: "verified"`, `verified_at` set

**Possible Errors:**
- `UPLOAD_FILE_TOO_LARGE` (400) - Image exceeds 5MB
- `UPLOAD_INVALID_FORMAT` (400) - Invalid file format
- `RESOURCE_NOT_FOUND` (404) - Moment not found
- `PERMISSION_LOCATION_DENIED` (403) - Location access required

---

### Payments (Edge Functions)

#### Create Payment Intent

```http
POST /functions/v1/create-payment-intent
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "momentId": "uuid",
  "amount": 1050,
  "currency": "USD",
  "paymentMethodId": "pm_xxx",
  "description": "Gift for Coffee in Paris"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 1050,
  "currency": "usd",
  "status": "requires_confirmation"
}
```

**Rate Limit**: 10 requests/minute per user

**Possible Errors:**
- `PAYMENT_CARD_DECLINED` (402) - Card declined
- `PAYMENT_INSUFFICIENT_FUNDS` (402) - Insufficient funds
- `PAYMENT_INVALID_CARD` (400) - Invalid card details
- `PAYMENT_PROCESSING_ERROR` (500) - Processing error

---

## Database Schema

### Core Tables

#### Profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('Traveler', 'Local', 'Admin')),
  kyc_status TEXT DEFAULT 'Unverified',
  bio TEXT,
  location JSONB,
  trust_score INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### Moments

```sql
CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 5),
  description TEXT,
  type TEXT CHECK (type IN ('coffee', 'ticket', 'dinner', 'other')),
  status TEXT DEFAULT 'active',
  location JSONB,
  image_url TEXT,
  price_amount NUMERIC CHECK (price_amount > 0),
  price_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Index (CRITICAL for cursor pagination)
CREATE INDEX idx_moments_created_at_id 
  ON moments (created_at DESC, id DESC);

-- RLS Policies
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active moments are viewable by everyone"
  ON moments FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can view own drafts"
  ON moments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own moments"
  ON moments FOR UPDATE
  USING (auth.uid() = user_id);
```

#### Transactions

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  moment_id UUID REFERENCES moments(id),
  proof_id UUID REFERENCES proofs(id),
  type TEXT CHECK (type IN ('gift', 'withdrawal', 'refund', 'deposit')),
  status TEXT DEFAULT 'pending',
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
```

#### Proofs

```sql
CREATE TABLE proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moment_id UUID REFERENCES moments(id),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  media_urls TEXT[],
  description TEXT,
  location JSONB,
  ai_score NUMERIC,
  community_score NUMERIC,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view proofs for moments they're involved in"
  ON proofs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM moments
      WHERE moments.id = proofs.moment_id
      AND (moments.user_id = auth.uid() OR proofs.user_id = auth.uid())
    )
  );
```

---

## Code Examples

### Fetch Moments with Infinite Scroll

```typescript
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { showErrorAlert } from '@/utils/friendlyErrorHandler';
import { useTranslation } from 'react-i18next';

interface Moment {
  id: string;
  title: string;
  description: string;
  price_amount: number;
  created_at: string;
}

function MomentsFeed() {
  const { t } = useTranslation();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMoments = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const limit = 20;
      let query = supabase
        .from('moments')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit + 1);

      // Apply cursor
      if (cursor) {
        const decoded = JSON.parse(atob(cursor));
        query = query.or(
          `created_at.lt.${decoded.created_at},and(created_at.eq.${decoded.created_at},id.lt.${decoded.id})`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      const hasMoreItems = data.length > limit;
      const items = hasMoreItems ? data.slice(0, limit) : data;

      setMoments(prev => [...prev, ...items]);
      setHasMore(hasMoreItems);

      if (hasMoreItems && items.length > 0) {
        const lastItem = items[items.length - 1];
        setCursor(btoa(JSON.stringify({
          id: lastItem.id,
          created_at: lastItem.created_at
        })));
      }
    } catch (error) {
      showErrorAlert(error, t, {
        onRetry: loadMoments,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoments();
  }, []);

  return (
    <div>
      {moments.map(moment => (
        <MomentCard key={moment.id} moment={moment} />
      ))}
      {hasMore && (
        <button onClick={loadMoments} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

### Create Payment with Error Handling

```typescript
import { showErrorAlert, withErrorHandling } from '@/utils/friendlyErrorHandler';
import { useTranslation } from 'react-i18next';

async function handlePayment(momentId: string, amount: number) {
  const { t } = useTranslation();

  const result = await withErrorHandling(
    async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            momentId,
            amount,
            currency: 'USD',
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment failed');
      }

      const { clientSecret } = await response.json();
      
      // Use Stripe to confirm payment
      const { error } = await stripe.confirmCardPayment(clientSecret);
      
      if (error) {
        throw error;
      }

      return { success: true };
    },
    t,
    {
      onRetry: () => handlePayment(momentId, amount),
      showAlert: true,
    }
  );

  if (result?.success) {
    alert('Payment successful!');
  }
}
```

### Real-time Subscriptions

```typescript
import { useEffect } from 'react';

function useMomentsSubscription() {
  const [moments, setMoments] = useState<Moment[]>([]);

  useEffect(() => {
    // Subscribe to new moments
    const subscription = supabase
      .channel('moments-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'moments',
          filter: 'status=eq.active',
        },
        (payload) => {
          console.log('New moment:', payload.new);
          setMoments(prev => [payload.new as Moment, ...prev]);
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return moments;
}
```

---

## Error Reference

### Complete Error Codes

#### Network Errors

| Code | HTTP | User Message | Retryable |
|------|------|--------------|-----------|
| `NETWORK_ERROR` | - | "Unable to connect. Please check your internet connection." | ✅ |
| `TIMEOUT` | 408 | "The request took too long. Please try again." | ✅ |
| `NO_INTERNET` | - | "No internet connection. Please check your WiFi or mobile data." | ✅ |

#### Authentication Errors

| Code | HTTP | User Message | Retryable |
|------|------|--------------|-----------|
| `AUTH_INVALID_CREDENTIALS` | 401 | "Incorrect email or password. Please try again." | ❌ |
| `AUTH_SESSION_EXPIRED` | 401 | "Your session has expired. Please log in again." | ❌ |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | "Please verify your email address to continue." | ❌ |
| `AUTH_ACCOUNT_DISABLED` | 403 | "Your account has been disabled. Please contact support." | ❌ |
| `AUTH_TOO_MANY_ATTEMPTS` | 429 | "Too many login attempts. Please try again in a few minutes." | ✅ |

#### Validation Errors

| Code | HTTP | User Message | Retryable |
|------|------|--------------|-----------|
| `VALIDATION_REQUIRED_FIELD` | 400 | "This field is required." | ❌ |
| `VALIDATION_INVALID_EMAIL` | 400 | "Please enter a valid email address." | ❌ |
| `VALIDATION_INVALID_PHONE` | 400 | "Please enter a valid phone number." | ❌ |
| `VALIDATION_PASSWORD_TOO_SHORT` | 400 | "Password must be at least 8 characters." | ❌ |
| `VALIDATION_PASSWORDS_DONT_MATCH` | 400 | "Passwords do not match." | ❌ |
| `VALIDATION_INVALID_AMOUNT` | 400 | "Invalid amount. Must be positive." | ❌ |

#### Payment Errors

| Code | HTTP | User Message | Retryable |
|------|------|--------------|-----------|
| `PAYMENT_FAILED` | 402 | "Payment failed. Please try again or use a different card." | ✅ |
| `PAYMENT_CARD_DECLINED` | 402 | "Your card was declined. Please check your card details." | ❌ |
| `PAYMENT_INSUFFICIENT_FUNDS` | 402 | "Insufficient funds. Please add money to your account." | ❌ |
| `PAYMENT_INVALID_CARD` | 400 | "Invalid card details. Please check and try again." | ❌ |
| `PAYMENT_PROCESSING_ERROR` | 500 | "We couldn't process your payment. Please try again." | ✅ |

#### Upload Errors

| Code | HTTP | User Message | Retryable |
|------|------|--------------|-----------|
| `UPLOAD_FILE_TOO_LARGE` | 400 | "File is too large. Maximum size is 5MB." | ❌ |
| `UPLOAD_INVALID_FORMAT` | 400 | "Invalid file format. Please upload JPG, PNG, or HEIC." | ❌ |
| `UPLOAD_FAILED` | 500 | "Upload failed. Please try again." | ✅ |
| `UPLOAD_QUOTA_EXCEEDED` | 400 | "Storage limit reached. Please delete some files first." | ❌ |

#### Permission Errors

| Code | HTTP | User Message | Retryable |
|------|------|--------------|-----------|
| `PERMISSION_CAMERA_DENIED` | 403 | "Camera access is required. Please enable it in Settings." | ❌ |
| `PERMISSION_LOCATION_DENIED` | 403 | "Location access is required for this feature." | ❌ |
| `PERMISSION_STORAGE_DENIED` | 403 | "Storage access is required to save photos." | ❌ |
| `PERMISSION_NOTIFICATIONS_DENIED` | 403 | "Enable notifications to stay updated." | ❌ |

#### Resource Errors

| Code | HTTP | User Message | Retryable |
|------|------|--------------|-----------|
| `RESOURCE_NOT_FOUND` | 404 | "The requested item could not be found." | ❌ |
| `RESOURCE_ALREADY_EXISTS` | 409 | "This item already exists." | ❌ |
| `RESOURCE_DELETED` | 410 | "This item has been deleted." | ❌ |

#### Server Errors

| Code | HTTP | User Message | Retryable |
|------|------|--------------|-----------|
| `SERVER_ERROR` | 500 | "Something went wrong on our end. Please try again later." | ✅ |
| `SERVICE_UNAVAILABLE` | 503 | "Service is temporarily unavailable. Please try again in a few minutes." | ✅ |
| `MAINTENANCE_MODE` | 503 | "We're currently doing maintenance. We'll be back soon!" | ✅ |
| `RATE_LIMIT_EXCEEDED` | 429 | "Too many requests. Please wait a moment and try again." | ✅ |

---

## Additional Resources

- **[Getting Started](./GETTING_STARTED.md)** - Complete setup guide
- **[Environment Variables](./ENVIRONMENT_VARIABLES.md)** - Configuration guide
- **[Quality Improvements](./QUALITY_IMPROVEMENTS.md)** - Testing & CI/CD
- **[Supabase Docs](https://supabase.com/docs)** - Official Supabase documentation
- **[Stripe API](https://stripe.com/docs/api)** - Stripe payment API reference

---

**Need Help?** Check GitHub Issues or contact the engineering team.
