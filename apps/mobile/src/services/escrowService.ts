/**
 * Escrow Service
 *
 * Titan Protocol Escrow Matrix implementation:
 * - $0-$30: Direct payment (no escrow)
 * - $30-$100: Optional escrow (user chooses)
 * - $100+: Mandatory escrow (forced protection)
 *
 * Separated from payment service for single-responsibility principle.
 */

import { supabase } from '../config/supabase';
import { callRpc } from './supabaseRpc';
import { logger } from '../utils/logger';
import { VALUES } from '../constants/values';
import type { Database } from '../types/database.types';

// ============================================
// Types
// ============================================

export type EscrowMode = 'direct' | 'optional' | 'mandatory';

export interface EscrowDecision {
  mode: EscrowMode;
  useEscrow: boolean;
  reason: string;
}

export interface EscrowTransaction {
  id: string;
  sender_id: string;
  recipient_id: string;
  amount: number;
  // FIXED: Added all statuses from database migration
  status: 'pending' | 'processing' | 'released' | 'refunded' | 'disputed' | 'expired' | 'cancelled';
  release_condition: string;
  created_at: string;
  expires_at: string;
  moment_id?: string;
}

// Helper function to check if escrow is in a completed state
export function isEscrowCompleted(status: EscrowTransaction['status']): boolean {
  return ['released', 'refunded', 'disputed', 'expired', 'cancelled'].includes(status);
}

// Helper function to check if escrow can be modified
export function isEscrowModifiable(status: EscrowTransaction['status']): boolean {
  return ['pending', 'processing'].includes(status);
}

// RPC Response Types
interface AtomicTransferResponse {
  senderTxnId: string;
  recipientTxnId: string;
}

interface CreateEscrowResponse {
  escrowId: string;
  transactionId?: string;
}

interface EscrowOperationResponse {
  success: boolean;
}

// ============================================
// Escrow Mode Helpers
// ============================================

/**
 * Determine escrow mode based on amount
 */
export function determineEscrowMode(amount: number): EscrowMode {
  if (amount < VALUES.ESCROW_DIRECT_MAX) {
    return 'direct'; // < $30: Direct pay
  } else if (amount < VALUES.ESCROW_OPTIONAL_MAX) {
    return 'optional'; // $30-$100: User chooses
  } else {
    return 'mandatory'; // >= $100: Must escrow
  }
}

/**
 * Get user-friendly escrow explanation
 */
export function getEscrowExplanation(mode: EscrowMode, amount: number): string {
  switch (mode) {
    case 'direct':
      return `Payment of $${amount} will be sent directly to the recipient immediately.`;

    case 'optional':
      return `For payments between $${VALUES.ESCROW_DIRECT_MAX}-$${VALUES.ESCROW_OPTIONAL_MAX}, you can choose escrow protection. Funds are held until proof is verified.`;

    case 'mandatory':
      return `Payments over $${VALUES.ESCROW_OPTIONAL_MAX} must use escrow protection for your safety. Funds will be released when proof is verified.`;
  }
}

// ============================================
// Escrow Service
// ============================================

