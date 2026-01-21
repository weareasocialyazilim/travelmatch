# Data Exposure Policy (Guest / Free / Paid)

## Guest (anon)

Guest sadece public subset görür:

- moment id
- city_id/city_name (genel)
- title
- cover media (safe)
- price_band (0–30 / 30–100 / 100+)
- category
- obfuscated pin (exact lat/lng yok)

Guest kesinlikle göremez:

- exact lat/lng
- phone/email/PII
- chat/messages
- proof
- contributor list
- ledger detayları
- admin/moderation internal fields

Guest erişimi:

- Sadece allow-list RPC EXECUTE
- Tablolara write yok
- Tablolara select tercihen yok

## Free

- Manual location override: kesin kapalı (server-side enforce)
- Advanced filters: kapalı/limitli (ürün kararına göre)
- İşlemler backend policy ile final karar alır.

## Paid/VIP

- Plan bazlı limitler
- Yine PII minimal
