import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorState, EmptyState } from '@/components';
import { SkeletonList } from '@/components/ui';
import { FadeInView as _FadeInView } from '@/components/AnimatedComponents';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { useRealtime, useRealtimeEvent } from '@/context/RealtimeContext';
import { useMessages } from '@/hooks/useMessages';
import { useTranslation } from '@/hooks/useTranslation';
import type { MessageEvent } from '@/context/RealtimeContext';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { Conversation } from '@/services/messageService';
import type { NavigationProp } from '@react-navigation/native';
import { withErrorBoundary } from '../../../components/withErrorBoundary';
import { NetworkGuard } from '../../../components/NetworkGuard';

// Format time ago
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Use messages hook
  const {
    conversations,
    conversationsLoading: isLoading,
    conversationsError: error,
    refreshConversations,
  } = useMessages();

  // Realtime context
  const { isUserOnline } = useRealtime();

  // Track typing users
  const [typingConversations, setTypingConversations] = useState<Set<string>>(
    new Set(),
  );

  // Fetch conversations on mount
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Listen for new messages to refresh list
  useRealtimeEvent<MessageEvent>(
    'message:new',
    (_data) => {
      // Find the conversation and move to top
      refreshConversations();
    },
    [refreshConversations],
  );

  // Track typing timeouts for cleanup
  const typingTimeoutsRef = React.useRef<Map<string, NodeJS.Timeout>>(
    new Map(),
  );

  // Listen for typing indicators
  useRealtimeEvent<{
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }>(
    'message:typing',
    (data) => {
      if (data.isTyping) {
        setTypingConversations(
          (prev) => new Set([...prev, data.conversationId]),
        );

        // Clear existing timeout for this conversation
        const existingTimeout = typingTimeoutsRef.current.get(
          data.conversationId,
        );
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Auto-remove after 5 seconds with cleanup
        const timeout = setTimeout(() => {
          setTypingConversations((prev) => {
            const next = new Set(prev);
            next.delete(data.conversationId);
            return next;
          });
          typingTimeoutsRef.current.delete(data.conversationId);
        }, 5000);

        typingTimeoutsRef.current.set(data.conversationId, timeout);
      } else {
        // Clear timeout when user stops typing
        const existingTimeout = typingTimeoutsRef.current.get(
          data.conversationId,
        );
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          typingTimeoutsRef.current.delete(data.conversationId);
        }

        setTypingConversations((prev) => {
          const next = new Set(prev);
          next.delete(data.conversationId);
          return next;
        });
      }
    },
    [],
  );

  // Cleanup typing timeouts on unmount
  useEffect(() => {
    return () => {
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
    };
  }, []);

  const _totalUnreadCount = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [conversations],
  );

  const filteredChats = useMemo(
    () =>
      conversations.filter(
        (chat) =>
          chat.participantName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          chat.momentTitle?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [conversations, searchQuery],
  );

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refreshConversations();
  }, [refreshConversations]);

  const handleChatPress = useCallback(
    (conversation: Conversation) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('Chat', {
        otherUser: {
          id: conversation.participantId || '',
          name: conversation.participantName || 'User',
          avatar: conversation.participantAvatar,
          isVerified: conversation.participantVerified,
          role: 'Traveler',
          kyc: 'Verified',
          location: '',
        },
        conversationId: conversation.id,
      });
    },
    [navigation],
  );

  const renderChatItem = useCallback(
    ({ item }: { item: Conversation }) => {
      const isOnline = item.participantId
        ? isUserOnline(item.participantId)
        : false;
      const isTyping = typingConversations.has(item.id);

      return (
        <TouchableOpacity
          style={styles.chatItem}
          onPress={() => handleChatPress(item)}
          activeOpacity={0.7}
          accessibilityLabel={`Chat with ${item.participantName || 'User'}${
            item.unreadCount ? `, ${item.unreadCount} unread messages` : ''
          }`}
          accessibilityRole="button"
          accessibilityHint="Opens conversation"
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: item.participantAvatar || '',
              }}
              style={styles.avatar}
              accessibilityLabel={`${item.participantName || 'User'}'s avatar`}
            />
            {isOnline && <View style={styles.onlineIndicator} />}
          </View>

          {/* Content */}
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <View style={styles.nameContainer}>
                <Text style={styles.personName}>
                  {item.participantName || 'User'}
                </Text>
                {item.participantVerified && (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={14}
                    color={COLORS.brand.primary}
                  />
                )}
              </View>
              <Text style={styles.timeText}>
                {item.lastMessageAt ? formatTimeAgo(item.lastMessageAt) : ''}
              </Text>
            </View>

            {/* Moment Badge */}
            {item.momentId && (
              <View style={styles.momentBadge}>
                <Text style={styles.momentEmoji}>✨</Text>
                <Text style={styles.momentTitle}>{item.momentTitle}</Text>
              </View>
            )}

            {/* Last Message */}
            <View style={styles.messageRow}>
              {isTyping ? (
                <Text style={styles.typingText}>typing...</Text>
              ) : (
                <Text
                  style={[
                    styles.lastMessage,
                    (item.unreadCount || 0) > 0 && styles.lastMessageUnread,
                  ]}
                  numberOfLines={1}
                >
                  {typeof item.lastMessage === 'string'
                    ? item.lastMessage
                    : item.lastMessage?.content || 'Start a conversation'}
                </Text>
              )}
              {(item.unreadCount || 0) > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleChatPress, isUserOnline, typingConversations],
  );

  const renderEmptyState = useCallback(
    () => (
      <EmptyState
        icon="chat-outline"
        title={t('messages.empty.title')}
        description={t('messages.empty.description')}
        actionLabel={t('navigation.discover')}
        onAction={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        style={styles.emptyStateContainer}
      />
    ),
    [navigation, t],
  );

  // Loading state - show skeleton
  if (isLoading && conversations.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={COLORS.text.secondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t('messages.search.placeholder')}
              placeholderTextColor={COLORS.text.secondary}
              editable={false}
            />
          </View>
        </View>
        <SkeletonList
          type="chat"
          count={6}
          show={isLoading}
          minDisplayTime={300}
        />
      </SafeAreaView>
    );
  }

  // Error state
  if (error && conversations.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ErrorState
          message={error}
          onRetry={refreshConversations}
          useMaterialIcon={true}
          materialIcon="chat-alert-outline"
        />
      </SafeAreaView>
    );
  }

  return (
    <NetworkGuard
      offlineMessage={
        conversations.length > 0
          ? t('messages.cached')
          : t('messages.offline')
      }
      onRetry={refreshConversations}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Search Bar - No title header */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={COLORS.text.secondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t('messages.search.placeholder')}
              placeholderTextColor={COLORS.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel={t('messages.search.placeholder')}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Chat List */}
        <FlashList
          data={filteredChats}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </SafeAreaView>
    </NetworkGuard>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 26,
    height: 52,
    width: 52,
  },
  avatarContainer: {
    position: 'relative',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatItem: {
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  container: {
    backgroundColor: COLORS.bg.primary,
    flex: 1,
  },
  lastMessage: {
    color: COLORS.text.secondary,
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
  },
  lastMessageUnread: {
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100,
  },
  messageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  momentBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 6,
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  momentEmoji: {
    ...TYPOGRAPHY.caption,
  },
  momentTitle: {
    color: COLORS.text.secondary,
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
  },
  nameContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  onlineIndicator: {
    backgroundColor: COLORS.greenBright,
    borderColor: COLORS.utility.white,
    borderRadius: 6,
    borderWidth: 2,
    bottom: 2,
    height: 12,
    position: 'absolute',
    right: 2,
    width: 12,
  },
  personName: {
    color: COLORS.text.primary,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  searchInput: {
    color: COLORS.text.primary,
    flex: 1,
    ...TYPOGRAPHY.body,
  },
  separator: {
    backgroundColor: COLORS.border.default,
    height: 1,
    marginLeft: 80,
  },
  timeText: {
    color: COLORS.text.secondary,
    ...TYPOGRAPHY.caption,
  },
  typingText: {
    color: COLORS.brand.primary,
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    fontStyle: 'italic',
  },
  unreadBadge: {
    backgroundColor: COLORS.brand.primary,
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadText: {
    color: COLORS.utility.white,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyStateContainer: {
    paddingTop: 80,
  },
});

// Wrap with ErrorBoundary for critical messaging functionality
export default withErrorBoundary(MessagesScreen, {
  fallbackType: 'generic',
  displayName: 'MessagesScreen',
});
