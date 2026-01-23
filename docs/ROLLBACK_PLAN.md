# Rollback Plan — Quick Commands

## Web / Admin (Vercel)

### Instant Rollback (via CLI)

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url-or-id>

# Or via dashboard:
# 1. Go to Vercel → Project → Deployments
# 2. Find previous working deployment
# 3. Click "..." → "Promote to Production"
```

### Environment Variable Rollback

```bash
# List current env vars
vercel env ls

# Remove problematic var
vercel env rm <VAR_NAME> production

# Re-add previous value
vercel env add <VAR_NAME> production
```

---

## Mobile (EAS Hotfix Build)

### Hotfix Build Profile (eas.json)

```json
{
  "build": {
    "hotfix": {
      "extends": "production",
      "channel": "production",
      "env": {
        "APP_VARIANT": "hotfix"
      }
    }
  }
}
```

### Commands

```bash
# 1. Increment version in app.json (bump patch)
# e.g., 1.2.3 → 1.2.4

# 2. Build hotfix
eas build --profile hotfix --platform all

# 3. Submit to stores (expedited review)
eas submit --platform ios --latest
eas submit --platform android --latest

# 4. For OTA update (Expo Updates only - JS changes):
eas update --branch production --message "Hotfix: <description>"
```

### Emergency OTA (JS-only changes)

```bash
# Publish immediate OTA update to production channel
eas update --branch production --message "Emergency fix: <issue>"
```

---

## Backend / Edge Functions (Supabase)

### Deploy with Tags

```bash
# Tag current working version before new deploy
git tag edge-v1.2.3
git push origin edge-v1.2.3

# Deploy specific function
supabase functions deploy <function-name>
```

### Rollback to Previous Version

```bash
# Checkout previous tag
git checkout edge-v1.2.2

# Redeploy specific function
supabase functions deploy <function-name>

# Return to main
git checkout main
```

### Emergency: Disable Function

```bash
# Set maintenance flag in app_config
supabase sql "UPDATE app_config SET value = 'false' WHERE key = '<function>_enabled';"
```

---

## Database (Supabase)

### RLS Policy Rollback

```sql
-- Disable problematic policy
ALTER POLICY "policy_name" ON table_name DISABLE;

-- Or drop and recreate
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name_v2" ON table_name ...;
```

### Migration Rollback

```bash
# View recent migrations
supabase migration list

# Create rollback migration
supabase migration new rollback_<migration_name>

# Edit rollback SQL, then push
supabase db push
```

---

## Feature Flag Kill Switch

### Disable Critical Features Remotely

```sql
-- Disable payments
UPDATE app_config SET value = 'false' WHERE key = 'paymentsEnabled';

-- Disable proof upload
UPDATE app_config SET value = 'false' WHERE key = 'proofUploadEnabled';

-- Disable KYC
UPDATE app_config SET value = 'false' WHERE key = 'kycEnabled';
```

### Verify Flag Status

```sql
SELECT key, value, updated_at FROM app_config
WHERE key IN ('paymentsEnabled', 'proofUploadEnabled', 'kycEnabled');
```

---

## Incident Response Checklist

1. **Identify** — What broke? Which deploy?
2. **Kill Switch** — Disable affected feature via app_config
3. **Rollback** — Use appropriate command above
4. **Verify** — Check Sentry/PostHog for error reduction
5. **Communicate** — Update status page / Slack
6. **Postmortem** — Document root cause within 24h

---

## Contacts

- **Vercel Issues**: Check Vercel Status → vercel.com/status
- **EAS Issues**: Check Expo Status → status.expo.dev
- **Supabase Issues**: Check Supabase Status → status.supabase.com
