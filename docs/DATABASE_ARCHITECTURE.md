# TravelMatch Database Architecture

## Overview

TravelMatch uses **Supabase** (PostgreSQL 15) as its primary database, providing a scalable, secure, and feature-rich backend for the social travel platform. This document outlines the complete database architecture, design decisions, and best practices.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Entity-Relationship Model](#entity-relationship-model)
3. [Core Tables](#core-tables)
4. [Supporting Tables](#supporting-tables)
5. [Indexing Strategy](#indexing-strategy)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [Database Functions & Triggers](#database-functions--triggers)
8. [Security Architecture](#security-architecture)
9. [Scalability Considerations](#scalability-considerations)
10. [Performance Monitoring](#performance-monitoring)
11. [Migration Strategy](#migration-strategy)

---

## Architecture Overview

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Database | PostgreSQL 15 | Primary data store |
| Platform | Supabase | Managed PostgreSQL with auth, storage, realtime |
| Extensions | PostGIS, uuid-ossp, pg_cron | Geospatial, UUIDs, scheduled jobs |
| Auth | Supabase Auth | JWT-based authentication |
| Realtime | Supabase Realtime | WebSocket subscriptions for chat |

### Database Structure

```
travelmatch/
├── supabase/
│   ├── migrations/          # 50+ versioned migrations
│   ├── functions/           # Edge functions (Deno)
│   ├── config.toml          # Supabase configuration
│   └── seed-production-ready.sql
└── apps/
    ├── mobile/src/types/database.types.ts  # Auto-generated types
    └── admin/src/types/database.ts         # Admin-specific types
```

### Design Principles

1. **Domain-Driven Design**: Tables align with business domains (users, moments, payments)
2. **Security by Default**: RLS enabled on all tables, principle of least privilege
3. **Performance First**: Strategic indexes, optimized RLS policies with cached auth calls
4. **Audit Trail**: Comprehensive logging for compliance and debugging
5. **Soft Deletes**: User data preservation for account recovery

---

## Entity-Relationship Model

### Core Domain Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TravelMatch Data Model                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌─────────┐         ┌─────────────┐         ┌──────────────┐             │
│    │  USERS  │────────▶│   MOMENTS   │◀────────│   REQUESTS   │             │
│    └────┬────┘  1:N    └──────┬──────┘   N:1   └──────┬───────┘             │
│         │                     │                       │                      │
│         │ 1:N                 │ 1:N                   │ N:1                  │
│         ▼                     ▼                       ▼                      │
│    ┌─────────┐         ┌─────────────┐         ┌──────────────┐             │
│    │ REVIEWS │         │  FAVORITES  │         │    USERS     │             │
│    └─────────┘         └─────────────┘         │ (requester)  │             │
│                                                 └──────────────┘             │
│    ┌─────────────────────────────────────────────────────────┐              │
│    │                    MESSAGING DOMAIN                      │              │
│    │  ┌───────────────┐    1:N    ┌────────────┐             │              │
│    │  │ CONVERSATIONS │──────────▶│  MESSAGES  │             │              │
│    │  └───────┬───────┘           └────────────┘             │              │
│    │          │ N:M                                           │              │
│    │          ▼                                               │              │
│    │  ┌───────────────────────┐                              │              │
│    │  │ CONVERSATION_PARTIC.  │                              │              │
│    │  └───────────────────────┘                              │              │
│    └─────────────────────────────────────────────────────────┘              │
│                                                                              │
│    ┌─────────────────────────────────────────────────────────┐              │
│    │                    PAYMENT DOMAIN                        │              │
│    │  ┌──────────────┐         ┌────────────────────┐        │              │
│    │  │ TRANSACTIONS │         │ ESCROW_TRANSACTIONS │        │              │
│    │  └──────────────┘         └────────────────────┘        │              │
│    │  ┌──────────────────────┐ ┌────────────────────┐        │              │
│    │  │ SUBSCRIPTION_PLANS   │ │ USER_SUBSCRIPTIONS │        │              │
│    │  └──────────────────────┘ └────────────────────┘        │              │
│    └─────────────────────────────────────────────────────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Tables

### 1. Users

The central entity for all user data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  phone TEXT,
  languages TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  push_token TEXT,
  notification_preferences JSONB DEFAULT '{"messages": true, "requests": true, "reminders": true, "marketing": false}',
  privacy_settings JSONB DEFAULT '{"showOnlineStatus": true, "showLastSeen": true}',
  balance DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'TRY',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- Soft delete support
);
```

**Key Design Decisions:**
- Uses UUID for distributed-friendly IDs
- JSONB for flexible notification/privacy settings
- Soft delete via `deleted_at` for account recovery
- Denormalized `rating` and `review_count` for performance
- Array types for `languages` and `interests` (searchable via GIN indexes)

### 2. Moments

Core travel experiences/events that users create and share.

```sql
CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  coordinates GEOGRAPHY(POINT, 4326),  -- PostGIS geospatial
  date TIMESTAMPTZ NOT NULL,
  duration_hours INTEGER,
  max_participants INTEGER DEFAULT 1,
  current_participants INTEGER DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'TRY',
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  requirements TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'full', 'completed', 'cancelled')),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Design Decisions:**
- PostGIS `GEOGRAPHY` type for accurate distance calculations
- State machine via `status` field with CHECK constraint
- Denormalized `current_participants` updated by triggers
- Array type for `images` and `tags`

### 3. Requests

Join requests from users wanting to participate in moments.

```sql
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moment_id UUID REFERENCES moments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(moment_id, user_id)  -- One request per user per moment
);
```

### 4. Conversations & Messages

Real-time messaging system with normalized participant tracking.

```sql
-- Conversations (with legacy array + normalized junction table)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_ids UUID[] NOT NULL,  -- Legacy, migrating to junction
  moment_id UUID REFERENCES moments(id) ON DELETE SET NULL,
  last_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  migrated_to_junction BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Normalized participant tracking (new design)
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_archived BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'location', 'system')),
  metadata JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Migration Note:** The system is transitioning from array-based `participant_ids` to the normalized `conversation_participants` junction table for better query performance and RLS optimization.

---

## Supporting Tables

### Payment Domain

```sql
-- Financial transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  moment_id UUID REFERENCES moments(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'gift', 'escrow_hold', 'escrow_release', 'escrow_refund')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Escrow for high-value transactions
CREATE TABLE escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  moment_id UUID REFERENCES moments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'released', 'refunded', 'disputed', 'expired')),
  release_condition TEXT NOT NULL DEFAULT 'proof_verified',
  proof_submitted BOOLEAN DEFAULT FALSE,
  proof_verified BOOLEAN DEFAULT FALSE,
  proof_verification_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  released_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT sender_recipient_check CHECK (sender_id != recipient_id)
);
```

### Subscription System

```sql
-- Plans (static reference data)
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,  -- 'free', 'starter', 'pro', 'vip'
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  interval TEXT CHECK (interval IN ('month', 'year')),
  features JSONB DEFAULT '[]',
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES subscription_plans(id),
  status TEXT CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  provider TEXT DEFAULT 'stripe',  -- 'stripe', 'apple', 'google'
  provider_subscription_id TEXT
);
```

### Trust & Safety

```sql
-- User reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moment_id UUID REFERENCES moments(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reviewed_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(moment_id, reviewer_id)
);

-- KYC verification history
CREATE TABLE kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('onfido', 'stripe_identity', 'mock')),
  provider_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('verified', 'rejected', 'needs_review')),
  confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  rejection_reasons TEXT[],
  metadata JSONB
);

