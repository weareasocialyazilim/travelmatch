# Location Gating Enforcement (Konum Değiştirme Yetkisi)

Bu doküman, kullanıcıların konum değiştirme (city/location override) yetkisinin membership
paketlerine göre nasıl enforce edileceğini tanımlar.

Amaç:

- UI üzerinden “kapalı” göstermek yetmez.
- Mutlaka server-side enforcement olmalı.
- Bypass edilemez olmalı.

---

## 1) Tanımlar

- CurrentLocation (aktif konum): Discover/Harita/Filtre temel parametresi.
- LocationOverride: Kullanıcının manual olarak seçtiği konum.
- LocationChange: LocationOverride güncelleme aksiyonu.
- Plan Feature: Paketin yetenekleri (konum değiştirebilir mi? limit/cooldown var mı?).

---

## 2) Ürün Kuralı (Non-Negotiable)

- Free/Basic: Kullanıcı konumunu manuel değiştiremez (asla).
- Ücretli planlar: Konum değiştirebilir (plan feature’larına göre limit/cooldown uygulanır).

Not: Kullanıcının GPS konumu değişebilir; bu “manuel değiştirme” değildir. Bu doküman manuel
override’ı kontrol eder.

---

## 3) Yetki Modeli (Server-side)

Konum değiştirme işlemi yalnızca bir server-side “policy endpoint” ile yapılır.

İstemciden doğrudan profile/users update ile konum değiştirme yasaktır.

Kural:

- Client “location_override” alanını doğrudan güncelleyemez.
- RLS/policy bu alanı client update’e kapatır.
- Sadece server-side fonksiyon/endpoint bu alanı set edebilir.

---

## 4) Plan Feature Tasarımı

Plan feature önerisi (minimal ama yeterli):

- can_change_location: boolean
- location_change_cooldown_hours: integer (ör. 72)
- location_change_limit_per_month: integer (ör. 2)

Kurallar:

- Basic için can_change_location=false
- Paid için can_change_location=true
- cooldown ve limit opsiyoneldir ama önerilir

---

## 5) Rate Limit + Abuse Koruması

Konum değiştirme, discovery manipülasyonuna açıktır. Bu yüzden:

- Kişi başı rate limit (ör. 5 dakika içinde 1 değişiklik denemesi)
- Cooldown + aylık limit
- Şüpheli davranışta geçici restriction (location_change_ban) opsiyonel

---

## 6) Audit ve İzlenebilirlik

Her location change denemesi loglanır:

- allowed / denied
- deny reason
- old_city_id → new_city_id
- plan_id
- timestamp

Amaç:

- Support taleplerinde hızlı teşhis
- Abuse analizi
- Plan gating doğrulaması

---

## 7) “GPS Konumu” ile “Manual Override” Ayrımı

- GPS: cihazdan gelen konum, kullanıcının hareketi ile değişir.
- Manual Override: kullanıcının şehir seçerek “şu şehirdeyim” demesi.

Ürün kuralı yalnızca Manual Override’ı kısıtlar. GPS değişimi kısıtlanmaz.

---

## 8) API Kontratı (Öneri)

İstemci → server policy endpoint:

POST /policy/location/set Body:

- city_id (zorunlu)
- lat/lng (opsiyonel, privacy-safe)
- reason: "manual_override"

Response:

- success: true/false
- effective_city_id
- next_allowed_at (cooldown varsa)
- remaining_changes_this_month (limit varsa)
- message (user-safe)

Denied reason örnekleri:

- plan_disallows_location_change
- cooldown_active
- monthly_limit_reached
- restricted

---

## 9) Edge Cases

- Kullanıcı plan yükseltir: anında yetki açılır.
- Kullanıcı plan düşürür: mevcut override korunabilir veya resetlenebilir. Öneri: düşüşte override
  resetlenir ve GPS’e dönülür.
- Kullanıcı hesabı restriction alır: override kapatılır.

---

## 10) Kabul Kriterleri (Acceptance Criteria)

- Basic plan kullanıcı manual location change deneyince server DENY döner.
- UI kapalı olsa bile API çağrısı atılsa bile DENY döner.
- Paid plan kullanıcı: cooldown/limit kuralları doğru çalışır.
- Audit log oluşur.
- Abuse senaryosunda rate limit devrededir.
