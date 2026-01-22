# PRD: Lovendo (Experience-Only, No Cash, No Shipping)

> ⚠️ **IAP Uyumluluk Notu**
>
> - Kullanıcıdan kullanıcıya para/coin transferi devre dışıdır.
> - Kredi kartı / web ödeme akışları kaldırılmıştır.
> - Tüm satın almalar RevenueCat/IAP üzerinden yapılır.
> - PayTR yalnızca para çekme (withdrawal) için kullanılır.

## 1. Amaç ve Vizyon

Lovendo; insanların gerçek hayatta, belirli bir şehirde gerçekleşen deneyimleri (experience)
planlayıp tüketmesini kolaylaştıran bir platformdur. Platform “dijital öneri” üretmez; gerçek
dünyada tüketilen bir deneyimin planlanmasını, doğrulanmasını (proof) ve operasyonunu yönetir.

EN note: The product is a real-world experience orchestration system, not a content recommendation
engine.

## 2. Kapsam Dışı (Explicit Non-Goals)

- AI/ML tabanlı öneri, sınıflandırma, görüntü tanıma, otomatik moderasyon yok.
- Nakit transferi / kullanıcıya para iadesi / cash-out yok.
- Kargo / fiziksel ürün teslimatı yok.
- Swipe/like tabanlı feed yok.
- “Her şehirde her şey” yok; MVP’de kontrollü kapsam ve operasyon.

## 3. Kullanıcı Tipleri (Actors)

Not: Lovendo’da tek bir hesap, hem “user” hem “creator” rolünde davranabilir. Rol, kullanıcı
aksiyonuna göre belirlenir. (EN note: Single account, dual role by action.)

- User (Tüketici modu): Deneyimi tüketen ve claim/proof yapan taraf.
- Creator (Oluşturucu modu): Moment oluşturan ve yayınlayan taraf.
- Admin: Onay, moderasyon, operasyon, içerik yönetimi.
- Creator-VIP (opsiyonel): Admin tarafından tanımlanan üst seviye creator; ayrı kurallar olabilir.

## 4. Temel Kavramlar (High-Level)

- Experience: Yerinde tüketilen ürün/hizmet (kahvaltı, müze bileti, etkinlik girişi vb.)
- Moment: Experience tüketimi için oluşturulan plan/çağrı/akış nesnesi.
- Proof: Deneyimin gerçekleştiğini doğrulayan kanıt seti (manüel, kural bazlı).
- Claim: Bir moment için “ben bunu tüketiyorum/üstleniyorum” aksiyonu.

## 5. Ürün Kanunları

1. Nakit yok. Kullanıcıya para çıkışı yok.
2. Kargo yok.
3. Sadece yerinde tüketilen experience var.
4. Swipe/like yok.
5. AI/ML yok.
6. AI, karar verici değildir. AI yalnızca proof içeriklerinde şüphe sinyali üretebilir. Nihai
   onay/red yetkisi her zaman Admin veya Super Admin’dedir.

EN note: AI-assisted detection, human final decision.

## 6. MVP Kapsamı (IN)

### 6.1 Moment oluşturma

- Creator bir şehir seçer.
- Experience türü seçilir (kategori bazlı).
- Zaman aralığı / koşullar belirlenir.
- Moment yayınlanır (durum: Draft -> Submitted).

### 6.1.1 Proof inceleme sürecinde AI destekli şüphe tespiti (opsiyonel):

- Sadece flag üretir
- Otomatik onay veya red yapmaz
- Admin queue’ya bildirim düşer

### 6.2 Claim ve tüketim akışı

## Claim Kuralları

- Claim bir moment’e katılım/consume niyetidir.
- Aynı kullanıcı için aynı anda birden fazla aktif claim kuralı backend tarafından enforce edilir.
- Claim → consumed/proof süreci claim lifecycle’ının parçasıdır.

Self-rule:

- Kullanıcı kendi moment’ini claim edemez.

- User bir moment’i claim eder (durum: Claimed).
- Tüketim gerçekleşir (durum: Consumed).
- Proof toplanır ve admin onayına düşer (durum: ProofSubmitted).

### 6.3 Admin operasyon akışları

- Moment onayı (Submitted -> Approved/Rejected)
- Proof inceleme (ProofSubmitted -> ProofApproved/ProofRejected)
- Moderation/abuse akışı
- Şehir, mekan, kategori, kurallar yönetimi

### 6.4 Güvenlik ve uyum

## KYC ve Güvenlik

