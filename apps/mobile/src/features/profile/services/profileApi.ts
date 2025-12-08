import { supabase } from '@/services/api/supabaseClient';

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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Profil güncelle
   */
  update: async (updates: UpdateProfileDto) => {
    const { data: { user } } = await supabase.auth.getUser();
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

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

    return {
      trust_score: data.trust_score,
      is_verified: data.is_verified,
      reviews_count: reviewsCount || 0,
      trips_count: tripsCount || 0,
      member_since: data.created_at,
    };
  },

  /**
   * Trust score detayları
   */
  getTrustScore: async (userId: string) => {
    const { data, error } = await supabase
      .from('trust_scores')
      .select('*')
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
    const { data, error } = await supabase
      .from('proofs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Moment'ları getir
   */
  getMoments: async (userId: string) => {
    const { data, error } = await supabase
      .from('moments')
      .select('*, profiles(*)')
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
    const { data: { user } } = await supabase.auth.getUser();
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

      const { data } = supabase.storage
        .from('moments')
        .getPublicUrl(filePath);

      imageUrl = data.publicUrl;
    }

    const { data, error } = await supabase
      .from('moments')
      .insert({
        user_id: user.id,
        content: momentData.get('content'),
        image_url: imageUrl,
      })
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
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', momentId);

    if (error) throw error;
  },

  /**
   * Kullanıcıyı engelle
   */
  blockUser: async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('blocked_users')
      .insert({
        blocker_id: user.id,
        blocked_id: userId,
      });

    if (error) throw error;
  },

  /**
   * Kullanıcı engelini kaldır
   */
  unblockUser: async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', userId);

    if (error) throw error;
  },
};
