# 🚀 TravelMatch Manuel Kurulum Adımları

**Tarih:** 2025-12-15
**Durum:** ✅ Otomatik kurulum tamamlandı - Manuel adımlar bekleniyor
**Tahmini Süre:** 15-20 dakika

---

## ⚡ HIZLI BAŞLANGIÇ (3 Komut)

```bash
# 1. Supabase'e login ol
npx supabase login

# 2. Setup script'ini çalıştır (otomatik deployment)
./scripts/setup-supabase.sh

# 3. Doğrula
./scripts/verify-supabase.sh
```

**Bu kadar!** Aşağıdaki detaylar isteğe bağlı.

---

## 📋 ADIM ADIM KURULUM

### ✅ ZATEN TAMAMLANDI (Otomatik)

- [x] Supabase project ID güncellendi (`bjikxgtbptrvawkguypv`)
- [x] Environment dosyaları oluşturuldu
- [x] 42 migration dosyası hazır
- [x] 12 Edge Function hazır
- [x] Setup ve verification script'leri hazır
- [x] Tüm dokümantasyon oluşturuldu
- [x] Git commit ve push yapıldı

---

### 🔴 ŞİMDİ YAPILACAKLAR (15-20 dakika)

#### Adım 1: Supabase CLI ile Login (2 dakika)

```bash
# Terminal'de çalıştır:
npx supabase login
```

**Ne olacak:**
- Tarayıcı açılacak
- Supabase'e login olacaksınız
- Access token alacaksınız
- Terminal'e yapıştıracaksınız

**Sorun olursa:**
```bash
# Alternatif: Access token manuel gir
npx supabase login --token YOUR_ACCESS_TOKEN
```

---

#### Adım 2: Otomatik Deployment Çalıştır (5-10 dakika)

```bash
# Setup script'ini çalıştır
./scripts/setup-supabase.sh
```

**Script ne yapacak:**
1. ✅ Project'e link olacak (`bjikxgtbptrvawkguypv`)
2. ✅ 42 migration dosyasını gösterecek
3. ❓ "Apply migrations to production? [y/N]:" → **y** yazın
4. ⏳ Migrations deploy olacak (2-3 dakika)
5. ❓ "Deploy all Edge Functions? [y/N]:" → **y** yazın
6. ⏳ Edge Functions deploy olacak (3-4 dakika)
7. ✅ API endpoint'leri test edecek
8. ❓ "Run verification script? [y/N]:" → **y** yazın

**Beklenen Çıktı:**
```
🎉 Supabase Setup Complete!

✅ 42 migrations applied
✅ 12 Edge Functions deployed
✅ REST API accessible
✅ Auth API accessible
✅ Storage API accessible
```

---

#### Adım 3: Edge Function Secrets Ayarla (3-5 dakika)

```bash
# Stripe (Test keys - production'da live keys kullanın)
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx

# OpenAI (optional - KYC verification için)
npx supabase secrets set OPENAI_API_KEY=sk-xxxxx

# Cloudflare Stream (optional - video processing için)
npx supabase secrets set CLOUDFLARE_STREAM_API_KEY=xxxxx
npx supabase secrets set CLOUDFLARE_STREAM_ACCOUNT_ID=xxxxx

# Google Maps (optional - geocoding için)
npx supabase secrets set GOOGLE_MAPS_SERVER_KEY=AIzaSy...

# Upstash Redis (optional - rate limiting için)
npx supabase secrets set UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
npx supabase secrets set UPSTASH_REDIS_REST_TOKEN=xxxxx

# Secrets'ları kontrol et
npx supabase secrets list
```

**Notlar:**
- Şu an için test keys kullanabilirsiniz
- Production'dan önce live keys'e geçin
- Tüm secrets isteğe bağlı (minimum Stripe gerekli)

---

#### Adım 4: Verification (2 dakika)

```bash
# Tüm infrastructure'ı doğrula
./scripts/verify-supabase.sh
```

