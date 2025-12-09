# 🗺️ TravelMatch Monorepo Haritası

## 📊 Görsel Yapı Şeması

```
🏢 travelmatch/
│
├── 📱 apps/                                    Son Kullanıcı Uygulamaları
│   │
│   ├── 📲 mobile/                              React Native + Expo
│   │   ├── src/                                Mobil uygulama kaynak kodu
│   │   │   ├── screens/                        Ekranlar (Home, Profile, Match)
│   │   │   ├── components/                     UI bileşenleri
│   │   │   ├── hooks/                          Custom React hooks
│   │   │   ├── navigation/                     React Navigation
│   │   │   └── utils/                          Yardımcı fonksiyonlar
│   │   ├── assets/                             🆕 Mobil'e özel görseller
│   │   │   ├── icon.png                        Uygulama ikonu
│   │   │   ├── splash-icon.png                 Başlangıç ekranı
│   │   │   ├── adaptive-icon.png               Android adaptive icon
│   │   │   └── fonts/                          Özel fontlar
│   │   └── package.json                        Expo + RN bağımlılıkları
│   │
│   ├── 👨‍💼 admin/                                React + Vite Admin Panel
│   │   ├── src/                                Admin panel kaynak kodu
│   │   │   ├── pages/                          Admin sayfaları
│   │   │   ├── components/                     Admin bileşenleri
│   │   │   └── authProvider.ts                 Supabase auth
│   │   └── package.json                        React Admin + Vite
│   │
│   └── 🌐 web/                                  Next.js Landing Page
│       ├── app/                                App Router (Next.js 14+)
│       │   ├── page.tsx                        Ana sayfa
│       │   ├── about/                          Hakkımızda
│       │   └── pricing/                        Fiyatlandırma
│       ├── public/                             Statik dosyalar
│       └── package.json                        Next.js + Tailwind
│
├── 📦 packages/                                Ortak Kod Kütüphaneleri
│   │
│   ├── 🔗 shared/                              Tüm projeler için ortak
│   │   ├── src/
│   │   │   ├── types/                          TypeScript tipleri
│   │   │   │   ├── user.ts                     User type'ları
│   │   │   │   ├── match.ts                    Match type'ları
│   │   │   │   └── location.ts                 Location type'ları
│   │   │   ├── validation/                     Zod şemaları
│   │   │   │   ├── auth.schema.ts              Login/Register validasyon
│   │   │   │   ├── profile.schema.ts           Profil validasyon
│   │   │   │   └── match.schema.ts             Match validasyon
│   │   │   └── utils/                          Ortak fonksiyonlar
│   │   │       ├── date.ts                     Tarih işlemleri
│   │   │       ├── string.ts                   String işlemleri
│   │   │       └── location.ts                 Konum hesaplamaları
│   │   └── package.json                        Zod + TS
│   │
│   ├── 🎨 design-system/                       UI Bileşen Kütüphanesi
│   │   ├── src/
│   │   │   ├── components/                     Ortak bileşenler
│   │   │   │   ├── Button.tsx                  Buton bileşeni
│   │   │   │   ├── Input.tsx                   Input bileşeni
│   │   │   │   ├── Card.tsx                    Kart bileşeni
│   │   │   │   └── Modal.tsx                   Modal bileşeni
│   │   │   └── tokens/                         Design tokens
│   │   │       ├── colors.ts                   Renk paleti
│   │   │       ├── spacing.ts                  Boşluklar
│   │   │       └── typography.ts               Tipografi
│   │   └── package.json                        React Native + Web
│   │
│   └── 🔌 api/                                 API Tip Tanımları
│       ├── src/
│       │   ├── types/                          Edge Function tipleri
│       │   └── clients/                        API istemcileri
│       └── package.json
│
├── 🔧 services/                                Backend Servisleri
│   │
│   ├── ⚙️ job-queue/                            Arkaplan İşleri
│   │   ├── src/
│   │   │   ├── jobs/                           Job tanımları
│   │   │   │   ├── match-notification.ts       Eşleşme bildirimi
│   │   │   │   ├── location-verify.ts          Konum doğrulama
│   │   │   │   └── image-process.ts            Resim işleme
│   │   │   └── worker.ts                       Bull MQ worker
│   │   └── package.json                        Bull MQ + Redis
│   │
│   ├── 💳 payment/                              Ödeme Servisi
│   │   ├── src/
│   │   │   ├── stripe/                         Stripe entegrasyonu
│   │   │   └── webhooks/                       Ödeme webhook'ları
│   │   └── package.json                        Stripe SDK
│   │
│   └── 🤖 ml-service/                           Python ML Servisi (Devre Dışı)
│       ├── src/
│       │   ├── models/                         ML modelleri
│       │   └── api/                            FastAPI endpoints
│       └── requirements.txt                    Python bağımlılıkları
│
├── 🗄️ supabase/                                Veritabanı & Edge Functions
│   │
│   ├── migrations/                             SQL Migration'lar
│   │   ├── 20231101_create_users.sql
│   │   ├── 20231102_create_matches.sql
│   │   ├── 20231103_create_locations.sql
│   │   └── 20231104_add_rls_policies.sql
│   │
│   └── functions/                              Edge Functions (Deno)
│       ├── match-algorithm/                    Eşleşme algoritması
│       ├── image-verification/                 Resim doğrulama
│       └── notification-send/                  Bildirim gönderimi
│
├── 🛠️ scripts/                                 Geliştirme Araçları
│   ├── bin/
│   │   └── tm.mjs                              CLI tool (travelmatch komutları)
│   ├── seed-database.ts                        Test verisi oluşturma
│   └── migrate.ts                              Migration çalıştırma
│
├── 🧪 tests/                                   Global Testler
│   ├── e2e/                                    Uçtan Uca Testler
│   │   ├── mobile/                             Maestro testleri
│   │   └── web/                                Playwright testleri
│   └── load/                                   Yük Testleri
│       └── k6/                                 K6 load test scriptleri
│
├── 🐳 docker/                                  Docker Yapılandırmaları
│   ├── kong.yml                                Kong API Gateway config
│   ├── grafana/                                Monitoring config
│   └── localstack/                             AWS local test
│
├── 📖 docs/                                    Dokümantasyon
│   ├── CLEAN_MONOREPO_STRUCTURE.md             🆕 Bu yapının detaylı anlatımı
│   ├── DEPLOYMENT_GUIDE.md                     Deployment kılavuzu
│   ├── DEVELOPER_ONBOARDING.md                 Yeni geliştirici rehberi
│   └── API_REFERENCE.md                        API dokümantasyonu
│
├── 🔐 .env.development                         🆕 Local ortam
├── 🔐 .env.staging                             🆕 Test ortamı
├── 🔐 .env.production.example                  🆕 Production şablonu
├── 🐳 docker-compose.yml                       Local Supabase ortamı
├── 📦 pnpm-workspace.yaml                      Monorepo tanımı
├── ⚡ turbo.json                               Build pipeline
└── 📄 package.json                             Root bağımlılıklar

```

