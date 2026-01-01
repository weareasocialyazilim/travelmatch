import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTypingIndicator } from '@/context/RealtimeContext';
import { useMessages } from '@/hooks/useMessages';
import { useScreenPerformance } from '@/hooks/useScreenPerformance';
import { logger } from '@/utils/logger';
import { useToast } from '@/context/ToastContext';
import { giftOfferService } from '@/services/giftOfferService';

export interface Message {
  id: string;
  type: 'text' | 'image' | 'system' | 'proof' | 'offer';
  text?: string;
  imageUrl?: string | null;
  user: 'me' | 'other' | 'system';
  timestamp?: string | null;
  // Offer-specific fields
  giftId?: string; // Links to gifts table
  amount?: number;
  currency?: string;
  offerStatus?: 'pending' | 'accepted' | 'declined' | 'expired';
  momentId?: string;
  momentTitle?: string;
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
  const { showToast } = useToast();
  const [messageText, setMessageText] = useState('');
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
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

  // Handle send message with OPTIMISTIC UI
  const handleSend = useCallback(async () => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isSending) return;

    // Generate optimistic message ID
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      type: 'text',
      text: trimmedMessage,
      user: 'me',
      timestamp: new Date().toISOString(),
    };

    // 1. IMMEDIATELY add message to UI (optimistic update)
    setMessages((prev) => [...prev, optimisticMessage]);

    // 2. IMMEDIATELY clear input
    setMessageText('');
    stopTyping();

    // 3. Track interaction
    trackInteraction('message_sent', {
      message_length: trimmedMessage.length,
      recipient: otherUserName,
    });

    // 4. Send to server in background
    setIsSending(true);
    try {
      if (conversationId) {
        await sendMessage({
          conversationId,
          content: trimmedMessage,
          type: 'text',
        });
      }
      // Message sent successfully - real message will come via realtime subscription
    } catch (error) {
      logger.error('Failed to send message', error as Error);
      showToast('Mesaj gönderilemedi. Tekrar deneyin.', 'error');

      // Rollback: Remove optimistic message on failure
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
    } finally {
      setIsSending(false);
    }
  }, [
    messageText,
    isSending,
    conversationId,
    sendMessage,
    stopTyping,
    trackInteraction,
    otherUserName,
    showToast,
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
    (action: string, reason: string, details: string, navigation: any) => {
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

  // Handle accepting an offer
  const handleAcceptOffer = useCallback(
    async (messageId: string) => {
      // Find the message to get the giftId
      const offerMessage = messages.find((msg) => msg.id === messageId);
      const giftId = offerMessage?.giftId;

      if (!giftId) {
        logger.warn('No giftId found for message:', messageId);
        showToast('Unable to process offer. Please try again.', 'error');
        return;
      }

      try {
        trackInteraction('offer_accepted', { messageId, giftId, otherUser: otherUserName });

        // Update message status optimistically
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, offerStatus: 'accepted' as const } : msg
          )
        );

        // Call API to accept offer
        const result = await giftOfferService.acceptOffer(giftId);

        if (!result.success) {
          throw new Error(result.error || 'Failed to accept offer');
        }

        // Add system message
        const systemMessage: Message = {
          id: `system-${Date.now()}`,
          type: 'system',
          text: 'Offer accepted! Payment has been processed.',
          user: 'system',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, systemMessage]);

        showToast('Offer accepted! Payment processed.', 'success');
      } catch (error) {
        logger.error('Failed to accept offer', error as Error);
        showToast('Failed to accept offer. Please try again.', 'error');

        // Rollback
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, offerStatus: 'pending' as const } : msg
          )
        );
      }
    },
    [messages, otherUserName, trackInteraction, showToast]
  );

  // Handle declining an offer
  const handleDeclineOffer = useCallback(
    async (messageId: string) => {
      // Find the message to get the giftId
      const offerMessage = messages.find((msg) => msg.id === messageId);
      const giftId = offerMessage?.giftId;

      if (!giftId) {
        logger.warn('No giftId found for message:', messageId);
        showToast('Unable to process offer. Please try again.', 'error');
        return;
      }

      try {
        trackInteraction('offer_declined', { messageId, giftId, otherUser: otherUserName });

        // Update message status optimistically
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, offerStatus: 'declined' as const } : msg
          )
        );

        // Call API to decline offer
        const result = await giftOfferService.declineOffer(giftId);

        if (!result.success) {
          throw new Error(result.error || 'Failed to decline offer');
        }

        // Add system message
        const systemMessage: Message = {
          id: `system-${Date.now()}`,
          type: 'system',
          text: 'Offer declined.',
          user: 'system',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, systemMessage]);

        showToast('Offer declined.', 'info');
      } catch (error) {
        logger.error('Failed to decline offer', error as Error);
        showToast('Failed to decline offer. Please try again.', 'error');

        // Rollback
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, offerStatus: 'pending' as const } : msg
          )
        );
      }
    },
    [messages, otherUserName, trackInteraction, showToast]
  );

  return {
    // State
    messageText,
    messages,
    isLoading,
    isSending,
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
    handleAcceptOffer,
    handleDeclineOffer,

    // Computed
    getSystemMessages,
    getProofSystemMessage,
  };
};
