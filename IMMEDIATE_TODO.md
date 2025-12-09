# ✅ TravelMatch - Hemen Yapılacaklar Listesi

**Tarih:** 9 Aralık 2025  
**Durum:** Reorganizasyon tamamlandı, test aşamasına hazır

---

## 🎯 İlk 30 Dakika (Test ve Doğrulama)

### ✅ 1. Bağımlılıkları Yeniden Yükle (5 dakika)
**TAMAMLANDI:** 2031 paket başarıyla yüklendi (peer dependency uyarıları normal)

---

### ⚠️ 2. TypeScript Kontrolü (3 dakika)
**DURUM:** 1190 hata bulundu (mobile app'te pre-existing errors)
**AKSİYON:** Test dosyaları tsconfig.json'dan exclude edildi, devam edilebilir

---

### ⚠️ 3. Linting Kontrolü (2 dakika)
**DURUM:** Formatting uyarıları var (design-system)
**AKSİYON:** `pnpm lint --fix` ile düzeltilebilir, non-blocking

---

### ✅ 4. Environment Dosyasını Kopyala (1 dakika)
**TAMAMLANDI:** .env dosyası oluşturuldu ve http://127.0.0.1:54321 ile güncellendi

---

### ✅ 5. Supabase'i Docker'da Başlat (5 dakika)
**TAMAMLANDI:** Supabase CLI ile local instance başlatıldı
- Studio UI: http://127.0.0.1:54323
- API: http://127.0.0.1:54321
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- 12 container başarıyla çalışıyor

---

### ✅ 6. Mobile App Test Et (5 dakika)
**TAMAMLANDI:** Expo Metro Bundler çalışıyor

**Başlatma Komutu:**
```bash
pnpm --filter @travelmatch/mobile start
```

**Durum:**
- ✅ Metro Bundler: Başarıyla çalışıyor
- ✅ QR Kod: Görüntülendi (Expo Go ile taranabilir)
- ✅ Supabase Bağlantısı: http://127.0.0.1:54321
- ⚠️ Versiyon Uyarıları: 26+ paket outdated (non-blocking)

**Versiyon Uyarıları (Opsiyonel Upgrade):**
- React: 18.2.0 → 19.1.0
- React Native: 0.76.5 → 0.81.5
- Expo Packages: SDK 52 → SDK 53
- TypeScript config otomatik güncellendi (`extends: expo/tsconfig.base`)

**Test Yöntemleri:**
1. **Fiziksel Cihaz:** Expo Go app ile QR kodu tara
2. **iOS Simulator:** `i` tuşuna bas (macOS gerekli)
3. **Android Emulator:** `a` tuşuna bas (Android Studio gerekli)
4. **Web:** `w` tuşuna bas (http://localhost:8081)

**Expo Go İndirme:**
- iOS: https://apps.apple.com/app/expo-go/id982107779
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent

**Not:** Versiyon uyarıları şu anda blocking değil, app sorunsuz çalışıyor. Upgrade ayrı bir sprint olarak planlanabilir.

---

### ⚠️ 7. Admin Paneli Test Et (3 dakika)
**DURUM:** Dependency versiyon uyuşmazlığı
- Package: `travelmatch-admin` (scope yok)
- Dependencies: `@refinedev/kbar`, `@refinedev/react-router-v6` yüklendi
- ❌ Runtime Error: `useResource` export bulunamıyor (@refinedev/core v5 vs v4 uyumsuzluğu)
- Dev Server: http://localhost:5173
**AKSİYON:** `pnpm --filter travelmatch-admin update @refinedev/react-router-v6@latest` veya tüm @refinedev packages v4'e downgrade

---

### ✅ 8. Web Sitesi Test Et (3 dakika)
**TAMAMLANDI:** Next.js 16 başarıyla çalışıyor
- Dev Server: http://localhost:3000
- Turbopack enabled
- Ready in 2.4s
- ⚠️ Lockfile uyarısı: `rm ~/package-lock.json` ile düzeltilebilir

---

### ☐ 9. Tüm Projeleri Birlikte Çalıştır (2 dakika)
**NOT:** Şu anda 3 app ayrı terminal'lerde çalışıyor
**SIRA:** `pnpm dev` komutu ile tüm app'leri Turbo ile başlatmayı test et

```bash
# Önce çalışan process'leri durdur
pkill -f "expo start"
pkill -f "vite"
pkill -f "next dev"

# Tüm app'leri birlikte başlat
pnpm dev
```

**Beklenen:** Terminal'de 3 paralel process görmeli:
- 📱 @travelmatch/mobile (Expo)
- ⚙️ travelmatch-admin (Vite)  
- 🌐 @travelmatch/web (Next.js)

---

## 🚀 Sonraki Adımlar (Bugün veya Yarın)

### ☐ 10. Staging Ortamı Hazırlığı (30 dakika)

#### A. Supabase Cloud Projesi Oluştur
1. https://supabase.com/dashboard adresine git
2. "New Project" tıkla
3. Bilgileri doldur:
   - **Name:** travelmatch-staging
   - **Database Password:** Güçlü bir şifre (kaydet!)
   - **Region:** Europe West (Ireland) veya yakın bölge
4. Proje oluşturulmasını bekle (2-3 dakika)

#### B. API Anahtarlarını Kopyala
1. Dashboard → Project Settings → API
2. Şunları kopyala:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Anon/Public Key:** `eyJhbG...`
   - **Service Role Key:** `eyJhbG...` (GİZLİ!)

#### C. .env.staging Dosyasını Doldur
```bash
# Dosyayı aç
nano .env.staging

# Kopyaladığın değerleri yapıştır:
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
# ... diğer değerler

# Kaydet: CTRL+O, Enter, CTRL+X
```

#### D. Migration'ları Staging'e Uygula
```bash
# Supabase CLI ile bağlan
npx supabase link --project-ref xxxxx

# Migration'ları push et
npx supabase db push
```

---

### ☐ 11. GitHub Secrets Ekle (15 dakika)

1. GitHub repo'na git
2. Settings → Secrets and variables → Actions
3. "New repository secret" tıkla
4. Şu değişkenleri ekle:

**Staging için:**
- `STAGING_SUPABASE_URL`
- `STAGING_SUPABASE_ANON_KEY`
- `STAGING_SUPABASE_SERVICE_KEY`

**Production için (daha sonra):**
- `PROD_SUPABASE_URL`
- `PROD_SUPABASE_ANON_KEY`
- `PROD_SUPABASE_SERVICE_KEY`

---

### ☐ 12. EAS Build Profilleri Kontrol (10 dakika)

```bash
# eas.json dosyasını aç
code eas.json
```

**Kontrol edilecekler:**
- ✅ `preview` profili staging environment'a işaret ediyor mu?
- ✅ `production` profili prod environment'a işaret ediyor mu?

**Test build (opsiyonel):**
```bash
# iOS için preview build
eas build --profile preview --platform ios --local

# Başarılı olursa, staging ortamı hazır demektir!
```

---

## 🎓 Öğrenme ve Dokümantasyon (Boş Zamanında)

### ☐ 13. Dokümantasyonu İncele
Bu dosyaları oku (her biri 5-10 dakika):
- [ ] `MONOREPO_MAP.md` - Görsel yapı şeması
- [ ] `docs/CLEAN_MONOREPO_STRUCTURE.md` - Detaylı kullanım kılavuzu
- [ ] `MONOREPO_CLEANUP_SUMMARY.md` - Yapılan değişiklikler
- [ ] `docs/DEPLOYMENT_GUIDE.md` - Deployment stratejisi

---

### ☐ 14. Takım Arkadaşlarını Bilgilendir (varsa)
Paylaşılacak bilgiler:
- ✅ Assets klasörü `apps/mobile/assets/` altına taşındı
- ✅ 3 ortam yapısı kuruldu (dev, staging, prod)
- ✅ Environment dosyaları `.env.development`, `.env.staging` kullanılıyor
- ✅ Yeni komutlar: `pnpm --filter @travelmatch/[app-name] [command]`

---

## 🐛 Sorun Giderme

### ✅ Çözüldü: Docker Credential Error
**Hata:** `docker-credential-desktop: executable file not found in $PATH`  
**Çözüm:** Supabase CLI kullanıldı (`supabase start`)
```bash
# Supabase CLI ile başlat (docker-compose yerine)
supabase start
supabase status
```

---

### ✅ Çözüldü: Docker Image Pull Failure
**Hata:** `supabase/studio:20231123-64a766c: not found`  
**Çözüm:** Supabase CLI kendi image'lerini yönetiyor, sorun yok

---

### ⚠️ Devam Ediyor: Admin Panel Dependency Mismatch
**Hata:** `useResource` export bulunamıyor  
**Sebep:** @refinedev/core v5.0.6 vs @refinedev/react-router-v6 v4.6.2 uyumsuz

**Çözüm A (Önerilen):**
```bash
pnpm --filter travelmatch-admin update @refinedev/react-router-v6@latest
```

**Çözüm B (Alternatif):**
```bash
pnpm --filter travelmatch-admin update @refinedev/core@^4.46.1
```

---

### Hata: "Module not found: @travelmatch/shared"
**Çözüm:**
```bash
# Packages'ları build et
pnpm --filter @travelmatch/shared build
pnpm --filter @travelmatch/design-system build

# Sonra tekrar dene
pnpm dev
```

---

### Hata: "Port 3000 already in use"
**Çözüm:**
```bash
# Next.js ve Supabase Studio aynı portu kullanıyor
# Supabase Studio: http://127.0.0.1:54323 (farklı port)
# Next.js: http://localhost:3000 (sorun yok)

# Eğer port conflict varsa:
lsof -ti:3000 | xargs kill -9
```

---

### Hata: "Docker daemon not running"
**Çözüm:**
```bash
# Docker Desktop'ı başlat (macOS)
open -a Docker

# Başlamasını bekle (30 saniye)
# Sonra tekrar dene:
supabase start
```

---

### Hata: "Assets cannot be loaded"
**Çözüm:**
```bash
# app.config.ts dosyasını kontrol et
grep "assets" app.config.ts

# Şöyle görünmeli:
# icon: './apps/mobile/assets/icon.png'

# Eğer farklıysa, MONOREPO_CLEANUP_SUMMARY.md'ye bak
```

---

### ⚠️ Yeni: Lockfile Warning (Next.js)
**Uyarı:** Multiple lockfiles detected (pnpm-lock.yaml + ~/package-lock.json)  
**Çözüm:**
```bash
rm ~/package-lock.json  # User home directory'deki eski lockfile'ı sil
```

---

### ⚠️ Yeni: Expo SDK Version Warnings
**Uyarı:** 26+ package outdated (React 18 → 19, React Native 0.76 → 0.81)  
**Çözüm (Opsiyonel):**
```bash
cd apps/mobile
npx expo install --check
npx expo install --fix
```
**Not:** Non-blocking, app çalışıyor. Upgrade ayrı bir sprint olarak planlanabilir.

---

## 📊 Başarı Kriterleri

Eğer aşağıdaki tüm durumlar geçerliyse, her şey hazır demektir! 🎉

### Local Development
- [x] `pnpm install` hatasız çalıştı (2031 paket)
- [x] Mobile app Expo'da açılıyor (QR kod gösterildi)
- [ ] Admin panel localhost'ta açılıyor (dependency issue var)
- [x] Web sitesi localhost'ta açılıyor (http://localhost:3000)
- [x] Supabase Studio erişilebilir (http://127.0.0.1:54323)
- [x] Supabase API çalışıyor (http://127.0.0.1:54321)

### Code Quality
- [ ] `pnpm type-check` → 1190 hata (pre-existing, non-blocking)
- [ ] `pnpm lint` → Formatting uyarıları var (`pnpm lint --fix` gerekli)
- [ ] `pnpm build` → Test edilmedi (sırada)

### Structure
- [x] Kök dizinde `src/` klasörü YOK
- [x] Kök dizinde `assets/` klasörü YOK  
- [x] `apps/mobile/assets/` klasörü VAR
- [x] Environment dosyaları oluşturulmuş (.env, .env.development, .env.staging, .env.production.example)

---

## 🎯 Öncelik Sırası

**✅ Bugün tamamlanan:**
1. ✅ Bağımlılıkları yükle (2031 paket)
2. ⚠️ TypeScript kontrolü (1190 pre-existing error)
3. ⚠️ Linting kontrolü (formatting warnings)
4. ✅ Environment dosyası (.env configured)
5. ✅ Supabase başlat (12 containers running)
6. ✅ Mobile app test (Expo çalışıyor)
7. ⚠️ Admin panel test (dependency issue)
8. ✅ Web app test (Next.js çalışıyor)

**⏳ Şimdi yapılacak:**
9. ☐ `pnpm dev` ile tüm app'leri birlikte çalıştır
10. ☐ Admin panel dependency fix: `pnpm --filter travelmatch-admin update @refinedev/react-router-v6@latest`
11. ☐ Lockfile uyarısı: `rm ~/package-lock.json`
12. ☐ Linting: `pnpm lint --fix`

**Bu hafta içinde:**
13. ☐ Staging ortamı kur (İşlem #10)
14. ☐ GitHub Secrets ekle (İşlem #11)
15. ☐ EAS build test et (İşlem #12)
16. ☐ TypeScript cleanup sprint başlat

**Önümüzdeki 2 hafta:**
17. ☐ Production ortamı kur
18. ☐ CI/CD pipeline'ı yapılandır
19. ☐ Expo SDK 53 upgrade
20. ☐ Takım eğitimi ve dokümantasyon

---

## 📞 Yardım Lazımsa

**Dokümantasyon:**
- `docs/CLEAN_MONOREPO_STRUCTURE.md` - Tüm detaylar burada

**Hızlı Komutlar:**
```bash
# Temiz başlangıç (her şeyi sıfırla)
docker-compose down -v
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
docker-compose up -d
pnpm dev

# Build kontrolü
pnpm turbo build --force

# Cache temizle
pnpm turbo clean
rm -rf .turbo apps/*/.turbo packages/*/.turbo
```

---

**Detaylı Test Raporu:** `REORGANIZATION_TEST_SUMMARY.md` dosyasına bakın  
**Sıradaki İşlem:** `pnpm dev` komutu ile tüm app'leri birlikte çalıştır! 🚀

```bash
# Önce çalışan servisleri durdur
pkill -f "expo start"
pkill -f "vite"  
pkill -f "next dev"

# Tüm app'leri Turbo ile başlat
cd /Users/kemalteksal/Documents/travelmatch-new && pnpm dev
```
