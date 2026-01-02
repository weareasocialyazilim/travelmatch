/**
 * TravelMatch Vibe Room - Inbox Screen
 *
 * Phase 4: THE VIBE ROOM (INBOX & CHAT)
 *
 * Vision:
 * - Context is King: Every chat is connected to a "Moment"
 * - Status Driven: Neon badges for offer, payment, proof states
 * - Glass & Neon: Premium dark theme with glassmorphism
 *
 * Features:
 * - Segmented Control: "Active Matches" / "Requests"
 * - Smart List Items: Moment photo + User + Status
 * - Real-time typing indicators
 * - Pull to refresh
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
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import BottomNav from '@/components/BottomNav';
import { withErrorBoundary } from '@/components/withErrorBoundary';

import { VIBE_ROOM_COLORS, INBOX_SPACING } from '../constants/theme';
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
            name={
              activeTab === 'active' ? 'chat-sleep-outline' : 'gift-off-outline'
            }
            size={64}
            color={VIBE_ROOM_COLORS.text.tertiary}
          />
        </View>
        <Text style={styles.emptyTitle}>
          {activeTab === 'active' ? 'No Vibes Yet' : 'No Requests'}
        </Text>
        <Text style={styles.emptyDescription}>
          {activeTab === 'active'
            ? 'Drop a moment to start connecting with travelers!'
            : "When someone wants to join your moment, you'll see it here."}
        </Text>
        {activeTab === 'active' && (
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Discover')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[
                VIBE_ROOM_COLORS.neon.amber,
                VIBE_ROOM_COLORS.neon.magenta,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyButtonGradient}
            >
              <Text style={styles.emptyButtonText}>Discover Moments</Text>
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

      {/* Dark Theme Background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[
            VIBE_ROOM_COLORS.background.primary,
            VIBE_ROOM_COLORS.background.secondary,
          ]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <Text style={styles.pageTitle}>Vibes</Text>
        <TouchableOpacity
          style={styles.archiveButton}
          onPress={handleArchive}
          activeOpacity={0.7}
          accessibilityLabel="Archived chats"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="archive-outline"
            size={24}
            color={VIBE_ROOM_COLORS.text.secondary}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Segmented Control */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <GlassSegmentedControl
          activeTab={activeTab}
          onTabChange={setActiveTab}
          requestCount={requestCount}
        />
      </Animated.View>

      {/* Chat List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={VIBE_ROOM_COLORS.neon.amber} />
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
              tintColor={VIBE_ROOM_COLORS.neon.amber}
              colors={[VIBE_ROOM_COLORS.neon.amber]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab="Messages" messagesBadge={totalUnread} />
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
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: VIBE_ROOM_COLORS.text.primary,
    letterSpacing: -1,
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

  // List
  listContent: {
    paddingHorizontal: INBOX_SPACING.screenPadding,
    paddingBottom: 120, // Space for dock
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
    backgroundColor: VIBE_ROOM_COLORS.glass.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: VIBE_ROOM_COLORS.text.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptyDescription: {
    fontSize: 15,
    color: VIBE_ROOM_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyButtonText: {
    color: VIBE_ROOM_COLORS.text.primary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});

// Export with error boundary
export default withErrorBoundary(InboxScreen, {
  fallbackType: 'generic',
  displayName: 'InboxScreen',
});
