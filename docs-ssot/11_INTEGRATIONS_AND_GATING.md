# Entegrasyonlar ve Gating Kuralları (SSoT)

Bu doküman; Lovendo’nun tüm entegrasyonlarını, çalışma sınırlarını, kritik env/secrets kurallarını
ve membership (plan) bazlı gating kurallarını tanımlar.

Kural: Doküman koda uymuyorsa doküman yanlıştır.

---

## 1. Entegrasyon Envanteri (Integration Inventory)

### 1.1 Supabase (Core)

Kaynak:

- Postgres (ana veri)
- RLS (yetkilendirme)
- Storage (proof, moment media)
- Edge Functions / RPC (discover, policy enforcement)
- Realtime (opsiyonel)

Kritik kurallar:

- RLS default deny
- Kritik state değişimleri client’tan değil, policy endpoint/RPC’den
- Audit log immutable
- Client doğrudan kritik tablo yazamaz
- RPC = iş kurallarının merkezi

---

### 1.2 Mapbox (Çok önemli)

Kullanım:

- Şehir arama ve autocomplete (Geocoding)
- Harita üzerinde moment keşfi (markers/pins)

Kurallar:

- Kullanıcı konumu değişebilir (gating’e tabidir)
- Harita keşfi, filtrelerle birlikte çalışır
- Konum doğruluğu ve gizlilik: minimum gerekli hassasiyet
- Autocomplete debounce edilir
- Token rotate edilebilir
- Harita pin yoğunluğu cluster ile yönetilir

---

### 1.3 AWS (Rekognition dahil)

Kullanım:

- Moment media ve Proof asset’leri üzerinde AI tarama (risk/şüphe sinyali)
- Karar verici değildir, bloklayıcı değildir

Kurallar:

- Publish akışını durdurmaz
- AI taraması başarısız olursa akış devam eder
- AI sadece flag üretir; state değiştiremez

---

### 1.4 Cloudflare

Kullanım:

- DNS
- WAF / basic protection (opsiyonel)
- Caching (landing/admin/web için opsiyonel)

Kurallar:

- Cloudflare sadece edge katmanıdır; auth/rls yerini tutmaz.

---

### 1.5 Vercel

Kullanım:

- Admin panel deploy
- Web landing deploy
- Preview deployments (QA)

Kurallar:

- Env değişiklikleri önce preview sonra prod
- Secrets: Vercel env + Infisical (gerekli ayrım yapılır)

---

### 1.6 Infisical (Secrets)

Kullanım:

- API keys, provider secrets, webhook secret’ları

Kurallar:

- Repo’da token/key yok
- CI ve runtime secrets sadece Infisical/Vercel/GitHub Actions üzerinden

---

### 1.7 Sentry

Kullanım:

- Mobile crash/error
- Admin/Web error monitoring

Kurallar:

- PII loglanmaz
- Sentry event’leri minimal ve scrub edilmiş

---

### 1.8 PostHog

Kullanım:

- Minimal event tracking (discover, moment_view, filter_apply, chat_unlock_request, gift_created
  vb.)

Kurallar:

- Proof içeriği / mesaj içeriği analitiğe gönderilmez
- User identifiers privacy-safe

---

### 1.9 SendGrid

Kullanım:

- E-posta (onboarding, invite, transactional)

Kurallar:

- Bounce/complaint yönetimi
- Rate limit ve template yönetimi

---

### 1.10 Twilio

Kullanım:

- SMS doğrulama / OTP (varsa)
- Kritik doğrulama akışları

Kurallar:

- OTP loglanmaz
- Abuse rate limit uygulanır

---

### 1.11 PayTR / IAP / Coin

Kullanım:

- Coin satın alımı (Store IAP)
- Para/coin transferi ve escrow enforcement

Kurallar:

- Eşik kuralları server-side enforce edilir (0–30 / 30–100 / 100+)
- 100+ moment’lerde max 3 unique contributor
- Cash-out yok (kullanıcıya para çıkışı yok)

---

### 1.12 KYC

Kullanım:

- Yüksek riskli aksiyonlar için doğrulama
- “Zero sensitive data” prensibi

Kurallar:

- KYC provider token/hash saklanır; hassas veri saklanmaz
- KYC status’u profile/subscription risk policy ile birleşebilir

---

## 2. Membership Gating (Plan Bazlı Yetkiler)

Kaynak:

- plans (features json)
- subscriptions (plan_id, status)

Kural:

- Gating hem UI’da hem backend policy’de enforce edilir.
- UI gizleme tek başına yeterli değildir.

### 2.1 Konum Değiştirme (Çok kritik)

- Free plan: Kullanıcı konumunu manuel değiştiremez.
- Ücretli planlar: Plan özelliklerine göre konum değiştirilebilir.
- Konum değiştirmenin bir “cooldown”ı ve/veya aylık limitleri olabilir (plan features ile).

Backend enforce:

- update_profile_location / set_user_location endpoint’i plan kontrolü yapmadan işlem yapamaz.

### 2.2 Discover Filtreleri

- Free plan: temel filtreler
- Ücretli planlar: gelişmiş filtreler (örn. daha geniş mesafe, daha fazla kategori kombinasyonu,
  daha detaylı arama)

### 2.3 Mesajlaşma / Chat Unlock

Tier bazlı (ürün kuralı):

- 0–30: chat unlock görünmez
- 30–100: host onayı ile
- 100+: premium + host onayı

---

## 3. Filtreleme Sistemi (SSoT)

Filtreler:

- city / location
- distance (plan gating’e tabidir)
- category (experience_type)
- moment status (active/full/completed/cancelled)
- price band (0–30 / 30–100 / 100+)
- date / time window
- gender (kayıtta zorunlu; filtrede zorunlu seçenek)

Not:

- Gender alanı kayıt sırasında zorunludur.
- Filtre “gender preference” olarak çalışır (kimin içerikleri görülecek).

---

## 4. Moment Sunumu: Story + Card (Çift Format)

Kaynak:

- StoriesRow, StoryItem, StoryViewer (discover)
- MomentCard varyantları (card feed/grid)

Kural:

- Aynı moment aynı data modelden beslenir.
- Story görünümü: hızlı tüketim, media-first
- Card görünümü: detay ve CTA (gift/claim/chat unlock)

Edit/Publish:

- Moment editlenirse hem story hem card görünümü aynı anda güncellenir.
- Edit sonrası AI taraması tekrar çalışır; flag oluşursa admin queue’ya düşer.

---

## 5. Entegrasyon Sağlık Kontrolleri (Operational Checks)

Her release sonrası kontrol:

- Supabase RLS testleri çalışıyor mu?
- Mapbox token çalışıyor mu?
- Rekognition çağrıları timeout yaparsa akış bozuluyor mu?
- SendGrid/Twilio provider hataları kullanıcı akışını kırıyor mu?
- Sentry error rate normal mi?
- PostHog event hacmi ve privacy safe mi?

Kural:

- Provider down senaryosu “soft fail” olmalı (kritik akışlar çalışmaya devam etmeli).
