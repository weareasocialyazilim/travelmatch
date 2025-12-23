# TravelMatch Mobile-First Implementation Roadmap

**Version:** 2.0
**Created:** December 22, 2025
**Updated:** December 23, 2025
**Status:** Pre-Launch - Critical Fixes Required
**Priority:** MOBILE FIRST
**Architecture Guide:** [docs/ARCHITECTURE_BEST_PRACTICES.md](./docs/ARCHITECTURE_BEST_PRACTICES.md)

---

## Executive Summary

Mobile app is the core product. All efforts prioritize mobile stability, security, and performance before other platforms.

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE-FIRST PRIORITY                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔴 PHASE 0 ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░  BUGÜN          │
│  Critical Security Fixes (BLOCKER)                              │
│                                                                 │
│  🟡 PHASE 1 ░░░░░░░░████████░░░░░░░░░░░░░░░░░░░  Bu Hafta       │
│  Database & Type Safety                                         │
│                                                                 │
│  🟢 PHASE 2 ░░░░░░░░░░░░░░░░████████░░░░░░░░░░░  Önümüzdeki Hf  │
│  Performance & Code Quality                                     │
│                                                                 │
│  🟣 PHASE 2.5 ░░░░░░░░░░░░░░░░░░░░░░████████░░░  Paralel        │
│  Architecture Refactor (Feature-Based)                          │
│                                                                 │
│  🔵 PHASE 3 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████  2-3 Hafta     │
│  Polish & Store Submission                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current Mobile App Stats

| Metric | Value |
|--------|-------|
| Source Files | 665+ TypeScript/TSX |
| Features | Auth, Moments, Payments, Chat, Profile, Trips, KYC |
| Screens | 80+ screens |
| Framework | React Native 0.81.5 + Expo SDK 54 |
| State | Zustand |
| Backend | Supabase (21 Edge Functions) |

---

## 🔴 PHASE 0: CRITICAL SECURITY (BUGÜN - BLOCKER)

### 0.1 Secret Sızıntıları (LANSMAYI DURDURUR)

| Task | File | Priority | Status |
|------|------|----------|--------|
| Mapbox token fix | `app.config.ts:74` | P0 | ⬜ |
| Cloudflare token removal | `services/cloudflareImages.ts` | P0 | ⬜ |
| env.config.ts update | `FORBIDDEN_PUBLIC_VARS` | P0 | ⬜ |

**0.1.1 Mapbox Secret Token**
```typescript
// apps/mobile/app.config.ts:74
// ❌ YANLIŞ
RNMapboxMapsDownloadToken: process.env.EXPO_PUBLIC_MAPBOX_SECRET_TOKEN,

// ✅ DOĞRU - Build-time only, not bundled
RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOAD_TOKEN,
```

**0.1.2 Cloudflare Images Token**
```typescript
// apps/mobile/src/services/cloudflareImages.ts
// ❌ Tüm dosyayı kaldır veya Edge Function proxy kullan

// ✅ DOĞRU - Supabase Edge Function kullan
import { supabase } from './supabase';

export async function uploadImage(imageBlob: Blob) {
  const { data, error } = await supabase.functions.invoke('upload-image', {
    body: { file: imageBlob }
  });
  return { data, error };
}
```

### 0.2 Deliverables - Phase 0

| Deliverable | Status | Effort |
|-------------|--------|--------|
| Mapbox token fix | ⬜ | 15 min |
| Cloudflare service rewrite | ⬜ | 1 saat |
| env.config.ts update | ⬜ | 15 min |

---

## 🟡 PHASE 1: DATABASE & TYPE SAFETY (Bu Hafta)

### 1.1 Database Fixes

| Task | File | Priority | Status |
|------|------|----------|--------|
| atomic_transfer RPC enable | `migrations/` | P0 | ⬜ |
| cache_invalidation RLS fix | `migrations/` | P0 | ⬜ |
| KYC verification real impl | `functions/verify-kyc/` | P1 | ⬜ |

**1.1.1 Atomic Transfer RPC**
```sql
-- supabase/migrations/20251222000001_enable_atomic_transfer.sql
CREATE OR REPLACE FUNCTION atomic_transfer(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_amount DECIMAL,
  p_moment_id UUID,
  p_message TEXT
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_balance DECIMAL;
BEGIN
  -- FOR UPDATE kilitleri ile atomik işlem
  SELECT balance INTO STRICT v_sender_balance
  FROM users WHERE id = p_sender_id FOR UPDATE;

  IF v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  UPDATE users SET balance = balance - p_amount WHERE id = p_sender_id;
  UPDATE users SET balance = balance + p_amount WHERE id = p_recipient_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
```

