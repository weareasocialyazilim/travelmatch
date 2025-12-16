# 🔒 Environment Variables Security Guide

**Date:** December 8, 2024  
**Last Security Audit:** December 8, 2024  
**Status:** Production Security Guidelines  
**Applies to:** TravelMatch Mobile, Admin Panel, Edge Functions  

---

## 🚨 Recent Security Fixes (December 8, 2024)

### Issues Identified & Resolved:

1. **✅ Real Project IDs Removed from .env.example**
   - ❌ Before: `EXPO_PUBLIC_SUPABASE_URL=https://bjikxgtbptrvawkguypv.supabase.co`
   - ✅ After: `EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co`
   - **Impact:** Prevents accidental exposure of production infrastructure

2. **✅ EXPO_PUBLIC_ Prefix Misuse Fixed**
   - ❌ Before: Duplicate keys, unclear which are public
   - ✅ After: Removed `STRIPE_PUBLISHABLE_KEY` duplicate, clarified PUBLIC vs SECRET
   - **Impact:** Prevents developers from accidentally exposing secrets

3. **✅ Cloudflare Images Token Added**
   - ❌ Before: Missing `CLOUDFLARE_IMAGES_TOKEN` configuration
   - ✅ After: Added with clear SECRET designation
   - **Impact:** Proper security labeling for new CDN service

---

## 📋 Table of Contents

