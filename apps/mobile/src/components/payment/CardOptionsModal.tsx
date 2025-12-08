/**
 * CardOptionsModal Component
 * Bottom sheet for card actions: Set as Default, Edit, Remove
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { SavedCard } from './types';

interface CardOptionsModalProps {
  visible: boolean;
  card: SavedCard | null;
  onClose: () => void;
  onSetAsDefault: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

export const CardOptionsModal: React.FC<CardOptionsModalProps> = ({
  visible,
  card,
  onClose,
  onSetAsDefault,
  onEdit,
  onRemove,
}) => {
  if (!card) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {card.brand} •••• {card.lastFour}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={COLORS.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsList}>
            {!card.isDefault && (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={onSetAsDefault}
              >
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={24}
                  color={COLORS.text}
                />
                <Text style={styles.optionText}>Set as default</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.optionItem} onPress={onEdit}>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={24}
                color={COLORS.text}
              />
              <Text style={styles.optionText}>Edit card</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, styles.destructiveOption]}
              onPress={onRemove}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={24}
                color={COLORS.error}
              />
              <Text style={[styles.optionText, styles.destructiveText]}>
                Remove card
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  destructiveOption: {
    backgroundColor: '#FEE2E2',
  },
  destructiveText: {
    color: COLORS.error,
  },
});

export default CardOptionsModal;
