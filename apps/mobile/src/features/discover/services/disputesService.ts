import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

export interface Dispute {
  id: string;
  transaction_id?: string;
  proof_id?: string;
  reason: string;
  notes: string;
  evidence: string[];
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
  resolution?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface DisputeWithDetails extends Dispute {
  transaction?: {
    id: string;
    amount: number;
    currency: string;
    moment_title?: string;
  };
  proof?: {
    id: string;
    title: string;
    moment_title?: string;
  };
}

export const disputesApi = {
  /**
   * Submit a new dispute
   */
  submitDispute: async (params: {
    type: 'transaction' | 'proof';
    id: string;
    reason: string;
    notes: string;
    evidence?: string[];
  }): Promise<Dispute> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const foreignKey = params.type === 'transaction' ? 'transaction_id' : 'proof_id';

    const { data, error } = await supabase
      .from('disputes')
      .insert({
        [foreignKey]: params.id,
        reason: params.reason,
        notes: params.notes,
        evidence: params.evidence || [],
        status: 'pending',
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      logger.error('[Disputes] Submit failed:', error);
      throw error;
    }

    return data as Dispute;
  },

  /**
   * Get a specific dispute by ID
   */
  getDispute: async (disputeId: string): Promise<DisputeWithDetails> => {
    const { data, error } = await supabase
      .from('disputes')
      .select(`
        *,
        transaction:transactions(
          id,
          amount,
          currency,
          moments!inner(title)
        ),
        proof:proof_submissions(
          id,
          title,
          moments!inner(title)
        )
      `)
      .eq('id', disputeId)
      .single();

    if (error) {
      logger.error('[Disputes] Get dispute failed:', error);
      throw error;
    }

    return data as DisputeWithDetails;
  },

  /**
   * Get all disputes for the current user
   */
  getMyDisputes: async (): Promise<Dispute[]> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('[Disputes] Get my disputes failed:', error);
      throw error;
    }

    return data as Dispute[];
  },

  /**
   * Get pending disputes count for badge
   */
  getPendingCount: async (): Promise<number> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('disputes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['pending', 'in_review']);

    if (error) {
      logger.warn('[Disputes] Get pending count failed:', error);
      return 0;
    }

    return count || 0;
  },

  /**
   * Cancel a pending dispute (only if not yet reviewed)
   */
  cancelDispute: async (disputeId: string): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Verify dispute belongs to user and is still pending
    const { data: existing } = await supabase
      .from('disputes')
      .select('id, user_id, status')
      .eq('id', disputeId)
      .single();

    if (!existing || existing.user_id !== user.id) {
      throw new Error('Dispute not found');
    }

    if (existing.status !== 'pending') {
      throw new Error('Cannot cancel dispute that is already under review');
    }

    const { error } = await supabase
      .from('disputes')
      .update({
        status: 'dismissed',
        resolution: 'User cancelled',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', disputeId);

    if (error) {
      logger.error('[Disputes] Cancel failed:', error);
      throw error;
    }
  },
};
