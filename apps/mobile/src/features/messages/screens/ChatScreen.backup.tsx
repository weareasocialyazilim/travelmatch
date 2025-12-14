import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ScrollView as _ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatAttachmentBottomSheet } from '@/components/ChatAttachmentBottomSheet';
import { ReportBlockBottomSheet } from '@/components/ReportBlockBottomSheet';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { useAuth } from '@/context/AuthContext';
import { useTypingIndicator } from '@/context/RealtimeContext';
import { useMessages } from '@/hooks/useMessages';
import { useScreenPerformance } from '@/hooks/useScreenPerformance';
import {
  CHAT_LIST_CONFIG,
  ITEM_HEIGHTS,
  createGetItemLayout,
} from '@/utils/listOptimization';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

interface Message {
  id: string;
  type: 'text' | 'image' | 'system' | 'proof';
  text?: string;
  imageUrl?: string;
  user: 'me' | 'other' | 'system';
  timestamp?: string;
}

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const { otherUser, conversationId } = route.params;
  const [messageText, setMessageText] = useState('');
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);

  // Use messages hook for API integration
  const {
    messages: _apiMessages,
    messagesLoading: _isLoading,
    sendMessage,
    loadMessages,
  } = useMessages();

  // Typing indicator
  const {
    typingUserIds: _typingUserIds,
    isAnyoneTyping,
    startTyping,
    stopTyping,
  } = useTypingIndicator(conversationId || 'default');

  // Fetch messages when screen loads
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages]);

  // Map API messages to UI messages
  useEffect(() => {
    if (_apiMessages) {
      const mappedMessages: Message[] = _apiMessages.map((msg) => ({
        id: msg.id,
        type: (msg.type === 'location' ? 'text' : msg.type) as Message['type'],
        text: msg.content,
        imageUrl: msg.imageUrl,
        user: msg.senderId === currentUser?.id ? 'me' : 'other',
        timestamp: msg.createdAt,
      }));
      setMessages(mappedMessages);
    }
  }, [_apiMessages, currentUser]);

  // Handle text input changes for typing indicator
  const handleTextChange = useCallback(
    (text: string) => {
      setMessageText(text);

      // Send typing start
      if (text.length > 0) {
        startTyping();

        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of no input
        typingTimeoutRef.current = setTimeout(() => {
          stopTyping();
        }, 2000);
      } else {
        stopTyping();
      }
    },
    [startTyping, stopTyping],
  );

  // Escrow logic: System automatically verifies proof
  // No manual approve/reject by users
  const isSender = true; // In real app: check if currentUserId === chat.senderId
  // Type assertion to allow all valid status values for comparison
  const proofStatus = 'verified' as
    | 'pending'
    | 'verified'
    | 'rejected'
    | 'disputed'; // Status from API

  // Generate system messages based on escrow status
  const getSystemMessages = (): Message[] => {
    const baseMessages: Message[] = [
      {
        id: '1',
        type: 'system',
        text: 'Today',
        user: 'system',
      },
    ];

    if (isSender) {
      baseMessages.push({
        id: '2',
        type: 'system',
        text: 'You gifted this moment.',
        user: 'system',
      });
    } else {
      baseMessages.push({
        id: '2',
        type: 'system',
        text: 'You received this moment as a gift.',
        user: 'system',
      });
    }

    return baseMessages;
  };

  const getProofSystemMessage = (): string => {
    if (proofStatus === 'pending') {
      return isSender
        ? 'Proof uploaded by receiver. System is verifying...'
        : 'You uploaded proof. System is verifying...';
    } else if (proofStatus === 'verified') {
      return isSender
        ? 'Proof verified by system. Funds released to receiver.'
        : 'Your proof was verified. Funds received!';
    } else if (proofStatus === 'rejected') {
      return isSender
        ? 'Proof verification failed. Funds returned to your account.'
        : 'Proof verification failed. Please upload valid proof.';
    }
    return '';
  };

  const MOCK_MESSAGES: Message[] = __DEV__
    ? [
        ...getSystemMessages(),
        {
          id: '3',
          type: 'text',
          text: "Thank you so much for the gift! I'm really looking forward to this.",
          user: 'other',
        },
        {
          id: '4',
          type: 'text',
          text: "You're welcome! Enjoy your coffee and the view.",
          user: 'me',
        },
        {
          id: '5',
          type: 'image',
          imageUrl:
            'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600',
          user: 'other',
        },
        {
          id: '6',
          type: 'system',
          text: getProofSystemMessage(),
          user: 'system',
        },
        {
          id: '7',
          type: 'proof',
          text: 'Receipt_Paris_Cafe.pdf',
          user: 'other',
        },
      ]
    : [...getSystemMessages()];

  useEffect(() => {
    logger.debug('ChatScreen state:', { showAttachmentSheet, showChatOptions });
  }, [showAttachmentSheet, showChatOptions]);

  const { trackMount, trackInteraction } = useScreenPerformance('ChatScreen');

  useEffect(() => {
    trackMount();
  }, [trackMount]);

  const handleSend = async () => {
    if (messageText.trim()) {
      trackInteraction('message_sent', {
        message_length: messageText.length,
        recipient: otherUser.name,
      });

      // Send via API if conversationId exists
      if (conversationId) {
        await sendMessage({
          conversationId,
          content: messageText.trim(),
          type: 'text',
        });
      }

      stopTyping();
      setMessageText('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    if (item.type === 'proof') {
      return (
        <View style={styles.messageRow}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100',
            }}
            style={styles.messageAvatar}
          />
          <View style={styles.proofMessageContainer}>
            <View style={styles.proofCard}>
              <View style={styles.proofHeaderRow}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={18}
                  color={COLORS.success}
                />
                <Text style={styles.proofHeaderText}>Proof of Moment</Text>
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={18}
                  color={COLORS.success}
                />
              </View>
              <Text style={styles.proofFilename}>{item.text}</Text>
            </View>
            {/* Status messages based on proof verification */}
            {proofStatus === 'pending' && (
              <View style={styles.proofStatusContainer}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={16}
                  color={COLORS.warning}
                />
                <Text style={styles.proofStatusText}>Verifying proof...</Text>
              </View>
            )}
            {proofStatus === 'verified' && (
              <View style={styles.proofStatusContainer}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={16}
                  color={COLORS.success}
                />
                <Text style={styles.proofStatusVerified}>
                  Verified - Funds released
                </Text>
              </View>
            )}
            {proofStatus === 'rejected' && (
              <View style={styles.proofStatusContainer}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={16}
                  color={COLORS.error}
                />
                <Text style={styles.proofStatusRejected}>
                  Verification failed
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    if (item.type === 'image') {
      return (
        <View style={styles.messageRow}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100',
            }}
            style={styles.messageAvatar}
          />
          <View style={styles.imageMessageContainer}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          </View>
        </View>
      );
    }

    if (item.user === 'me') {
      return (
        <View style={styles.myMessageRow}>
          <View style={styles.myMessageBubble}>
            <Text style={styles.myMessageText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.messageRow}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100',
          }}
          style={styles.messageAvatar}
        />
        <View style={styles.otherMessageBubble}>
          <Text style={styles.otherMessageText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerUserInfo}
            onPress={() =>
              navigation.navigate('ProfileDetail', { userId: otherUser.id })
            }
            activeOpacity={0.7}
            accessibilityLabel={`View ${otherUser.name}'s profile`}
            accessibilityRole="button"
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    otherUser.avatar ||
                    'https://images.unsplash.com/photo-1544025162-d76694265947?w=100',
                }}
                style={styles.headerAvatar}
              />
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons
                  name="check"
                  size={10}
                  color={COLORS.white}
                />
              </View>
            </View>
            <View style={styles.headerTextInfo}>
              <View style={styles.headerNameRow}>
                <Text style={styles.headerName}>{otherUser.name}</Text>
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.headerRole}>Traveler</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              logger.debug('More button pressed - opening chat options');
              setShowChatOptions(true);
            }}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="More chat options"
            accessibilityRole="button"
            accessibilityHint="Opens menu for blocking, reporting, or archiving"
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>

        {/* Linked Moment Card */}
        <TouchableOpacity
          style={styles.linkedMomentCard}
          onPress={() => {
            logger.debug('Moment card pressed - navigating to MomentDetail');
            navigation.navigate('MomentDetail', {
              moment: {
                id: 'moment-123',
                title: 'Coffee at a Parisian Café',
                story:
                  'Enjoy coffee with a view of the Eiffel Tower. Experience authentic Parisian café culture while enjoying breathtaking views of the iconic Eiffel Tower.',
                imageUrl:
                  'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
                price: 15,
                availability: 'Dec 5-10',
                category: {
                  id: 'food',
                  label: 'Food & Drink',
                  emoji: '☕',
                },
                location: {
                  name: 'Café de Paris',
                  city: 'Paris',
                  country: 'France',
                },
                user: {
                  name: otherUser.name,
                  avatar: otherUser.avatar,
                  type: otherUser.type || 'traveler',
                  isVerified: otherUser.isVerified || true,
                  location: 'Paris, France',
                  travelDays: 7,
                },
              },
            });
          }}
          activeOpacity={0.7}
          accessibilityLabel="View linked moment: Coffee at a Parisian Café"
          accessibilityRole="button"
          accessibilityHint="Opens the moment details"
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=200',
            }}
            style={styles.momentThumbnail}
          />
          <View style={styles.momentInfo}>
            <Text style={styles.momentTitle}>Coffee at a Parisian Café</Text>
            <Text style={styles.momentSubtitle}>Gifted by you</Text>
          </View>
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList<Message>
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          {...CHAT_LIST_CONFIG}
          getItemLayout={createGetItemLayout(ITEM_HEIGHTS.CHAT_MESSAGE)}
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper} pointerEvents="box-none">
              <TouchableOpacity
                style={styles.attachButton}
                onPress={() => {
                  logger.debug(
                    'Attach button pressed - opening attachment sheet',
                  );
                  setShowAttachmentSheet(true);
                }}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Attach file"
                accessibilityRole="button"
                accessibilityHint="Opens attachment options"
              >
                <MaterialCommunityIcons
                  name="plus-circle"
                  size={24}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Thank them or ask a question..."
                placeholderTextColor={COLORS.textSecondary}
                value={messageText}
                onChangeText={handleTextChange}
                multiline={false}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
                editable={true}
                contextMenuHidden={false}
                accessibilityLabel="Message input"
                accessibilityHint="Type your message here"
              />
              {isAnyoneTyping && (
                <Text style={styles.typingIndicator}>typing...</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              accessibilityLabel="Send message"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="send"
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Bottom Sheet */}
      <ChatAttachmentBottomSheet
        visible={showAttachmentSheet}
        onClose={() => setShowAttachmentSheet(false)}
        onPhotoVideo={() => {
          setShowAttachmentSheet(false);
          Alert.alert('Photo/Video', 'Select media to send', [
            { text: 'Camera', onPress: () => logger.debug('Open camera') },
            { text: 'Gallery', onPress: () => logger.debug('Open gallery') },
            { text: 'Cancel', style: 'cancel' },
          ]);
        }}
        onGift={() => {
          setShowAttachmentSheet(false);
          navigation.navigate('UnifiedGiftFlow', {
            recipientId: otherUser.id,
            recipientName: otherUser.name,
          });
        }}
      />

      {/* Chat Options Bottom Sheet */}
      <ReportBlockBottomSheet
        visible={showChatOptions}
        onClose={() => setShowChatOptions(false)}
        onSubmit={(action, reason, details) => {
          logger.debug('Chat action:', action, reason, details);
          if (action === 'block') {
            Alert.alert('User Blocked', `You have blocked ${otherUser.name}`);
            navigation.goBack();
          } else if (action === 'report') {
            Alert.alert(
              'Report Submitted',
              'Thank you for reporting. We will review this.',
            );
          } else if (action === 'mute') {
            Alert.alert(
              'Notifications Muted',
              `You won't receive notifications from ${otherUser.name}`,
            );
          }
          setShowChatOptions(false);
        }}
        targetType="user"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.background,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerName: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 4,
  },
  headerRole: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkedMomentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  momentThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  momentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  momentTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  momentSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.mintTransparent,
    borderRadius: 9999,
  },
  viewButtonText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.primary,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  systemMessageContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  systemMessageText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  myMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  otherMessageBubble: {
    maxWidth: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderBottomLeftRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  otherMessageText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text,
    lineHeight: 24,
  },
  myMessageBubble: {
    maxWidth: '80%',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    borderBottomRightRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  myMessageText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.white,
    lineHeight: 24,
  },
  imageMessageContainer: {
    maxWidth: '80%',
    borderRadius: 12,
    borderBottomLeftRadius: 0,
    overflow: 'hidden',
  },
  messageImage: {
    width: 240,
    aspectRatio: 4 / 3,
  },
  proofMessageContainer: {
    maxWidth: '80%',
  },
  proofCard: {
    backgroundColor: COLORS.successLight,
    borderRadius: 12,
    borderBottomLeftRadius: 0,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  proofHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  proofHeaderText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.success,
    flex: 1,
  },
  proofFilename: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '500',
  },
  proofStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.success + '20',
  },
  proofStatusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
    fontWeight: '500',
  },
  proofStatusVerified: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  proofStatusRejected: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    fontWeight: '600',
  },
  inputBar: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 9999,
    paddingLeft: 4,
    marginRight: 8,
    height: 48,
  },
  attachButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    paddingRight: 16,
  },
  typingIndicator: {
    position: 'absolute',
    right: 16,
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;
