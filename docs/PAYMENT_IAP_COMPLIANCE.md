# 💳 Payment IAP Compliance Guide

## ⚠️ APPLE/GOOGLE IAP REQUIREMENT

**ZORUNLU:** Apple'ın In-App Purchase (IAP) veya Google'ın Play Billing sistemini kullanmak
zorunludur. Başka bir ödeme yöntemi (örneğin kredi kartı formu açmak) kural ihlalidir ve uygulamanın
mağazadan kaldırılmasına neden olur.

## 🏗️ Yeni Ödeme Mimarisi

### Para Girişi (PURCHASES) → RevenueCat/IAP

```
Kullanıcı → CoinStoreScreen → RevenueCat SDK → Apple/Google IAP
                                       ↓
                              revenuecat-webhook
                                       ↓
                               handle_coin_transaction RPC
                                       ↓
                               Kullanıcı LVND coin bakiyesi ↑
```

### Para Çıkışı (WITHDRAWALS) → PayTR

```
Kullanıcı → WithdrawScreen → walletService.requestSettlement()
                                       ↓
                               paytr-withdraw Edge Function
                                       ↓
                               PayTR Settlement API
                                       ↓
                               Kullanıcı banka hesabı (TRY)
```

## 📂 Dosya Yapısı

### ✅ AKTİF (Kullanılıyor)

| Dosya                 | Amaç                         |
| --------------------- | ---------------------------- |
| `coinService.ts`      | RevenueCat IAP entegrasyonu  |
| `CoinStoreScreen.tsx` | LVND coin satın alma ekranı  |
| `revenuecat-webhook/` | IAP satın alma webhook'u     |
| `paytr-withdraw/`     | Para çekme (withdrawal)      |
| `walletService.ts`    | Bakiye sorgulama, withdrawal |

### ❌ DEVRE DIŞI (Deprecated)

| Dosya                    | Durum                            |
| ------------------------ | -------------------------------- |
| `paytr-create-payment/`  | 410 Gone döner                   |
| `paytr-tokenize-card/`   | 410 Gone döner                   |
| `paytr-saved-cards/`     | GET için [] döner, diğerleri 410 |
| `PayTRWebViewScreen.tsx` | Navigator'dan kaldırıldı         |
| `PayTRProvider.ts`       | Payment metodları hata fırlatır  |

## 🔄 Akış Değişiklikleri

### Eskiden (❌ Apple Reject)

```
Kullanıcı → OfferBubble → PayTR WebView → Kredi kartı → Ödeme
```

### Şimdi (✅ Apple Approved)

```
Kullanıcı → CoinStoreScreen → RevenueCat → Apple IAP → LVND Coin
         → OfferBubble → LVND Coin Transfer (backend)
```

## 🔐 Güvenlik

### PayTR Credentials

- `PAYTR_MERCHANT_ID` - Sadece withdrawal için
- `PAYTR_MERCHANT_KEY` - Sadece withdrawal için
- `PAYTR_MERCHANT_SALT` - Sadece withdrawal için

Bu credentials hala gerekli çünkü kullanıcılar LVND coin'lerini TRY olarak banka hesaplarına
çekebilirler.

### RevenueCat Credentials

- `REVENUECAT_IOS_KEY` - iOS IAP için
- `REVENUECAT_ANDROID_KEY` - Android IAP için
- `REVENUECAT_WEBHOOK_SECRET` - Webhook doğrulama

## 📋 Kontrol Listesi

- [x] PayTR payment edge functions devre dışı (410 Gone)
- [x] PayTRWebViewScreen navigator'dan kaldırıldı
- [x] OfferBubble WebView modal kaldırıldı
- [x] UnifiedGiftFlowScreen CoinStore'a yönlendiriyor
- [x] PayTRProvider metodları deprecated/hata fırlatıyor
- [x] securePaymentService metodları deprecated işaretli
- [x] RevenueCat webhook aktif ve coin kredileme yapıyor
- [x] Withdrawal (para çekme) hala PayTR üzerinden çalışıyor

## 🚨 Önemli Uyarılar

1. **ASLA** PayTR WebView veya kredi kartı formu açmayın
2. **ASLA** doğrudan ödeme işlemi yapmayın
3. Tüm satın almalar RevenueCat/IAP üzerinden olmalı
4. PayTR SADECE withdrawal (para çıkışı) için kullanılmalı
5. Apple/Google %30 komisyon alacak - bunu fiyatlamaya dahil edin

## 📚 İlgili Dökümanlar

- [09_PAYMENT_CONSTITUTION.md](./docs-ssot/09_PAYMENT_CONSTITUTION.md)
- [RevenueCat iOS Setup](https://docs.revenuecat.com/docs/ios)
- [Apple IAP Guidelines](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase)
- [Google Play Billing](https://developer.android.com/google/play/billing)

---

_Son Güncelleme: January 2026_ _Apple IAP Compliance Migration_
