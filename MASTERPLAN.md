# 🚀 TravelMatch MASTERPLAN

**Tarih:** 2025-12-23  
**Son Güncelleme:** 2025-12-23 - analyze-images branch merge edildi  
**Hedef:** Production-Ready Launch  
**Toplam Dokümantasyon:** 16,549 satır analiz edildi

---

## Executive Summary

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         TRAVELMATCH MASTERPLAN                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SPRINT 1 ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  BUGÜN (4-6 saat)             │
│  → 59 TypeScript Hatası Düzelt                                                  │
│                                                                                 │
│  SPRINT 2 ░░░░░░░░████████░░░░░░░░░░░░░░░░░░░░░░  YARIN (6-8 saat)             │
│  → Güvenlik Açıkları Kapat (6 Critical)                                         │
│                                                                                 │
│  SPRINT 3 ░░░░░░░░░░░░░░░░████████░░░░░░░░░░░░░░  GÜN 3 (4-6 saat)             │
│  → Feature Architecture Refactor                                                │
│                                                                                 │
│  SPRINT 4 ░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░░░  GÜN 4-5 (8-10 saat)          │
│  → Production Build & Testing                                                   │
│                                                                                 │
│  SPRINT 5 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████░░  GÜN 6-7                       │
│  → Store Submission                                                             │
│                                                                                 │
│  🎯 LAUNCH ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██  1 HAFTA SONRA               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Mevcut Durum Analizi

### ✅ Tamamlanan (19 Branch Merge Edildi)

| Kategori        | Durum | Detay                                             |
| --------------- | ----- | ------------------------------------------------- |
| 🔒 Güvenlik     | ✅    | OWASP düzeltmeleri uygulandı                      |
| ⚡ Performans   | ✅    | React memoization + Supabase realtime             |
| 🧪 Test         | ✅    | Jest + Playwright altyapısı                       |
| 🗄️ Database     | ✅    | 33 tablo, 184 RLS policy                          |
| 📚 Docs         | ✅    | 16,549 satır dokümantasyon                        |
| 🎨 Design       | ✅    | Design system + UX toolkit                        |
| 💳 Subscription | ✅    | Passport/First Class/Concierge tier sistemi       |
| 🖼️ UI/UX        | ✅    | Adrian K design guidelines + 501 dosya güncelleme |

### ⚠️ Kritik Sorunlar

| #   | Sorun                     | Öncelik    | Etki                   |
| --- | ------------------------- | ---------- | ---------------------- |
| 1   | 59 TypeScript hatası      | 🔴 BLOCKER | Build başarısız        |
| 2   | 6 Critical güvenlik açığı | 🔴 BLOCKER | Production'a çıkılamaz |
| 3   | PostgREST injection       | 🔴 BLOCKER | Data breach riski      |
| 4   | Job Queue auth yok        | 🔴 BLOCKER | Spam/abuse riski       |
| 5   | Rate limiting eksik       | 🟡 HIGH    | Brute force riski      |

---

## 🔥 SPRINT 1: TypeScript Hataları (BUGÜN)

> **Süre:** 4-6 saat  
> **Hedef:** 59 → 0 hata

### Görev 1.1: Shared Package Types (30 dk)

```bash
# Dosya: packages/shared/src/types/core.ts
# Eksik export'lar eklenecek: Moment, MomentUser, MomentLocation
```

**Değişiklikler:**

- [ ] `Moment` interface export et
- [ ] `MomentUser` interface export et
- [ ] `MomentLocation` interface export et

### Görev 1.2: Adapters.ts Düzeltmeleri (2 saat)

**Dosya:** `apps/mobile/src/types/adapters.ts` (23 hata)

| Satır         | Fix                                      |
| ------------- | ---------------------------------------- |
| 347           | `location` → `UserLocation \| undefined` |
| 375, 377, 379 | Add `?? ''` defaults                     |
| 399           | `amount: apiGesture.amount ?? 0`         |
| 456, 460      | `content ?? ''`, `read ?? false`         |
| 488, 489      | `latitude ?? 0`, `longitude ?? 0`        |
| 505           | `momentId` → `moment_id`                 |
| 558           | `currency ?? 'TRY'`                      |

### Görev 1.3: Auth Screens (1 saat)

**Dosyalar:**

- `RegisterScreen.tsx` - RegisterData interface güncelle
- `VerifyPhoneScreen.tsx` - Route + Auth methods ekle

