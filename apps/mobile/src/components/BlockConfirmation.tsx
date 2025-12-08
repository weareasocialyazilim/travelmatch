/**
 * BlockConfirmation Component
 * Confirmation dialog for blocking a user
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

// Color aliases for easier use
const colors = {
  primary: { main: COLORS.primary },
  text: { primary: COLORS.text, secondary: COLORS.textSecondary },
  background: {
    primary: COLORS.background,
    secondary: COLORS.backgroundSecondary,
  },
  border: { medium: COLORS.border },
  status: {
    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.danger,
  },
};
import { useToast } from '../context/ToastContext';
import { moderationService } from '../services/moderationService';

interface BlockConfirmationProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userAvatar?: string;
  onBlocked?: () => void;
}

export const BlockConfirmation: React.FC<BlockConfirmationProps> = ({
  visible,
  onClose,
  userId,
  userName,
  userAvatar,
  onBlocked,
}) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    try {
      setLoading(true);
      await moderationService.blockUser(userId);

      showToast(`${userName} has been blocked`, 'success');
      onBlocked?.();
      onClose();
    } catch (error) {
      showToast('Failed to block user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const consequences = [
    "They won't be able to see your profile or moments",
    "They can't message you or send requests",
    'Their content will be hidden from your feed',
    'Any existing conversations will be hidden',
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { marginBottom: insets.bottom }]}>
          {/* User Info */}
          <View style={styles.userInfo}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons
                  name="person"
                  size={32}
                  color={colors.text.secondary}
                />
              </View>
            )}
            <Text style={styles.userName}>{userName}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Block {userName}?</Text>

          {/* Consequences */}
          <View style={styles.consequencesContainer}>
            <Text style={styles.consequencesTitle}>
              What happens when you block someone:
            </Text>
            {consequences.map((item, index) => (
              <View key={index} style={styles.consequenceItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.primary.main}
                />
                <Text style={styles.consequenceText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Note */}
          <View style={styles.noteContainer}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={colors.text.secondary}
            />
            <Text style={styles.noteText}>
              They won&apos;t be notified that you blocked them. You can unblock
              them later in Settings.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.blockButton}
              onPress={handleBlock}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Ionicons name="ban" size={18} color={COLORS.white} />
                  <Text style={styles.blockButtonText}>Block</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  consequencesContainer: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  consequencesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  consequenceText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
    marginBottom: 24,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  blockButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default BlockConfirmation;
