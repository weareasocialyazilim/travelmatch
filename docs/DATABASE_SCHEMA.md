# TravelMatch Database Schema Reference

This document provides a comprehensive reference for the TravelMatch PostgreSQL database schema, following PostgreSQL best practices.

## Overview

TravelMatch uses **PostgreSQL** via **Supabase** with the following extensions:
- `uuid-ossp` - UUID generation
- `postgis` - Geospatial queries and data types
- `pg_cron` - Scheduled job execution (escrow auto-refund)

## Design Principles

The schema follows these PostgreSQL best practices:

1. **Primary Keys**: UUID for global uniqueness (required for Supabase auth integration and mobile client sharing)
2. **Normalization**: 3NF with selective denormalization only for proven performance needs
3. **NOT NULL**: Applied wherever semantically required
4. **Data Types**:
   - `TEXT` for strings (not VARCHAR)
   - `NUMERIC` for money
   - `TIMESTAMPTZ` for all timestamps
   - `GEOGRAPHY(POINT, 4326)` for coordinates
5. **Indexing**: FK columns indexed manually, composite indexes for common query patterns
6. **RLS**: Row Level Security enabled on all tables

## Core Tables

### users

Core user profiles linked to Supabase auth.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  coordinates GEOGRAPHY(POINT, 4326),  -- For proximity queries
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
  deleted_at TIMESTAMPTZ  -- Soft delete
);
```

**Indexes:**
- `idx_users_email` - Email lookups
- `idx_users_coordinates` (GIST) - Proximity searches
- `idx_users_verified_coordinates` - Verified users near location
- `idx_users_active` - Active (non-deleted) users
- `idx_users_rating` - Top-rated users

### moments

Travel experiences/events that users can join.

```sql
CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  coordinates GEOGRAPHY(POINT, 4326),
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

**Indexes:**
- `idx_moments_user_id` - User's moments (FK index)
- `idx_moments_coordinates` (GIST) - Location-based discovery
- `idx_moments_active` - Active moments by date
- `idx_moments_category_date` - Category browsing
- `idx_moments_is_featured` - Featured moments

### requests

Participation requests for moments.

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

**Indexes:**
- `idx_requests_moment_id` - Requests for a moment
- `idx_requests_user_id` - User's requests
- `idx_requests_pending` - Pending requests for processing

## Messaging Tables

### conversations

Chat channels between users.

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_ids UUID[] NOT NULL,  -- Legacy, use conversation_participants
  moment_id UUID REFERENCES moments(id) ON DELETE SET NULL,
  last_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  migrated_to_junction BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### conversation_participants (Junction Table)

Normalized conversation membership (preferred over participant_ids array).

```sql
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT FALSE,
  UNIQUE(conversation_id, user_id)
);
```

### messages

Individual chat messages.

```sql
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

**Indexes:**
- `idx_messages_conversation_id` - Messages in conversation
- `idx_messages_unread` - Unread messages for notification counts

## Financial Tables

### transactions

Financial ledger for all money movements.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  moment_id UUID REFERENCES moments(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN (
    'deposit', 'withdrawal', 'payment', 'refund', 'gift',
    'escrow_hold', 'escrow_release', 'escrow_refund'
  )),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### escrow_transactions

Escrow system for high-value transactions.

```sql
CREATE TABLE escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  moment_id UUID REFERENCES moments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'released', 'refunded', 'disputed', 'expired')
  ),
  release_condition TEXT NOT NULL DEFAULT 'proof_verified' CHECK (
    release_condition IN ('proof_verified', 'manual_approval', 'timer_expiry')
  ),
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

**Key Functions:**
- `create_escrow_transaction()` - Creates escrow and debits sender
- `release_escrow()` - Releases funds to recipient
- `refund_escrow()` - Refunds to sender

## Subscription Tables

### subscription_plans

Available subscription tiers (natural key).

```sql
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,  -- 'free', 'starter', 'pro', 'vip'
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  interval TEXT CHECK (interval IN ('month', 'year')),
  features JSONB DEFAULT '[]',
  is_popular BOOLEAN DEFAULT FALSE,
  color TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_subscriptions

User subscription state.

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES subscription_plans(id),
  status TEXT CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  provider TEXT DEFAULT 'stripe',
  provider_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Trust & Verification Tables

### reviews

User ratings and reviews.

```sql
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
```

### proof_verifications

AI-powered proof verification results.

```sql
CREATE TABLE proof_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  claimed_location TEXT NOT NULL,
  claimed_date TIMESTAMPTZ,
  ai_verified BOOLEAN NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_reasoning TEXT,
  detected_location TEXT,
  red_flags JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('verified', 'rejected', 'needs_review')),
  ai_model TEXT NOT NULL DEFAULT 'claude-3-5-sonnet-20241022',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Moderation Tables

