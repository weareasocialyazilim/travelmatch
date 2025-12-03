import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import * as Haptics from 'expo-haptics';
import BottomNav from '../components/BottomNav';
import { COLORS } from '../constants/colors';

interface Person {
  id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
  isVerified?: boolean;
}

interface ChatItem {
  id: string;
  person: Person;
  momentTitle: string;
  momentEmoji: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isTyping?: boolean;
}

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Data - Chats
  const [chats] = useState<ChatItem[]>([
    {
      id: 'c1',
      person: {
        id: 'maria-1',
        name: 'Maria',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        isOnline: true,
        isVerified: true,
      },
      momentTitle: 'Museum Tour',
      momentEmoji: '🎭',
      lastMessage: 'See you tomorrow at 3pm! 🎉',
      lastMessageTime: '2m ago',
      unreadCount: 2,
    },
    {
      id: 'c2',
      person: {
        id: 'james-1',
        name: 'James',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        isOnline: false,
        isVerified: true,
      },
      momentTitle: 'Coffee',
      momentEmoji: '☕',
      lastMessage: 'Thanks! It was great meeting you',
      lastMessageTime: '1h ago',
      unreadCount: 0,
    },
    {
      id: 'c3',
      person: {
        id: 'sophie-1',
        name: 'Sophie',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        isOnline: true,
        isVerified: false,
      },
      momentTitle: 'Food Tour',
      momentEmoji: '🍜',
      lastMessage: 'The restaurant was amazing!',
      lastMessageTime: '3h ago',
      unreadCount: 0,
      isTyping: true,
    },
    {
      id: 'c4',
      person: {
        id: 'david-1',
        name: 'David',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        isOnline: false,
        isVerified: true,
      },
      momentTitle: 'City Walk',
      momentEmoji: '🚶',
      lastMessage: 'Looking forward to our tour next week',
      lastMessageTime: '1d ago',
      unreadCount: 0,
    },
    {
      id: 'c5',
      person: {
        id: 'emma-1',
        name: 'Emma',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        isOnline: false,
        isVerified: true,
      },
      momentTitle: 'Nightlife',
      momentEmoji: '🍸',
      lastMessage: 'That was so much fun!',
      lastMessageTime: '2d ago',
      unreadCount: 0,
    },
  ]);

  const totalUnreadCount = chats.reduce((sum, c) => sum + c.unreadCount, 0);

  const filteredChats = chats.filter(chat =>
    chat.person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.momentTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleChatPress = (chat: ChatItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Chat', {
      otherUser: {
        id: chat.person.id,
        name: chat.person.name,
        avatar: chat.person.avatar,
        isVerified: chat.person.isVerified,
      } as any,
    });
  };

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.person.avatar }} style={styles.avatar} />
        {item.person.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      {/* Content */}
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <View style={styles.nameContainer}>
            <Text style={styles.personName}>{item.person.name}</Text>
            {item.person.isVerified && (
              <MaterialCommunityIcons name="check-decagram" size={14} color={COLORS.primary} />
            )}
          </View>
          <Text style={styles.timeText}>{item.lastMessageTime}</Text>
        </View>

        {/* Moment Badge */}
        <View style={styles.momentBadge}>
          <Text style={styles.momentEmoji}>{item.momentEmoji}</Text>
          <Text style={styles.momentTitle}>{item.momentTitle}</Text>
        </View>

        {/* Last Message */}
        <View style={styles.messageRow}>
          {item.isTyping ? (
            <Text style={styles.typingText}>typing...</Text>
          ) : (
            <Text
              style={[styles.lastMessage, item.unreadCount > 0 && styles.lastMessageUnread]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
          )}
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="chat-outline" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Messages Yet</Text>
      <Text style={styles.emptySubtitle}>
        When you connect with travelers or hosts, your conversations will appear here.
      </Text>
      <TouchableOpacity
        style={styles.discoverButton}
        onPress={() => navigation.navigate('Discover')}
      >
        <Text style={styles.discoverButtonText}>Discover Moments</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Bar - No title header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <BottomNav activeTab="Messages" messagesBadge={totalUnreadCount} />
    </SafeAreaView>
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
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  discoverButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  discoverButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  lastMessage: {
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: 14,
  },
  lastMessageUnread: {
    color: COLORS.text,
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
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  momentEmoji: {
    fontSize: 12,
  },
  momentTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  nameContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  onlineIndicator: {
    backgroundColor: '#22C55E',
    borderColor: COLORS.white,
    borderRadius: 6,
    borderWidth: 2,
    bottom: 2,
    height: 12,
    position: 'absolute',
    right: 2,
    width: 12,
  },
  personName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
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
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
  },
  separator: {
    backgroundColor: COLORS.border,
    height: 1,
    marginLeft: 80,
  },
  timeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  typingText: {
    color: COLORS.primary,
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default MessagesScreen;
