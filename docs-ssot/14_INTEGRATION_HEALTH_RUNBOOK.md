# Integration Health Runbook (Operasyon El Kitabı)

Bu doküman; Lovendo’daki entegrasyonların çalışma şeklini, güvenli kontrol yöntemini (SAFE MODE),
hata senaryolarını ve incident aksiyonlarını tanımlar.

Önemli: Admin panelindeki Integration Health sayfası “gerçek ping” yapmaz. Sadece entegrasyon
kullanıldığında yazılan log kayıtlarını gösterir.

---

## 1) Entegrasyon Sağlık Modeli (SAFE MODE)

- Sistem “ping atarak” provider doğrulamaz.
- Her provider kullanımı sırasında bir “integration event” loglanır.
- Admin paneli bu logları listeler ve son X dakika/saat içinde hataları görünür kılar.

Amaç:

- Prod ortamda gereksiz dış istek/ping yapmamak
- Gerçek kullanımdan gelen hata sinyallerini izlemek

---

## 2) Entegrasyon Envanteri (ZIP’te görülen)

Admin health enum’unda görülen isimler:

- Supabase
- PayTR
- idenfy
- Twilio
- SendGrid
- PostHog
- Sentry
- OpenAI (kodda enum var; ürün policy’si ayrıca tanımlanmalı)
- Mapbox
- Cloudflare
- Vercel
- Expo Push / Apple Push / Google Push

Not:

- AWS Rekognition: zip’te “health enum” içinde ayrı isim olarak yok; fakat content moderation
  akışının bir parçası. Rekognition/AI flag tarafı ayrı runbook maddesi olarak aşağıda ele alındı.

---

## 3) Sağlık Sinyali Nasıl Üretilir?

Kural:

- Entegrasyon çağrısı yapılan yerde `logIntegrationEvent(...)` çağrısı yapılmalıdır.
- Başarı ve hata olayları ayrı event olarak loglanır.

Örnek olaylar:

- sendgrid_email_sent / sendgrid_error
- twilio_sms_sent / twilio_error
- paytr_withdraw_initiated / paytr_error
- mapbox_geocode_ok / mapbox_error

---

## 4) Incident Playbook (Provider bazlı)

### 4.1 Supabase (Core)

Belirti:

- Auth sorunları, RPC fail, RLS deny, storage upload fail

Kontrol:

- Admin Integration Health logları
- Supabase dashboard logs
- Son migration’lar (db-migrations workflow)

Aksiyon:

1. Son migration deploy’u geri al / hotfix migration
2. RLS policy regresyonu varsa rollback
3. Storage permission hatası varsa bucket policy düzelt

---

### 4.2 Mapbox (Çok kritik)

Belirti:

- City autocomplete sonuç dönmüyor
- Harita yüklenmiyor

Kontrol:

- Token env var var mı?
- Mobile log + integration health log (mapbox)

Aksiyon:

1. Token/secret rotasyonu (Infisical/Vercel/GitHub Secrets)
2. Rate limit: autocomplete isteklerini debounce/throttle
3. Fallback: manuel city input (UI)

---

### 4.3 PayTR Withdraw (Cash-out)

Belirti:

- Withdrawal başlatılamıyor
- Bank hesabı doğrulama hatası

Kontrol:

- paytr-withdraw function logs
- Commission plan mapping (basic/premium/platinum)

Aksiyon:

1. PayTR config/secrets doğrula
2. Commission plan mapping’i teyit et
3. Kullanıcı wallet/coins_balance tutarlılığı

---

### 4.4 idenfy (KYC)

Belirti:

- KYC token alınamıyor
- webhook gelmiyor

Kontrol:

- get-idenfy-token function logs
- idenfy-webhook function logs

Aksiyon:

1. Provider credentials (Infisical) doğrula
2. Webhook secret doğrula
3. Status update akışını kontrol et

---

### 4.5 Twilio (SMS/OTP)

Belirti:

- SMS gitmiyor / rate limit
- Ülke bazlı gönderim hatası

Kontrol:

- Twilio service logs
- twilio-sms edge function logs
- E2E test var mı?

Aksiyon:

1. Rate limit (guard middleware)
2. Abuse durumunda kullanıcı blokla
3. Fallback: email OTP (SendGrid)

---

### 4.6 SendGrid (Email)

Belirti:

- Transactional email gönderilemiyor
- Webhook bounce/complaint akmıyor

Kontrol:

- sendgrid-email function logs
- sendgrid-webhook logs

Aksiyon:

1. API key doğrula
2. Template id/doğrulama
3. Webhook signature doğrula

---

### 4.7 Sentry / PostHog

Belirti:

- Error spike
- Event kaybı

Kontrol:

- Sentry issue list
- PostHog ingestion

Aksiyon:

1. PII scrub kontrolü
2. Event volume kontrolü (fazla event kapat)
3. Release tag doğruluğu

---

## 5) Rekognition / AI Flag (Non-blocking)

Kural:

- AI karar vermez; sadece flag üretir.
- Moment publish/proof submit akışını bloklamaz.
- AI failure “soft-fail” olmalı: sadece flag üretilmez.

Operasyon:

- Flag oranı artarsa: threshold/policy gözden geçirilir.
- False positive artarsa: admin kararları üzerinden tuning yapılır.

---

## 6) Secrets Yönetimi (Infisical)

Kural:

- Repo’da secret yok.
- Secrets rotasyonu Infisical → CI/CD üzerinden yapılır.

Aksiyon:

- Yeni secret: Infisical’ta oluştur, CI secrets update script çalıştır.
- Leak: derhal rotate + audit.

---

## 7) Minimum “Release Sonrası Kontrol” Checklist

- Supabase RPC (discover) çalışıyor mu?
- Mapbox autocomplete + map render çalışıyor mu?
- PayTR withdraw (test user) çalışıyor mu?
- Twilio/SendGrid basic send çalışıyor mu?
- Sentry error rate normal mi?
- PostHog event akışı normal mi?
