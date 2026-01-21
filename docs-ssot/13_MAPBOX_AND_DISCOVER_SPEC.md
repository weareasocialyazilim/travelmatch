# Mapbox & Discover Spec — Token, Autocomplete, RPC, Marker, Privacy

---

## 1) Mapbox Token Yönetimi

- Token env üzerinden okunur.
- Repo içine token yazılmaz.
- Prod/stage token ayrımı yapılır.

---

## 2) City Autocomplete

- Kullanıcı şehir ararken autocomplete bileşeni kullanılır.
- Seçilen şehir, discover’ın konum input’larına gider.

---

## 3) Nearby Moments RPC Çağrısı

- discoveryService supabase.rpc('discover_nearby_moments', params) çağırır.
- Fallback path mevcut (RPC hata verirse).

---

## 4) Marker Stratejisi (Map UX)

- MVP:
  - Basit marker gösterimi
  - Tap → moment detay
- Ölçek büyüyünce:
  - Pin clustering (grid/quad-tree yaklaşımı)
  - Marker yoğunluğu fazla ise cluster + zoom reveal

Not: Clustering şimdilik UI seviyesinde yapılır; gerekirse server-side tile yaklaşımına geçilir.

---

## 5) Konum Gizliliği

- Kullanıcı konumu minimum doğrulukta kullanılır (yakınlık için).
- Public gösterimde hassasiyet düşürülebilir (örn yuvarlama).
- “Konum değiştirme” plan gating’e tabidir:
  - Free: değiştirilemez
  - Paid: feature’lara göre değişebilir (limit/cooldown)

Not: Bu gating’in kesin enforce noktası backend policy olmalıdır.
