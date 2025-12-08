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

// Screens
export { default as WalletScreen } from './screens/WalletScreen';
export { default as WithdrawScreen } from './screens/WithdrawScreen';
export { default as PaymentMethodsScreen } from './screens/PaymentMethodsScreen';
export { default as PaymentFailedScreen } from './screens/PaymentFailedScreen';
export { default as TransactionDetailScreen } from './screens/TransactionDetailScreen';
export { default as TransactionHistoryScreen } from './screens/TransactionHistoryScreen';
export { default as SubscriptionScreen } from './screens/SubscriptionScreen';
export { default as RefundRequestScreen } from './screens/RefundRequestScreen';
export { default as SuccessScreen } from './screens/SuccessScreen';
export { default as SuccessConfirmationScreen } from './screens/SuccessConfirmationScreen';

// KYC Screens
export { default as PaymentsKYCScreen } from './screens/PaymentsKYCScreen';
export { default as KYCIntroScreen } from './kyc/KYCIntroScreen';
export { default as KYCDocumentTypeScreen } from './kyc/KYCDocumentTypeScreen';
export { default as KYCDocumentCaptureScreen } from './kyc/KYCDocumentCaptureScreen';
export { default as KYCSelfieScreen } from './kyc/KYCSelfieScreen';
export { default as KYCReviewScreen } from './kyc/KYCReviewScreen';
export { default as KYCPendingScreen } from './kyc/KYCPendingScreen';

// Gift & Social Commerce
export { default as GiftInboxScreen } from './screens/GiftInboxScreen';
export { default as GiftInboxDetailScreen } from './screens/GiftInboxDetailScreen';
export { default as UnifiedGiftFlowScreen } from './screens/UnifiedGiftFlowScreen';
export { default as MyGiftsScreen } from './screens/MyGiftsScreen';

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
