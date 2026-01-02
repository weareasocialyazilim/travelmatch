import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/SkeletonList';
import BottomNav from '@/components/BottomNav';
import { COLORS } from '@/constants/colors';
import { useMessages } from '@/hooks/useMessages';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { Conversation } from '@/services/messageService';
import type { NavigationProp } from '@react-navigation/native';

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

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
}) => {
  const hasUnread = conversation.unreadCount > 0;

  return (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: conversation.participantAvatar || undefined }}
          style={styles.avatar}
          contentFit="cover"
        />
        {conversation.participantVerified && (
          <View style={styles.onlineIndicator} />
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.userName, hasUnread && styles.userNameUnread]}>
            {conversation.participantName}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimeAgo(
              conversation.lastMessageAt || new Date().toISOString(),
            )}
          </Text>
        </View>
        <View style={styles.messagePreview}>
          <Text
            style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
            numberOfLines={1}
          >
            {conversation.lastMessage || 'No messages yet'}
          </Text>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const InboxScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {
    conversations,
    conversationsLoading: isLoading,
    conversationsError: _error,
    refreshConversations,
  } = useMessages();

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.participantName?.toLowerCase().includes(query) ||
        c.lastMessage?.toLowerCase().includes(query),
    );
  }, [conversations, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refreshConversations();
    } finally {
      setRefreshing(false);
    }
  }, [refreshConversations]);

  const handleConversationPress = useCallback(
    (conversation: Conversation) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('ChatDetail', {
        conversationId: conversation.id,
        otherUser: {
          id: conversation.participantId,
          name: conversation.participantName || 'Unknown',
          avatarUrl: conversation.participantAvatar,
          role: 'Traveler' as const,
          kyc: 'Unverified' as const,
          location: '',
          isVerified: conversation.participantVerified,
        },
      });
    },
    [navigation],
  );

  const renderConversation = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationItem
        conversation={item}
        onPress={() => handleConversationPress(item)}
      />
    ),
    [handleConversationPress],
  );

  if (isLoading && conversations.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
        </View>
        <SkeletonList type="chat" count={8} />
        <BottomNav activeTab="Messages" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity
          style={styles.archiveButton}
          onPress={() => navigation.navigate('ArchivedChats')}
        >
          <MaterialCommunityIcons
            name="archive-outline"
            size={24}
            color={COLORS.text.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={COLORS.text.muted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor={COLORS.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={COLORS.text.muted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <EmptyState
          icon="chat-outline"
          title="No messages yet"
          description="Start a conversation by connecting with someone"
        />
      ) : (
        <FlashList
          data={filteredConversations}
          renderItem={renderConversation}
          estimatedItemSize={80}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.brand.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      <BottomNav activeTab="Messages" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  archiveButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    padding: 0,
  },
  listContent: {
    paddingBottom: 100,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background.tertiary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  userNameUnread: {
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 13,
    color: COLORS.text.muted,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.secondary,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});

export default withErrorBoundary(InboxScreen, { displayName: 'InboxScreen' });
