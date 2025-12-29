/**
 * @travelmatch/payment-services
 *
 * Payment processing services for TravelMatch platform
 *
 * This package contains payment-related utilities and types.
 * Edge Functions (PayTR) are deployed separately via Supabase.
 *
 * PayTR Edge Functions:
 * - paytr-create-payment: Create payment
 * - paytr-webhook: Handle PayTR callbacks
 * - paytr-saved-cards: Manage saved cards
 * - paytr-transfer: Handle transfers
 */

// Payment service types
export interface PaymentConfig {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  platformFeePercentage: number;
}

export interface PaymentRequest {
  id: string;
  momentId: string;
  amount: number;
  currency: 'TRY' | 'EUR' | 'USD' | 'GBP';
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  paymentMethodId?: string;
  createdAt: Date;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  iframeToken?: string;
  error?: string;
}

// Supported currencies
export const SUPPORTED_CURRENCIES = ['TRY', 'EUR', 'USD', 'GBP'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

// Payment status types
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

// Transaction types
export type TransactionType =
  | 'gift_sent'
  | 'gift_received'
  | 'withdrawal'
  | 'deposit'
  | 'refund'
  | 'fee';
