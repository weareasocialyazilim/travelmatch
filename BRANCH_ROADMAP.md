# TravelMatch Branch Merge Roadmap - Güncellenmiş

**Tarih:** 2025-12-22
**Analiz Edilen Branch Sayısı:** 18
**Durum:** Hiçbiri henüz main'e merge edilmedi

---

## Özet Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         18 BRANCH ANALİZ ÖZETİ                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  🔴 Kritik (Bug Fix)      │  1 branch   │  debugger-session                │
│  🔒 Güvenlik              │  2 branch   │  api-security, owasp             │
│  ⚡ Performans            │  2 branch   │  react-perf, supabase-realtime   │
│  🧪 Test                  │  2 branch   │  test-automation, generate-test  │
│  🔧 Code Quality          │  1 branch   │  refactor-code-quality           │
│  🗄️  Database             │  2 branch   │  postgres-schema, db-architect   │
│  🎨 UI/UX Tools           │  2 branch   │  ui-design, ux-research          │
│  📚 Dokümantasyon         │  5 branch   │  architecture, docs, reports     │
│  🎭 Diğer                 │  1 branch   │  algorithmic-art                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ⚠️  ÇAKIŞMA SAYISI: 11 dosya, 7 branch grubu arasında                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tüm Branch'lerin Özeti

| # | Branch | Kategori | Açıklama | Dosya | Risk |
|---|--------|----------|----------|-------|------|
| 1 | `setup-debugger-session-go0zT` | 🔴 Bug Fix | TypeScript compilation hataları | 10 | Düşük |
| 2 | `api-security-audit-cEmbI` | 🔒 Security | API güvenlik açıkları (OWASP) | 10 | Orta |
| 3 | `security-audit-owasp-Fod9p` | 🔒 Security | OWASP compliance düzeltmeleri | 8 | Orta |
| 4 | `optimize-react-performance-CGcu3` | ⚡ Perf | React memoization | 6 | Orta |
| 5 | `optimize-supabase-realtime-j1BOO` | ⚡ Perf | Supabase realtime optimize | 5 | Orta |
| 6 | `test-automation-setup-KnWmC` | 🧪 Test | Jest, Playwright, CI | 34 | Düşük |
| 7 | `generate-test-suite-HHP8p` | 🧪 Test | Unit test suite | 13 | Düşük |
| 8 | `refactor-code-quality-vOrxf` | 🔧 Quality | TypeScript düzeltmeleri | 14 | Düşük |
| 9 | `postgres-schema-design-lYSj1` | 🗄️ DB | PostgreSQL schema best practices | 2 | Düşük |
| 10 | `database-architect-setup-vPpId` | 📚 Docs | DB architecture docs | 3 | Yok |
| 11 | `architecture-documentation-mLfcb` | 📚 Docs | C4 model, ADR'ler | 11 | Yok |
| 12 | `code-reviewer-tool-ZoGn0` | 📚 Docs | Code review raporu | 1 | Yok |
| 13 | `compliance-specialist-tool-UViVR` | 📚 Docs | Compliance değerlendirmesi | 2 | Yok |
| 14 | `setup-pentest-specialist-NYqwG` | 📚 Docs | Penetration test raporu | 1 | Yok |
| 15 | `update-project-docs-JqWGn` | 📚 Docs | README güncellemeleri | 5 | Yok |
| 16 | `ui-design-system-toolkit-zJx0g` | 🎨 Tools | Design system Python scripts | 5 | Yok |
| 17 | `ux-research-design-toolkit-eVD3U` | 🎨 Tools | UX research Python scripts | 7 | Yok |
| 18 | `algorithmic-art-p5js-X9xy5` | 🎭 Other | p5.js sanat generatörü | 2 | Yok |

---

## Kritik Çakışma Matrisi

