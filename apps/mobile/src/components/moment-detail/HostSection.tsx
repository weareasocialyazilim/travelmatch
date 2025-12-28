import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import type { MomentUser, MomentDetailNavigation } from './types';

interface HostSectionProps {
  user: MomentUser;
  navigation: MomentDetailNavigation;
}

export const HostSection: React.FC<HostSectionProps> = React.memo(
  ({ user, navigation }) => {
    const handlePress = () => {
      navigation.navigate('ProfileDetail', {
        userId: user.id || 'unknown',
      });
    };

    return (
      <TouchableOpacity
        style={styles.userSection}
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityLabel={`View ${user.name}'s profile`}
        accessibilityRole="button"
      >
        <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{user.name}</Text>
            {user.isVerified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={16}
                color={COLORS.mint}
              />
            )}
          </View>
          <Text style={styles.viewProfileHint}>Tap to view profile</Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={COLORS.text.secondary}
        />
      </TouchableOpacity>
    );
  },
);

HostSection.displayName = 'HostSection';

const styles = StyleSheet.create({
  userSection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  userAvatar: {
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  userName: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  viewProfileHint: {
    color: COLORS.text.secondary,
    fontSize: 12,
  },
});
