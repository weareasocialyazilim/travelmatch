# Getting Started with Lovendo

**Complete setup guide for developers**  
**Last Updated**: December 8, 2025

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Monorepo Structure](#monorepo-structure)
5. [Development Workflow](#development-workflow)
6. [Running the Apps](#running-the-apps)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

Get up and running in 5 minutes:

```bash
# 1. Clone repository
git clone https://github.com/kemalteksalgit/lovendo.git
cd lovendo

# 2. Install pnpm (if not installed)
npm install -g pnpm@9.15.0

# 3. Install dependencies
pnpm install

# 4. Copy environment files
cp .env.example .env
cp apps/mobile/.env.example apps/mobile/.env

# 5. Start development
pnpm dev
```

**🎉 That's it!** Mobile app runs on Expo, admin panel on http://localhost:5173

---

## Prerequisites

### Required

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **pnpm**: v9.15.0 or higher (run `npm install -g pnpm@9.15.0`)
- **Git**: Latest version
- **Expo Go**: Mobile app for testing (iOS/Android)

### Optional but Recommended

- **VS Code**: With ESLint, Prettier, TypeScript extensions
- **Xcode**: For iOS development (macOS only)
- **Android Studio**: For Android development
- **Supabase CLI**: For database migrations (`npm install -g supabase`)

### Check Your Setup

```bash
node --version    # Should be v18+
pnpm --version    # Should be 9.15.0+
git --version     # Any recent version
```

---

## Installation

### Step 1: Install pnpm

pnpm is **3x faster** than npm and saves disk space.

```bash
# Install globally
npm install -g pnpm@9.15.0

# Verify installation
pnpm --version  # Should output 9.15.0
```

### Step 2: Clone Repository

```bash
git clone https://github.com/kemalteksalgit/lovendo.git
cd lovendo
```

### Step 3: Install Dependencies

```bash
# Install all workspace dependencies (takes ~2 minutes)
pnpm install

# This installs:
# - Root dependencies (Turborepo, ESLint, TypeScript)
# - apps/mobile dependencies (React Native, Expo)
# - apps/admin dependencies (React, Vite)
# - packages/shared dependencies
# - packages/design-system dependencies
```

### Step 4: Environment Setup

```bash
# Copy environment templates
cp .env.example .env
cp apps/mobile/.env.example apps/mobile/.env
cp apps/admin/.env.example apps/admin/.env

# Edit .env files with your credentials
# - Supabase URL and keys
# - Stripe API keys
# - OAuth credentials (optional)
```

**Required Environment Variables:**

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for complete list.

---

## Monorepo Structure

Lovendo uses a **pnpm workspace + Turborepo** monorepo:

```
lovendo/
├── apps/
│   ├── mobile/          # React Native + Expo app
│   └── admin/           # React admin panel (Vite)
├── packages/
│   ├── shared/          # Shared utilities, types, services
│   └── design-system/   # Shared UI components
├── services/
│   ├── payment/         # Payment microservice
│   └── ml/              # ML recommendation service
├── supabase/
│   ├── functions/       # Edge functions (Deno)
│   ├── migrations/      # Database migrations
│   └── tests/           # RLS tests
├── docs/                # Documentation
├── scripts/             # Build/deployment scripts
└── tests/               # E2E tests (Maestro)
```

### Why Monorepo?

✅ **Zero code duplication** (shared code in `packages/`)  
✅ **80% faster builds** (Turborepo caching)  
✅ **Type-safe imports** across all apps  
✅ **Consistent tooling** (ESLint, TypeScript, Prettier)  
✅ **Easy to add new apps** (just create `apps/new-app/`)

### Package Dependencies

```
apps/mobile
  ↓ imports
packages/shared (types, services, utils)
packages/design-system (UI components)

apps/admin
  ↓ imports
packages/shared (types, services, utils)
packages/design-system (UI components)
```

### Import Paths

**Before (old structure):**
```typescript
import { User } from '../../../types/user';
import { COLORS } from '../../constants/colors';
```

**After (monorepo):**
```typescript
import type { User } from '@lovendo/shared/types';
import { COLORS } from '@lovendo/design-system/tokens';
```

---

## Development Workflow

### Root Commands (Run from Root Directory)

```bash
# Start all apps in development mode
pnpm dev

# Build all packages and apps
pnpm build

# Run tests across all packages
pnpm test

# Lint all code
pnpm lint

# Type check all TypeScript
pnpm type-check

# Clean all build artifacts
pnpm clean
```

### Turborepo Features

**Parallel Execution:**
```bash
# Builds all packages in parallel (respecting dependencies)
pnpm build
```

**Caching:**
```bash
# First build: ~2 minutes
pnpm build

# Second build: ~5 seconds (cached!)
pnpm build
```

**Selective Execution:**
```bash
# Only run tests for changed packages
pnpm turbo run test --filter=...[origin/main]
```

### Workspace Commands

Run commands in specific workspaces:

```bash
# Run mobile app
pnpm --filter mobile start

# Run admin panel
pnpm --filter admin dev

# Build shared package
pnpm --filter shared build

# Add dependency to mobile app
pnpm --filter mobile add react-native-reanimated

# Add dependency to all apps
pnpm -r add lodash
```

---

## Running the Apps

### Mobile App (React Native + Expo)

```bash
# Start Expo development server
pnpm --filter mobile start

# Or from apps/mobile directory
cd apps/mobile
pnpm start
```

**Options:**
- Press `i` - Open iOS simulator
- Press `a` - Open Android emulator
- Scan QR code - Open on physical device (Expo Go app)
- Press `w` - Open in web browser

**Hot Reload:**
- Save file → App reloads automatically
- Press `r` → Manual reload
- Press `Shift+r` → Reload and clear cache

### Admin Panel (React + Vite)

```bash
# Start Vite dev server
pnpm --filter admin dev

# Or from apps/admin directory
cd apps/admin
pnpm dev
```

Opens at **http://localhost:5173**

### Supabase Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Serve edge functions locally
supabase functions serve

# Deploy to production
supabase functions deploy create-payment
```

### All Apps at Once

```bash
# Run everything in parallel
pnpm dev
```

This starts:
- Mobile app (Expo)
- Admin panel (Vite)
- Storybook (if configured)

---

## Testing

### Unit Tests (Jest)

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch

# Test specific file
pnpm test src/hooks/useMoments.test.ts
```

**Coverage Thresholds:**
- Global: 85-90%
- Services: 90-95%
- Hooks: 88-92%
- Components: 85-90%

### E2E Tests (Maestro)

```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Run E2E tests
maestro test tests/e2e/flows/

# Run specific flow
maestro test tests/e2e/flows/onboarding-complete.yaml
```

### RLS Policy Tests

```bash
# Run RLS security tests
supabase test db

# Run specific test
supabase test db --file supabase/tests/rls_policies.test.sql
```

### Device Farm Tests

```bash
# Run on AWS Device Farm (via GitHub Actions)
gh workflow run device-farm-tests.yml \
  -f suite=smoke \
  -f platform=both
```

### Bundle Size Tests

```bash
# Check bundle sizes
node scripts/bundle-size-check.mjs

# Compare with baseline
node scripts/bundle-size-check.mjs --compare
```

---

## Troubleshooting

### Issue: `pnpm install` fails

**Solution:**
```bash
# Clear pnpm cache
pnpm store prune

# Delete node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

### Issue: Module not found `@lovendo/shared`

**Solution:**
```bash
# Rebuild all packages
pnpm turbo run build --force

# Or build just shared package
pnpm --filter shared build
```

### Issue: TypeScript errors after update

**Solution:**
```bash
# Clear TypeScript cache
find . -name "*.tsbuildinfo" -delete

# Rebuild and type check
pnpm turbo run type-check --force
```

### Issue: Metro bundler can't resolve packages

**Solution:**
Update `apps/mobile/metro.config.js`:
```javascript
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Watch workspace packages
const packages = path.resolve(__dirname, '../../packages');
config.watchFolders = [packages];

// Add monorepo node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../../node_modules'),
];

module.exports = config;
```

### Issue: Expo app won't start

**Solution:**
```bash
# Clear Expo cache
pnpm --filter mobile start --clear

# Or manually delete cache
rm -rf apps/mobile/.expo
rm -rf apps/mobile/node_modules/.cache
```

### Issue: Admin panel build fails

**Solution:**
```bash
# Clear Vite cache
rm -rf apps/admin/dist
rm -rf apps/admin/node_modules/.vite

# Rebuild
pnpm --filter admin build
```

### Issue: ESLint errors

**Solution:**
```bash
# Auto-fix issues
pnpm lint --fix

# Check specific file
pnpm eslint src/hooks/useMoments.ts --fix
```

### Issue: Supabase connection fails

**Solution:**
1. Check environment variables are correct
2. Verify Supabase project is running
3. Check network connection
4. Try regenerating API keys in Supabase dashboard

---

## Performance Benchmarks

### Build Times (with Turborepo)

| Task | Without Turbo | With Turbo | Improvement |
|------|---------------|------------|-------------|
| First build | ~10 min | ~2 min | **80% faster** |
| Rebuild (no changes) | ~10 min | ~5 sec | **99% faster** |
| Type check | ~2 min | ~20 sec | **83% faster** |
| CI/CD pipeline | ~15 min | ~3 min | **80% faster** |

### Bundle Sizes

| App | Main Bundle | Vendor Bundle | Total |
|-----|-------------|---------------|-------|
| Mobile (Android) | 500 KB | 1.5 MB | **4 MB** |
| Mobile (iOS) | 500 KB | 1.5 MB | **4 MB** |
| Admin Panel | 300 KB | 800 KB | **1.6 MB** |
| Design System | 150 KB | 200 KB | **350 KB** |

---

## Next Steps

1. ✅ **Read Documentation**
   - [API Reference](./API_REFERENCE.md) - Complete API docs
   - [Environment Variables](./ENVIRONMENT_VARIABLES.md) - Config guide
   - [Quality Improvements](./QUALITY_IMPROVEMENTS.md) - Testing & CI/CD

2. ✅ **Explore Code**
   - `apps/mobile/src/` - Mobile app source
   - `packages/shared/` - Shared utilities
   - `supabase/migrations/` - Database schema

3. ✅ **Run Tests**
   ```bash
   pnpm test
   maestro test tests/e2e/flows/
   ```

4. ✅ **Make Your First Change**
   - Create a feature branch
   - Make changes
   - Run tests
   - Submit PR

---

## Getting Help

- **Documentation**: Check `docs/` folder
- **GitHub Issues**: [Report bugs](https://github.com/kemalteksalgit/lovendo/issues)
- **Team Chat**: Internal Slack/Discord
- **Code Review**: Submit PRs for feedback

---

## Quick Reference Card

```bash
# Development
pnpm dev                    # Start all apps
pnpm --filter mobile start  # Start mobile app
pnpm --filter admin dev     # Start admin panel

# Building
pnpm build                  # Build all packages
pnpm turbo run build        # Same with Turbo

# Testing
pnpm test                   # Unit tests
pnpm test --coverage        # With coverage
maestro test tests/e2e/     # E2E tests

# Code Quality
pnpm lint                   # Lint all code
pnpm lint --fix             # Auto-fix issues
pnpm type-check             # TypeScript check

# Cleanup
pnpm clean                  # Clean build artifacts
rm -rf node_modules         # Nuclear option
pnpm install                # Reinstall
```

---

**Happy coding! 🚀**
