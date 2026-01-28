# Environments

## Environment Matrix

| Env         | URL          | Purpose             | Data Source         |
| ----------- | ------------ | ------------------- | ------------------- |
| Local       | localhost:\* | Development         | Local Supabase      |
| Development | TBD          | Integration testing | Dev Supabase        |
| Staging     | TBD          | QA review           | Staging Supabase    |
| Production  | TBD          | Live users          | Production Supabase |

## Local Development

```bash
# Start all services
pnpm dev

# Start only mobile
pnpm dev:mobile

# Start only web
pnpm dev:web

# Start only admin
pnpm dev:admin

# Database
pnpm db:start    # Start local Supabase
pnpm db:stop     # Stop local Supabase
pnpm db:reset    # Reset local DB
```

## Environment Variables

### Required per app

**Mobile** (`apps/mobile/.env`):

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- `MAPBOX_ACCESS_TOKEN`
- `POSTHOG_API_KEY`
- `SENTRY_DSN`
- RevenueCat API key

**Admin** (`apps/admin/.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- All other service keys

**Web** (`apps/web/.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `POSTHOG_API_KEY`

### Secrets Management

All production secrets are managed via:

- **Infisical**: API keys, webhook secrets
- **Vercel**: Environment variables for admin/web
- **App Store Connect**: iOS certificates/keys
- **Google Play Console**: Android certificates/keys

## Database Environments

### Local

```bash
pnpm db:migrate    # Apply migrations
pnpm db:generate-types:local  # Generate types
```

### Remote

```bash
pnpm db:generate-types  # From remote schema
pnpm db:migrate:new     # Create new migration
```

## Build Environments

| App    | Build Command       | Output        |
| ------ | ------------------- | ------------- |
| Mobile | `pnpm build:mobile` | .ipa / .aab   |
| Admin  | `pnpm build:admin`  | Vercel deploy |
| Web    | `pnpm build:web`    | Vercel deploy |

## NOT IMPLEMENTED

- Separate staging environment for mobile builds
- Automatic deployment pipelines
- Blue-green deployments
