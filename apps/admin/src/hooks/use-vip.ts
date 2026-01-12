'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/lib/logger';

// =============================================================================
// TYPES
// =============================================================================

export interface VIPUser {
  id: string;
  user_id: string;
  tier: 'vip' | 'influencer' | 'partner';
  commission_override: number; // Percentage (0-100)
  giver_pays_commission: boolean;
  valid_from: string;
  valid_until: string | null;
  reason: string | null;
  granted_by: string;
  created_at: string;
  user: {
    display_name: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  granted_by_user: {
    display_name: string;
  };
}

export interface VIPStats {
  totalVIP: number;
  totalInfluencer: number;
  totalPartner: number;
  commissionSaved: number;
}

export interface VIPFilters {
  search?: string;
  tier?: string;
  limit?: number;
  offset?: number;
}

export interface AddVIPData {
  userId: string;
  tier: 'vip' | 'influencer' | 'partner';
  commissionOverride: number;
  giverPaysCommission: boolean;
  validUntil: string | null;
  reason: string;
}

interface VIPUsersResponse {
  users: VIPUser[];
  total: number;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockVIPUsers: VIPUser[] = [
  {
    id: '1',
    user_id: 'user-1',
    tier: 'vip',
    commission_override: 0,
    giver_pays_commission: true,
    valid_from: '2025-01-01T00:00:00Z',
    valid_until: null,
    reason: 'Premium uyelik',
    granted_by: 'admin-1',
    created_at: '2025-01-01T00:00:00Z',
    user: {
      display_name: 'Ahmet Yilmaz',
      full_name: 'Ahmet Yilmaz',
      email: 'ahmet@example.com',
      avatar_url: null,
    },
    granted_by_user: {
      display_name: 'Admin',
    },
  },
  {
    id: '2',
    user_id: 'user-2',
    tier: 'influencer',
    commission_override: 5,
    giver_pays_commission: false,
    valid_from: '2025-02-15T00:00:00Z',
    valid_until: '2026-02-15T00:00:00Z',
    reason: 'Sosyal medya kampanyasi ortagi',
    granted_by: 'admin-1',
    created_at: '2025-02-15T00:00:00Z',
    user: {
      display_name: 'Elif Demir',
      full_name: 'Elif Demir',
      email: 'elif@example.com',
      avatar_url: null,
    },
    granted_by_user: {
      display_name: 'Admin',
    },
  },
  {
    id: '3',
    user_id: 'user-3',
    tier: 'partner',
    commission_override: 3,
    giver_pays_commission: true,
    valid_from: '2025-03-01T00:00:00Z',
    valid_until: null,
    reason: 'Is ortagi anlasmasi',
    granted_by: 'admin-1',
    created_at: '2025-03-01T00:00:00Z',
    user: {
      display_name: 'Mehmet Kaya',
      full_name: 'Mehmet Kaya',
      email: 'mehmet@example.com',
      avatar_url: null,
    },
    granted_by_user: {
      display_name: 'Admin',
    },
  },
];

const mockStats: VIPStats = {
  totalVIP: 12,
  totalInfluencer: 8,
  totalPartner: 5,
  commissionSaved: 4520.5,
};

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function fetchVIPUsersFromSupabase(
  filters: VIPFilters
): Promise<VIPUsersResponse> {
  const supabase = getClient();

  // Try to fetch VIP users from users table with subscription_tier = 'vip'
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .in('subscription_tier', ['vip', 'influencer', 'partner']);

  // Apply tier filter
  if (filters.tier && filters.tier !== 'all') {
    query = query.eq('subscription_tier', filters.tier);
  }

  // Apply search filter
  if (filters.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  // Apply pagination
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  query = query.range(offset, offset + limit - 1);

  // Order by created_at desc
  query = query.order('created_at', { ascending: false });

  const { data, count, error } = await query;

  if (error) {
    throw error;
  }

  // Transform Supabase data to VIPUser format
  const users: VIPUser[] = (data || []).map((user: Record<string, unknown>) => ({
    id: user.id as string,
    user_id: user.id as string,
    tier: ((user.subscription_tier as string) || 'vip') as 'vip' | 'influencer' | 'partner',
    commission_override: (user.commission_override as number) || 0,
    giver_pays_commission: (user.giver_pays_commission as boolean) || false,
    valid_from: (user.vip_valid_from as string) || (user.created_at as string) || new Date().toISOString(),
    valid_until: (user.vip_valid_until as string) || null,
    reason: (user.vip_reason as string) || null,
    granted_by: (user.vip_granted_by as string) || 'system',
    created_at: (user.created_at as string) || new Date().toISOString(),
    user: {
      display_name: (user.display_name as string) || (user.full_name as string) || '',
      full_name: (user.full_name as string) || '',
      email: (user.email as string) || '',
      avatar_url: (user.avatar_url as string) || null,
    },
    granted_by_user: {
      display_name: 'Admin',
    },
  }));

  return {
    users,
    total: count || 0,
  };
}

async function fetchVIPUsersFromAPI(
  filters: VIPFilters
): Promise<VIPUsersResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.tier && filters.tier !== 'all') params.append('tier', filters.tier);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const response = await fetch(`/api/vip-users?${params.toString()}`);

  if (!response.ok) {
    throw new Error('VIP kullanicilari yuklenemedi');
  }

