# Sistem Mimarisi: Lovendo (AI/ML Yok)

## 1. Hedef

Bu doküman; mobil uygulama, admin paneli ve landing’in Supabase üzerinde nasıl bir araya geldiğini,
hangi sınırların nerede olduğunu ve sistemin “neden böyle” tasarlandığını açıklar.

EN note: This is a boundary and responsibility document.

## 2. Bileşenler

- Mobile App (Expo/React Native): Kullanıcı ve creator aksiyonları (tek hesap, çift rol).
- Admin Panel (Next.js): Onay, moderasyon, operasyon ve içerik yönetimi.
- Web Landing (Next.js): Sadece landing + kayıt formu (email/social).
- Supabase:
  - Postgres (core data)
  - Auth (oturum/kimlik)
  - Storage (proof dosyaları vb.)
  - Edge Functions (policy/iş kuralları, idempotent endpoint’ler)
  - Realtime (opsiyonel: admin queue, bildirim akışları)
- Observability:
  - Sentry (error/crash)
  - PostHog (minimal event tracking)

## 3. Katman Sorumlulukları

### 3.1 İstemci (Mobile/Admin/Web)

- UI state + form validation
- Yetki kontrolü “gösterme/gizleme” seviyesinde yapılır, ama güvenlik kaynağı değildir.
- Kritik kurallar (state machine) istemcide değil, backend’de enforce edilir.

### 3.2 Backend (Supabase + Edge Functions)

- Tek gerçek iş kuralları burada yaşar.
- State machine geçişleri burada doğrulanır.
- Idempotency burada uygulanır.
- RLS ile veri erişim sınırları uygulanır.
- Audit log burada tutulur.

## 4. Kimlik ve Rol Modeli

- Tek hesap: Account, hem user hem creator davranabilir.
- Admin rolü ayrı bir yetkidir (role claim/flag).
- Yetkilendirme katmanları:
  1. Auth: kullanıcı giriş yaptı mı?
  2. RLS: bu kaydı görmeye/değiştirmeye yetkisi var mı?
  3. Policy: bu durumda bu aksiyonu yapabilir mi? (state machine)

## 5. State Machine Enforcements

Moment lifecycle geçişleri:

- DB seviyesinde: CHECK constraint +/veya trigger ile korunabilir.
- Service seviyesinde: Edge Function endpoint’lerinde doğrulanır. MVP’de kural: “Her moment için tek
  aktif claim”.

EN note: Enforce transitions; do not rely on client.

## 6. Dosya/Proof Yönetimi (Storage)

- Proof dosyaları Supabase Storage’da tutulur.
- Storage erişimi:
  - Owner: claim sahibi user okur/yazar.
  - Admin: inceleme için okur.
- Dosyalar için:
  - Content-type allowlist
  - Boyut limitleri
  - İndirme linkleri kısa ömürlü (signed URL) olmalı.

## 7. Audit Log ve İzlenebilirlik

- Kritik admin aksiyonları audit_log tablosuna yazılır.
- Observability event’leri minimal ve privacy-safe tutulur:
  - moment_created
  - moment_submitted
  - moment_approved
  - moment_claimed
  - proof_submitted
  - proof_approved / proof_rejected

## 8. Rate Limit / Abuse Koruması

- Edge Functions katmanında basit oran sınırlama (IP + user bazlı).
- Abuse raporları admin queue’ya düşer.
- Restriction uygulanınca RLS/policy üzerinden aksiyonlar engellenir.

## 9. Entegrasyon Kuralları (Secrets)

- Token/key kodda yok.
- Infisical üzerinden runtime secrets.
- CI üzerinden environment secrets.
- Public olarak kabul edilebilir değerler (örn. Supabase URL) yine de env üzerinden geçer.

## Provider Soft-Fail Prensibi

Mapbox / Rekognition / SendGrid / Twilio gibi sağlayıcılar geçici olarak erişilemez olabilir.

- Bu durumda kritik akışlar durmamalı.
- AI taraması başarısız olursa sadece flag üretilemez; moment publish ve proof submit devam eder.
- Email/SMS başarısız olursa kullanıcıya alternatif yol gösterilir.

## 10. AI-Assisted Proof Suspicion Detection

Kullanılan servis:

- AWS Rekognition (veya benzeri) - Opsiyonel

## 10. AI-Assisted Proof Suspicion Detection

Kullanılan servis:

