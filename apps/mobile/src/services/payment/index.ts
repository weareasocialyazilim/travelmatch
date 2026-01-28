/**
 * Payment Services - Entry Point
 *
 * Re-exports all payment-related services from modular files.
 * This is the recommended way to import payment services.
 *
 * NOTE: PayTR has been removed. User payments now go through IAP (RevenueCat).
 * PayTR is only used for backend withdrawals.
 *
 * Modular structure:
 * - walletService: Balance queries, withdrawals
 * - escrowService: Titan Protocol escrow logic
 * - transactionService: Transaction history
 */

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