1. [Quick Reference](#quick-reference)
2. [Security Levels](#security-levels)
3. [Setup Instructions](#setup-instructions)
4. [Best Practices](#best-practices)
5. [Secret Rotation](#secret-rotation)
6. [Vault Integration](#vault-integration)
7. [Incident Response](#incident-response)
8. [Compliance](#compliance)

---

## ⚡ Quick Reference

### DO ✅

```bash
# Use different keys per environment
.env.development   # Local development
.env.staging       # Staging environment
.env.production    # Production (never commit!)

# Copy template and fill values
cp .env.example .env
# Edit .env with actual credentials

# Check .gitignore
cat .gitignore | grep .env
# Should show: .env*
```

### DON'T ❌

```bash
# NEVER commit secrets
git add .env                    # ❌ DANGER!
git commit -m "Add .env"        # ❌ NEVER DO THIS!

# NEVER hardcode secrets
const apiKey = "sk_live_123";   # ❌ DANGER!

# NEVER log secrets
console.log(process.env.SECRET_KEY);  # ❌ DANGER!

# NEVER share via insecure channels
Email: "Here's the API key: sk_..."   # ❌ DANGER!
Slack DM: "API key is sk_..."         # ❌ DANGER!
```

---

## 🔐 Security Levels

### Level 1: PUBLIC (Client-Safe) ✅

**Safe to expose in client-side code (mobile app, web frontend)**

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://bjikxgtbptrvawkguypv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...  # Respects RLS
VITE_SUPABASE_URL=https://bjikxgtbptrvawkguypv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...

# Stripe
EXPO_PUBLIC_STRIPE_KEY=pk_test_...  # Publishable key

# Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=AIza...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=AIza...

# Monitoring
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
EXPO_PUBLIC_DD_APP_ID=your-app-id
```

**Why it's safe:**
- `EXPO_PUBLIC_*` and `VITE_*` are designed for client-side use
- Supabase anon key respects Row Level Security policies
- Stripe publishable key has no payment authority
- These keys can be restricted by domain/platform

**Security measures:**
- ✅ Restrict API keys to specific platforms in provider dashboard
- ✅ Monitor usage for anomalies
- ✅ Rotate keys if compromised
- ✅ Rate limit endpoints

---

### Level 2: SECRET (Server-Only) 🔴

**MUST be kept server-side only (Edge Functions, CI/CD, backend)**

```bash
# Supabase
SUPABASE_SERVICE_KEY=eyJhbG...      # ⚠️ BYPASSES RLS!
SUPABASE_ACCESS_TOKEN=sbp_...       # Full account access

# Stripe
STRIPE_SECRET_KEY=sk_live_...       # Payment authority
STRIPE_WEBHOOK_SECRET=whsec_...     # Webhook verification

# AI Services
OPENAI_API_KEY=sk-...               # API billing access
ANTHROPIC_API_KEY=sk-ant-...        # API billing access

# Media
CLOUDFLARE_STREAM_API_KEY=...       # Video management
CLOUDFLARE_API_TOKEN=...            # CDN control

# Monitoring
SENTRY_AUTH_TOKEN=...               # Release management
```

**Why it's dangerous:**
- **SUPABASE_SERVICE_KEY:** Bypasses ALL Row Level Security → full database access
- **STRIPE_SECRET_KEY:** Can charge customers, issue refunds, access financial data
- **OPENAI_API_KEY:** Charges to your billing account, can exhaust quota
- **SUPABASE_ACCESS_TOKEN:** Can create/delete projects, modify all data

**Security measures:**
- ❌ NEVER include in client-side code
- ❌ NEVER commit to git
- ❌ NEVER log or print values
- ✅ Use only in Edge Functions, secure servers
- ✅ Rotate every 90 days
- ✅ Monitor usage dashboards
- ✅ Set up billing alerts

---

## 🚀 Setup Instructions

### Local Development

```bash
# 1. Copy template
cp .env.example .env

# 2. Get Supabase credentials
# Visit: https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/settings/api
# Copy:
#   - Project URL → EXPO_PUBLIC_SUPABASE_URL
#   - anon public → EXPO_PUBLIC_SUPABASE_ANON_KEY
#   - service_role → SUPABASE_SERVICE_KEY (⚠️ keep secret!)

# 3. Get Stripe keys (if testing payments)
# Visit: https://dashboard.stripe.com/test/apikeys
# Use TEST keys for development!
#   - Publishable key → EXPO_PUBLIC_STRIPE_KEY
#   - Secret key → STRIPE_SECRET_KEY

# 4. Optional: Add other services as needed
# See .env.example for full list

# 5. Verify .env is gitignored
cat .gitignore | grep .env
# Should output: .env*

# 6. Test configuration
pnpm dev
# App should connect to Supabase successfully
```

---

### Production Deployment

```bash
# 1. Create production .env file (NEVER commit!)
cp .env.example .env.production

# 2. Use PRODUCTION credentials
# Supabase: Production project
# Stripe: LIVE keys (sk_live_*, pk_live_*)
# AI: Production API keys with billing limits

# 3. Set up GitHub Secrets (for CI/CD)
# See: docs/GITHUB_SECRETS_SETUP.md
gh secret set SUPABASE_URL --body "https://..."
gh secret set EXPO_PUBLIC_SUPABASE_ANON_KEY --body "eyJhbG..."
# ... etc (46 secrets total)

# 4. Configure EAS Build secrets
# In eas.json, reference GitHub Secrets:
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "$EXPO_PUBLIC_SUPABASE_URL"
      }
    }
  }
}

# 5. Edge Functions secrets (Supabase Dashboard)
# Visit: https://supabase.com/dashboard/project/[id]/settings/functions
# Add secrets via CLI:
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set OPENAI_API_KEY=sk-...
```

---

## 🎯 Best Practices

### 1. Environment Separation

```bash
# Different credentials per environment
Development:  .env.development   (test keys, localhost)
Staging:      .env.staging       (test keys, staging domain)
Production:   .env.production    (live keys, production domain)

# Example: Stripe keys
Dev:     STRIPE_SECRET_KEY=sk_test_...
Staging: STRIPE_SECRET_KEY=sk_test_...
Prod:    STRIPE_SECRET_KEY=sk_live_...
```

### 2. Principle of Least Privilege

```bash
# ❌ BAD: Using service key everywhere
const supabase = createClient(URL, SERVICE_KEY);  # Bypasses RLS!

# ✅ GOOD: Use anon key for client-side
const supabase = createClient(URL, ANON_KEY);     # Respects RLS

# ✅ GOOD: Use service key only when needed (Edge Functions)
// Inside Supabase Edge Function:
const adminClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_KEY')!  // Server-side only
);
```

### 3. API Key Restrictions

```bash
# Google Maps API Keys
# Restrict in Google Cloud Console:
- iOS key: Restrict to iOS bundle ID (com.travelmatch.app)
- Android key: Restrict to package name + SHA-1 fingerprint
- Web key: Restrict to specific domains (*.travelmatch.com)

# Stripe API Keys
# Enable webhook signature verification
# Set up notification emails for unusual activity
# Use restricted API keys when possible

# Supabase
# Enable MFA on Supabase account
# Use specific service accounts for CI/CD
# Audit access logs regularly
```

### 4. Secret Scanning

```bash
# Install git-secrets
brew install git-secrets

# Configure for repo
cd /path/to/travelmatch-new
git secrets --install
git secrets --register-aws

# Add custom patterns
git secrets --add 'SUPABASE_SERVICE_KEY=.*'
git secrets --add 'STRIPE_SECRET_KEY=sk_live_[a-zA-Z0-9]+'
git secrets --add 'OPENAI_API_KEY=sk-[a-zA-Z0-9]+'

# Scan repo
git secrets --scan
```

### 5. Environment Variable Validation

```typescript
// apps/mobile/src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(100),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
});

// Validate at startup
const config = envSchema.parse({
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_KEY,
});

// TypeScript now knows these are valid!
export default config;
```

---

## 🔄 Secret Rotation

### Rotation Schedule

| Secret | Frequency | Priority | Effort |
|--------|-----------|----------|--------|
| SUPABASE_SERVICE_KEY | 180 days | P0 | 2h |
| STRIPE_SECRET_KEY | 365 days | P0 | 4h |
| SUPABASE_ACCESS_TOKEN | 90 days | P1 | 1h |
| OPENAI_API_KEY | 90 days | P1 | 1h |
| EXPO_TOKEN | 90 days | P1 | 1h |
| SENTRY_AUTH_TOKEN | 180 days | P2 | 30m |
| All others | 180 days | P2 | 30m each |

### Rotation Process

```bash
# 1. Generate new secret (don't revoke old one yet!)
# Example: Supabase Access Token
# Visit: https://supabase.com/dashboard/account/tokens
# Click "Generate new token"
# Name: "GitHub Actions - Rotated Dec 2025"

# 2. Test new secret in staging
export SUPABASE_ACCESS_TOKEN=new_token
supabase projects list  # Should work

# 3. Update production secrets
# GitHub Secrets:
gh secret set SUPABASE_ACCESS_TOKEN --body "new_token"

# .env.production:
# Update file on production server

# Edge Functions:
supabase secrets set SUPABASE_ACCESS_TOKEN=new_token

# 4. Verify new secret works
# Run a production deployment
# Check logs for any auth errors

# 5. Revoke old secret (after 24h grace period)
# Visit provider dashboard
# Revoke old token/key

# 6. Document rotation
# Update: docs/SECRET_ROTATION_LOG.md
# Date: 2025-12-08
# Secret: SUPABASE_ACCESS_TOKEN
# Next rotation: 2026-03-08
```

### Rotation Checklist

- [ ] Generate new secret in provider dashboard
- [ ] Test new secret in staging environment
- [ ] Update GitHub Secrets
- [ ] Update .env files on servers
- [ ] Update Edge Functions secrets
- [ ] Verify production deployment works
- [ ] Monitor error logs for 24 hours
- [ ] Revoke old secret
- [ ] Document rotation in log
- [ ] Set calendar reminder for next rotation

---

## 🔐 Vault Integration

### Recommended: 1Password for Teams

```bash
# 1. Install 1Password CLI
brew install --cask 1password-cli

# 2. Sign in
op signin

# 3. Store secrets in vault
op item create \
  --category=password \
  --title="TravelMatch SUPABASE_SERVICE_KEY" \
  --vault="Engineering" \
  password="eyJhbG..."

# 4. Reference in scripts
export SUPABASE_SERVICE_KEY=$(op read "op://Engineering/SUPABASE_SERVICE_KEY/password")

# 5. Auto-inject in CI/CD
# GitHub Actions with 1Password:
- uses: 1password/load-secrets-action@v1
  with:
    export-env: true
  env:
    SUPABASE_SERVICE_KEY: op://Engineering/SUPABASE_SERVICE_KEY/password
```

### Alternative: AWS Secrets Manager

```bash
# 1. Store secret
aws secretsmanager create-secret \
  --name /travelmatch/production/supabase-service-key \
  --secret-string "eyJhbG..."

# 2. Retrieve in application
const secret = await secretsManager.getSecretValue({
  SecretId: '/travelmatch/production/supabase-service-key'
}).promise();

const SUPABASE_SERVICE_KEY = secret.SecretString;
```

### Alternative: HashiCorp Vault

```bash
# 1. Store secret
vault kv put secret/travelmatch/production \
  supabase_service_key="eyJhbG..."

# 2. Retrieve in application
vault kv get -field=supabase_service_key secret/travelmatch/production
```

---

## 🚨 Incident Response

### If Secret is Compromised

**Immediate Actions (within 1 hour):**

```bash
# 1. REVOKE compromised secret immediately
# Supabase: Dashboard → Settings → API → Revoke key
# Stripe: Dashboard → Developers → API keys → Delete
# OpenAI: Platform → API keys → Revoke

# 2. Generate new secret
# Follow rotation process (see above)

# 3. Deploy new secret to production
gh secret set SECRET_NAME --body "new_value"
# Trigger redeployment

# 4. Monitor for suspicious activity
# Check Supabase logs
# Check Stripe transactions
# Check OpenAI usage dashboard

# 5. Notify team
# Slack: #engineering-alerts
# Email: security@travelmatch.com
```

**Post-Incident (within 24 hours):**

1. **Audit:** Review access logs for unauthorized usage
2. **Document:** Create incident report
3. **Improve:** Update security procedures
4. **Train:** Share lessons learned with team

### Incident Report Template

```markdown
# Security Incident Report

**Date:** 2025-12-08
**Severity:** P0 / P1 / P2 / P3
**Secret:** STRIPE_SECRET_KEY

## Timeline
- 10:00 AM: Secret committed to public repo
- 10:15 AM: Detected by automated scan
- 10:20 AM: Old key revoked
- 10:30 AM: New key deployed
- 10:45 AM: Monitoring confirmed no unauthorized usage

## Impact
- No unauthorized transactions detected
- No customer data accessed
- Financial impact: $0

## Root Cause
- Developer accidentally committed .env file
- git-secrets not configured locally

## Remediation
1. ✅ Revoked compromised key
2. ✅ Generated new key
3. ✅ Deployed to production
4. ✅ Monitored for 24 hours

## Prevention
1. Mandatory git-secrets for all developers
2. Pre-commit hook to block .env files
3. Quarterly security training

## Lessons Learned
- git-secrets must be enforced, not optional
- Need automated .env detection in PRs
```

---

## ✅ Compliance

### GDPR Requirements

```bash
# Data Processing Agreement
# Ensure third-party services have DPAs:
✅ Supabase: GDPR compliant (EU region available)
✅ Stripe: PCI-DSS Level 1, GDPR compliant
✅ Sentry: GDPR compliant (data residency options)
✅ OpenAI: DPA available

# Data Retention
# Configure retention policies:
- Supabase logs: 7 days
- Sentry events: 90 days
- Stripe data: As per legal requirements
```

### SOC 2 Compliance

```bash
# Access Control
✅ MFA enabled on all service accounts
✅ Principle of least privilege
✅ Regular access audits

# Encryption
✅ Secrets encrypted at rest (GitHub Secrets, 1Password)
✅ TLS for all API communications
✅ Database encryption (Supabase)

# Monitoring
✅ Access logs enabled
✅ Anomaly detection alerts
✅ Regular security audits
```

### PCI-DSS (Payment Processing)

```bash
# Stripe handles PCI compliance
✅ Never store card numbers
✅ Use Stripe.js for tokenization
✅ Only store Stripe customer/payment IDs

# Key management
✅ Rotate Stripe keys annually
✅ Restrict keys to production domain
✅ Enable webhook signature verification
```

---

## 📚 Resources

### Documentation
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Stripe API Security](https://stripe.com/docs/security)
- [OWASP Secret Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

### Tools
- [git-secrets](https://github.com/awslabs/git-secrets) - Prevent committing secrets
- [1Password CLI](https://developer.1password.com/docs/cli/) - Vault integration
- [Snyk](https://snyk.io/) - Secret scanning in code

### Internal Docs
- [Environment Setup](./ENVIRONMENT_SETUP.md)
- [GitHub Secrets Setup](./GITHUB_SECRETS_SETUP.md)
- [Quick Start Guide](./QUICK_START.md)

---

## ✅ Security Checklist

### Daily
- [ ] Monitor Sentry for security events
- [ ] Check Stripe dashboard for unusual activity

### Weekly
- [ ] Review Supabase access logs
- [ ] Check failed authentication attempts
- [ ] Verify all team members have MFA enabled

### Monthly
- [ ] Audit API key usage
- [ ] Review and revoke unused tokens
- [ ] Check for outdated dependencies with security issues

### Quarterly
- [ ] Rotate critical secrets (90-day schedule)
- [ ] Security training for team
- [ ] Penetration testing

### Annually
- [ ] Full security audit
- [ ] Update security policies
- [ ] Review compliance certifications

---

**Last Updated:** December 8, 2025  
**Next Review:** March 8, 2026  
**Owner:** Security Team / DevOps Lead
