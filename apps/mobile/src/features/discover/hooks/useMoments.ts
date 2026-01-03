import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  momentsApi,
  MomentFilters,
  CreateMomentDto,
  UpdateMomentDto,
} from '../services/momentsService';
import { imagePreloader } from '@/services/imagePreloader';
import { logger } from '@/utils/logger';

/**
 * useMoments Hook
 *
 * Moment discovery ve yönetimi için hook
 * Includes automatic image prefetching for optimal UX
 */
export function useMoments(filters?: MomentFilters) {
  const query = useQuery({
    queryKey: ['moments', filters],
    queryFn: () => momentsApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 dakika
  });

  // Prefetch images when data is loaded
  useEffect(() => {
    if (query.data && query.data.length > 0) {
      const momentsWithImages = query.data
        .slice(0, 10) // Prefetch first 10 moment images
        .filter((m: { image_url?: string }) => m.image_url)
        .map((m: { id: string; image_url: string }) => ({
          id: m.id,
          imageUrl: m.image_url,
        }));

      if (momentsWithImages.length > 0) {
        imagePreloader.prefetchMomentsImages(momentsWithImages);
        logger.debug('[useMoments] Prefetched images', { count: momentsWithImages.length });
      }
    }
  }, [query.data]);

  return query;
}

/**
 * usePrefetchNextMoments Hook
 *
 * Scroll position'a göre sonraki moment'ları prefetch eder
 * "Sıfır Gecikme" UX için kullanılır
 */
export function usePrefetchNextMoments(
  moments: Array<{ id: string; image_url?: string }> | undefined,
  currentIndex: number,
  prefetchCount = 5,
) {
  const prefetchAhead = useCallback(() => {
    if (!moments || moments.length === 0) return;

    const startIndex = currentIndex + 1;
    const endIndex = Math.min(startIndex + prefetchCount, moments.length);

    const nextMoments = moments
      .slice(startIndex, endIndex)
      .filter((m) => m.image_url)
      .map((m) => ({
        id: m.id,
        imageUrl: m.image_url!,
      }));

    if (nextMoments.length > 0) {
      imagePreloader.prefetchMomentsImages(nextMoments);
      logger.debug('[Prefetch] Prefetching next moments', {
        currentIndex,
        count: nextMoments.length,
      });
    }
  }, [moments, currentIndex, prefetchCount]);

  // Auto-prefetch when currentIndex changes
  useEffect(() => {
    prefetchAhead();
  }, [prefetchAhead]);

  return { prefetchAhead };
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

