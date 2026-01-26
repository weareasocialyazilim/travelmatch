# Lovendo Operations Runbook

**Version:** 1.0.0
**Last Updated:** 2026-01-26
**Audience:** DevOps, SRE, On-Call Engineers

## Table of Contents

1. [Health Checks](#health-checks)
2. [Deployment Procedures](#deployment-procedures)
3. [Rollback Procedures](#rollback-procedures)
4. [Emergency Response](#emergency-response)
5. [Monitoring & Alerts](#monitoring--alerts)
6. [Backup & Recovery](#backup--recovery)
7. [Common Issues](#common-issues)

---

## Health Checks

### 1.1 Quick Health Check

```bash
# Check all services health
curl -s https://api.lovendo.com/health | jq .

# Check Supabase
curl -s https://bjikxgtbptrvawkguypv.supabase.co/rest/v1/ | head -c 100

# Check Edge Functions
curl -s https://bjikxgtbptrvawkguypv.supabase.co/functions/v1/ | jq .
```

### 1.2 Detailed Health Check

```bash
# Mobile app
curl -s https://lovendo.com/api/health

# Admin panel
curl -s https://admin.lovendo.com/api/health

# Check database latency
psql -c "SELECT 1 as test, pg_postmaster_start_time() as started;"

# Check RLS policies
pnpm db:test:rls
```

### 1.3 Health Check Endpoints

| Service | Endpoint | Expected Response |
|---------|----------|-------------------|
| API | `/api/health` | `{"status":"ok"}` |
| Supabase | `/rest/v1/` | 200 OK |
| Edge Functions | `/functions/v1/` | Functions list |

---

## Deployment Procedures

### 2.1 Standard Deployment

```bash
# 1. Database migration (non-blocking)
supabase db push --linked

# 2. Deploy Edge Functions
supabase functions deploy

# 3. Deploy Admin Panel
cd apps/admin && vercel deploy --prod

# 4. Deploy Mobile (via EAS)
cd apps/mobile
eas build --platform all --profile production --non-interactive
eas submit --platform all --profile production
```

### 2.2 Deployment Checklist

- [ ] `pnpm type-check` passes (0 errors)
- [ ] `pnpm test` passes (all tests)
- [ ] `pnpm db:test:rls` passes (security)
- [ ] RLS policies verified
- [ ] Environment variables configured
- [ ] Monitoring dashboards updated
- [ ] Slack notification sent

### 2.3 Deployment Schedule

| Environment | Frequency | Approver |
|-------------|-----------|----------|
| Production | On-demand | Tech Lead |
| Staging | On-commit | CI/CD |
| Development | On-commit | CI/CD |

---

## Rollback Procedures

### 3.1 Database Rollback (Use with Caution!)

```bash
# NEVER rollback migrations that contain data changes!
# Instead, create a fixing migration

# Check migration status
supabase migration list

# If needed, create a fix-forward migration
supabase migration new fix_column_type
# Write fix in the new migration file
```

### 3.2 Edge Functions Rollback

```bash
# List function versions
supabase functions list

# Deploy previous version
git checkout <previous-commit-hash>
supabase functions deploy <function-name>
git checkout -
```

### 3.3 Admin Panel Rollback

```bash
# Via Vercel CLI
vercel rollback --prod

# Or via Dashboard
# https://vercel.com/lovendo/admin/deployments
```

### 3.4 Mobile App Rollback

```bash
# iOS - Not possible for TestFlight
# Submit new build with fix

# Android - Not possible for Play Store
# Submit new build with fix
```

---

## Emergency Response

### 4.1 Sev-1: Critical Outage

**Definition:** Complete service unavailability or security breach

**Actions:**
```bash
# 1. Acknowledge alert
# Check PagerDuty/Slack #incidents

# 2. Assess scope
curl -s https://api.lovendo.com/health
supabase functions logs --limit 50

# 3. Check recent deployments
git log --oneline -10

# 4. Rollback if deployment-related
vercel rollback --prod

# 5. Notify stakeholders
# Post to #incidents, notify leadership
```

**Contact Chain:**
1. On-call Engineer
2. Tech Lead
3. Engineering Manager

### 4.2 Sev-2: Degraded Service

**Definition:** Partial functionality affected, workarounds available

**Actions:**
```bash
# Check error rates
curl -s https://lovendo.sentry.io/issues/ | jq '. | length'

# Check function logs
supabase functions logs <function-name> --limit 100

# Review recent changes
git log --oneline -5
```

### 4.3 Sev-3: Minor Issue

**Definition:** Single feature affected, low user impact

**Actions:**
```bash
# Document issue
# Create ticket
# Schedule fix for next sprint
```

### 4.4 Security Incident

```bash
# 1. Isolate affected services
# Disable webhook endpoints if needed

# 2. Rotate compromised secrets
supabase secrets set NEW_SECRET=value

# 3. Check access logs
# Review suspicious activity

# 4. Notify security team
```

---

## Monitoring & Alerts

### 5.1 Key Metrics

| Metric | Warning | Critical | Source |
|--------|---------|----------|--------|
| API Latency (p95) | 500ms | 1000ms | Sentry |
| Error Rate | 1% | 5% | Sentry |
| Database Connections | 80% | 95% | Supabase |
| Function Invocations | 1000/min | 5000/min | Supabase |

### 5.2 Alert Channels

| Alert Type | Channel | On-Call |
|------------|---------|----------|
| Critical | PagerDuty + Slack | Yes |
| Warning | Slack #alerts | No |
| Info | Slack #metrics | No |

### 5.3 Dashboard Links

- [Sentry Issues](https://lovendo.sentry.io/projects/lovendo)
- [PostHog Dashboard](https://app.posthog.com/dashboard)
- [Supabase Logs](https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/logs)
- [Vercel Deployments](https://vercel.com/lovendo/admin/deployments)

---

## Backup & Recovery

### 6.1 Backup Schedule

| Data Type | Frequency | Retention | Location |
|-----------|-----------|-----------|----------|
| Database | Continuous | 7 days | Supabase |
| Database | Daily | 30 days | Supabase Backup |
| Secrets | Continuous | - | Infisical |
| Config | On-change | Forever | Git |

### 6.2 Restore Procedures

```bash
# Database restore (Supabase handles automatically)
# Contact support if point-in-time recovery needed

# Secrets restore from Infisical
# Export from Infisical Dashboard

# Config restore
git checkout <commit-hash> -- apps/admin/.env
```

### 6.3 Disaster Recovery

**RTO (Recovery Time Objective):** 4 hours
**RPO (Recovery Point Objective):** 1 hour

---

## Common Issues

### Issue: Edge Function Deployment Fails

```bash
# Error: Function deployment timeout

# Solution 1: Increase timeout
supabase functions deploy <function> --no-verify-jwt

# Solution 2: Check function code
supabase functions logs <function> --limit 20
```

### Issue: RLS Policy Blocking Access

```bash
# Error: Row Level Security policy denied

# Solution: Check policy
supabase db diff

# Verify with test
supabase functions logs <function> --limit 50
```

### Issue: High Database Latency

```bash
# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check slow queries
SELECT query, calls, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Issue: Mobile Build Fails

```bash
# Error: google-services.json not found

# Solution: Add Firebase config
cp google-services.json apps/mobile/
eas secret:create --scope project --name GOOGLE_SERVICES_JSON --value "$(cat apps/mobile/google-services.json)" --type file
```

---

## Useful Commands

```bash
# View all secrets
supabase secrets list

# Set secret
supabase secrets set SECRET_NAME=value

# Delete secret
supabase secrets unset SECRET_NAME

# View function logs
supabase functions logs <function-name> --limit 100

# Run database tests
pnpm db:test:rls

# Type check
pnpm type-check

# Run tests
pnpm test
```

---

## Appendix

### A. Environment Reference

| Variable | Purpose | Location |
|----------|---------|----------|
| `SUPABASE_URL` | Database URL | All services |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin access | Server-side |
| `SENTRY_DSN` | Error tracking | Mobile, Admin |
| `EXPO_PUBLIC_*` | Mobile config | Mobile app |

### B. Service URLs

| Service | URL |
|---------|-----|
| API | https://api.lovendo.com |
| Admin | https://admin.lovendo.com |
| Supabase | https://bjikxgtbptrvawkguypv.supabase.co |
| Sentry | https://lovendo.sentry.io |
| PostHog | https://app.posthog.com |

### C. Version Information

```bash
# Get versions
node --version
pnpm --version
supabase --version
eas --version
```

---

**Document Owner:** Platform Team
**Review Cycle:** Quarterly
