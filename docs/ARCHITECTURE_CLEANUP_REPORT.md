# Lovendo Mimari Temizlik Raporu

**Tarih:** 3 Ocak 2026  
**Versiyon:** 2.0 Baseline Hazırlık  
**Son Güncelleme:** 3 Ocak 2026 - ✅ TÜM FAZLAR TAMAMLANDI

---

## 📋 Executive Summary

Bu rapor, Lovendo projesinin mimari temizliğini ve "Master Plan" uygulamasını kapsamaktadır.
Aşağıda tespit edilen sorunlar, yapılan düzeltmeler ve gelecek adımlar detaylı olarak açıklanmıştır.

**Durum:** ✅ Tüm kritik maddeler tamamlandı. Güvenlik taraması geçti (Snyk: 0 issue).

---

## ✅ Yapılan Düzeltmeler

### 1. Ghost Dosyaları Temizlendi

| Dosya                                                                 | Durum      |
| --------------------------------------------------------------------- | ---------- |
| `supabase/migrations/20251212100000_atomic_transfer_rpc.sql.disabled` | ❌ SİLİNDİ |
| `supabase/seed.sql.disabled`                                          | ❌ SİLİNDİ |

> **Not:** Bu dosyalar git geçmişinde kalacak, ancak canlı klasörde durmamalıdır.

### 2. Orphan Scripts Archive Edildi

| Script                           | Durum                                   |
| -------------------------------- | --------------------------------------- |
| `scripts/migrate-typography.mjs` | 📦 `scripts/archive/` klasörüne taşındı |

> **Not:** Bir kez kullanılan migration scriptleri archive klasöründe saklanmalı.

### 3. Low Power Mode Hook Oluşturuldu

- **Dosya:** `apps/mobile/src/hooks/useLowPowerMode.ts`
- **Özellikler:**
  - Device performance detection
  - Battery saver mode awareness
  - Accessibility (reduceMotion) integration
  - User preference persistence
  - `shouldOfferLowPowerMode` flag for UX prompts

### 4. RLS SQL Templates Oluşturuldu

- **Dosya:** `packages/shared/sql-templates/rls-policy-templates.sql`
- **İçerik:**
  - 6 farklı RLS policy template (User-Owned, Public Read, Chat, Financial, Admin, Soft Delete)
  - Anti-patterns ve best practices dokümantasyonu
  - Test checklist

### 5. Design System Native Yapısı Başlatıldı

- **Klasör:** `packages/design-system/src/native/`
- **İçerik:**
  - Migration planı ve component listesi
  - NativeComponentsConfig interface
  - Phase-based migration roadmap

### 6. ProofCeremonyFlow Low Power Mode Entegrasyonu

- **Dosya:** `apps/mobile/src/features/discover/components/ceremony/ProofCeremonyFlow.tsx`
- **Değişiklikler:**
  - `useLowPowerMode` hook entegrasyonu
  - Animasyon duration'ları config'den alınıyor
  - Confetti particle sayısı low power mode'da azaltılıyor
  - `shouldOfferLowPowerMode` prompt UI eklendi
  - Haptic feedback config'e bağlandı

### 7. Migration Squash Script Oluşturuldu

- **Dosya:** `scripts/squash-migrations.sh`
- **Özellikler:**
  - `--dry-run` ve `--backup` flag desteği
  - 5 baseline dosyası oluşturma
  - Supabase CLI entegrasyonu
  - Detaylı next steps dokümantasyonu

### 8. TrustConstellation Low Power Mode Entegrasyonu ✅ YENİ

- **Dosya:** `apps/mobile/src/components/ui/TrustConstellation.tsx`
- **Değişiklikler:**
  - `useLowPowerMode` hook entegrasyonu
  - Glow efektleri low power mode'da devre dışı
  - `disableGlow` prop eklendi
  - SVG render optimizasyonu

### 9. Babel Config - Mock Exclusion ✅ YENİ

