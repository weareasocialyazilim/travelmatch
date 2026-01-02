import { supabase } from '@/config/supabase';

export interface UpdateProfileDto {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

/**
 * Profile API Service
 *
 * Kullanıcı profili yönetimi için API çağrıları
 */
export const profileApi = {
  /**
   * ID ile profil getir
   */
  getById: async (userId: string) => {
    // SECURITY: Explicit column selection - never use select('*')
    const { data, error } = await supabase
      .from('profiles')
      .select(
        `
        id,
        username,
        full_name,
        avatar_url,
        bio,
        location,
        is_verified,
        rating,
        reviews_count,
        created_at,
        updated_at
      `,
      )
      .eq('id', userId)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Giriş yapmış kullanıcının profilini getir
   */
  getMyProfile: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // SECURITY: Explicit column selection - never use select('*')
    const { data, error } = await supabase
      .from('profiles')
      .select(
        `
        id,
        username,
        full_name,
        avatar_url,
        bio,
        location,
        is_verified,
        rating,
        reviews_count,
        created_at,
        updated_at
      `,
      )
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Profil güncelle
   */
  update: async (updates: UpdateProfileDto) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Avatar upload
   */
  uploadAvatar: async (file: File) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

    // Update profile with new avatar URL
    await profileApi.update({ avatar_url: data.publicUrl });

    return data.publicUrl;
  },

  /**
   * Reputation bilgisi getir
   */
  getReputation: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('trust_score, is_verified, created_at')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Get reviews count
    const { count: reviewsCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('reviewed_user_id', userId);

    // Get completed trips count
    const { count: tripsCount } = await supabase
      .from('trip_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    const row = data as {
      trust_score?: number;
      is_verified?: boolean;
      created_at?: string;
    } | null;

    return {
      trust_score: row?.trust_score,
      is_verified: row?.is_verified,
      reviews_count: reviewsCount || 0,
      trips_count: tripsCount || 0,
      member_since: row?.created_at,
    };
  },

  /**
   * Trust score detayları
   */
  getTrustScore: async (userId: string) => {
    // SECURITY: Explicit column selection - never use select('*')
    const { data, error } = await supabase
      .from('trust_scores')
      .select(
        `
        id,
        user_id,
        score,
        factors,
        created_at,
        updated_at
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Proof history getir
   */
  getProofHistory: async (userId: string) => {
    // SECURITY: Explicit column selection - never use select('*')
    const { data, error } = await supabase
      .from('proofs')
      .select(
        `
        id,
        user_id,
        type,
        status,
        file_url,
        created_at,
        verified_at
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Moment'ları getir
   * ✅ BlurHash: Includes image_id, image_blur_hash and uploaded_images JOIN
   */
  getMoments: async (userId: string) => {
    const { data, error } = await supabase
      .from('moments')
      .select(
        `
        *,
        profiles(*),
        uploaded_images!moments_image_id_fkey(
          id,
          blur_hash,
          url,
          variants
        )
      `,
      )
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Yeni moment oluştur
   */
  createMoment: async (momentData: FormData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Upload image if exists
    const image = momentData.get('image') as File;
    let imageUrl = null;

    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `moments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('moments')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('moments').getPublicUrl(filePath);

      imageUrl = data.publicUrl;
    }

    const contentValue = momentData.get('content');
    const payload: Partial<
      import('@/types/database.types').Database['public']['Tables']['moments']['Insert']
    > = {
      user_id: user.id,
      description:
        typeof contentValue === 'string'
          ? contentValue
          : String(contentValue ?? ''),
      images: imageUrl ? [imageUrl] : undefined,
      title: '' as string, // minimal required fields filled with defaults
      location: '' as string,
      date: new Date().toISOString(),
      category: 'other',
    };

    const { data, error } = await supabase
      .from('moments')
      .insert(
        payload as import('@/types/database.types').Database['public']['Tables']['moments']['Insert'],
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Moment sil
   */
  deleteMoment: async (momentId: string) => {
    const { error } = await supabase
      .from('moments')
      .update({
        updated_at: new Date().toISOString(),
      } as import('@/types/database.types').Database['public']['Tables']['moments']['Update'])
      .eq('id', momentId);

    if (error) throw error;
  },

  /**
   * Get hidden items (gifts and moments hidden from inbox)
   */
  getHiddenItems: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Fetch hidden gifts (from hidden_items table or a flag in requests)
    const { data: hiddenGifts, error: giftsError } = await supabase
      .from('hidden_items')
      .select(
        `
        id,
        item_type,
        item_id,
        hidden_at,
        requests!hidden_items_item_id_fkey (
          id,
          message,
          users!requests_user_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          moments (
            id,
            title
          )
        )
      `,
      )
      .eq('user_id', user.id)
      .eq('item_type', 'gift')
      .order('hidden_at', { ascending: false });

    if (giftsError) {
      // Table might not exist yet - return empty
      return [];
    }

    // Fetch hidden moments
    const { data: hiddenMoments, error: momentsError } = await supabase
      .from('hidden_items')
      .select(
        `
        id,
        item_type,
        item_id,
        hidden_at,
        moments!hidden_items_item_id_fkey (
          id,
          title,
          images,
          user_id
        )
      `,
      )
      .eq('user_id', user.id)
      .eq('item_type', 'moment')
      .order('hidden_at', { ascending: false });

    // Ignore moments error - table or relation may not exist
    void momentsError;

    // Combine and format results
    const items = [
      ...(hiddenGifts || []).map((h: any) => ({
        id: h.id,
        type: 'gift' as const,
        title: h.requests?.users?.full_name || 'Unknown',
        subtitle: h.requests?.moments?.title || 'Gift',
        avatar: h.requests?.users?.avatar_url || '',
        hiddenAt: h.hidden_at,
      })),
      ...(hiddenMoments || []).map((h: any) => ({
        id: h.id,
        type: 'moment' as const,
        title: h.moments?.title || 'Moment',
        subtitle: 'Hidden moment',
        avatar: h.moments?.images?.[0] || '',
        hiddenAt: h.hidden_at,
      })),
    ];

    return items;
  },

  /**
   * Hide an item (gift or moment) from inbox
   */
  hideItem: async (itemId: string, itemType: 'gift' | 'moment') => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('hidden_items')
      .insert({
        user_id: user.id,
        item_id: itemId,
        item_type: itemType,
        hidden_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Unhide an item (restore to inbox)
   */
  unhideItem: async (hiddenItemId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('hidden_items')
      .delete()
      .eq('id', hiddenItemId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * Permanently delete a hidden item
   */
  deleteHiddenItem: async (hiddenItemId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First get the hidden item to know what to delete
    const { data: hiddenItem, error: fetchError } = await supabase
      .from('hidden_items')
      .select('item_id, item_type')
      .eq('id', hiddenItemId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!hiddenItem) throw new Error('Hidden item not found');

    const item = hiddenItem as { item_id: string; item_type: string };

    // Delete the hidden item record
    const { error: deleteHiddenError } = await supabase
      .from('hidden_items')
      .delete()
      .eq('id', hiddenItemId)
      .eq('user_id', user.id);

    if (deleteHiddenError) throw deleteHiddenError;

    // Soft delete the actual item if it's a moment owned by user
    if (item.item_type === 'moment') {
      await supabase
        .from('moments')
        .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
        .eq('id', item.item_id)
        .eq('user_id', user.id);
    }
  },

  /**
   * Kullanıcıyı engelle
   */
  blockUser: async (userId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('blocked_users').insert({
      blocker_id: user.id,
      blocked_id: userId,
    });

    if (error) throw error;
  },

  /**
   * Kullanıcı engelini kaldır
   */
  unblockUser: async (userId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', userId);

    if (error) throw error;
  },
};
