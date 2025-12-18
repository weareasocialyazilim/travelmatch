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
   * Moment sil (soft delete)
   */
  deleteMoment: async (momentId: string) => {
    const { error } = await supabase
      .from('moments')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as import('@/types/database.types').Database['public']['Tables']['moments']['Update'])
      .eq('id', momentId);

    if (error) throw error;
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
