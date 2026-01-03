import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  momentsApi,
  MomentFilters,
  CreateMomentDto,
  UpdateMomentDto,
} from '../services/momentsService';

/**
 * useMoments Hook
 *
 * Moment discovery ve yönetimi için hook
 */
export function useMoments(filters?: MomentFilters) {
  return useQuery({
    queryKey: ['moments', filters],
    queryFn: () => momentsApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
}

/**
 * useMoment Hook
 *
 * Tek bir moment detayı için hook
 */
export function useMoment(momentId: string) {
  return useQuery({
    queryKey: ['moment', momentId],
    queryFn: () => momentsApi.getById(momentId),
    enabled: !!momentId,
  });
}

/**
 * useCreateMoment Hook
 *
 * Yeni moment oluşturma mutation
 */
export function useCreateMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moment: CreateMomentDto) => momentsApi.create(moment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moments'] });
    },
  });
}

/**
 * useUpdateMoment Hook
 *
 * Moment güncelleme mutation
 */
export function useUpdateMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateMomentDto }) =>
      momentsApi.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['moment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['moments'] });
    },
  });
}

/**
 * useDeleteMoment Hook
 *
 * Moment silme (soft delete) mutation
 */
export function useDeleteMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (momentId: string) => momentsApi.delete(momentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moments'] });
    },
  });
}

/**
 * useMyMoments Hook
 *
 * Kullanıcının kendi moment'ları
 */
export function useMyMoments(userId: string) {
  return useQuery({
    queryKey: ['moments', 'my', userId],
    queryFn: () => momentsApi.getMyMoments(userId),
    enabled: !!userId,
  });
}

/**
 * useBooking Hook
 *
 * Booking detayları
 */
export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => momentsApi.getBooking(bookingId),
    enabled: !!bookingId,
  });
}

// Legacy exports for backward compatibility
/** @deprecated Use useMoments */
export const useTrips = useMoments;
/** @deprecated Use useMoment */
export const useTrip = useMoment;
/** @deprecated Use useCreateMoment */
export { useCreateMoment as useCreateTrip };
/** @deprecated Use useUpdateMoment */
export { useUpdateMoment as useUpdateTrip };
/** @deprecated Use useDeleteMoment */
export { useDeleteMoment as useDeleteTrip };
/** @deprecated Use useMyMoments */
export { useMyMoments as useMyTrips };
