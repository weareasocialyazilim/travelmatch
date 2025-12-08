import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi, TripFilters, CreateTripDto, UpdateTripDto } from '../services/tripsApi';

/**
 * useTrips Hook
 * 
 * Trip discovery ve yönetimi için hook
 */
export function useTrips(filters?: TripFilters) {
  return useQuery({
    queryKey: ['trips', filters],
    queryFn: () => tripsApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
}

/**
 * useTrip Hook
 * 
 * Tek bir trip detayı için hook
 */
export function useTrip(tripId: string) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsApi.getById(tripId),
    enabled: !!tripId,
  });
}

/**
 * useCreateTrip Hook
 * 
 * Yeni trip oluşturma mutation
 */
export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trip: CreateTripDto) => tripsApi.create(trip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

/**
 * useUpdateTrip Hook
 * 
 * Trip güncelleme mutation
 */
export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTripDto }) =>
      tripsApi.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trip', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

/**
 * useDeleteTrip Hook
 * 
 * Trip silme (soft delete) mutation
 */
export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tripId: string) => tripsApi.delete(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

/**
 * useMyTrips Hook
 * 
 * Kullanıcının kendi trip'leri
 */
export function useMyTrips(userId: string) {
  return useQuery({
    queryKey: ['trips', 'my', userId],
    queryFn: () => tripsApi.getMyTrips(userId),
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
    queryFn: () => tripsApi.getBooking(bookingId),
    enabled: !!bookingId,
  });
}
