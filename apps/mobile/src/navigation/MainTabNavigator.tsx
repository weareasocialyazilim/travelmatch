import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

// Screens
import { DiscoverScreen } from '@/features/discover';
import { SearchMapScreen } from '@/features/discovery';
import { InboxScreen } from '@/features/inbox';
import { ProfileScreen, CreateMomentScreen } from '@/features/profile';

const Tab = createBottomTabNavigator();

// Custom center (+) button component
const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={{
      top: -30,
      justifyContent: 'center',
      alignItems: 'center',
      ...styles.shadow,
    }}
    onPress={onPress}
  >
    <View
      style={{
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.brand.primary,
        borderWidth: 4,
        borderColor: COLORS.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {children}
    </View>
  </TouchableOpacity>
);

export const MainTabNavigator = () => {
  // Safe area insets are handled by individual screens
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          backgroundColor: 'rgba(20,20,20,0.95)',
          borderRadius: 25,
          height: 80,
          borderTopWidth: 0,
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          paddingBottom: 0,
          ...styles.shadow,
          elevation: 0, // Placed after spread to ensure it takes precedence
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons
                name={focused ? 'compass' : 'compass-outline'}
                size={28}
                color={focused ? COLORS.brand.primary : 'gray'}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchMapScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons
                name={focused ? 'map' : 'map-outline'}
                size={28}
                color={focused ? COLORS.brand.primary : 'gray'}
              />
            </View>
          ),
        }}
      />

      {/* Create Moment - Opens as modal */}
      <Tab.Screen
        name="Create"
        component={CreateMomentScreen}
        options={{
          tabBarIcon: () => <Ionicons name="add" size={35} color="black" />,
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('CreateMoment');
          },
        })}
      />

      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View>
                <Ionicons
                  name={focused ? 'chatbubble' : 'chatbubble-outline'}
                  size={28}
                  color={focused ? COLORS.brand.primary : 'gray'}
                />
                {/* Notification Badge */}
                <View style={styles.badge} />
              </View>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons
                name={focused ? 'account-circle' : 'account-circle-outline'}
                size={30}
                color={focused ? COLORS.brand.primary : 'gray'}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4444',
    borderWidth: 1,
    borderColor: 'black',
  },
});

export default MainTabNavigator;
