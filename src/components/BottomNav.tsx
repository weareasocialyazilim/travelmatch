import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/colors';
import PropTypes from 'prop-types';

interface BottomNavProps {
  activeTab: 'Home' | 'Social' | 'Send' | 'Activity' | 'Profile';
}

const BottomNav: React.FC<BottomNavProps> = memo(function BottomNav({
  activeTab,
}) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Home')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'Home' }}
        accessibilityLabel="Home tab"
        accessibilityHint="Navigate to Home screen"
      >
        <MaterialCommunityIcons
          name="home-outline"
          size={24}
          color={activeTab === 'Home' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text
          style={activeTab === 'Home' ? styles.navTextActive : styles.navText}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Social')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'Social' }}
        accessibilityLabel="Social tab"
        accessibilityHint="Navigate to Social screen"
      >
        <MaterialCommunityIcons
          name="compass-outline"
          size={24}
          color={activeTab === 'Social' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text
          style={activeTab === 'Social' ? styles.navTextActive : styles.navText}
        >
          Social
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('CreateMoment')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'Send' }}
        accessibilityLabel="Send tab"
        accessibilityHint="Navigate to Create Moment screen"
      >
        <MaterialCommunityIcons
          name="plus-circle"
          size={28}
          color={COLORS.primary}
        />
        <Text style={styles.navText}>Send</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Activity')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'Activity' }}
        accessibilityLabel="Activity tab"
        accessibilityHint="Navigate to Activity screen"
      >
        <MaterialCommunityIcons
          name="bell-outline"
          size={24}
          color={
            activeTab === 'Activity' ? COLORS.primary : COLORS.textSecondary
          }
        />
        <Text
          style={
            activeTab === 'Activity' ? styles.navTextActive : styles.navText
          }
        >
          Activity
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Profile')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'Profile' }}
        accessibilityLabel="Profile tab"
        accessibilityHint="Navigate to Profile screen"
      >
        <MaterialCommunityIcons
          name="account-outline"
          size={24}
          color={
            activeTab === 'Profile' ? COLORS.primary : COLORS.textSecondary
          }
        />
        <Text
          style={
            activeTab === 'Profile' ? styles.navTextActive : styles.navText
          }
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
});

BottomNav.propTypes = {
  activeTab: PropTypes.oneOf(['Home', 'Social', 'Send', 'Activity', 'Profile'])
    .isRequired,
};

const styles = StyleSheet.create({
  bottomNav: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    left: 0,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 12,
    position: 'absolute',
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
  },
  navText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  navTextActive: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});

export default BottomNav;