---

## 🔄 Veri Akışı

```
┌─────────────────────────────────────────────────────────────┐
│                    KULLANICI KATMANI                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📱 Mobile App    👨‍💼 Admin Panel    🌐 Landing Page         │
│  (React Native)   (React + Vite)    (Next.js)              │
│                                                             │
└──────────────┬──────────────┬──────────────┬───────────────┘
               │              │              │
               │              │              │
               ▼              ▼              ▼
       ┌───────────────────────────────────────────┐
       │         ORTAK PAKETLER (packages/)        │
       ├───────────────────────────────────────────┤
       │  🔗 shared/     🎨 design-system/        │
       │  (Types, Utils)  (UI Components)          │
       └───────────────┬───────────────────────────┘
                       │
                       ▼
       ┌───────────────────────────────────────────┐
       │          SUPABASE (supabase/)             │
       ├───────────────────────────────────────────┤
       │  🗄️ PostgreSQL Database                   │
       │  🔌 Edge Functions (Deno)                 │
       │  🔐 Row Level Security (RLS)              │
       └───────────────┬───────────────────────────┘
                       │
                       ▼
       ┌───────────────────────────────────────────┐
       │        BACKEND SERVİSLER (services/)      │
       ├───────────────────────────────────────────┤
       │  ⚙️ Job Queue      💳 Payment             │
       │  (Bull MQ)        (Stripe)                │
       │  🤖 ML Service (Python - Opsiyonel)       │
       └───────────────────────────────────────────┘
```

