# ⚡ TravelMatch - Hemen Deploy Et!

**Son Güncelleme:** 2025-12-15
**Tahmini Süre:** 5 dakika
**Zorluk:** 🟢 Çok Kolay

---

## 🚀 SEÇENEK 1: GitHub Actions (TAVSİYE EDİLEN) ⭐

**EN KOLAY YOL - Otomatik deployment!**

### Adım 1: GitHub Secrets Ekle (2 dakika)

1. Git: https://github.com/weareasocialyazilim/travelmatch/settings/secrets/actions

2. **"New repository secret"** tıkla, şu secrets'ları ekle:

```bash
SUPABASE_ACCESS_TOKEN
  → Supabase Dashboard → Account → Access Tokens → Generate New Token
  → https://supabase.com/dashboard/account/tokens

SUPABASE_DB_PASSWORD
  → Supabase Dashboard → Project Settings → Database → Password
  → https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/settings/database

# Şu anki için boş bırakabilirsiniz (daha sonra ekleyin):
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
OPENAI_API_KEY=sk-xxxxx
CLOUDFLARE_STREAM_API_KEY=xxxxx
CLOUDFLARE_STREAM_ACCOUNT_ID=xxxxx
GOOGLE_MAPS_SERVER_KEY=xxxxx
UPSTASH_REDIS_REST_URL=xxxxx
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

### Adım 2: Workflow'u Tetikle (30 saniye)

**Otomatik (push ile):**
```bash
git pull origin claude/upgrade-travelMatch-standards-caWv5
git checkout main
git merge claude/upgrade-travelMatch-standards-caWv5
git push origin main
```

**Manuel (GitHub UI):**
1. Git: https://github.com/weareasocialyazilim/travelmatch/actions
2. Sol menüden "🚀 Deploy Supabase Infrastructure" seç
3. "Run workflow" tıkla
4. Environment: **production** seç
5. Deploy migrations: ✅
6. Deploy functions: ✅
7. "Run workflow" tıkla

### Adım 3: İzle ve Doğrula (2 dakika)

1. Workflow çalışmayı izle: https://github.com/weareasocialyazilim/travelmatch/actions
2. Yeşil ✅ göreceksiniz
3. Deployment summary'de link'lere tıklayın

**BITTI!** 🎉

---

## 🚀 SEÇENEK 2: Terminal'den (Klasik Yol)

### Tek Komut - Hepsi Otomatik!

```bash
# Supabase'e login ol (tarayıcı açılacak)
npx supabase login

# Setup script'ini çalıştır (her şeyi yapar)
./scripts/setup-supabase.sh

# Soruları cevapla:
# "Apply migrations to production? [y/N]:" → y
# "Deploy all Edge Functions? [y/N]:" → y
# "Run verification script? [y/N]:" → y
```

**BITTI!** 🎉

---

## 🚀 SEÇENEK 3: Supabase Dashboard (Manuel)

**CLI kurmak istemiyorsanız:**

### Adım 1: Migrations (SQL Editor)

1. Git: https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/editor
2. **"SQL Editor"** aç
3. Her migration dosyasını sırayla çalıştır:

```bash
# Terminal'de migration listesini al:
ls -1 supabase/migrations/*.sql

# Her dosyayı oku ve SQL Editor'e yapıştır:
cat supabase/migrations/20241205000000_initial_schema.sql
# → SQL Editor'e yapıştır → Run

cat supabase/migrations/20241205000001_add_indexes.sql
# → SQL Editor'e yapıştır → Run

# ... (42 migration, 15 dakika)
```

### Adım 2: Edge Functions

Edge Functions için Supabase CLI şart, bu yüzden:
- Ya Seçenek 1 (GitHub Actions) kullanın
- Ya da Seçenek 2 (Terminal) kullanın

---

## ✅ DOĞRULAMA

Hangisini seçerseniz seçin, sonunda şunu çalıştırın:

```bash
./scripts/verify-supabase.sh
```

**Beklenen:**
```
✅ Passed: 8
❌ Failed: 0
🎉 All checks passed!
```

**Veya Dashboard'da kontrol edin:**

1. **Tables:** https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/editor
   - ✅ 10 tablo görmeli: users, moments, messages, payments, wallets...

2. **Storage:** https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/storage/buckets
   - ✅ 5 bucket görmeli: avatars, kyc_docs, moment-images...

3. **Functions:** https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/functions
   - ✅ 12 function görmeli (eğer deploy ettiyseniz)

---

## 🎯 HANGİSİNİ SEÇMELİYİM?

| Seçenek | Süre | Zorluk | Otomatik | Tavsiye |
|---------|------|--------|----------|---------|
| **GitHub Actions** | 5 dk | 🟢 Kolay | ✅ | ⭐⭐⭐ **En İyi** |
| **Terminal (CLI)** | 10 dk | 🟡 Orta | ✅ | ⭐⭐ İyi |
| **Dashboard (Manuel)** | 30 dk | 🔴 Zor | ❌ | ⭐ Son Çare |

**Önerim:** **GitHub Actions** (Seçenek 1) - En kolay ve en güvenli! 🚀

---

## 🚨 SORUN ÇIKTI MI?

### GitHub Actions başarısız olduysa:

1. **Secrets eksik:** Tüm required secrets'ları eklediniz mi?
   - https://github.com/weareasocialyazilim/travelmatch/settings/secrets/actions

2. **Logs kontrol et:** Actions sayfasında failed step'e tıklayın
   - https://github.com/weareasocialyazilim/travelmatch/actions

3. **Tekrar dene:** "Re-run failed jobs" tıklayın

### Terminal'de hata aldıysanız:

```bash
# Login kontrol et
npx supabase projects list

# Project link kontrol et
npx supabase link --project-ref bjikxgtbptrvawkguypv

# Tekrar dene
./scripts/setup-supabase.sh
```

### Dashboard'da hata aldıysanız:

- SQL hatasını oku
- Stack Overflow'da ara
- Ya da Seçenek 1'e geçin (GitHub Actions) 😊

---

## 📞 DAHA FAZLA YARDIM

**Detaylı dokümantasyon:**
- [MANUEL_KURULUM_ADIMLARI.md](MANUEL_KURULUM_ADIMLARI.md) - Adım adım rehber
- [SUPABASE_DEPLOYMENT_GUIDE.md](SUPABASE_DEPLOYMENT_GUIDE.md) - Teknik detaylar
- [scripts/README.md](scripts/README.md) - Script kullanımı

**Supabase Dashboard:**
- Ana Panel: https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv
- SQL Editor: https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/editor
- Logs: https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/logs/explorer

---

## 🎉 BAŞARILAR!

**Deployment sonrası ne olacak:**

✅ 42 migration uygulandı
✅ 10 tablo oluşturuldu
✅ 5 storage bucket hazır
✅ 12 Edge Function deploy oldu
✅ RLS policies aktif
✅ Production hazır!

**Sonraki adım:** Mobile app'i test et!

```bash
cd apps/mobile
npm run ios  # veya npm run android
```

---

**⏱️ Toplam Süre:** 5-30 dakika (seçeneğe göre)
**🎯 Zorluk:** Kolay - Orta
**🔒 Güvenlik:** ✅ Fortress-level
**🚀 Production Ready:** ✅ Evet!

**HEMEN BAŞLA!** 💪
