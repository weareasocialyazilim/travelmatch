# 🎯 TravelMatch - Clean Monorepo Structure

## ✅ Reorganization Complete!

Proje yapınız artık endüstri standardı monorepo mimarisine uygun hale getirildi. Bu dokümanda yapılan değişiklikler ve kullanım kılavuzu bulunmaktadır.

---

## 📁 Nihai Klasör Yapısı

```
travelmatch/
├── apps/                           # SON KULLANICI UYGULAMALARI
│   ├── mobile/                     # ✅ React Native (Expo)
│   │   ├── src/                    # Mobil uygulama kodu
│   │   └── assets/                 # 🆕 Mobil uygulamaya özel görseller
│   ├── admin/                      # ✅ React Admin Panel (Vite)
│   │   └── src/                    # Admin panel kodu
│   └── web/                        # ✅ Next.js Landing Page
│       └── app/                    # Web sitesi kodu
│
├── packages/                       # ORTAK KOD KÜTÜPHANELERİ
│   ├── shared/                     # Ortak tipler, validation (Zod), utils
│   ├── design-system/              # Ortak UI bileşenleri (Button, Input vb.)
│   └── api/                        # API tip tanımlamaları
│
├── services/                       # BACKEND SERVİSLERİ
│   ├── job-queue/                  # Arkaplan işleri (Bull MQ)
│   ├── payment/                    # Ödeme servisi
│   └── ml-service/                 # 🔇 Python ML servisi (Devre dışı)
│
├── supabase/                       # VERİTABANI & EDGE FUNCTIONS
│   ├── migrations/                 # SQL migration dosyaları
│   └── functions/                  # Edge Functions
│
├── scripts/                        # GELİŞTİRME ARAÇLARI
│   └── bin/                        # CLI araçları (tm.mjs)
│
├── tests/                          # GLOBAL TESTLER
│   ├── e2e/                        # Uçtan uca testler
│   └── load/                       # Yük testleri
│
├── .env.development                # 🆕 Local geliştirme ortamı
├── .env.staging                    # 🆕 Test ortamı
├── .env.production.example         # 🆕 Production ortamı (şablon)
├── docker-compose.yml              # Local Supabase ortamı
├── pnpm-workspace.yaml             # Monorepo yapılandırması
└── turbo.json                      # Build pipeline ayarları
```

---

## 🔄 Yapılan Değişiklikler

