/**
 * Gift Offer Service
 * Manages gift offers in chat - sending, accepting, declining
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface GiftOffer {
  id: string;
  giver_id: string;
  receiver_id: string;
  moment_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded' | 'disputed';
  message: string | null;
  created_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
}

export interface CreateGiftOfferData {
  receiverId: string;
  momentId?: string;
  amount: number;
  currency?: string;
  message?: string;
  conversationId?: string;
}

export interface GiftOfferResponse {
  success: boolean;
  gift?: GiftOffer;
  error?: string;
}

/**
 * Gift Offer Service for managing gift offers in chat
 */
export const giftOfferService = {
  /**
   * Create a new gift offer (pending status)
   */
  createOffer: async (data: CreateGiftOfferData): Promise<GiftOfferResponse> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: gift, error } = await supabase
        .from('gifts')
        .insert({
          giver_id: user.id,
          receiver_id: data.receiverId,
          moment_id: data.momentId || null,
          amount: data.amount,
          currency: data.currency || 'TRY',
          status: 'pending',
          message: data.message || null,
          metadata: data.conversationId ? { conversation_id: data.conversationId } : {},
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('[GiftOffer] Offer created:', gift.id);
      return { success: true, gift };
    } catch (error) {
      logger.error('[GiftOffer] Create offer error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create offer'
      };
    }
  },

  /**
   * Accept a gift offer
   * This marks the gift as accepted and initiates the payment process
   */
  acceptOffer: async (giftId: string): Promise<GiftOfferResponse> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First verify the gift exists and user is the receiver
      const { data: existingGift, error: fetchError } = await supabase
        .from('gifts')
        .select('id, receiver_id, status, giver_id, amount, currency, moment_id')
        .eq('id', giftId)
        .single();

      if (fetchError) throw fetchError;
      if (!existingGift) throw new Error('Gift offer not found');
      if (existingGift.receiver_id !== user.id) throw new Error('Not authorized to accept this offer');
      if (existingGift.status !== 'pending') throw new Error('Offer is no longer pending');

      // Update gift status to completed (payment would be processed here in production)
      // In a real implementation, this would trigger the payment flow
      const { data: gift, error } = await supabase
        .from('gifts')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', giftId)
        .eq('receiver_id', user.id) // Security: ensure user owns this
        .select()
        .single();

      if (error) throw error;

      logger.info('[GiftOffer] Offer accepted:', giftId);
      return { success: true, gift };
    } catch (error) {
      logger.error('[GiftOffer] Accept offer error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to accept offer'
      };
    }
  },

  /**
   * Decline a gift offer
   */
  declineOffer: async (giftId: string): Promise<GiftOfferResponse> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify the gift exists and user is the receiver
      const { data: existingGift, error: fetchError } = await supabase
        .from('gifts')
        .select('id, receiver_id, status')
        .eq('id', giftId)
        .single();

      if (fetchError) throw fetchError;
      if (!existingGift) throw new Error('Gift offer not found');
      if (existingGift.receiver_id !== user.id) throw new Error('Not authorized to decline this offer');
      if (existingGift.status !== 'pending') throw new Error('Offer is no longer pending');

      // Update gift status to cancelled
      const { data: gift, error } = await supabase
        .from('gifts')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', giftId)
        .eq('receiver_id', user.id)
        .select()
        .single();

      if (error) throw error;

      logger.info('[GiftOffer] Offer declined:', giftId);
      return { success: true, gift };
    } catch (error) {
      logger.error('[GiftOffer] Decline offer error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to decline offer'
      };
    }
  },

  /**
   * Get pending offers for current user (as receiver)
   */
  getPendingOffers: async (): Promise<GiftOffer[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('gifts')
        .select(`
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
          cancelled_at
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('gifts')
        .select(`
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
          cancelled_at
        `)
        .eq('id', giftId)
        .single();

      if (error) throw error;

      // Verify user is either giver or receiver
      if (data.giver_id !== user.id && data.receiver_id !== user.id) {
        return null;
      }

      return data;
    } catch (error) {
      logger.error('[GiftOffer] Get offer error:', error);
      return null;
    }
  },

  /**
   * Cancel an offer (as giver)
   */
  cancelOffer: async (giftId: string): Promise<GiftOfferResponse> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: gift, error } = await supabase
        .from('gifts')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', giftId)
        .eq('giver_id', user.id) // Only giver can cancel
        .eq('status', 'pending') // Only pending offers
        .select()
        .single();

      if (error) throw error;

      logger.info('[GiftOffer] Offer cancelled:', giftId);
      return { success: true, gift };
    } catch (error) {
      logger.error('[GiftOffer] Cancel offer error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel offer'
      };
    }
  },
};

export default giftOfferService;
