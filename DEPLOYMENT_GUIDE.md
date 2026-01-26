# 🚀 Lovendo Beta Launch - Deployment Rehberi

**Tarih:** 24 Ocak 2026
**Branch:** `claude/lovendo-launch-readiness-UEpzZ`
**Status:** ✅ KOD HAZIR - Manuel adımlar bekleniyor

---

## ⚡ Hızlı Başlangıç (5 Adım)

```bash
# 1️⃣ Database Migration (EN KRİTİK!)
supabase db push --linked

# 2️⃣ RLS Testleri
pnpm db:test:rls

# 3️⃣ Type Check
pnpm type-check

# 4️⃣ Build Test
pnpm build

# 5️⃣ Deployment
# Production'a deploy et (detaylar aşağıda)
```

---

## 📋 Manuel Adımlar Checklist

### 1. Database Setup (5 dk) 🔴 KRİTİK

```bash
# A. Migration uygula
supabase db push --linked

# B. RLS testlerini çalıştır
pnpm db:test:rls

# Beklenen çıktı: ✅ All tests passed
# Eğer fail ederse: DURDUR ve loglara bak
```

**Doğrulama:**
```sql
-- Test: User A, User B'nin email'ini görememeli
-- Supabase Dashboard → SQL Editor
SELECT email FROM users WHERE id = 'USER_B_UUID';
-- Beklenen: 0 rows (permission denied)
```

---

### 2. pg_cron Extension (2 dk) 🟡 ÖNEM

**Nerede:** Supabase Dashboard → SQL Editor

```sql
-- A. Extension'ı aktif et
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- B. Job'ı kontrol et
SELECT * FROM cron.job WHERE jobname = 'refund-expired-escrow';

-- Beklenen: 1 row (job scheduled)
```

**Not:** Bu migration zaten mevcut: `20251213000004_enable_pg_cron.sql`

---

### 3. Firebase Setup (10 dk) 🔴 KRİTİK

**Dokümantasyon:** `apps/mobile/GOOGLE_SERVICES_SETUP.md`

