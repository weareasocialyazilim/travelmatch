# Lovendo Architecture Documentation

> **Version**: 1.0.0 **Last Updated**: December 2024 **Status**: Production Ready (90% Complete)

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Principles](#architecture-principles)
4. [C4 Model Overview](#c4-model-overview)
5. [Technology Stack](#technology-stack)
6. [Deployment Architecture](#deployment-architecture)
7. [Data Architecture](#data-architecture)
8. [Security Architecture](#security-architecture)
9. [Integration Patterns](#integration-patterns)
10. [Quality Attributes](#quality-attributes)
11. [Related Documentation](#related-documentation)

---

## Executive Summary

Lovendo is a social travel platform that connects travelers through shared experiences and gift
exchanges. The platform enables users to create and join "moments" - unique travel experiences - and
facilitates secure peer-to-peer transactions.

### Key Business Capabilities

- **Moment Discovery**: Browse and search travel experiences by location, category, and interests
- **Social Connections**: Connect with travelers, send messages, and build relationships
- **Secure Payments**: Handle deposits, payments, and refunds through integrated payment processing
- **Trust & Safety**: KYC verification, user reviews, and content moderation
- **Real-time Communication**: Instant messaging between travelers

### Architecture Highlights

| Aspect                 | Decision                                                |
| ---------------------- | ------------------------------------------------------- |
| **Architecture Style** | Monorepo with modular backend (Supabase Edge Functions) |
| **Frontend**           | React Native (Mobile), Next.js (Web), React (Admin)     |
| **Backend**            | Supabase (PostgreSQL + Edge Functions)                  |
| **State Management**   | Zustand (client-side)                                   |
| **API Pattern**        | REST via PostgREST                                      |
| **Real-time**          | Supabase Realtime (WebSocket)                           |
| **Infrastructure**     | Docker Compose (dev), Cloud-native (prod)               |

---

## System Overview

```
                                    Lovendo Platform
    ┌──────────────────────────────────────────────────────────────────────────┐
    │                                                                          │
    │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
    │   │   Mobile    │    │     Web     │    │    Admin    │    FRONTENDS    │
    │   │  (Expo/RN)  │    │  (Next.js)  │    │   (React)   │                 │
    │   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                 │
    │          │                  │                  │                         │
    │          └──────────────────┼──────────────────┘                         │
    │                             │                                            │
    │                             ▼                                            │
    │   ┌─────────────────────────────────────────────────────────────────┐   │
    │   │                     API Gateway (Kong)                          │   │
    │   │         Authentication • Rate Limiting • CORS • Routing         │   │
    │   └─────────────────────────────────────────────────────────────────┘   │
    │                             │                                            │
    │          ┌──────────────────┼──────────────────┐                         │
    │          │                  │                  │                         │
    │          ▼                  ▼                  ▼                         │
    │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
    │   │  PostgREST  │    │   GoTrue    │    │  Realtime   │    SUPABASE    │
    │   │  (REST API) │    │   (Auth)    │    │ (WebSocket) │    SERVICES    │
    │   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                 │
    │          │                  │                  │                         │
    │          └──────────────────┼──────────────────┘                         │
    │                             │                                            │
    │                             ▼                                            │
    │   ┌─────────────────────────────────────────────────────────────────┐   │
    │   │                   PostgreSQL Database                           │   │
    │   │      RLS Policies • PostGIS • Triggers • Functions              │   │
    │   └─────────────────────────────────────────────────────────────────┘   │
    │                                                                          │
    │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
    │   │   Storage   │    │    Redis    │    │  Job Queue  │    SUPPORT     │
    │   │  (S3/Minio) │    │   (Cache)   │    │  (BullMQ)   │    SERVICES    │
    │   └─────────────┘    └─────────────┘    └─────────────┘                 │
    │                                                                          │
    └──────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Principles

### 1. Monorepo with Shared Packages

All applications and packages live in a single repository managed by **Turborepo**, enabling:

- Shared TypeScript types across all applications
- Unified design system and UI components
- Consistent build and test pipelines
- Atomic commits across multiple packages

### 2. Backend-as-a-Service First

We leverage **Supabase** as our primary backend to:

- Reduce operational complexity
- Leverage built-in authentication, storage, and real-time capabilities
- Use PostgreSQL with Row Level Security for data access control
- Deploy serverless Edge Functions for custom business logic

### 3. Mobile-First Design

The mobile application is the primary user interface:

- React Native + Expo for cross-platform development
- Offline-first patterns with optimistic updates
- Performance-optimized with lazy loading and image optimization
- Accessibility (WCAG 2.1 AA) built into all components

### 4. Security by Default

- Row Level Security (RLS) on all database tables
- JWT-based authentication with refresh token rotation
- API rate limiting and request validation
- GDPR-compliant data handling with auto-redaction

### 5. Observability

- Sentry for error tracking and performance monitoring
- Structured logging with sensitive data redaction
- Health checks on all services
- Grafana dashboards for metrics visualization

---

## C4 Model Overview

This section provides a summary of the C4 model diagrams. For detailed diagrams, see
[C4_MODEL.md](./C4_MODEL.md).

### Level 1: System Context

Lovendo interacts with the following external systems:

| External System                | Description                | Integration |
| ------------------------------ | -------------------------- | ----------- |
| **Stripe**                     | Payment processing         | REST API    |
| **Onfido**                     | KYC/Identity verification  | REST API    |
| **Cloudflare**                 | CDN and image optimization | REST API    |
| **Apple/Google**               | OAuth providers            | OAuth 2.0   |
| **Push Notification Services** | APNs, FCM                  | Native SDKs |
| **Mapbox**                     | Maps and geocoding         | Native SDK  |

### Level 2: Container Diagram

| Container      | Technology            | Purpose                              |
| -------------- | --------------------- | ------------------------------------ |
| Mobile App     | React Native + Expo   | Primary user interface               |
| Web Landing    | Next.js 16            | Marketing and SEO                    |
| Admin Panel    | React + Radix UI      | Back-office operations               |
| API Gateway    | Kong                  | Request routing, auth, rate limiting |
| REST API       | PostgREST             | Auto-generated REST endpoints        |
| Auth Service   | GoTrue                | Authentication and authorization     |
| Realtime       | Supabase Realtime     | WebSocket subscriptions              |
| Database       | PostgreSQL 15         | Primary data store                   |
| Cache          | Redis                 | Session, caching, rate limiting      |
| Object Storage | Supabase Storage / S3 | File uploads                         |
| Job Queue      | BullMQ + Redis        | Background processing                |
| Edge Functions | Deno                  | Serverless business logic            |

### Level 3: Component Diagram

See [C4_MODEL.md](./C4_MODEL.md) for detailed component diagrams of each container.

---

## Technology Stack

### Frontend Applications

#### Mobile App (`apps/mobile`)

```
Framework:     React Native 0.83 + Expo SDK 54
Language:      TypeScript 5.9 (strict mode)
Navigation:    React Navigation v7
State:         Zustand 5.x
Forms:         React Hook Form + Zod
Styling:       React Native StyleSheets + Design Tokens
Maps:          Mapbox (@rnmapbox/maps)
Testing:       Jest + React Native Testing Library
E2E:           Maestro
```

#### Web Landing (`apps/web`)

```
Framework:     Next.js 16 + Turbopack
Language:      TypeScript 5.9
Styling:       Tailwind CSS 4.x
Compiler:      React Compiler (experimental)
```

#### Admin Panel (`apps/admin`)

```
Framework:     Next.js 16
UI Library:    Radix UI + Tailwind CSS
Data Tables:   TanStack Table v8
Charts:        Recharts 3.x
Forms:         React Hook Form + Zod
```

### Backend Services

#### Supabase Stack

```
Database:      PostgreSQL 15 + PostGIS
Auth:          GoTrue v2.99
REST API:      PostgREST v11.2
Realtime:      Supabase Realtime v2.25
Storage:       Supabase Storage v0.43
Edge Functions: Deno Runtime
```

#### Supporting Services

```
Cache:         Redis 7.2 (Redis Stack)
Job Queue:     BullMQ (Node.js workers)
Monitoring:    Grafana 10.2
Email Testing: Mailhog
S3 Emulation:  Minio / LocalStack
```

### Shared Packages

| Package                  | Purpose                             |
| ------------------------ | ----------------------------------- |
| `@lovendo/shared`        | Common utilities, types, validation |
| `@lovendo/design-system` | UI components, tokens, theming      |
| `@lovendo/monitoring`    | Logging, metrics, error tracking    |

### Development Tools

```
Monorepo:      Turborepo 2.6
Package Mgr:   pnpm 9.15
Linting:       ESLint 9 + Prettier 3
Type Checking: TypeScript 5.9
Git Hooks:     Husky + lint-staged
Secrets:       Infisical
CI/CD:         GitHub Actions
```

---

## Deployment Architecture

### Development Environment

```yaml
# Local Development Stack (docker-compose.yml)
┌─────────────────────────────────────────────────────────┐ │                    Docker
Network                       │ │                                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐          │ │  │
PostgreSQL│  │   Kong    │  │  GoTrue   │          │
│  │   :5432   │  │   :8000   │  │   :9999   │          │
│  └───────────┘  └───────────┘  └───────────┘          │
│                                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐          │ │  │ PostgREST │  │
Realtime  │  │  Storage  │          │ │  │   :3000   │  │   :4000   │  │   :5000   │          │
│  └───────────┘  └───────────┘  └───────────┘          │
│                                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│  │   Redis   │  │  Grafana  │  │  Mailhog  │          │
│  │   :6379   │  │   :3001   │  │   :8025   │          │
│  └───────────┘  └───────────┘  └───────────┘          │
│                                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐          │ │  │ Job Queue │  │Job Worker
│  │   Minio   │          │ │  │   :3002   │  │  (scale)  │  │   :9000   │          │
│  └───────────┘  └───────────┘  └───────────┘          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Production Environment

```
┌────────────────────────────────────────────────────────────────┐
│                         Internet                               │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    Cloudflare CDN/WAF                          │
│              DDoS Protection • SSL Termination                 │
└────────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │  Web App    │    │  Admin App  │    │ Supabase    │
    │  (Vercel)   │    │  (Vercel)   │    │  (Cloud)    │
    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                  │
                              ┌───────────────────┼───────────────┐
                              │                   │               │
                              ▼                   ▼               ▼
                       ┌─────────────┐     ┌─────────────┐ ┌─────────────┐
                       │ PostgreSQL  │     │   Storage   │ │ Edge Funcs  │
                       │  (Managed)  │     │    (S3)     │ │   (Deno)    │
                       └─────────────┘     └─────────────┘ └─────────────┘
```

### Mobile App Distribution

```
┌─────────────────────────────────────────────────────────────┐
│                    EAS Build (Expo)                         │
│         Build Service • OTA Updates • Submission            │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │                               │
              ▼                               ▼
       ┌─────────────┐                 ┌─────────────┐
       │  App Store  │                 │ Google Play │
       │   (iOS)     │                 │  (Android)  │
       └─────────────┘                 └─────────────┘
```

---

## Data Architecture

### Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Core Domain                                   │
│                                                                         │
│   ┌─────────┐      creates      ┌─────────┐      has       ┌─────────┐ │
│   │  User   │─────────────────▶│ Moment  │───────────────▶│ Request │ │
│   └────┬────┘                   └────┬────┘                └────┬────┘ │
│        │                             │                          │      │
│        │ has                         │ generates                │      │
│        ▼                             ▼                          │      │
│   ┌─────────┐                   ┌─────────┐                     │      │
│   │ Review  │                   │Conversa-│◀────────────────────┘      │
│   └─────────┘                   │  tion   │                            │
│                                 └────┬────┘                            │
│   ┌─────────┐                        │                                 │
│   │Transac- │                        ▼                                 │
│   │  tion   │                   ┌─────────┐                            │
│   └─────────┘                   │ Message │                            │
│                                 └─────────┘                            │
│                                                                         │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────────┐        │
│   │Favorite │    │  Block  │    │ Report  │    │Notification │        │
│   └─────────┘    └─────────┘    └─────────┘    └─────────────┘        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Database Tables

| Table               | Description                         | RLS |
| ------------------- | ----------------------------------- | --- |
| `users`             | User profiles, preferences, balance | Yes |
| `moments`           | Travel experiences/events           | Yes |
| `requests`          | Join requests for moments           | Yes |
| `conversations`     | Chat threads                        | Yes |
| `messages`          | Individual messages                 | Yes |
| `reviews`           | User reviews and ratings            | Yes |
| `notifications`     | Push notification queue             | Yes |
| `transactions`      | Payment records                     | Yes |
| `favorites`         | Saved moments                       | Yes |
| `blocks`            | Blocked users                       | Yes |
| `reports`           | Content/user reports                | Yes |
| `subscriptions`     | Premium subscriptions               | Yes |
| `kyc_verifications` | Identity verification status        | Yes |

### Data Flow Patterns

#### 1. Moment Creation Flow

```
Mobile App → API Gateway → PostgREST → PostgreSQL
                                          │
                                          ▼
                                    Trigger: notify_followers()
                                          │
                                          ▼
                                    Realtime → Subscribers
```

#### 2. Payment Flow

```
Mobile App → Edge Function (create-payment-intent)
                    │
                    ▼
              PayTR API → Webhook
                              │
                              ▼
              Edge Function (paytr-webhook)
                              │
                              ▼
                        PostgreSQL
                              │
                              ▼
                    Update User Balance
```

See [DATA_ARCHITECTURE.md](./DATA_ARCHITECTURE.md) for detailed documentation.

---

## Security Architecture

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   GoTrue    │────▶│  PostgreSQL │
│             │     │   (Auth)    │     │             │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                          │ JWT
                          ▼
                   ┌─────────────┐
                   │ Access Token│ (15 min TTL)
                   │Refresh Token│ (7 day TTL)
                   └─────────────┘
```

### Authorization Layers

1. **API Gateway (Kong)**
   - JWT validation
   - Rate limiting (100 req/min default)
   - CORS policy enforcement

2. **Row Level Security (RLS)**
   - All tables have RLS enabled
   - Policies based on `auth.uid()`
   - Helper functions for complex checks

3. **Edge Function Authorization**
   - Service role for elevated access
   - Request validation with Zod schemas

### Security Controls

| Control           | Implementation                      |
| ----------------- | ----------------------------------- |
| Authentication    | JWT + Refresh Token Rotation        |
| Authorization     | RLS Policies + RBAC                 |
| Data Encryption   | TLS 1.3 in transit, AES-256 at rest |
| API Security      | Rate limiting, request validation   |
| Secret Management | Infisical, environment variables    |
| Audit Logging     | Trigger-based audit trail           |
| KYC/AML           | Onfido integration                  |

See [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) for detailed documentation.

---

## Integration Patterns

### API Integration Pattern

```typescript
// All external API calls use consistent error handling
const callExternalAPI = async (params: APIParams) => {
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      timeout: 30000,
    });

    if (!response.ok) {
      throw new APIError(response.status, await response.json());
    }

    return response.json();
  } catch (error) {
    // Log to Sentry
    // Return user-friendly error
  }
};
```

### Event-Driven Pattern

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Database   │────▶│   Trigger   │────▶│  pg_notify  │
│   Change    │     │  Function   │     │   Channel   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┘
                    │
                    ▼
             ┌─────────────┐
             │  Realtime   │────▶ Connected Clients
             │   Server    │
             └─────────────┘
```

### Background Job Pattern

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Job Queue  │────▶│   Worker    │
│   Request   │     │  (BullMQ)   │     │  Process    │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                          │                    │
                          │                    ▼
                          │            ┌─────────────┐
                          └───────────▶│   Result    │
                                       │   Storage   │
                                       └─────────────┘
```

---

## Quality Attributes

### Performance

| Metric             | Target  | Current |
| ------------------ | ------- | ------- |
| TTI (Mobile)       | < 3s    | ~2s     |
| API Response (p95) | < 200ms | ~150ms  |
| Database Query     | < 50ms  | ~30ms   |
| Bundle Size        | < 5MB   | ~4.2MB  |

### Reliability

| Metric | Target       |
| ------ | ------------ |
| Uptime | 99.9%        |
| RTO    | < 1 hour     |
| RPO    | < 15 minutes |

### Scalability

- **Horizontal**: Worker pods can scale independently
- **Database**: Connection pooling via PgBouncer
- **Storage**: S3-compatible object storage
- **Cache**: Redis cluster support

### Maintainability

- TypeScript strict mode everywhere
- Comprehensive test coverage (75-85%)
- Automated CI/CD pipelines
- Technical debt tracking

---

## Related Documentation

### Architecture Documents

- [C4 Model Details](./C4_MODEL.md) - Detailed C4 diagrams
- [Data Architecture](./DATA_ARCHITECTURE.md) - Database design
- [Security Architecture](./SECURITY_ARCHITECTURE.md) - Security controls
- [API Reference](../API_REFERENCE.md) - API documentation

### Architecture Decision Records

- [ADR-001: Monorepo with Turborepo](./adr/ADR-001-monorepo-turborepo.md)
- [ADR-002: Supabase as Backend](./adr/ADR-002-supabase-backend.md)
- [ADR-003: React Native with Expo](./adr/ADR-003-react-native-expo.md)
- [ADR-004: Zustand for State Management](./adr/ADR-004-zustand-state-management.md)
- [ADR-005: Row Level Security](./adr/ADR-005-row-level-security.md)

### Operations

- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [Environment Variables](../ENVIRONMENT_VARIABLES.md)
- [Security Hardening](../SECURITY_HARDENING.md)

### Development

- [Developer Onboarding](../DEVELOPER_ONBOARDING.md)
- [Getting Started](../GETTING_STARTED.md)
- [Test Strategy](../TEST_STRATEGY.md)

---

## Document History

| Version | Date     | Author            | Changes               |
| ------- | -------- | ----------------- | --------------------- |
| 1.0.0   | Dec 2024 | Architecture Team | Initial documentation |
