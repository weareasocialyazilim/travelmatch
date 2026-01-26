# Lovendo API Documentation

**Version:** 1.0.0
**Base URL:** `https://bjikxgtbptrvawkguypv.supabase.co`

> This document covers the public API endpoints. All endpoints require authentication via Supabase session unless noted.

## Authentication

All authenticated requests require:
- `Authorization: Bearer <access_token>`
- Or session cookie (browser)

### Auth Endpoints

#### POST /auth/v1/token?grant_type=password
Exchange email/password for access token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

#### POST /auth/v1/signup
Register new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "data": {
    "full_name": "John Doe"
  }
}
```

---

## Users

### GET /rest/v1/users
List users (admin only).

### GET /rest/v1/users?id=eq.{id}
Get user by ID.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "kyc_status": "verified",
  "created_at": "2026-01-01T00:00:00Z"
}
```

### PATCH /rest/v1/users?id=eq.{id}
Update user profile.

**Request:**
```json
{
  "full_name": "John Doe",
  "bio": "Hello!",
  "location": "Istanbul"
}
```

---

## Moments

### GET /rest/v1/moments
List available moments.

**Query Parameters:**
- `city_id` - Filter by city
- `experience_type_id` - Filter by experience type
- `status` - Filter by status (active, completed)
- `limit` - Max results (default 20)
- `offset` - Pagination offset

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Coffee Tasting",
      "description": "Amazing coffee experience",
      "city": "Istanbul",
      "price": 50,
      "currency": "USD",
      "max_contributors": 10,
      "current_contributor_count": 5,
      "host": {
        "id": "uuid",
        "full_name": "John",
        "avatar_url": "https://..."
      }
    }
  ],
  "count": 100
}
```

### POST /rest/v1/moments
Create new moment.

**Request:**
```json
{
  "title": "Coffee Tasting",
  "description": "Amazing coffee experience",
  "city_id": "uuid",
  "experience_type_id": "uuid",
  "price": 50,
  "currency": "USD",
  "scheduled_start_at": "2026-02-01T10:00:00Z",
  "max_contributors": 10
}
```

### GET /rest/v1/moments?id=eq.{id}
Get moment details.

### PATCH /rest/v1/moments?id=eq.{id}
Update moment (owner only).

---

## Claims

### POST /rest/v1/claims
Submit claim for a moment.

**Request:**
```json
{
  "moment_id": "uuid",
  "message": "I'd love to join this moment!"
}
```

### GET /rest/v1/claims
List user's claims.

---

## Proofs

### POST /rest/v1/proofs
Submit proof of experience.

**Request:**
```json
{
  "claim_id": "uuid",
  "description": "Great coffee and conversation",
  "assets": ["asset_id_1", "asset_id_2"]
}
```

### GET /rest/v1/proofs
List user's proofs.

---

## Wallets & Coins

### GET /rest/v1/wallets
Get user's wallet balance.

**Response:**
```json
{
  "coins_balance": 150,
  "pending_balance": 0,
  "currency": "USD"
}
```

### GET /rest/v1/coin_transactions
List coin transactions.

---

## Edge Functions

### POST /functions/v1/revenuecat-webhook
Handle RevenueCat subscription events.

**Headers:**
- `X-Webhook-Signature`: HMAC signature

**Events:**
- `INITIAL_PURCHASE`
- `RENEWAL`
- `CANCELLATION`

### POST /functions/v1/idenfy-webhook
Handle KYC verification results.

### POST /functions/v1/paytr-withdraw
Process withdrawal to bank account.

**Requires:**
- `PAYTR_MERCHANT_ID`
- `PAYTR_MERCHANT_KEY`
- `PAYTR_MERCHANT_SALT`

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "error_code",
  "message": "Human readable message",
  "status": 400
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `unauthorized` | 401 | Invalid or missing auth |
| `forbidden` | 403 | Insufficient permissions |
| `not_found` | 404 | Resource not found |
| `validation_failed` | 422 | Invalid input |
| `too_many_requests` | 429 | Rate limited |

---

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| API (read) | 1000 | minute |
| API (write) | 100 | minute |
| Auth | 10 | minute |

---

## Versioning

API version is determined by the Supabase project. Breaking changes will be communicated 30 days in advance.

---

**Last Updated:** 2026-01-26
**Contact:** api-support@lovendo.com
