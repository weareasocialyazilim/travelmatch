# TravelMatch Mobile-First Implementation Roadmap

**Version:** 3.0
**Created:** December 22, 2025
**Updated:** December 23, 2025
**Status:** Pre-Launch - Active Development
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
│  ✅ PHASE 0 ████████████████████████████████████  TAMAMLANDI    │
│  Critical Bug Fixes                                              │
│                                                                 │
│  🔴 PHASE 1 ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  BUGÜN          │
│  Security & Type Safety                                          │
│                                                                 │
│  🟡 PHASE 2 ░░░░░░░░████████░░░░░░░░░░░░░░░░░░░░  Bu Hafta       │
│  Performance & i18n                                              │
│                                                                 │
│  🟢 PHASE 3 ░░░░░░░░░░░░░░░░████████░░░░░░░░░░░░  Önümüzdeki Hf  │
│  UX & New Features                                               │
│                                                                 │
│  🟣 PHASE 4 ░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░  Paralel        │
│  Architecture Refactor                                           │
│                                                                 │
│  🔵 PHASE 5 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████  2-3 Hafta      │
│  Polish & Store Submission                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current Stats

| Metric | Value |
|--------|-------|
| Source Files | 665+ TypeScript/TSX |
| Features | Auth, Moments, Payments, Chat, Profile, Trips, KYC |
| Screens | 80+ screens |
| Framework | React Native 0.81.5 + Expo SDK 54 |
| State | Zustand |
| Backend | Supabase (21+ Edge Functions, 52+ Migrations) |
| Database | 33+ tables, 184+ RLS policies |

---

## ✅ PHASE 0: CRITICAL BUG FIXES (TAMAMLANDI)

### 0.1 Bu Oturumda Düzeltilen Hatalar

| Task | File | Status |
|------|------|--------|
| Moment görsel yükleme | `hooks/useMoments.ts` | ✅ DONE |
| Kayıtta cinsiyet/yaş alma | `RegisterScreen.tsx` | ✅ DONE |
| Database trigger güncelleme | `migrations/20251223000000_*.sql` | ✅ DONE |

**0.1.1 Moment Image Upload Fix** ✅
```typescript
// hooks/useMoments.ts - createMoment & updateMoment
// Artık görseller Supabase Storage'a yükleniyor
// Yerel URI'ler (file://) veritabanına kaydedilmiyor
```

**0.1.2 Gender & Date of Birth in Registration** ✅
```typescript
// RegisterScreen.tsx
// - Cinsiyet seçici (pill buttons)
// - Doğum tarihi picker (18+ validasyon)
// - Türkçe UI
```

---

## 🔴 PHASE 1: SECURITY & TYPE SAFETY (BUGÜN)

### 1.1 Secret Sızıntıları (BLOCKER)

| Task | File | Priority | Status |
|------|------|----------|--------|
| Mapbox token fix | `app.config.ts:74` | P0 | ⬜ |
| Cloudflare token removal | `services/cloudflareImages.ts` | P0 | ⬜ |
| env.config.ts update | `FORBIDDEN_PUBLIC_VARS` | P0 | ⬜ |

**1.1.1 Mapbox Secret Token**
```typescript
// apps/mobile/app.config.ts:74
// ❌ YANLIŞ
RNMapboxMapsDownloadToken: process.env.EXPO_PUBLIC_MAPBOX_SECRET_TOKEN,

// ✅ DOĞRU - Build-time only, not bundled
RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOAD_TOKEN,
```

**1.1.2 Cloudflare Images Token**
```typescript
// ❌ apps/mobile/src/services/cloudflareImages.ts - SİL veya Edge Function kullan

// ✅ DOĞRU - Supabase Edge Function kullan
import { supabase } from './supabase';

export async function uploadImage(imageBlob: Blob) {
  const { data, error } = await supabase.functions.invoke('upload-image', {
    body: { file: imageBlob }
  });
  return { data, error };
}
```

### 1.2 Database & Backend

| Task | File | Status |
|------|------|--------|
| atomic_transfer RPC | `20251217200000_enable_atomic_transfer.sql` | ✅ DONE |
| cache_invalidation RLS | `20251217200001_fix_cache_invalidation_rls.sql` | ✅ DONE |
| KYC real implementation | `functions/verify-kyc/index.ts:110` | ⚠️ MOCK |

