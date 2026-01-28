# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Mobile    │  │   Admin     │  │    Web      │              │
│  │  (React     │  │  (Next.js)  │  │  (Next.js)  │              │
│  │   Native)   │  │             │  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                     Edge/Proxy Layer                             │
├────────────────────────────┼────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Cloudflare WAF + CDN                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                    Application Layer                            │
├────────────────────────────┼────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Supabase (PostgreSQL + Auth)               │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │    │
│  │  │ Tables  │ │   RLS   │ │Storage  │ │Edge Funcs   │   │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Next.js API Routes                         │    │
│  │            (apps/admin/src/app/api/)                    │    │
│  └─────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                   External Services                             │
├────────────────────────────┼────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  PayTR   │ │Mapbox    │ │  AWS     │ │RevenueCat│           │
│  │ (payout) │ │(maps)    │ │Rekognition│ │ (IAP)    │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │ SendGrid │ │ Sentry   │ │ PostHog  │                        │
│  │ (email)  │ │(crash)   │ │(analytics)│                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack Summary

| Layer             | Technology                  | Purpose             |
| ----------------- | --------------------------- | ------------------- |
| Mobile            | React Native 0.81 + Expo 54 | iOS/Android app     |
| Web               | Next.js 14 (App Router)     | Landing page        |
| Admin             | Next.js 14 (App Router)     | Admin panel         |
| Database          | PostgreSQL + Supabase       | Data, Auth, RLS     |
| Storage           | Supabase Storage            | Media assets        |
| Functions         | Supabase Edge Functions     | Business logic      |
| Payments (IAP)    | RevenueCat                  | In-app purchases    |
| Payments (Payout) | PayTR                       | Creator withdrawals |
| Maps              | Mapbox                      | Location services   |
| Moderation        | AWS Rekognition             | Content flagging    |
| Monitoring        | Sentry                      | Error tracking      |
| Analytics         | PostHog                     | Product analytics   |
| Secrets           | Infisical                   | Secret management   |

## Code Organization

```
apps/
  mobile/          # React Native app
    src/
      features/    # Feature modules
      services/    # Business logic
      hooks/       # React hooks
      navigation/  # Navigation config
  admin/           # Next.js admin panel
    src/
      app/         # App Router pages
      components/  # UI components
      services/    # API clients
      hooks/       # Custom hooks
  web/             # Next.js landing
    src/
      app/         # App Router pages
      components/  # UI components

supabase/
  functions/       # Edge Functions
  migrations/      # DB migrations
  config/          # RLS policies

docs/              # This documentation
```
