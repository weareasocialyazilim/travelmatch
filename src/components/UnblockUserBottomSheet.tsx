import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { COLORS } from '../constants/colors';

interface UnblockUserBottomSheetProps {
  visible: boolean;
  userName: string;
  userAvatarUrl?: string;
  onUnblock: () => void;
  onCancel: () => void;
}

export const UnblockUserBottomSheet: React.FC<UnblockUserBottomSheetProps> = ({
  visible,
  userName,
  onUnblock,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={styles.bottomSheet}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatar} />
            <Text style={styles.title}>Unblock {userName}?</Text>
            <Text style={styles.description}>
              You will be able to see their travel moments, receive messages
              from them, and send them gifts again.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.unblockButton}
              onPress={onUnblock}
              activeOpacity={0.7}
            >
              <Text style={styles.unblockButtonText}>Unblock</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 24,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: `${COLORS.border}CC`,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 320,
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 12,
  },
  unblockButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    borderRadius: 8,
  },
  unblockButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.border}80`,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});