**1.1.2 Cache Invalidation RLS**
```sql
-- Service role only access
DROP POLICY IF EXISTS "cache_invalidation_select_policy" ON public.cache_invalidation;
CREATE POLICY "Only service role access" ON public.cache_invalidation
  FOR ALL USING ((select auth.role()) = 'service_role');
```

### 1.2 Type Safety (7 `any` tipi)

| File | Line | Current | Fix |
|------|------|---------|-----|
| `supabaseDbService.ts` | 436 | `item: any` | `item: MomentWithUser` |
| `supabaseDbService.ts` | 579 | `data: any[]` | `data: Transaction[]` |
| `supabaseDbService.ts` | 1327 | `report: any` | `report: ReportInput` |
| `supabaseDbService.ts` | 1360 | `block: any` | `block: BlockUserInput` |
| `supabaseDbService.ts` | 1469 | `user: any` | `user: User \| null` |
| `supabaseDbService.ts` | 1474 | `authRes: any` | `authRes: AuthResponse` |
| `supabaseDbService.ts` | 1531 | `transaction: any` | `transaction: TransactionInput` |

### 1.3 Deliverables - Phase 1

| Deliverable | Status | Effort |
|-------------|--------|--------|
| atomic_transfer migration | ⬜ | 30 min |
| cache_invalidation RLS | ⬜ | 15 min |
| KYC real implementation | ⬜ | 2-4 saat |
| Type safety fixes (7 any) | ⬜ | 2 saat |

---

## 🟢 PHASE 2: PERFORMANCE & CODE QUALITY (Önümüzdeki Hafta)

### 2.1 FlatList → FlashList Migration (6 Component)

| Component | File | Status |
|-----------|------|--------|
| OnboardingScreen | `features/auth/screens/OnboardingScreen.tsx:181` | ⬜ |
| RecentSearches | `components/RecentSearches.tsx:43` | ⬜ |
| TopPicksSection | `components/TopPicksSection.tsx:29` | ⬜ |
| EnhancedSearchBar | `components/ui/EnhancedSearchBar.tsx:152` | ⬜ |
| MomentsFeedExample | `examples/MomentsFeedExample.tsx:67` | ⬜ |
| usePagination.stories | `hooks/usePagination.stories.tsx:136` | ⬜ |

**Migration Pattern:**
```typescript
// ❌ YANLIŞ
import { FlatList } from 'react-native';
<FlatList data={items} renderItem={renderItem} />

// ✅ DOĞRU
import { FlashList } from '@shopify/flash-list';
<FlashList
  data={items}
  renderItem={renderItem}
  estimatedItemSize={100}
/>
```

### 2.2 Code Duplication Fix (862 satır)

| Duplicate | Location | Action |
|-----------|----------|--------|
| validation.ts | `apps/mobile/src/utils/validation.ts` | DELETE |
| schemas.ts | `apps/mobile/src/utils/forms/schemas.ts` | DELETE |
| schemas/ | `packages/shared/src/schemas/` | KEEP (Single Source) |

**Fix Pattern:**
```typescript
// ❌ YANLIŞ - apps/mobile/src/utils/validation.ts
export const loginSchema = z.object({...});

// ✅ DOĞRU - Import from shared
import { loginSchema, registerSchema } from '@travelmatch/shared/schemas';
```

### 2.3 RequestCard Memoization

```typescript
// apps/mobile/src/features/trips/components/RequestCard.tsx
export const RequestCard = memo(function RequestCard(props: RequestCardProps) {
  // ... component logic
}, (prevProps, nextProps) => {
  return prevProps.request.id === nextProps.request.id &&
         prevProps.request.status === nextProps.request.status;
});
```

### 2.4 useFetch Offline Support

```typescript
// apps/mobile/src/hooks/useFetch.ts - Add retry & cache
export function useFetch<T>(url: string, options?: FetchOptions) {
  const { isConnected } = useNetworkState();

  const fetchWithRetry = async () => {
    if (!isConnected) {
      const cached = await AsyncStorage.getItem(`cache:${url}`);
      if (cached) return JSON.parse(cached);
      throw new OfflineError('No network connection');
    }
    // ... retry logic
  };
}
```

### 2.5 Deliverables - Phase 2

| Deliverable | Status | Effort |
|-------------|--------|--------|
| FlashList migration (6) | ⬜ | 2 saat |
| Validation schema cleanup | ⬜ | 1 saat |
| RequestCard memo | ⬜ | 30 min |
| useFetch offline | ⬜ | 1 saat |
| Type consistency fix | ⬜ | 2 saat |

