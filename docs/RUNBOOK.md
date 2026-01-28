# LOVENDO OPERATIONAL RUNBOOK

**Version:** 1.0 **Last Updated:** 2026-01-28 **Classification:** Internal - Confidential

---

## TABLE OF CONTENTS

1. [Quick Commands](#1-quick-commands)
2. [Deployment](#2-deployment)
3. [Monitoring](#3-monitoring)
4. [Troubleshooting](#4-troubleshooting)
5. [Common Issues](#5-common-issues)
6. [Emergency Procedures](#6-emergency-procedures)

---

## 1. QUICK COMMANDS

### 1.1 Application Commands

```bash
# Development
pnpm dev              # Start development server
pnpm dev:mobile       # Start mobile dev (Expo)
pnpm dev:web          # Start web dev (Next.js)

# Build
pnpm build            # Build all apps
pnpm build:web        # Build web only
pnpm build:mobile     # Build mobile only

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Unit tests only
pnpm test:e2e         # E2E tests only
pnpm type-check       # TypeScript check

# Linting
pnpm lint             # Lint all apps
pnpm lint:fix         # Auto-fix linting issues
```

### 1.2 Deployment Commands

```bash
# Deploy to production
pnpm deploy:prod      # Web → Vercel Production
pnpm deploy:mobile:prod # Mobile → App Store

# Deploy to staging
pnpm deploy:staging   # Web → Vercel Preview
pnpm deploy:mobile:staging # Mobile → TestFlight

# Database migrations
pnpm db:migrate       # Run pending migrations
pnpm db:rollback      # Rollback last migration (use with care!)
pnpm db:status        # Check migration status
pnpm db:seed          # Seed development database
```

### 1.3 Monitoring Commands

```bash
# View logs
pnpm logs:api         # Edge Functions logs
pnpm logs:db          # Supabase logs
pnpm logs:web         # Next.js server logs
pnpm logs:mobile      # Mobile crash logs (Sentry)

# Metrics
pnpm metrics          # Print key metrics to console
pnpm metrics:dashboard # Open Datadog dashboard
pnpm metrics:health   # Health check all services
```

### 1.4 Incident Commands

```bash
# Start incident response
pnpm incident:start   # Create incident channel
pnpm incident:escalate # Page on-call engineer
pnpm incident:resolve # Resolve and document

# Emergency actions
pnpm emergency:lock   # Lock all write operations
pnpm emergency:unlock # Unlock after fix
pnpm emergency:rollback # Rollback to previous version
```

---

## 2. DEPLOYMENT

### 2.1 Web Deployment (Vercel)

#### Automatic Deployment

```
Trigger: Push to main branch
Pipeline: GitHub → Vercel → Production
Expected Time: 2-5 minutes
```

#### Manual Deployment

```bash
# From project root
cd apps/web
vercel --prod
```

#### Deployment Checklist

- [ ] All tests passing (`pnpm test`)
- [ ] Type check passing (`pnpm type-check`)
- [ ] Lint passing (`pnpm lint`)
- [ ] Environment variables configured in Vercel
- [ ] Migration status verified (`pnpm db:status`)

#### Rollback Procedure

```bash
# Via Vercel Dashboard
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "Redeploy"

# Or via CLI
vercel rollback <deployment-url>
```

### 2.2 Mobile Deployment (iOS)

#### App Store Connect

```
Pipeline: main branch → TestFlight → App Store
Expected Time: 20-40 minutes for TestFlight
Expected Time: 24-48 hours for App Store review
```

#### Build and Submit

```bash
cd apps/mobile
# Build for simulator testing
pnpm ios:build        # Debug build
pnpm ios:release      # Release build (TestFlight)

# Submit to TestFlight
pnpm ios:submit       # Upload to App Store Connect
```

#### Requirements

- Apple Developer Account (team@lovendo.xyz)
- App Store Connect API Key
- Certificate provisioning completed

### 2.3 Database Migrations

#### Apply Migrations

```bash
# Apply all pending migrations
supabase db push

# Or via migration files
cd supabase
supabase migration up
```

#### Create New Migration

```bash
# Generate blank migration
supabase migration new descriptive_name

# Fill in SQL in created file
# Format: YYYYMMDDHHMMSS_migration_name.sql
```

#### Migration Best Practices

1. Always test locally first
2. Add comments explaining purpose
3. Include rollback statement if needed
4. Test on staging before production

---

## 3. MONITORING

### 3.1 Dashboards

| Dashboard  | URL                               | Purpose        |
| ---------- | --------------------------------- | -------------- |
| Datadog    | https://app.datadoghq.com/lovendo | Metrics, APM   |
| Sentry     | https://sentry.io/lovendo         | Error tracking |
| Supabase   | https://supabase.com/lovendo      | Database, Auth |
| Cloudflare | https://cloudflare.com/lovendo    | WAF, CDN       |
| Vercel     | https://vercel.com/lovendo        | Deployments    |

### 3.2 Key Metrics

#### Application Metrics

```
P95 Latency: < 500ms
Error Rate: < 0.1%
Uptime: > 99.9%
Active Users: Track daily
```

#### Business Metrics

```
Escrow Completion Rate: > 85%
Gift → Thank You Rate: > 60%
Trust Score Distribution: Bell curve
AI Moderation Pass Rate: > 90%
```

### 3.3 Alerts

| Alert                 | Threshold | Severity |
| --------------------- | --------- | -------- |
| High Error Rate       | > 1%      | Critical |
| High Latency          | P95 > 1s  | Warning  |
| Low Escrow Completion | < 70%     | Warning  |
| Database Connection   | > 80%     | Warning  |
| Disk Usage            | > 80%     | Warning  |

### 3.4 Log Locations

```bash
# Web logs (Next.js)
pnpm logs:web | grep -E "(ERROR|WARN)"

# API logs (Edge Functions)
pnpm logs:api | grep -v "INFO"

# Database logs
# View in Supabase Dashboard → Logs

# Mobile logs (Sentry)
# View in Sentry Dashboard → Lovendo Mobile
```

---

## 4. TROUBLESHOOTING

### 4.1 Common Issues

#### Issue: Build Fails with Type Errors

```bash
# Check type errors
pnpm type-check 2>&1 | head -50

# Common fixes:
# 1. Run type-check locally before pushing
# 2. Check for missing exports
# 3. Verify environment variables
```

#### Issue: Database Connection Failed

```bash
# Check connection
supabase status

# Restart Supabase local
supabase stop
supabase start

# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

#### Issue: Authentication Not Working

```bash
# Check auth service
supabase auth:admin list-users

# Common causes:
# 1. JWT secret mismatch
# 2. RLS policy blocking
# 3. Session expired

# Reset user session (on their device)
# Direct them to logout and login again
```

#### Issue: Edge Function Timeout

```bash
# Check function logs
pnpm logs:api | grep -A5 "timeout"

# Common causes:
# 1. Long-running database query
# 2. External API call timeout
# 3. Memory limit exceeded

# Solutions:
# 1. Optimize query
# 2. Add timeout handling
# 3. Split into smaller functions
```

### 4.2 Performance Issues

#### Slow API Response

```bash
# Check Datadog APM
# Look for:
# - Slow database queries
# - High CPU usage
# - Network latency

# Common fixes:
# 1. Add database index
# 2. Cache frequent queries
# 3. Reduce payload size
```

#### High Memory Usage

```bash
# Check memory metrics
# View in Datadog → Memory

# Common causes:
# 1. Memory leak in function
# 2. Large payload processing
# 3. Unclosed connections

# Solutions:
# 1. Add memory limit
# 2. Stream large files
# 3. Close connections in finally block
```

---

## 5. COMMON ISSUES

### 5.1 Mobile Issues

#### App Crashes on Startup

```bash
# Check Sentry for crash report
# Common causes:
# 1. Missing environment variable
# 2. Native module error
# 3. TypeScript compilation issue

# Debug locally:
cd apps/mobile
pnpm ios:start  # Metro bundler
pnpm ios:debug  # Debug build
```

#### Push Notifications Not Working

```bash
# Check:
# 1. APNs certificate valid
# 2. Device token stored correctly
# 3. Notification payload correct

# Test:
# Send test notification via Supabase
```

### 5.2 Web Issues

#### CSP Blocking Resources

```bash
# Check browser console for CSP errors
# Common causes:
# 1. Inline script without nonce
# 2. External resource not in allowlist
# 3. Dynamic content generation

# Fix:
# Update CSP in next.config.js
# Add required domain to connect-src
```

#### Hydration Mismatch

```bash
# Check React hydration warnings
# Common causes:
# 1. Random values in render
# 2. Date.now() in component
# 3. Browser-specific values

# Fix:
# Move random values to useEffect
# Use stable values for hydration
```

---

## 6. EMERGENCY PROCEDURES

### 6.1 Incident Severity Levels

| Level | Description                             | Response Time |
| ----- | --------------------------------------- | ------------- |
| SEV1  | Critical - Data breach, total outage    | Immediate     |
| SEV2  | High - Feature broken, revenue impact   | 15 minutes    |
| SEV3  | Medium - Minor issue, workaround exists | 1 hour        |
| SEV4  | Low - Cosmetic, no business impact      | 24 hours      |

### 6.2 SEV1: Critical Incident

```bash
# 1. Page on-call immediately
pnpm incident:escalate

# 2. Create incident channel
pnpm incident:start

# 3. Assess situation
# - Is user data at risk?
# - Is the system available?
# - What is the blast radius?

# 4. Immediate actions
pnpm emergency:lock  # Lock writes if data at risk

# 5. Communicate
# - Notify leadership
# - Prepare user communication
# - Document timeline
```

### 6.3 SEV2: High Severity

```bash
# 1. Page on-call
pnpm incident:escalate

# 2. Create incident channel
pnpm incident:start

# 3. Assess
# - Is there a workaround?
# - How many users affected?

# 4. Fix or workaround
# - Deploy hotfix if needed
# - Document temporary solution

# 5. Post-incident
# - Root cause analysis
# - Preventive measures
```

### 6.4 Rollback Procedure

```bash
# Web rollback (instant)
# Go to Vercel Dashboard → Deployments → Redeploy previous

# Mobile rollback (if critical bug in released version)
# 1. Pull previous version from App Store Connect
# 2. Hotfix and resubmit (24-48 hours)
# 3. Communicate to users

# Database rollback (use with extreme caution!)
supabase db reset --major-version  # Restore from backup
```

### 6.5 Communication Templates

#### User-Facing Outage Notice

```
Subject: [Important] Lovendo Service Outage

We're experiencing a service disruption affecting [describe issue].
Our team is working on a fix.

Estimated resolution: [time]

We apologize for the inconvenience.
- The Lovendo Team
```

#### Data Breach Notification

```
Subject: [Security Notice] Lovendo Account

We recently discovered [brief description of incident].
We took immediate action [actions taken].
[Recommended user actions]

For questions: support@lovendo.xyz

- The Lovendo Security Team
```

---

## QUICK REFERENCE CARD

| Situation          | Command                                             |
| ------------------ | --------------------------------------------------- |
| Something's wrong  | `pnpm logs:api`                                     |
| Build failed       | `pnpm type-check`                                   |
| Database issues    | `supabase status`                                   |
| User can't login   | Check Sentry, then Supabase auth                    |
| High errors        | `pnpm incident:start`                               |
| Need help          | Page on-call: `pnpm incident:escalate`              |
| Everything on fire | `pnpm emergency:lock` then `pnpm incident:escalate` |

---

**Document Owner:** Engineering Lead **Review Cycle:** Monthly **Next Review:** 2026-02-28
