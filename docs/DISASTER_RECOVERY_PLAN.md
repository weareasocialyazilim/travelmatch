# Disaster Recovery (DR) Plan - Lovendo

**Last Updated:** January 19, 2026 **Criticality:** High

## 1. Database (Supabase)

### Backup Strategy

- **Daily Backups:** Automatic daily backups are enabled on the Supabase Pro plan.
- **PITR (Point-in-Time Recovery):** Enabled with 7-day retention. Allows restoring the database to
  any second within the last 7 days.
- **Manual Snapshots:** Before any major migration or "Go-Live" event, a manual backup is triggered
  via CLI or Dashboard.

### Restore Procedure (Runbook)

1. **Assessment:** Confirm data loss or corruption is irreversible.
2. **Stop Traffic:** Enable "Maintenance Mode" (Environment Variable `MAINTENANCE_MODE=true` in
   Middleware) to stop blocking writes.
3. **Restore:**
   - Go to Supabase Dashboard > Database > Backups.
   - Select Point-in-Time Recovery.
   - Choose the timestamp _before_ the incident.
   - **Important:** Restore creates a _new_ project branch or overwrites. Prefer creating a new
     project to verify data first.
4. **Verification:**
   - Check critical tables (`users`, `match_queue`, `payments`).
   - Run `scripts/check-system-status.ts`.
5. **Switch:** Update DNS/Env variables if a new project instance was created.

## 2. Storage (Cloudflare R2 / Supabase Storage)

### Lifecycle Rules

- **Profile Photos:** Retained indefinitely unless user deleted.
- **Chat Media:**
  - Active: 1 year.
  - Archived/Deleted Users: Soft delete for 30 days, then hard delete via Cron Job
    (`cleanup_expired_media`).
- **Logs:** 90 days retention for audit logs.

### Recovery

- Storage buckets have usage logs. Deleted files within Supabase Storage _cannot_ be recovered
  unless versioning is enabled (Enabled for `private-user-data` bucket).

## 3. Secrets Management (Infisical)

### Secret Rotation Procedure (Incident Response)

**Trigger:** Leaked API Key or Admin Credentials.

1. **Rotate Keys:**
   - **Supabase:** Dashboard > Settings > API > Generate New `service_role` and `anon` keys.
   - **JWT Secret:** If rotated, all user sessions will be invalidated (force logout).
2. **Update Infisical:**
   - Update variables in Infisical Production environment.
   - Redeploy all services (Web, Edge Functions, Mobile OTA update if keys hardcoded - _Avoid
     hardcoding keys in mobile bin!_).
3. **Time to Recovery:** ~15 minutes (Propagation time).

## 4. Infrastructure Failure

### External Dependencies

- **Supabase Down:** App switches to "Read Only" or "Maintenance" mode. Cached data shown on mobile.
- **Cloudflare Down:** Images will be broken. Text chat continues if Supabase Realtime is separate.
- **Apple/Google Auth Down:** Users cannot login. Active sessions continue.

## 5. Contact Chain

1. **CTO/Lead Dev:** [Name/Phone]
2. **Infra Provider Support:**
   - Supabase Enterprise Support
   - Cloudflare Status Page
