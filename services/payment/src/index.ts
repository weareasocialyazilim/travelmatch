/**
 * @travelmatch/payment-services
 *
 * Payment processing services for TravelMatch platform
 *
 * This package contains payment-related utilities and types.
 * Edge Functions (process-payment, etc.) are deployed separately via Supabase.
 */

// Payment service types
export interface PaymentConfig {
  stripeSecretKey: string;
  webhookSecret: string;
  platformFeePercentage: number;
}

export interface PaymentIntent {
  id: string;
  momentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  paymentMethodId?: string;
  createdAt: Date;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}
