# LOVENDO API REFERENCE

**Version:** 1.0 **Base URL:** `https://lovendo.xyz/api` **Date:** 2026-01-28

---

## TABLE OF CONTENTS

1. [Authentication](#1-authentication)
2. [Rate Limiting](#2-rate-limiting)
3. [Error Codes](#3-error-codes)
4. [Moments API](#4-moments-api)
5. [Trust Score API](#5-trust-score-api)
6. [Escrow API](#6-escrow-api)
7. [Creator API](#7-creator-api)
8. [Webhook Endpoints](#8-webhook-endpoints)

---

## 1. AUTHENTICATION

All protected endpoints require Supabase JWT authentication.

### 1.1 Bearer Token

```http
Authorization: Bearer <JWT_TOKEN>
```

### 1.2 Obtaining Tokens

```bash
# Login
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### 1.3 Token Refresh

```bash
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json

{
  "refresh_token": "eyJ..."
}
```

---

## 2. RATE LIMITING

| Endpoint       | Limit | Window   |
| -------------- | ----- | -------- |
| `/api/creator` | 5     | 1 hour   |
| `/api/auth/*`  | 10    | 1 minute |
| `/api/moments` | 60    | 1 minute |
| `/api/trust`   | 30    | 1 minute |

Rate limit headers included in response:

```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1699999999
```

---

## 3. ERROR CODES

| Code | Message           | Description              |
| ---- | ----------------- | ------------------------ |
| 400  | Bad Request       | Invalid request body     |
| 401  | Unauthorized      | Missing or invalid token |
| 403  | Forbidden         | Insufficient permissions |
| 404  | Not Found         | Resource not found       |
| 429  | Too Many Requests | Rate limit exceeded      |
| 500  | Internal Error    | Server error             |

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

---

## 4. MOMENTS API

### 4.1 List Moments

```http
GET /api/moments
```

Query Parameters: | Parameter | Type | Default | Description |
|-----------|------|---------|-------------| | page | number | 1 | Page number | | limit | number |
20 | Items per page | | location | string | - | Filter by city | | sort | string | 'created_at' |
Sort field |

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "title": { "EN": "Title", "TR": "Başlık" },
      "creator_id": "uuid",
      "price": 100,
      "location": "ISTANBUL",
      "status": "active",
      "created_at": "2026-01-28T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### 4.2 Get Moment

```http
GET /api/moments/:id
```

Response:

```json
{
  "id": "uuid",
  "title": { "EN": "Title", "TR": "Başlık" },
  "description": "...",
  "creator": {
    "id": "uuid",
    "username": "creator",
    "trust_score": 75,
    "trust_level": "Voyager"
  },
  "price": 100,
  "location": "ISTANBUL",
  "images": ["url1", "url2"],
  "status": "active",
  "escrow_status": "pending",
  "created_at": "2026-01-28T00:00:00Z"
}
```

### 4.3 Create Moment

```http
POST /api/moments
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "title": { "EN": "Title", "TR": "Başlık" },
  "description": "...",
  "price": 100,
  "location": "ISTANBUL",
  "images": ["base64..."]
}
```

Response: `201 Created`

```json
{
  "id": "uuid",
  "status": "pending_moderation",
  "created_at": "2026-01-28T00:00:00Z"
}
```

### 4.4 Upload Moment Media

```http
POST /api/moments/:id/media
Authorization: Bearer <JWT>
Content-Type: multipart/form-data

file: <binary image>
```

Response: `201 Created`

```json
{
  "url": "https://storage.lovendo.xyz/...",
  "moderation_status": "pending"
}
```

**Note:** Media is private until AI moderation passes.

---

## 5. TRUST SCORE API

### 5.1 Get Trust Score

```http
GET /api/trust/:userId
Authorization: Bearer <JWT>
```

Response:

```json
{
  "user_id": "uuid",
  "total_score": 75,
  "level": "Voyager",
  "level_progress": 65,
  "breakdown": {
    "payment_score": 80,
    "proof_score": 70,
    "trust_notes_score": 60,
    "kyc_score": 100,
    "social_score": 75
  },
  "updated_at": "2026-01-28T00:00:00Z"
}
```

### 5.2 Get Trust Leaderboard

```http
GET /api/trust/leaderboard
```

Query Parameters: | Parameter | Type | Default | Description |
|-----------|------|---------|-------------| | limit | number | 10 | Number of entries | | timeframe
| string | 'all' | 'week', 'month', 'all' |

Response:

```json
{
  "data": [
    {
      "rank": 1,
      "user_id": "uuid",
      "username": "topuser",
      "avatar_url": "...",
      "total_score": 95,
      "level": "Ambassador"
    }
  ],
  "updated_at": "2026-01-28T00:00:00Z"
}
```

---

## 6. ESCROW API

### 6.1 Create Escrow

```http
POST /api/escrow
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "moment_id": "uuid",
  "amount": 100,
  "currency": "USD"
}
```

Response: `201 Created`

```json
{
  "id": "uuid",
  "status": "pending",
  "expires_at": "2026-01-30T00:00:00Z"
}
```

### 6.2 Get Escrow Status

```http
GET /api/escrow/:id
Authorization: Bearer <JWT>
```

Response:

```json
{
  "id": "uuid",
  "moment_id": "uuid",
  "sender_id": "uuid",
  "receiver_id": "uuid",
  "amount": 100,
  "currency": "USD",
  "status": "pending",
  "created_at": "2026-01-28T00:00:00Z",
  "expires_at": "2026-01-30T00:00:00Z",
  "released_at": null,
  "refunded_at": null
}
```

### 6.3 Release Escrow (After Proof)

```http
POST /api/escrow/:id/release
Authorization: Bearer <JWT>

Response: `200 OK`
```

### 6.4 Refund Escrow (Expired)

```http
POST /api/escrow/:id/refund
Authorization: Bearer <JWT>

Response: `200 OK`
```

---

## 7. CREATOR API

### 7.1 Submit Application

```http
POST /api/creator
Content-Type: application/json

{
  "instagram_handle": "username",
  "story": "Tell us about yourself and your moment..."
}
```

Validation:

- `instagram_handle`: 1-30 chars, alphanumeric + underscore
- `story`: 10-500 chars

Response: `201 Created`

```json
{
  "success": true,
  "application_id": "uuid"
}
```

Error Responses:

```json
{
  "error": "Invalid Instagram handle format"
}
```

```json
{
  "error": "Too many requests. Please try again later."
}
```

---

## 8. WEBHOOK ENDPOINTS

### 8.1 PayTR Webhook

```http
POST /api/webhooks/paytr
Content-Type: application/x-www-form-urlencoded

merchant_oid=LV-XXX
status=success
total_amount=100.00
hash=...
```

**Security:** HMAC-SHA256 signature verification required.

### 8.2 RevenueCat Webhook

```http
POST /api/webhooks/revenuecat
Content-Type: application/json

{
  "event": "RENEWAL",
  "app_user_id": "...",
  "product_id": "premium_monthly",
  "expiration_at": "..."
}
```

**Security:** Timing-safe comparison of secret.

### 8.3 Idenfy Webhook

```http
POST /api/webhooks/idenfy
Content-Type: application/json

{
  "user_id": "uuid",
  "status": "verified",
  "document_type": "passport"
}
```

### 8.4 AWS Rekognition Callback

```http
POST /api/webhooks/moderation
Content-Type: application/json

{
  "media_id": "uuid",
  "result": "PASS",
  "labels": ["Safe", "Appropriate"],
  "confidence": 99.5
}
```

**Note:** Failed media triggers human review queue.

---

## QUICK REFERENCE

| Method | Endpoint                | Auth | Description                |
| ------ | ----------------------- | ---- | -------------------------- |
| POST   | /api/creator            | No   | Submit creator application |
| GET    | /api/moments            | Yes  | List moments               |
| POST   | /api/moments            | Yes  | Create moment              |
| GET    | /api/moments/:id        | Yes  | Get moment details         |
| GET    | /api/trust/:userId      | Yes  | Get trust score            |
| POST   | /api/escrow             | Yes  | Create escrow              |
| GET    | /api/escrow/:id         | Yes  | Get escrow status          |
| POST   | /api/escrow/:id/release | Yes  | Release escrow             |
| POST   | /api/escrow/:id/refund  | Yes  | Refund escrow              |

---

**Document Owner:** Backend Lead **Review Cycle:** Quarterly **Next Review:** 2026-04-28
