# TravelMatch Architecture Best Practices

**Version:** 1.0 **Created:** December 22, 2025 **Based on:** Darius Cosden's React Architecture
Principles

---

## 6 Core Principles

### 1. Organize Everything by Features

Her entity (users, posts, moments, payments) kendi feature klasöründe olmalı.

```
features/
├── shared/              # Paylaşılan UI components
│   ├── components/
│   │   └── ui/         # Button, Card, Input, etc.
│   ├── hooks/
│   └── types/
├── auth/
│   ├── components/
│   ├── hooks/
│   ├── screens/
│   ├── services/
│   ├── constants.ts
│   └── types.ts
├── moments/
│   ├── components/
│   ├── hooks/
│   ├── screens/
│   ├── services/
│   ├── constants.ts
│   └── types.ts
└── payments/
    └── ...
```

### 2. Single Responsibility Principle

Her şey sadece BİR iş yapmalı:

- Components: 1 şey render eder
- Hooks: 1 şey yapar
- Utility functions: 1 şey yapar

**Karmaşıklık, parçaları birleştirmekten gelir - bireysel parçalardan değil.**

```typescript
// ✅ DOĞRU - Tek sorumluluk
type MomentListProps = {
  moments: Array<Moment>
}

// Sadece moment listesini render etmekten sorumlu
export function MomentList({ moments }: MomentListProps) {
  return (
    <FlashList
      data={moments}
      renderItem={({ item }) => (
        <MomentCard key={item.id} moment={item} />
      )}
      estimatedItemSize={300}
    />
  )
}

// ❌ YANLIŞ - Birden fazla sorumluluk
export function MomentList() {
  const [moments, setMoments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMoments().then(setMoments) // Fetch + render = 2 sorumluluk
  }, [])

  if (loading) return <Loading />
  if (error) return <Error />
  return <FlashList ... />
}
```

### 3. Page → Feature → UI Component Hierarchy

```
Page Components (Screen)
    └── Feature Components (TodoList, UserDashboard)
            └── UI Components (Button, Card, Input)
```

```typescript
// 1. PAGE COMPONENT (Entry Point) - screens/MomentsScreen.tsx
function MomentsScreen() {
  const { data: moments } = useQuery({
    ...getMomentsQueryOptions(),
    staleTime: 0
  })

  return <MomentList moments={moments} />
}

// 2. FEATURE COMPONENT - components/MomentList.tsx
function MomentList({ moments }: MomentListProps) {
  return (
    <FlashList
      data={moments}
      renderItem={({ item }) => <MomentCard moment={item} />}
    />
  )
}

// 3. UI COMPONENT - shared/components/ui/Card.tsx
function Card({ children, ...props }: CardProps) {
  return <View style={styles.card} {...props}>{children}</View>
}
```

### 4. Fetch at Navigation Layer

Client component'larda fetch yapma. Loader'da veya screen component'ta fetch yap.

```typescript
// ✅ DOĞRU - Navigation/Screen seviyesinde fetch
// screens/MomentsScreen.tsx
function MomentsScreen() {
  const { data: moments } = useQuery(getMomentsQueryOptions())

  return <MomentList moments={moments} />
}

// components/MomentList.tsx - Sadece props alır, fetch YAPMAZ
function MomentList({ moments }: { moments: Moment[] }) {
  return <FlashList data={moments} ... />
}

// ❌ YANLIŞ - Feature component'ta fetch
function MomentList() {
  const { data: moments } = useQuery(getMomentsQueryOptions()) // YANLIŞ
  return <FlashList data={moments} ... />
}
```

### 5. features/shared for UI Components

Paylaşılan her component, hook, type → `features/shared/` içinde

```
features/shared/
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── index.ts
├── hooks/
│   ├── useDebounce.ts
│   ├── useKeyboard.ts
│   └── index.ts
├── types/
│   ├── common.ts
│   └── index.ts
└── constants/
    └── index.ts
```

### 6. lib/ for Low-Level Utilities

UI ile ilgisi olmayan, düşük seviyeli utility'ler için `lib/` klasörü kullan:

```
lib/
├── supabase.ts        # Supabase client
├── api-client.ts      # HTTP client
├── storage.ts         # AsyncStorage helpers
├── analytics.ts       # Analytics helpers
├── formatters.ts      # Date, currency formatters
├── validators.ts      # Validation helpers
└── index.ts
```

---

## Current vs Target Structure

### MEVCUT (Sorunlu) Yapı

```
apps/mobile/src/
├── components/           ← 80+ dosya root'ta (KÖTÜ)
│   ├── MomentCard.tsx
│   ├── RequestCard.tsx
│   ├── Button.tsx
│   └── ...80 more files
├── hooks/                ← Global hooks (feature'da olmalı)
├── services/             ← Global services
├── stores/               ← Global stores (OK)
├── types/                ← Global types (feature'da olmalı)
├── utils/                ← lib/ olmalı
└── features/
    ├── auth/             ← Eksik: components/, hooks/
    ├── moments/          ← Eksik: components/, hooks/
    └── payments/         ← İyi yapı!
```

### HEDEF Yapı

