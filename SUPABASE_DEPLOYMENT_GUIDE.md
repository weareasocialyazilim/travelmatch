# 🚀 TravelMatch Supabase Production Setup Guide

**Project ID:** `bjikxgtbptrvawkguypv`
**Status:** Ready for Production Deployment
**Last Updated:** 2025-12-15

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Already Complete
- [x] 38 Database migrations (idempotent, production-ready)
- [x] RLS policies on all 10 tables
- [x] Storage policies on 5 buckets
- [x] Edge Functions (12 functions)
- [x] Seed data with edge cases
- [x] Auto-profile trigger
- [x] Audit logging
- [x] Production config.toml

---

## 🔧 STEP-BY-STEP DEPLOYMENT

### Prerequisites
```bash
# Install Supabase CLI (choose one method)

# Method 1: Homebrew (Mac/Linux)
brew install supabase/tap/supabase

# Method 2: NPM (project-local)
npx supabase --version

# Method 3: Docker
docker pull supabase/cli
```

---

## 🗄️ DATABASE SETUP

### Step 1: Login to Supabase
```bash
npx supabase login
```

You'll be redirected to browser to authorize. Copy the access token.

### Step 2: Link Project
```bash
# Link to production project
npx supabase link --project-ref bjikxgtbptrvawkguypv

# Verify link
npx supabase projects list
```

### Step 3: Apply Migrations
```bash
# Dry run (check what will be applied)
npx supabase db diff --linked

# Apply all migrations to production
npx supabase db push

# Expected output:
# ✓ Applying migration 20241205000000_initial_schema.sql...
# ✓ Applying migration 20241205000001_add_indexes.sql...
# ... (38 migrations)
# ✓ All migrations applied successfully
```

### Step 4: Verify Database Schema
```bash
# Generate TypeScript types (verify schema)
npx supabase gen types typescript --linked > apps/mobile/src/types/database.generated.types.ts

# Compare with existing types
diff apps/mobile/src/types/database.types.ts apps/mobile/src/types/database.generated.types.ts
```

### Step 5: Apply Seed Data (Development Only!)
```bash
# WARNING: Only run this in development/staging
# DO NOT run in production (creates test data)

npx supabase db reset --db-url "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" -f supabase/seed-production-ready.sql
```

---

## ⚙️ EDGE FUNCTIONS DEPLOYMENT

### Step 1: Deploy All Functions
```bash
# Deploy all functions at once
npx supabase functions deploy

# Or deploy individually
npx supabase functions deploy payment/create-payment-intent
npx supabase functions deploy payment/confirm-payment
npx supabase functions deploy payment/stripe-webhook
npx supabase functions deploy verify-kyc
npx supabase functions deploy transfer-funds
npx supabase functions deploy export-user-data
npx supabase functions deploy cdn-invalidate
npx supabase functions deploy transcribe-video
npx supabase functions deploy video-processing
npx supabase functions deploy geocode
npx supabase functions deploy audit-logging
npx supabase functions deploy feed-delta
```

### Step 2: Set Environment Variables
```bash
# Navigate to Supabase Dashboard
# https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/settings/functions

# Add these secrets (CRITICAL):
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
npx supabase secrets set OPENAI_API_KEY=sk-xxxxx
npx supabase secrets set CLOUDFLARE_STREAM_API_KEY=xxxxx
npx supabase secrets set CLOUDFLARE_STREAM_ACCOUNT_ID=xxxxx
npx supabase secrets set UPSTASH_REDIS_REST_URL=https://xxxxx
npx supabase secrets set UPSTASH_REDIS_REST_TOKEN=xxxxx
npx supabase secrets set GOOGLE_MAPS_SERVER_KEY=AIzaSy...

# Verify secrets
npx supabase secrets list
```

### Step 3: Test Edge Functions
```bash
# Test payment intent creation
curl -X POST \
  "https://bjikxgtbptrvawkguypv.supabase.co/functions/v1/payment/create-payment-intent" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "momentId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "amount": 45.00,
    "currency": "TRY"
  }'

# Expected: 200 OK with clientSecret
```

---

## 🗂️ STORAGE BUCKETS SETUP

### Step 1: Create Buckets
```bash
# Buckets are created via migrations (20251213000000_secure_storage_policies.sql)
# Verify they exist in Dashboard:
# https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/storage/buckets
```

### Step 2: Verify Buckets
```sql
-- Run in SQL Editor
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY created_at;

-- Expected output:
-- avatars       | true  | 5MB   | image/*
-- kyc_docs      | false | 10MB  | image/*, pdf
-- moment-images | true  | 20MB  | image/*
-- profile-proofs| false | 10MB  | image/*
-- video-uploads | false | 500MB | video/*
```

### Step 3: Test Upload
```bash
# Test avatar upload
curl -X POST \
  "https://bjikxgtbptrvawkguypv.supabase.co/storage/v1/object/avatars/test/avatar.png" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: image/png" \
  --data-binary "@test-image.png"

# Expected: 200 OK
```

---

## 🔐 SECURITY VERIFICATION

