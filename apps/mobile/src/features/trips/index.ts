/**
 * Trips Feature - Barrel Exports
 * 
 * Seyahat discovery, booking, escrow yönetimi
 */

// Screens
export { default as DiscoverScreen } from './screens/DiscoverScreen';
export { default as BookingDetailScreen } from './screens/BookingDetailScreen';
export { default as EscrowStatusScreen } from './screens/EscrowStatusScreen';
export { HowEscrowWorksScreen } from './screens/HowEscrowWorksScreen';
export { default as MatchConfirmationScreen } from './screens/MatchConfirmationScreen';
export { ReceiverApprovalScreen } from './screens/ReceiverApprovalScreen';
export { DisputeFlowScreen } from './screens/DisputeFlowScreen';
export { default as RequestsScreen } from './screens/RequestsScreen';

// Hooks
export { useTrips, useTrip, useCreateTrip, useUpdateTrip, useDeleteTrip, useMyTrips, useBooking } from './hooks/useTrips';

// Services
export { tripsApi } from './services/tripsApi';
export type { TripFilters, CreateTripDto, UpdateTripDto } from './services/tripsApi';