### reports

Content moderation reports.

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  CHECK (reported_user_id IS NOT NULL OR reported_moment_id IS NOT NULL)
);
```

### blocks

User blocking relationships.

```sql
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);
```

## Admin Tables

### admin_users

Admin panel users with RBAC.

```sql
CREATE TYPE admin_role AS ENUM (
  'super_admin', 'manager', 'moderator', 'finance', 'marketing', 'support', 'viewer'
);

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role admin_role NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  requires_2fa BOOLEAN DEFAULT true,
  totp_secret TEXT,
  totp_enabled BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### audit_logs

Audit trail for admin actions.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Row Level Security (RLS)

All tables have RLS enabled with policies following the principle of least privilege:

- **Users**: Can view public profiles, update own profile
- **Moments**: Can view active moments, CRUD own moments
- **Requests**: Can view/manage requests where they're host or requester
- **Messages**: Can only access conversations they participate in
- **Transactions**: Can only view own transactions
- **Escrow**: Can only view transactions where they're sender or recipient

## Indexing Strategy

### FK Indexes (Manual)
PostgreSQL doesn't auto-create indexes on FK columns. All FKs have manual indexes:
- `idx_moments_user_id`
- `idx_requests_moment_id`, `idx_requests_user_id`
- `idx_messages_conversation_id`, `idx_messages_sender_id`
- `idx_transactions_user_id`, `idx_transactions_moment_id`

### Spatial Indexes (GIST)
- `idx_moments_coordinates` - Location-based moment discovery
- `idx_users_coordinates` - Find travelers nearby

### Partial Indexes
- `idx_users_verified` WHERE verified = TRUE
- `idx_moments_active` WHERE status = 'active'
- `idx_requests_pending` WHERE status = 'pending'
- `idx_notifications_unread` WHERE read = FALSE

### Composite Indexes
Ordered by selectivity for common query patterns:
- `(user_id, status)` - User's filtered items
- `(status, created_at DESC)` - Admin queues
- `(category, date DESC)` - Discovery feeds

## JSONB Usage

JSONB is used sparingly for optional/semi-structured data:
- `users.notification_preferences` - Per-user notification settings
- `users.privacy_settings` - Privacy configuration
- `messages.metadata` - Message-type-specific data
- `subscription_plans.features` - Plan feature list
- `proof_verifications.red_flags` - AI detection results

All JSONB columns have GIN indexes where queried.

## Best Practices Applied

| Practice | Implementation |
|----------|---------------|
| TIMESTAMPTZ not TIMESTAMP | All timestamp columns use WITH TIME ZONE |
| TEXT not VARCHAR | All string columns use TEXT |
| NUMERIC for money | balance, amount, price all use DECIMAL/NUMERIC |
| FK indexes | All foreign keys have manual indexes |
| Soft deletes | users.deleted_at with partial index |
| Enum for stable values | admin_role, task_priority, task_status |
| CHECK for evolving values | status fields use TEXT + CHECK |
| UUID for PKs | Required for Supabase auth and client sharing |
| JSONB not JSON | All JSON columns use JSONB with GIN indexes |
| Table comments | All tables documented |

## Migration Files

Migrations are in `supabase/migrations/` with format `YYYYMMDDHHMMSS_description.sql`:

- `20241205000000_initial_schema.sql` - Core tables
- `20241205000001_add_indexes.sql` - Performance indexes
- `20241205000002_enable_rls.sql` - Row Level Security
- `20251206000000_add_subscriptions.sql` - Subscription system
- `20251209000005_normalize_conversations.sql` - Junction table migration
- `20251213000002_escrow_system_backend.sql` - Escrow functionality
- `20251217000001_create_proof_verifications.sql` - AI verification
- `20251222000000_schema_best_practices.sql` - Best practices fixes

## Commands

```bash
# Start local Supabase
pnpm db:start

# Apply migrations
pnpm db:migrate

# Generate TypeScript types
pnpm db:generate-types

# Test RLS policies
pnpm db:test:rls

# Run all database tests
pnpm db:test:all
```