```typescript
// types/navigation.ts - EKLE
VerifyPhone: {
  email: string;
  phone: string;
  fullName: string;
}
CompleteProfile: {
  email: string;
  phone: string;
  fullName: string;
}

// types/auth.ts - GÜNCELLE
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  dateOfBirth: string;
}
```

### Görev 1.4: useMessages Hook (1 saat)

**Dosya:** `hooks/useMessages.ts` (17 hata)

```typescript
// Type guard ekle
interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: string;
  image_url?: string;
  location?: unknown;
  created_at: string;
  read_at?: string;
}

function isDbMessage(obj: unknown): obj is DbMessage {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}
```

### Görev 1.5: Performance Utils (30 dk)

**Dosya:** `utils/performanceOptimization.ts` (6 hata)

```typescript
// useRef<T>() → useRef<T | undefined>(undefined)
const ref = useRef<T | undefined>(undefined);
const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
const prevDepsRef = useRef<DependencyList | undefined>(undefined);
const valueRef = useRef<T | undefined>(undefined);
const prevProps = useRef<Record<string, unknown> | undefined>(undefined);
```

### Görev 1.6: Diğer Düzeltmeler (30 dk)

| Dosya                       | Hata                | Fix                                 |
| --------------------------- | ------------------- | ----------------------------------- |
| `DiscoverScreen.tsx`        | `estimatedItemSize` | FlashList types check               |
| `realtimeChannelManager.ts` | Generic constraint  | `T extends Record<string, unknown>` |
| `schemas.ts`                | z.enum              | `errorMap` → `error`                |
| `RegisterScreen.tsx`        | `mintLight`         | COLORS'a ekle                       |

---

## 🔒 SPRINT 2: Güvenlik Düzeltmeleri (YARIN)

> **Süre:** 6-8 saat  
> **Hedef:** 6 Critical → 0

### Görev 2.1: PostgREST Injection Fix (2 saat)

**Etkilenen Dosyalar:**

- `apps/admin/src/app/api/admin-users/route.ts`
- `apps/admin/src/app/api/users/route.ts`
- `apps/admin/src/app/api/tasks/route.ts`

```typescript
// ÖNCE (VULNERABLE)
query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

// SONRA (SECURE)
const sanitizedSearch = search.replace(/[%_,().]/g, '');
if (sanitizedSearch.length > 0) {
  query = query.or(`name.ilike.%${sanitizedSearch}%,email.ilike.%${sanitizedSearch}%`);
}
```

### Görev 2.2: Job Queue Authentication (2 saat)

**Dosya:** `services/job-queue/src/index.ts`

```typescript
// Middleware ekle
const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.JOB_QUEUE_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Apply to all routes
app.use('/jobs', authenticateApiKey);
app.use('/admin', authenticateApiKey);
```

### Görev 2.3: Rate Limiting (1 saat)

**Dosya:** `supabase/functions/api/v1/index.ts`

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 req/min
});

// Auth endpoints
if (url.pathname.includes('/auth/')) {
  const { success } = await ratelimit.limit(clientIp);
  if (!success) {
    return new Response('Rate limited', { status: 429 });
  }
}
```

### Görev 2.4: Secret Token Güvenliği (1 saat)

**Dosya:** `apps/mobile/app.config.ts`

```typescript
// ÖNCE (SECRET EXPOSED)
RNMapboxMapsDownloadToken: process.env.EXPO_PUBLIC_MAPBOX_SECRET_TOKEN,

// SONRA (BUILD-TIME ONLY)
RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOAD_TOKEN, // Not EXPO_PUBLIC_
```

**Dosya:** `services/cloudflareImages.ts` → Edge Function'a taşı

### Görev 2.5: CORS & Security Headers (1 saat)

**Dosya:** `apps/admin/next.config.js`

```javascript
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self'..." },
];
```

---

## 🏗️ SPRINT 3: Architecture Refactor (GÜN 3)

> **Süre:** 4-6 saat  
> **Hedef:** Darius Cosden prensiplerini uygula

### Mevcut vs Hedef Yapı

```
MEVCUT:                          HEDEF:
src/                             src/
├── components/ (global)         ├── features/
├── screens/ (flat)              │   ├── shared/
├── hooks/ (global)              │   │   ├── components/ui/
├── services/ (monolithic)       │   │   ├── hooks/
├── features/                    │   │   └── types.ts
│   ├── auth/                    │   ├── auth/
│   │   ├── screens/             │   │   ├── components/
│   │   └── services/            │   │   ├── hooks/
│   └── ...                      │   │   ├── screens/
└── utils/                       │   │   ├── services/
                                 │   │   ├── constants.ts
                                 │   │   └── types.ts
                                 │   └── moments/
                                 │       └── ... (aynı yapı)
                                 ├── lib/
                                 │   ├── db/
                                 │   ├── utils/
                                 │   └── env.ts
                                 └── navigation/
