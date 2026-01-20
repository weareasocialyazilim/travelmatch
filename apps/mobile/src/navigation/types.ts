/**
 * Navigation Types
 * Type-safe navigation için tüm route tanımları
 */

import type { RootStackParamList } from './routeParams';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';

// Re-export for convenience
export type { RootStackParamList };

// SearchFilters is now centralized in @/stores/searchStore
// Re-export for backward compatibility
export type { SearchFilters } from '@/stores/searchStore';

/**
 * Bottom Tab Navigator Params
 */
export type MainTabParamList = {
  Discover: undefined;
  Requests: undefined;
  Create: undefined;
  Messages: undefined;
  Profile: undefined;
};

/**
 * Screen Props Types
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

/**
 * Navigation Prop Types
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
