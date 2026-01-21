# Lovendo: Nihai Finansal Model (SSoT)

Bu belge, Lovendo platformunun tüm finansal mimarisini, komisyon yapılarını ve IAP (In-App Purchase) stratejisini tanımlayan "Tek Kaynak" (Single Source of Truth) dökümanıdır.

## 1. Temel Fiyatlandırma Stratejisi
- **Birim:** 1 LVND = 1 Yerel Birim (1 TL, 1 USD, 1 EUR).
- **Mantık:** Kullanıcılar platform içinde "1 Birim" mantığıyla işlem yapar, kur karmaşası yaşanmaz.

## 2. In-App Purchase (IAP) Paketleri
Store vergileri ve platform giderleri fiyata dahil edilmiştir ("Zararsız Giriş" modeli).

| Ürün Adı | Miktar | Son Kullanıcı Fiyatı (TR) |
| :--- | :--- | :--- |
| **100 LVND Paketi** | 100 LVND | 149.99 ₺ |
| **500 LVND Paketi** | 500 LVND | 699.99 ₺ |
| **1000 LVND Paketi** | 1000 LVND | 1399.99 ₺ |

> [!IMPORTANT]
> Apple Small Business Programı sayesinde %30 yerine %15 komisyon kesilir, bu da operasyonel kâr marjını artırır.

## 3. Lovendo Membership (Aylık Abonelik)
Abonelikler, topluluk güvenliğini (TrustScore) artırmak ve içerik üreticilerini (VIP Creators) daha düşük işlem ücretleriyle desteklemek için tasarlanmıştır.

| Üyelik Seviyesi | TR (₺) | ABD ($) | AB (€) |
| :--- | :--- | :--- | :--- |
| **FREE (Standart)** | 0 ₺ | 0 $ | 0 € |
| **PRO (Support)** | 249.99 ₺ | 9.99 $ | 9.99 € |
| **ELITE (VIP)** | 749.99 ₺ | 29.99 $ | 29.99 € |

## 4. Komisyon Yapısı ve Özellikler
Çekim komisyonları, kullanıcının abonelik seviyesine ve TrustScore'una göre optimize edilir.

| Özellik | FREE | PRO | ELITE |
| :--- | :--- | :--- | :--- |
| **Para Çekme Komisyonu** | %15 | %10 | %5 |
| **Aylık Hediye LVND** | - | 50 LVND | 150 LVND |
| **TrustScore Bonusu** | Standart | +25 Puan/Ay | +100 Puan/Ay |
| **LVND Satın Alma İndirimi** | - | %5 İndirim | %10 İndirim |

## 5. VIP Creator "Nakit Çıkış" Senaryosu
**Örnek:** Türkiye'deki bir VIP Creator'a ABD'den 100 LVND ($100 değerinde) hediye geldi.
1. **Dönüşüm:** Sistem anlık kurla bunu 4.500 LVND (TL) yapar.
2. **Çekim (Elite Üye):**
   - Brüt: 4.500 TL
   - Lovendo Komisyonu (%5): 225 TL
   - **Net Payout:** 4.275 TL
3. **Platform Kazancı:** Abonelik geliri + 225 TL işlem komisyonu.

## 6. AML & KYC Politikası
- **Sürtünmesiz Büyüme:** iDenfy kimlik doğrulaması sadece para çekiminde (Withdrawal) zorunludur.
- **Güvenlik:** Tüm büyük işlemler (1.000 birim üstü) manuel onay sürecine tabidir.
