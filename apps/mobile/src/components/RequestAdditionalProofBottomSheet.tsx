import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface RequestAdditionalProofBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSendRequest: (message: string) => void;
}

export const RequestAdditionalProofBottomSheet: React.FC<
  RequestAdditionalProofBottomSheetProps
> = ({ visible, onClose, onSendRequest }) => {
  const [message, setMessage] = useState('');
  const maxChars = 500;

  const handleSend = () => {
    if (message.trim()) {
      onSendRequest(message);
      setMessage('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.bottomSheet}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={'close' as IconName}
                size={24}
                color={COLORS.text}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Request additional proof</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Message</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Tell them what you need to confirm the moment. e.g., 'Could you please upload a photo of the ticket stub?'"
                  placeholderTextColor={COLORS.textSecondary}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  maxLength={maxChars}
                  textAlignVertical="top"
                />
                <Text style={styles.charCounter}>
                  {message.length}/{maxChars}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.sendButton,
                !message.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!message.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.sendButtonText}>Send request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay40,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    paddingRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  textAreaContainer: {
    position: 'relative',
  },
  textArea: {
    height: 156,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    fontSize: 16,
    color: COLORS.text,
  },
  charCounter: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sendButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: `${COLORS.primary}66`,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
