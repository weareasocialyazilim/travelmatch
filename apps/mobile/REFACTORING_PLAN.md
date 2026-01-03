# TravelMatch Mobile Refactoring Plan

Bu döküman, mobil uygulamanın mimari iyileştirmeleri için bir yol haritası sunar.

## ✅ Tamamlanan İyileştirmeler

### 1. Orphan Component Temizliği
- 9 kullanılmayan component silindi
- Testleri de temizlendi
- `components/index.ts` güncellendi

### 2. Navigation Düzeltmeleri
- 11 eksik ekran `AppNavigator.tsx`'e eklendi
- `GetVerified` route kaldırıldı (IdentityVerification kullanılıyor)
- Feature index'leri güncellendi

### 3. Logger Konsolidasyonu
- `production-logger.ts` → `logger.ts`'e birleştirildi
- `measure()` ve `trackAction()` metodları eklendi

### 4. Provider Hell Çözümü
- `ProviderComposer` utility oluşturuldu
- `App.tsx`'e uygulandı (10 seviye → flat array)

---

## 🔄 Planlanan İyileştirmeler (Ayrı PR'lar)

### Öncelik 1: Component Feature Migration
**Risk:** Orta | **Etki:** Yüksek

```
src/components/discover/* → src/features/discover/components/
src/components/profile/* → src/features/profile/components/
src/components/ceremony/* → src/features/proof/components/
```

**Adımlar:**
1. Yeni konumlara dosyaları kopyala
2. Eski index.ts'leri re-export wrapper yap
3. Tüm import'ları güncelle
4. Eski dosyaları sil

### Öncelik 2: Master Component Konsolidasyonu
**Risk:** Yüksek | **Etki:** Yüksek

#### Button Birleştirme
```typescript
// Önceki: 5 ayrı dosya
Button.tsx, TMButton.tsx, HapticButton.tsx, AnimatedButton.tsx, SocialButton.tsx

// Sonraki: 1 master component
TMButton.tsx with variants:
- variant: 'primary' | 'secondary' | 'ghost' | 'social' | 'danger'
- haptic: boolean
- animated: boolean
```

#### Card Birleştirme
```typescript
// Önceki: 18+ card varyantı
// Sonraki: TMCard with variants
TMCard.tsx with:
- variant: 'moment' | 'grid' | 'immersive' | 'profile' | 'gift' | 'wallet'
- interactive: boolean
- skeleton: boolean
```

### Öncelik 3: Service Layer Standardization
**Risk:** Düşük | **Etki:** Orta

```
Mevcut karışık isimlendirme:
- paymentsApi.ts (Api suffix)
- userService.ts (Service suffix)
- imageCDN.ts (No suffix)

Standart:
- Tüm API çağrıları: *Api.ts
- Tüm business logic: *Service.ts
- Tek bir klasör: src/services/
```

### Öncelik 4: Error Handler Façade
**Risk:** Düşük | **Etki:** Orta

```typescript
// Mevcut: 4 ayrı modül
appErrors.ts, errorHandler.ts, errorRecovery.ts, friendlyErrorHandler.ts

// Yeni: Tek façade
GlobalErrorHandler.ts
- captureError(error, context)
- getUserMessage(error)
- getRecoveryAction(error)
- logToSentry(error)
```

---

## 📊 Type System (Mevcut Yapı Doğru)

```
database.types.ts  → Supabase auto-generated (DO NOT EDIT)
         ↓
db.ts              → Type aliases (SINGLE SOURCE OF TRUTH)
         ↓
domain.ts          → Frontend domain types
         ↓
database-manual.ts → Ek manuel tipler
```

Bu hiyerarşi doğru ve korunmalı.

---

## ⚠️ Dikkat Edilmesi Gerekenler

1. **PendingTransactionsModal** - App.tsx'te aktif kullanımda, SİLME
2. **LoadingState, CityAutocomplete, DeleteMomentDialog, TrustRing** - Aktif kullanımda
3. Component taşıma sırasında **import path'leri** dikkatli güncellenmeli
4. Her refactoring için **ayrı branch** ve **küçük PR'lar** önerilir

---

## 🚀 Önerilen Sıralama

1. ✅ Orphan temizliği (Tamamlandı)
2. ✅ Navigation düzeltmeleri (Tamamlandı)
3. ✅ Provider Composer (Tamamlandı)
4. 🔄 Component Feature Migration (Sonraki PR)
5. 🔄 Master Component Consolidation (Ayrı PR'lar)
6. 🔄 Service Standardization (Düşük öncelik)