-- User reports for moderation
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  CHECK (reported_user_id IS NOT NULL OR reported_moment_id IS NOT NULL)
);

-- User blocks
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);
```

### Admin Panel Tables

```sql
-- Admin users (separate from app users)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'manager', 'moderator', 'finance', 'marketing', 'support', 'viewer')),
  is_active BOOLEAN DEFAULT TRUE,
  requires_2fa BOOLEAN DEFAULT FALSE,
  totp_secret TEXT,
  totp_enabled BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ
);

-- Admin sessions
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Role-based permissions
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB
);
```

### Infrastructure Tables

```sql
-- Feed delta for incremental sync
CREATE TABLE feed_delta (
  user_id UUID NOT NULL,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  operation TEXT NOT NULL,
  data JSONB,
  version BIGSERIAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limiting
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);

-- CDN cache invalidation logs
CREATE TABLE cdn_invalidation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  urls TEXT[] NOT NULL,
  item_ids TEXT[] NOT NULL,
  success BOOLEAN DEFAULT TRUE,
  latency_ms INTEGER,
  error TEXT
);
```

---

## Indexing Strategy

### Index Categories

1. **Primary Key Indexes** - Automatic with UUID PRIMARY KEY
2. **Foreign Key Indexes** - All FK columns indexed for JOIN performance
3. **Query Pattern Indexes** - Based on common WHERE/ORDER BY clauses
4. **Partial Indexes** - For filtering common status values
5. **GIN Indexes** - For array and JSONB operations
6. **GIST Indexes** - For PostGIS geospatial queries

### Key Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_users_rating ON users(rating DESC);
CREATE INDEX idx_users_verified ON users(verified) WHERE verified = TRUE;
CREATE INDEX idx_users_kyc_status ON users(kyc_status);

-- Moments
CREATE INDEX idx_moments_user_id ON moments(user_id);
CREATE INDEX idx_moments_category ON moments(category);
CREATE INDEX idx_moments_status ON moments(status);
CREATE INDEX idx_moments_date ON moments(date);
CREATE INDEX idx_moments_coordinates ON moments USING GIST(coordinates);
CREATE INDEX idx_moments_active ON moments(status, date) WHERE status = 'active';

-- Composite indexes for common queries (N+1 prevention)
CREATE INDEX idx_moments_user_status ON moments(user_id, status);
CREATE INDEX idx_moments_status_created ON moments(status, created_at DESC);
CREATE INDEX idx_moments_category_status ON moments(category, status);

-- Requests
CREATE INDEX idx_requests_moment_id ON requests(moment_id);
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_pending ON requests(moment_id, status) WHERE status = 'pending';

-- Conversations (GIN for array containment queries)
CREATE INDEX idx_conversations_participant_ids ON conversations USING GIN(participant_ids);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_unread ON messages(conversation_id, read_at) WHERE read_at IS NULL;

-- Transactions
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);

-- Escrow
CREATE INDEX idx_escrow_sender ON escrow_transactions(sender_id);
CREATE INDEX idx_escrow_recipient ON escrow_transactions(recipient_id);
CREATE INDEX idx_escrow_status ON escrow_transactions(status);
CREATE INDEX idx_escrow_expires ON escrow_transactions(expires_at) WHERE status = 'pending';
```

