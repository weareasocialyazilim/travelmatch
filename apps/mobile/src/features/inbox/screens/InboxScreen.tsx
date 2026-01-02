/**
 * TravelMatch Inbox Screen - Awwwards Edition
 *
 * Premium inbox experience with:
 * - Twilight Zinc dark theme
 * - Liquid Glass segmented control
 * - Neon accent highlights
 * - Silky smooth animations
 *
 * Features:
 * - Segmented Control: "Mesajlar" / "Hediyeler"
 * - Smart List Items: Moment context + User + Status
 * - Real-time typing indicators
 * - Pull to refresh with haptic feedback
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { withErrorBoundary } from '@/components/withErrorBoundary';

import {
  VIBE_ROOM_COLORS,
  INBOX_SPACING,
  INBOX_TYPOGRAPHY,
} from '../constants/theme';
import GlassSegmentedControl from '../components/GlassSegmentedControl';
import InboxChatItem from '../components/InboxChatItem';
import { useInbox } from '../hooks/useInbox';
import type { InboxChat } from '../types/inbox.types';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

// ============================================
// INBOX SCREEN COMPONENT
// ============================================
const InboxScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  // Use the inbox hook for real data
  const {
    chats,
    requests,
    activeTab,
    setActiveTab,
    isLoading,
    isRefreshing,
    refreshInbox,
    totalUnread,
    requestCount,
  } = useInbox();

  // Current list based on active tab
  const currentList = activeTab === 'active' ? chats : requests;

  // Handle refresh with haptic feedback
  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshInbox();
  }, [refreshInbox]);

  // Handle chat press
  const handleChatPress = useCallback(
    (chat: InboxChat) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('Chat', {
        otherUser: {
          id: chat.user.id,
          name: chat.user.name,
          avatar: chat.user.avatar,
          isVerified: chat.user.isVerified,
          role: 'Traveler',
          kyc: chat.user.isVerified ? 'Verified' : 'Pending',
          location: '',
        },
        conversationId: chat.id,
      });
    },
    [navigation],
  );

  // Handle archive button
  const handleArchive = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ArchivedChats');
  }, [navigation]);

  // Render chat item
  const renderChatItem = useCallback(
    ({ item, index }: { item: InboxChat; index: number }) => (
      <InboxChatItem chat={item} index={index} onPress={handleChatPress} />
    ),
    [handleChatPress],
  );

  // Empty state
  const renderEmptyState = useCallback(
    () => (
      <Animated.View entering={FadeIn.delay(300)} style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <MaterialCommunityIcons
            name={activeTab === 'active' ? 'chat-sleep-outline' : 'gift-off-outline'}
            size={56}
            color={VIBE_ROOM_COLORS.text.tertiary}
          />
        </View>
        <Text style={styles.emptyTitle}>
          {activeTab === 'active' ? 'Henüz mesaj yok' : 'Hediye talebi yok'}
        </Text>
        <Text style={styles.emptyDescription}>
          {activeTab === 'active'
            ? 'Yeni insanlarla tanışmak için bir moment paylaş!'
            : 'Birisi momentine katılmak istediğinde burada göreceksin.'}
        </Text>
        {activeTab === 'active' && (
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Discover')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={VIBE_ROOM_COLORS.gradients.hero}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyButtonGradient}
            >
              <Text style={styles.emptyButtonText}>Keşfet</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </Animated.View>
    ),
    [activeTab, navigation],
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Gelen Kutusu</Text>
          {totalUnread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {totalUnread > 99 ? '99+' : totalUnread}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.archiveButton}
          onPress={handleArchive}
          activeOpacity={0.7}
          accessibilityLabel="Arşivlenmiş sohbetler"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="archive-outline"
            size={22}
            color={VIBE_ROOM_COLORS.text.secondary}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Segmented Control */}
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={styles.segmentWrapper}
      >
        <GlassSegmentedControl
          activeTab={activeTab}
          onTabChange={setActiveTab}
          requestCount={requestCount}
        />
      </Animated.View>

      {/* Chat List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={VIBE_ROOM_COLORS.neon.lime} />
        </View>
      ) : (
        <FlashList
          data={currentList}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={100}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={VIBE_ROOM_COLORS.neon.lime}
              colors={[VIBE_ROOM_COLORS.neon.lime]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: VIBE_ROOM_COLORS.background.primary,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: INBOX_SPACING.screenPadding,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pageTitle: {
    ...INBOX_TYPOGRAPHY.pageTitle,
    color: VIBE_ROOM_COLORS.text.primary,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: VIBE_ROOM_COLORS.neon.lime,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: VIBE_ROOM_COLORS.neon.lime,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  unreadBadgeText: {
    color: VIBE_ROOM_COLORS.text.inverse,
    fontSize: 12,
    fontWeight: '700',
  },
  archiveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: VIBE_ROOM_COLORS.glass.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: VIBE_ROOM_COLORS.glass.border,
  },

  // Segment Control Wrapper
  segmentWrapper: {
    paddingHorizontal: INBOX_SPACING.screenPadding,
    marginBottom: 8,
  },

  // List
  listContent: {
    paddingHorizontal: INBOX_SPACING.screenPadding,
    paddingBottom: 120, // Space for floating dock
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: VIBE_ROOM_COLORS.glass.backgroundMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: VIBE_ROOM_COLORS.glass.border,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: VIBE_ROOM_COLORS.text.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptyDescription: {
    fontSize: 15,
    color: VIBE_ROOM_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: VIBE_ROOM_COLORS.neon.lime,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emptyButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  emptyButtonText: {
    color: VIBE_ROOM_COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});

// Export with error boundary
export default withErrorBoundary(InboxScreen, {
  fallbackType: 'generic',
  displayName: 'InboxScreen',
});
