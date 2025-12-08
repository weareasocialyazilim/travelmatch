# Environment Variables Configuration

## Required Environment Variables

### 🔐 Supabase

```bash
# Project Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci... # Server-side only

# Project Reference (for deployments)
SUPABASE_PROJECT_REF=xxxxx
SUPABASE_ACCESS_TOKEN=sbp_xxxxx # Personal access token
```

### 💳 Stripe

```bash
# API Keys
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx # Client-side
STRIPE_SECRET_KEY=sk_test_xxxxx # Server-side only

# Webhooks
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Connected Accounts
STRIPE_CLIENT_ID=ca_xxxxx # For OAuth flow
```

### 🤖 OpenAI

```bash
# API Key
OPENAI_API_KEY=sk-xxxxx

# Organization (optional)
OPENAI_ORG_ID=org-xxxxx
```

### 📱 Mobile App (Expo)

```bash
# Expo
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# App Configuration
EXPO_PUBLIC_APP_ENV=development # development | staging | production
EXPO_PUBLIC_API_URL=https://xxxxx.supabase.co/functions/v1
```

### 🖥️ Admin Panel (Vite)

```bash
# Vite
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Admin Configuration
VITE_APP_ENV=development
VITE_API_URL=https://xxxxx.supabase.co/functions/v1
```

### 🚀 CI/CD (GitHub Actions)

```bash
# Supabase
SUPABASE_ACCESS_TOKEN=sbp_xxxxx
SUPABASE_PROJECT_REF=xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Turborepo
TURBO_TOKEN=xxxxx # Vercel remote cache token
TURBO_TEAM=team_xxxxx

# Codecov (optional)
CODECOV_TOKEN=xxxxx
```

---

## 📁 Environment Files

### `.env.local` (Root - for local development)

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...
SUPABASE_PROJECT_REF=xxxxx

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx
```

### `apps/mobile/.env` (Mobile App)

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
EXPO_PUBLIC_APP_ENV=development
```

### `apps/admin/.env` (Admin Panel)

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_APP_ENV=development
```

### `services/.env` (Edge Functions - local testing)

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
OPENAI_API_KEY=sk-xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## 🔒 Security Best Practices

### Never Commit Secrets

```bash
# Add to .gitignore
.env
.env.local
.env.*.local
apps/*/.env
apps/*/.env.local
services/.env
```

### Use Different Keys for Environments

| Environment | Stripe | OpenAI | Supabase |
|-------------|--------|--------|----------|
| **Development** | `pk_test_xxxxx` | `sk-xxxxx` (dev) | Project A |
| **Staging** | `pk_test_xxxxx` | `sk-xxxxx` (dev) | Project B |
| **Production** | `pk_live_xxxxx` | `sk-xxxxx` (prod) | Project C |

### Rotate Keys Regularly

- Rotate API keys every 90 days
- Use different keys for each service
- Monitor API usage for anomalies
- Revoke unused keys immediately

### Store Secrets Securely

**Local Development:**
- Use `.env.local` files (git-ignored)
- Use password managers for team sharing

**CI/CD:**
- GitHub Secrets (encrypted)
- Vercel Environment Variables
- Supabase Secrets (for Edge Functions)

**Production:**
- Environment variables (encrypted at rest)
- Secret management services (AWS Secrets Manager, etc.)

---

## 🛠️ Setup Instructions

### 1. Get API Keys

#### Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy `URL`, `anon key`, and `service_role key`

#### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Developers → API keys
3. Copy `Publishable key` and `Secret key`
4. Developers → Webhooks → Add endpoint
5. Copy `Signing secret`

#### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com)
2. API keys → Create new secret key
3. Copy and save immediately (shown once)

### 2. Create Environment Files

```bash
# Root directory
cp .env.example .env.local

# Mobile app
cp apps/mobile/.env.example apps/mobile/.env

# Admin panel
cp apps/admin/.env.example apps/admin/.env

# Edge Functions
cp services/.env.example services/.env
```

### 3. Update Values

Replace all `xxxxx` placeholders with your actual API keys.

### 4. Verify Setup

```bash
# Test Supabase connection
pnpm run test:env

# Test mobile app
cd apps/mobile
pnpm run dev

# Test admin panel
cd apps/admin
pnpm run dev
```

---

## 🧪 Testing Environment Variables

```typescript
// services/shared/utils/env-check.ts

export function checkRequiredEnvVars(vars: string[]): void {
  const missing = vars.filter(v => !Deno.env.get(v));
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// Usage in Edge Functions
checkRequiredEnvVars([
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'OPENAI_API_KEY',
]);
```

---

## 📋 Checklist

- [ ] Created Supabase project
- [ ] Copied Supabase URL and keys
- [ ] Created Stripe account
- [ ] Added webhook endpoint in Stripe
- [ ] Created OpenAI account
- [ ] Generated OpenAI API key
- [ ] Created all `.env` files
- [ ] Updated all environment variables
- [ ] Added secrets to GitHub repository
- [ ] Tested local development
- [ ] Verified CI/CD pipeline
- [ ] Documented keys in password manager
- [ ] Set calendar reminder for key rotation
