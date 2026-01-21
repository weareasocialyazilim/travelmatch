# Guest Browse Implementation (Üye Olmadan Gezinme, İşlem İçin Üyelik)

Bu doküman, “üye olmayan gezinebilir” kuralını ve “işlem yapmak veya bazı detayları görmek için
üyelik zorunlu” kuralını tutarlı ve güvenli şekilde uygular.

Amaç:

- Growth: kullanıcı ürünü görebilsin
- Güvenlik: işlem/PII/özel detaylar korunmalı
- Monetizasyon: paywall doğru yerde çalışmalı
- Bypass engeli: sadece UI ile değil server policy ile

---

## 1) Tanımlar

- Guest: login olmayan kullanıcı
- Logged-in Free: login olmuş ama ücretli aboneliği yok
- Paid: aktif aboneliği olan
- Action: state değiştiren işlem (claim, gift, chat unlock, report, review, location override, save
  vb.)
- Detail Gate: bazı ekran/detayların üyelik/login gerektirmesi

---

## 2) Ürün Kuralı (Non-Negotiable)

- Guest uygulamada gezinebilir: discover, story, card, harita.
- Guest işlem yapamaz.
- Bazı detaylar ve aksiyonlar için login + üyelik gerekir.

Kritik nokta:

- Guest browse, “tam veri erişimi” demek değildir.
- Guest’e gösterilen veri subset olmalıdır.

---

## 3) Data Exposure Politikası (Guest için)

Guest’e açık olabilecek alanlar (örnek):

- moment başlığı/medyası
- şehir/kategori
- genel price band (0–30 / 30–100 / 100+)
- public kısa açıklama
- genel map pin (hassasiyet düşürülmüş)

Guest’e kapalı olabilecek alanlar (örnek):

- creator tam profil detayları (telefon, sosyal, özel bilgiler)
- kesin konum (exact lat/lng)
- chat içerikleri
- gift yapanların listesi
- proof içerikleri
- admin/moderation bilgileri

Kural:

- “Gizli alanlar” asla guest’e gönderilmemeli (server-side select/rls).

---

## 4) UI Akışı (Guest)

Guest navigasyon:

- Discover list
- Story viewer
- Card detay (kısaltılmış)
- Harita (kısaltılmış pin bilgiler)

Guest aksiyon denediğinde:

- Login modal (zorunlu)
- Login sonrası gerekirse paywall

Örnek: Guest “Claim” tıklarsa

1. Login Prompt
2. Login olduysa:
   - Free ise paywall
   - Paid ise devam

---

## 5) Aksiyon Gating Matrisi (Guest / Free / Paid)

Guest:

- View Discover/Story/Card/Map: ALLOW
- View “full detail”: DENY (paywall/login)
- Claim: DENY
- Gift: DENY
- Chat unlock request: DENY
- Report: DENY
- Review: DENY
- Save moment: DENY veya limited (ürün kararına bağlı)
- Location override: DENY

Logged-in Free:

- Browse: ALLOW
- Full detail: ALLOW (ürün kararına bağlı) veya PARTIAL
- Claim/Gift/Chat unlock: plan kurallarına göre (genelde DENY veya paywall)
- Report: ALLOW (login şart)
- Review: ALLOW (moment sonrası şartıyla) veya paywall

Paid:

- Plan limits + tier kurallarıyla ALLOW

Not:

- “Full detail” paywall seviyesi ürün kararına bağlıdır. Öneri: guest’e partial detail, login
  free’ye daha fazla detail, paid’e full.

---

## 6) Server-side Enforcement (Mutlaka)

UI gating yeterli değildir.

Kural:

- State-changing tüm endpoint/RPC’ler auth + subscription kontrolü yapar.
- Guest token yoksa 401/403 ile reddedilir.
- Free ise paywall gerektiren aksiyonlar 402 benzeri “payment_required” yanıtı ile reddedilir.

Bu sayede:

- API direct call ile bypass mümkün olmaz.

---

## 7) Event Tracking (Privacy-safe)

Guest davranışları growth için değerlidir ama privacy-safe olmalı:

Event örnekleri:

- discover_view
- story_open
- card_open
- map_open
- filter_apply
- login_prompt_shown
- paywall_shown

Kural:

- Guest için anon id
- PII yok
- Proof/message içerikleri asla event olmaz

---

## 8) Edge Cases

- Guest bir link ile direkt moment detayına geldi:
  - Partial detail göster
  - “Continue” aksiyonunda login/paywall
- Paid kullanıcı aboneliği bitti:
  - Aksiyonlar paywall’a düşer
  - Browse devam eder
- Abuse:
  - Guest spam denemeleri rate limit ile engellenir

---

## 9) Kabul Kriterleri (Acceptance Criteria)

- Guest discover ve story/carda ulaşabiliyor.
- Guest claim/gift/chat unlock denediğinde login prompt açılıyor.
- Login olmayan kullanıcı hiçbir state-changing endpoint’i kullanamıyor.
- Free plan kullanıcı paywall gerektiren aksiyonda server tarafından reddediliyor.
- Guest’e gönderilen data subset, hassas alanları içermiyor.