### 1.3 Type Safety (7 `any` tipi)

| File | Line | Current | Fix |
|------|------|---------|-----|
| `supabaseDbService.ts` | 436 | `item: any` | `item: MomentWithUser` |
| `supabaseDbService.ts` | 579 | `data: any[]` | `data: Transaction[]` |
| `supabaseDbService.ts` | 1327 | `report: any` | `report: ReportInput` |
| `supabaseDbService.ts` | 1360 | `block: any` | `block: BlockUserInput` |
| `supabaseDbService.ts` | 1469 | `user: any` | `user: User \| null` |
| `supabaseDbService.ts` | 1474 | `authRes: any` | `authRes: AuthResponse` |
| `supabaseDbService.ts` | 1531 | `transaction: any` | `transaction: TransactionInput` |

### 1.4 User Type Güncellemesi

| Task | File | Status |
|------|------|--------|
| User type'a gender ekle | `types/index.ts` | ⬜ |
| User type'a dateOfBirth ekle | `types/index.ts` | ⬜ |

```typescript
// types/index.ts
export interface User {
  // ... mevcut alanlar
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  dateOfBirth?: string; // ISO date string
  age?: number; // Computed from dateOfBirth
}
```

### 1.5 Error Handling & Monitoring

| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| Error Boundary | Crash durumlarında fallback UI | P1 | ⬜ |
| Sentry Integration | Production crash raporlama | P1 | ⬜ |

```typescript
// components/ErrorBoundary.tsx
import * as Sentry from '@sentry/react-native';

export class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: errorInfo });
  }
  // ...
}
```

### 1.6 Deliverables - Phase 1

| Deliverable | Status | Effort |
|-------------|--------|--------|
| Mapbox token fix | ⬜ | 15 min |
| Cloudflare service rewrite | ⬜ | 1 saat |
| env.config.ts update | ⬜ | 15 min |
| Type safety fixes (7 any) | ⬜ | 2 saat |
| User type update | ⬜ | 30 min |
| Error Boundary | ⬜ | 1 saat |
| Sentry integration | ⬜ | 2 saat |
| KYC real implementation | ⬜ | 2-4 saat |

---

## 🟡 PHASE 2: PERFORMANCE & i18n (Bu Hafta)

### 2.1 Internationalization (i18n)

| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| i18n setup | react-i18next veya expo-localization | P1 | ⬜ |
| Turkish translations | Tüm UI metinleri Türkçe | P1 | ⬜ |
| English translations | Tüm UI metinleri İngilizce | P1 | ⬜ |
| Language selector | Ayarlardan dil seçimi | P1 | ⬜ |
| Form error messages | Validation hata mesajları çevirisi | P1 | ⬜ |

**i18n Klasör Yapısı:**
```
src/
├── i18n/
│   ├── index.ts           # i18n config
│   ├── locales/
│   │   ├── tr.json        # Türkçe
│   │   └── en.json        # English
│   └── useTranslation.ts  # Custom hook
```

**Örnek Kullanım:**
```typescript
import { useTranslation } from '@/i18n';

const { t, locale, setLocale } = useTranslation();

// Kullanım
<Text>{t('auth.register.title')}</Text>
<Button onPress={() => setLocale('tr')}>{t('settings.language.turkish')}</Button>
```

### 2.2 FlatList → FlashList Migration (6 Component)

| Component | File | Status |
|-----------|------|--------|
| OnboardingScreen | `features/auth/screens/OnboardingScreen.tsx:181` | ⬜ |
| RecentSearches | `components/RecentSearches.tsx:43` | ⬜ |
| TopPicksSection | `components/TopPicksSection.tsx:29` | ⬜ |
| EnhancedSearchBar | `components/ui/EnhancedSearchBar.tsx:152` | ⬜ |
| MomentsFeedExample | `examples/MomentsFeedExample.tsx:67` | ⬜ |
| usePagination.stories | `hooks/usePagination.stories.tsx:136` | ⬜ |

### 2.3 Skeleton Loading

