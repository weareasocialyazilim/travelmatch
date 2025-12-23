import { supabase } from '@/config/supabase';

export interface UpdateProfileDto {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
}

/**
 * Profile API Service
 *
 * Kullanıcı profili yönetimi için API çağrıları
 * Uses 'users' table from database
 */
export const profileApi = {
  /**
   * ID ile profil getir
   */
  getById: async (userId: string) => {
    // SECURITY: Explicit column selection - never use select('*')
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        id,
        email,
        full_name,
        avatar_url,
        bio,
        location,
        verified,
        rating,
        review_count,
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
      .from('users')
      .select(
        `
        id,
        email,
        full_name,
        avatar_url,
        bio,
        location,
        verified,
        rating,
        review_count,
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
      .from('users')
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
      .from('users')
      .select('verified, created_at, rating')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Get reviews count
    const { count: reviewsCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('reviewed_id', userId);

    const row = data as {
      verified?: boolean;
      created_at?: string;
      rating?: number;
    } | null;

    return {
      rating: row?.rating,
      verified: row?.verified,
      reviews_count: reviewsCount || 0,
      member_since: row?.created_at,
    };
  },

  /**
   * Moment'ları getir
   */
  getMoments: async (userId: string) => {
    const { data, error } = await supabase
      .from('moments')
      .select(
        `
        id,
        user_id,
        title,
        description,
        location,
        date,
        category,
        images,
        created_at,
        updated_at
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

    const { error } = await supabase.from('blocks').insert({
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
      .from('blocks')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', userId);

    if (error) throw error;
  },
};
