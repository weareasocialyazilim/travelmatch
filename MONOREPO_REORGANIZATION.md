# 🎯 TravelMatch - Monorepo Reorganization (Completed)

## 📁 Yeni Klasör Yapısı

Projeniz artık endüstri standardı monorepo yapısına uygun hale getirildi:

```
travelmatch/
├── apps/                    # 🎨 SON KULLANICI UYGULAMALARI
│   ├── mobile/              # ✅ React Native (Expo)
│   ├── admin/               # ✅ React + Vite (Root'tan taşındı)
│   └── web/                 # ✅ Next.js Landing Page (YENİ)
│
├── packages/                # 📦 ORTAK KOD KÜTÜPHANELERİ
│   ├── shared/              # ✅ Types, Validation, Utils
│   ├── design-system/       # ✅ UI Components
│   └── monitoring/          # ✅ Datadog RUM (Root src/'den taşındı)
│
├── services/                # ⚙️ BACKEND SERVİSLERİ
│   ├── job-queue/           # ✅ Arkaplan İşleri
│   ├── payment/             # ✅ Ödeme Servisi
│   └── ml-service/          # 🔕 Şu an devre dışı
│
├── supabase/                # 💾 VERİTABANI
│   ├── migrations/          # SQL Şemaları
│   └── functions/           # Edge Functions
│
├── scripts/                 # 🛠️ GELIŞTIRME SCRIPTLERI
│   └── bin/                 # ✅ CLI araçları (Root bin/'den taşındı)
│
├── assets/                  # 🎨 EXPO ASSET'LERİ (Root'ta kalmalı)
├── docker-compose.yml       # 🐳 Local ortam
└── turbo.json               # ⚡ Build pipeline
```

## ✅ Yapılan Değişiklikler

### 1. 📦 Admin Panel Taşındı
- **Önce:** `admin/` (root dizinde)
- **Şimdi:** `apps/admin/`
- **Neden:** Tüm kullanıcı uygulamaları `apps/` altında tutulmalı

### 2. 🗂️ Monitoring Paketi Oluşturuldu
- **Önce:** `src/hooks/`, `src/services/`, `src/examples/` (root dizinde)
- **Şimdi:** `packages/monitoring/`
- **Neden:** Root'ta `src` klasörü olmamalı, ortak kodlar `packages/` altında olmalı

### 3. 🌐 Web Landing Page Eklendi
- **Yeni:** `apps/web/` - Next.js 16 ile SEO-optimized landing page
- **Özellikler:**
  - TypeScript
  - Tailwind CSS v4
  - Turbopack
  - `@travelmatch/shared` paketi entegrasyonu

### 4. 🔧 Scripts Klasörü Düzenlendi
- **Önce:** `bin/tm.mjs` (root dizinde)
- **Şimdi:** `scripts/bin/tm.mjs`
- **Neden:** CLI araçları `scripts/` altında organize edilmeli

### 5. 🤖 ML Service Devre Dışı Bırakıldı
- `docker-compose.yml` içinde yorum satırına alındı
- **Neden:** V1.0 için gerekli değil, kaynak tüketimini önler
- **Nasıl Aktif Edilir:** Dosyadaki `#` işaretlerini kaldırın

## 🚀 Çalıştırma Komutları

### Tüm Projeyi Başlat
```bash
# Dependencies yükle
pnpm install

# Docker servislerini başlat (Supabase local)
docker-compose up -d

# Tüm uygulamaları paralel çalıştır
pnpm dev
```

### Sadece Mobil
```bash
pnpm --filter @travelmatch/mobile dev
```

### Sadece Admin
```bash
pnpm --filter @travelmatch/admin dev
```

### Sadece Web (Landing Page)
```bash
pnpm --filter @travelmatch/web dev
```

## 🔐 Ortam Yönetimi

### Local (Geliştirme)
- Veritabanı: Docker PostgreSQL
- Config: `.env.development`
- Supabase URL: `http://localhost:54321`

### Staging (Test)
- Veritabanı: Supabase Cloud (`travelmatch-staging`)
- Config: `.env.staging`
- EAS Profile: `preview`

### Production (Canlı)
- Veritabanı: Supabase Cloud (`travelmatch-prod`)
- Config: `.env.production`
- EAS Profile: `production`

## 📝 Önemli Notlar

### ✅ Doğru Olan
- `assets/` klasörü root'ta kalmalı (Expo config'i buraya bakıyor)
- `pnpm-workspace.yaml` zaten doğru yapılandırılmış
- Turborepo pipeline `turbo.json`'da güncel

### ⚠️ Import Değişiklikleri

Eğer mobil uygulamada monitoring kullanıyorsanız, import'ları güncelleyin:

**Önce:**
```typescript
import { monitoringService } from '../../../src/services/monitoring';
import { useScreenTracking } from '../../../src/hooks/useMonitoring';
```

**Şimdi:**
```typescript
import { monitoringService } from '@travelmatch/monitoring/service';
import { useScreenTracking } from '@travelmatch/monitoring/hooks';
```

## 🎯 Sıradaki Adımlar

1. **Supabase Cloud Projeleri Oluştur:**
   - `travelmatch-staging` (Test ortamı)
   - `travelmatch-prod` (Canlı ortam)

2. **Environment Dosyalarını Yapılandır:**
   - `.env.development` (Local)
   - `.env.staging` (Staging)
   - `.env.production` (Production)

3. **GitHub Actions CI/CD Kur:**
   - `.github/workflows/deploy-staging.yml`
   - `.github/workflows/deploy-production.yml`

4. **Mobil App Import'ları Güncelle:**
   - Monitoring kullanımlarını yeni paket yapısına uyarla
   - `@travelmatch/monitoring` ekle package.json'a

## 📚 Dokümantasyon

- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [Developer Onboarding](./docs/DEVELOPER_ONBOARDING.md)
- [Getting Started](./docs/GETTING_STARTED.md)

---

**✨ Tebrikler!** Projeniz artık Netflix, Uber, Airbnb gibi şirketlerin kullandığı monorepo yapısına sahip.