```

### Görev 3.1: Shared Components Taşıma (1 saat)

```bash
# UI components'ları features/shared altına taşı
mv src/components/ui src/features/shared/components/ui
```

### Görev 3.2: Feature-Specific Hooks (1 saat)

Her feature için kendi hooks klasörü:

- `features/auth/hooks/useAuth.ts`
- `features/moments/hooks/useMoments.ts`
- `features/payments/hooks/usePayments.ts`

### Görev 3.3: Services Refactor (2 saat)

**Büyük dosyaları böl:**

- `supabaseDbService.ts` (1500+ satır) → Feature-based services

```typescript
// ÖNCE: services/supabaseDbService.ts (her şey tek dosyada)

// SONRA:
features / auth / services / authService.ts;
features / moments / services / momentsService.ts;
features / payments / services / paymentsService.ts;
features / messages / services / messagesService.ts;
```

### Görev 3.4: Lib Folder (1 saat)

```
lib/
├── db/
│   ├── index.ts      # Supabase client
│   └── schema.ts     # Database types
├── utils/
│   ├── cn.ts         # classNames helper
│   └── format.ts     # formatters
└── env.ts            # Environment validation
```

---

## 🧪 SPRINT 4: Production Build & Testing (GÜN 4-5)

> **Süre:** 8-10 saat  
> **Hedef:** Production-ready app

### Görev 4.1: Full Test Suite (3 saat)

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type check
pnpm type-check

# Lint
pnpm lint
```

### Görev 4.2: Production Build (2 saat)

```bash
# iOS
cd apps/mobile && eas build --platform ios --profile production

# Android
cd apps/mobile && eas build --platform android --profile production
```

### Görev 4.3: Manual Testing Checklist (3 saat)

| Flow       | Test                  | Status |
| ---------- | --------------------- | ------ |
| Auth       | Register with email   | ⬜     |
| Auth       | Login                 | ⬜     |
| Auth       | Forgot password       | ⬜     |
| Profile    | Edit profile          | ⬜     |
| Profile    | Upload avatar         | ⬜     |
| Moments    | Create moment         | ⬜     |
| Moments    | Upload images         | ⬜     |
| Moments    | Location verification | ⬜     |
| Chat       | Send message          | ⬜     |
| Chat       | Receive message       | ⬜     |
| Payments   | Add payment method    | ⬜     |
| Payments   | Send gift             | ⬜     |
| Payments   | Receive gift          | ⬜     |
| Push       | Receive notification  | ⬜     |
| Deep Links | Open from link        | ⬜     |

### Görev 4.4: Performance Audit (2 saat)

```bash
# Bundle size analysis
pnpm analyze

# Lighthouse audit (web)
npx lighthouse https://admin.travelmatch.app

# React Native performance
npx react-native-performance
```

---

## 📱 SPRINT 5: Store Submission (GÜN 6-7)

> **Süre:** Değişken (store review süreci)  
> **Hedef:** App Store + Play Store onayı

### Görev 5.1: App Store Connect (iOS)

**Gerekli Materyaller:**

- [ ] 6.7" screenshots (iPhone 15 Pro Max)
- [ ] 6.5" screenshots (iPhone 14 Plus)
- [ ] 5.5" screenshots (iPhone 8 Plus)
- [ ] App description (Turkish + English)
- [ ] Keywords
- [ ] Privacy Policy URL
- [ ] Support URL
- [ ] Age rating

**Submit:**

```bash
eas submit --platform ios --latest
```

### Görev 5.2: Google Play Console (Android)

**Gerekli Materyaller:**

- [ ] Feature graphic (1024x500)
- [ ] Phone screenshots
- [ ] 7" tablet screenshots
- [ ] 10" tablet screenshots
- [ ] Short description (80 chars)
- [ ] Full description
- [ ] Content rating questionnaire
- [ ] Data safety form

