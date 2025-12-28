/**
 * CardOptionsModal Component
 * Modal for card management options
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export interface CardOptionsModalProps {
  visible: boolean;
  cardId?: string;
  isDefault?: boolean;
  onClose: () => void;
  onSetDefault?: () => void;
  onRemove?: () => void;
}

export const CardOptionsModal: React.FC<CardOptionsModalProps> = ({
  visible,
  isDefault = false,
  onClose,
  onSetDefault,
  onRemove,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <Text style={styles.title}>Card Options</Text>

              {!isDefault && (
                <TouchableOpacity style={styles.option} onPress={onSetDefault}>
                  <MaterialCommunityIcons
                    name="star-outline"
                    size={24}
                    color={COLORS.text.primary}
                  />
                  <Text style={styles.optionText}>Set as Default</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.option, styles.dangerOption]}
                onPress={onRemove}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={24} color={COLORS.feedback.error} />
                <Text style={[styles.optionText, styles.dangerText]}>Remove Card</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: COLORS.utility.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.surface.base,
    marginBottom: 8,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  dangerOption: {
    backgroundColor: COLORS.feedback.error + '10',
  },
  dangerText: {
    color: COLORS.feedback.error,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
});

export default CardOptionsModal;
