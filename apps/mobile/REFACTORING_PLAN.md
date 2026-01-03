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
- Orphan routes temizlendi (CurrencySelection)
- Dead code kaldırıldı (Contact, Help, SelectPlace, MomentPreview, MomentPublished)

### 3. Logger Konsolidasyonu
- `production-logger.ts` → `logger.ts`'e birleştirildi
- `measure()` ve `trackAction()` metodları eklendi

### 4. Provider Hell Çözümü
- `ProviderComposer` utility oluşturuldu
- `App.tsx`'e uygulandı (10 seviye → flat array)

### 5. Button Konsolidasyonu ✅
- `TMButton.tsx` enhanced with new features:
  - Glass variant added
  - Haptic feedback (hapticEnabled, hapticType props)
  - Animation modes (pulse, shimmer)
  - Accessibility props (accessibilityLabel, accessibilityHint)
- `HapticButton.tsx` → DELETED (unused)
- `ui/AnimatedButton.tsx` → DELETED (redundant)
- `Button.tsx` → Deprecated with migration guide
- GRADIENTS.disabled and aurora added to colors.ts

### 6. Card Konsolidasyonu ✅
- `Card.tsx` enhanced with glass variant:
  - Glass variant added (intensity, tint, hasBorder props)
  - GlassView component added
  - GlassButton component added
  - CardVariant, CardPadding, GlassTint types exported
- `GlassCard.tsx` → Deprecated with re-exports to Card.tsx
- All 28 usages of GlassCard continue to work via backward-compatible exports

### 7. Error Handler Konsolidasyonu ✅
- `errorHandler.ts` enhanced:
  - showErrorAlert with i18n support added
  - withErrorAlert async wrapper added
  - isRetryableError, isAuthError, isNetworkRelatedError helpers added
- `friendlyErrorHandler.ts` → Deprecated with re-exports to errorHandler.ts
- Validation helpers preserved for backward compatibility
- Error factory (createError) preserved

---

## 🔄 Planlanan İyileştirmeler (Ayrı PR'lar)

### Öncelik 1: Component Feature Migration
**Risk:** Orta | **Etki:** Yüksek

**Mevcut Analiz (75+ component taşınmalı):**

#### Payment/Gift Components → features/payments/components/
```
AddCardBottomSheet.tsx
AddBankAccountBottomSheet.tsx
RemoveCardModal.tsx
CompleteGiftBottomSheet.tsx
ConfirmGiftModal.tsx
GiftCelebration.tsx
GiftMomentBottomSheet.tsx
GiftSuccessModal.tsx
CurrencySelectionBottomSheet.tsx
WithdrawConfirmationModal.tsx
PendingTransactionsModal.tsx
KYCBadge.tsx
```

#### Moment Components → features/discover/components/ veya features/moments/components/
```
MomentCard.tsx
DeleteMomentDialog.tsx
SetPriceBottomSheet.tsx
ShareMomentBottomSheet.tsx
ChooseCategoryBottomSheet.tsx
```

#### Proof Components → features/proof/components/
```
ShareProofModal.tsx
DeleteProofModal.tsx
RetakeProofBottomSheet.tsx
RequestAdditionalProofBottomSheet.tsx
```

#### Chat Components → features/messages/components/
```
ChatAttachmentBottomSheet.tsx
```

#### Profile/Trust Components → features/profile/components/
```
LeaveTrustNoteBottomSheet.tsx
TrustRing.tsx
```

#### Moderation Components → features/moderation/components/
```
UnblockUserBottomSheet.tsx
```

#### Auth Components → features/auth/components/
```
EmailVerificationModal.tsx
```

**Adımlar:**
1. Yeni konumlara dosyaları kopyala
2. Eski index.ts'leri re-export wrapper yap
3. Tüm import'ları güncelle
4. Eski dosyaları sil

**Reusable olarak kalacak components:**
- ErrorBoundary, ErrorState, LoadingState
- OfflineBanner, OfflineState, NetworkGuard
- BottomNav, CachedImage, SmartImage
- AnimatedComponents, FilterPill, FilterBottomSheet
- CityAutocomplete, LocationPickerBottomSheet
- LanguageSelectionBottomSheet, FormComponents
- ProviderComposer, FeedbackModal, LimitReachedModal

### Öncelik 2: Master Component Konsolidasyonu
**Risk:** Yüksek | **Etki:** Yüksek

#### ✅ Button Birleştirme (TAMAMLANDI)
```typescript
// Önceki: 5 ayrı dosya
Button.tsx, TMButton.tsx, HapticButton.tsx, AnimatedButton.tsx, SocialButton.tsx

// Sonraki: TMButton.tsx master component
TMButton with:
- variant: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'neon' | 'glass'
- hapticEnabled: boolean
- hapticType: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
- animationMode: 'none' | 'pulse' | 'shimmer'
```

#### ✅ Card/Glass Birleştirme (TAMAMLANDI)
```typescript
// Önceki: Card.tsx + GlassCard.tsx ayrı
// Sonraki: Card.tsx with glass variant
Card with:
- variant: 'elevated' | 'outlined' | 'filled' | 'glass'
- intensity: number (for glass)
- tint: 'light' | 'dark' | 'default'
+ GlassView, GlassButton re-exported
```

#### 🔄 Kalan Card Variants (Gelecek PR)
```typescript
// Specialized cards that should stay separate:
TMCard.tsx       → Moment display (trust ring, badges, prices)
AlertCard.tsx    → Alert/notification display (6 types)
DashboardStatCard.tsx → Dashboard metrics with trends
SwipeableCard.tsx → Swipe gesture interactions
TMGiftCard.tsx   → Gift message display
TMProofCard.tsx  → Proof submission display
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

### ✅ Öncelik 4: Error Handler Konsolidasyonu (TAMAMLANDI)
**Risk:** Düşük | **Etki:** Orta

```typescript
// Mevcut yapı (korunuyor):
appErrors.ts     → Base error classes (AppError, NetworkError, etc.)
errorHandler.ts  → Main error handler + i18n alerts (ENHANCED)
errorRecovery.ts → Recovery utilities (retry, state backup)
friendlyErrorHandler.ts → DEPRECATED (re-exports to errorHandler.ts)

// errorHandler.ts enhanced with:
- showErrorAlert(error, t, options)  → i18n alert
- withErrorAlert(fn, t, options)     → async wrapper
- isRetryableError(error)            → check if retryable
- isAuthError(error)                 → check if auth error
- isNetworkRelatedError(error)       → check if network error
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
4. ✅ Button Konsolidasyonu (Tamamlandı)
5. ✅ Card/Glass Konsolidasyonu (Tamamlandı)
6. ✅ Error Handler Konsolidasyonu (Tamamlandı)
7. 🔄 Component Feature Migration (Sonraki PR - 75+ component)
8. 🔄 Service Standardization (Düşük öncelik)
9. 🔄 Zod Schema Cleanup (shared package kullanılmalı)

---

## 📝 Security Notları

SSL Pinning ve Device Integrity implementasyonları zaten mevcut:
- `src/utils/sslPinning.ts` - Certificate pinning for Supabase, Stripe, Cloudflare
- `src/utils/deviceIntegrity.ts` - Jailbreak/root detection, debugger detection
