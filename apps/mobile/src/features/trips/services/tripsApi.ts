import { supabase } from '@/config/supabase';

export interface TripFilters {
  destination?: string;
  startDate?: Date;
  endDate?: Date;
  maxTravelers?: number;
  minBudget?: number;
  maxBudget?: number;
  tags?: string[];
}

export interface CreateTripDto {
  title: string;
  description?: string;
  destination: string;
  start_date: string;
  end_date: string;
  max_travelers?: number;
  budget_range?: {
    min: number;
    max: number;
    currency: string;
  };
  tags?: string[];
}

export interface UpdateTripDto {
  title?: string;
  description?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  max_travelers?: number;
  budget_range?: {
    min: number;
    max: number;
    currency: string;
  };
  tags?: string[];
  is_published?: boolean;
}

/**
 * Trips API Service
 * 
 * Trip yönetimi için tüm API çağrıları
 */
export const tripsApi = {
  /**
   * Tüm trip'leri getir (filtreleme ile)
   */
  getAll: async (filters?: TripFilters) => {
    let query = supabase
      .from('trips')
      .select('*, profiles(*)')
      .eq('is_published', true)
      .is('deleted_at', null);

    if (filters?.destination) {
      query = query.ilike('destination', `%${filters.destination}%`);
    }

    if (filters?.startDate) {
      query = query.gte('start_date', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('end_date', filters.endDate.toISOString());
    }

    if (filters?.maxTravelers) {
      query = query.lte('max_travelers', filters.maxTravelers);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * ID ile trip getir
   */
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('trips')
      .select('*, profiles(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Yeni trip oluştur
   */
  create: async (trip: CreateTripDto) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('trips')
      .insert({
        ...trip,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Trip güncelle
   */
  update: async (id: string, updates: UpdateTripDto) => {
    const { data, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Trip sil (soft delete)
   */
  delete: async (id: string) => {
    const { error } = await supabase
      .from('trips')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Kullanıcının trip'lerini getir
   */
  getMyTrips: async (userId: string) => {
    // SECURITY: Explicit column selection - never use select('*')
    const { data, error } = await supabase
      .from('trips')
      .select(`
        id,
        user_id,
        title,
        description,
        destination,
        start_date,
        end_date,
        status,
        max_participants,
        price,
        currency,
        image_url,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Booking detaylarını getir
   */
  getBooking: async (bookingId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, trips(*), profiles(*)')
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Trip'e katılım isteği gönder
   */
  requestJoin: async (tripId: string, message?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('trip_requests')
      .insert({
        trip_id: tripId,
        user_id: user.id,
        message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Katılım isteğini onayla/reddet
   */
  respondToRequest: async (requestId: string, status: 'approved' | 'rejected') => {
    const { data, error } = await supabase
      .from('trip_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
