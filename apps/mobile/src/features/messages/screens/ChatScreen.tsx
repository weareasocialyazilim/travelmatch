import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatHeader } from '../components/ChatHeader';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInputBar } from '../components/ChatInputBar';
import { ChatAttachmentBottomSheet } from '../components/ChatAttachmentBottomSheet';
import { ReportBlockBottomSheet } from '../components/ReportBlockBottomSheet';
import { COLORS } from '../constants/colors';
import { useChatScreen, type Message } from '../hooks/useChatScreen';
import {
  CHAT_LIST_CONFIG,
  ITEM_HEIGHTS,
  createGetItemLayout,
} from '../utils/listOptimization';
import { logger } from '../utils/logger';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { withErrorBoundary } from '../../../components/withErrorBoundary';
import { NetworkGuard } from '../../../components/NetworkGuard';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const { otherUser, conversationId } = route.params;

  // Escrow logic: System automatically verifies proof
  const isSender = true; // In real app: check if currentUserId === chat.senderId
  const proofStatus = 'verified' as 'pending' | 'verified' | 'rejected' | 'disputed';

  const {
    messageText,
    messages,
    showAttachmentSheet,
    showChatOptions,
    isAnyoneTyping,
    isSending,
    setMessageText,
    setShowAttachmentSheet,
    setShowChatOptions,
    handleSend,
    handlePhotoVideo,
    handleGift,
    handleChatAction,
  } = useChatScreen({
    conversationId,
    otherUserId: otherUser.id,
    otherUserName: otherUser.name,
    isSender,
    proofStatus,
  });

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble item={item} proofStatus={proofStatus} />
  );

  const handleMomentPress = () => {
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
  };

  return (
    <NetworkGuard>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ChatHeader
        otherUser={otherUser}
        onBack={() => navigation.goBack()}
        onUserPress={() =>
          navigation.navigate('ProfileDetail', { userId: otherUser.id })
        }
        onMomentPress={handleMomentPress}
        onMorePress={() => {
          logger.debug('More button pressed - opening chat options');
          setShowChatOptions(true);
        }}
      />

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlashList<Message>
          data={messages}
          renderItem={renderMessage}
          estimatedItemSize={120}
          contentContainerStyle={styles.messagesList}
          {...CHAT_LIST_CONFIG}
        />

        <ChatInputBar
          messageText={messageText}
          onTextChange={setMessageText}
          onSend={handleSend}
          onAttachPress={() => setShowAttachmentSheet(true)}
          isTyping={isAnyoneTyping}
          isSending={isSending}
        />
      </KeyboardAvoidingView>

      <ChatAttachmentBottomSheet
        visible={showAttachmentSheet}
        onClose={() => setShowAttachmentSheet(false)}
        onPhotoVideo={handlePhotoVideo}
        onGift={() => handleGift(navigation)}
      />

      <ReportBlockBottomSheet
        visible={showChatOptions}
        onClose={() => setShowChatOptions(false)}
        onSubmit={(action, reason, details) =>
          handleChatAction(action, reason, details, navigation)
        }
        targetType="user"
      />
    </SafeAreaView>
    </NetworkGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
});

// Wrap with ErrorBoundary for critical chat functionality
export default withErrorBoundary(ChatScreen, { 
  fallbackType: 'generic',
  displayName: 'ChatScreen' 
});
