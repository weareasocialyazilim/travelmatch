/**
 * Gift Feature - Unified Gift Flow
 *
 * MASTER Architecture: Merkezi hediye yönetimi
 *
 * Bu modül şunları içerir:
 * - GiftMomentBottomSheet: Hediye gönderme akışı
 * - ConfirmGiftModal: Hediye onay modalı
 * - CompleteGiftBottomSheet: Ödeme tamamlama
 * - ThankYouModal: Teşekkür mesajı
 * - SubscriberOfferBottomSheet: Premium/Platinum teklif oluşturma
 * - GiftCelebration: Kutlama animasyonu
 * - GiftSuccessModal: Başarı bildirimi
 *
 * Escrow Tier Kuralları (Chat Lock):
 * - Tier 1 (0-30$): Direct payment, bulk thank you only
 * - Tier 2 (30-100$): Chat candidate, requires host "Like"
 * - Tier 3 (100$+): Premium offer, silver highlight, requires approval
 */

// ===================================
// SCREENS
// ===================================
export {
  GiftInboxScreen,
  GiftInboxDetailScreen,
  GiftSuccessScreen,
  UnifiedGiftFlowScreen,
  MyGiftsScreen,
} from './screens';

// ===================================
// COMPONENTS
// ===================================
export * from './components';