- KYC; para çekim/limit artırma gibi yüksek riskli aksiyonlarda zorunlu hale gelebilir.
- Sistem "zero sensitive data" prensibiyle çalışır:
  - Token / hash / masked saklanır
  - Kart numarası, CVV gibi hassas veriler saklanmaz
- KYC sağlayıcısı sadece referans/işlem id’leriyle tutulur.

- Supabase RLS ile veri erişimi.
- Audit log (kritik aksiyonlar).
- Rate limit ve abuse koruması (kural bazlı).

## Arkadaş Davet Etme

- Kullanıcı, davet linki veya contact invite akışlarıyla arkadaş davet edebilir.
- Referral/Invite metrikleri ve kampanyalar admin tarafından yönetilebilir.

### 6.5 Escrow ve Hediye (Gift) Kuralları (Çekirdek)

## Ödeme & Coin & Escrow (Kritik)

Coin:

- Uygulama içi değer transferi "coin" üzerinden yürür.
- Coin satın alımı App Store/Play Store IAP ürünleriyle yapılır.
- Coin hareketleri coin_transactions ile kayıt altındadır.

Escrow Matrix (Titan Plan v2.0):

- 0–30: Direkt transfer serbest (escrow yok).
- 30–100: Escrow opsiyonel.
- 100+: Direkt transfer BLOKLU. Escrow zorunlu.

100+ özel kural:

- Sadece 100+ moment’lerde “maksimum 3 benzersiz contributor” kuralı uygulanır.
- Aynı contributor tekrar katkı yapabilir; limit benzersiz contributor sayısınadır.

Self-rule:

- Giver ≠ receiver (kendine transfer yok).

Lovendo’da hediye/katkı akışında escrow koruması tier bazlı çalışır.

Escrow Matrix (0-30-30-100-100+):

- 0 - 30: Direkt ödeme mümkün. Escrow yok.
- 30 - 100: Escrow opsiyonel (kullanıcı tercihi, sistem loglar).
- 100 ve üzeri: Escrow zorunlu. Direkt transfer engellenir.

EN note: Threshold enforcement is server-side and cannot be bypassed.

## Mesajlaşma ve Chat Unlock (Consent-first)

- 0–30: Chat unlock butonu görünmez, mesajlaşma yok.
- 30–100: "Sohbeti Başlat" butonu görünür, Host onayı gerekir.
- 100+: Premium "Sohbeti Başlat", yine Host onayı gerekir.

Not:

- Swipe/like yok; chat unlock açık rıza adımıdır.

Ek Kural (100+ için):

- Bir moment’e "katkı veren kişi sayısı" üst limiti sadece 100 ve üzerindeki moment’lerde uygulanır.
- 100+ moment’lerde maksimum 3 benzersiz contributor (katkı sağlayan) olabilir.
- Aynı contributor tekrar katkı yapabilir; limit yalnızca "benzersiz contributor" içindir.

### 6.6 Mesajlaşma ve Sohbet Kilidi Açma (Consent-first)

Lovendo’da sohbet, hediye tier’larına göre açılır. Amaç "rıza" adımını netleştirmektir (swipe/like
yok).

Tier Kuralları:

- 0 - 30: Chat yok. Sadece teşekkür/yanıt mekanikleri.
- 30 - 100: "Sohbeti Başlat" aday. Host (moment sahibi/receiver) onayı gerekir.
- 100 ve üzeri: Premium teklif. Yine host onayı gerekir.

Bonus Kuralı (opsiyonel):

- İstenen miktarın belirli oran üstü (örn. %20) gönderilirse erken chat unlock tetiklenebilir.

EN note: Chat unlock is explicit consent, not automatic messaging.

### 6.7 Harita, Filtre ve Keşif

## Keşif: Harita + Liste + Filtre

- Moment’lar harita ve liste üzerinde keşfedilir.
- Filtreler (MVP):
  - Şehir/konum (location)

## Moment Sonrası Yorum (Review)

- Yorum/puan, yalnızca moment sonrası bırakılabilir.
- 1 moment için 1 reviewer kuralı geçerlidir.
- Review, abuse/moderation kapsamındadır.

## Report (Şikayet) Sistemi

- Kullanıcılar moment, mesaj veya kullanıcıyı report edebilir.
- Report’lar moderation queue’ya düşer.
- Nihai karar admin/super admin’dedir.

MVP’de klasik yorum/rating akışı yerine: - Fiyat bandı (0–30 / 30–100 / 100+)