| Task | Description | Status |
|------|-------------|--------|
| SkeletonLoader component | Reusable skeleton component | ⬜ |
| MomentCard skeleton | Moment kartı için skeleton | ⬜ |
| ProfileCard skeleton | Profil kartı için skeleton | ⬜ |
| Feed skeleton | Feed yüklenirken skeleton | ⬜ |

```typescript
// components/ui/Skeleton.tsx
export const Skeleton = ({ width, height, borderRadius = 8 }) => (
  <Animated.View style={[
    styles.skeleton,
    { width, height, borderRadius },
    animatedStyle
  ]} />
);

// Kullanım
<Skeleton width="100%" height={200} /> // Görsel
<Skeleton width="60%" height={20} />   // Başlık
<Skeleton width="40%" height={16} />   // Alt başlık
```

### 2.4 Deliverables - Phase 2

| Deliverable | Status | Effort |
|-------------|--------|--------|
| i18n setup | ⬜ | 2 saat |
| Turkish translations | ⬜ | 4 saat |
| English translations | ⬜ | 2 saat |
| Language selector | ⬜ | 1 saat |
| FlashList migration (6) | ⬜ | 2 saat |
| Skeleton components | ⬜ | 2 saat |

---

## 🟢 PHASE 3: UX & NEW FEATURES (Önümüzdeki Hafta)

### 3.1 Profil Yaş Gösterimi

| Task | File | Status |
|------|------|--------|
| ProfileScreen'de yaş göster | `features/profile/screens/ProfileScreen.tsx` | ⬜ |
| OtherUserProfile'da yaş göster | `features/profile/screens/OtherUserProfileScreen.tsx` | ⬜ |
| Yaş hesaplama utility | `utils/age.ts` | ⬜ |

```typescript
// utils/age.ts
export const calculateAge = (birthDate: Date | string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// ProfileScreen
<Text style={styles.age}>{calculateAge(user.dateOfBirth)} yaş</Text>
```

### 3.2 Filtreleme (Cinsiyet & Yaş)

| Task | File | Status |
|------|------|--------|
| FilterModal component | `components/FilterModal.tsx` | ⬜ |
| Gender filter | Sadece erkek/kadın/hepsi | ⬜ |
| Age range filter | 18-25, 25-35, 35-45, 45+ | ⬜ |
| useMoments filter update | `hooks/useMoments.ts` | ⬜ |
| Database query update | `services/supabaseDbService.ts` | ⬜ |

```typescript
// FilterModal.tsx
interface FilterOptions {
  gender?: 'male' | 'female' | 'all';
  ageRange?: {
    min: number;
    max: number;
  };
  // ... mevcut filtreler
}

// Yaş aralıkları
const AGE_RANGES = [
  { label: '18-25', min: 18, max: 25 },
  { label: '25-35', min: 25, max: 35 },
  { label: '35-45', min: 35, max: 45 },
  { label: '45+', min: 45, max: 120 },
];
```

### 3.3 Moment Paylaşma

| Task | Description | Status |
|------|-------------|--------|
| Share button | Moment detay sayfasına paylaş butonu | ⬜ |
| Deep link generation | travelmatch://moment/{id} | ⬜ |
| WhatsApp share | WhatsApp'a moment paylaşımı | ⬜ |
| Instagram Stories | Stories'e moment paylaşımı | ⬜ |
| Copy link | Link kopyalama | ⬜ |

```typescript
// utils/share.ts
import { Share } from 'react-native';

export const shareMoment = async (moment: Moment) => {
  const url = `https://travelmatch.app/moment/${moment.id}`;
  const message = `${moment.title} - ${moment.hostName} ile buluş!\n${url}`;

  await Share.share({
    message,
    url, // iOS only
    title: moment.title,
  });
};
```

### 3.4 Harita Görünümü

| Task | Description | Status |
|------|-------------|--------|
| MapView screen | Yakınımdaki momentler haritası | ⬜ |
| Moment markers | Haritada moment işaretleri | ⬜ |
| Cluster markers | Yakın momentleri gruplama | ⬜ |
| Map/List toggle | Harita ve liste arası geçiş | ⬜ |

```typescript
// screens/ExploreMapScreen.tsx
import MapView, { Marker } from 'react-native-maps';

