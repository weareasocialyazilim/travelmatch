# TravelMatch Admin Dashboard

Enterprise-grade administrative dashboard for the TravelMatch platform. Built with Next.js 16 (App
Router) and modern React patterns.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **State**: TanStack Query + Zustand
- **Tables**: TanStack Table + DataTable
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Auth**: Supabase Auth + 2FA (TOTP)
- **Backend**: Supabase (PostgreSQL)

## Features

### Core Operations (Phase 1) ✅

- **Dashboard**: Real-time platform health, task queue, metrics
- **User Management**: View, verify (KYC), ban/suspend users
- **Content Moderation**: Review and approve/reject Moments
- **Finance**: Transactions, payouts, refunds
- **Audit Logging**: Complete action tracking

### Operations & Safety (Phase 2) ✅

- **Trust & Safety**: Fraud detection, risk scoring
- **Support Center**: Ticket system, SLA tracking
- **Integration Hub**: Supabase, Stripe, Sentry health
- **Analytics**: User metrics, revenue, funnels
- **Errors Dashboard**: Sentry integration

### Growth & Intelligence (Phase 3) ✅

- **Notifications**: Push notification composer
- **Campaigns**: Campaign builder, A/B testing
- **AI Center**: Auto-moderation, ML predictions
- **Automation**: Rule builder, trigger conditions
- **Promos**: Promo code generator, referral tracking
- **Creators**: Creator tiers, performance dashboard

### Advanced (Phase 4) ✅

- **Geographic Intelligence**: World map, heat maps
- **Ops Control Room**: Live activity, real-time metrics
- **Incident Management**: Status page, post-mortems
- **Feature Flags**: Toggle features by environment
- **Team Hub**: Shift planning, performance

### Differentiators (Phase 5) ⚠️ In Progress

- Safety Center, ESG Dashboard, Partner Portal
- Knowledge Base, Feedback Hub, Gamification
- Dynamic Pricing, Customer Success

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a `.env.local` file (see `.env.example`):

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Run the development server:

   ```bash
   pnpm dev:admin
   # or from this directory:
   pnpm dev
   ```

4. Open [http://localhost:3001](http://localhost:3001)

## Project Structure

```
apps/admin/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, 2fa)
│   │   ├── (dashboard)/       # Dashboard pages
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── queue/         # Task queue
│   │   │   ├── admin-users/   # User management
│   │   │   ├── moments/       # Content moderation
│   │   │   ├── finance/       # Finance center
│   │   │   ├── disputes/      # Dispute resolution
│   │   │   ├── support/       # Support tickets
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   ├── campaigns/     # Campaign management
│   │   │   ├── ai-center/     # AI command center
│   │   │   └── ...           # 30+ more modules
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── ui/               # Base UI components (shadcn)
│   │   ├── layout/           # Layout components
│   │   └── common/           # Shared components
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilities
│   ├── stores/               # Zustand stores
│   └── types/                # TypeScript types
└── package.json
```

## Available Pages (33 Modules)

| Category     | Pages                                                     |
| ------------ | --------------------------------------------------------- |
| Core         | Dashboard, Queue, Admin Users, Moments, Finance, Disputes |
| Operations   | Support, Analytics, Errors, Integrations, Settings        |
| Growth       | Notifications, Campaigns, Promos, Creators                |
| Intelligence | AI Center, Automation, Feature Flags                      |
| Advanced     | Geographic, Ops Center, Incidents, Pricing                |
| Extras       | Safety Center, Team, Events, Partners, Editorial, etc.    |

## Deployment

This dashboard is designed to be deployed to Vercel:

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Security

- Role-Based Access Control (RBAC)
- 2FA Required for all admin users
- Audit logging for all actions
- Row-Level Security (RLS) policies
- Session management with timeout

---

_Last updated: December 22, 2025_