- Durum (active / full / completed / cancelled)
- Tarih (date)
- Harita pin’i → moment detayına götürür.
- Konum gizliliği: hassas veriler minimumda tutulur, sadece gerekli doğrulukta gösterilir.

### 6.8 Yorum/Teşekkür Mekaniği (MVP)

### 6.9 Konum Değiştirme (Membership Gating)

- Kullanıcılar konum değiştirebilir; ancak bu yetki plan özelliklerine bağlıdır.
- Free plan: konum manuel değiştirilemez.
- Ücretli planlar: plan feature’larına göre (limit/cooldown olabilir).

Kural: Bu kontrol backend policy’de zorunlu şekilde enforce edilir.

### 6.10 Moment Sunumu: Story + Card

- Moment’lar Discover’da iki formatta sunulur:
  - Story formatı (media-first hızlı tüketim)
  - Card formatı (detay + aksiyonlar)
- Her iki görünüm de aynı moment kaydını kullanır.
- Moment edit sonrası her iki görünüm güncellenir ve AI taraması tekrar çalışır.

### 6.11 Filtreleme (Kritik)

Filtreler:

- Gender (kayıtta zorunlu; filtrede de bulunur)
- Şehir/konum
- Mesafe (plan bazlı)
- Kategori
- Fiyat bandı (0–30 / 30–100 / 100+)
- Durum (active/full/completed/cancelled)
- Tarih/zaman

Not: Filtreleme performansı için server-side query/RPC tercih edilir.

MVP’de klasik yorum/rating akışı yerine:

- Hediye/katkı mesajı (gift message)
- Toplu teşekkür (bulk thank you) mekanikleri vardır.

Not:

- Bu mekanikler moderation kapsamına girer.
- İçerik AI taramasından geçebilir (karar verici değildir).

## 7. MVP Kapsamı (OUT)

- Öneri motoru, otomatik içerik üretimi, görüntü tanıma
- Ödeme/payout/cash-out
- Kargo, adres, teslimat
- Swipe/like feed
- Komple “Marketplace” modeli

## 8. Kullanıcı Akışları (User Flows)

### 8.1 Moment Lifecycle (özet)

Draft -> Published -> [AI Scan] -> (Flagged | Suspended) Published -> Claimed -> Consumed ->
ProofSubmitted -> (ProofApproved | ProofRejected) -> Closed

EN note: This is a state machine and must be implemented as such.

## Moment Durumları (DB ile birebir)

- draft
- active
- full
- completed
- cancelled

Not:

- Flag, ayrı bir "risk sinyali"dir; moment status’ünü tek başına değiştirmez.

### 8.2 Edge Case’ler (MVP)

- Claim sonrası iptal (policy: allowed/not allowed)
- Aynı moment’e birden fazla claim denemesi (idempotency)
- ProofRejected sonrası yeniden gönderim
- Abuse raporu ve geçici kısıtlar

### 8.3 Moment Publish ve Edit (Default Allow, Exception Review)

- Moment oluşturulur ve publish edilir. Admin onayı beklemez.
- Publish sonrası AI taraması asenkron çalışır.
- Kritik risk/şüphe tespit edilirse moment "flag" olarak admin paneline düşer.
- Admin aksiyon almadıkça moment yayında kalır.

Edit:

- Published moment editlenebilir.
- Her edit anında yayına girer ve aynı AI taramasından tekrar geçer.
- Kritik flag oluşursa tekrar admin queue’ya düşer.

EN note: Publish is non-blocking; moderation is exception-driven.

## 9. Ürün Kuralları (Policy)

- “Yerinde tüketim” tanımı: fiziksel konumda gerçekleşen hizmet/ürün.
- Proof kriterleri: AI yok; kural bazlı ve admin doğrulamalı.
- Creator-VIP ayrıcalıkları: sadece admin tanımıyla aktif.

## 10. Başarı Kriterleri (MVP)

- Moment oluşturma -> proof onayına kadar uçtan uca akışın sorunsuz çalışması
- Admin queue’ların yönetilebilir olması
- Abuse ve yetkisiz erişim vakalarının minimum olması (RLS + audit)

## 11. İzleme (Observability)

- Sentry: crash/error
- PostHog: temel event’ler (moment_created, moment_claimed, proof_submitted, proof_approved)

EN note: Keep events minimal and privacy-safe.

## 12. Açık Kararlar (Decision Log)

Bu bölüm, yeni kararları kısa maddelerle kaydeder. Her karar için tarih ve etkisi eklenir.
