/**
 * Type-Safe Navigation Hooks
 * useNavigation ve useRoute için type-safe wrapper'lar
 */

import {
  useNavigation as useNavigationRN,
  useRoute as useRouteRN,
} from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';

/**
 * Type-safe useNavigation hook
 */
export const useNavigation = () => {
  return useNavigationRN<StackNavigationProp<RootStackParamList>>();
};

/**
 * Type-safe useRoute hook
 */
export const useRoute = <T extends keyof RootStackParamList>() => {
  return useRouteRN<RouteProp<RootStackParamList, T>>();
};

/**
 * Navigation helpers
 */
export const navigationHelpers = {
  /**
   * Navigate to moment detail
   * Note: MomentDetail requires full Moment object, not just momentId
   */
  goToMomentDetail: (
    navigation: StackNavigationProp<RootStackParamList>,
    moment: RootStackParamList['MomentDetail']['moment'],
  ) => {
    navigation.navigate('MomentDetail', { moment });
  },

  /**
   * Navigate to profile
   * Note: ProfileDetail uses userId param
   */
  goToProfile: (
    navigation: StackNavigationProp<RootStackParamList>,
    userId: string,
  ) => {
    navigation.navigate('ProfileDetail', { userId });
  },

  /**
   * Navigate to chat
   * Note: Chat requires otherUser object
   */
  goToChat: (
    navigation: StackNavigationProp<RootStackParamList>,
    otherUser: RootStackParamList['Chat']['otherUser'],
  ) => {
    navigation.navigate('Chat', { otherUser });
  },

  /**
   * Navigate to search with optional initial query
   */
  goToSearch: (
    navigation: StackNavigationProp<RootStackParamList>,
    initialQuery?: string,
  ) => {
    navigation.navigate('Search', { initialQuery });
  },

  /**
   * Go back safely
   */
  goBack: (navigation: StackNavigationProp<RootStackParamList>) => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  },
};
