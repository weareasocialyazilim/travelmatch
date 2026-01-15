# Lovendo C4 Model Architecture

> **Version**: 1.0.0
> **Last Updated**: December 2024

This document provides detailed C4 model diagrams for the Lovendo platform using Mermaid syntax for easy visualization in GitHub and other Markdown viewers.

## Table of Contents

1. [Level 1: System Context](#level-1-system-context)
2. [Level 2: Container Diagram](#level-2-container-diagram)
3. [Level 3: Component Diagrams](#level-3-component-diagrams)
4. [Level 4: Code Level](#level-4-code-level)
5. [Dynamic Diagrams](#dynamic-diagrams)

---

## Level 1: System Context

The System Context diagram shows Lovendo and its relationships with users and external systems.

```mermaid
graph TB
    subgraph users ["Users"]
        traveler["Traveler<br/><i>Person</i><br/>Creates and joins travel moments"]
        admin["Administrator<br/><i>Person</i><br/>Manages platform operations"]
    end

    subgraph lovendo ["Lovendo Platform"]
        system["Lovendo<br/><i>Software System</i><br/>Social travel platform for<br/>connecting travelers"]
    end

    subgraph external ["External Systems"]
        stripe["Stripe<br/><i>External System</i><br/>Payment processing"]
        onfido["Onfido<br/><i>External System</i><br/>KYC verification"]
        cloudflare["Cloudflare<br/><i>External System</i><br/>CDN & image optimization"]
        mapbox["Mapbox<br/><i>External System</i><br/>Maps & geocoding"]
        apns["Apple Push<br/><i>External System</i><br/>iOS notifications"]
        fcm["Firebase Cloud Messaging<br/><i>External System</i><br/>Android notifications"]
        oauth["OAuth Providers<br/><i>External System</i><br/>Google, Apple sign-in"]
    end

    traveler -->|"Uses mobile app to<br/>create/join moments"| system
    admin -->|"Manages users,<br/>content, payments"| system

    system -->|"Processes payments"| stripe
    system -->|"Verifies identity"| onfido
    system -->|"Serves images"| cloudflare
    system -->|"Gets maps/location"| mapbox
    system -->|"Sends iOS notifications"| apns
    system -->|"Sends Android notifications"| fcm
    system -->|"Authenticates users"| oauth

    style traveler fill:#08427b,stroke:#052e56,color:#fff
    style admin fill:#08427b,stroke:#052e56,color:#fff
    style system fill:#1168bd,stroke:#0b4884,color:#fff
    style stripe fill:#999999,stroke:#666666,color:#fff
    style onfido fill:#999999,stroke:#666666,color:#fff
    style cloudflare fill:#999999,stroke:#666666,color:#fff
    style mapbox fill:#999999,stroke:#666666,color:#fff
    style apns fill:#999999,stroke:#666666,color:#fff
    style fcm fill:#999999,stroke:#666666,color:#fff
    style oauth fill:#999999,stroke:#666666,color:#fff
```

### External System Integrations

| System | Purpose | Protocol | Data Exchanged |
|--------|---------|----------|----------------|
| **Stripe** | Payment processing | REST API | Payment intents, webhooks, customer data |
| **Onfido** | Identity verification | REST API | Document images, verification results |
| **Cloudflare** | CDN & optimization | REST API | Images, cache invalidation |
| **Mapbox** | Maps & geocoding | Native SDK | Coordinates, map tiles |
| **APNs/FCM** | Push notifications | Native SDK | Notification payloads |
| **OAuth** | Social authentication | OAuth 2.0 | Access tokens, user profiles |

---

## Level 2: Container Diagram

The Container diagram shows the high-level technology choices and how containers communicate.

```mermaid
graph TB
    subgraph users ["Users"]
        traveler["Traveler"]
        admin_user["Administrator"]
    end

    subgraph frontends ["Frontend Applications"]
        mobile["Mobile App<br/><i>Container: React Native + Expo</i><br/>iOS/Android application"]
        web["Web Landing<br/><i>Container: Next.js 16</i><br/>Marketing & SEO"]
        admin_panel["Admin Panel<br/><i>Container: React + Radix UI</i><br/>Back-office management"]
    end

    subgraph gateway ["API Gateway Layer"]
        kong["API Gateway<br/><i>Container: Kong 2.8</i><br/>Routing, auth, rate limiting"]
    end

    subgraph supabase ["Supabase Platform"]
        postgrest["REST API<br/><i>Container: PostgREST</i><br/>Auto-generated REST endpoints"]
        gotrue["Auth Service<br/><i>Container: GoTrue</i><br/>JWT authentication"]
        realtime["Realtime<br/><i>Container: Supabase Realtime</i><br/>WebSocket subscriptions"]
        storage["Storage API<br/><i>Container: Storage API</i><br/>File uploads"]
        edge["Edge Functions<br/><i>Container: Deno Runtime</i><br/>Serverless functions"]
    end

    subgraph data ["Data Layer"]
        postgres["PostgreSQL<br/><i>Container: PostgreSQL 15</i><br/>Primary database with PostGIS"]
        redis["Redis<br/><i>Container: Redis 7.2</i><br/>Cache, sessions, rate limits"]
    end

    subgraph workers ["Background Services"]
        jobqueue["Job Queue API<br/><i>Container: Node.js + BullMQ</i><br/>Queue management"]
        worker["Job Worker<br/><i>Container: Node.js</i><br/>Background processing"]
    end

    subgraph storage_layer ["Object Storage"]
        minio["Object Storage<br/><i>Container: S3/Minio</i><br/>File storage"]
    end

    %% User connections
    traveler -->|"HTTPS"| mobile
    admin_user -->|"HTTPS"| admin_panel
    traveler -->|"HTTPS"| web

    %% Frontend to gateway
    mobile -->|"HTTPS/REST"| kong
    web -->|"HTTPS/REST"| kong
    admin_panel -->|"HTTPS/REST"| kong

    %% Gateway to services
    kong -->|"HTTP"| postgrest
    kong -->|"HTTP"| gotrue
    kong -->|"WebSocket"| realtime
    kong -->|"HTTP"| storage
    kong -->|"HTTP"| edge

    %% Services to database
    postgrest -->|"TCP/5432"| postgres
    gotrue -->|"TCP/5432"| postgres
    realtime -->|"TCP/5432"| postgres
    edge -->|"TCP/5432"| postgres

    %% Storage connections
    storage -->|"S3 API"| minio

    %% Background jobs
    jobqueue -->|"Redis Protocol"| redis
    worker -->|"Redis Protocol"| redis
    worker -->|"TCP/5432"| postgres

    %% Cache
    gotrue -->|"Redis Protocol"| redis

    style mobile fill:#438dd5,stroke:#2e6295,color:#fff
    style web fill:#438dd5,stroke:#2e6295,color:#fff
    style admin_panel fill:#438dd5,stroke:#2e6295,color:#fff
    style kong fill:#85bbf0,stroke:#5d9fd6,color:#000
    style postgrest fill:#85bbf0,stroke:#5d9fd6,color:#000
    style gotrue fill:#85bbf0,stroke:#5d9fd6,color:#000
    style realtime fill:#85bbf0,stroke:#5d9fd6,color:#000
    style storage fill:#85bbf0,stroke:#5d9fd6,color:#000
    style edge fill:#85bbf0,stroke:#5d9fd6,color:#000
    style postgres fill:#438dd5,stroke:#2e6295,color:#fff
    style redis fill:#438dd5,stroke:#2e6295,color:#fff
    style jobqueue fill:#85bbf0,stroke:#5d9fd6,color:#000
    style worker fill:#85bbf0,stroke:#5d9fd6,color:#000
    style minio fill:#438dd5,stroke:#2e6295,color:#fff
```

### Container Descriptions

| Container | Technology | Responsibility | Port |
|-----------|------------|----------------|------|
| Mobile App | React Native + Expo | User-facing mobile application | N/A |
| Web Landing | Next.js 16 | Marketing pages, SEO | 3000 |
| Admin Panel | React + Radix UI | Administrative interface | 3001 |
| API Gateway | Kong 2.8 | Request routing, auth, rate limiting | 8000 |
| REST API | PostgREST | Auto-generated REST from PostgreSQL | 3000 |
| Auth Service | GoTrue | Authentication, JWT issuance | 9999 |
| Realtime | Supabase Realtime | WebSocket connections | 4000 |
| Storage API | Supabase Storage | File upload/download | 5000 |
| Edge Functions | Deno | Custom serverless logic | Dynamic |
| PostgreSQL | PostgreSQL 15 | Primary data storage | 5432 |
| Redis | Redis 7.2 | Caching, sessions, queues | 6379 |
| Job Queue | Node.js + BullMQ | Background job management | 3002 |
| Object Storage | S3/Minio | Binary file storage | 9000 |

---

## Level 3: Component Diagrams

### Mobile Application Components

```mermaid
graph TB
    subgraph mobile ["Mobile App Container"]
        subgraph ui ["UI Layer"]
            screens["Screens<br/><i>Component</i><br/>React Native screens"]
            components["Components<br/><i>Component</i><br/>Reusable UI components"]
            navigation["Navigation<br/><i>Component</i><br/>React Navigation v7"]
        end

        subgraph state ["State Layer"]
            stores["Zustand Stores<br/><i>Component</i><br/>Global state management"]
            context["React Context<br/><i>Component</i><br/>Auth, Theme providers"]
            hooks["Custom Hooks<br/><i>Component</i><br/>Business logic hooks"]
        end

        subgraph services ["Service Layer"]
            api["API Service<br/><i>Component</i><br/>REST client"]
            supabase_client["Supabase Client<br/><i>Component</i><br/>Supabase SDK"]
            realtime_client["Realtime Client<br/><i>Component</i><br/>WebSocket manager"]
            storage_client["Storage Client<br/><i>Component</i><br/>File upload/download"]
        end

        subgraph utils ["Utility Layer"]
            logger["Logger<br/><i>Component</i><br/>GDPR-safe logging"]
            validation["Validation<br/><i>Component</i><br/>Zod schemas"]
            i18n["i18n<br/><i>Component</i><br/>Internationalization"]
        end
    end

    subgraph external ["External"]
        api_gateway["API Gateway"]
    end

    screens --> components
    screens --> navigation
    screens --> hooks

    hooks --> stores
    hooks --> context

    stores --> api
    stores --> supabase_client

    api --> api_gateway
    supabase_client --> api_gateway
    realtime_client --> api_gateway
    storage_client --> api_gateway

    hooks --> logger
    hooks --> validation
    screens --> i18n

    style screens fill:#85bbf0,stroke:#5d9fd6,color:#000
    style components fill:#85bbf0,stroke:#5d9fd6,color:#000
    style navigation fill:#85bbf0,stroke:#5d9fd6,color:#000
    style stores fill:#85bbf0,stroke:#5d9fd6,color:#000
    style context fill:#85bbf0,stroke:#5d9fd6,color:#000
    style hooks fill:#85bbf0,stroke:#5d9fd6,color:#000
    style api fill:#85bbf0,stroke:#5d9fd6,color:#000
    style supabase_client fill:#85bbf0,stroke:#5d9fd6,color:#000
    style realtime_client fill:#85bbf0,stroke:#5d9fd6,color:#000
    style storage_client fill:#85bbf0,stroke:#5d9fd6,color:#000
    style logger fill:#85bbf0,stroke:#5d9fd6,color:#000
    style validation fill:#85bbf0,stroke:#5d9fd6,color:#000
    style i18n fill:#85bbf0,stroke:#5d9fd6,color:#000
```

### Mobile App Directory Structure

```
apps/mobile/src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI primitives
│   ├── forms/          # Form components
│   └── cards/          # Card layouts
├── screens/            # Screen components
│   ├── auth/           # Authentication screens
│   ├── home/           # Home & discovery
│   ├── moments/        # Moment management
│   ├── chat/           # Messaging
│   └── profile/        # User profile
├── navigation/         # Navigation configuration
├── stores/             # Zustand state stores
├── hooks/              # Custom React hooks
├── services/           # API & external services
├── context/            # React context providers
├── utils/              # Utility functions
├── constants/          # Design tokens & constants
├── types/              # TypeScript definitions
├── schemas/            # Zod validation schemas
├── i18n/               # Internationalization
└── features/           # Feature modules
```

### Edge Functions Components

```mermaid
graph TB
    subgraph edge ["Edge Functions Container"]
        subgraph auth_funcs ["Authentication"]
            auth_login["auth-login<br/><i>Function</i><br/>Custom login logic"]
            setup_2fa["setup-2fa<br/><i>Function</i><br/>2FA enrollment"]
            verify_2fa["verify-2fa<br/><i>Function</i><br/>2FA verification"]
        end

        subgraph payment_funcs ["Payments"]
            create_payment["create-payment<br/><i>Function</i><br/>Payment initiation"]
            confirm_payment["confirm-payment<br/><i>Function</i><br/>Payment confirmation"]
            stripe_webhook["stripe-webhook<br/><i>Function</i><br/>Stripe event handler"]
            transfer_funds["transfer-funds<br/><i>Function</i><br/>Internal transfers"]
        end

        subgraph verification_funcs ["Verification"]
            verify_kyc["verify-kyc<br/><i>Function</i><br/>KYC processing"]
            verify_proof["verify-proof<br/><i>Function</i><br/>Proof verification"]
        end

        subgraph media_funcs ["Media"]
            upload_image["upload-image<br/><i>Function</i><br/>Image upload handler"]
            cdn_invalidate["cdn-invalidate<br/><i>Function</i><br/>CDN cache clear"]
        end

        subgraph utility_funcs ["Utility"]
            geocode["geocode<br/><i>Function</i><br/>Address geocoding"]
            export_data["export-user-data<br/><i>Function</i><br/>GDPR data export"]
            audit_log["audit-logging<br/><i>Function</i><br/>Audit trail"]
        end

        subgraph shared ["Shared"]
            shared_utils["_shared<br/><i>Module</i><br/>Common utilities"]
        end
    end

    auth_login --> shared_utils
    create_payment --> shared_utils
    verify_kyc --> shared_utils
    upload_image --> shared_utils

    style auth_login fill:#85bbf0,stroke:#5d9fd6,color:#000
    style setup_2fa fill:#85bbf0,stroke:#5d9fd6,color:#000
    style verify_2fa fill:#85bbf0,stroke:#5d9fd6,color:#000
    style create_payment fill:#85bbf0,stroke:#5d9fd6,color:#000
    style confirm_payment fill:#85bbf0,stroke:#5d9fd6,color:#000
    style stripe_webhook fill:#85bbf0,stroke:#5d9fd6,color:#000
    style transfer_funds fill:#85bbf0,stroke:#5d9fd6,color:#000
    style verify_kyc fill:#85bbf0,stroke:#5d9fd6,color:#000
    style verify_proof fill:#85bbf0,stroke:#5d9fd6,color:#000
    style upload_image fill:#85bbf0,stroke:#5d9fd6,color:#000
    style cdn_invalidate fill:#85bbf0,stroke:#5d9fd6,color:#000
    style geocode fill:#85bbf0,stroke:#5d9fd6,color:#000
    style export_data fill:#85bbf0,stroke:#5d9fd6,color:#000
    style audit_log fill:#85bbf0,stroke:#5d9fd6,color:#000
    style shared_utils fill:#facc15,stroke:#d4a00f,color:#000
```

### Admin Panel Components

```mermaid
graph TB
    subgraph admin ["Admin Panel Container"]
        subgraph pages ["Pages"]
            dashboard["Dashboard<br/><i>Component</i><br/>Overview metrics"]
            users_page["Users<br/><i>Component</i><br/>User management"]
            moments_page["Moments<br/><i>Component</i><br/>Content moderation"]
            payments_page["Payments<br/><i>Component</i><br/>Transaction management"]
            reports_page["Reports<br/><i>Component</i><br/>Analytics & reports"]
            incidents_page["Incidents<br/><i>Component</i><br/>Support tickets"]
        end

        subgraph ui_components ["UI Components"]
            data_table["Data Table<br/><i>Component</i><br/>TanStack Table"]
            charts["Charts<br/><i>Component</i><br/>Recharts"]
            forms["Forms<br/><i>Component</i><br/>React Hook Form"]
            dialogs["Dialogs<br/><i>Component</i><br/>Radix UI"]
        end

        subgraph data_layer ["Data Layer"]
            react_query["React Query<br/><i>Component</i><br/>Data fetching"]
            supabase_ssr["Supabase SSR<br/><i>Component</i><br/>Server-side auth"]
        end
    end

    dashboard --> data_table
    dashboard --> charts
    users_page --> data_table
    users_page --> forms
    moments_page --> data_table
    payments_page --> data_table

    data_table --> react_query
    charts --> react_query
    forms --> react_query

    react_query --> supabase_ssr

    style dashboard fill:#85bbf0,stroke:#5d9fd6,color:#000
    style users_page fill:#85bbf0,stroke:#5d9fd6,color:#000
    style moments_page fill:#85bbf0,stroke:#5d9fd6,color:#000
    style payments_page fill:#85bbf0,stroke:#5d9fd6,color:#000
    style reports_page fill:#85bbf0,stroke:#5d9fd6,color:#000
    style incidents_page fill:#85bbf0,stroke:#5d9fd6,color:#000
    style data_table fill:#85bbf0,stroke:#5d9fd6,color:#000
    style charts fill:#85bbf0,stroke:#5d9fd6,color:#000
    style forms fill:#85bbf0,stroke:#5d9fd6,color:#000
    style dialogs fill:#85bbf0,stroke:#5d9fd6,color:#000
    style react_query fill:#85bbf0,stroke:#5d9fd6,color:#000
    style supabase_ssr fill:#85bbf0,stroke:#5d9fd6,color:#000
```

---

## Level 4: Code Level

### Store Architecture (Zustand)

```mermaid
classDiagram
    class AuthStore {
        +user: User | null
        +session: Session | null
        +isLoading: boolean
        +signIn(email, password)
        +signOut()
        +refreshSession()
    }

    class MomentStore {
        +moments: Moment[]
        +selectedMoment: Moment | null
        +filters: FilterState
        +fetchMoments()
        +createMoment(data)
        +updateMoment(id, data)
    }

    class ChatStore {
        +conversations: Conversation[]
        +activeConversation: Conversation | null
        +messages: Message[]
        +sendMessage(content)
        +markAsRead(messageId)
    }

    class NotificationStore {
        +notifications: Notification[]
        +unreadCount: number
        +fetchNotifications()
        +markAsRead(id)
    }

    AuthStore --> MomentStore : provides user context
    AuthStore --> ChatStore : provides user context
    AuthStore --> NotificationStore : provides user context
```

### Service Layer Pattern

```mermaid
classDiagram
    class SupabaseService {
        -client: SupabaseClient
        +from(table): QueryBuilder
        +rpc(name, params): Promise
        +auth: AuthClient
        +storage: StorageClient
    }

    class APIService {
        +get(endpoint): Promise
        +post(endpoint, data): Promise
        +put(endpoint, data): Promise
        +delete(endpoint): Promise
    }

    class MomentService {
        +getMoments(filters): Promise~Moment[]~
        +getMomentById(id): Promise~Moment~
        +createMoment(data): Promise~Moment~
        +updateMoment(id, data): Promise~Moment~
        +deleteMoment(id): Promise~void~
    }

    class PaymentService {
        +createPaymentIntent(amount): Promise
        +confirmPayment(intentId): Promise
        +getTransactions(): Promise~Transaction[]~
    }

    MomentService --> SupabaseService : uses
    PaymentService --> APIService : uses
```

---

## Dynamic Diagrams

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant M as Mobile App
    participant K as Kong Gateway
    participant G as GoTrue
    participant P as PostgreSQL

    U->>M: Enter credentials
    M->>K: POST /auth/v1/token
    K->>G: Forward request
    G->>P: Validate credentials
    P-->>G: User data
    G->>G: Generate JWT
    G-->>K: Access + Refresh tokens
    K-->>M: Tokens
    M->>M: Store in SecureStore
    M-->>U: Login success

    Note over M,G: Subsequent requests
    M->>K: GET /rest/v1/moments<br/>Authorization: Bearer {token}
    K->>K: Validate JWT
    K->>P: Query with RLS context
    P-->>K: Data
    K-->>M: Response
```

### Moment Creation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant M as Mobile App
    participant K as Kong Gateway
    participant R as PostgREST
    participant P as PostgreSQL
    participant RT as Realtime
    participant S as Storage

    U->>M: Fill moment form
    U->>M: Select images

    M->>K: POST /storage/v1/upload
    K->>S: Upload images
    S-->>K: Image URLs
    K-->>M: URLs

    M->>K: POST /rest/v1/moments
    K->>R: Create moment
    R->>P: INSERT INTO moments
    P->>P: Execute triggers
    P-->>R: Created moment
    R-->>K: Response
    K-->>M: Moment created

    P->>RT: pg_notify('moment_created')
    RT->>RT: Broadcast to subscribers
    RT-->>M: Real-time update (other users)

    M-->>U: Success notification
```

### Payment Flow

```mermaid
sequenceDiagram
    participant U as User
    participant M as Mobile App
    participant E as Edge Function
    participant ST as Stripe
    participant P as PostgreSQL

    U->>M: Confirm payment
    M->>E: POST /functions/v1/create-payment-intent
    E->>ST: Create PaymentIntent
    ST-->>E: clientSecret
    E->>P: INSERT INTO transactions (pending)
    E-->>M: clientSecret

    M->>ST: Confirm with card details
    ST-->>M: Payment result

    ST->>E: POST /functions/v1/stripe-webhook
    E->>E: Verify webhook signature
    E->>P: UPDATE transactions SET status='completed'
    E->>P: UPDATE users SET balance
    E-->>ST: 200 OK

    M->>M: Query updated balance
    M-->>U: Payment confirmed
```

### Real-time Messaging Flow

```mermaid
sequenceDiagram
    participant A as User A
    participant MA as Mobile App A
    participant RT as Realtime Server
    participant P as PostgreSQL
    participant MB as Mobile App B
    participant B as User B

    MA->>RT: Subscribe to conversation_123
    MB->>RT: Subscribe to conversation_123

    A->>MA: Type message
    MA->>P: INSERT INTO messages
    P->>P: Trigger: update last_message
    P->>RT: pg_notify('messages')

    RT->>MA: Broadcast: new message
    RT->>MB: Broadcast: new message

    MA-->>A: Show sent message
    MB-->>B: Show received message

    B->>MB: Mark as read
    MB->>P: UPDATE messages SET read_at
    P->>RT: pg_notify('message_read')
    RT->>MA: Broadcast: message read
    MA-->>A: Show read receipt
```

---

## Deployment View

```mermaid
graph TB
    subgraph cloud ["Cloud Infrastructure"]
        subgraph vercel ["Vercel"]
            web_deploy["Web App"]
            admin_deploy["Admin Panel"]
        end

        subgraph supabase_cloud ["Supabase Cloud"]
            db_managed["PostgreSQL"]
            auth_managed["Auth"]
            storage_managed["Storage"]
            realtime_managed["Realtime"]
            edge_managed["Edge Functions"]
        end

        subgraph cloudflare_cdn ["Cloudflare"]
            cdn["CDN"]
            waf["WAF"]
            images["Image Optimization"]
        end
    end

    subgraph app_stores ["App Distribution"]
        app_store["Apple App Store"]
        play_store["Google Play Store"]
    end

    subgraph eas ["EAS Build"]
        build_service["Build Service"]
        ota["OTA Updates"]
    end

    web_deploy --> supabase_cloud
    admin_deploy --> supabase_cloud

    cdn --> web_deploy
    cdn --> admin_deploy
    cdn --> storage_managed

    build_service --> app_store
    build_service --> play_store

    style web_deploy fill:#438dd5,stroke:#2e6295,color:#fff
    style admin_deploy fill:#438dd5,stroke:#2e6295,color:#fff
    style db_managed fill:#438dd5,stroke:#2e6295,color:#fff
    style auth_managed fill:#438dd5,stroke:#2e6295,color:#fff
    style storage_managed fill:#438dd5,stroke:#2e6295,color:#fff
    style realtime_managed fill:#438dd5,stroke:#2e6295,color:#fff
    style edge_managed fill:#438dd5,stroke:#2e6295,color:#fff
    style cdn fill:#f97316,stroke:#c2410c,color:#fff
    style waf fill:#f97316,stroke:#c2410c,color:#fff
    style images fill:#f97316,stroke:#c2410c,color:#fff
```

---

## Related Documents

- [Architecture Overview](./ARCHITECTURE.md)
- [Data Architecture](./DATA_ARCHITECTURE.md)
- [Security Architecture](./SECURITY_ARCHITECTURE.md)
- [ADR Index](./adr/README.md)