### RLS Policies Check
```sql
-- Run in SQL Editor
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected: 30+ policies across 10 tables
```

### Storage Policies Check
```sql
SELECT
  bucket_id,
  name,
  definition
FROM storage.policies
ORDER BY bucket_id, name;

-- Expected: 20+ policies across 5 buckets
```

### Audit Logging Check
```sql
-- Verify audit_logs table exists
SELECT COUNT(*) FROM audit_logs;

-- Expected: 0 (or positive if events logged)
```

---

## 🌍 ENVIRONMENT VARIABLES

### Mobile App (.env.production)
```bash
# Create apps/mobile/.env.production
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_SUPABASE_URL=https://isvstmzuyxuwptrrhkyi.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... # Get from Dashboard
EXPO_PUBLIC_API_URL=https://isvstmzuyxuwptrrhkyi.supabase.co/functions/v1
EXPO_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Verification
```bash
# Test environment loading
cd apps/mobile
EXPO_PUBLIC_APP_ENV=production npx expo start

# Should log: "✅ Environment validation passed"
# Should log: "📱 Running in production mode"
```

---

## 🧪 PRODUCTION TESTING

### Test Script: Verify All Components
```bash
#!/bin/bash
# File: scripts/verify-supabase.sh

echo "🔍 Verifying Supabase Production Setup..."

# 1. Test database connection
echo "1️⃣ Testing database connection..."
psql "postgresql://postgres:[PASSWORD]@db.bjikxgtbptrvawkguypv.supabase.co:5432/postgres" -c "SELECT version();"

# 2. Test API endpoint
echo "2️⃣ Testing API endpoint..."
curl -f https://bjikxgtbptrvawkguypv.supabase.co/rest/v1/ \
  -H "apikey: $SUPABASE_ANON_KEY" || exit 1

# 3. Test Edge Function
echo "3️⃣ Testing Edge Functions..."
curl -f https://bjikxgtbptrvawkguypv.supabase.co/functions/v1/get-user-profile \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" || exit 1

# 4. Test Storage
echo "4️⃣ Testing Storage..."
curl -f https://bjikxgtbptrvawkguypv.supabase.co/storage/v1/bucket \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" || exit 1

echo "✅ All Supabase components verified!"
```

### Run Test
```bash
chmod +x scripts/verify-supabase.sh
./scripts/verify-supabase.sh
```

---

## 📊 POST-DEPLOYMENT VERIFICATION

### Check Migration Status
```bash
npx supabase migration list --linked

# Expected: All 38 migrations marked as [applied]
```

### Check Function Logs
```bash
# View real-time logs
npx supabase functions logs payment/create-payment-intent --tail

# Check for errors
npx supabase functions logs --tail | grep ERROR
```

### Monitor Database Performance
```sql
-- Top 10 slowest queries
SELECT
  mean_exec_time::int as avg_ms,
  calls,
  query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 🚨 TROUBLESHOOTING

### Issue: Migrations fail
```bash
# Check current migration version
npx supabase db version --linked

# Rollback one migration
npx supabase db rollback --linked

# Reapply
npx supabase db push
```

### Issue: Edge Function timeout
```bash
# Increase timeout in function (max 300s)
# Edit supabase/functions/[function]/index.ts
# Add: Deno.serve({ port: 8000, timeout: 60000 }, handler)
```

### Issue: Storage upload fails
```sql
-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';

-- Test policy manually
SELECT storage.can_insert_object(
  'avatars',
  'user-id/avatar.png',
  'user-id'::uuid,
  jsonb_build_object('size', 100000, 'mimetype', 'image/png')
);
```

---

## 📚 ADDITIONAL RESOURCES

### Supabase Dashboard
- Project: https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv
- Database: https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/editor
- Edge Functions: https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/functions
- Storage: https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/storage/buckets
- Logs: https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/logs/explorer

### Documentation
- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Storage](https://supabase.com/docs/guides/storage)

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Install Supabase CLI
- [ ] Login and link project
- [ ] Apply all 38 migrations (`npx supabase db push`)
- [ ] Deploy all 12 Edge Functions
- [ ] Set environment secrets (Stripe, OpenAI, etc.)
- [ ] Verify 5 storage buckets exist
- [ ] Test API endpoints
- [ ] Test Edge Functions
- [ ] Test storage uploads
- [ ] Run verification script
- [ ] Monitor logs for errors
- [ ] Update mobile app .env.production

---

## 🎯 QUICK START (TL;DR)

```bash
# 1. Install CLI
brew install supabase/tap/supabase

# 2. Login
npx supabase login

# 3. Link project
npx supabase link --project-ref bjikxgtbptrvawkguypv

# 4. Deploy database
npx supabase db push

# 5. Deploy functions
npx supabase functions deploy

# 6. Set secrets
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# 7. Test
./scripts/verify-supabase.sh

# 8. Done! 🎉
```

---

**Status:** 🟢 Ready for Production Deployment
**Next Action:** Run deployment checklist above
**Support:** See PRODUCTION_PREFLIGHT_CHECKLIST.md for comprehensive guide
