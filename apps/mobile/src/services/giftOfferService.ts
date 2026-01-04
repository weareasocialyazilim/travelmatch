/**
 * Gift Offer Service
 * Manages gift offers in chat - sending, accepting, declining
 *
 * LEGAL COMPLIANCE (PayTR Integration):
 * - Status can ONLY change via PayTR webhook (paytr-webhook/index.ts)
 * - Funds are held in PayTR pool, NOT in our system
 * - Pre-authorization flow for subscriber offers
 *
 * Master Logic: Subscriber Offer Validation
 * - Category Match: Offer must match moment category (for non-cash gifts)
 * - Value Upgrade Rule: Subscribers can ONLY offer >= requested amount
 * - Currency Lock: Currency is set by host, sender cannot override
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import * as Sentry from '@sentry/react-native';
import { logPaymentError } from '../config/sentry';

// Gift status types - PayTR compliant
export type GiftStatus =
  | 'pending_paytr_approval' // Initial: PayTR pre-auth requested
  | 'paytr_authorized' // PayTR has held funds
  | 'pending_proof' // Waiting for host to upload proof
  | 'proof_submitted' // Proof uploaded, awaiting verification
  | 'completed' // PayTR captured, funds released (ONLY via webhook)
  | 'cancelled' // Offer cancelled by giver
  | 'declined' // Offer declined by receiver
  | 'refunded' // PayTR refunded
  | 'disputed'; // Under dispute

export interface GiftOffer {
  id: string;
  giver_id: string;
  receiver_id: string;
  moment_id: string | null;
  amount: number;
  currency: string;
  status: GiftStatus;
  message: string | null;
  created_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  // PayTR integration fields
  paytr_token?: string;
  paytr_transaction_id?: string;
  // Subscriber offer fields
  is_subscriber_offer?: boolean;
  offer_category?: string;
}

export interface CreateGiftOfferData {
  receiverId: string;
  momentId?: string;
  amount: number;
  currency?: string; // Deprecated: Will be overridden by moment's currency
  message?: string;
  isSubscriberOffer?: boolean;
  offerCategory?: string;
}

export interface GiftOfferResponse {
  success: boolean;
  gift?: GiftOffer;
  error?: string;
  // PayTR response for client-side redirect
  paytrToken?: string;
  paytrIframeUrl?: string;
}

// Validation error types for better UX
export type OfferValidationError =
  | 'CATEGORY_MISMATCH'
  | 'AMOUNT_TOO_LOW'
  | 'MOMENT_NOT_FOUND'
  | 'NOT_AUTHENTICATED'
  | 'PAYTR_ERROR';

export interface OfferValidationResult {
  valid: boolean;
  error?: OfferValidationError;
  message?: string;
  momentCategory?: string;
  momentPrice?: number;
  momentCurrency?: string;
}

// PayTR session response type
interface PayTRSessionResponse {
  success: boolean;
  token?: string;
  iframe_url?: string;
  merchant_oid?: string;
  error?: string;
}

/**
 * Validate subscriber offer against moment requirements
 * Master Rule: Category must match AND amount must be >= requested
 */
const validateSubscriberOffer = async (
  momentId: string,
  offerAmount: number,
  offerCategory?: string,
): Promise<OfferValidationResult> => {
  // Fetch moment data for validation
  const { data: moment, error } = await supabase
    .from('moments')
    .select('category, price, currency')
    .eq('id', momentId)
    .single();

  if (error || !moment) {
    return {
      valid: false,
      error: 'MOMENT_NOT_FOUND',
      message: 'Moment bulunamadı.',
    };
  }

  // Rule 1: Category must match (if offer specifies a category)
  if (offerCategory && offerCategory !== moment.category) {
    return {
      valid: false,
      error: 'CATEGORY_MISMATCH',
      message: `Teklifiniz "${moment.category}" kategorisiyle eşleşmelidir.`,
      momentCategory: moment.category,
      momentPrice: moment.price,
      momentCurrency: moment.currency,
    };
  }

  // Rule 2: Amount must be >= requested (The Upgrade Rule)
  // CRITICAL: This check happens BEFORE any PayTR call
  if (offerAmount < moment.price) {
    return {
      valid: false,
      error: 'AMOUNT_TOO_LOW',
      message: `Aboneler sadece ${moment.price} ${moment.currency} veya üzerinde teklif sunabilir.`,
      momentCategory: moment.category,
      momentPrice: moment.price,
      momentCurrency: moment.currency,
    };
  }

  return {
    valid: true,
    momentCategory: moment.category,
    momentPrice: moment.price,
    momentCurrency: moment.currency,
  };
};

