# API v1 Endpoints

This document describes all available API v1 endpoints.

## Base URL

```
https://your-project.supabase.co/functions/v1/api
```

## Authentication

Most endpoints require authentication. Include the user's session token in the Authorization header:

```
Authorization: Bearer <session_token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email and password are required"
  }
}
```

## Endpoints

### Health Check

#### `GET /api/v1/health`

Check API health and version.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "v1",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

## Authentication

### Login

#### `POST /api/v1/auth/login`

Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe"
    },
    "session": {
      "access_token": "...",
      "refresh_token": "..."
    }
  },
  "message": "Login successful"
}
```

**Error Codes:**
- `MISSING_REQUIRED_FIELD`: Email or password missing
- `INVALID_CREDENTIALS`: Invalid email/password
- `TOO_MANY_REQUESTS`: Rate limit exceeded

### Logout

#### `POST /api/v1/auth/logout`

Logout current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful"
}
```

---

## Users

### Get User

#### `GET /api/v1/users/:id`

Get user profile by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "bio": "Travel enthusiast",
    "rating": 4.8,
    "verified": true
  }
}
```

**Error Codes:**
- `NOT_FOUND`: User not found

### Get User's Moments

#### `GET /api/v1/users/:id/moments`

Get all active moments created by a user.

**Response:**
```json
{
  "success": true,
  "data": {
    "moments": [
      {
        "id": "uuid",
        "title": "Coffee at Starbucks",
        "description": "...",
        "price": 5.99,
        "category": "food",
        "status": "active",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "count": 1
  }
}
```

---

## Moments

### List Moments

#### `GET /api/v1/moments`

Get paginated list of active moments.

**Query Parameters:**
- `limit` (optional, default: 20): Number of moments per page
- `offset` (optional, default: 0): Pagination offset
- `category` (optional): Filter by category

**Example:**
```
GET /api/v1/moments?limit=10&offset=0&category=food
```

**Response:**
```json
{
  "success": true,
  "data": {
    "moments": [
      {
        "id": "uuid",
        "title": "Coffee at Starbucks",
        "description": "...",
        "price": 5.99,
        "category": "food",
        "created_at": "2024-01-15T10:00:00Z",
        "user": {
          "id": "uuid",
          "full_name": "John Doe",
          "avatar_url": "https://...",
          "verified": true
        }
      }
    ],
    "pagination": {
      "total": 100,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### Get Moment

#### `GET /api/v1/moments/:id`

Get detailed moment information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Coffee at Starbucks",
    "description": "...",
    "price": 5.99,
    "category": "food",
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z",
    "user": {
      "id": "uuid",
      "full_name": "John Doe",
      "avatar_url": "https://...",
      "verified": true,
      "rating": 4.8
    },
    "requests": [{ "count": 5 }],
    "favorites": [{ "count": 12 }]
  }
}
```

**Error Codes:**
- `NOT_FOUND`: Moment not found

---

## Requests

### List Requests

#### `GET /api/v1/requests`

Get requests filtered by query parameters.

**Query Parameters:**
- `moment_id` (optional): Filter by moment ID
- `user_id` (optional): Filter by requester ID
- `status` (optional): Filter by status (pending, accepted, rejected)

**Example:**
```
GET /api/v1/requests?moment_id=uuid&status=pending
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "uuid",
        "message": "I'd love to join!",
        "status": "pending",
        "created_at": "2024-01-15T10:00:00Z",
        "requester": {
          "id": "uuid",
          "full_name": "Jane Smith",
          "avatar_url": "https://...",
          "rating": 4.9,
          "verified": true
        },
        "moment": {
          "id": "uuid",
          "title": "Coffee at Starbucks",
          "price": 5.99,
          "category": "food"
        }
      }
    ],
    "count": 1
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `INVALID_CREDENTIALS` | 401 | Invalid email/password |
| `TOKEN_EXPIRED` | 401 | Session token expired |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INVALID_INPUT` | 400 | Invalid input data |
| `MISSING_REQUIRED_FIELD` | 400 | Required field missing |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `NOT_FOUND` | 404 | Resource not found |
| `ALREADY_EXISTS` | 409 | Resource already exists |
| `CONFLICT` | 409 | Request conflicts with current state |
| `PAYMENT_FAILED` | 400 | Payment processing failed |
| `INTERNAL_SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **General endpoints**: 60 requests per minute per user

When rate limited, you'll receive:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 30 seconds."
  }
}
```

**Headers:**
- `Retry-After`: Seconds until you can retry
- `X-RateLimit-Remaining`: Remaining requests in current window

## Pagination

List endpoints support pagination:

```
GET /api/v1/moments?limit=20&offset=0
```

**Response includes pagination metadata:**
```json
{
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

## CORS

All endpoints support CORS with the following headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
```

## Deployment

To deploy the API v1 endpoint:

```bash
# Deploy the edge function
supabase functions deploy api

# Test the deployment
curl https://your-project.supabase.co/functions/v1/api/v1/health
```

## Migration from Direct Edge Functions

If you're migrating from direct edge function calls to the v1 API:

**Before:**
```typescript
// Direct call to auth-login function
const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-login`, {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
```

**After:**
```typescript
// Call through v1 API
const response = await fetch(`${SUPABASE_URL}/functions/v1/api/v1/auth/login`, {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
```

### Benefits of API v1

1. **Consistent Error Format**: All endpoints use standardized error codes
2. **Versioning**: Easy to add v2 without breaking v1 clients
3. **Centralized Routing**: All endpoints in one place
4. **Better Documentation**: Clear API structure
5. **Optimized Queries**: Built-in N+1 prevention patterns
