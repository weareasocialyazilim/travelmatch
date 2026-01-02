/**
 * ChatInputBar - Floating Liquid Glass Input
 *
 * Premium input bar with:
 * - BlurView glass effect for floating feel
 * - Neon send button with glow
 * - Smooth attach button interaction
 */

import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZES_V2 } from '@/constants/typography';
import { logger } from '@/utils/logger';
import { useNetworkStatus } from '../../../context/NetworkContext';

interface ChatInputBarProps {
  messageText: string;
  onTextChange: (text: string) => void;
  onSend: () => void;
  onAttachPress: () => void;
  isTyping: boolean;
  isSending?: boolean;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  messageText,
  onTextChange,
  onSend,
  onAttachPress,
  isTyping,
  isSending = false,
}) => {
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetworkStatus();

  const InputContent = () => (
    <View style={[styles.inputWrapper, { paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.inputInner}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={() => {
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

        <TextInput
          style={styles.input}
          placeholder={isConnected ? 'Bir mesaj yaz...' : 'Çevrimdışı - Gönderilemiyor'}
          placeholderTextColor={COLORS.text.muted}
          value={messageText}
          onChangeText={onTextChange}
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
          onPress={onSend}
          disabled={!isConnected || isSending || messageText.trim().length === 0}
          accessibilityLabel={isSending ? 'Sending message' : 'Send message'}
          accessibilityRole="button"
        >
          <Ionicons
            name="paper-plane"
            size={20}
            color={
              messageText.trim().length > 0 ? COLORS.text.inverse : COLORS.text.muted
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
  input: {
    flex: 1,
    color: COLORS.text.primary,
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES_V2.body,
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxHeight: 100,
  },
  typingContainer: {
    paddingRight: 8,
  },
  typingText: {
    fontSize: FONT_SIZES_V2.caption,
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
