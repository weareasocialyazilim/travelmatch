# TravelMatch Developer Onboarding Guide

Welcome to TravelMatch! This guide will help you get up and running quickly.

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ & pnpm 8+
- Docker Desktop (for local development)
- Git

### Setup Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/travelmatch-new.git
cd travelmatch-new

# 2. Install dependencies
pnpm install

# 3. Setup environment files (interactive wizard)
pnpm setup:env

# 4. Start Docker services (Supabase, Redis, LocalStack)
pnpm tm docker up

# 5. Initialize database
pnpm tm db migrate
pnpm tm db seed

# 6. Start development servers
pnpm tm dev start

# 7. Open apps
# Mobile: Expo Go (scan QR code)
# Admin: http://localhost:5173
# Supabase Studio: http://localhost:3000
```

## 📚 Developer CLI (tm)

We provide a unified CLI for all development tasks:

### Development
```bash
tm dev start         # Start all servers
tm dev mobile        # Mobile app only
tm dev admin         # Admin panel only
tm dev api           # Supabase functions only
```

### Database
```bash
tm db start          # Start Supabase
tm db stop           # Stop Supabase
tm db reset          # Reset database (CAUTION)
tm db migrate        # Apply migrations
tm db seed           # Seed with test data
tm db status         # Show status
tm db studio         # Open Supabase Studio
tm db types          # Generate TypeScript types
```

### Testing
```bash
tm test unit         # Unit tests
tm test integration  # Integration tests
tm test coverage     # Tests with coverage
tm test visual       # Visual regression tests
tm test all          # All tests
tm test watch        # Watch mode
```

### Docker
```bash
tm docker up         # Start Docker stack
tm docker down       # Stop Docker stack
tm docker restart    # Restart services
tm docker logs       # View logs
tm docker ps         # List containers
tm docker clean      # Remove all (CAUTION)
```

### Build & Lint
```bash
tm build all         # Build all packages
tm build mobile      # Build mobile
tm build admin       # Build admin
tm lint check        # Check for errors
tm lint fix          # Auto-fix errors
tm lint format       # Format with Prettier
```

### Setup
```bash
tm setup env         # Setup environment files
tm setup docker      # Setup Docker
tm setup all         # Complete setup
```

## 🏗️ Architecture Overview

### Monorepo Structure
```
travelmatch-new/
├── apps/
│   └── mobile/              # React Native + Expo app
├── admin/                   # Admin panel (React + Vite)
├── packages/
│   ├── design-system/       # Shared UI components
│   └── shared/              # Shared utilities
├── services/
│   ├── ml/                  # Machine learning service
│   └── payment/             # Payment service
├── supabase/
│   ├── functions/           # Edge Functions
│   ├── migrations/          # Database migrations
│   └── tests/               # Database tests
├── tests/
│   ├── integration/         # Integration tests
│   └── load/                # Load tests
└── poc/
    ├── graphql/             # GraphQL POC
    └── multi-region/        # Multi-region POC
```

### Tech Stack
- **Frontend**: React Native (Expo), React (Vite), TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Functions**: Supabase Edge Functions (Deno)
- **Caching**: Redis
- **Storage**: Cloudflare Images/Stream, LocalStack (S3)
- **Monitoring**: Sentry, Datadog
- **CI/CD**: GitHub Actions, EAS Build

## 🐳 Local Development with Docker

### Services Available
| Service | Port | URL | Credentials |
|---------|------|-----|-------------|
| Supabase Studio | 3000 | http://localhost:3000 | - |
| Admin Panel | 5173 | http://localhost:5173 | admin@example.com / admin123 |
| PostgreSQL | 5432 | localhost:5432 | postgres / postgres |
| Redis | 6379 | localhost:6379 | Password in .env.local |
| Redis Insight | 8001 | http://localhost:8001 | - |
| LocalStack | 4566 | http://localhost:4566 | test / test |
| MinIO Console | 9001 | http://localhost:9001 | minioadmin / minioadmin |
| Mailhog | 8025 | http://localhost:8025 | - |
| Grafana | 3001 | http://localhost:3001 | admin / admin |

### Common Docker Commands
```bash
# View all running containers
docker ps

# View logs for specific service
docker logs travelmatch-postgres -f

# Restart a service
docker restart travelmatch-redis

# Enter a container
docker exec -it travelmatch-postgres bash

# Check resource usage
docker stats

# Clean up everything
docker system prune -a --volumes
```

## 🗄️ Database Workflow

### Migrations
```bash
# Create new migration
pnpm tm db migrate:new migration_name

# Apply migrations
pnpm tm db migrate

# Check status
pnpm tm db status

# View diff
pnpm db:diff
```

### Testing RLS (Row Level Security)
```bash
# Test all RLS policies
pnpm db:test:rls

# Test specific module
pnpm db:test:storage
pnpm db:test:realtime
pnpm db:test:functions
```

### Generate Types
```bash
# Generate TypeScript types from database schema
pnpm tm db types

# Types are saved to:
# apps/mobile/src/types/database.types.ts
```

## 🧪 Testing Strategy

### Unit Tests (400+ tests, 100% coverage)
```bash
# Run all unit tests
pnpm test

# Run with coverage
pnpm tm test coverage

# Watch mode
pnpm tm test watch

# Specific file
pnpm test src/services/paymentService.test.ts
```

### Integration Tests (115 scenarios)
```bash
# All integration tests
pnpm tm test integration

# Specific flows
pnpm test:integration:payment
pnpm test:integration:proof
pnpm test:integration:feed
```

### Visual Regression Tests (21,384 screenshots)
```bash
# Run visual tests
pnpm tm test visual