class EscrowService {
  /**
   * Transfer funds with Titan Protocol escrow rules
   */
  async transferFunds(params: {
    amount: number;
    recipientId: string;
    momentId?: string;
    message?: string;
    escrowChoiceCallback?: (amount: number) => Promise<boolean>;
  }): Promise<{
    success: boolean;
    transactionId: string;
    escrowId?: string;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { amount, recipientId, momentId, message, escrowChoiceCallback } =
        params;

      const escrowMode = determineEscrowMode(amount);

      switch (escrowMode) {
        case 'direct': {
          logger.info(`[Escrow] Direct transfer: $${amount}`);
          const { data: directData, error: directError } =
            await callRpc<AtomicTransferResponse>('atomic_transfer', {
              p_sender_id: user.id,
              p_recipient_id: recipientId,
              p_amount: amount,
              p_moment_id: momentId,
              p_message: message,
            });

          if (directError) {
            logger.error('[Escrow] Direct transfer failed', {
              directError,
              amount,
              recipientId,
            });
            throw new Error('Transfer failed. Please try again.');
          }

          if (!directData?.senderTxnId) {
            throw new Error(
              'Transfer completed but transaction ID missing. Please contact support.',
            );
          }

          // MASTER: Mark transaction as pending thank you for BulkThankYouScreen
          // This triggers the thank you flow for Tier 1 ($0-30) direct transfers
          if (momentId) {
            await supabase
              .from('gifts')
              .update({ thank_you_pending: true })
              .eq('moment_id', momentId)
              .eq('sender_id', user.id)
              .eq('status', 'completed');
            logger.info(
              '[Escrow] Marked gift as thank_you_pending for bulk flow',
            );
          }

          return {
            success: true,
            transactionId: directData.senderTxnId,
          };
        }

        case 'optional': {
          logger.info(`[Escrow] Optional escrow range: $${amount}`);
          const useEscrow = escrowChoiceCallback
            ? await escrowChoiceCallback(amount)
            : true;

          if (useEscrow) {
            const { data: escrowData, error: escrowError } =
              await callRpc<CreateEscrowResponse>('create_escrow_transaction', {
                p_sender_id: user.id,
                p_recipient_id: recipientId,
                p_amount: amount,
                p_moment_id: momentId,
                p_release_condition: 'proof_verified',
              });

            if (escrowError) {
              throw new Error('Failed to create escrow. Please try again.');
            }

            if (!escrowData?.escrowId) {
              throw new Error(
                'Escrow created but ID missing. Please contact support.',
              );
            }

            return {
              success: true,
              transactionId: escrowData.transactionId || escrowData.escrowId,
              escrowId: escrowData.escrowId,
            };
          } else {
            const { data: directData2, error: directError2 } =
              await callRpc<AtomicTransferResponse>('atomic_transfer', {
                p_sender_id: user.id,
                p_recipient_id: recipientId,
                p_amount: amount,
                p_moment_id: momentId,
                p_message: message,
              });

            if (directError2) {
              throw new Error('Transfer failed. Please try again.');
            }

            if (!directData2?.senderTxnId) {
              throw new Error(
                'Transfer completed but transaction ID missing. Please contact support.',
              );
            }

            return {
              success: true,
              transactionId: directData2.senderTxnId,
            };
          }
        }

        case 'mandatory': {
          logger.info(`[Escrow] Mandatory escrow: $${amount}`);
          const { data: mandatoryData, error: mandatoryError } =
            await callRpc<CreateEscrowResponse>('create_escrow_transaction', {
              p_sender_id: user.id,
              p_recipient_id: recipientId,
              p_amount: amount,
              p_moment_id: momentId,
              p_release_condition: 'proof_verified',
            });

          if (mandatoryError) {
            throw new Error('Failed to create escrow. Please try again.');
          }

          if (!mandatoryData?.escrowId) {
            throw new Error(
              'Escrow created but ID missing. Please contact support.',
            );
          }

          return {
            success: true,
            transactionId:
              mandatoryData.transactionId || mandatoryData.escrowId,
            escrowId: mandatoryData.escrowId,
          };
        }

        default:
          throw new Error(`Unknown escrow mode: ${escrowMode}`);
      }
    } catch (error) {
      logger.error('Transfer funds error:', error);
      if (error instanceof Error && error.message.includes('Please')) {
        throw error;
      }
      throw new Error('Transfer failed. Please try again later.');
    }
  }

  /**
   * Release escrow after proof verification
   */
  async releaseEscrow(escrowId: string): Promise<{ success: boolean }> {
    try {
      const { data, error } = await callRpc<EscrowOperationResponse>(
        'release_escrow',
        { p_escrow_id: escrowId },
      );

      if (error) throw error;

      return { success: data?.success ?? false };
    } catch (error) {
      logger.error('Release escrow error:', error);
      throw error;
    }
  }

  /**
   * Request refund for pending escrow
   */
  async refundEscrow(
    escrowId: string,
    reason: string,
  ): Promise<{ success: boolean }> {
    try {
      const { data, error } = await callRpc<EscrowOperationResponse>(
        'refund_escrow',
        {
          p_escrow_id: escrowId,
          p_reason: reason,
        },
      );

      if (error) throw error;

      return { success: data?.success ?? false };
    } catch (error) {
      logger.error('Refund escrow error:', error);
      throw error;
    }
  }

  /**
   * Get user's pending escrow transactions
   */
  async getUserEscrowTransactions(): Promise<EscrowTransaction[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('escrow_transactions')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = data as unknown as
        | Database['public']['Tables']['escrow_transactions']['Row'][]
        | null;

      return (rows || []).map((r) => ({
        id: r.id,
        sender_id: r.sender_id,
        recipient_id: r.recipient_id,
        amount: r.amount,
        status: r.status as EscrowTransaction['status'],
        release_condition: r.release_condition,
        created_at: r.created_at,
        expires_at: r.expires_at,
        moment_id: r.moment_id || undefined,
      }));
    } catch (error) {
      logger.error('Get escrow transactions error:', error);
      return [];
    }
  }
}

export const escrowService = new EscrowService();
