import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTypingIndicator } from '../context/RealtimeContext';
import { useMessages } from '../hooks/useMessages';
import { useScreenPerformance } from '../hooks/useScreenPerformance';
import { logger } from '../utils/logger';

export interface Message {
  id: string;
  type: 'text' | 'image' | 'system' | 'proof';
  text?: string;
  imageUrl?: string;
  user: 'me' | 'other' | 'system';
  timestamp?: string;
}

interface UseChatScreenParams {
  conversationId?: string;
  otherUserId: string;
  otherUserName: string;
  isSender?: boolean;
  proofStatus?: 'pending' | 'verified' | 'rejected' | 'disputed';
}

export const useChatScreen = ({
  conversationId,
  otherUserId,
  otherUserName,
  isSender = true,
  proofStatus = 'verified',
}: UseChatScreenParams) => {
  const [messageText, setMessageText] = useState('');
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user: currentUser } = useAuth();

  // Use messages hook for API integration
  const {
    messages: apiMessages,
    messagesLoading: isLoading,
    sendMessage,
    loadMessages,
  } = useMessages();

  // Typing indicator
  const { isAnyoneTyping, startTyping, stopTyping } = useTypingIndicator(
    conversationId || 'default',
  );

  // Performance tracking
  const { trackMount, trackInteraction } = useScreenPerformance('ChatScreen');

  useEffect(() => {
    trackMount();
  }, [trackMount]);

  // Fetch messages when screen loads
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages]);

  // Map API messages to UI messages
  useEffect(() => {
    if (apiMessages) {
      const mappedMessages: Message[] = apiMessages.map((msg) => ({
        id: msg.id,
        type: (msg.type === 'location' ? 'text' : msg.type) as Message['type'],
        text: msg.content,
        imageUrl: msg.imageUrl,
        user: msg.senderId === currentUser?.id ? 'me' : 'other',
        timestamp: msg.createdAt,
      }));
      setMessages(mappedMessages);
    }
  }, [apiMessages, currentUser]);

  // Debug logging
  useEffect(() => {
    logger.debug('ChatScreen state:', { showAttachmentSheet, showChatOptions });
  }, [showAttachmentSheet, showChatOptions]);

  // Generate system messages based on escrow status
  const getSystemMessages = useCallback((): Message[] => {
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
  }, [isSender]);

  const getProofSystemMessage = useCallback((): string => {
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
  }, [proofStatus, isSender]);

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

  // Handle send message
  const handleSend = useCallback(async () => {
    if (messageText.trim()) {
      trackInteraction('message_sent', {
        message_length: messageText.length,
        recipient: otherUserName,
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
  }, [
    messageText,
    conversationId,
    sendMessage,
    stopTyping,
    trackInteraction,
    otherUserName,
  ]);

  // Handle attachment sheet actions
  const handlePhotoVideo = useCallback(() => {
    setShowAttachmentSheet(false);
    Alert.alert('Photo/Video', 'Select media to send', [
      { text: 'Camera', onPress: () => logger.debug('Open camera') },
      { text: 'Gallery', onPress: () => logger.debug('Open gallery') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  const handleGift = useCallback(
    (navigation: any) => {
      setShowAttachmentSheet(false);
      navigation.navigate('UnifiedGiftFlow', {
        recipientId: otherUserId,
        recipientName: otherUserName,
      });
    },
    [otherUserId, otherUserName],
  );

  // Handle chat options actions
  const handleChatAction = useCallback(
    (
      action: string,
      reason: string,
      details: string,
      navigation: any,
    ) => {
      logger.debug('Chat action:', action, reason, details);
      if (action === 'block') {
        Alert.alert('User Blocked', `You have blocked ${otherUserName}`);
        navigation.goBack();
      } else if (action === 'report') {
        Alert.alert(
          'Report Submitted',
          'Thank you for reporting. We will review this.',
        );
      } else if (action === 'mute') {
        Alert.alert(
          'Notifications Muted',
          `You won't receive notifications from ${otherUserName}`,
        );
      }
      setShowChatOptions(false);
    },
    [otherUserName],
  );

  return {
    // State
    messageText,
    messages,
    isLoading,
    showAttachmentSheet,
    showChatOptions,
    isAnyoneTyping,
    
    // Actions
    setMessageText: handleTextChange,
    setShowAttachmentSheet,
    setShowChatOptions,
    handleSend,
    handlePhotoVideo,
    handleGift,
    handleChatAction,
    
    // Computed
    getSystemMessages,
    getProofSystemMessage,
  };
};