# CI mode
pnpm test:visual:ci
```

### Coverage Goals
- **Services**: 100%
- **Hooks**: 100%
- **Components**: 95%+
- **Integration**: 85%+

## 📱 Mobile Development

### Start Expo
```bash
cd apps/mobile
pnpm dev

# Or use CLI
pnpm tm dev mobile
```

### Run on Device
```bash
# iOS Simulator
pnpm ios

# Android Emulator
pnpm android

# Physical Device (Expo Go)
# Scan QR code in terminal
```

### Build for Production
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

## ⚙️ Admin Panel Development

### Start Admin
```bash
cd admin
pnpm dev

# Or use CLI
pnpm tm dev admin
```

### Login Credentials (Local)
- Email: `admin@example.com`
- Password: `admin123`

### Features
- User management
- Moment moderation
- Analytics dashboard
- Payment tracking
- Content moderation

## 🔧 Environment Variables

### File Structure
```
.env                      # Root (Supabase CLI)
.env.local                # Docker Compose
apps/mobile/.env          # Mobile app
admin/.env                # Admin panel
```

### Setup Wizard
```bash
# Interactive setup
pnpm setup:env

# Modes:
# 1. Quick setup (defaults)
# 2. Interactive (customize)
# 3. Docker-only
```

### Security Best Practices
- ✅ Never commit `.env` files
- ✅ Use `EXPO_PUBLIC_*` only for non-sensitive data
- ✅ Keep `SUPABASE_SERVICE_KEY` server-side only
- ✅ Rotate secrets every 90 days
- ❌ Never use `EXPO_PUBLIC_*` for API keys

## 🚢 GraphQL POC

We're migrating from REST to GraphQL for better performance.

### Start GraphQL Server
```bash
cd poc/graphql
pnpm install
pnpm dev

# Server: http://localhost:4000/graphql
```

### Features
- Type-safe queries
- DataLoader (N+1 prevention)
- Real-time subscriptions
- Redis caching

### Example Query
```graphql
query GetMyProfile {
  me {
    id
    name
    email
    moments(first: 5) {
      edges {
        node {
          id
          title
          type
        }
      }
    }
  }
}
```

## 🌍 Multi-Region Testing

Test Supabase replication across regions.

### Start Multi-Region Stack
```bash
cd poc/multi-region
pnpm install
pnpm test

# Individual tests
pnpm test:lag           # Replication lag
pnpm test:failover      # Failover time
pnpm test:read-scale    # Read scalability
pnpm test:geo-latency   # Geographic latency
```

## 📊 Monitoring & Debugging

### Logs
```bash
# Supabase logs
pnpm tm docker logs

# Mobile logs
npx react-native log-android
npx react-native log-ios

# Edge Functions logs
supabase functions logs
```

### Debugging
```bash
# React Native Debugger
# Install: https://github.com/jhen0409/react-native-debugger

# Flipper
# Install: https://fbflipper.com/

# Redux DevTools
# Built into admin panel
```

## 🐛 Common Issues

### 1. Docker not starting
```bash
# Check Docker is running
docker ps

# Restart Docker Desktop
# Clean up old containers
pnpm tm docker clean
```

### 2. Port already in use
```bash
# Find process using port
lsof -i :5432

# Kill process
kill -9 <PID>
```

### 3. Supabase types not generated
```bash
# Make sure Supabase is running
pnpm tm db status

# Regenerate types
pnpm tm db types
```

### 4. pnpm install fails
```bash
# Clear cache
pnpm store prune

# Reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 5. Mobile app not loading
```bash
# Clear cache
cd apps/mobile
pnpm start --clear

# Reset Metro bundler
rm -rf .expo
```

## 📖 Resources

### Documentation
- [Quick Start](./docs/QUICK_START.md)
- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md)
- [Testing Guide](./docs/TEST_COVERAGE_IMPLEMENTATION.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)

### Code Quality
- [ESLint Config](./.eslintrc.js)
- [Prettier Config](./.prettierrc)
- [TypeScript Config](./tsconfig.json)

### CI/CD
- [GitHub Actions](./.github/workflows/)
- [EAS Build](./eas.json)

## 🤝 Contributing

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
# ...

# Run tests
pnpm tm test all

# Lint & format
pnpm tm lint fix
pnpm tm lint format

# Commit (Husky will run pre-commit hooks)
git commit -m "feat: add new feature"

# Push
git push origin feature/your-feature

# Create PR on GitHub
```

### Commit Conventions
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

### Code Review Checklist
- ✅ Tests pass (`pnpm tm test all`)
- ✅ Linting passes (`pnpm tm lint check`)
- ✅ TypeScript types correct
- ✅ No console.logs in production code
- ✅ Documentation updated
- ✅ Environment variables documented

## 💡 Tips & Tricks

### Speed up pnpm install
```bash
# Use shamefully-hoist for faster installs
echo "shamefully-hoist=true" >> .npmrc
```

### Use Turbo cache
```bash
# Cache builds across machines
turbo login
turbo link
```

### Fast iteration
```bash
# Use watch mode for everything
pnpm tm dev start &
pnpm tm test watch &
pnpm tm db studio
```

### Optimize bundle size
```bash
# Analyze bundle
pnpm build:analyze

# Check bundle size
pnpm analyze-rn-bundle
```

## 🆘 Getting Help

- **Slack**: #travelmatch-dev
- **Email**: dev@travelmatch.com
- **GitHub Issues**: [Report bugs](https://github.com/yourusername/travelmatch/issues)
- **Documentation**: [Read the docs](./docs/)

## 🎉 You're Ready!

You should now have:
- ✅ Local development environment running
- ✅ Understanding of the architecture
- ✅ Ability to run tests
- ✅ Knowledge of the CLI tools
- ✅ Resources for further learning

**Happy coding! 🚀**
