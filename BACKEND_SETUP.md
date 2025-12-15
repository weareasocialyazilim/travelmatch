# 🚀 TravelMatch Backend Setup Guide

## 📋 Pre-Launch Checklist

### ✅ Tamamlandı
- [x] Supabase project setup
- [x] Database schema migrations (43 migrations)
- [x] Row Level Security (RLS) policies
- [x] Edge Functions deployment (20+ functions)
- [x] Atomic transaction RPC (BLOCKER #1)
- [x] Strict RLS policies (BLOCKER #2)
- [x] Escrow system backend (BLOCKER #3)
- [x] Docker setup (docker-compose.yml)
- [x] GitHub Actions CI/CD (24 workflows)

### ❌ Acil Yapılmalı (Launch Blocker)

#### 1. pg_cron Extension Enable
```sql
-- Supabase Dashboard → SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Verify
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Schedule auto-refund job
SELECT cron.schedule(
  'refund-expired-escrow',
  '0 2 * * *',  -- Her gün 02:00
  $$SELECT refund_expired_escrow();$$
);
```

**Neden Gerekli:** Escrow auto-refund çalışması için

#### 2. Escrow Indexes Deploy
```bash
# Migration zaten oluşturuldu:
supabase/migrations/20251213000003_escrow_indexes.sql

# Deploy et:
supabase db push
```

**Neden Gerekli:** >1000 escrow transaction sonrası performans

#### 3. Environment Variables Tamamla

**⚡ RECOMMENDED: Infisical Kullan (Centralized Secrets)**

See `INFISICAL_SETUP.md` for full setup guide.

**Quick Start:**
```bash
# Install CLI
brew install infisical/get-cli/infisical

# Pull secrets
cd apps/mobile
infisical login
infisical export --env=prod --format=dotenv > .env.production
```

**Alternative: Manual .env (Legacy)**

**Mobile App (.env.production):**
```bash
# Mapbox (Al: https://account.mapbox.com/)
EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN=pk.eyJ1...
EXPO_PUBLIC_MAPBOX_SECRET_TOKEN=sk.eyJ1...

# PostHog Analytics (Al: https://posthog.com/)
EXPO_PUBLIC_POSTHOG_API_KEY=phc_...
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry Error Tracking (Al: https://sentry.io/)
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Google Analytics (Al: https://analytics.google.com/)
EXPO_PUBLIC_GOOGLE_ANALYTICS_ID=G-...
```

**Edge Functions (Supabase Dashboard → Settings → Edge Functions → Secrets):**
```bash
# Stripe Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (AI quality scoring)
OPENAI_API_KEY=sk-...

# Resend (Email service)
RESEND_API_KEY=re_...

# Cloudflare (Image CDN - 60-80% faster image loads)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_IMAGES_TOKEN=cf_...
```

**Setup Guide:** See `CLOUDFLARE_SETUP.md`

---

## 🏗️ Architecture Overview

### Tech Stack
```
Frontend:
  ├── React Native + Expo SDK 54
  ├── TypeScript 5.3
  ├── FlashList (60% faster scrolling)
  ├── MMKV Storage (10-20x faster I/O)
  └── PostHog Analytics

Backend:
  ├── Supabase (PostgreSQL 15)
  ├── Edge Functions (Deno)
  ├── Row Level Security (RLS)
  ├── Realtime subscriptions
  └── Storage buckets

Infrastructure:
  ├── Docker Compose (local dev)
  ├── GitHub Actions (CI/CD)
  ├── Sentry (error tracking)
  └── PostHog (product analytics)
```

### Database Schema
```
Core Tables:
  ├── users (auth + profile)
  ├── moments (travel experiences)
  ├── transactions (payment history)
  ├── escrow_transactions (NEW - BLOCKER #3)
  ├── matches (user connections)
  ├── messages (chat)
  ├── favorites (bookmarks)
  └── proofs (verification media)

Functions:
  ├── atomic_transfer() (NEW - BLOCKER #1)
  ├── create_escrow_transaction()
  ├── release_escrow()
  ├── refund_escrow()
  └── refund_expired_escrow()
```

---

## 🔧 Local Development

### 1. Start Supabase
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db reset
```

### 2. Start Docker Services
```bash
docker-compose up -d
```

### 3. Verify Services
```bash
# PostgreSQL: http://localhost:54322
# Supabase Studio: http://localhost:54323
# Edge Functions: http://localhost:54321/functions/v1
```

---

## 📊 Database Migrations

### Mevcut Migrations (43 dosya)

**Core Schema:**
- `20241205000000_initial_schema.sql` - Base tables
- `20241205000001_add_indexes.sql` - Performance indexes (121 total)
- `20241205000002_enable_rls.sql` - RLS policies
- `20241205000003_create_functions.sql` - PostgreSQL functions

**Security:**
- `20241207000000_payment_security.sql` - Payment validations
- `20251206000001_strict_security.sql` - Enhanced RLS
- `20251213000001_strict_rls_policies.sql` - **NEW: BLOCKER #2**

**Payment System:**
- `20251213000000_atomic_transfer_rpc.sql` - **NEW: BLOCKER #1**
- `20251213000002_escrow_system_backend.sql` - **NEW: BLOCKER #3**
- `20251213000003_escrow_indexes.sql` - **NEW: Performance**

### Apply Migrations
```bash
# Local
supabase db reset

# Production (Supabase Dashboard)
# → Database → Migrations → Upload SQL files
```

---

## 🔒 Security Checklist

### ✅ Implemented
- [x] Row Level Security (RLS) on all tables
- [x] SECURITY DEFINER functions with search_path
- [x] Input validation (CHECK constraints)
- [x] Atomic transactions (race condition prevention)
- [x] Service role key protection
- [x] CORS configuration
- [x] Rate limiting (Kong gateway)

### ⚠️ To Configure
- [ ] Enable pg_cron extension
- [ ] Set up Supabase Secrets for API keys
- [ ] Configure IP allowlist (optional)
- [ ] Set up database backups (auto in Supabase Pro)

---

## 📈 Performance Optimizations

### ✅ Implemented
- **FlashList:** 60% faster scrolling
- **MMKV Storage:** 10-20x faster I/O
- **Database Indexes:** 121 indexes for fast queries
- **Atomic Transactions:** Single RPC instead of multiple queries
- **Connection Pooling:** Supavisor enabled

### 🎯 Recommended
- **Redis Cache:** Upstash Redis for session/query caching
- **CDN:** Cloudflare for image/video delivery
- **Image Optimization:** Imgix or Cloudinary
- **Database Read Replicas:** For high traffic (Supabase Pro)

---

## 🧪 Testing

### GitHub Actions Workflows
```
ci.yml                  - Lint, type-check, unit tests
e2e-tests.yml          - End-to-end testing (Detox)
security-rls-tests.yml - RLS policy validation
performance-ci.yml     - Performance benchmarks
accessibility-audit.yml - A11y compliance
```

### Run Tests Locally
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# RLS tests
supabase test db
```

---

## 🚨 Known Issues & Workarounds

### 1. pg_cron Not Enabled
**Impact:** Escrow auto-refund won't work
**Workaround:** Manual SQL query daily
**Fix:** Enable pg_cron (see checklist above)

### 2. Mapbox Tokens Missing
**Impact:** Maps won't load
**Workaround:** Disable map features
**Fix:** Add Mapbox tokens to .env.production

### 3. PostHog Analytics Not Configured
**Impact:** No product analytics
**Workaround:** None (non-critical)
**Fix:** Create PostHog account and add API key

---

## 📞 Support

**Supabase Issues:**
- Dashboard: https://bjikxgtbptrvawkguypv.supabase.co
- Docs: https://supabase.com/docs

**Database Queries:**
```sql
-- Check RLS policies
SELECT * FROM pg_policies;

-- Check running queries
SELECT * FROM pg_stat_activity;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

**Last Updated:** 2025-12-13
**Backend Status:** ✅ Production Ready (with checklist items completed)
