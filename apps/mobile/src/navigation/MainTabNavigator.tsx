import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import { DiscoverScreen } from '@/features/discover';
import { InboxScreen } from '@/features/inbox';
import { ProfileScreen } from '@/features/profile';
import { CreateMomentScreen } from '@/features/moments';

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