```
                          ┌─────────────────────────────────────────────────────────┐
                          │                 DOSYA ÇAKIŞMALARI                       │
                          └─────────────────────────────────────────────────────────┘

┌──────────────────────────┬──────────────────────────┬──────────────────────────────┐
│     BRANCH GRUBU 1       │         DOSYALAR         │      BRANCH GRUBU 2          │
├──────────────────────────┼──────────────────────────┼──────────────────────────────┤
│ api-security-audit       │ next.config.js           │ security-audit-owasp         │
│                          │ admin-users/route.ts     │                              │
│                          │ users/route.ts           │                              │
│                          │ SECURITY_AUDIT_REPORT.md │                              │
├──────────────────────────┼──────────────────────────┼──────────────────────────────┤
│ api-security-audit       │ tasks/route.ts           │ setup-debugger-session       │
├──────────────────────────┼──────────────────────────┼──────────────────────────────┤
│ security-audit-owasp     │ auth/login/route.ts      │ setup-debugger-session       │
├──────────────────────────┼──────────────────────────┼──────────────────────────────┤
│ react-performance        │ RealtimeContext.tsx      │ supabase-realtime            │
├──────────────────────────┼──────────────────────────┼──────────────────────────────┤
│ test-automation          │ jest.config.js           │ generate-test-suite          │
│                          │ jest.setup.js            │                              │
│                          │ package.json             │                              │
├──────────────────────────┼──────────────────────────┼──────────────────────────────┤
│ test-automation          │ package.json             │ setup-debugger-session       │
├──────────────────────────┼──────────────────────────┼──────────────────────────────┤
│ generate-test-suite      │ package.json             │ setup-debugger-session       │
│                          │ pnpm-lock.yaml           │                              │
└──────────────────────────┴──────────────────────────┴──────────────────────────────┘
```

---

## Merge Sırası (7 Fazlı Roadmap)

### FAZ 0: Bağımsız Dokümantasyon (Herhangi bir zamanda)
> **Risk:** YOK - Sadece yeni markdown dosyaları

Bu branch'ler hiçbir kod değişikliği içermiyor ve herhangi bir sırada merge edilebilir:

```
📚 architecture-documentation-mLfcb
   └── docs/architecture/ (11 dosya: C4 model, ADR'ler, security arch)

📚 database-architect-setup-vPpId
   └── docs/ (DATABASE_ARCHITECTURE.md, ERD.md, OPTIMIZATION_GUIDE.md)

📚 code-reviewer-tool-ZoGn0
   └── CODE_REVIEW_REPORT.md

📚 compliance-specialist-tool-UViVR
   └── docs/COMPLIANCE_*.md

📚 setup-pentest-specialist-NYqwG
   └── PENTEST_REPORT_2025-12-22.md

📚 update-project-docs-JqWGn
   └── README.md, apps/admin/README.md güncellemeleri

🎨 ui-design-system-toolkit-zJx0g
   └── packages/design-system/scripts/*.py (Python araçları)

🎨 ux-research-design-toolkit-eVD3U
   └── scripts/ux-research/*.py (Python araçları)

🎭 algorithmic-art-p5js-X9xy5
   └── algorithmic-art/ (p5.js sanat generatörü)
```

**Merge Komutları (Sırasız):**
```bash
git checkout main
git merge origin/claude/architecture-documentation-mLfcb
git merge origin/claude/database-architect-setup-vPpId
git merge origin/claude/code-reviewer-tool-ZoGn0
git merge origin/claude/compliance-specialist-tool-UViVR
git merge origin/claude/setup-pentest-specialist-NYqwG
git merge origin/claude/update-project-docs-JqWGn
git merge origin/claude/ui-design-system-toolkit-zJx0g
git merge origin/claude/ux-research-design-toolkit-eVD3U
git merge origin/claude/algorithmic-art-p5js-X9xy5
```

---

### FAZ 1: Kritik Bug Fix (Öncelik: YÜKSEK)
> **Amaç:** Build hatalarını çöz, sistemi derlenebilir hale getir

```
🔴 setup-debugger-session-go0zT
   ├── apps/admin/src/lib/auth.ts          - Auth düzeltmeleri
   ├── apps/admin/src/lib/index.ts         - Export düzeltmeleri
   ├── apps/admin/tsconfig.json            - TypeScript config
   ├── apps/admin/src/app/api/auth/*.ts    - API route düzeltmeleri
   └── pnpm-lock.yaml                      - Dependency güncellemesi
```