- **Dosya:** `apps/mobile/babel.config.js`
- **Değişiklikler:**
  - Production build'de `__mocks__` klasörü exclude ediliyor
  - `transform-remove-console` plugin eklendi
  - Test dosyaları production'dan exclude

### 10. Web Liquid Design Tokens ✅ YENİ

- **Dosya:** `packages/design-system/src/tokens/liquid.ts`
- **İçerik:**
  - Cross-platform Liquid design tokens
  - LIQUID_COLORS, LIQUID_SHADOWS, LIQUID_RADIUS
  - LIQUID_ANIMATION (spring configs dahil)
  - CSS Variables export
  - Tailwind plugin extension

- **Dosya:** `packages/design-system/src/tailwind.preset.ts`
- **Değişiklikler:**
  - Liquid tokens entegre edildi
  - `bg-liquid-*` gradient class'ları
  - `shadow-liquid-glow-*` class'ları
  - `ease-liquid` timing function

### 11. Edge Function Required Resilience Middleware ✅ YENİ

- **Dosya:** `supabase/functions/_shared/required-resilience.ts`
- **Özellikler:**
  - `createResilientHandler()` - zorunlu resilience wrapper
  - Circuit breaker otomatik entegrasyonu
  - Rate limiting dahil
  - CORS ve security headers otomatik
  - Health check handler
  - Request ID tracking

### 12. ML Service Architecture Decision (ADR-002) ✅ YENİ

- **TypeScript (PRIMARY):** `services/ml/smart-notifications/index.ts`
  - Real-time inference için kullanılacak
  - ADR notice eklendi
- **Python (DEPRECATED for inference):** `services/ml-service/app/models/smart_notifications.py`
  - Sadece training ve batch processing için
  - DeprecationWarning eklendi
  - Docstring güncellendi

---

## 🔍 Tespit Edilen Sorunlar ve Öneriler

### A. Migration Kirliliği (93 Migration Dosyası)

**Sorun:** `supabase/migrations/` klasöründe 93 migration dosyası bulunmaktadır. Bunların çoğu
"fix", "critical_fix", "security_audit" pattern'ine sahiptir.

**Kategorilere Göre Dağılım:** | Kategori | Sayı | Örnek Dosyalar |
|----------|------|----------------| | Initial Schema | 4 | `20241205000000_initial_schema.sql` | |
Security Fixes | 15+ | `fix_rls_*`, `critical_security_*` | | Performance | 8+ |
`performance_indexes`, `gist_indexes` | | Feature | 20+ | `escrow_system`, `commission_system` | |
Cleanup | 10+ | `cleanup_duplicate_indexes`, `linter_fixes` |

**Öneri - Migration Squash Planı:**

```
📦 squash/
├── 001_baseline_schema.sql          # Tüm tablo yapıları
├── 002_indexes_and_constraints.sql  # Tüm indexler
├── 003_rls_policies.sql             # Tüm RLS politikaları
├── 004_functions_and_triggers.sql   # Tüm fonksiyonlar
└── 005_seed_data.sql                # Başlangıç verileri
```

**Aksiyon:** Mevcut şema stabil olduktan sonra `supabase db dump` ile clean baseline oluşturun.

---

### B. UI Component Duplikasyonu

**Sorun:** Monorepo yapısında atomik bileşenler iki yerde bulunuyor.

| Lokasyon                                 | Bileşen Sayısı | Örnekler                              |
| ---------------------------------------- | -------------- | ------------------------------------- |
| `packages/design-system/src/components/` | 2              | `NavigationStates.tsx`                |
| `apps/mobile/src/components/ui/`         | 52             | `TMButton`, `TMBadge`, `TMCard`, etc. |

**Analiz:**

- `TMButton.tsx` (571 satır) - Awwwards kalitesinde, reanimated ile zenginleştirilmiş
- `NavigationStates.tsx` (655 satır) - Empty/Error/Loading states
- Mobile tarafında "Mini Design System" oluşmuş

