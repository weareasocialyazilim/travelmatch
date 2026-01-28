# Lovendo

**Real-world experience platform. No cash, no shipping, no AI decisions.**

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Database
pnpm db:start
```

## Documentation (SSOT)

**All documentation is in `/docs`.** This is the single source of truth.

```
docs/
├── 00-overview/       # Product overview, terminology, non-goals
├── 01-architecture/   # System architecture, data flow, environments
├── 02-core-domains/   # Moments, gifting, escrow, memberships, etc.
├── 03-security-privacy/  # Threat model, RLS, moderation, logging
├── 04-integrations/   # Supabase, PayTR, Mapbox, etc.
├── 05-admin/          # Admin panel operations
├── 06-mobile-web/     # Mobile and web app flows
├── 07-testing-quality/ # Testing strategy, Maestro, lint
└── 08-release/        # Store submission, checklists, rollback
```

## Apps

| App    | Path           | Framework           |
| ------ | -------------- | ------------------- |
| Mobile | `apps/mobile/` | React Native + Expo |
| Admin  | `apps/admin/`  | Next.js 14          |
| Web    | `apps/web/`    | Next.js 14          |

## Key Commands

```bash
pnpm dev:mobile       # Start mobile app
pnpm dev:admin        # Start admin panel
pnpm dev:web          # Start web landing
pnpm build            # Build all apps
pnpm lint             # Run linter
pnpm type-check       # Run TypeScript
pnpm test             # Run tests
```

## Support

- **Documentation**: See `/docs` for all guides
- **Issues**: GitHub Issues
- **Security**: security@lovendo.xyz
