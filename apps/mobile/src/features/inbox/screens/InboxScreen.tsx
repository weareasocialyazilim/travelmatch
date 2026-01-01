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

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
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
import type { InboxChat, InboxTab } from '../types/inbox.types';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

// ============================================
// MOCK DATA (Replace with real API)
// ============================================
const MOCK_CHATS: InboxChat[] = [
  {
    id: '1',
    user: {
      id: 'u1',
      name: 'Selin Y.',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
      isVerified: true,
      isOnline: true,
    },
    moment: {
      id: 'm1',
      title: 'Coffee at Petra',
      image:
        'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=200',
      emoji: '☕️',
    },
    lastMessage: 'Sure, 3 PM works for me! See you at the terrace.',
    lastMessageAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: 'matched',
    unreadCount: 2,
  },
  {
    id: '2',
    user: {
      id: 'u2',
      name: 'Marc B.',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
      isVerified: false,
      isOnline: false,
    },
    moment: {
      id: 'm2',
      title: 'Sunset Dinner',
      image:
        'https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=200',
      emoji: '🌅',
    },
    lastMessage: 'How about we try the new Italian place instead?',
    lastMessageAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    status: 'offer_received',
    unreadCount: 0,
    offerAmount: 45,
    currency: '$',
  },
  {
    id: '3',
    user: {
      id: 'u3',
      name: 'Elena K.',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
      isVerified: true,
      isOnline: true,
    },
    moment: {
      id: 'm3',
      title: 'Jazz Night',
      image:
        'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=200',
      emoji: '🎷',
    },
    lastMessage: 'Payment confirmed! Looking forward to the show.',
    lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'paid',
    unreadCount: 0,
  },
  {
    id: '4',
    user: {
      id: 'u4',
      name: 'Alex T.',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
      isVerified: true,
      isOnline: false,
    },
    moment: {
      id: 'm4',
      title: 'Morning Yoga',
      image:
        'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=200',
      emoji: '🧘',
    },
    lastMessage: 'Waiting for your proof photo from the session.',
    lastMessageAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'proof_pending',
    unreadCount: 1,
  },
  {
    id: '5',
    user: {
      id: 'u5',
      name: 'Sophie L.',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
      isVerified: false,
      isOnline: true,
    },
    moment: {
      id: 'm5',
      title: 'Street Food Tour',
      image:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=200',
      emoji: '🍜',
    },
    lastMessage: 'That was amazing! Best baklava ever 🤩',
    lastMessageAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    unreadCount: 0,
  },
];

const MOCK_REQUESTS: InboxChat[] = [
  {
    id: 'r1',
    user: {
      id: 'u6',
      name: 'James W.',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200',
      isVerified: true,
      isOnline: true,
    },
    moment: {
      id: 'm6',
      title: 'Rooftop Brunch',
      image:
        'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=200',
      emoji: '🥂',
    },
    lastMessage: 'Would love to join your brunch experience!',
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'offer_received',
    unreadCount: 1,
    offerAmount: 60,
    currency: '$',
  },
  {
    id: 'r2',
    user: {
      id: 'u7',
      name: 'Maria G.',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200',
      isVerified: false,
      isOnline: false,
    },
    moment: {
      id: 'm7',
      title: 'Art Gallery Visit',
      image:
        'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=200',
      emoji: '🎨',
    },
    lastMessage: "I'm a big fan of modern art. Can I tag along?",
    lastMessageAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'offer_sent',
    unreadCount: 0,
    offerAmount: 35,
    currency: '$',
  },
];

// ============================================
// INBOX SCREEN COMPONENT
// ============================================
const InboxScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<InboxTab>('active');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chats, setChats] = useState<InboxChat[]>(MOCK_CHATS);
  const [requests, setRequests] = useState<InboxChat[]>(MOCK_REQUESTS);

  // Calculate totals
  const totalUnread = useMemo(
    () => chats.reduce((sum, chat) => sum + chat.unreadCount, 0),
    [chats],
  );

  const requestCount = requests.length;

  // Current list based on active tab
  const currentList = activeTab === 'active' ? chats : requests;

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In real app, fetch from API here
    setIsRefreshing(false);
  }, []);

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
    navigation.navigate('ArchivedChats' as never);
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
