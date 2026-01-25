/**
 * ChatInputBar - Floating Liquid Glass Input
 *
 * Premium input bar with:
 * - BlurView glass effect for floating feel
 * - Neon send button with glow
 * - Smooth attach button interaction
 * - Gift flow preset from linked moment (Alıcı Fiyat Belirler)
 * - Broadcast typing status via Supabase channel
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/config/supabase';
import { HapticManager } from '@/services/HapticManager';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZES } from '@/constants/typography';
import { logger } from '@/utils/logger';
import { useNetworkStatus } from '../../../context/NetworkContext';

/** Linked moment context for gift flow preset */
interface LinkedMomentContext {
  id: string;
  title: string;
  requested_amount?: number;
  currency?: string;
}

interface ChatInputBarProps {
  conversationId: string;
  currentUserId: string;
  messageText: string;
  onTextChange: (text: string) => void;
  onSend: () => void;
  onAttachPress: () => void;
  /** Open gift flow with preset amount from moment */
  onGiftPress?: (momentContext: LinkedMomentContext) => void;
  /** Linked moment for gift flow preset */
  linkedMoment?: LinkedMomentContext;
  isTyping: boolean;
  isSending?: boolean;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  conversationId,
  currentUserId,
  messageText,
  onTextChange,
  onSend,
  onAttachPress,
  onGiftPress,
  linkedMoment,
  isTyping,
  isSending = false,
}) => {
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetworkStatus();
  const _typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingBroadcastRef = useRef<number>(0);

  /**
   * Broadcast typing status via Supabase channel
   * Throttled to max once per 2 seconds
   */
  const broadcastTyping = useCallback(async () => {
    if (!conversationId || !currentUserId) return;

    const now = Date.now();
    if (now - lastTypingBroadcastRef.current < 2000) return;

    lastTypingBroadcastRef.current = now;

    try {
      const channel = supabase.channel(`chat:${conversationId}`);
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: currentUserId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.warn('Failed to broadcast typing status', { error });
    }
  }, [conversationId, currentUserId]);

  /**
   * Handle text change with typing broadcast
   */
  const handleTextChange = (text: string) => {
    onTextChange(text);

    if (text.length > 0 && isConnected) {
      broadcastTyping();
    }
  };

  /**
   * Handle gift button press - preset moment's requested amount
   */
  const handleGiftPress = () => {
    if (!linkedMoment) {
      logger.warn('No linked moment for gift flow');
      return;
    }

    HapticManager.giftSent();
    logger.debug('Gift button pressed', {
      momentId: linkedMoment.id,
      requestedAmount: linkedMoment.requested_amount,
    });

    onGiftPress?.(linkedMoment);
  };

  const InputContent = () => (
    <View style={[styles.inputWrapper, { paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.inputInner}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={() => {
            HapticManager.buttonPress();
            logger.debug('Attach button pressed - opening attachment sheet');
            onAttachPress();
          }}
          disabled={!isConnected}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Attach file"
          accessibilityRole="button"
        >
          <Ionicons
            name="add"
            size={24}
            color={isConnected ? COLORS.text.secondary : COLORS.text.muted}
          />
        </TouchableOpacity>

        {/* Gift Button - Preset from linked moment */}
        {linkedMoment && onGiftPress && (
          <TouchableOpacity
            style={styles.giftButton}
            onPress={handleGiftPress}
            disabled={!isConnected}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={`Send gift of ${linkedMoment.requested_amount} ${linkedMoment.currency || 'TRY'}`}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="gift-outline"
              size={22}
              color={
                isConnected
                  ? COLORS.brand?.accent || COLORS.primary
                  : COLORS.text.muted
              }
            />
          </TouchableOpacity>
        )}

        <TextInput
          style={styles.input}
          placeholder={
            isConnected ? 'Bir mesaj yaz...' : 'Çevrimdışı - Gönderilemiyor'
          }
          placeholderTextColor={COLORS.text.muted}
          value={messageText}
          onChangeText={handleTextChange}
          multiline
          maxLength={1000}
          returnKeyType="default"
          blurOnSubmit={false}
          editable={isConnected}
          accessibilityLabel="Message input"
          accessibilityHint="Type your message here"
        />

        {isTyping && isConnected && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>yazıyor...</Text>
          </View>
        )}

        <TouchableOpacity
          testID="send-message-button"
          style={[
            styles.sendButton,
            messageText.trim().length > 0 && styles.sendButtonActive,
            (!isConnected || isSending) && styles.sendButtonDisabled,
          ]}
          onPress={() => {
            HapticManager.messageSent();
            onSend();
          }}
          disabled={
            !isConnected || isSending || messageText.trim().length === 0
          }
          accessibilityLabel={isSending ? 'Sending message' : 'Send message'}
          accessibilityRole="button"
        >
          <Ionicons
            name="paper-plane"
            size={20}
            color={
              messageText.trim().length > 0
                ? COLORS.text.inverse
                : COLORS.text.muted
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Use BlurView on iOS for glass effect
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={60} tint="light" style={styles.container}>
        <InputContent />
      </BlurView>
    );
  }

  return (
    <View style={[styles.container, styles.containerAndroid]}>
      <InputContent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  containerAndroid: {
    backgroundColor: COLORS.bg.primary,
  },
  inputWrapper: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.base,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    minHeight: 48,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    marginRight: 4,
  },
  input: {
    flex: 1,
    color: COLORS.text.primary,
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.body,
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxHeight: 100,
  },
  typingContainer: {
    paddingRight: 8,
  },
  typingText: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.primary,
    fontFamily: FONTS.body.regular,
    fontStyle: 'italic',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
    // Neon glow effect
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.surface.muted,
    opacity: 0.5,
    shadowOpacity: 0,
  },
});
