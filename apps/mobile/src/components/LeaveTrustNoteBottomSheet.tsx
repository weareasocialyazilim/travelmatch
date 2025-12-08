import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../constants/colors';

interface LeaveTrustNoteBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
  recipientName?: string;
  momentTitle?: string;
}

const MAX_CHARACTERS = 280;

export const LeaveTrustNoteBottomSheet: React.FC<
  LeaveTrustNoteBottomSheetProps
> = ({
  visible,
  onClose,
  onSubmit,
  recipientName = 'Lina',
  momentTitle = 'Galata coffee',
}) => {
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (note.trim().length > 0) {
      onSubmit(note.trim());
      setNote('');
      onClose();
    }
  };

  const characterCount = note.length;
  const isValid = note.trim().length > 0 && characterCount <= MAX_CHARACTERS;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.bottomSheet}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <Text style={styles.headline}>Leave a Trust Note</Text>
          <Text style={styles.subtitle}>
            For {recipientName} after {momentTitle}
          </Text>

          {/* Text Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Share what you loved about this moment..."
              placeholderTextColor={COLORS.textSecondary}
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={MAX_CHARACTERS}
              textAlignVertical="top"
            />
          </View>

          {/* Character Count */}
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>
              {characterCount}/{MAX_CHARACTERS}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                !isValid && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isValid}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Submit Note</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay50,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 32,
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
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 24,
    paddingTop: 16,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 16,
  },
  inputContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  textArea: {
    minHeight: 144,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  metaContainer: {
    paddingHorizontal: 24,
    alignItems: 'flex-end',
    paddingTop: 4,
    paddingBottom: 12,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  cancelButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.transparent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});
