# TravelMatch

**Gift travel experiences to the people you love.**

TravelMatch is a platform where you can send monetary gifts for travel experiences. Recipients must provide proof of completing the experience before funds are released — turning every gift into a guaranteed memory.

---

## 🎁 How It Works

1. **Create a Moment** — Define a travel experience you want to gift
2. **Gift & Send** — Send it to someone with funds held in escrow
3. **Prove It** — Recipient uploads proof (photos, location, receipts)
4. **Release Funds** — AI verifies the proof, money transfers automatically

---

## ✨ Features

**For Gifters**
- Browse thousands of travel experiences worldwide
- Secure escrow payments — funds only release after verification
- Real-time notifications when your gift is claimed

**For Recipients**
- Accept gifts and plan your experience
- Easy proof submission with AI-powered verification
- Instant withdrawals to your bank account

**Trust & Security**
- KYC verification for all users
- Trust scoring system
- PCI-DSS compliant payments via PayTR
- KVKK/GDPR compliant data handling

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native 0.81 · Expo SDK 54 · TypeScript 5.9 |
| Web | Next.js 16 · Tailwind CSS |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Payments | PayTR (Escrow) |
| AI/ML | Proof verification · Smart notifications |
| Infra | Turborepo · pnpm · GitHub Actions |

---

## 📁 Project Structure

```
travelmatch/
├── apps/
│   ├── mobile/          # React Native app (iOS & Android)
│   ├── web/             # Next.js landing page
│   └── admin/           # Admin dashboard
├── packages/
│   ├── design-system/   # Shared UI components & tokens
│   ├── shared/          # Shared utilities & types
│   └── monitoring/      # Observability utilities
├── services/
│   ├── ml-service/      # AI proof verification
│   ├── job-queue/       # Background job processing
│   └── payment/         # Payment orchestration
└── supabase/
    ├── functions/       # Edge functions
    └── migrations/      # Database migrations
```

---

## 🚀 Getting Started

**Prerequisites:** Node.js 18+, pnpm 9+

```bash
# Install dependencies
pnpm install

# Setup environment
pnpm setup:env

# Start development
pnpm dev
```

**Run specific apps:**
```bash
pnpm dev:mobile    # Mobile (Expo)
pnpm dev:web       # Landing page
pnpm dev:admin     # Admin panel
pnpm ios           # iOS Simulator
pnpm android       # Android Emulator
```

---

## 📚 Documentation

- [Getting Started](docs/GETTING_STARTED.md)
- [API Reference](docs/API_REFERENCE.md)
- [Architecture](docs/ARCHITECTURE_BEST_PRACTICES.md)
- [Database](docs/DATABASE_ARCHITECTURE.md)
- [Deployment](docs/DEPLOYMENT_GUIDE.md)
- [Security](docs/SECURITY_HARDENING.md)

---

## 🤝 Contributing

**Branch strategy:**
```
main ← develop ← feature/xxx, fix/xxx, chore/xxx
```

**Commit convention:** [Conventional Commits](https://conventionalcommits.org)
```
feat(mobile): add trust score animation
fix(payments): handle PayTR timeout
```

**Before committing:**
```bash
pnpm validate   # Runs lint + type-check + test
```

---

## 📜 License

Proprietary. All rights reserved.

---

Built with ❤️ by [weareAsocial](https://weareasocial.com)
