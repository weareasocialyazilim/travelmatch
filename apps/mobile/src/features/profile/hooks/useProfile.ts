import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, UpdateProfileDto } from '../services/profileService';

/**
 * useProfile Hook
 *
 * Kullanıcı profili yönetimi
 */
export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileApi.getById(userId),
    enabled: !!userId,
  });
}

/**
 * useMyProfile Hook
 *
 * Giriş yapmış kullanıcının profili
 */
export function useMyProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileApi.getMyProfile(),
  });
}

/**
 * useUpdateProfile Hook
 *
 * Profil güncelleme mutation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdateProfileDto) => profileApi.update(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });
}

/**
 * useReputation Hook
 *
 * Kullanıcı reputation bilgisi
 */
export function useReputation(userId: string) {
  return useQuery({
    queryKey: ['reputation', userId],
    queryFn: () => profileApi.getReputation(userId),
    enabled: !!userId,
  });
}

/**
 * useTrustScore Hook
 *
 * Trust score detayları
 */
export function useTrustScore(userId: string) {
  return useQuery({
    queryKey: ['trust-score', userId],
    queryFn: () => profileApi.getTrustScore(userId),
    enabled: !!userId,
  });
}

/**
 * useProofHistory Hook
 *
 * Kullanıcının proof geçmişi
 */
export function useProofHistory(userId: string) {
  return useQuery({
    queryKey: ['proof-history', userId],
    queryFn: () => profileApi.getProofHistory(userId),
    enabled: !!userId,
  });
}

/**
 * useMyMoments Hook
 *
 * Kullanıcının paylaştığı moment'lar
 */
export function useMyMoments(userId: string) {
  return useQuery({
    queryKey: ['moments', userId],
    queryFn: () => profileApi.getMoments(userId),
    enabled: !!userId,
  });
}

/**
 * useCreateMoment Hook
 *
 * Yeni moment oluşturma
 */
export function useCreateMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moment: FormData) => profileApi.createMoment(moment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moments'] });
    },
  });
}

/**
 * useDeleteMoment Hook
 *
 * Moment silme
 */
export function useDeleteMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (momentId: string) => profileApi.deleteMoment(momentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moments'] });
    },
  });
}