### Index Analysis Query

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Find unused indexes
SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## Row Level Security (RLS)

### RLS Philosophy

1. **Enable on ALL tables** - No exceptions
2. **Principle of least privilege** - Users only see what they need
3. **Performance optimization** - Use `(select auth.uid())` pattern for cached auth calls
4. **Explicit policies** - Separate policies for SELECT, INSERT, UPDATE, DELETE

### Optimized RLS Pattern

```sql
-- ❌ Bad: auth.uid() called for every row
CREATE POLICY "bad_policy" ON users
FOR SELECT USING (auth.uid() = id);

-- ✅ Good: Cached auth call (auth_rls_initplan optimization)
CREATE POLICY "good_policy" ON users
FOR SELECT USING ((select auth.uid()) = id);
```

### Key RLS Policies

```sql
-- Users: Can view connected profiles only
CREATE POLICY "Users can view connected profiles" ON users
FOR SELECT USING (
  (select auth.uid()) = id
  OR (
    deleted_at IS NULL AND (
      EXISTS (SELECT 1 FROM conversations WHERE (select auth.uid()) = ANY(participant_ids) AND users.id = ANY(participant_ids))
      OR EXISTS (SELECT 1 FROM moments WHERE user_id = users.id AND status = 'active')
    )
  )
);

-- Moments: Anyone can view active, owners can view all
CREATE POLICY "Anyone can view active moments" ON moments
FOR SELECT USING (status = 'active' OR user_id = (select auth.uid()));

-- Messages: Only conversation participants
CREATE POLICY "Users can view messages in own conversations" ON messages
FOR SELECT USING (
  conversation_id IN (
    SELECT id FROM conversations WHERE (select auth.uid()) = ANY(participant_ids)
  )
);

-- Transactions: Private to user
CREATE POLICY "Users can view own transactions" ON transactions
FOR SELECT USING ((select auth.uid()) = user_id);

-- Escrow: Both sender and recipient can view
CREATE POLICY "Users can view own escrow transactions" ON escrow_transactions
FOR SELECT USING (
  (select auth.uid()) = sender_id OR (select auth.uid()) = recipient_id
);
```

