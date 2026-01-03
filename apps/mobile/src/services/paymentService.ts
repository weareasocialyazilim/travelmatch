/**
 * Payment Service - Backward Compatibility Layer
 *
 * This module re-exports from securePaymentService.ts for backward compatibility.
 * All payment logic has been consolidated into securePaymentService.ts
 *
 * @deprecated Import directly from securePaymentService.ts for new code
 *
 * Migration:
 * - OLD: import { paymentService } from './paymentService';
 * - NEW: import { securePaymentService } from './securePaymentService';
 */

import {
  securePaymentService,
  // Types
  type PaymentStatus as _PaymentStatus,
  type PaymentMethod as _PaymentMethod,
  type TransactionType as _TransactionType,
  type PaymentCard as _PaymentCard,
  type BankAccount as _BankAccount,
  type LegacyTransaction,
  type PaymentIntent as _PaymentIntent,
  type EscrowMode as _EscrowMode,
  type EscrowDecision as _EscrowDecision,
  type WithdrawalLimits as _WithdrawalLimits,
  type EscrowTransaction as _EscrowTransaction,
  type WalletBalance as _WalletBalance,
  // Escrow utility functions
  determineEscrowMode as _determineEscrowMode,
  getEscrowExplanation as _getEscrowExplanation,
} from './securePaymentService';

// Re-export types
export type PaymentStatus = _PaymentStatus;
export type PaymentMethod = _PaymentMethod;
export type TransactionType = _TransactionType;
export type PaymentCard = _PaymentCard;
export type BankAccount = _BankAccount;
export type Transaction = LegacyTransaction;
export type PaymentIntent = _PaymentIntent;
export type EscrowMode = _EscrowMode;
export type EscrowDecision = _EscrowDecision;
export type WithdrawalLimits = _WithdrawalLimits;
export type EscrowTransaction = _EscrowTransaction;
export type WalletBalance = _WalletBalance;

// Re-export escrow utility functions
export const determineEscrowMode = _determineEscrowMode;
export const getEscrowExplanation = _getEscrowExplanation;

/**
 * Payment Service Object - Backward Compatibility
 *
 * Maps old paymentService API to new securePaymentService API
 */
export const paymentService = {
  // Wallet operations
  getBalance: () => securePaymentService.getBalance(),
  getWalletBalance: () => securePaymentService.getBalance(),

  // Transaction operations
  getTransactions: (params?: {
    type?: TransactionType;
    status?: PaymentStatus;
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
  }) => securePaymentService.getLegacyTransactions(params),
  getTransaction: (transactionId: string) =>
    securePaymentService.getLegacyTransaction(transactionId),

  // Payment methods
  getPaymentMethods: () => securePaymentService.getPaymentMethods(),
  addCard: (tokenId: string) => securePaymentService.addCard(tokenId),
  removeCard: (cardId: string) => securePaymentService.removeCard(cardId),
  setDefaultCard: (cardId: string) =>
    securePaymentService.setDefaultCard(cardId),
  addBankAccount: (data: {
    routingNumber: string;
    accountNumber: string;
    accountType: 'checking' | 'savings';
  }) => securePaymentService.addBankAccount(data),
  removeBankAccount: (bankAccountId: string) =>
    securePaymentService.removeBankAccount(bankAccountId),

  // Payment operations
  createPaymentIntent: (momentId: string, amount: number) =>
    securePaymentService.createPaymentIntent(momentId, amount),
  confirmPayment: (paymentIntentId: string, paymentMethodId?: string) =>
    securePaymentService.confirmPayment(paymentIntentId, paymentMethodId),
  processPayment: (data: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }) => securePaymentService.processPayment(data),

  // Withdrawal operations
  getWithdrawalLimits: () => securePaymentService.getWithdrawalLimits(),
  withdrawFunds: (data: {
    amount: number;
    currency: string;
    bankAccountId: string;
  }) => securePaymentService.withdrawFunds(data),
  requestWithdrawal: (amount: number, bankAccountId: string) =>
    securePaymentService
      .withdrawFunds({
        amount,
        currency: 'USD',
        bankAccountId,
      })
      .then((result) => result),

  // Escrow operations
  transferFunds: (params: {
    amount: number;
    recipientId: string;
    momentId?: string;
    message?: string;
    escrowChoiceCallback?: (amount: number) => Promise<boolean>;
  }) => securePaymentService.transferFunds(params),
  releaseEscrow: (escrowId: string) =>
    securePaymentService.releaseEscrow(escrowId),
  refundEscrow: (escrowId: string, reason: string) =>
    securePaymentService.refundEscrow(escrowId, reason),
  getUserEscrowTransactions: () =>
    securePaymentService.getUserEscrowTransactions(),
};

export default paymentService;