**Beklenen Çıktı:**
```
🔍 TravelMatch Supabase Verification
=====================================

1️⃣  Testing database connection...
   ✅ Database accessible via REST API

2️⃣  Testing Auth API...
   ✅ Auth API healthy

3️⃣  Testing Storage API...
   ✅ Storage API accessible

4️⃣  Testing Edge Functions endpoint...
   ✅ Edge Functions endpoint accessible

5️⃣  Checking storage buckets...
   ✅ Found 5 storage bucket(s)
   Buckets:
     • avatars
     • kyc_docs
     • moment-images
     • profile-proofs
     • video-uploads

6️⃣  Checking database tables...
   ✅ Table 'users' exists
   ✅ Table 'moments' exists
   ✅ Table 'messages' exists
   ✅ Table 'payments' exists
   ✅ Table 'wallets' exists

7️⃣  Testing RLS policies...
   ✅ RLS policies active (protected access)

8️⃣  Checking migration status...
   ✅ 42 migration(s) applied

=====================================
Verification Summary
=====================================

✅ Passed: 8
❌ Failed: 0
📊 Total:  8

🎉 All checks passed!
Supabase is ready for production
```

---

#### Adım 5: Infisical Setup (İsteğe Bağlı - 5-10 dakika)

**A. Dashboard'da Project Oluştur**

1. Git: https://app.infisical.com/org/cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9
2. "Create Project" → "TravelMatch"
3. 3 environment ekle: `development`, `staging`, `production`

**B. Secrets Ekle**

Her environment için şu secrets'ları ekle:

**Development:**
```
SUPABASE_URL=https://bjikxgtbptrvawkguypv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaWt4Z3RicHRydmF3a2d1eXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTQzNDgsImV4cCI6MjA0OTc3MDM0OH0.jKSPE6XGKHsYZC6R90aeU6V2hMF3xE1hLQs7p6VLbEo
SUPABASE_SERVICE_ROLE_KEY=<supabase-dashboard-settings-api>
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx
```

**Production:** (Aynı secrets ama live keys)

**C. CLI Integration (İsteğe Bağlı)**

```bash
# CLI yükle
brew install infisical/get-cli/infisical

# Login
infisical login

# Project initialize
cd apps/mobile
infisical init

# App'i secrets ile çalıştır
infisical run -- npx expo start
```

---

## 🧪 TEST ET

### Test 1: Database Connection

```bash
# Users tablosunu listele (RLS protected, boş dönmeli)
curl -s "https://bjikxgtbptrvawkguypv.supabase.co/rest/v1/users?limit=1" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaWt4Z3RicHRydmF3a2d1eXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTQzNDgsImV4cCI6MjA0OTc3MDM0OH0.jKSPE6XGKHsYZC6R90aeU6V2hMF3xE1hLQs7p6VLbEo" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaWt4Z3RicHRydmF3a2d1eXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTQzNDgsImV4cCI6MjA0OTc3MDM0OH0.jKSPE6XGKHsYZC6R90aeU6V2hMF3xE1hLQs7p6VLbEo"

# Beklenen: [] (empty array - RLS çalışıyor)
```

### Test 2: Storage Buckets

```bash
# Bucket listesini al
curl -s "https://bjikxgtbptrvawkguypv.supabase.co/storage/v1/bucket" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaWt4Z3RicHRydmF3a2d1eXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTQzNDgsImV4cCI6MjA0OTc3MDM0OH0.jKSPE6XGKHsYZC6R90aeU6V2hMF3xE1hLQs7p6VLbEo"

# Beklenen: 5 bucket (avatars, kyc_docs, moment-images, profile-proofs, video-uploads)
```

### Test 3: Edge Function

```bash
# Health check
curl -s "https://bjikxgtbptrvawkguypv.supabase.co/functions/v1/"

# Beklenen: 404 veya function listesi
```

### Test 4: Mobile App