```
apps/mobile/src/
├── features/
│   ├── shared/                    ← YENİ
│   │   ├── components/
│   │   │   ├── ui/               # Button, Card, Input, Modal
│   │   │   ├── feedback/         # ErrorState, LoadingState
│   │   │   ├── media/            # CachedImage, VideoPlayer
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   ├── useKeyboard.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── common.ts
│   │   │   └── index.ts
│   │   └── constants/
│   │       └── index.ts
│   │
│   ├── auth/
│   │   ├── components/           # Auth-specific components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── index.ts
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── authApi.ts
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   │
│   ├── moments/
│   │   ├── components/
│   │   │   ├── MomentCard.tsx
│   │   │   ├── MomentList.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useMoments.ts
│   │   │   └── index.ts
│   │   ├── screens/
│   │   ├── services/
│   │   ├── types.ts
│   │   └── constants.ts
│   │
│   ├── payments/                  # Zaten iyi yapıda
│   ├── messages/
│   ├── profile/
│   ├── trips/
│   └── settings/
│
├── lib/                           ← utils/ yerine
│   ├── supabase.ts
│   ├── api-client.ts
│   ├── storage.ts
│   ├── analytics.ts
│   └── formatters.ts
│
├── stores/                        ← Global state (OK)
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── index.ts
│
├── navigation/                    ← Navigation layer (OK)
│   └── index.tsx
│
└── config/                        ← App config (OK)
    └── index.ts
```

---

## Migration Plan

### Phase 1: features/shared/ Oluştur (Öncelik: YÜKSEK)

```bash
# 1. Klasör yapısını oluştur
mkdir -p features/shared/components/ui
mkdir -p features/shared/components/feedback
mkdir -p features/shared/components/media
mkdir -p features/shared/hooks
mkdir -p features/shared/types
mkdir -p features/shared/constants

# 2. UI components'ları taşı
mv components/Button.tsx features/shared/components/ui/
mv components/Card.tsx features/shared/components/ui/
mv components/Input.tsx features/shared/components/ui/
# ... diğer UI components

# 3. Feedback components'ları taşı
mv components/ErrorState.tsx features/shared/components/feedback/
mv components/LoadingState.tsx features/shared/components/feedback/
mv components/OfflineState.tsx features/shared/components/feedback/

# 4. Media components'ları taşı
mv components/CachedImage.tsx features/shared/components/media/
mv components/SmartImage.tsx features/shared/components/media/
mv components/AccessibleVideoPlayer.tsx features/shared/components/media/
```

### Phase 2: Feature Components Taşı

```bash
# MomentCard → features/moments/components/
mv components/MomentCard.tsx features/moments/components/

# RequestCard → features/trips/components/
mv components/RequestCard.tsx features/trips/components/

# Payment components → features/payments/components/
# (Zaten yerinde)
```

### Phase 3: utils/ → lib/

```bash
# Rename utils to lib
mv utils lib

# Update all imports
# import { ... } from '@/utils' → import { ... } from '@/lib'
```

### Phase 4: Global hooks → features/shared/hooks

```bash
mv hooks/useDebounce.ts features/shared/hooks/
mv hooks/useKeyboard.ts features/shared/hooks/
mv hooks/useNetworkState.ts features/shared/hooks/
```

---

## Component Categories

### UI Components (features/shared/components/ui/)

Tamamen presentational, business logic yok:

```
Button.tsx, Card.tsx, Input.tsx, Modal.tsx,
Badge.tsx, Avatar.tsx, Checkbox.tsx, Switch.tsx,
Select.tsx, Tabs.tsx, Toast.tsx, Tooltip.tsx
```

### Feedback Components (features/shared/components/feedback/)

```
ErrorState.tsx, LoadingState.tsx, EmptyState.tsx,
OfflineBanner.tsx, OfflineState.tsx, NetworkGuard.tsx
```

### Media Components (features/shared/components/media/)

```
CachedImage.tsx, SmartImage.tsx, AccessibleVideoPlayer.tsx
```

### Feature Components (features/{feature}/components/)

Business logic içerir, feature-specific:

```
features/moments/components/MomentCard.tsx
features/moments/components/MomentList.tsx
features/trips/components/RequestCard.tsx
features/payments/components/WalletListItem.tsx
```

---

## Import Path Conventions

```typescript
// UI Components
import { Button, Card, Input } from '@/features/shared/components/ui';

// Feedback Components
import { ErrorState, LoadingState } from '@/features/shared/components/feedback';

// Feature Components
import { MomentCard } from '@/features/moments/components';

// Hooks
import { useDebounce } from '@/features/shared/hooks';
import { useMoments } from '@/features/moments/hooks';

// Lib utilities
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/formatters';

// Types
import type { User, Moment } from '@/features/shared/types';
import type { PaymentMethod } from '@/features/payments/types';
```

---

## Checklist

- [ ] `features/shared/` klasörü oluşturuldu
- [ ] UI components taşındı (`Button`, `Card`, `Input`, etc.)
- [ ] Feedback components taşındı (`ErrorState`, `LoadingState`)
- [ ] Media components taşındı (`CachedImage`, `VideoPlayer`)
- [ ] Feature-specific components ilgili feature'lara taşındı
- [ ] `utils/` → `lib/` rename edildi
- [ ] Global hooks → `features/shared/hooks/` taşındı
- [ ] Her feature klasöründe `components/`, `hooks/`, `types.ts`, `constants.ts` var
- [ ] Import path'ler güncellendi
- [ ] Barrel exports (`index.ts`) oluşturuldu

---

**Document Status:** Active **Last Updated:** December 22, 2025
