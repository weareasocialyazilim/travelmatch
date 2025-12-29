/**
 * Trust Notes Service
 * Handles thank-you notes from gift receivers to gift senders
 */

import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

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
  params: CreateTrustNoteParams
): Promise<{ success: boolean; noteId?: string; error?: string }> => {
  try {
    // Validate note length
    if (params.note.length < 10) {
      return { success: false, error: 'Not en az 10 karakter olmalı' };
    }

    if (params.note.length > 280) {
      return { success: false, error: 'Not 280 karakteri geçemez' };
    }

    const { data, error } = await supabase.rpc('create_trust_note', {
      p_receiver_id: params.receiverId,
      p_note: params.note,
      p_moment_id: params.momentId || null,
      p_escrow_id: params.escrowId || null,
      p_gift_id: params.giftId || null,
    });

    if (error) throw error;

    logger.info('[TrustNotes] Note created', { noteId: data?.noteId });

    return {
      success: true,
      noteId: data?.noteId
    };
  } catch (error) {
    logger.error('[TrustNotes] Failed to create note', error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

/**
 * Get trust notes for a user (received notes shown on profile)
 */
export const getTrustNotesForUser = async (
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<TrustNote[]> => {
  try {
    const { data, error } = await supabase
      .from('trust_notes')
      .select(`
        id,
        author_id,
        recipient_id,
        moment_id,
        note,
        created_at,
        is_public,
        author:users!author_id(full_name, avatar_url),
        moment:moments(title)
      `)
      .eq('recipient_id', userId)
      .eq('is_public', true)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (data || []).map((note: {
      id: string;
      author_id: string;
      recipient_id: string;
      moment_id: string | null;
      note: string;
      created_at: string;
      is_public: boolean;
      author: { full_name: string; avatar_url: string | null } | null;
      moment: { title: string } | null;
    }) => ({
      id: note.id,
      writerId: note.author_id,
      writerName: note.author?.full_name || 'Kullanıcı',
      writerAvatar: note.author?.avatar_url || undefined,
      receiverId: note.recipient_id,
      momentId: note.moment_id || undefined,
      momentTitle: note.moment?.title,
      note: note.note,
      createdAt: note.created_at,
      isPublic: note.is_public,
    }));
  } catch (error) {
    logger.error('[TrustNotes] Failed to get notes', error as Error);
    return [];
  }
};

/**
 * Get trust note count for a user
 */
export const getTrustNoteCount = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('get_user_trust_note_count', {
      p_user_id: userId,
    });

    if (error) throw error;

    return data || 0;
  } catch (error) {
    logger.error('[TrustNotes] Failed to get count', error as Error);
    return 0;
  }
};

/**
 * Get recent trust notes (for profile preview)
 */
export const getRecentTrustNotes = async (
  userId: string,
  limit: number = 3
): Promise<TrustNote[]> => {
  try {
    const { data, error } = await supabase.rpc('get_user_trust_notes', {
      p_user_id: userId,
      p_limit: limit,
      p_offset: 0,
    });

    if (error) throw error;

    return (data || []).map((note: {
      id: string;
      author_name: string;
      author_avatar: string | null;
      note: string;
      moment_title: string | null;
      created_at: string;
    }) => ({
      id: note.id,
      writerId: '',
      writerName: note.author_name,
      writerAvatar: note.author_avatar || undefined,
      receiverId: userId,
      momentTitle: note.moment_title || undefined,
      note: note.note,
      createdAt: note.created_at,
      isPublic: true,
    }));
  } catch (error) {
    logger.error('[TrustNotes] Failed to get recent notes', error as Error);
    return [];
  }
};

/**
 * Delete a trust note (only writer can delete)
 */
export const deleteTrustNote = async (
  noteId: string
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
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

/**
 * Update trust note visibility
 */
export const updateTrustNoteVisibility = async (
  noteId: string,
  isPublic: boolean
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
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

/**
 * Check if user has already written a note for this gift
 */
export const hasWrittenNoteForGift = async (
  giftId: string
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
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
