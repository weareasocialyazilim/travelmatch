import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface DeleteMomentDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  momentTitle: string;
  isDeleting?: boolean;
}

export function DeleteMomentDialog({
  visible,
  onClose,
  onConfirm,
  momentTitle,
  isDeleting = false,
}: DeleteMomentDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            disabled={isDeleting}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <MaterialCommunityIcons
                name="alert"
                size={32}
                color={COLORS.warning}
              />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Delete Moment?</Text>

          {/* Description */}
          <View style={styles.momentTitleContainer}>
            <Text style={styles.momentTitle} numberOfLines={2}>
              "{momentTitle}"
            </Text>
          </View>

          <Text style={styles.description}>
            This moment will be deleted but can be{' '}
            <Text style={styles.highlight}>restored within 90 days</Text>. After
            90 days, it will be permanently removed.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isDeleting}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isDeleting}
              style={[styles.deleteButton, isDeleting && styles.disabledButton]}
            >
              {isDeleting ? (
                <>
                  <ActivityIndicator size="small" color={COLORS.white} />
                  <Text style={styles.deleteButtonText}>Deleting...</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={18}
                    color={COLORS.white}
                  />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  momentTitleContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  momentTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: COLORS.textPrimary,
  },
  description: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  highlight: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    fontWeight: '600',
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default DeleteMomentDialog;