### 1. ✅ Assets Klasörü Taşındı
- **Öncesi:** `assets/` (kök dizinde)
- **Sonrası:** `apps/mobile/assets/`
- **Neden:** Bu dosyalar sadece Expo mobile uygulaması tarafından kullanılıyor
- **Etkilenen Dosya:** `app.config.ts` (asset path'leri güncellendi)

### 2. ✅ Admin Paneli Zaten Doğru Yerde
- `apps/admin/` konumu doğru ✅
- Herhangi bir taşıma işlemi gerekmedi

### 3. ✅ Web Projesi Zaten Mevcut
- `apps/web/` Next.js projesi zaten kurulu ✅
- `@travelmatch/shared` paketi ile entegre

### 4. ✅ ML Service Devre Dışı
- `docker-compose.yml` içinde zaten yorum satırında ✅
- İhtiyaç duyulduğunda `#` işaretleri kaldırılarak aktif edilebilir

### 5. 🆕 Environment Dosyaları Oluşturuldu
- `.env.development` → Local Docker ortamı için
- `.env.staging` → Test/Staging ortamı için
- `.env.production.example` → Production ortamı şablonu

---

## 🚀 Nasıl Kullanılır?

### Local Geliştirme (Development)

```bash
# 1. Environment dosyasını aktifleştir
cp .env.development .env

# 2. Supabase'i Docker ile başlat
docker-compose up -d

# 3. Tüm projeleri çalıştır
pnpm dev

# VEYA sadece bir projeyi çalıştır:
pnpm --filter @travelmatch/mobile dev      # Mobil
pnpm --filter @travelmatch/admin dev       # Admin
pnpm --filter @travelmatch/web dev         # Web
```

**Önemli:** Local ortamda her şey `http://localhost:8000` üzerinden Supabase'e bağlanır (Docker).

---

### Staging (Test) Ortamı

1. **Supabase Cloud'da yeni proje oluştur:**
   - Proje adı: `travelmatch-staging`
   - URL: `https://[staging-ref].supabase.co`

2. **Environment dosyasını düzenle:**
   ```bash
   cp .env.staging .env
   # Değerleri Supabase Dashboard'dan al ve .env'e yapıştır
   ```

3. **Mobil uygulamayı staging ile yayınla:**
   ```bash
   # EAS kullanarak preview build oluştur
   eas build --profile preview --platform ios
   ```

---

### Production (Canlı) Ortamı

1. **Supabase Cloud'da production projesi oluştur:**
   - Proje adı: `travelmatch-prod`
   - URL: `https://[prod-ref].supabase.co`

2. **GitHub Secrets'a ekle:**
   - Repository → Settings → Secrets and variables → Actions
   - Her değişken için `PROD_` prefix'i kullan:
     - `PROD_SUPABASE_URL`
     - `PROD_SUPABASE_ANON_KEY`
     - `PROD_SUPABASE_SERVICE_KEY`

3. **Sadece `main` branch'e push yapıldığında otomatik deploy:**
   ```bash
   git checkout main
   git merge develop
   git push origin main  # Bu otomatik olarak production'a yükler
   ```

---

## 🔐 Güvenlik Stratejisi

### 3 Ortam Ayrımı

| Ortam | Veritabanı | Kullanım | Risk Seviyesi |
|-------|-----------|----------|---------------|
| **Local** | Docker Postgres | Geliştirme, deneme | ✅ Sıfır (Sahte veri) |
| **Staging** | Supabase Cloud (Staging) | Test, QA | ⚠️ Orta (Test verisi) |
| **Production** | Supabase Cloud (Prod) | Gerçek kullanıcılar | 🔴 Yüksek (Gerçek veri) |

### Kural: "Local'de ne yaparsanız yapın, hiçbir şey production'a etki etmez"
- Local ortamda veritabanı her `docker-compose down -v` ile sıfırlanır
- Staging ortamı sadece `develop` branch'inden deploy edilir
- Production ortamı sadece `main` branch'inden deploy edilir

---

## 📦 Paket Bağımlılıkları

### Mobile App (`apps/mobile`)
```json
{
  "dependencies": {
    "@travelmatch/shared": "workspace:*",
    "@travelmatch/design-system": "workspace:*"
  }
}
```

### Admin Panel (`apps/admin`)
```json
{
  "dependencies": {
    "@travelmatch/shared": "workspace:*",
    "@travelmatch/design-system": "workspace:*"
  }
}
```

### Web (`apps/web`)
```json
{
  "dependencies": {
    "@travelmatch/shared": "workspace:*"
  }
}
```

---

## 🛠️ Sık Kullanılan Komutlar

```bash
# Tüm projeleri derle (build)
pnpm build

# Sadece değişen projeleri derle (Turbo cache kullanarak)
pnpm turbo build

# Tüm projelerde lint kontrolü
pnpm lint

# Type checking (tüm projeler)
pnpm type-check

# Testleri çalıştır
pnpm test

# Yeni bağımlılık ekle (bir pakete özel)
pnpm --filter @travelmatch/mobile add react-native-maps

# Ortak pakete bağımlılık ekle
pnpm --filter @travelmatch/shared add zod
```

---

## 🔍 Önemli Kontrol Noktaları

### ✅ Yapı Doğru mu?
1. `apps/` klasöründe 3 proje var mı? (mobile, admin, web)
2. `packages/` klasöründe ortak kodlar var mı? (shared, design-system)
3. Kök dizinde `src/` klasörü YOK mu? ✅ (Olmamalı!)
4. `assets/` klasörü `apps/mobile/` içinde mi? ✅

### ✅ Environment Dosyaları Kuruldu mu?
```bash
ls -la .env*
# Görmeli:
# .env.development
# .env.staging
# .env.production.example
# .env.example (eski, referans için kalabilir)
```

---

## 📚 İlgili Dökümanlar

- [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [Developer Onboarding](./docs/DEVELOPER_ONBOARDING.md)
- [Security Guide](./docs/SECURITY_HARDENING.md)

---

## 🎉 Sonraki Adımlar

1. ✅ Projeyi VS Code'da aç ve yapıyı incele
2. ✅ `pnpm install` çalıştırarak tüm bağımlılıkları güncelle
3. ✅ `docker-compose up -d` ile local Supabase'i başlat
4. ✅ `pnpm dev` ile tüm projeleri çalıştır
5. 🚀 Staging ortamı için Supabase Cloud projesi oluştur
6. 🚀 GitHub Actions'ı staging ve production için yapılandır

---

## ❓ Sorun mu var?

### "Assets bulunamadı" hatası alıyorsanız:
```bash
# app.config.ts dosyasındaki path'leri kontrol edin
# Şu şekilde olmalı: './apps/mobile/assets/icon.png'
```

### "Package not found" hatası alıyorsanız:
```bash
pnpm install --frozen-lockfile
pnpm turbo build
```

### Docker Supabase başlamıyorsa:
```bash
docker-compose down -v
docker-compose up -d
# Logları kontrol et:
docker-compose logs -f
```

---

**✨ Tebrikler!** Projeniz artık profesyonel bir monorepo yapısına sahip. Her şey yerli yerinde, karışıklık yok! 🎯
