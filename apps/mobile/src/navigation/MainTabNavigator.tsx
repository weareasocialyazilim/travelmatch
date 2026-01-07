import React, { Suspense, lazy } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '@/constants/colors';

// Screens
import { DiscoverScreen } from '@/features/discover';
import { InboxScreen } from '@/features/inbox';
import { ProfileScreen } from '@/features/profile';
import { CreateMomentScreen } from '@/features/moments';

// SearchMapScreen - lazy loaded to prevent Mapbox TurboModule crash at startup
const LazySearchMapScreen = lazy(() =>
  import('@/features/discover/screens/SearchMapScreen').then((m) => ({
    default: m.default,
  })),
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
});

// Wrapper component for lazy-loaded SearchMapScreen
const SearchMapScreenWrapper = () => (
  <Suspense
    fallback={
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.brand.primary} />
      </View>
    }
  >
    <LazySearchMapScreen />
  </Suspense>
);

// Custom Navigation Components
import { FloatingDock } from '@/components/navigation';

const Tab = createBottomTabNavigator();

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

      <Tab.Screen name="Search" component={SearchMapScreenWrapper} />

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
