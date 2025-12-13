// ============================================
// BLOCKER #3 FIX: Escrow Business Logic (Frontend)
// File: apps/mobile/src/services/paymentService.ts
// ============================================

import { supabase } from '@/config/supabase';
import { VALUES } from '@/constants/values';

export type EscrowMode = 'direct' | 'optional' | 'mandatory';

export interface EscrowDecision {
  mode: EscrowMode;
  useEscrow: boolean;
  reason: string;
}

/**
 * Titan Plan v2.0 Escrow Matrix:
 * - $0-$30: Direct payment (no escrow)
 * - $30-$100: Optional escrow (user chooses)
 * - $100+: Mandatory escrow (forced protection)
 */
export function determineEscrowMode(amount: number): EscrowMode {
  if (amount < VALUES.ESCROW_DIRECT_MAX) {
    return 'direct';  // < $30: Direct pay
  } else if (amount < VALUES.ESCROW_OPTIONAL_MAX) {
    return 'optional';  // $30-$100: User chooses
  } else {
    return 'mandatory';  // >= $100: Must escrow
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

/**
 * Show escrow choice modal to user (for optional range)
 * Returns true if user chooses escrow
 */
async function showEscrowChoiceModal(amount: number): Promise<boolean> {
  // This would trigger a React Native modal
  // For now, return a placeholder
  // TODO: Implement actual modal UI
  return new Promise((resolve) => {
    // Modal shows:
    // "Protect your $X payment with escrow?"
    // [Yes, use escrow] [No, send directly]
    // resolve(userChoice);
    resolve(true); // Default to safer option
  });
}

/**
 * Process payment with Titan Plan escrow rules
 */
export async function processPayment(params: {
  amount: number;
  recipientId: string;
  momentId?: string;
  message?: string;
}) {
  const { amount, recipientId, momentId, message } = params;

  // Determine escrow mode based on amount
  const escrowMode = determineEscrowMode(amount);

  switch (escrowMode) {
    case 'direct':
      // < $30: Direct atomic transfer (no escrow)
      console.log(`[Payment] Direct transfer: $${amount}`);
      return await supabase.rpc('atomic_transfer', {
        p_sender_id: (await supabase.auth.getUser()).data.user?.id,
        p_recipient_id: recipientId,
        p_amount: amount,
        p_moment_id: momentId,
        p_message: message,
      });

    case 'optional':
      // $30-$100: Ask user preference
      console.log(`[Payment] Optional escrow range: $${amount}`);
      const useEscrow = await showEscrowChoiceModal(amount);

      if (useEscrow) {
        // User chose escrow protection
        return await supabase.rpc('create_escrow_transaction', {
          p_sender_id: (await supabase.auth.getUser()).data.user?.id,
          p_recipient_id: recipientId,
          p_amount: amount,
          p_moment_id: momentId,
          p_release_condition: 'proof_verified',
        });
      } else {
        // User chose direct payment
        return await supabase.rpc('atomic_transfer', {
          p_sender_id: (await supabase.auth.getUser()).data.user?.id,
          p_recipient_id: recipientId,
          p_amount: amount,
          p_moment_id: momentId,
          p_message: message,
        });
      }

    case 'mandatory':
      // >= $100: Force escrow (no choice)
      console.log(`[Payment] Mandatory escrow: $${amount}`);
      return await supabase.rpc('create_escrow_transaction', {
        p_sender_id: (await supabase.auth.getUser()).data.user?.id,
        p_recipient_id: recipientId,
        p_amount: amount,
        p_moment_id: momentId,
        p_release_condition: 'proof_verified',
      });

    default:
      throw new Error(`Unknown escrow mode: ${escrowMode}`);
  }
}

/**
 * Release escrow after proof verification
 * Called by moment owner after submitting proof
 */
export async function releaseEscrow(escrowId: string) {
  const { data, error } = await supabase.rpc('release_escrow', {
    p_escrow_id: escrowId,
  });

  if (error) throw error;
  return data;
}

/**
 * Request refund for pending escrow
 * Can be called by sender if proof not submitted within time limit
 */
export async function refundEscrow(escrowId: string, reason: string) {
  const { data, error } = await supabase.rpc('refund_escrow', {
    p_escrow_id: escrowId,
    p_reason: reason,
  });

  if (error) throw error;
  return data;
}

/**
 * Get user's pending escrow transactions
 */
export async function getUserEscrowTransactions(userId: string) {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('*')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/* ============================================
 * USAGE EXAMPLES:
 * ============================================
 *
 * // Example 1: $25 payment (direct)
 * await processPayment({
 *   amount: 25,
 *   recipientId: 'user-123',
 *   momentId: 'moment-456',
 * });
 * // → Calls atomic_transfer (instant)
 *
 * // Example 2: $50 payment (optional - user chooses)
 * await processPayment({
 *   amount: 50,
 *   recipientId: 'user-123',
 *   momentId: 'moment-456',
 * });
 * // → Shows modal, if user chooses escrow: create_escrow_transaction
 * // → Otherwise: atomic_transfer
 *
 * // Example 3: $150 payment (mandatory escrow)
 * await processPayment({
 *   amount: 150,
 *   recipientId: 'user-123',
 *   momentId: 'moment-456',
 * });
 * // → Automatically calls create_escrow_transaction
 * // → No choice given
 *
 * // Example 4: Release escrow after proof verified
 * await releaseEscrow('escrow-789');
 * // → Credits recipient, updates status to 'released'
 *
 * // Example 5: Refund expired escrow
 * await refundEscrow('escrow-789', 'proof_not_submitted');
 * // → Refunds sender, updates status to 'refunded'
 * ============================================
 */
