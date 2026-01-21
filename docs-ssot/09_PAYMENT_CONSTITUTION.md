# 09_PAYMENT_CONSTITUTION.md (Lovendo Finansal Anayasası)

**Amaç ve Kapsam**

Bu doküman, Lovendo platformundaki tüm değer transferi, ödeme, coin, escrow, komisyon, limit ve KYC
kurallarının tek ve bağlayıcı kaynağıdır.

Bu dokümanda yazan kurallar:

- Ürün davranışını belirler
- Backend tarafından enforce edilir
- UI tarafından override edilemez
- Admin dahil herkes için geçerlidir (Super Admin override hariç)

## 1. Temel İlkeler (Non-Negotiables)

- Kullanıcıya nakit çıkışı yoktur (cash-out yok).
- Fiziksel ürün ve kargo yoktur.
- Tüm değer transferleri coin bazlıdır.
- Coin, platform içi bir değer birimidir; para değildir.
- Escrow kuralları backend tarafından zorunlu şekilde uygulanır.
- Kullanıcı kendisine değer transferi yapamaz.
- Finansal akışlar geri dönülmez audit log ile izlenir.

## 2. Coin Sistemi

### 2.1 Coin Tanımı

- Coin, Lovendo içindeki tek değer transferi aracıdır.
- Coin, uygulama içi satın alma (IAP) veya platform içi kazanım ile elde edilir.
- Coin, kullanıcılar arasında aktarılabilir; ancak nakde çevrilemez.

### 2.2 Coin Bakiyeleri

Her kullanıcı için:

- **Available Balance:** Kullanılabilir coin
- **Pending Balance:** Escrow altında tutulan coin

Bu iki bakiye birbirinden ayrıdır ve birlikte kullanılmaz.

## 3. Değer Transferi Türleri

### 3.1 Direct Transfer (Escrow’suz)

Aşağıdaki koşullarda doğrudan transfer mümkündür:

- Transfer tutarı 0 – 30 aralığında ise
- Transfer tutarı 30 – 100 aralığında ise ve escrow opsiyonu kullanılmamışsa

Bu işlemler:

- Anında gerçekleşir
- Geri alınamaz
- Audit log’a yazılır

## 4. Escrow Sistemi (Zorunlu Kurallar)

### 4.1 Escrow Eşik Matrisi (Bağlayıcı)

| Tutar Aralığı    | Escrow Durumu |
| :--------------- | :------------ |
| **0 – 30**       | Escrow yok    |
| **30 – 100**     | Opsiyonel     |
| **100 ve üzeri** | **ZORUNLU**   |

Bu kural istisnasızdır.

### 4.2 100+ Moment Özel Kuralları

100 ve üzeri tutara sahip moment’lerde:

- Escrow zorunludur
- Maksimum 3 benzersiz contributor olabilir
- Aynı contributor birden fazla transfer yapabilir
- Contributor sayısı, benzersiz kullanıcı bazlı hesaplanır
- Limit dolduğunda yeni contributor kabul edilmez

## 5. Escrow Yaşam Döngüsü

Bir escrow işlemi şu durumlardan geçer:

- **Pending:** Coin escrow altında
- **Released:** Koşullar sağlandı, coin karşı tarafa geçti
- **Refunded:** Koşul sağlanmadı, coin iade edildi
- **Expired:** Süre aşıldı
- **Cancelled:** Sistem veya admin kararıyla iptal

Escrow çözülme koşulları:

- Proof kabulü
- Zaman aşımı
- Admin / Super Admin kararı

## 6. Komisyon Sistemi

Platform, plan bazlı komisyon uygular. Örnek yapı (temsilidir, plan dosyası belirler):

- Free / Basic: %15
- Paid / Pro: %10
- Elite / VIP: %5

Komisyon:

- Escrow release anında hesaplanır
- Kullanıcı bakiyesinden değil, işlemden düşülür
- Audit log’da ayrı kalem olarak tutulur

## 7. Limitler ve Koruma Mekanizmaları

### 7.1 Kullanıcı Bazlı Limitler

- Günlük / aylık transfer limitleri
- Plan bazlı kısıtlar
- Şüpheli davranış tespiti

### 7.2 Abuse & Fraud Önlemleri

Aşağıdaki durumlarda işlem durdurulabilir:

- Çok kısa sürede çok sayıda transfer
- Tek yönlü şüpheli akışlar
- Sistem tarafından riskli işaretlenen davranışlar

Bu durumda:

- İşlem reddedilir
- Kullanıcı bilgilendirilir
- Gerekirse KYC tetiklenir

## 8. KYC (Know Your Customer)

KYC:

- Her kullanıcı için varsayılan zorunlu değildir
- Limit artışı, yüksek tutar, şüpheli davranış gibi durumlarda tetiklenir

KYC prensipleri:

- Hassas veri platformda saklanmaz
- Sadece token / referans / hash tutulur
- KYC sonucu sadece “status” olarak işlenir

## 9. Withdrawal (Platform → Kullanıcı)

Lovendo:

- Kullanıcıya doğrudan para ödemez
- Withdrawal yalnızca platform tarafından tanımlı özel akışlarda mümkündür
- Bu akışlar istisnai ve kontrollüdür

Withdrawal:

- KYC zorunlu olabilir
- Komisyon ve limitlere tabidir
- Admin/Super Admin onayı gerektirebilir

## 10. Yetki ve Override

- Admin, finansal işlemi doğrudan gerçekleştiremez
- Admin yalnızca inceleme başlatabilir

Sadece Super Admin:

- Escrow override
- Refund zorlaması
- Limit resetleme yapabilir

Tüm override işlemleri:

- Geri alınamaz
- Ayrı audit kaydı oluşturur

## 11. Denetim ve Audit

- Tüm işlemler immutable audit log’a yazılır
- Log’lar silinemez
- Log’lar değiştirilemez
- Finansal inceleme için saklanır