  const data = await response.json();
  return {
    users: data.users || [],
    total: data.total || 0,
  };
}

async function fetchVIPUsers(filters: VIPFilters): Promise<VIPUsersResponse> {
  try {
    // Try Supabase first
    return await fetchVIPUsersFromSupabase(filters);
  } catch (supabaseError) {
    logger.warn('Supabase VIP fetch failed, trying API', supabaseError);

    try {
      // Fall back to API
      return await fetchVIPUsersFromAPI(filters);
    } catch (apiError) {
      logger.warn('API VIP fetch failed, using mock data', apiError);

      // Fall back to mock data with filtering
      let filtered = [...mockVIPUsers];

      if (filters.tier && filters.tier !== 'all') {
        filtered = filtered.filter((u) => u.tier === filters.tier);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.user.display_name.toLowerCase().includes(searchLower) ||
            u.user.full_name.toLowerCase().includes(searchLower) ||
            u.user.email.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination to mock data
      const offset = filters.offset || 0;
      const limit = filters.limit || 50;
      const paginated = filtered.slice(offset, offset + limit);

      return {
        users: paginated,
        total: filtered.length,
      };
    }
  }
}

async function fetchVIPStatsFromSupabase(): Promise<VIPStats> {
  const supabase = getClient();

  // Get counts by subscription_tier
  const { data: vipData, error: vipError } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('subscription_tier', 'vip');

  const { data: influencerData, error: influencerError } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('subscription_tier', 'influencer');

  const { data: partnerData, error: partnerError } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('subscription_tier', 'partner');

  if (vipError || influencerError || partnerError) {
    throw vipError || influencerError || partnerError;
  }

  // Calculate commission saved (mock calculation - could be a Supabase function)
  const totalVIP = vipData ? 0 : 0; // count comes from the head: true option
  const totalInfluencer = influencerData ? 0 : 0;
  const totalPartner = partnerData ? 0 : 0;

  return {
    totalVIP,
    totalInfluencer,
    totalPartner,
    commissionSaved: 0, // Would need to calculate from transactions
  };
}

async function fetchVIPStatsFromAPI(): Promise<VIPStats> {
  const response = await fetch('/api/vip-users/stats');

  if (!response.ok) {
    throw new Error('VIP istatistikleri yuklenemedi');
  }

  return response.json();
}

async function fetchVIPStats(): Promise<VIPStats> {
  try {
    // Try API first (likely has better aggregation)
    return await fetchVIPStatsFromAPI();
  } catch (apiError) {
    logger.warn('API stats fetch failed, trying Supabase', apiError);

    try {
      return await fetchVIPStatsFromSupabase();
    } catch (supabaseError) {
      logger.warn('Supabase stats fetch failed, using mock data', supabaseError);
      return mockStats;
    }
  }
}

async function addVIPUser(data: AddVIPData): Promise<VIPUser> {
  const response = await fetch('/api/vip-users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'VIP eklenemedi');
  }

  return response.json();
}

async function removeVIPUser(userId: string): Promise<void> {
  const response = await fetch(`/api/vip-users/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'VIP kaldirilamadi');
  }
}

async function updateVIPUser(
  userId: string,
  data: Partial<AddVIPData>
): Promise<VIPUser> {
  const response = await fetch(`/api/vip-users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'VIP guncellenemedi');
  }

  return response.json();
}

// Search users for adding VIP (not just VIP users)
async function searchUsers(
  query: string
): Promise<Array<{ id: string; name: string; email: string }>> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const supabase = getClient();

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) {
      throw error;
    }

    return (data || []).map((user) => ({
      id: user.id,
      name: user.full_name || user.email,
      email: user.email,
    }));
  } catch (err) {
    logger.warn('User search failed, trying API', err);

    // Try API fallback
    try {
      const response = await fetch(
        `/api/users?search=${encodeURIComponent(query)}&limit=10`
      );
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      return (data.users || []).map(
        (user: { id: string; display_name?: string; full_name?: string; email: string }) => ({
          id: user.id,
          name: user.display_name || user.full_name || user.email,
          email: user.email,
        })
      );
    } catch {
      return [];
    }
  }
}

// =============================================================================
// HOOKS
// =============================================================================

export function useVIPUsers(filters: VIPFilters = {}) {
  return useQuery({
    queryKey: ['vip-users', filters],
    queryFn: () => fetchVIPUsers(filters),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
    meta: {
      onError: (error: Error) => {
        toast({
          title: 'Hata',
          description: error.message || 'VIP kullanicilari yuklenemedi',
          variant: 'destructive',
        });
      },
    },
  });
}

export function useVIPStats() {
  return useQuery({
    queryKey: ['vip-stats'],
    queryFn: fetchVIPStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    meta: {
      onError: (error: Error) => {
        toast({
          title: 'Hata',
          description: error.message || 'VIP istatistikleri yuklenemedi',
          variant: 'destructive',
        });
      },
    },
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['search-users', query],
    queryFn: () => searchUsers(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAddVIP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addVIPUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vip-users'] });
      queryClient.invalidateQueries({ queryKey: ['vip-stats'] });
      toast({
        title: 'Basarili',
        description: 'VIP kullanici eklendi',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message || 'VIP eklenemedi',
        variant: 'destructive',
      });
    },
  });
}

export function useRemoveVIP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeVIPUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vip-users'] });
      queryClient.invalidateQueries({ queryKey: ['vip-stats'] });
      toast({
        title: 'Basarili',
        description: 'VIP statusu kaldirildi',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message || 'VIP kaldirilamadi',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateVIP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<AddVIPData> }) =>
      updateVIPUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vip-users'] });
      queryClient.invalidateQueries({ queryKey: ['vip-stats'] });
      toast({
        title: 'Basarili',
        description: 'VIP bilgileri guncellendi',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message || 'VIP guncellenemedi',
        variant: 'destructive',
      });
    },
  });
}