- AWS Rekognition (veya benzeri) - Opsiyonel

Tarama Kapsamı:

- Moment görselleri
- Moment metin içeriği
- Proof asset’leri
- NOT: Mesajlar, profiller ve lokasyon verisi AI tarafından taranmaz.

Tarama Kriterleri:

- Yasaklı içerik
- Şiddet / istismar riski
- Platform kurallarına açık aykırılık
- NOT: Puanlama veya ranking yapılmaz. Sadece risk sinyalidir.

Rolü:

- Proof ve Moment asset’lerini asenkron (background job) analiz eder.
- Şüpheli içerik için sinyal üretir.
- Moment Publish veya Proof Submit akışını bloklamaz.

Sınırlar:

- Veritabanında core state (status) değiştiremez.
- Proof’u onaylayamaz veya reddedemez.
- Moment'ı yayından kaldıramaz (Flag üretir, admin kaldırır).
- Sadece `flag_reason` ve `confidence_score` üretir.

Çıktı:

- Admin queue’ya “AI flagged” bildirimi düşer.
- Creator'a kararsız bilgilendirme gider ("İnceleme altında" etiketi public gösterilmez).

Failover:

- AI servisi opsiyoneldir. Servis çalışmazsa proof ve moment yayın akışı devam eder, sadece AI flag
  üretilmez. AI failure = System failure değildir.

### Moment publish + AI scan non-blocking

Moment publish non-blockingdir. AI scan async:

- publish’i durdurmaz
- failure olursa sistem akışı devam eder
- sadece flag sinyali üretilemeyebilir

### Coin/IAP + coin ledger

Coin satın alımı:

- IAP → coin_transactions(type=purchase)
- Balance ledger:
  - coins_balance
  - pending_balance
- Her hareket coin_transactions ile izlenir (audit/ledger).

### Reviews/Reports moderation

Review ve Report içerikleri moderation kapsamındadır. AI varsa sadece sinyal üretir, karar vermez.

EN note: AI is advisory only. Asynchronous and non-blocking.

## 11. AI/ML Notu

MVP kapsamı boyunca:

- AI ile moderasyon/öneri/sınıflandırma yok.
- Repo’da varsa bile “aktif çalışma yolu”na giremez.

## 12. Business Logic Enforcement (Server-side)

### 12.1 Escrow Enforcement (Server-side)

## Transfer/Escrow enforcement server-side

Direct transfer endpoint’i server-side threshold enforcement uygular:

- 100+ direct transfer BLOCK
- create_escrow_transaction kullanılır

Escrow matris kuralları backend fonksiyonlarıyla enforce edilir.

- 0-30: direct transfer allowed
- 30-100: optional escrow (log + preference)
- 100+: direct transfer BLOCKED; escrow required

Bu kural istemci tarafından bypass edilemez.

EN note: Server-side threshold enforcement.

### 12.2 Contributor Limit Enforcement (3 kişi)

Moments üzerinde max_contributors alanı bulunur:

- NULL: limitsiz
- 3: 100+ moment’lerde uygulanır

Kontrol:

- Gift oluşturma öncesi "can_user_contribute" benzeri bir kontrol fonksiyonu ile yapılır.
- Mevcut contributor ise tekrar katkıya izin verilir.

### 12.3 Chat Unlock (Consent-first)

Chat açılması tier’a göre değişir:

- 0-30: chat yok
- 30-100: host onayı gerekir
- 100+: premium; yine host onayı gerekir

Açılma kararı:

- Sistem kuralları + host onayı ile verilir
- Otomatik “DM açıldı” modeli yoktur

### 12.4 Guest Browse + Enforcement

Guest browse UI üzerinden değil, server-side data exposure kurallarıyla sağlanır.

State-changing her endpoint:

- Auth kontrolü yapar
- Subscription kontrolü yapar
- Aksi halde reddeder

### 12.5 Location Override Policy

Konum override:

- Client doğrudan update edemez
- Policy endpoint üzerinden yapılır
- Plan kontrolü zorunludur

“UI ≠ güvenlik” prensibi esastır. UI'da gizlenen her butonun, backend'de yetki kontrolü olmalıdır.

- 30-100: host onayı gerekir
- 100+: premium; yine host onayı gerekir

Açılma kararı:

- Sistem kuralları + host onayı ile verilir
- Otomatik “DM açıldı” modeli yoktur
