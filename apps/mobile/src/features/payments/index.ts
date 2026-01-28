/**
 * Payments Feature - Cleaned Up
 *
 * All user payments go through IAP (Apple App Store / Google Play Store).
 * PayTR is only used for backend payouts (withdrawals).
 *
 * Screens:
 * - UnifiedGiftFlowScreen: Gift/Moment payment flow (coin-based)
 * - SubscriptionScreen: Membership subscriptions
 * - TransactionHistoryScreen: Transaction history
 * - PromoCodeScreen: Promo code redemption
 *
 * KYC: Use '@/features/verifications/idenfy' for identity verification
 */

// Screens - Using default exports
export { default as SubscriberOfferModal } from './screens/SubscriberOfferModal';
export { default as UnifiedGiftFlowScreen } from './screens/UnifiedGiftFlowScreen';
export { default as PromoCodeScreen } from './screens/PromoCodeScreen';
export { default as SuccessScreen } from './screens/SuccessScreen';
export { default as TransactionDetailScreen } from './screens/TransactionDetailScreen';
// Named exports (these files use `export const`)
export { SuccessConfirmationScreen } from './screens/SuccessConfirmationScreen';
export { PaymentFailedScreen } from './screens/PaymentFailedScreen';
export { RefundRequestScreen } from './screens/RefundRequestScreen';
export { ProofReviewScreen } from './screens/ProofReviewScreen';
export { SubscriptionScreen } from './screens/SubscriptionScreen';
export { TransactionHistoryScreen } from './screens/TransactionHistoryScreen';

// Components
export { PaymentSecurityBadge } from './components/PaymentSecurityBadge';

// KYC - Use Idenfy integration
// Export from '@/features/verifications/idenfy'

// Types
export type { Transaction, TransactionType, TransactionStatus } from './types';