**Merge Komutu:**
```bash
git checkout main
git merge origin/claude/setup-debugger-session-go0zT

# Doğrulama
pnpm install
pnpm build
```

**Dikkat:** Bu branch `pnpm-lock.yaml` içeriyor. Diğer branch'lerle çakışabilir!

---

### FAZ 2: Güvenlik Düzeltmeleri (Öncelik: YÜKSEK)
> **Amaç:** Kritik güvenlik açıklarını kapat

```
🔒 api-security-audit-cEmbI
   ├── apps/admin/src/lib/query-utils.ts   - SQL injection koruması (YENİ)
   ├── services/job-queue/src/index.ts     - Rate limiting
   ├── apps/admin/next.config.js           - Security headers
   ├── apps/admin/nginx.conf               - Nginx security
   └── API route validasyonları

                    ⬇️ ÇAKIŞMA ÇÖZÜMÜ GEREKLİ ⬇️

🔒 security-audit-owasp-Fod9p
   ├── apps/admin/src/lib/security.ts      - Security middleware (YENİ)
   ├── apps/admin/next.config.js           - ⚠️ ÇAKIŞMA
   ├── apps/web/next.config.ts             - Web security config
   └── API route auth düzeltmeleri         - ⚠️ ÇAKIŞMA
```

**Merge Stratejisi:**
```bash
# 1. Önce api-security-audit merge et
git checkout main
git merge origin/claude/api-security-audit-cEmbI

# 2. security-audit-owasp merge et (conflict olacak!)
git merge origin/claude/security-audit-owasp-Fod9p

# 3. Conflict resolution için bu dosyaları manuel birleştir:
#    - apps/admin/next.config.js → Her iki branch'in security header'larını al
#    - apps/admin/src/app/api/admin-users/route.ts → Validation'ları birleştir
#    - apps/admin/src/app/api/users/route.ts → Validation'ları birleştir
#    - SECURITY_AUDIT_REPORT.md → İki raporu birleştir

# 4. Conflict çözümü sonrası
git add .
git commit -m "chore: merge security branches with conflict resolution"

# 5. Doğrulama
pnpm build
pnpm test
```

---

### FAZ 3: Performance Optimizasyonları (Öncelik: ORTA)
> **Amaç:** Mobile app performansını iyileştir

```
⚡ optimize-react-performance-CGcu3
   ├── apps/mobile/src/utils/performanceOptimization.ts (YENİ)
   ├── apps/mobile/src/context/AuthContext.tsx
   ├── apps/mobile/src/context/I18nContext.tsx
   ├── apps/mobile/src/context/RealtimeContext.tsx      ⚠️ ÇAKIŞMA
   ├── apps/mobile/src/context/ToastContext.tsx
   └── apps/mobile/src/features/trips/screens/DiscoverScreen.tsx

                    ⬇️ ÇAKIŞMA ÇÖZÜMÜ GEREKLİ ⬇️

⚡ optimize-supabase-realtime-j1BOO
   ├── apps/mobile/src/services/realtimeChannelManager.ts (YENİ)
   ├── apps/mobile/src/context/RealtimeContext.tsx      ⚠️ ÇAKIŞMA
   ├── apps/mobile/src/hooks/useMessages.ts
   ├── apps/mobile/src/config/supabase.ts
   └── apps/mobile/src/services/subscriptionService.ts
```

**Merge Stratejisi:**
```bash
# 1. Önce react-performance merge et
git checkout main
git merge origin/claude/optimize-react-performance-CGcu3

# 2. supabase-realtime merge et (conflict olacak!)
git merge origin/claude/optimize-supabase-realtime-j1BOO

# 3. RealtimeContext.tsx için conflict resolution:
#    - react-performance'dan: useMemo, useCallback wrappers
#    - supabase-realtime'dan: Channel manager integration
#    Her iki optimizasyonu da koruyarak birleştir!

git add .
git commit -m "chore: merge performance branches with conflict resolution"

# 4. Mobile app test
cd apps/mobile && npx expo start
```

---

### FAZ 4: Test Altyapısı (Öncelik: ORTA)
> **Amaç:** Test coverage ve CI/CD pipeline kurulumu

