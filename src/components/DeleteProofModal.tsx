import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '../constants/colors';

interface DeleteProofModalProps {
  visible: boolean;
  onCancel: () => void;
  onDelete: () => void;
}

export const DeleteProofModal: React.FC<DeleteProofModalProps> = ({
  visible,
  onCancel,
  onDelete,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <View style={styles.backdrop} />

        {/* Modal Content */}
        <View style={styles.modalContent}>
          <View style={styles.textContainer}>
            {/* Headline */}
            <Text style={styles.headline}>Delete this proof?</Text>

            {/* Body Text */}
            <Text style={styles.bodyText}>
              You can upload a new proof afterward.
            </Text>
          </View>

          {/* Button Group */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <View style={styles.buttonDivider} />

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay60,
  },
  modalContent: {
    width: '100%',
    maxWidth: 384,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  buttonDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  deleteButton: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