**Submit:**

```bash
eas submit --platform android --latest
```

### Görev 5.3: Pre-Launch Checklist

```
✅ Infrastructure
├── [ ] Supabase production ready
├── [ ] Edge functions deployed
├── [ ] Sentry configured
├── [ ] PostHog tracking
└── [ ] Stripe production mode

✅ Legal
├── [ ] Privacy Policy URL live
├── [ ] Terms of Service URL live
├── [ ] KVKK/GDPR compliance
└── [ ] Cookie consent (web)

✅ Monitoring
├── [ ] Error alerting setup
├── [ ] Performance monitoring
├── [ ] Uptime monitoring
└── [ ] Analytics dashboard
```

---

## 📅 Zaman Çizelgesi

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GÜN 1 (BUGÜN)                                                          │
│  ═══════════════                                                        │
│  09:00 - 11:00  │ TypeScript: Shared package + Adapters                 │
│  11:00 - 12:00  │ TypeScript: Auth screens                              │
│  13:00 - 14:00  │ TypeScript: useMessages hook                          │
│  14:00 - 15:00  │ TypeScript: Performance utils + others                │
│  15:00 - 16:00  │ Test & verify: 59 → 0 errors                          │
├─────────────────────────────────────────────────────────────────────────┤
│  GÜN 2                                                                  │
│  ═════                                                                  │
│  09:00 - 11:00  │ Security: PostgREST injection fix                     │
│  11:00 - 13:00  │ Security: Job queue authentication                    │
│  14:00 - 15:00  │ Security: Rate limiting                               │
│  15:00 - 16:00  │ Security: Secret tokens + headers                     │
│  16:00 - 17:00  │ Security audit verification                           │
├─────────────────────────────────────────────────────────────────────────┤
│  GÜN 3                                                                  │
│  ═════                                                                  │
│  09:00 - 10:00  │ Refactor: Shared components                           │
│  10:00 - 11:00  │ Refactor: Feature-specific hooks                      │
│  11:00 - 13:00  │ Refactor: Services split                              │
│  14:00 - 15:00  │ Refactor: Lib folder setup                            │
│  15:00 - 17:00  │ Code review & cleanup                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  GÜN 4-5                                                                │
│  ═══════                                                                │
│  Full day      │ Testing + Production builds                            │
├─────────────────────────────────────────────────────────────────────────┤
│  GÜN 6-7                                                                │
│  ═══════                                                                │
│  Full day      │ Store submission + Review                              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Başarı Kriterleri

| Kriter      | Hedef        | Nasıl Ölçülür          |
| ----------- | ------------ | ---------------------- |
| TypeScript  | 0 hata       | `pnpm type-check`      |
| Security    | 0 critical   | Security audit         |
| Tests       | %80 coverage | `pnpm test:coverage`   |
| Build       | Başarılı     | EAS build status       |
| Performance | LCP < 2.5s   | Lighthouse             |
| Store       | Onaylandı    | App Store + Play Store |

---

## � Subscription Tier Sistemi (HAZIR)

> **Branch:** `claude/analyze-images-bqLp0` - ✅ MERGE EDİLDİ

### Tier Yapısı

| Tier               | Fiyat     | Özellikler                                       |
| ------------------ | --------- | ------------------------------------------------ |
| 🆓 **Passport**    | Ücretsiz  | 5 swipe/gün, 1 boost/hafta, reklamlı             |
| ✈️ **First Class** | $9.99/ay  | Sınırsız swipe, 3 boost/gün, reklamsız           |
| 👑 **Concierge**   | $29.99/ay | Tüm First Class + VIP desteği, öncelikli eşleşme |

### Uygulanan Dosyalar

- ✅ `SubscriptionScreen.tsx` - UI/UX Adrian K guidelines
- ✅ `AppSettingsScreen.tsx` - Abonelik yönetimi
- ✅ `subscriptionService.ts` - Backend entegrasyonu
- ✅ `useSubscription.ts` - React hook
- ✅ 501 dosya güncellendi

---

## �🚀 Şimdi Başlayalım!

**İlk Adım:** Sprint 1, Görev 1.1 - Shared Package Types

```bash
# Başlamak için:
cd /Users/kemalteksal/travelmatch
code packages/shared/src/types/core.ts
```

**Onay ver, TypeScript hatalarını düzeltmeye başlayalım! 🔥**