export const ExploreMapScreen = () => {
  const { moments } = useMoments();

  return (
    <MapView style={styles.map} initialRegion={userLocation}>
      {moments.map(moment => (
        <Marker
          key={moment.id}
          coordinate={{
            latitude: moment.location.coordinates.lat,
            longitude: moment.location.coordinates.lng,
          }}
          onPress={() => navigateToMoment(moment.id)}
        />
      ))}
    </MapView>
  );
};
```

### 3.5 Diğer UX Geliştirmeleri

| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| Dark Mode | Sistem dark mode desteği | P2 | ⬜ |
| Biometric Auth | Face ID / Touch ID | P2 | ⬜ |
| Haptic Feedback | Önemli aksiyonlarda titreşim | P3 | ⬜ |
| Empty States | İllüstrasyonlu boş durumlar | P3 | ⬜ |
| App Rating Prompt | Olumlu deneyim sonrası puan iste | P3 | ⬜ |

### 3.6 Analytics & Verification

| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| Analytics Integration | PostHog veya Mixpanel | P2 | ⬜ |
| Verification Badge | Doğrulanmış host rozeti | P2 | ⬜ |
| Calendar Integration | Kabul edilen momentleri takvime ekle | P2 | ⬜ |
| Notification Settings | Detaylı bildirim kontrolü | P3 | ⬜ |

### 3.7 Deliverables - Phase 3

| Deliverable | Status | Effort |
|-------------|--------|--------|
| Profile age display | ⬜ | 1 saat |
| Gender/Age filters | ⬜ | 3 saat |
| Moment sharing | ⬜ | 2 saat |
| Map view | ⬜ | 4 saat |
| Dark mode | ⬜ | 3 saat |
| Biometric auth | ⬜ | 2 saat |
| Analytics | ⬜ | 2 saat |
| Verification badge | ⬜ | 2 saat |

---

## 🟣 PHASE 4: ARCHITECTURE REFACTOR (Paralel - Darius Cosden Pattern)

> **Referans:** [docs/ARCHITECTURE_BEST_PRACTICES.md](./docs/ARCHITECTURE_BEST_PRACTICES.md)

### 4.1 Core Principles

1. **Organize by Features** - Her entity kendi feature klasöründe
2. **Single Responsibility** - Her component/hook 1 iş yapar
3. **Page → Feature → UI** - Component hierarchy
4. **Fetch at Navigation** - Screen'de fetch, component'a props olarak geç
5. **features/shared/** - Paylaşılan UI components
6. **lib/** - Low-level utilities (UI dışı)

### 4.2 Target Architecture

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
│   ├── moments/
│   ├── payments/
│   └── profile/
├── lib/                           ← utils/ yerine
│   ├── supabase.ts
│   ├── api-client.ts
│   └── formatters.ts
├── i18n/                          ← YENİ
│   ├── locales/
│   │   ├── tr.json
│   │   └── en.json
│   └── index.ts
├── stores/
└── navigation/
```

### 4.3 Migration Tasks

| Task | Priority | Status | Effort |
|------|----------|--------|--------|
| Create `features/shared/` | P1 | ⬜ | 30 min |
| Move UI components | P1 | ⬜ | 2 saat |
| Move feedback components | P1 | ⬜ | 1 saat |
| Move media components | P1 | ⬜ | 30 min |
| Rename `utils/` to `lib/` | P2 | ⬜ | 1 saat |
| Update all import paths | P2 | ⬜ | 2 saat |
| Create barrel exports | P2 | ⬜ | 1 saat |

### 4.4 Deliverables - Phase 4

| Deliverable | Status | Effort |
|-------------|--------|--------|
| features/shared/ structure | ⬜ | 30 min |
| UI components migration | ⬜ | 2 saat |
| Feedback components migration | ⬜ | 1 saat |
| utils/ → lib/ rename | ⬜ | 1 saat |
| Import paths update | ⬜ | 2 saat |

**Total Effort:** ~8-10 saat

---

## 🔵 PHASE 5: POLISH & STORE SUBMISSION (2-3 Hafta)

