# 🚀 Supabase - TravelMatch Backend

> Enterprise-grade backend infrastructure powered by Supabase

## 📊 Quick Stats

| Component | Count | Lines |
|-----------|-------|-------|
| Migrations | 48 | 7,140 |
| Edge Functions | 20 | 5,242 |
| RLS Policies | 89 | - |
| Database Tables | 27 | - |
| Indexes | 174 | - |
| Cron Jobs | 4 | - |

## 📁 Directory Structure

```
supabase/
├── config.toml              # Project configuration
├── .env.example             # Environment template
├── seed.sql                 # Development seed data
├── seed-production-ready.sql # Production seed data
│
├── migrations/              # Database migrations (source of truth)
│   ├── 20241205*           # Initial schema
│   └── 20251218*           # Latest security fixes
│
├── functions/               # Edge Functions
│   ├── _shared/            # Shared utilities
│   │   ├── security-middleware.ts
│   │   ├── rateLimit.ts
│   │   ├── cache.ts
│   │   └── errorHandler.ts
│   │
│   ├── api/                # REST API gateway
│   ├── stripe-webhook/     # Payment webhooks
│   ├── verify-kyc/         # KYC verification
│   ├── transfer-funds/     # Fund transfers
│   └── ...                 # 16 more functions
│
└── tests/                   # Security tests
    ├── rls_policies.test.sql
    ├── function_security.test.sql
    └── storage_security.test.sql
```

## 🔧 Local Development

### Prerequisites
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Deno](https://deno.land/) (for Edge Functions)
- Docker Desktop

### Setup

```bash
# 1. Install Supabase CLI
brew install supabase/tap/supabase

# 2. Start local Supabase
supabase start

# 3. Apply migrations
supabase db reset

# 4. Run Edge Functions locally
supabase functions serve --env-file ./supabase/.env.local
```

### Environment Variables

```bash
# Copy environment template
cp supabase/.env.example supabase/.env.local

# Edit with your values
nano supabase/.env.local
```

## 🗃️ Database Schema

### Core Tables

| Table | Description | RLS |
|-------|-------------|-----|
| `users` | User profiles | ✅ |
| `moments` | Trip/activity listings | ✅ |
| `requests` | Booking requests | ✅ |
| `conversations` | Chat threads | ✅ |
| `messages` | Chat messages | ✅ |
| `transactions` | Payment history | ✅ |
| `escrow_transactions` | Escrow holds | ✅ |

### Supporting Tables

| Table | Description | RLS |
|-------|-------------|-----|
| `reviews` | User reviews | ✅ |
| `favorites` | Saved moments | ✅ |
| `notifications` | Push notifications | ✅ |
| `reports` | Content reports | ✅ |
| `blocks` | User blocks | ✅ |
| `proof_verifications` | Activity proofs | ✅ |

### System Tables

| Table | Description | RLS |
|-------|-------------|-----|
| `rate_limits` | API rate limiting | ✅ |
| `audit_logs` | Security audit trail | ✅ |
| `feed_delta` | Real-time sync | ✅ |
| `cache_invalidation` | CDN cache control | ✅ |

## ⚡ Edge Functions

### Payment Functions
| Function | Method | Auth | Description |
|----------|--------|------|-------------|
| `create-payment-intent` | POST | JWT | Create Stripe PaymentIntent |
| `confirm-payment` | POST | JWT | Confirm payment |
| `stripe-webhook` | POST | Signature | Handle Stripe events |
| `transfer-funds` | POST | JWT | Transfer between users |

### User Functions
| Function | Method | Auth | Description |
|----------|--------|------|-------------|
| `get-user-profile` | GET | JWT | Get user profile |
| `export-user-data` | POST | JWT | GDPR data export |
| `verify-kyc` | POST | JWT | Identity verification |

### Media Functions
| Function | Method | Auth | Description |
|----------|--------|------|-------------|
| `upload-image` | POST | JWT | Upload to Cloudflare |
| `cdn-invalidate` | POST | Service | Invalidate CDN cache |

### Security Functions
| Function | Method | Auth | Description |
|----------|--------|------|-------------|
| `setup-2fa` | POST | JWT | Enable 2FA |
| `verify-2fa` | POST | JWT | Verify 2FA code |
| `audit-logging` | POST | Service | Log security events |

## 🔒 Security Features

### Row Level Security (RLS)
- ✅ All 27 tables have RLS enabled
- ✅ 89 policies covering all CRUD operations
- ✅ Policies use `auth.uid()` for user isolation

### Rate Limiting
- Database-based rate limiting via `check_rate_limit()`
- Redis-based rate limiting via Upstash (optional)
- Per-endpoint and per-user limits

### Authentication
- JWT-based auth via Supabase Auth
- Biometric authentication support
- 2FA with TOTP
- OAuth providers (Google, Apple)

### Audit Logging
- All sensitive operations logged
- IP address tracking
- User action history
- Security event monitoring

## 🕐 Scheduled Jobs (pg_cron)

| Job | Schedule | Description |
|-----|----------|-------------|
| `refund-expired-escrow` | Daily 02:00 UTC | Auto-refund expired escrow |
| `cleanup_feed_delta` | Daily 03:00 UTC | Clean old feed data |
| `cleanup_deep_link_events` | Weekly Sunday | Clean analytics |
| `cleanup_rate_limits` | Daily 02:30 UTC | Purge old limits |

## 📦 Deployment

### Push to Production

```bash
# Deploy migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy --all

# Or deploy specific function
supabase functions deploy stripe-webhook
```

### Secrets Management

```bash
# Set production secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx

# List secrets
supabase secrets list
```

## 🧪 Testing

### Run RLS Tests

```bash
cd supabase/tests
chmod +x run_rls_tests.sh
./run_rls_tests.sh
```

### Test Files
- `rls_policies.test.sql` - Basic RLS tests
- `rls_advanced_security.test.sql` - Edge cases
- `function_security.test.sql` - Function tests
- `storage_security.test.sql` - Storage policies
- `realtime_security.test.sql` - Realtime access
- `mutation_testing.test.sql` - Data mutations

## 📈 Monitoring

### Health Checks
- Supabase Dashboard → Reports
- Edge Function logs in Dashboard
- Database metrics in Grafana (if configured)

### Linter
- Run Supabase Linter regularly
- Fix WARN/ERROR items promptly
- INFO items are advisory

## 🔄 Migration Workflow

```bash
# Create new migration
supabase migration new feature_name

# Edit migration file
# supabase/migrations/TIMESTAMP_feature_name.sql

# Test locally
supabase db reset

# Push to production
supabase db push
```

## 📚 Documentation

- [README_SCHEMA.md](./README_SCHEMA.md) - Schema management
- [SEED_DATA_VALIDATION.md](./SEED_DATA_VALIDATION.md) - Seed data info

## 🆘 Troubleshooting

### Common Issues

**Migration failed**
```bash
# Reset and reapply
supabase db reset
```

**Edge Function not updating**
```bash
# Force redeploy
supabase functions deploy function-name --no-verify-jwt
```

**RLS blocking requests**
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

## 📄 License

Proprietary - TravelMatch © 2024-2025
