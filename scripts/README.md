# 🛠️ TravelMatch Scripts

Utility scripts for setting up and managing TravelMatch infrastructure.

---

## 📋 Available Scripts

### 🎨 UX Research & Design Toolkit

**Location:** `scripts/ux-research/`

Comprehensive toolkit for user-centered research and experience design. See the [UX Research README](./ux-research/README.md) for full documentation.

| Script | Purpose |
|--------|---------|
| `persona_generator.py` | Generate research-backed user personas |
| `journey_mapper.py` | Create customer journey maps |
| `usability_testing.py` | Plan and analyze usability tests |
| `research_synthesizer.py` | Synthesize research into insights |
| `design_validator.py` | Validate designs against heuristics |

**Quick Start:**
```bash
python scripts/ux-research/persona_generator.py --sample
python scripts/ux-research/journey_mapper.py --journey onboarding
python scripts/ux-research/design_validator.py --heuristics
```

---

### 🚀 `setup-supabase.sh`

**Purpose:** Complete Supabase infrastructure setup (migrations, Edge Functions, storage)

**Usage:**
```bash
chmod +x scripts/setup-supabase.sh
./scripts/setup-supabase.sh
```

**What it does:**
1. ✅ Checks Supabase CLI installation
2. ✅ Links to production project (`bjikxgtbptrvawkguypv`)
3. ✅ Verifies 42 migration files
4. ✅ Applies migrations to production (with confirmation)
5. ✅ Deploys all Edge Functions (with confirmation)
6. ✅ Verifies API endpoints (REST, Auth, Storage)
7. ✅ Provides next steps checklist

**Prerequisites:**
- Supabase CLI installed (`brew install supabase/tap/supabase` or use npx)
- Logged in to Supabase (`npx supabase login`)
- `.env.development` file with credentials

**Interactive Prompts:**
- "Apply migrations to production? [y/N]"
- "Deploy all Edge Functions? [y/N]"
- "Run verification script? [y/N]"

---

### 🔍 `verify-supabase.sh`

**Purpose:** Comprehensive verification of Supabase infrastructure

**Usage:**
```bash
chmod +x scripts/verify-supabase.sh
./scripts/verify-supabase.sh
```

**What it checks:**
1. ✅ Database connection (via REST API)
2. ✅ Auth API health
3. ✅ Storage API accessibility
4. ✅ Edge Functions endpoint
5. ✅ Storage buckets (avatars, kyc_docs, moment-images, etc.)
6. ✅ Database tables (users, moments, messages, payments, wallets)
7. ✅ RLS policies (indirect check via protected access)
8. ✅ Migration status (applied vs pending)

**Output:**
```
✅ Passed: 8
❌ Failed: 0
📊 Total:  8

🎉 All checks passed!
Supabase is ready for production
```

**Exit Codes:**
- `0` - All checks passed
- `1` - Some checks failed

**Use in CI/CD:**
```yaml
- name: Verify Supabase
  run: ./scripts/verify-supabase.sh
```

---

## 🎯 Quick Start Workflow

### First Time Setup

```bash
# 1. Install Supabase CLI
brew install supabase/tap/supabase

# 2. Login
npx supabase login

# 3. Run setup script
./scripts/setup-supabase.sh

# 4. Verify everything works
./scripts/verify-supabase.sh
```

### After Making Database Changes

```bash
# 1. Create new migration
npx supabase migration new your_migration_name

# 2. Edit migration file
# supabase/migrations/TIMESTAMP_your_migration_name.sql

# 3. Test locally (optional)
npx supabase db reset

# 4. Apply to production
npx supabase db push

# 5. Verify
./scripts/verify-supabase.sh
```

### Deploying Edge Functions

```bash
# Deploy all functions
npx supabase functions deploy

# Or deploy specific function
npx supabase functions deploy payment/create-payment-intent

# Set secrets
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
npx supabase secrets set OPENAI_API_KEY=sk-xxxxx

# Test function
curl -X POST \
  "https://bjikxgtbptrvawkguypv.supabase.co/functions/v1/payment/create-payment-intent" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -d '{"amount": 100, "currency": "TRY"}'
```

---

## 🔐 Environment Variables

Scripts read from `apps/mobile/.env.development`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://bjikxgtbptrvawkguypv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

**Security Notes:**
- ✅ Anon key is safe to expose (protected by RLS)
- ❌ Service role key should NEVER be in .env files
- ✅ Use Infisical for production secrets

---

## 📊 Migration Status

To check migration status:

```bash
# List all migrations
npx supabase migration list --local

# Check applied migrations
npx supabase migration list --linked

# Create migration diff
npx supabase db diff --linked
```

Expected output:
```
✓ 20241205000000_initial_schema.sql
✓ 20241205000001_add_indexes.sql
✓ 20241205000002_enable_rls.sql
... (42 total migrations)
```

---

## 🚨 Troubleshooting

### "Project not linked"

```bash
npx supabase link --project-ref bjikxgtbptrvawkguypv
```

### "Migrations already applied"

This is OK! It means your database is up to date.

```bash
# To see status
npx supabase migration list --linked
```

### "Edge Function deployment failed"

```bash
# Check secrets are set
npx supabase secrets list

# Deploy with verbose output
npx supabase functions deploy --debug
```

### "Storage buckets not found"

Run migrations (buckets are created via migrations):

```bash
npx supabase db push
```

### "REST API connection failed"

Check credentials in `.env.development`:

```bash
cat apps/mobile/.env.development | grep SUPABASE
```

---

## 📚 Additional Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Database Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

## 🎯 Script Maintenance

### Adding New Scripts

1. Create script in `scripts/` directory
2. Make executable: `chmod +x scripts/your-script.sh`
3. Add documentation to this README
4. Test locally before committing

### Script Naming Convention

- Use kebab-case: `setup-something.sh`
- Prefix with action: `setup-`, `verify-`, `deploy-`, `test-`
- Be descriptive: `setup-supabase.sh` not `setup.sh`

---

**Last Updated:** 2025-12-15
**Maintainer:** TravelMatch DevOps Team
