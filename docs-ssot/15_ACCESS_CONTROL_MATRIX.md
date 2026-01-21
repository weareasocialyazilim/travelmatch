# Access Control Matrix (Guest / Basic / PRO / ELITE / Creator-VIP / Admin / Super Admin)

Bu doküman; “Kim neyi yapabilir?” sorusunun TEK OTORİTESİDİR.
Kural: UI gizleme yetmez, backend policy/RLS ile enforce edilir.

---

## 1. Roller

- Guest (login yok)
- Free (login var, abonelik yok)
- Paid (aktif abonelik)
- Creator-VIP (admin ataması)
- Admin (Moderation/ops kararları)
- Super Admin (Admin yönetimi + override)

---

## 2. Temel Ürün Kuralı (Non-Negotiable)

- Guest gezebilir.
- İşlem yapmak için login gerekir.
- Bazı işlemler için ayrıca ücretli üyelik gerekir.
- “Browse serbest, işlem için üyelik”

---

## 3. Aksiyon Matrisi (Özet)

### Discover / Map
- Guest: Görüntüleme
- Free: Görüntüleme + sınırlı filtre
- Paid: Tüm filtreler

### Moment Oluşturma
- Guest: YOK
- Free: Sınırlı (ayda 3 moment)
- Paid: Geniş (Basic 3, PRO 15, Elite Unlimited)
- Creator-VIP: Öncelikli

### Moment Edit
- Sadece moment sahibi
- Edit sonrası otomatik publish + kontrol

### Claim
- Guest: YOK
- Free/Paid: Var (plan kurallarına bağlı)
- Self-claim: ASLA

### Gift / Coin
- Guest: YOK
- Free: Çok sınırlı (ayda 1 gift)
- Paid: Plan limitlerine göre (PRO 10, ELITE unlimited)

Eşik:
- 0–30: Direkt transfer
- 30–100: Opsiyonel escrow
- 100+: Zorunlu escrow + max 3 contributor

### Mesajlaşma / Chat Unlock
- Guest: YOK
- 0–30: YOK
- 30–100: Host onayı
- 100+: Premium + host onayı

### Konum Değiştirme (MANUEL)
- Guest: YOK
- Free: YOK (kesin)
- Paid: Var (limit/cooldown uygulanabilir)

Not: GPS hareketi bu kuralın dışındadır.

### Review / Report
Review:
- Sadece moment sonrası
- Login şart

Report:
- Login şart

### Admin Yetkileri
Admin:
- Moderation
- Flag inceleme
- Restriction

Super Admin:
- Admin yönetimi
- Override
- Policy değişikliği

---

## 4. Limitler (Referans)

Plan limitleri:
- Basic: momentsPerMonth=3, messagesPerDay=20, giftsPerMonth=1, savedMoments=10, photoPerMoment=5
- PRO: momentsPerMonth=15, messagesPerDay=unlimited, giftsPerMonth=10, savedMoments=50, photoPerMoment=10
- ELITE: unlimited (moments/messages/gifts/saved), photoPerMoment=20

PayTR withdrawal commission:
- Basic: %15
- PRO: %10
- ELITE: %5
