/**
 * Payments Feature - Barrel Exports
 *
 * Bu feature şunları içerir:
 * - Wallet yönetimi (WalletScreen, WithdrawScreen)
 * - Payment methods (PaymentMethodsScreen)
 * - Transactions (TransactionDetailScreen, TransactionHistoryScreen)
 * - KYC verification (PaymentsKYCScreen, kyc/ folder)
 * - Gift & social commerce (GiftInboxScreen, UnifiedGiftFlowScreen)
 * - Subscriptions (SubscriptionScreen)
 */

// Screens - with default exports
export { default as WalletScreen } from './screens/WalletScreen';
export {
  default as WithdrawScreen,
  AwwwardsWithdrawScreen,
} from './screens/WithdrawScreen';
export { WithdrawSuccessScreen } from './screens/WithdrawSuccessScreen';
export { default as PaymentMethodsScreen } from './screens/PaymentMethodsScreen';
export { default as AddCardScreen } from './screens/AddCardScreen';
export { default as TransactionDetailScreen } from './screens/TransactionDetailScreen';
export { RefundRequestScreen } from './screens/RefundRequestScreen';
export { default as SuccessScreen } from './screens/SuccessScreen';
export { default as GiftInboxScreen } from './screens/GiftInboxScreen';
export { default as GiftInboxDetailScreen } from './screens/GiftInboxDetailScreen';
export { default as PaymentsKYCScreen } from './screens/PaymentsKYCScreen';

// Screens - named exports
export { default as CheckoutScreen } from './screens/CheckoutScreen';
export { PaymentFailedScreen } from './screens/PaymentFailedScreen';
export { TransactionHistoryScreen } from './screens/TransactionHistoryScreen';
export { SubscriptionScreen } from './screens/SubscriptionScreen';
export { SuccessConfirmationScreen } from './screens/SuccessConfirmationScreen';
export { UnifiedGiftFlowScreen } from './screens/UnifiedGiftFlowScreen';
export { MyGiftsScreen } from './screens/MyGiftsScreen';
export { GiftCardMarketScreen } from './screens/GiftCardMarketScreen';
export { ProofReviewScreen } from './screens/ProofReviewScreen';
export { PayTRWebViewScreen } from './screens/PayTRWebViewScreen';
export { default as PromoCodeScreen } from './screens/PromoCodeScreen';

// KYC Screens
export { default as KYCIntroScreen } from './kyc/KYCIntroScreen';
export { default as KYCDocumentTypeScreen } from './kyc/KYCDocumentTypeScreen';
export { default as KYCDocumentCaptureScreen } from './kyc/KYCDocumentCaptureScreen';
export { default as KYCSelfieScreen } from './kyc/KYCSelfieScreen';
export { default as KYCReviewScreen } from './kyc/KYCReviewScreen';
export { default as KYCPendingScreen } from './kyc/KYCPendingScreen';

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