```bash
cd apps/mobile

# Development environment ile çalıştır
npm run ios
# veya
npm run android

# Console'da görmeli:
# ✅ Environment validation passed
# 📱 Running in development mode
# ✅ Connected to Supabase: https://bjikxgtbptrvawkguypv.supabase.co
```

---

## 🚨 SORUN GİDERME

### Sorun: "Project not linked"

```bash
npx supabase link --project-ref bjikxgtbptrvawkguypv
```

### Sorun: "Migration already applied"

Bu normal! Database zaten güncel demek.

```bash
# Status kontrol et
npx supabase migration list --linked
```

### Sorun: "Authentication required"

```bash
# Tekrar login ol
npx supabase login
```

### Sorun: "Storage buckets not found"

Migrations henüz apply edilmemiş:

```bash
npx supabase db push
```

### Sorun: "Edge Function deployment failed"

```bash
# Verbose output ile tekrar dene
npx supabase functions deploy --debug

# Secrets eksik olabilir
npx supabase secrets list
```

---

## 📊 ÖNEMLİ LINKLER

### Supabase Dashboard
- **Ana Panel:** https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv
- **Database:** https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/editor
- **Edge Functions:** https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/functions
- **Storage:** https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/storage/buckets
- **Logs:** https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/logs/explorer
- **Settings → API:** https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/settings/api

### Infisical Dashboard
- **Organization:** https://app.infisical.com/org/cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9

---

## ✅ KURULUM TAMAMLANDI MI?

Aşağıdaki komutları çalıştır, hepsi ✅ dönmeli:

```bash
# 1. Project linked mi?
npx supabase projects list | grep bjikxgtbptrvawkguypv
# Beklenen: bjikxgtbptrvawkguypv satırını görmeli

# 2. Migrations applied mi?
npx supabase migration list --linked | grep -c "✓"
# Beklenen: 42

# 3. Edge Functions deployed mi?
npx supabase functions list
# Beklenen: 12 function listesi

# 4. Secrets set mi?
npx supabase secrets list
# Beklenen: En az STRIPE_SECRET_KEY

# 5. Verification passed mi?
./scripts/verify-supabase.sh
# Beklenen: ✅ Passed: 8, ❌ Failed: 0
```

Hepsi ✅ ise: **🎉 KURULUM TAMAMLANDI!**

---

## 🎯 SONRAKI ADIMLAR

Kurulum tamamlandıktan sonra:

### 1. Production Blockers (Zorunlu)
- [ ] Legal documents (Privacy Policy, Terms, Support URL)
- [ ] Store assets (screenshots, icons, feature graphic)
- [ ] Stripe live keys aktivasyonu
- [ ] KYC provider entegrasyonu (Onfido veya Stripe Identity)

### 2. Mobile App Test
```bash
cd apps/mobile
npm run ios
# Giriş yap, moment oluştur, payment test et
```

### 3. Monitoring Setup
- Sentry alert rules
- Datadog RUM
- Edge Function logs monitoring

### 4. App Store Submission
- iOS: App Store Connect
- Android: Google Play Console

---

## 📞 YARDIM

**Sorun yaşıyorsanız:**

1. **Logs kontrol et:**
   ```bash
   npx supabase functions logs --tail
   ```

2. **Dashboard kontrol et:**
   - https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv

3. **Dokümantasyon:**
   - [SUPABASE_DEPLOYMENT_GUIDE.md](SUPABASE_DEPLOYMENT_GUIDE.md)
   - [INFISICAL_SETUP_GUIDE.md](INFISICAL_SETUP_GUIDE.md)
   - [scripts/README.md](scripts/README.md)

4. **Verification script tekrar çalıştır:**
   ```bash
   ./scripts/verify-supabase.sh
   ```

---

**Son Güncelleme:** 2025-12-15
**Durum:** 🟢 Otomatik kurulum tamamlandı, manuel adımlar bekleniyor
**Tahmini Süre:** 15-20 dakika
**Risk Seviyesi:** 🟢 Düşük (tüm işlemler geri alınabilir)