### Service Role Access

```sql
-- For system operations (webhooks, cron jobs, admin)
CREATE POLICY "Service role can manage KYC verifications" ON kyc_verifications
FOR ALL USING ((select auth.role()) = 'service_role');
```

---

## Database Functions & Triggers

### Auto-Update Triggers

```sql
-- Generic updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to: users, moments, requests, conversations
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Business Logic Functions

```sql
-- Rating calculation after review
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET
    rating = (SELECT COALESCE(AVG(rating)::DECIMAL(2,1), 0) FROM reviews WHERE reviewed_id = NEW.reviewed_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE reviewed_id = NEW.reviewed_id)
  WHERE id = NEW.reviewed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Participant count management
CREATE OR REPLACE FUNCTION update_moment_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
      UPDATE moments SET current_participants = current_participants + 1 WHERE id = NEW.moment_id;
    ELSIF OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
      UPDATE moments SET current_participants = GREATEST(0, current_participants - 1) WHERE id = NEW.moment_id;
    END IF;
  END IF;

  -- Auto-update moment status
  UPDATE moments SET status = CASE
    WHEN current_participants >= max_participants THEN 'full'
    WHEN status = 'full' AND current_participants < max_participants THEN 'active'
    ELSE status
  END WHERE id = COALESCE(NEW.moment_id, OLD.moment_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### Escrow Functions

```sql
-- Create escrow with balance check
CREATE OR REPLACE FUNCTION create_escrow_transaction(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_amount DECIMAL,
  p_moment_id UUID,
  p_release_condition TEXT DEFAULT 'proof_verified'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_sender_balance DECIMAL;
  v_escrow_id UUID;
BEGIN
  -- Validation
  IF p_sender_id = p_recipient_id THEN
    RAISE EXCEPTION 'Cannot escrow to yourself';
  END IF;

  -- Lock sender and check balance
  SELECT balance INTO STRICT v_sender_balance
  FROM users WHERE id = p_sender_id FOR UPDATE;

  IF v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds: % < %', v_sender_balance, p_amount;
  END IF;

  -- Debit sender
  UPDATE users SET balance = balance - p_amount WHERE id = p_sender_id;

  -- Create escrow record
  INSERT INTO escrow_transactions (sender_id, recipient_id, amount, moment_id, release_condition)
  VALUES (p_sender_id, p_recipient_id, p_amount, p_moment_id, p_release_condition)
  RETURNING id INTO v_escrow_id;

  RETURN jsonb_build_object('success', true, 'escrowId', v_escrow_id);
END;
$$;

-- Release escrow to recipient
CREATE OR REPLACE FUNCTION release_escrow(p_escrow_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_escrow RECORD;
BEGIN
  SELECT * INTO STRICT v_escrow FROM escrow_transactions WHERE id = p_escrow_id FOR UPDATE;

  IF v_escrow.status != 'pending' THEN
    RAISE EXCEPTION 'Escrow not in pending status';
  END IF;

  -- Credit recipient
  UPDATE users SET balance = balance + v_escrow.amount WHERE id = v_escrow.recipient_id;

  -- Update escrow status
  UPDATE escrow_transactions SET status = 'released', released_at = NOW() WHERE id = p_escrow_id;

  RETURN jsonb_build_object('success', true, 'status', 'released');
END;
$$;
```

### Geospatial Search

```sql
-- Search moments within radius
CREATE OR REPLACE FUNCTION search_moments_nearby(
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_radius_km DOUBLE PRECISION DEFAULT 50,
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  location TEXT,
  date TIMESTAMPTZ,
  price DECIMAL,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id, m.title, m.category, m.location, m.date, m.price,
    ST_Distance(m.coordinates::geography, ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography) / 1000 AS distance_km
  FROM moments m
  WHERE
    m.status = 'active'
    AND m.date > NOW()
    AND (p_category IS NULL OR m.category = p_category)
    AND ST_DWithin(m.coordinates::geography, ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography, p_radius_km * 1000)
  ORDER BY distance_km
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                         │
│  - Input validation (Zod schemas)                                │
│  - Rate limiting (Edge functions + rate_limits table)            │
│  - JWT token verification                                        │
├─────────────────────────────────────────────────────────────────┤
│                        DATABASE LAYER                            │
│  - Row Level Security (RLS) on ALL tables                        │
│  - SECURITY DEFINER functions with search_path hardening         │
│  - Check constraints for data integrity                          │
│  - Foreign key constraints for referential integrity             │
├─────────────────────────────────────────────────────────────────┤
│                        AUDIT LAYER                               │
│  - audit_logs table for all sensitive operations                 │
│  - Transaction logging for financial compliance                  │
│  - Admin action tracking                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Security Best Practices

1. **SECURITY DEFINER Functions**: All custom functions use `SECURITY DEFINER` with explicit `search_path = public, pg_temp` to prevent search path injection.

2. **RLS Optimization**: All policies use `(select auth.uid())` pattern to cache auth calls.

3. **Service Role Separation**: Admin operations use `service_role` key, never exposed to clients.

4. **Sensitive Data Protection**:
   - Passwords hashed by Supabase Auth
   - TOTP secrets stored encrypted
   - PII fields (phone, email) redacted in logs

5. **Rate Limiting**:
   - Table-based rate limits with configurable windows
   - Edge function middleware for API protection

---

## Scalability Considerations

### Current Architecture (MVP)

- Single Supabase project (shared PostgreSQL instance)
- All tables in `public` schema
- Suitable for: 0 - 100K users

### Growth Path

#### Phase 1: Optimization (100K - 500K users)

1. **Read Replicas**: Enable Supabase read replicas for query distribution
2. **Connection Pooling**: Configure PgBouncer (built into Supabase)
3. **Query Optimization**:
   - Add covering indexes for hot queries
   - Materialize expensive views
4. **Cache Layer**: Add Redis for session/feed caching

#### Phase 2: Sharding Preparation (500K - 2M users)

1. **Archive Old Data**: Move completed moments/messages to archive tables
2. **Table Partitioning**: Partition `messages`, `transactions` by date
3. **Tenant Isolation**: Prepare for regional sharding

```sql
-- Example: Partition messages by month
CREATE TABLE messages_partitioned (
  LIKE messages INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE messages_2025_01 PARTITION OF messages_partitioned
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

#### Phase 3: Multi-Region (2M+ users)

1. **Geographic Sharding**: Deploy Supabase projects per region
2. **Global Load Balancer**: Route users to nearest region
3. **Event-Based Sync**: Use pg_cron + webhooks for cross-region sync

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Query response (P95) | < 50ms | pg_stat_statements |
| Connection pool | 100 concurrent | Supabase dashboard |
| RLS overhead | < 10ms | EXPLAIN ANALYZE |
| Index hit ratio | > 99% | pg_stat_user_tables |

---

## Performance Monitoring

### Key Queries

```sql
-- Top slow queries
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 20;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Table bloat
SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::text)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC;

-- Lock monitoring
SELECT pg_class.relname, pg_locks.mode, COUNT(*)
FROM pg_locks
JOIN pg_class ON pg_locks.relation = pg_class.oid
WHERE pg_locks.granted = true
GROUP BY pg_class.relname, pg_locks.mode;
```

### Automated Health Checks

Located at: `supabase/scripts/health-check.sh`

---

## Migration Strategy

### Workflow

1. **Create Migration**:
   ```bash
   supabase migration new your_migration_name
   ```

2. **Edit Migration**: Add SQL to `supabase/migrations/TIMESTAMP_name.sql`

3. **Test Locally**:
   ```bash
   supabase db reset  # Applies all migrations
   ```

4. **Deploy to Staging**:
   ```bash
   supabase db push --db-url $STAGING_URL
   ```

5. **Deploy to Production**:
   ```bash
   supabase db push --db-url $PRODUCTION_URL
   ```

### Migration Best Practices

1. **Always Idempotent**: Use `IF NOT EXISTS`, `IF EXISTS`
2. **Never Drop Production Data**: Prefer soft deletes, archive tables
3. **Test Rollbacks**: Document rollback procedure for each migration
4. **Version Lock**: All migrations are tracked in source control

### Regenerating Types

```bash
# Generate TypeScript types from database
pnpm db:generate-types

# Output: apps/mobile/src/types/database.types.ts
```

---

## Appendix: Complete Table List

| Table | Domain | RLS | Realtime | Description |
|-------|--------|-----|----------|-------------|
| users | Core | ✅ | ❌ | User profiles |
| moments | Core | ✅ | ❌ | Travel experiences |
| requests | Core | ✅ | ❌ | Join requests |
| conversations | Chat | ✅ | ✅ | Chat threads |
| conversation_participants | Chat | ✅ | ✅ | Normalized participants |
| messages | Chat | ✅ | ✅ | Chat messages |
| reviews | Trust | ✅ | ❌ | User reviews |
| notifications | Comms | ✅ | ✅ | Push notifications |
| reports | Safety | ✅ | ❌ | User reports |
| blocks | Safety | ✅ | ❌ | User blocks |
| favorites | Social | ✅ | ❌ | Saved moments |
| transactions | Payment | ✅ | ❌ | Financial transactions |
| escrow_transactions | Payment | ✅ | ❌ | Escrow holds |
| subscription_plans | Payment | ✅ | ❌ | Plan definitions |
| user_subscriptions | Payment | ✅ | ❌ | User subscriptions |
| kyc_verifications | Trust | ✅ | ❌ | KYC history |
| proof_verifications | Trust | ✅ | ❌ | Proof verification |
| admin_users | Admin | ✅ | ❌ | Admin accounts |
| admin_sessions | Admin | ✅ | ❌ | Admin sessions |
| audit_logs | Audit | ✅ | ❌ | Audit trail |
| role_permissions | Admin | ✅ | ❌ | RBAC permissions |
| feed_delta | Infra | ✅ | ❌ | Incremental sync |
| rate_limits | Infra | ✅ | ❌ | Rate limiting |
| cdn_invalidation_logs | Infra | ✅ | ❌ | CDN cache logs |

---

*Document Version: 1.0.0*
*Last Updated: 2025-12-22*
*Author: Database Architecture Team*
