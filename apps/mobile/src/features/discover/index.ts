/**
 * Discover Feature - Barrel Exports
 *
 * Moment discovery, booking, escrow yönetimi
 *
 * NOTE: SearchMapScreen is NOT exported here to prevent Mapbox TurboModule
 * from being initialized at module load time. Import it directly from
 * './screens/SearchMapScreen' and use lazy loading.
 */

// Screens
export { default as DiscoverScreen } from './screens/DiscoverScreen';
// SearchMapScreen - REMOVED from barrel to prevent TurboModule crash
// Import directly with lazy loading: import('../features/discover/screens/SearchMapScreen')
export { default as EscrowStatusScreen } from './screens/EscrowStatusScreen';
export { HowEscrowWorksScreen } from './screens/HowEscrowWorksScreen';
export { default as MatchConfirmationScreen } from './screens/MatchConfirmationScreen';
export { ReceiverApprovalScreen } from './screens/ReceiverApprovalScreen';
export { DisputeFlowScreen } from './screens/DisputeFlowScreen';
export { default as RequestsScreen } from './screens/RequestsScreen';
export { default as TicketScreen } from './screens/TicketScreen';

// Services
export { momentsApi as momentsService } from '@/features/moments/services/momentsService';

// Types
export type {
  MomentFilters,
  CreateMomentDto,
  UpdateMomentDto,
} from '@/features/moments/services/momentsService';

// Types
export type {
  Moment,
  MomentData,
  MomentUser,
  MomentLocation,
  User,
  UserProfile,
} from './types';
