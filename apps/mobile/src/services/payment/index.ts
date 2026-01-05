/**
 * Payment Services - Entry Point
 *
 * Re-exports all payment-related services from modular files.
 * This is the recommended way to import payment services.
 *
 * Modular structure:
 * - PayTRProvider: PayTR API operations (tokenize, create payment, saved cards)
 * - walletService: Balance queries, withdrawals
 * - escrowService: Titan Plan v2.0 escrow logic
 * - transactionService: Transaction history
 */

// PayTR Provider
export {
  paytrProvider,
  type PayTRPaymentResponse,
  type CreatePaymentParams,
  type SavedCard,
  type CardTokenizeParams,
  type CardTokenizeResult,
} from './PayTRProvider';

// Re-export from parent services
export { walletService, type WalletBalance } from '../walletService';
export {
  escrowService,
  determineEscrowMode,
  getEscrowExplanation,
  type EscrowMode,
  type EscrowDecision,
  type EscrowTransaction,
} from '../escrowService';
export {
  transactionService,
  type Transaction,
  type TransactionFilters,
} from '../transactionService';
