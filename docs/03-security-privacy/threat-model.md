# Threat Model

## Trust Boundaries

```
┌────────────────────────────────────────────────────────────┐
│                        External                            │
│  (Attackers, Scrapers, Automated Tools)                    │
└──────────────────────────┬─────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────┐
│                    Edge Layer (Cloudflare)                  │
│  - WAF Rules                                           │
│  - Rate Limiting                                       │
│  - DDoS Protection                                     │
└──────────────────────────┬─────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────┐
│                   Application Layer                        │
│  - Next.js API Routes                                    │
│  - Supabase Edge Functions                                │
└──────────────────────────┬─────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────┐
│                    Database Layer (Supabase)                │
│  - RLS Policies                                          │
│  - Row Security                                          │
└──────────────────────────┬─────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────┐
│                     Internal Services                       │
│  - Admin Panel                                           │
│  - Backend Services                                      │
└────────────────────────────────────────────────────────────┘
```

## Threat Categories

| Category      | Examples                   | Mitigation                 |
| ------------- | -------------------------- | -------------------------- |
| Injection     | SQL injection, XSS         | Parameterized queries, CSP |
| Broken Auth   | Session hijacking          | Short TTL, MFA for admin   |
| Data Exposure | PII leakage                | RLS, encryption, masking   |
| Broken Access | IDOR, privilege escalation | RLS, authorization checks  |
| Rate Abuse    | Brute force, scraping      | Rate limiting, WAF         |
| Content Abuse | Spam, illegal content      | Moderation, AI flags       |

## Data Sensitivity Levels

| Level        | Data                 | Protection                 |
| ------------ | -------------------- | -------------------------- |
| Public       | Moment titles, media | None (intended)            |
| Internal     | User profiles        | RLS (auth users)           |
| Confidential | Chat messages        | RLS (participants only)    |
| Restricted   | PII, payment data    | Encryption, limited access |

## Code References

| Feature    | Location                                  |
| ---------- | ----------------------------------------- |
| Auth       | `apps/mobile/src/services/authService.ts` |
| Middleware | `apps/admin/src/middleware.ts`            |
| WAF config | `apps/web/cloudflare-waf.json`            |
