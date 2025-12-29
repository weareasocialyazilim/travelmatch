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
export { default as WithdrawScreen } from './screens/WithdrawScreen';
export { default as PaymentMethodsScreen } from './screens/PaymentMethodsScreen';
export { default as TransactionDetailScreen } from './screens/TransactionDetailScreen';
export { default as RefundRequestScreen } from './screens/RefundRequestScreen';
export { default as SuccessScreen } from './screens/SuccessScreen';
export { default as GiftInboxScreen } from './screens/GiftInboxScreen';
export { default as GiftInboxDetailScreen } from './screens/GiftInboxDetailScreen';
export { default as PaymentsKYCScreen } from './screens/PaymentsKYCScreen';

// Screens - named exports
export { PaymentFailedScreen } from './screens/PaymentFailedScreen';
export { TransactionHistoryScreen } from './screens/TransactionHistoryScreen';
export { SubscriptionScreen } from './screens/SubscriptionScreen';
export { SuccessConfirmationScreen } from './screens/SuccessConfirmationScreen';
export { UnifiedGiftFlowScreen } from './screens/UnifiedGiftFlowScreen';
export { MyGiftsScreen } from './screens/MyGiftsScreen';
export { ProofReviewScreen } from './screens/ProofReviewScreen';

// KYC Screens
export { default as KYCIntroScreen } from './kyc/KYCIntroScreen';
export { default as KYCDocumentTypeScreen } from './kyc/KYCDocumentTypeScreen';
export { default as KYCDocumentCaptureScreen } from './kyc/KYCDocumentCaptureScreen';
export { default as KYCSelfieScreen } from './kyc/KYCSelfieScreen';
export { default as KYCReviewScreen } from './kyc/KYCReviewScreen';
export { default as KYCPendingScreen } from './kyc/KYCPendingScreen';

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
  useCancelSubscription
} from './hooks/usePayments';

// Services
export { paymentsApi } from './services/paymentsApi';
export type { CreatePaymentIntentDto } from './services/paymentsApi';

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
