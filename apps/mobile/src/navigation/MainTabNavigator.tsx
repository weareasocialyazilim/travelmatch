import React, { lazy, Suspense } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';

// Screens
import { DiscoverScreen } from '@/features/discover';
import { InboxScreen } from '@/features/inbox';
import { ProfileScreen } from '@/features/profile';
import { CreateMomentScreen } from '@/features/moments';

// SearchMapScreen - Lazy loaded to prevent Mapbox TurboModule initialization at module load
const SearchMapScreen = lazy(
  () => import('@/features/discover/screens/SearchMapScreen'),
);

// Custom Navigation Components
import { FloatingDock } from '@/components/navigation';
import { COLORS } from '@/constants/colors';

const Tab = createBottomTabNavigator();

// Loading fallback for lazy-loaded screens
const MapScreenWrapper: React.FC = () => (
  <Suspense
    fallback={
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={COLORS.brand.primary} />
      </View>
    }
  >
    <SearchMapScreen />
  </Suspense>
);

/**
 * MainTabNavigator - Awwwards Edition
 *
 * Uses the FloatingDock component for a premium
 * Liquid Glass navigation experience.
 */
export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingDock {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={DiscoverScreen} />

      <Tab.Screen name="Map" component={MapScreenWrapper} />

      {/* Create Moment - Opens as modal */}
      <Tab.Screen
        name="Create"
        component={CreateMomentScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('CreateMoment');
          },
        })}
      />

      <Tab.Screen name="Inbox" component={InboxScreen} />

      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
