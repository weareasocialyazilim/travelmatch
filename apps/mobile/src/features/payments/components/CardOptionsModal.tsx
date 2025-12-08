import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { SavedCard } from '../types/payment-methods.types';

interface CardOptionsModalProps {
  visible: boolean;
  card: SavedCard | null;
  onClose: () => void;
  onSetDefault: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

export const CardOptionsModal = ({
  visible,
  card,
  onClose,
  onSetDefault,
  onEdit,
  onRemove,
}: CardOptionsModalProps) => {
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
        <TouchableOpacity
          style={styles.optionsContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.dragHandle} />
          <Text style={styles.optionsTitle}>
            {card.brand} •••• {card.lastFour}
          </Text>

          <ScrollView style={styles.optionsScroll}>
            {!card.isDefault && (
              <TouchableOpacity style={styles.optionItem} onPress={onSetDefault}>
                <MaterialCommunityIcons name="star-outline" size={24} color={COLORS.text} />
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Set as default</Text>
                  <Text style={styles.optionDescription}>
                    Use this card for all payments
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.optionItem} onPress={onEdit}>
              <MaterialCommunityIcons name="pencil-outline" size={24} color={COLORS.text} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Update card details</Text>
                <Text style={styles.optionDescription}>
                  Change expiry date or CVV
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItemDanger} onPress={onRemove}>
              <MaterialCommunityIcons name="delete-outline" size={24} color={COLORS.destructive} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitleDanger}>Remove card</Text>
                <Text style={styles.optionDescription}>
                  This action cannot be undone
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.destructive} />
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
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
  optionsContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.softGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  optionsTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  optionsScroll: {
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.softGray,
    gap: 12,
  },
  optionItemDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  optionTitleDanger: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.destructive,
    marginBottom: 4,
  },
  optionDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
});