---

## 🟣 PHASE 2.5: ARCHITECTURE REFACTOR (Paralel - Darius Cosden Pattern)

> **Referans:** [docs/ARCHITECTURE_BEST_PRACTICES.md](./docs/ARCHITECTURE_BEST_PRACTICES.md)

### 2.5.1 Core Principles (Darius Cosden)

1. **Organize by Features** - Her entity kendi feature klasöründe
2. **Single Responsibility** - Her component/hook 1 iş yapar
3. **Page → Feature → UI** - Component hierarchy
4. **Fetch at Navigation** - Screen'de fetch, component'a props olarak geç
5. **features/shared/** - Paylaşılan UI components
6. **lib/** - Low-level utilities (UI dışı)

### 2.5.2 Current Architecture Problems

```
❌ MEVCUT SORUNLAR:
├── components/           # 80+ dosya root'ta (KÖTÜ)
├── hooks/                # Global hooks (feature'da olmalı)
├── types/                # Global types (feature'da olmalı)
├── utils/                # lib/ olmalı
└── features/
    └── auth/             # Eksik: components/, hooks/
```

### 2.5.3 Target Architecture

```
✅ HEDEF YAPI:
├── features/
│   ├── shared/                    ← YENİ
│   │   ├── components/
│   │   │   ├── ui/               # Button, Card, Input
│   │   │   ├── feedback/         # ErrorState, LoadingState
│   │   │   └── media/            # CachedImage, VideoPlayer
│   │   ├── hooks/
│   │   ├── types/
│   │   └── constants/
│   ├── auth/
│   │   ├── components/           # LoginForm, RegisterForm
│   │   ├── hooks/                # useAuth
│   │   ├── screens/
│   │   ├── services/
│   │   ├── types.ts
│   │   └── constants.ts
│   ├── moments/
│   │   ├── components/           # MomentCard, MomentList
│   │   ├── hooks/                # useMoments
│   │   └── ...
│   └── payments/                  # Zaten iyi yapıda
├── lib/                           ← utils/ yerine
│   ├── supabase.ts
│   ├── api-client.ts
│   └── formatters.ts
├── stores/                        # Global state (OK)
└── navigation/                    # Navigation layer (OK)
```

### 2.5.4 Migration Tasks

| Task | Priority | Status | Effort |
|------|----------|--------|--------|
| Create `features/shared/` folder structure | P1 | ⬜ | 30 min |
| Move UI components to `shared/components/ui/` | P1 | ⬜ | 2 saat |
| Move feedback components to `shared/components/feedback/` | P1 | ⬜ | 1 saat |
| Move media components to `shared/components/media/` | P1 | ⬜ | 30 min |
| Move MomentCard to `features/moments/components/` | P2 | ⬜ | 30 min |
| Move RequestCard to `features/trips/components/` | P2 | ⬜ | 30 min |
| Rename `utils/` to `lib/` | P2 | ⬜ | 1 saat |
| Move global hooks to `features/shared/hooks/` | P2 | ⬜ | 1 saat |
| Create barrel exports (`index.ts`) | P2 | ⬜ | 1 saat |
| Update all import paths | P2 | ⬜ | 2 saat |

### 2.5.5 Component Categories

**UI Components → `features/shared/components/ui/`**
```
Button, Card, Input, Modal, Badge, Avatar,
Checkbox, Switch, Select, Tabs, Toast, Tooltip
```

**Feedback Components → `features/shared/components/feedback/`**
```
ErrorState, LoadingState, EmptyState,
OfflineBanner, OfflineState, NetworkGuard
```

**Media Components → `features/shared/components/media/`**
```
CachedImage, SmartImage, AccessibleVideoPlayer
```

**Feature Components → `features/{feature}/components/`**
```
features/moments/components/MomentCard.tsx
features/trips/components/RequestCard.tsx
features/payments/components/WalletListItem.tsx
```

### 2.5.6 Import Path Conventions

```typescript
// UI Components
import { Button, Card } from '@/features/shared/components/ui'

// Feedback Components
import { ErrorState } from '@/features/shared/components/feedback'

// Feature Components
import { MomentCard } from '@/features/moments/components'

// Lib utilities
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/formatters'
```

### 2.5.7 Deliverables - Phase 2.5

| Deliverable | Status | Effort |
|-------------|--------|--------|
| features/shared/ structure | ⬜ | 30 min |
| UI components migration | ⬜ | 2 saat |
| Feedback components migration | ⬜ | 1 saat |
| Feature components migration | ⬜ | 1 saat |
| utils/ → lib/ rename | ⬜ | 1 saat |
| Import paths update | ⬜ | 2 saat |
| Barrel exports | ⬜ | 1 saat |

**Total Effort:** ~8-10 saat

---

## 🔵 PHASE 3: POLISH & STORE SUBMISSION (2-3 Hafta)

### 3.1 Store Requirements

| Platform | Task | Status |
|----------|------|--------|
| iOS | Apple Developer Account ($99) | ⬜ |
| iOS | App Store Connect setup | ⬜ |
| iOS | Screenshots (6.7", 6.5", 5.5") | ⬜ |
| iOS | App description (4000 chars) | ⬜ |
| iOS | Privacy Policy URL | ✅ |
| Android | Google Developer Account ($25) | ⬜ |
| Android | Play Console setup | ⬜ |
| Android | Feature graphic (1024x500) | ⬜ |
| Android | Screenshots | ⬜ |
| Android | Data safety form | ⬜ |

### 3.2 Production Readiness

| Task | Status |
|------|--------|
| Stripe production keys | ⬜ |
| Realtime subscriptions test | ⬜ |
| Push notifications test | ⬜ |
| Deep links test | ⬜ |
| Performance profiling | ⬜ |
| Crash-free rate check | ⬜ |

### 3.3 Deliverables - Phase 3

| Deliverable | Status | Effort |
|-------------|--------|--------|
| Store accounts setup | ⬜ | 1 gün |
| Screenshots & assets | ⬜ | 2 gün |
| Store metadata | ⬜ | 1 gün |
| Production build test | ⬜ | 1 gün |
| Store submission | ⬜ | 1 gün |

---

## Implementation Order (Öncelik Sırası)

```
BUGÜN (Phase 0):
├── 1. Mapbox token fix (15 min)
├── 2. Cloudflare token removal (1 saat)
└── 3. env.config.ts update (15 min)

BU HAFTA (Phase 1):
├── 4. atomic_transfer migration (30 min)
├── 5. cache_invalidation RLS (15 min)
├── 6. Type safety fixes (2 saat)
└── 7. KYC real implementation (2-4 saat)

ÖNÜMÜZDEKİ HAFTA (Phase 2):
├── 8. FlashList migration (2 saat)
├── 9. Validation schema cleanup (1 saat)
├── 10. RequestCard memo (30 min)
├── 11. useFetch offline (1 saat)
└── 12. Type consistency (2 saat)

PARALEL (Phase 2.5 - Architecture Refactor):
├── 13. Create features/shared/ structure (30 min)
├── 14. Move UI components (2 saat)
├── 15. Move feedback/media components (1.5 saat)
├── 16. Move feature-specific components (1 saat)
├── 17. Rename utils/ → lib/ (1 saat)
└── 18. Update import paths (2 saat)

2-3 HAFTA İÇİNDE (Phase 3):
├── 19. Store accounts setup
├── 20. Screenshots & assets
├── 21. Production testing
└── 22. Store submission
```

---

## Success Criteria

### Phase 0 Complete When:
- [ ] No secrets in client bundle
- [ ] `EXPO_PUBLIC_` only has safe values
- [ ] Security audit passes

### Phase 1 Complete When:
- [ ] atomic_transfer working
- [ ] RLS policies secure
- [ ] Zero `any` types in critical paths
- [ ] TypeScript strict mode passes

### Phase 2 Complete When:
- [ ] All lists use FlashList
- [ ] Single source for validation schemas
- [ ] 60 FPS scroll performance
- [ ] Offline mode functional

### Phase 2.5 Complete When:
- [ ] `features/shared/` folder created with ui/, feedback/, media/
- [ ] All global components moved to appropriate locations
- [ ] `utils/` renamed to `lib/`
- [ ] All import paths updated
- [ ] Barrel exports (`index.ts`) for each folder
- [ ] Feature folders have consistent structure

### Phase 3 Complete When:
- [ ] App Store approved
- [ ] Play Store approved
- [ ] Crash-free rate > 99.9%
- [ ] Error rate < 1%

---

## Risk Matrix

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Token leak before fix | Critical | Low | Fix TODAY |
| Store rejection | High | Medium | Follow guidelines exactly |
| Performance issues | Medium | Low | FlashList + profiling |
| Type errors in prod | Medium | Medium | Strict mode + tests |

---

**Document Status:** Active Implementation
**Owner:** Development Team
**Last Updated:** December 22, 2025