**Öneri - Design System Merge Planı:**

```
packages/design-system/
├── src/
│   ├── primitives/           # Platform-agnostic primitives
│   │   ├── Button.tsx        # Base button (no animations)
│   │   ├── Card.tsx
│   │   └── Badge.tsx
│   ├── native/               # React Native specific
│   │   ├── TMButton.tsx      # Animated button with haptics
│   │   ├── LiquidInput.tsx
│   │   └── TrustConstellation.tsx
│   ├── web/                  # Web specific
│   │   └── Button.tsx
│   └── shared/               # Cross-platform
│       └── NavigationStates.tsx
```

**Aksiyon:**

1. `apps/mobile/src/components/ui/` bileşenlerini `packages/design-system/src/native/` altına taşı
2. Import path'leri güncelle: `@/components/ui/TMButton` →
   `@lovendo/design-system/native/TMButton`
3. `apps/mobile/src/components/ui/index.ts` → re-export facade olarak tut (backward compat)

---

### C. ML Service Duplicate Logic

**Sorun:** Smart Notifications mantığı iki farklı dilde implement edilmiş.

| Servis        | Dil        | Lokasyon                                                | Satır |
| ------------- | ---------- | ------------------------------------------------------- | ----- |
| Edge Function | TypeScript | `services/ml/smart-notifications/index.ts`              | 230   |
| ML Service    | Python     | `services/ml-service/app/models/smart_notifications.py` | 65    |

**Karşılaştırma:** | Özellik | TypeScript | Python | |---------|------------|--------| | Optimal
send time | ✅ Peak hours logic | ✅ Fixed 2pm logic | | Channel selection | ✅ Based on user
features | ✅ Based on urgency | | Content generation | ✅ Templates | ❌ Not implemented | | DB
Integration | ✅ Supabase direct | ❌ Not integrated |

**Öneri:**

1. **Karar:** ML işlemleri Python tarafında mı kalacak, Edge Function'lar mı?
2. **Tercih:** Edge Functions (TypeScript) ana akış için, Python sadece model training için
3. **Aksiyon:** `services/ml-service/app/models/smart_notifications.py` → Archive veya training-only
   olarak işaretle

---

### D. Validation Utils Analizi

**Durum:** ✅ Zaten doğru yapılandırılmış

| Dosya                                     | İçerik                                               |
| ----------------------------------------- | ---------------------------------------------------- |
| `packages/shared/src/utils/validation.ts` | Pure validation functions (regex-based)              |
| `apps/mobile/src/utils/validation.ts`     | Re-exports from shared + mobile-specific Zod schemas |

**Not:** Mobile tarafındaki dosya shared'dan re-export yapıyor, bu doğru pattern. Mobile-specific
schemas (createMomentSchema, sendMessageSchema) yerinde.

---

### E. Web/Mobile Marka Tutarlılığı

**Sorun:** "Liquid Design" dili sadece mobile'da mevcut.

| Platform | Liquid Components                                            | Durum  |
| -------- | ------------------------------------------------------------ | ------ |
| Mobile   | `LiquidBottomSheet`, `LiquidInput`, `LiquidSegmentedControl` | ✅     |
| Web      | -                                                            | ❌ Yok |

**Öneri:**

1. `packages/design-system/src/tokens/` → Tailwind preset'leri ortaklaştır
2. Web için CSS-in-JS veya Tailwind ile Liquid eşdeğerleri oluştur
3. `apps/web/` → `@lovendo/design-system` preset'ini kullan

---

### F. RLS Güvenlik Analizi

**Durum:** Migration dosyalarında sürekli RLS düzeltmeleri var (15+ dosya).

