# Infisical Secrets Setup Guide

## Overview

TravelMatch uses **Infisical** to manage environment secrets securely. All sensitive credentials are
stored in Infisical and injected at runtime.

## Quick Start

### 1. Install Infisical CLI

```bash
# macOS
brew install infisical

# Or download from: https://infisical.com/docs/cli/overview
```

### 2. Login to Infisical

```bash
infisical login
# Opens browser for authentication
```

### 3. Verify Project Setup

```bash
# Check workspace ID
cat .infisical.json
# Should show: workspaceId: 261defa2-bcaf-4905-9230-35c1acc3b026

# List secrets in dev environment
infisical export --env=dev --format=dotenv
```

## Automatic Injection (For Development)

All scripts are configured to auto-inject Infisical secrets:

```bash
# Mobile app with Infisical secrets
pnpm ios                    # = infisical run --env=dev -- pnpm exec expo run:ios
pnpm android               # = infisical run --env=dev -- pnpm exec expo run:android

# Scripts with Infisical secrets
infisical run --env=dev -- npx tsx scripts/check-admin.ts
infisical run --env=dev -- npx tsx scripts/create-admin-user.ts
infisical run --env=dev -- npx tsx scripts/create-demo-account.ts
```

## Required Secrets for Scripts

The following secrets **must** be added to Infisical dev environment:

### Admin Script Credentials

```
ADMIN_PASSWORD = "Your secure admin password"
ADMIN_EMAIL = "admin@example.com"  (optional, defaults to kemal@weareasocial.com)
```

### Demo Account Credentials

```
DEMO_PASSWORD = "Demo account password"
DEMO_EMAIL = "demo@example.com"  (optional, defaults to demo@travelmatch.app)
```

## Adding Secrets to Infisical

### Via CLI

```bash
# Add a new secret
infisical secrets create --env=dev --key=ADMIN_PASSWORD --value="YourSecurePassword"

# Update existing secret
infisical secrets update --env=dev --key=ADMIN_PASSWORD --value="NewPassword"

# Delete secret
infisical secrets delete --env=dev --key=ADMIN_PASSWORD
```

### Via Infisical Dashboard

1. Go to [app.infisical.com](https://app.infisical.com)
2. Select Project: **TravelMatch**
3. Select Environment: **dev** or **production**
4. Click **Add Secret**
5. Enter Key and Value
6. Save

## Environment Mapping

| Environment    | Use Case                      | Secrets Source                   |
| -------------- | ----------------------------- | -------------------------------- |
| **dev**        | Local development, simulators | `infisical run --env=dev`        |
| **staging**    | Staging/testing               | `infisical run --env=staging`    |
| **production** | Production deployment         | `infisical run --env=production` |

## Troubleshooting

### "Secret not found" Error

```bash
# Verify secrets exist in dev environment
infisical export --env=dev --format=json | jq '.[] | select(.key == "ADMIN_PASSWORD")'

# If empty, add the secret
infisical secrets create --env=dev --key=ADMIN_PASSWORD --value="YourPassword"
```

### "Unknown environment" Error

```bash
# Verify workspace ID
cat .infisical.json

# Verify project has this environment
infisical export --env=dev  # Should work
```

### Infisical CLI Not Found

```bash
which infisical
# If not found, reinstall:
brew install infisical
# Or use npx:
npx @infisical/cli export --env=dev
```

## Security Best Practices

✅ **DO:**

- Store all passwords in Infisical, never in code
- Use strong passwords (min 16 characters, mixed case, numbers, symbols)
- Rotate admin/demo passwords regularly
- Never commit `.env` files to git
- Use environment-specific secrets (dev/staging/prod separate)

❌ **DON'T:**

- Hardcode passwords in scripts
- Share Infisical credentials via email
- Store production secrets in dev environment
- Commit `.infisical.json` to version control (it's safe but keep your token private)

## Scripts Using Infisical

### Check Admin User

```bash
# Requires: ADMIN_PASSWORD, ADMIN_EMAIL (optional)
infisical run --env=dev -- npx tsx scripts/check-admin.ts
```

### Create Admin User

```bash
# Requires: ADMIN_PASSWORD (optional - can pass as argument)
infisical run --env=dev -- npx tsx scripts/create-admin-user.ts <email> <password> <fullName>
# Or use env:
infisical run --env=dev -- npx tsx scripts/create-admin-user.ts
```

### Create Demo Account

```bash
# Requires: DEMO_PASSWORD, DEMO_EMAIL (optional)
infisical run --env=dev -- npx tsx scripts/create-demo-account.ts
```

## For CI/CD

Store `INFISICAL_TOKEN` as a secret in your CI/CD provider:

```yaml
# GitHub Actions example
- name: Run tests with Infisical secrets
  env:
    INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
  run: infisical run --env=staging -- npm test
```

## Next Steps

1. **Add missing secrets to Infisical dev environment:**
   - `ADMIN_PASSWORD`
   - `DEMO_PASSWORD`

2. **Test with mobile app:**

   ```bash
   pnpm ios  # Should use Infisical secrets automatically
   ```

3. **Test with scripts:**
   ```bash
   infisical run --env=dev -- npx tsx scripts/check-admin.ts
   ```

## Support

- Infisical Docs: https://infisical.com/docs
- Workspace: TravelMatch (261defa2-bcaf-4905-9230-35c1acc3b026)
- Contact: Setup team
