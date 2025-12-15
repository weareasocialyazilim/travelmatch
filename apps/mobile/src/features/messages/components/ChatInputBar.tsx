import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
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
  const { isConnected } = useNetworkStatus();
  
  return (
    <View style={styles.inputBar}>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper} pointerEvents="box-none">
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
            accessibilityHint="Opens attachment options"
          >
            <MaterialCommunityIcons
              name="plus-circle"
              size={24}
              color={isConnected ? COLORS.textSecondary : COLORS.softGray}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder={
              isConnected 
                ? "Thank them or ask a question..." 
                : "Offline - Cannot send"
            }
            placeholderTextColor={COLORS.textSecondary}
            value={messageText}
            onChangeText={onTextChange}
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={onSend}
            blurOnSubmit={false}
            editable={isConnected}
            contextMenuHidden={false}
            accessibilityLabel="Message input"
            accessibilityHint="Type your message here"
          />
          {isTyping && isConnected && (
            <Text style={styles.typingIndicator}>typing...</Text>
          )}
        </View>
        <TouchableOpacity
          testID="send-message-button"
          style={[
            styles.sendButton,
            (!isConnected || isSending) && styles.sendButtonDisabled,
          ]}
          onPress={onSend}
          disabled={!isConnected || isSending}
          accessibilityLabel={isSending ? "Sending message" : "Send message"}
          accessibilityRole="button"
        >
          {isSending ? (
            <MaterialCommunityIcons
              name="loading"
              size={24}
              color={COLORS.white}
            />
          ) : (
            <MaterialCommunityIcons
              name="send"
              size={24}
              color={COLORS.white}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 14,
    color: COLORS.text,
    paddingRight: 16,
  },
  typingIndicator: {
    position: 'absolute',
    right: 16,
    fontSize: 12,
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
  sendButtonDisabled: {
    backgroundColor: COLORS.softGray,
    opacity: 0.5,
  },
});
