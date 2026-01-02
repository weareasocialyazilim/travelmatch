import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/colors';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/utils/logger';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  otherUserAvatar?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar,
  otherUserAvatar,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View
      style={[
        styles.messageBubbleContainer,
        isOwnMessage
          ? styles.ownMessageContainer
          : styles.otherMessageContainer,
      ]}
    >
      {!isOwnMessage && showAvatar && (
        <Image
          source={{ uri: otherUserAvatar }}
          style={styles.messageAvatar}
          contentFit="cover"
        />
      )}
      {!isOwnMessage && !showAvatar && (
        <View style={styles.avatarPlaceholder} />
      )}

      <View
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{message.content}</Text>
        <View style={styles.messageFooter}>
          <Text style={styles.messageTime}>
            {formatTime(message.createdAt)}
          </Text>
          {isOwnMessage && (
            <MaterialCommunityIcons
              name={
                message.status === 'read'
                  ? 'check-all'
                  : message.status === 'delivered'
                    ? 'check-all'
                    : 'check'
              }
              size={14}
              color={message.status === 'read' ? '#3B82F6' : COLORS.text.muted}
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const ChatDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<ChatDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const { conversationId, otherUser } = route.params;
  const { user: currentUser } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const { sendMessage, getConversationMessages, markAsRead } = useMessages();

  // Load messages on mount
  useEffect(() => {
    if (conversationId) {
      const loadMessages = async () => {
        const msgs = await getConversationMessages(conversationId);
        setMessages(msgs);
        markAsRead(conversationId);
      };
      loadMessages();
    }
  }, [conversationId, getConversationMessages, markAsRead]);

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || !conversationId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const tempId = Date.now().toString();
    const newMessage: Message = {
      id: tempId,
      content: messageText.trim(),
      senderId: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    setMessages((prev) => [newMessage, ...prev]);
    setMessageText('');

    try {
      await sendMessage(conversationId, messageText.trim());
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'sent' } : m)),
      );
    } catch (error) {
      logger.error('[Chat] Failed to send message:', error);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'sending' } : m)),
      );
    }
  }, [messageText, conversationId, currentUser, sendMessage]);

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isOwnMessage = item.senderId === currentUser?.id;
      const nextMessage = messages[index + 1];
      const showAvatar =
        !isOwnMessage &&
        (!nextMessage || nextMessage.senderId !== item.senderId);

      return (
        <MessageBubble
          message={item}
          isOwnMessage={isOwnMessage}
          showAvatar={showAvatar}
          otherUserAvatar={otherUser.avatarUrl}
        />
      );
    },
    [currentUser, messages, otherUser],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.userInfo}
          onPress={() =>
            navigation.navigate('UserProfile', { userId: otherUser.id })
          }
        >
          <Image
            source={{ uri: otherUser.avatarUrl }}
            style={styles.headerAvatar}
            contentFit="cover"
          />
          <View>
            <Text style={styles.headerName}>{otherUser.name}</Text>
            <Text style={styles.headerStatus}>
              {otherUser.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={COLORS.text.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      />

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.bottom}
      >
        <View
          style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}
        >
          <TouchableOpacity style={styles.attachButton}>
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color={COLORS.text.secondary}
            />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Message..."
              placeholderTextColor={COLORS.text.muted}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              messageText.trim() && styles.sendButtonActive,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={messageText.trim() ? '#fff' : COLORS.text.muted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border.default,
  },
  backButton: {
    padding: 4,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.tertiary,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headerStatus: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  moreButton: {
    padding: 8,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: COLORS.background.tertiary,
  },
  avatarPlaceholder: {
    width: 36,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  ownMessage: {
    backgroundColor: COLORS.brand.primary,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: COLORS.background.secondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.text.muted,
  },
  statusIcon: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border.default,
    backgroundColor: COLORS.background.primary,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
  },
  textInput: {
    fontSize: 16,
    color: COLORS.text.primary,
    maxHeight: 100,
    padding: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: COLORS.brand.primary,
  },
});

export default withErrorBoundary(ChatDetailScreen, { displayName: 'ChatDetailScreen' });
