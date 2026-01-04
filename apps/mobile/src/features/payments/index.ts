/**
 * Payments Feature - Barrel Exports
 *
 * Bu feature şunları içerir:
 * - Payment methods (PaymentMethodsScreen)
 * - Transactions (TransactionDetailScreen, TransactionHistoryScreen)
 * - KYC verification (PaymentsKYCScreen, kyc/ folder)
 * - Subscriptions (SubscriptionScreen)
 *
 * NOTE: Wallet ve Gift ekranları ayrı feature modüllerine taşındı:
 * - Wallet: @/features/wallet
 * - Gifts: @/features/gifts
 */

// Screens - with default exports
export { default as PaymentMethodsScreen } from './screens/PaymentMethodsScreen';
export { default as AddCardScreen } from './screens/AddCardScreen';
export { default as TransactionDetailScreen } from './screens/TransactionDetailScreen';
export { RefundRequestScreen } from './screens/RefundRequestScreen';
export { default as SuccessScreen } from './screens/SuccessScreen';
export { default as PaymentsKYCScreen } from './screens/PaymentsKYCScreen';

// Screens - named exports
export { default as CheckoutScreen } from './screens/CheckoutScreen';
export { PaymentFailedScreen } from './screens/PaymentFailedScreen';
export { TransactionHistoryScreen } from './screens/TransactionHistoryScreen';
export { SubscriptionScreen } from './screens/SubscriptionScreen';
export { SuccessConfirmationScreen } from './screens/SuccessConfirmationScreen';
export { ProofReviewScreen } from './screens/ProofReviewScreen';
export { PayTRWebViewScreen } from './screens/PayTRWebViewScreen';
export { default as PromoCodeScreen } from './screens/PromoCodeScreen';
export { default as BulkThankYouScreen } from './screens/BulkThankYouScreen';

// KYC Screens - MOVED TO features/verifications/kyc
// Import from '@/features/verifications/kyc' for new code
// Re-export for backward compatibility (deprecated)
export {
  KYCIntroScreen,
  KYCDocumentTypeScreen,
  KYCDocumentCaptureScreen,
  KYCSelfieScreen,
  KYCReviewScreen,
  KYCPendingScreen,
} from '../verifications/kyc';

// Components
export { PaymentSecurityBadge } from './components/PaymentSecurityBadge';

// Hooks
export {
  useWallet,
  useTransactions,
  useTransaction,
  usePaymentMethods,
  useCreatePaymentIntent,
  useWithdraw,
  useKYCStatus,
  useSubmitKYC,
  useSubscription,
  useCreateSubscription,
  useCancelSubscription,
} from './hooks/usePayments';

// Services - consolidated into securePaymentService
// All payment operations now go through securePaymentService
// Import from '@/services/securePaymentService' for new code

// Types
export type {
  Moment,
  MomentData,
  MomentUser,
  MomentLocation,
  User,
  Transaction,
  TransactionType,
  TransactionStatus,
  UserProfile,
} from './types';