### 5.1 Store Requirements

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

### 5.2 Production Readiness

| Task | Status |
|------|--------|
| Stripe production keys | ⬜ |
| Sentry production DSN | ⬜ |
| Analytics production | ⬜ |
| Deep links test | ⬜ |
| Performance profiling | ⬜ |
| Crash-free rate check | ⬜ |

### 5.3 Deliverables - Phase 5

| Deliverable | Status | Effort |
|-------------|--------|--------|
| Store accounts setup | ⬜ | 1 gün |
| Screenshots & assets | ⬜ | 2 gün |
| Store metadata (TR & EN) | ⬜ | 1 gün |
| Production build test | ⬜ | 1 gün |
| Store submission | ⬜ | 1 gün |

---

## Implementation Order (Öncelik Sırası)

```
✅ TAMAMLANDI (Phase 0):
├── Moment görsel yükleme fix
├── Kayıtta cinsiyet/yaş alma
└── Database trigger güncelleme

BUGÜN (Phase 1 - Security):
├── 1. Mapbox token fix (15 min)
├── 2. Cloudflare token removal (1 saat)
├── 3. env.config.ts update (15 min)
├── 4. Error Boundary (1 saat)
├── 5. Sentry integration (2 saat)
├── 6. User type update (30 min)
└── 7. Type safety fixes (2 saat)

BU HAFTA (Phase 2 - Performance & i18n):
├── 8. i18n setup (2 saat)
├── 9. Turkish translations (4 saat)
├── 10. English translations (2 saat)
├── 11. Language selector (1 saat)
├── 12. FlashList migration (2 saat)
└── 13. Skeleton loading (2 saat)

ÖNÜMÜZDEKİ HAFTA (Phase 3 - Features):
├── 14. Profile yaş gösterimi (1 saat)
├── 15. Gender/Age filters (3 saat)
├── 16. Moment sharing (2 saat)
├── 17. Map view (4 saat)
├── 18. Dark mode (3 saat)
├── 19. Biometric auth (2 saat)
├── 20. Analytics (2 saat)
└── 21. Verification badge (2 saat)

PARALEL (Phase 4 - Architecture):
├── 22. features/shared/ structure
├── 23. Component migrations
├── 24. utils/ → lib/ rename
└── 25. Import paths update

2-3 HAFTA (Phase 5 - Store):
├── 26. Store accounts
├── 27. Screenshots & assets
├── 28. Store metadata
└── 29. Submission
```

---

## Success Criteria

### Phase 1 Complete When:
- [ ] No secrets in client bundle
- [ ] Error boundaries in place
- [ ] Sentry capturing errors
- [ ] Zero `any` types in critical paths

### Phase 2 Complete When:
- [ ] Full Turkish & English support
- [ ] Language switching works
- [ ] All lists use FlashList
- [ ] Skeleton loading implemented

### Phase 3 Complete When:
- [ ] Age displayed on profiles
- [ ] Gender/Age filtering works
- [ ] Moment sharing functional
- [ ] Map view implemented
- [ ] Dark mode supported

### Phase 4 Complete When:
- [ ] `features/shared/` created
- [ ] `utils/` renamed to `lib/`
- [ ] All imports updated
- [ ] Barrel exports working

### Phase 5 Complete When:
- [ ] App Store approved
- [ ] Play Store approved
- [ ] Crash-free rate > 99.9%

---

## Risk Matrix

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Token leak before fix | Critical | Low | Fix TODAY |
| Store rejection | High | Medium | Follow guidelines |
| i18n missing translations | Medium | Medium | Translation review |
| Performance issues | Medium | Low | FlashList + profiling |
| KYC mock in production | High | Medium | Integrate real provider |

---

## Recent Commits (This Session)

| Commit | Description |
|--------|-------------|
| `3dd45cc` | feat: add gender and date of birth to user registration |
| `6098020` | fix: upload moment images to storage before saving to database |
| `1141d29` | docs: add Supabase/backend status to mobile roadmap |
| `5b56df0` | docs: add architecture best practices based on Darius Cosden patterns |

---

**Document Status:** Active Implementation
**Owner:** Development Team
**Last Updated:** December 23, 2025
