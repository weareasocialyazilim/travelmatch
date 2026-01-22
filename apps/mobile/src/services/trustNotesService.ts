/**
 * Trust Notes Service
 * Handles thank-you notes from gift receivers to gift senders
 *
 * Philosophy: One-way gratitude system (not reviews)
 * Only gift receiver → gift sender
 */

import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import {
  validateNoteContent,
  hasWarningWords,
} from '@/constants/trustNotesRules';

export interface TrustNote {
  id: string;
  writerId: string;
  writerName: string;
  writerAvatar?: string;
  receiverId: string;
  momentId?: string;
  momentTitle?: string;
  note: string;
  createdAt: string;
  isPublic: boolean;
}

export interface CreateTrustNoteParams {
  receiverId: string;
  note: string;
  momentId?: string;
  escrowId?: string;
  giftId?: string;
}

/**
 * Create a trust note
 */
export const createTrustNote = async (
  params: CreateTrustNoteParams,
): Promise<{
  success: boolean;
  noteId?: string;
  error?: string;
  flagged?: boolean;
}> => {
  try {
    // Validate note content using rules
    const validation = validateNoteContent(params.note);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check for warning words (flag for review but don't block)
    const flagged = hasWarningWords(params.note);

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('trust_notes')
      .insert({
        author_id: user.id,
        recipient_id: params.receiverId,
        note: params.note,
        moment_id: params.momentId || null,
        escrow_id: params.escrowId || null,
        gift_id: params.giftId || null,
        is_public: true,
        is_approved: false,
      })
      .select('id')
      .single();

    if (error) throw error;

    const noteId = (data as { id: string } | null)?.id;

    logger.info('[TrustNotes] Note created', {
      noteId,
      flagged,
    });

    // If flagged, log for admin review
    if (flagged) {
      logger.warn('[TrustNotes] Note flagged for review', {
        noteId,
        reason: 'warning_words_detected',
      });
    }

    return {
      success: true,
      noteId,
      flagged,
    };
  } catch (error) {
    logger.error('[TrustNotes] Failed to create note', error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Get trust notes for a user (received notes shown on profile)
 */
export const getTrustNotesForUser = async (
  userId: string,
  limit: number = 10,
  offset: number = 0,
): Promise<TrustNote[]> => {
  try {
    const { data, error } = await (supabase as any).rpc(
      'get_user_trust_notes',
      {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset,
      },
    );

    if (error) throw error;

    return (
      (data || []) as {
        id: string;
        author_name: string;
        author_avatar: string | null;
        note: string;
        moment_title: string | null;
        created_at: string;
      }[]
    ).map((note) => ({
      id: note.id,
      writerId: '',
      writerName: note.author_name || 'Kullanıcı',
      writerAvatar: note.author_avatar || undefined,
      receiverId: userId,
      momentId: undefined,
      momentTitle: note.moment_title || undefined,
      note: note.note,
      createdAt: note.created_at,
      isPublic: true,
    }));
  } catch (error) {
    const errorMessage = String((error as { message?: string }).message || '');
    if (errorMessage.toLowerCase().includes('permission denied')) {
      return [];
    }
    logger.error('[TrustNotes] Failed to get notes', error as Error);
    return [];
  }
};

/**
 * Get trust note count for a user
 */
export const getTrustNoteCount = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await (supabase as any).rpc(
      'get_user_trust_note_count',
      {
        p_user_id: userId,
      },
    );

    if (error) throw error;

    return Number(data || 0);
  } catch (error) {
    const errorMessage = String((error as { message?: string }).message || '');
    if (errorMessage.toLowerCase().includes('permission denied')) {
      return 0;
    }
    logger.error('[TrustNotes] Failed to get count', error as Error);
    return 0;
  }
};

/**
 * Get recent trust notes (for profile preview)
 */
export const getRecentTrustNotes = async (
  userId: string,
  limit: number = 3,
): Promise<TrustNote[]> => {
  try {
    const { data, error } = await (supabase as any).rpc(
      'get_user_trust_notes',
      {
        p_user_id: userId,
        p_limit: limit,
        p_offset: 0,
      },
    );

    if (error) throw error;

    return (
      (data || []) as {
        id: string;
        author_name: string;
        author_avatar: string | null;
        note: string;
        moment_title: string | null;
        created_at: string;
      }[]
    ).map((note) => ({
      id: note.id,
      writerId: '',
      writerName: note.author_name || 'Kullanıcı',
      writerAvatar: note.author_avatar || undefined,
      receiverId: userId,
      momentId: undefined,
      momentTitle: note.moment_title || undefined,
      note: note.note,
      createdAt: note.created_at,
      isPublic: true,
    }));
  } catch (error) {
    const errorMessage = String((error as { message?: string }).message || '');
    if (errorMessage.toLowerCase().includes('permission denied')) {
      return [];
    }
    logger.error('[TrustNotes] Failed to get recent notes', error as Error);
    return [];
  }
};

/**
 * Delete a trust note (only writer can delete)
 */
export const deleteTrustNote = async (
  noteId: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('trust_notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;

    logger.info('[TrustNotes] Note deleted', { noteId });

    return { success: true };
  } catch (error) {
    logger.error('[TrustNotes] Failed to delete note', error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Update trust note visibility
 */
export const updateTrustNoteVisibility = async (
  noteId: string,
  isPublic: boolean,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('trust_notes')
      .update({ is_public: isPublic })
      .eq('id', noteId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    logger.error('[TrustNotes] Failed to update visibility', error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Check if user has already written a note for this gift
 */
export const hasWrittenNoteForGift = async (
  giftId: string,
): Promise<boolean> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('trust_notes')
      .select('id')
      .eq('author_id', user.id)
      .eq('gift_id', giftId)
      .limit(1);

    if (error) throw error;

    return (data?.length || 0) > 0;
  } catch (error) {
    logger.error('[TrustNotes] Failed to check existing note', error as Error);
    return false;
  }
};

export default {
  createTrustNote,
  getTrustNotesForUser,
  getTrustNoteCount,
  getRecentTrustNotes,
  deleteTrustNote,
  updateTrustNoteVisibility,
  hasWrittenNoteForGift,
};
