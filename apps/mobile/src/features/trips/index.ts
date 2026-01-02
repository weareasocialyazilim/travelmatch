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
export { TripDetailsScreen } from './screens/TripDetailsScreen';
export { default as RequestsScreen } from './screens/RequestsScreen';
export { MyTripsScreen } from './screens/MyTripsScreen';
export { default as TicketScreen } from './screens/TicketScreen';

// Hooks
export {
  useTrips,
  useTrip,
  useCreateTrip,
  useUpdateTrip,
  useDeleteTrip,
  useMyTrips,
  useBooking,
} from './hooks/useTrips';

// Services
export { tripsApi } from './services/tripsApi';
export type {
  TripFilters,
  CreateTripDto,
  UpdateTripDto,
} from './services/tripsApi';

// Types
export type {
  Moment,
  MomentData,
  MomentUser,
  MomentLocation,
  User,
  Trip,
  UserProfile,
} from './types';
