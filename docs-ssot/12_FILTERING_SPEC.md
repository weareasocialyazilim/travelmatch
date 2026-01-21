# Filtering Spec (Discover) — Parametreler, Öncelik, Gating, Performans

## 1. Kapsam ve Amaç

Bu doküman Discover/Map filtreleme sisteminin

- hangi parametreleri desteklediğini
- hangi öncelikle uygulandığını
- membership (plan) bazlı gating kurallarını
- performans ve abuse önlemlerini tanımlar.

Filtreleme server-side uygulanır. UI tek başına otorite değildir.

---

## 2. Zorunlu Alanlar (Registration & Discover)

Zorunlu Alanlar:

- Gender (kayıtta zorunlu)
- Birth year / age range (privacy-safe)

Not:

- Gender bilgisi Discover filtrelerinin temelidir.
- Gender olmadan Discover sonuçları üretilmez.

---

## 3. Filtre Parametreleri (Server-side)

Temel Parametreler:

- location (lat/lng veya city_id)
- radius_km
- gender
- age_range (min_age, max_age)
- category
- price_band (0–30 / 30–100 / 100+)
- date_range
- moment_status (active varsayılan)

Tüm parametreler opsiyonel değildir; bazıları plan ve role göre zorunlu hale gelir.

---

## 4. Filtre Öncelik Sırası (Performans için)

Uygulama sırası:

1. moment_status = active
2. location + radius (coğrafi daraltma)
3. gender
4. age_range
5. price_band
6. category
7. date_range
8. pagination (cursor-based)

Bu sıra performans ve doğruluk için zorunludur.

---

## 5. Membership Bazlı Filtre Gating

Guest:

- Basic filtreler
- Sabit radius (küçük)
- Gelişmiş kombinasyonlar kapalı

Free (Login):

- Gender + age
- Sınırlı radius
- Sınırlı kategori

Paid:

- Geniş radius
- Çoklu kategori kombinasyonu
- Price band + tarih kombinasyonları

---

## 6. Guest vs Logged-in Veri Derinliği

Guest:

- Özet sonuçlar
- Kısıtlı detay
- Exact konum yok

Logged-in:

- Daha fazla detay
- Ama işlem için yine plan kuralları geçerli

---

## 7. Abuse & Manipülasyon Önlemleri

- Aşırı filtre değiştirme rate limitlenir
- Sık konum değiştirme tespit edilirse geçici kısıtlama uygulanabilir
- Bot davranışları tespit edilirse Discover sonuçları düşürülebilir

---

## 8. Performans Prensipleri

- Offset pagination YOK
- Cursor-based pagination ZORUNLU
- Tek RPC çağrısı ile Discover
- Gereksiz join yok
