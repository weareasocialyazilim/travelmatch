# Yol Haritası (AI’siz)

Bu yol haritası; Lovendo’nun AI/ML kullanmadan nasıl evrileceğini tanımlar. AI konusu bilinçli
olarak kapsam dışıdır.

---

## 1. MVP (Şu anki hedef)

Odak:

- Experience-only model
- Moment → Claim → Proof → Admin onay akışı
- Sağlam RLS ve admin operasyonları

Var:

- Tek hesap, çift rol (user/creator)
- Tek aktif claim
- Manuel proof doğrulama
- Admin queue’lar

Yok:

- AI/ML
- Nakit / payout
- Kargo
- Swipe/like
- Otomatik öneri

---

## 2. Beta (Operasyonel Güçlendirme)

Hedef:

- Daha az admin yükü, daha net kurallar

Eklenebilecekler:

- Daha detaylı policy’ler (proof tekrar sayısı vb.)
- Admin dashboard’ta operasyonel metrikler
- Creator-VIP kurallarının netleşmesi
- Abuse tespiti için kural bazlı limitler

Hâlâ yok:

- AI/ML
- Otomatik moderasyon
- Öneri motoru

EN note: Rules over intelligence.

---

## 3. Public Release (Ölçeklenebilirlik)

Hedef:

- Daha fazla şehir
- Daha fazla experience type
- Daha fazla kullanıcı

Odak:

- Performans
- Stabilite
- Operasyonel otomasyon (kural bazlı)

Örnek:

- “X günde Y kez proof rejected” → otomatik geçici restriction (Bu bir kuraldır, AI değildir.)

---

## 4. Bilinçli Olarak Yapılmayacaklar

Bu liste, “neden yok?” sorusuna cevaptır:

- AI ile içerik üretimi
- AI ile proof doğrulama
- AI ile kullanıcı puanlama
- Nakit ödeme sistemleri
- Kargo / fulfillment
- Swipe/like feed’ler
- Marketplace benzeri ürün satışı

---

## 5. AI Gündeme Gelirse (İleride)

AI tekrar değerlendirilecekse:

- Ayrı bir PRD
- Ayrı bir Architecture dokümanı
- Ayrı bir Risk & Ethics dokümanı

Mevcut SSoT değişmeden kalır.

EN note: AI must be an explicit opt-in redesign, not an incremental add-on.

---

## 6. Yol Haritası Prensipleri

- Önce ürün kanunları
- Sonra operasyon
- En son ölçek

Hız değil, doğruluk önceliklidir.
