/**
 * PayTR Provider
 *
 * Handles all PayTR-specific payment operations.
 * PCI-DSS compliant - card data never touches our servers.
 *
 * PayTR Edge Functions:
 * - paytr-create-payment: Create payment and get iframeToken
 * - paytr-tokenize-card: Tokenize and save card
 * - paytr-saved-cards: Manage saved cards
 * - paytr-webhook: Handle PayTR callbacks
 */

import { supabase, SUPABASE_EDGE_URL } from '../../config/supabase';
import { logger } from '../../utils/logger';
import { paymentCache } from '../cacheService';

// ============================================
// TYPES
// ============================================

export interface PayTRPaymentResponse {
  iframeToken: string;
  merchantOid: string;
  transactionId?: string;
  amount: number;
  currency: string;
}

export interface CreatePaymentParams {
  momentId: string;
  amount: number;
  currency?: 'TRY' | 'EUR' | 'USD' | 'GBP';
  description?: string;
  metadata?: Record<string, unknown>;
  saveCard?: boolean;
  cardToken?: string;
}

export interface SavedCard {
  cardToken: string;
  last4: string;
  cardBrand: string;
  isDefault: boolean;
}

export interface CardTokenizeParams {
  cardNumber: string;
  cardHolderName: string;
  expireMonth: string;
  expireYear: string;
  cvv: string;
}

export interface CardTokenizeResult {
  cardToken: string;
  last4: string;
  brand: string;
}

// ============================================
// PAYTR PROVIDER
// ============================================

class PayTRProviderClass {
  private readonly EDGE_FUNCTION_BASE = `${SUPABASE_EDGE_URL}/functions/v1`;

  /**
   * Get authorization header for Edge Function calls
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a payment via PayTR
   *
   * Returns an iframeToken to be used in PayTR WebView
   * The actual payment is completed in the WebView
   */
  async createPayment(
    params: CreatePaymentParams,
  ): Promise<PayTRPaymentResponse> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(
        `${this.EDGE_FUNCTION_BASE}/paytr-create-payment`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            momentId: params.momentId,
            amount: params.amount,
            currency: params.currency || 'TRY',
            description: params.description,
            metadata: params.metadata,
            saveCard: params.saveCard,
            cardToken: params.cardToken,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment');
      }

      const paymentResponse: PayTRPaymentResponse = await response.json();

      // Invalidate relevant caches
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await paymentCache.invalidateWallet(user.id);
        await paymentCache.invalidateTransactions(user.id);
      }

      logger.info('PayTR payment created:', paymentResponse.merchantOid);
      return paymentResponse;
    } catch (error) {
      logger.error('PayTR create payment error:', error);
      throw error;
    }
  }

  /**
   * Get saved cards for the user
   */
  async getSavedCards(): Promise<SavedCard[]> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(
        `${this.EDGE_FUNCTION_BASE}/paytr-saved-cards`,
        {
          method: 'GET',
          headers,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get saved cards');
      }

      return await response.json();
    } catch (error) {
      logger.error('PayTR get saved cards error:', error);
      throw error;
    }
  }

  /**
   * Tokenize and save a card via PayTR
   *
   * PCI-DSS Compliance: Card data is sent directly to PayTR Edge Function
   * which forwards to PayTR API. Card data is NEVER stored on our servers.
   */
  async tokenizeAndSaveCard(
    cardDetails: CardTokenizeParams,
  ): Promise<CardTokenizeResult> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(
        `${this.EDGE_FUNCTION_BASE}/paytr-tokenize-card`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            cardNumber: cardDetails.cardNumber,
            cardHolderName: cardDetails.cardHolderName,
            expireMonth: cardDetails.expireMonth,
            expireYear: cardDetails.expireYear,
            cvv: cardDetails.cvv,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save card');
      }

      const result = await response.json();
      logger.info('PayTR card tokenized successfully');
      return result;
    } catch (error) {
      logger.error('PayTR tokenize card error:', error);
      throw error;
    }
  }

  /**
   * Delete a saved card
   */
  async deleteSavedCard(cardToken: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(
        `${this.EDGE_FUNCTION_BASE}/paytr-saved-cards`,
        {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ cardToken }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete card');
      }

      logger.info('PayTR card deleted successfully');
    } catch (error) {
      logger.error('PayTR delete card error:', error);
      throw error;
    }
  }

  /**
   * Set default card
   */
  async setDefaultCard(cardToken: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(
        `${this.EDGE_FUNCTION_BASE}/paytr-saved-cards`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ cardToken, isDefault: true }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set default card');
      }

      logger.info('PayTR default card set');
    } catch (error) {
      logger.error('PayTR set default card error:', error);
      throw error;
    }
  }
}

export const paytrProvider = new PayTRProviderClass();
