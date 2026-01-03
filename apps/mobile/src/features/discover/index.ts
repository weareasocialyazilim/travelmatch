/**
 * Discover Feature - Barrel Exports
 *
 * Moment discovery, booking, escrow yönetimi
 */

// Screens
export { default as DiscoverScreen } from './screens/DiscoverScreen';
export { default as SearchMapScreen } from './screens/SearchMapScreen';
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

// Hooks - New Moment terminology
export {
  useMoments,
  useMoment,
  useCreateMoment,
  useUpdateMoment,
  useDeleteMoment,
  useMyMoments,
  useBooking,
  // Legacy aliases
  useTrips,
  useTrip,
  useCreateTrip,
  useUpdateTrip,
  useDeleteTrip,
  useMyTrips,
} from './hooks/useMoments';

// Services - New Moment terminology
export { momentsApi as momentsService } from './services/momentsService';
/** @deprecated Use momentsService instead */
export { momentsApi } from './services/momentsService';
/** @deprecated Use momentsService instead */
export { tripsApi } from './services/momentsService';
/** @deprecated Use momentsService instead */
export { tripsApi as tripsService } from './services/momentsService';

// Types - New Moment terminology
export type {
  MomentFilters,
  CreateMomentDto,
  UpdateMomentDto,
  // Legacy aliases
  TripFilters,
  CreateTripDto,
  UpdateTripDto,
} from './services/momentsService';

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