**Adımlar:**
1. [Firebase Console](https://console.firebase.google.com/) → Lovendo Production
2. **Android:** Download `google-services.json` → `apps/mobile/`
3. **iOS:** Download `GoogleService-Info.plist` → `apps/mobile/`
4. Dosyaları `.gitignore` kontrol et (otomatik)
5. EAS secrets upload et:

```bash
# Android
eas secret:create --scope project \
  --name GOOGLE_SERVICES_JSON \
  --value "$(cat apps/mobile/google-services.json)" \
  --type file

# iOS
eas secret:create --scope project \
  --name GOOGLE_SERVICE_INFO_PLIST \
  --value "$(cat apps/mobile/GoogleService-Info.plist)" \
  --type file
```

---

### 4. TypeScript Kontrolü (5 dk) 🟢 ZORUNLU

```bash
# Admin panel type check
cd apps/admin && pnpm type-check

# Beklenen: 0 errors
# Çıktı örneği:
# Found 0 errors
```

**Kural:** 0 TypeScript hatası olmadan deployment YAPILAMAZ.

```bash
# Manuel kontrol
npx tsc --noEmit 2>&1 | grep -c "error"
# Beklenen: 0
```

### 5. Admin Middleware Doğrulama (2 dk) 🔴 KRİTİK

```bash
# Middleware dosyası var mı kontrol et
ls -la apps/admin/src/middleware.ts

# Beklenen: -rw-r--r--  1 ... middleware.ts
```

**Doğrulama Testi:**
```bash
# 1. Admin panel'e git (browser'da)
# 2. Giriş yap
# 3. Cookie'yi sil veya değiştir
# 4. Sayfayı yenile
# Beklenen: /login?reason=session_expired'e redirect
```

### 6. Webhook Security Test (3 dk) 🔴 KRİTİK

```bash
# RevenueCat webhook auth test
curl -X POST https://...supabase.co/functions/v1/revenuecat-webhook \
  -H "Content-Type: application/json" \
  -d '{"event":{"type":"INITIAL_PURCHASE"}}'

# Beklenen: {"error":"Unauthorized"} veya 401/500
# OLMAMALI: 200 OK (bu kritik güvenlik açığıdır!)
```

### 7. Mobile Builds (30 dk) 🟡 ÖNEM

```bash
cd apps/mobile

# A. Android Build
eas build --platform android --profile production --non-interactive

# B. iOS Build
eas build --platform ios --profile production --non-interactive

# Build tamamlanınca:
# - Android: Download .aab file
# - iOS: Download .ipa file
```

**Doğrulama:**
- Build log'unda hata yok mu?
- google-services.json bulundu mu?
- Bundle size < 50MB (Android), < 100MB (iOS)?

---

### 5. Security Verification (15 dk) 🔴 KRİTİK

#### A. PII Leak Test (En Önemli!)

```bash
# 1. Mobil uygulamayı aç
# 2. Chrome DevTools → Network tab aç
# 3. User search yap
# 4. Response payload'ı incele

# ✅ OLMALI: id, full_name, avatar_url, bio, location
# ❌ OLMAMALI: email, phone, balance, push_token, kyc_status
```

#### B. Webhook Auth Test

```bash
# RevenueCat - Auth olmadan
curl -X POST https://bjikxgtbptrvawkguypv.supabase.co/functions/v1/revenuecat-webhook \
  -H "Content-Type: application/json" \
  -d '{"event":{"type":"INITIAL_PURCHASE"}}'

# Beklenen: {"error":"Server misconfigured"} veya {"error":"Unauthorized"}
# Status: 500 veya 401

# ✅ OLMAMALI: 200 OK
```

#### C. Admin Session Test

```bash
# 1. Admin panel'e giriş yap
# 2. Cookie'yi inspectörde bul
# 3. Cookie değerini random string'e değiştir
# 4. Sayfayı yenile

# Beklenen: /login?reason=session_expired'e redirect
```

---

### 6. Edge Functions Deploy (5 dk) 🟡 ÖNEM

```bash
# Tüm functions'ı deploy et
supabase functions deploy

# Veya kritik olanları tek tek
supabase functions deploy revenuecat-webhook
supabase functions deploy idenfy-webhook

# Doğrulama
supabase functions list
```

**Environment Variables Kontrolü:**
- ✅ REVENUECAT_WEBHOOK_SECRET set
- ✅ IDENFY_API_SECRET set
- ✅ PAYTR_MERCHANT_* set
- ✅ SUPABASE_SERVICE_ROLE_KEY set

---

### 7. Monitoring Setup (10 dk) 🟢 İYİ OLUR

#### Sentry

```bash
# Production source maps upload doğrula
# .github/workflows/production-deploy.yml kontrolü

# Sentry Dashboard → Projects → Lovendo
# Settings → Source Maps → Verify latest upload
```

#### PostHog

```bash
# Dashboard → Live Events
# 24 saat içinde "app_opened" eventleri görmeli
```

#### Supabase

```bash
# Dashboard → Logs
# Filter: revenuecat-webhook, idenfy-webhook
# Son 1 saat: Hata yok mu?
```

---

## 🎯 Go/No-Go Checklist

### ✅ GO Kriterleri

- [ ] ✅ Database migration uygulandı ve RLS testleri geçti
- [ ] ✅ pg_cron extension aktif ve job scheduled
- [ ] ✅ TypeScript check geçti (0 errors)
- [ ] ✅ Firebase configs (google-services.json + plist) hazır
- [ ] ✅ Mobile builds (Android + iOS) başarılı
- [ ] ✅ PII leak test geçti (network inspection'da email/phone YOK)
- [ ] ✅ RevenueCat webhook auth bypass fixed (401/500 dönüyor)
- [ ] ✅ Admin session validation çalışıyor (invalid session → login)
- [ ] ✅ Edge functions deploy edildi (no env errors)
- [ ] ✅ Monitoring aktif (Sentry + PostHog + Supabase logs)
- [ ] ✅ Offline mode test (placeholder images çalışıyor)

### 🚫 NO-GO Kriterleri

Eğer bunlardan **herhangi biri** varsa DURDUR:

- [ ] ❌ TypeScript hatası var (npx tsc --noEmit > 0)
- [ ] ❌ RLS testleri FAIL
- [ ] ❌ Mobile build error
- [ ] ❌ PII leak detected (email görünüyor)
- [ ] ❌ Webhook auth bypass hala var (200 OK dönüyor)
- [ ] ❌ Database migration error
- [ ] ❌ Production env vars missing

---

## 🔥 Deployment Sequence

### Production Deployment (Önerilen Sıra)

```bash
# 1. Database (Supabase)
supabase db push --linked
# ⏱️  ~30 saniye
# ✅ Verify: RLS testleri geçmeli

# 2. Edge Functions (Supabase)
supabase functions deploy
# ⏱️  ~2 dakika
# ✅ Verify: Functions listede görünmeli

# 3. Admin Panel (Vercel)
cd apps/admin
vercel deploy --prod
# ⏱️  ~5 dakika
# ✅ Verify: https://admin.lovendo.com çalışmalı

# 4. Mobile App (TestFlight/Internal Testing)
cd apps/mobile
eas submit --platform ios --profile production
eas submit --platform android --profile production
# ⏱️  ~10 dakika (review bekleniyor)
# ✅ Verify: TestFlight'ta görünmeli
```

---

## 🆘 Sorun Giderme

### ❗ Migration Fails

```bash
# Error: "relation users already has RLS enabled"
# Çözüm: Normal, devam et

# Error: "function get_own_profile already exists"
# Çözüm: Normal, devam et

# Error: "permission denied"
# Çözüm: Supabase service role key kontrol et
```

### ❗ RLS Tests Fail

```bash
# Test: "User can read other user's email" FAIL (expected)
# Bu DOĞRU! Test email okunamadığını kontrol ediyor.

# Eğer test beklenmedik şekilde GEÇERSE:
# 1. Migration uygulanmamış demektir
# 2. supabase db push --linked tekrar çalıştır
```

### ❗ Mobile Build Fails

```bash
# Error: "google-services.json not found"
# Çözüm: Firebase Console'dan indir, apps/mobile/ altına koy

# Error: "Bundle too large"
# Çözüm: Babel config'de console removal aktif mi kontrol et

# Error: "EAS credentials not configured"
# Çözüm: eas credentials configure
```

### ❗ Webhook Returns 200 (Auth Bypass!)

```bash
# EĞER auth olmadan 200 dönerse: DURDUR!
# Bu kritik güvenlik açığı demektir.

# Debug:
supabase functions logs revenuecat-webhook --limit 50

# REVENUECAT_WEBHOOK_SECRET var mı kontrol et:
supabase secrets list

# Yoksa set et:
supabase secrets set REVENUECAT_WEBHOOK_SECRET=your_secret_here
```

---

## 📊 Post-Deployment Monitoring (İlk 48 Saat)

### Sentry - Error Monitoring

```bash
# Dashboard → Issues
# Filtre: is:unresolved
# Beklenen: 0 critical errors

# Eğer error varsa:
# 1. Stack trace'e bak
# 2. Sentry'de "Mark as Resolved" işaretle
# 3. Gerekirse hotfix hazırla
```

### PostHog - Analytics

```bash
# Dashboard → Insights → Trends
# Metrik: "app_opened", "user_search", "moment_view"
# Beklenen: Artan trend

# Eğer data gelmiyorsa:
# 1. PostHog API key kontrol et
# 2. EXPO_PUBLIC_POSTHOG_API_KEY set mi?
# 3. Live events tab'ına bak (real-time)
```

### Supabase - Database & Functions

```bash
# Dashboard → Logs
# Filter: Error level: Error, Warning
# Timeframe: Last 1 hour

# İzlenecek metrikler:
# - RPC call count (handle_coin_transaction)
# - Function invocations (revenuecat-webhook)
# - Database errors (RLS violations)
```

### Database Health

```sql
-- Supabase Dashboard → SQL Editor

-- 1. Escrow transactions count
SELECT COUNT(*) FROM escrow_transactions WHERE status = 'pending';
-- Beklenen: Normal seviyede (0-100)

-- 2. Failed coin transactions
SELECT COUNT(*) FROM coin_transactions
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND amount < 0;
-- Beklenen: 0 (veya çok az)

-- 3. User growth
SELECT COUNT(*) FROM users
WHERE created_at > NOW() - INTERVAL '24 hours';
-- Beklenen: Artan trend
```

---

## 🎉 Success Metrics (Beta Launch)

### Day 1 (24 saat)
- ✅ 0 critical errors in Sentry
- ✅ 0 PII leak incidents
- ✅ 0 unauthorized webhook calls
- ✅ > 10 users signed up
- ✅ > 0 IAP purchases successful

### Week 1 (7 gün)
- ✅ < 1% error rate
- ✅ > 100 MAU (Monthly Active Users)
- ✅ > 10 moments created
- ✅ 0 security incidents
- ✅ < 5 support tickets (blocker issues)

### Week 2-4 (Public Launch Prep)
- ✅ Complete P1 items (rate limiting, SSL pinning)
- ✅ Load testing completed (1000+ concurrent)
- ✅ Accessibility audit passed
- ✅ < 0.1% crash rate
- ✅ Performance: p95 API latency < 500ms

---

## 📞 Emergency Contacts

### Critical Issues (Immediate Response)

1. **PII Leak Discovered**
   - Stop all new signups
   - Notify legal team (GDPR 72-hour window)
   - Run incident response playbook

2. **Auth Bypass Detected**
   - Disable affected webhook/endpoint
   - Rotate all secrets
   - Audit access logs

3. **Database Down**
   - Check Supabase status page
   - Restore from latest backup if needed
   - Communicate with users

### Rollback Plan

```bash
# Database (Dikkatli!)
# Migration rollback YAPMA - data loss riski
# Bunun yerine fix-forward migration yaz

# Edge Functions
git checkout <previous-commit>
supabase functions deploy

# Admin Panel
vercel rollback

# Mobile App
# App Store: Cannot rollback, submit hotfix
# TestFlight: Upload previous build
```

---

## ✅ Final Checklist

**Deployment öncesi son kontrol:**

```bash
# 1. Git status temiz mi?
git status
# Expected: nothing to commit, working tree clean

# 2. Tüm testler geçiyor mu?
pnpm test
pnpm db:test:rls

# 3. Type errors yok mu?
pnpm type-check

# 4. Build başarılı mı?
pnpm build

# 5. Environment variables set mi?
supabase secrets list
# Expected: Tüm kritik secrets görünmeli
```

**Deployment sonrası doğrulama:**

```bash
# 1. Health check
curl https://bjikxgtbptrvawkguypv.supabase.co/rest/v1/
# Expected: 200 OK

# 2. Admin panel
curl https://admin.lovendo.com/api/health
# Expected: {"status":"ok"}

# 3. Mobile app
# - TestFlight'tan indir
# - Login yap
# - Moment görüntüle
# - Expected: Hata yok
```

---

## 🚀 Sonraki Adımlar (Public Launch)

### P1 Items (Zorunlu)
1. ⚠️ Rate limiting - Financial RPCs
2. ⚠️ SSL certificate pinning - Mobile app
3. ⚠️ Admin API audit - Kalan 30 route
4. ⚠️ Load testing - k6 ile 1000+ user

### P2 Items (Önemli)
1. Bundle size optimization - < 10MB
2. Accessibility audit - WCAG 2.1 AA
3. Localization review - Native speaker
4. Performance optimization - FlatList, image caching

---

**Hazırlayan:** AI Security & DevOps Team
**Tarih:** 24 Ocak 2026
**Versiyon:** 1.0
**Durum:** ✅ DEPLOYMENT İÇİN HAZIR

---

## 🎯 TL;DR - Hızlı Başlangıç

```bash
# 1. Database
supabase db push --linked && pnpm db:test:rls

# 2. Firebase (manuel - GOOGLE_SERVICES_SETUP.md'ye bak)

# 3. Mobile builds
cd apps/mobile && eas build --platform all --profile production

# 4. Deploy
supabase functions deploy
cd apps/admin && vercel deploy --prod

# 5. Verify
# - Network inspection (no PII)
# - Webhook test (401/500)
# - Admin session test (redirect)

# ✅ DONE!
```

**Başarılar! 🎊**