---

## 🌍 Ortam Dağılımı

```
┌──────────────────────────────────────────────────────────────┐
│                      DEVELOPMENT (Local)                     │
├──────────────────────────────────────────────────────────────┤
│  🐳 Docker Containers:                                       │
│     • Supabase (PostgreSQL + Auth + Storage)                │
│     • Redis (Job Queue)                                     │
│     • LocalStack (AWS Services)                             │
│                                                              │
│  📱 Apps:                                                    │
│     • Mobile: Expo Go / Emulator                            │
│     • Admin: localhost:3000                                 │
│     • Web: localhost:3001                                   │
│                                                              │
│  ✅ Avantaj: Tam izolasyon, sınırsız deneme                 │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      STAGING (Test)                          │
├──────────────────────────────────────────────────────────────┤
│  ☁️ Supabase Cloud: travelmatch-staging                     │
│  📱 Apps:                                                    │
│     • Mobile: EAS Preview Build (TestFlight / Internal)     │
│     • Admin: staging-admin.travelmatch.app                  │
│     • Web: staging.travelmatch.app                          │
│                                                              │
│  🔄 Deployment: develop branch → GitHub Actions             │
│  ⚠️ Amacı: QA, Beta test, özellik onayı                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    PRODUCTION (Canlı)                        │
├──────────────────────────────────────────────────────────────┤
│  ☁️ Supabase Cloud: travelmatch-prod                        │
│  📱 Apps:                                                    │
│     • Mobile: App Store + Google Play                       │
│     • Admin: admin.travelmatch.app                          │
│     • Web: travelmatch.app                                  │
│                                                              │
│  🔄 Deployment: main branch → GitHub Actions                │
│  🔴 Kritik: Gerçek kullanıcı verisi                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Paket Bağımlılık İlişkileri

```
                    ┌─────────────────┐
                    │  @travelmatch   │
                    │    /shared      │
                    │                 │
                    │ • Types         │
                    │ • Validation    │
                    │ • Utils         │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
         ┌──────────┐ ┌──────────┐ ┌──────────┐
         │  mobile  │ │  admin   │ │   web    │
         └──────────┘ └──────────┘ └──────────┘
                │            │
                │            │
                ▼            ▼
         ┌─────────────────────┐
         │  @travelmatch       │
         │  /design-system     │
         │                     │
         │ • Button            │
         │ • Input             │
         │ • Card              │
         └─────────────────────┘
```

**Açıklama:**
- `shared` → Her yerden kullanılır (en temel paket)
- `design-system` → Mobile ve Admin'de kullanılır
- `web` → Sadece `shared`'i kullanır (Tailwind ile kendi UI'ı var)

---

## 📦 Komut Akışı (Turbo Pipeline)

```bash
$ pnpm dev
    │
    ├─→ packages/shared:build          ⚡ 1. Önce ortak paketler
    ├─→ packages/design-system:build   ⚡
    │
    └─→ Paralel Çalıştır:
         ├─→ apps/mobile:dev           📱 Expo
         ├─→ apps/admin:dev            👨‍💼 Vite
         └─→ apps/web:dev              🌐 Next.js
```

**Turbo Cache Avantajı:**
- Değişmeyen paketler yeniden build edilmez
- İlk build: ~60 saniye
- Cache ile: ~5 saniye ⚡

---

## 🔗 Faydalı Linkler

- 📘 [Monorepo Detaylı Dokümantasyon](./CLEAN_MONOREPO_STRUCTURE.md)
- 📋 [Reorganizasyon Özeti](./MONOREPO_CLEANUP_SUMMARY.md)
- 🚀 [Deployment Kılavuzu](./docs/DEPLOYMENT_GUIDE.md)
- 🎓 [Yeni Geliştirici Rehberi](./docs/DEVELOPER_ONBOARDING.md)

---

**Son Güncelleme:** 9 Aralık 2025  
**Versiyon:** 1.0  
**Durum:** ✅ Aktif ve Kullanıma Hazır