```
🧪 test-automation-setup-KnWmC
   ├── packages/test-utils/                - Test utilities package (YENİ)
   ├── apps/admin/jest.config.js           ⚠️ ÇAKIŞMA
   ├── apps/admin/jest.setup.js            ⚠️ ÇAKIŞMA
   ├── apps/web/jest.config.js
   ├── tests/e2e-playwright/               - E2E tests (YENİ)
   ├── playwright.config.ts
   └── .github/workflows/ci.yml            - CI workflow

                    ⬇️ ÇAKIŞMA ÇÖZÜMÜ GEREKLİ ⬇️

🧪 generate-test-suite-HHP8p
   ├── apps/admin/jest.config.js           ⚠️ ÇAKIŞMA
   ├── apps/admin/jest.setup.js            ⚠️ ÇAKIŞMA
   ├── apps/admin/src/lib/__tests__/       - Unit tests (YENİ)
   ├── packages/shared/src/__tests__/      - Shared tests (YENİ)
   └── pnpm-lock.yaml                      ⚠️ ÇAKIŞMA (debugger ile)
```

**Merge Stratejisi:**
```bash
# 1. Önce test-automation merge et (altyapı)
git checkout main
git merge origin/claude/test-automation-setup-KnWmC

# 2. generate-test-suite merge et (test cases)
git merge origin/claude/generate-test-suite-HHP8p

# 3. Conflict resolution:
#    - jest.config.js → İki config'i birleştir
#    - jest.setup.js → Mock'ları birleştir
#    - pnpm-lock.yaml → pnpm install ile yeniden oluştur

git add .
git commit -m "chore: merge test branches with conflict resolution"

# 4. Testleri çalıştır
pnpm test
```

---

### FAZ 5: Code Quality (Öncelik: DÜŞÜK)
> **Amaç:** TypeScript ve kod kalitesi düzeltmeleri

```
🔧 refactor-code-quality-vOrxf
   ├── apps/mobile/src/components/*.tsx    - Component fixes
   ├── tests/performance/benchmarks.test.tsx
   └── Dosya uzantısı düzeltmeleri (.mjs → .mts)
```

**Merge Komutu:**
```bash
git checkout main
git merge origin/claude/refactor-code-quality-vOrxf

# Doğrulama
pnpm build
pnpm typecheck
```

---

### FAZ 6: Database Schema (Öncelik: DÜŞÜK)
> **Amaç:** PostgreSQL schema best practices

```
🗄️ postgres-schema-design-lYSj1
   ├── docs/DATABASE_SCHEMA.md
   └── supabase/migrations/20251222000000_schema_best_practices.sql
```

**Merge Komutu:**
```bash
git checkout main
git merge origin/claude/postgres-schema-design-lYSj1

# Migration uygula (staging'de test et!)
supabase db push
```

**Dikkat:** Migration dosyası production'a uygulanmadan önce staging'de test edilmeli!

---

## Görsel Dependency Graph

```
                                    ┌─────────────────┐
                                    │      MAIN       │
                                    └────────┬────────┘
                                             │
        ┌────────────────────────────────────┼────────────────────────────────────┐
        │                                    │                                    │
        ▼                                    │                                    ▼
┌───────────────────┐                        │               ┌─────────────────────────────────┐
│     FAZ 0         │                        │               │           FAZ 0                 │
│  (Docs - Serbest) │                        │               │      (Tools - Serbest)          │
├───────────────────┤                        │               ├─────────────────────────────────┤
│ architecture-docs │                        │               │ ui-design-system-toolkit        │
│ database-architect│                        │               │ ux-research-design-toolkit      │
│ code-reviewer     │                        │               │ algorithmic-art-p5js            │
│ compliance        │                        │               └─────────────────────────────────┘
│ pentest-report    │                        │
│ update-project    │                        │
└───────────────────┘                        │
                                             ▼
                              ┌──────────────────────────────┐
                              │           FAZ 1              │
                              │    🔴 setup-debugger-session │
                              │      (Build Fix - KRİTİK)    │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │           FAZ 2              │
                              │      🔒 SECURITY             │
                              ├──────────────────────────────┤
                              │  api-security-audit          │
                              │         ↓ CONFLICT           │
                              │  security-audit-owasp        │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │           FAZ 3              │
                              │      ⚡ PERFORMANCE          │
                              ├──────────────────────────────┤
                              │  optimize-react-performance  │
                              │         ↓ CONFLICT           │
                              │  optimize-supabase-realtime  │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │           FAZ 4              │
                              │      🧪 TESTING              │
                              ├──────────────────────────────┤
                              │  test-automation-setup       │
                              │         ↓ CONFLICT           │
                              │  generate-test-suite         │
                              └──────────────┬───────────────┘
                                             │
                         ┌───────────────────┴───────────────────┐
                         │                                       │
                         ▼                                       ▼
          ┌──────────────────────────┐           ┌──────────────────────────┐
          │         FAZ 5            │           │         FAZ 6            │
          │    🔧 CODE QUALITY       │           │    🗄️ DATABASE           │
          ├──────────────────────────┤           ├──────────────────────────┤
          │  refactor-code-quality   │           │  postgres-schema-design  │
          └──────────────────────────┘           └──────────────────────────┘
```

