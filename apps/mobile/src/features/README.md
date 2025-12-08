# Feature-Based Architecture

Bu klasör, uygulamanın feature-based (özellik tabanlı) mimarisini içerir. Her feature kendi klasöründe bağımsız olarak organize edilmiştir.

## Klasör Yapısı

```
features/
├── auth/              # Kimlik doğrulama ve yetkilendirme
│   ├── screens/       # Auth ekranları (Login, Register, vb.)
│   ├── components/    # Auth'a özel componentler
│   ├── hooks/         # Auth hooks (useAuth, useLogin, vb.)
│   ├── services/      # Auth API servisleri
│   └── types/         # Auth type definitions
├── trips/             # Seyahat yönetimi
│   ├── screens/       # Trip ekranları (Create, Search, Detail, vb.)
│   ├── components/    # Trip componentleri
│   ├── hooks/         # Trip hooks
│   ├── services/      # Trip API servisleri
│   └── types/         # Trip types
├── profile/           # Profil yönetimi
│   ├── screens/       # Profil ekranları
│   ├── components/    # Profil componentleri
│   ├── hooks/         # Profil hooks
│   └── services/      # Profil servisleri
├── messages/          # Mesajlaşma
│   ├── screens/       # Chat ekranları
│   ├── components/    # Chat componentleri
│   ├── hooks/         # Realtime message hooks
│   └── services/      # Message servisleri
├── notifications/     # Bildirimler
│   ├── screens/       # Notification ekranları
│   ├── components/    # Notification componentleri
│   └── services/      # Push notification servisleri
└── settings/          # Ayarlar
    ├── screens/       # Settings ekranları
    ├── components/    # Settings componentleri
    └── hooks/         # Settings hooks
```

## Migration Planı

Mevcut `screens/` klasöründeki dosyalar aşamalı olarak feature klasörlerine taşınacaktır:

### 1. Auth Feature
- WelcomeScreen.tsx
- OnboardingScreen.tsx  
- CompleteProfileScreen.tsx
- (Email/Phone auth screens gelecekte)

### 2. Trips Feature
- DiscoverScreen.tsx
- BookingDetailScreen.tsx
- (Trip creation/search screens)

### 3. Profile Feature
- ProfileScreen.tsx
- ProfileDetailScreen.tsx
- EditProfileScreen.tsx
- ReputationScreen.tsx

### 4. Messages Feature
- MessagesScreen.tsx
- ChatScreen.tsx
- ArchivedChatsScreen.tsx

### 5. Notifications Feature
- NotificationDetailScreen.tsx
- NotificationSettingsScreen.tsx

### 6. Settings Feature
- AppSettingsScreen.tsx
- SecurityScreen.tsx
- PrivacyPolicyScreen.tsx
- TermsOfServiceScreen.tsx
- FAQScreen.tsx
- SupportScreen.tsx

## Kullanım

Her feature bağımsız olarak çalışabilmeli ve kendi içinde:
- Ekranları (screens)
- UI componentlerini (components)
- İş mantığını (hooks, services)
- Tip tanımlarını (types)

barındırmalıdır.

Örnek import:
```typescript
// screens/ kullanımı (eski)
import ProfileScreen from '@/screens/ProfileScreen';

// features/ kullanımı (yeni)
import ProfileScreen from '@/features/profile/screens/ProfileScreen';
// veya barrel export ile
import { ProfileScreen } from '@/features/profile';
```

## Best Practices

1. **Feature Isolation**: Her feature mümkün olduğunca bağımsız olmalı
2. **Shared Components**: Ortak componentler `src/components/` altında kalmalı
3. **Shared Services**: Ortak servisler `src/services/` altında kalmalı
4. **Type Safety**: Her feature kendi type definitions'ını içermeli
5. **Barrel Exports**: Her feature `index.ts` ile export yapmalı