/**
 * Gift Offer Service for managing gift offers in chat
 */
export const giftOfferService = {
  /**
   * Validate an offer before creating (for UI feedback)
   */
  validateOffer: validateSubscriberOffer,

  /**
   * Create a new gift offer with PayTR pre-authorization
   * LEGAL COMPLIANCE: Funds go to PayTR pool, not our system
   */
  createOffer: async (
    data: CreateGiftOfferData,
  ): Promise<GiftOfferResponse> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let currency = 'TRY';
      let category: string | undefined;
      let momentPrice = 0;

      // STEP 1: Validate against moment requirements (BEFORE any PayTR call)
      if (data.momentId) {
        const validation = await validateSubscriberOffer(
          data.momentId,
          data.amount,
          data.offerCategory,
        );

        if (!validation.valid) {
          logger.warn('[GiftOffer] Validation failed:', validation);
          return {
            success: false,
            error: validation.message || 'Teklif doğrulaması başarısız.',
          };
        }

        // Lock currency to moment's currency (host determines currency)
        currency = validation.momentCurrency || 'TRY';
        category = validation.momentCategory;
        momentPrice = validation.momentPrice || 0;
      }

      // STEP 2: Create PayTR pre-authorization session
      // This holds funds in PayTR's secure pool
      const { data: paytrSession, error: paytrError } =
        await supabase.functions.invoke<PayTRSessionResponse>(
          'paytr-create-payment',
          {
            body: {
              amount: data.amount,
              currency,
              category: category,
              type: 'subscriber_offer',
              moment_id: data.momentId,
              receiver_id: data.receiverId,
              // Pre-auth mode: Don't capture yet
              payment_type: 'pre_auth',
            },
          },
        );

      if (paytrError || !paytrSession?.success) {
        logger.error('[GiftOffer] PayTR session creation failed:', paytrError);

        // Sentry tracking for PayTR errors
        Sentry.withScope((scope) => {
          scope.setTag('transaction_type', 'gift_offer');
          scope.setTag('payment_provider', 'paytr');
          scope.setTag('error_stage', 'session_creation');
          scope.setLevel('error');
        });

        logPaymentError('PAYTR_INVALID_RESPONSE', {
          momentId: data.momentId,
          amount: data.amount,
          currency,
          errorMessage: paytrError?.message || 'Session creation failed',
        });

        return {
          success: false,
          error: 'Ödeme sistemi hatası. Lütfen tekrar deneyin.',
        };
      }

      // STEP 3: Create gift record with pending_paytr_approval status
      // Status will ONLY change via PayTR webhook
      const { data: gift, error } = await supabase
        .from('gifts')
        .insert({
          giver_id: user.id,
          receiver_id: data.receiverId,
          moment_id: data.momentId || null,
          amount: data.amount,
          currency,
          status: 'pending_paytr_approval', // LEGAL: Cannot be 'completed'
          message: data.message || null,
          paytr_token: paytrSession.token,
          paytr_transaction_id: paytrSession.merchant_oid,
          metadata: {
            is_subscriber_offer: data.isSubscriberOffer || false,
            offer_category: category,
            moment_requested_price: momentPrice,
            offer_premium: data.amount - momentPrice, // How much above requested
          },
        })
        .select()
        .single();

      if (error) throw error;
      if (!gift) throw new Error('Failed to create gift');

      const createdGift = gift as GiftOffer;
      logger.info('[GiftOffer] PayTR pre-auth offer created:', {
        id: createdGift.id,
        amount: data.amount,
        currency,
        paytrToken: paytrSession.token,
        isSubscriberOffer: data.isSubscriberOffer,
      });

      return {
        success: true,
        gift: createdGift,
        paytrToken: paytrSession.token,
        paytrIframeUrl: paytrSession.iframe_url,
      };
    } catch (error) {
      logger.error('[GiftOffer] Create offer error:', error);

      // Sentry tracking for gift offer creation failures
      Sentry.withScope((scope) => {
        scope.setTag('transaction_type', 'gift_offer');
        scope.setTag('error_stage', 'offer_creation');
        scope.setLevel('error');
        Sentry.captureException(error);
      });

      logPaymentError('GIFT_OFFER_FAILURE', {
        momentId: data.momentId,
        amount: data.amount,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create offer',
      };
    }
  },

  /**
   * Accept a gift offer - Initiates proof requirement
   * NOTE: Does NOT complete payment. Completion only via PayTR webhook after proof.
   */
  acceptOffer: async (giftId: string): Promise<GiftOfferResponse> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First verify the gift exists and user is the receiver
      const { data: existingGift, error: fetchError } = await supabase
        .from('gifts')
        .select(
          'id, receiver_id, status, giver_id, amount, currency, moment_id, paytr_token',
        )
        .eq('id', giftId)
        .single();

      if (fetchError) throw fetchError;
      if (!existingGift) throw new Error('Gift offer not found');

      const giftData = existingGift as GiftOffer;
      if (giftData.receiver_id !== user.id)
        throw new Error('Not authorized to accept this offer');

      // Only accept if PayTR has authorized the funds
      if (giftData.status !== 'paytr_authorized') {
        throw new Error('Ödeme henüz onaylanmadı. Lütfen bekleyin.');
      }

      // LEGAL: Move to pending_proof, NOT completed
      // Completion only happens after proof upload + PayTR capture
      const { data: gift, error } = await supabase
        .from('gifts')
        .update({
          status: 'pending_proof', // Requires proof before PayTR capture
        })
        .eq('id', giftId)
        .eq('receiver_id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (!gift) throw new Error('Failed to update gift');

      logger.info('[GiftOffer] Offer accepted, awaiting proof:', giftId);
      return { success: true, gift: gift as GiftOffer };
    } catch (error) {
      logger.error('[GiftOffer] Accept offer error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to accept offer',
      };
    }
  },

  /**
   * Submit proof for a gift - Triggers PayTR capture request
   */
  submitProof: async (
    giftId: string,
    proofUrl: string,
  ): Promise<GiftOfferResponse> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existingGift, error: fetchError } = await supabase
        .from('gifts')
        .select('id, receiver_id, status, paytr_token, paytr_transaction_id')
        .eq('id', giftId)
        .single();

      if (fetchError) throw fetchError;
      if (!existingGift) throw new Error('Gift not found');

      const giftData = existingGift as GiftOffer;
      if (giftData.receiver_id !== user.id) throw new Error('Not authorized');
      if (giftData.status !== 'pending_proof')
        throw new Error('Gift is not awaiting proof');

      // Update status to proof_submitted
      const { data: gift, error } = await supabase
        .from('gifts')
        .update({
          status: 'proof_submitted',
          metadata: {
            proof_url: proofUrl,
            proof_submitted_at: new Date().toISOString(),
          },
        })
        .eq('id', giftId)
        .select()
        .single();

      if (error) throw error;

      // Trigger PayTR capture via edge function
      // The actual capture and status='completed' happens via webhook
      await supabase.functions.invoke('paytr-capture-payment', {
        body: {
          gift_id: giftId,
          paytr_token: giftData.paytr_token,
          merchant_oid: giftData.paytr_transaction_id,
        },
      });

      logger.info(
        '[GiftOffer] Proof submitted, PayTR capture requested:',
        giftId,
      );
      return { success: true, gift: gift as GiftOffer };
    } catch (error) {
      logger.error('[GiftOffer] Submit proof error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to submit proof',
      };
    }
  },

  /**
   * Decline a gift offer - Releases PayTR pre-auth
   */
  declineOffer: async (giftId: string): Promise<GiftOfferResponse> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existingGift, error: fetchError } = await supabase
        .from('gifts')
        .select('id, receiver_id, status, paytr_token')
        .eq('id', giftId)
        .single();

      if (fetchError) throw fetchError;
      if (!existingGift) throw new Error('Gift offer not found');

      const declineGiftData = existingGift as GiftOffer;
      if (declineGiftData.receiver_id !== user.id)
        throw new Error('Not authorized to decline this offer');

      // Can only decline authorized offers
      if (
        !['paytr_authorized', 'pending_proof'].includes(declineGiftData.status)
      )
        throw new Error('Bu teklif artık reddedilemez');

      // Release PayTR pre-auth
      if (declineGiftData.paytr_token) {
        await supabase.functions.invoke('paytr-void-payment', {
          body: { paytr_token: declineGiftData.paytr_token },
        });
      }

      const { data: gift, error } = await supabase
        .from('gifts')
        .update({
          status: 'declined',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', giftId)
        .eq('receiver_id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (!gift) throw new Error('Failed to update gift');

      logger.info('[GiftOffer] Offer declined, PayTR voided:', giftId);
      return { success: true, gift: gift as GiftOffer };
    } catch (error) {
      logger.error('[GiftOffer] Decline offer error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to decline offer',
      };
    }
  },

  /**
   * Get pending offers for current user (as receiver)
   */
  getPendingOffers: async (): Promise<GiftOffer[]> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('gifts')
        .select(
          `
          id,
          giver_id,
          receiver_id,
          moment_id,
          amount,
          currency,
          status,
          message,
          created_at,
          completed_at,
          cancelled_at,
          paytr_token,
          paytr_transaction_id
        `,
        )
        .eq('receiver_id', user.id)
        .in('status', ['paytr_authorized', 'pending_proof', 'proof_submitted'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as GiftOffer[]) || [];
    } catch (error) {
      logger.error('[GiftOffer] Get pending offers error:', error);
      return [];
    }
  },

  /**
   * Get offer by ID
   */
  getOfferById: async (giftId: string): Promise<GiftOffer | null> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('gifts')
        .select(
          `
          id,
          giver_id,
          receiver_id,
          moment_id,
          amount,
          currency,
          status,
          message,
          created_at,
          completed_at,
          cancelled_at,
          paytr_token,
          paytr_transaction_id
        `,
        )
        .eq('id', giftId)
        .single();

      if (error) throw error;
      if (!data) return null;

      const giftOffer = data as GiftOffer;
      if (giftOffer.giver_id !== user.id && giftOffer.receiver_id !== user.id) {
        return null;
      }

      return giftOffer;
    } catch (error) {
      logger.error('[GiftOffer] Get offer error:', error);
      return null;
    }
  },

  /**
   * Cancel an offer (as giver) - Releases PayTR pre-auth
   */
  cancelOffer: async (giftId: string): Promise<GiftOfferResponse> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existingGift, error: fetchError } = await supabase
        .from('gifts')
        .select('id, giver_id, status, paytr_token')
        .eq('id', giftId)
        .single();

      if (fetchError) throw fetchError;
      if (!existingGift) throw new Error('Gift not found');

      const giftData = existingGift as GiftOffer;
      if (giftData.giver_id !== user.id)
        throw new Error('Not authorized to cancel this offer');

      // Can only cancel if not yet completed
      if (['completed', 'refunded'].includes(giftData.status))
        throw new Error('Bu teklif artık iptal edilemez');

      // Release PayTR pre-auth
      if (giftData.paytr_token) {
        await supabase.functions.invoke('paytr-void-payment', {
          body: { paytr_token: giftData.paytr_token },
        });
      }

      const { data: gift, error } = await supabase
        .from('gifts')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', giftId)
        .eq('giver_id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (!gift) throw new Error('Failed to cancel gift');

      logger.info('[GiftOffer] Offer cancelled, PayTR voided:', giftId);
      return { success: true, gift: gift as GiftOffer };
    } catch (error) {
      logger.error('[GiftOffer] Cancel offer error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to cancel offer',
      };
    }
  },
};

export default giftOfferService;