---

## Çakışma Çözüm Rehberi

### 1. `apps/admin/next.config.js` Birleştirme

```javascript
// api-security-audit'ten al:
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Content-Security-Policy', value: '...' },
];

// security-audit-owasp'tan al:
const additionalConfig = {
  poweredByHeader: false,
  // ... diğer config
};

// Birleştir
module.exports = {
  ...additionalConfig,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

### 2. `RealtimeContext.tsx` Birleştirme

```typescript
// react-performance'dan al:
const memoizedValue = useMemo(() => ({
  // context değerleri
}), [dependencies]);

const memoizedCallback = useCallback(() => {
  // callback
}, []);

// supabase-realtime'dan al:
import { realtimeChannelManager } from '../services/realtimeChannelManager';

// Birleştir: Memoization'ı koruyarak channel manager'ı entegre et
```

### 3. `jest.config.js` Birleştirme

```javascript
// test-automation'dan: Genel config yapısı
// generate-test-suite'dan: Test path'leri ve coverage thresholds
// Her ikisini de içerecek şekilde birleştir
```

---

## Kontrol Listesi

Her merge sonrası kontrol edilmesi gerekenler:

- [ ] `pnpm install` başarılı
- [ ] `pnpm build` başarılı
- [ ] `pnpm typecheck` hatasız
- [ ] `pnpm lint` hatasız
- [ ] `pnpm test` tüm testler geçiyor
- [ ] Mobile app başlatılabiliyor
- [ ] Admin panel başlatılabiliyor
- [ ] Web app başlatılabiliyor

---

## Risk Değerlendirmesi

| Faz | Risk | Açıklama |
|-----|------|----------|
| FAZ 0 | 🟢 YOK | Sadece docs/tools, kod yok |
| FAZ 1 | 🟡 DÜŞÜK | Bug fix, breaking change yok |
| FAZ 2 | 🔴 YÜKSEK | Security kritik, dikkatli test |
| FAZ 3 | 🟡 ORTA | Mobile context değişiklikleri |
| FAZ 4 | 🟡 DÜŞÜK | Test altyapısı, production etkilemez |
| FAZ 5 | 🟢 DÜŞÜK | Refactor, davranış değişmez |
| FAZ 6 | 🔴 YÜKSEK | DB migration, staging'de test! |

---

## Özet Aksiyon Planı

### Bugün Yapılabilir (Serbest, çakışma yok):
1. ✅ Tüm dokümantasyon branch'lerini merge et (9 branch)

### Bu Hafta:
2. 🔴 `setup-debugger-session` merge et (build fix)
3. 🔒 Security branch'lerini birleştir (conflict resolution)
4. ⚡ Performance branch'lerini birleştir (conflict resolution)

### Gelecek Hafta:
5. 🧪 Test branch'lerini birleştir
6. 🔧 Code quality merge et
7. 🗄️ DB migration'ı staging'de test et ve merge et

---

**Not:** Bu roadmap `BRANCH_ROADMAP.md` dosyasında saklanmıştır. Her merge sonrası bu dosyayı güncelleyin.