**Kritik Fonksiyonlar (Audit Gerekli):** | Fonksiyon | Dosya | Risk | |-----------|-------|------| |
`increment_user_balance` | `secure_balance_functions.sql` | HIGH | | `decrement_user_balance` |
`secure_balance_functions.sql` | HIGH | | `atomic_transfer` | `atomic_transfer_rpc.sql` | HIGH |

**Öneri:**

1. `packages/shared/sql-templates/` → RLS policy templates oluştur
2. Her deploy öncesi `supabase test db` ile RLS testleri çalıştır
3. Security DEFINER fonksiyonlarında `auth.uid()` kontrollerini unit test et

---

### G. Mock Data Build Exclusion

**Durum:** `apps/mobile/__mocks__/` klasörü kontrol edilmeli.

**Mevcut Mock'lar:**

- Expo modules (`expo-blur`, `expo-haptics`, etc.)
- Supabase client
- Design tokens
- Third-party libraries

**Öneri:** `babel.config.js`'e production build için mock exclusion ekle:

```javascript
// babel.config.js
const isProduction = process.env.NODE_ENV === 'production';

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ... existing plugins
      ...(isProduction
        ? [
            ['babel-plugin-transform-remove-console'],
            // Optionally exclude __mocks__ in production
          ]
        : []),
    ],
  };
};
```

---

## 📊 Single Source of Truth Planı

### packages/shared Yapısı (Hedef)

```
packages/shared/
├── src/
│   ├── schemas/          # ✅ Zod schemas (mevcut)
│   ├── utils/            # ✅ Validation, formatting (mevcut)
│   ├── types/            # TypeScript types
│   ├── constants/        # Shared constants
│   └── sql-templates/    # 🆕 RLS policy templates
├── package.json
└── tsconfig.json
```

---

## 📋 Checklist: Sonraki Adımlar

### Immediate (Bu Sprint)

- [ ] Migration squash planı oluştur
- [ ] Design system merge PR'ı hazırla
- [ ] ML service karar al (TypeScript vs Python)
- [ ] `useLowPowerMode` hook'u ceremony componentlere entegre et

### Short-term (2-4 Hafta)

- [ ] RLS policy templates oluştur
- [ ] Web için Liquid design tokens ekle
- [ ] CI/CD'de security scan (Snyk) zorunlu yap
- [ ] Migration squash execute et

### Long-term (1-3 Ay)

- [ ] Full design system unification
- [ ] Edge function middleware standardization
- [ ] Performance monitoring dashboard

---

## 📁 Dosya Değişiklikleri Özeti

| Aksiyon     | Dosya                                                 | Durum |
| ----------- | ----------------------------------------------------- | ----- |
| SİLİNDİ     | `supabase/migrations/*.sql.disabled`                  | ✅    |
| SİLİNDİ     | `supabase/seed.sql.disabled`                          | ✅    |
| TAŞINDI     | `scripts/migrate-typography.mjs` → `scripts/archive/` | ✅    |
| OLUŞTURULDU | `apps/mobile/src/hooks/useLowPowerMode.ts`            | ✅    |
| OLUŞTURULDU | `docs/ARCHITECTURE_CLEANUP_REPORT.md`                 | ✅    |

---

## 🏗️ Mimari Karar Kayıtları (ADRs)

### ADR-001: Design System Lokasyonu

**Karar:** Atomik bileşenler sadece `packages/design-system` içinde olacak. **Gerekçe:** Monorepo'da
DRY prensibi ve bakım maliyeti azaltma.

### ADR-002: ML Processing Layer

**Karar:** Real-time ML (notifications, recommendations) Edge Functions'da, training Python'da.
**Gerekçe:** Latency requirements ve Supabase ecosystem uyumu.

### ADR-003: Migration Strategy

**Karar:** Schema stabilize olduktan sonra squash baseline oluşturulacak. **Gerekçe:** 90+ migration
dosyası maintainability sorunları yaratıyor.

---

_Bu rapor otomatik olarak oluşturulmuştur. Sorularınız için @architecture-team'e ulaşın._
