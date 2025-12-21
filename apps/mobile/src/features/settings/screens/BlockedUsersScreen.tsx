import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/colors';
import { DEFAULT_IMAGES } from '@/constants/defaultValues';
import { TYPOGRAPHY } from '@/theme/typography';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useToast } from '@/context/ToastContext';
import { useConfirmation } from '@/context/ConfirmationContext';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type BlockedUsersScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'BlockedUsers'
>;

interface BlockedUsersScreenProps {
  navigation: BlockedUsersScreenNavigationProp;
}

interface BlockedUser {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}

const MOCK_BLOCKED_USERS: BlockedUser[] = __DEV__
  ? [
      {
        id: '1',
        name: 'John Doe',
        role: 'Traveler / Local',
        avatarUrl: DEFAULT_IMAGES.AVATAR_SMALL,
      },
      {
        id: '2',
        name: 'Jane Smith',
        role: 'Traveler',
        avatarUrl: DEFAULT_IMAGES.AVATAR_SMALL,
      },
    ]
  : [];

const STORAGE_KEY = '@blocked_users';

export const BlockedUsersScreen: React.FC<BlockedUsersScreenProps> = ({
  navigation,
}) => {
  const { showToast: _showToast } = useToast();
  const { showConfirmation: _showConfirmation } = useConfirmation();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  // Load blocked users on mount
  useEffect(() => {
    const loadBlockedUsers = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as BlockedUser[];
          setBlockedUsers(parsed);
        } else {
          // First time - use mock data
          setBlockedUsers(MOCK_BLOCKED_USERS);
        }
      } catch {
        logger.debug('Failed to load blocked users');
        setBlockedUsers(MOCK_BLOCKED_USERS);
      }
    };
    void loadBlockedUsers();
  }, []);

  const handleUnblock = (userId: string, userName: string) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            const newBlockedUsers = blockedUsers.filter(
              (user) => user.id !== userId,
            );
            setBlockedUsers(newBlockedUsers);
            try {
              await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(newBlockedUsers),
              );
            } catch {
              logger.debug('Failed to save blocked users');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={'arrow-left' as IconName}
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked users</Text>
        <View style={styles.headerButton} />
      </View>

      {blockedUsers.length === 0 ? (
        // Empty State
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <MaterialCommunityIcons
              name={'shield-check' as IconName}
              size={48}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.emptyTitle}>No one blocked</Text>
          <Text style={styles.emptyDescription}>
            If you block someone, they will appear here.
          </Text>
        </View>
      ) : (
        // Blocked Users List
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.usersList}>
            {blockedUsers.map((user) => (
              <View key={user.id} style={styles.userItem}>
                <View style={styles.userContent}>
                  <View style={styles.userAvatar} />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {user.name}
                    </Text>
                    <Text style={styles.userRole} numberOfLines={1}>
                      {user.role}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.unblockButton}
                  onPress={() => handleUnblock(user.id, user.name)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.unblockButtonText}>Unblock</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  usersList: {
    paddingHorizontal: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 8,
    minHeight: 72,
  },
  userContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.border,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  userRole: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  unblockButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 84,
    alignItems: 'center',
  },
  unblockButtonText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
