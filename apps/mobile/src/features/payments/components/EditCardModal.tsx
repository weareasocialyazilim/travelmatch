/**
 * EditCardModal Component
 * Modal for editing card expiry date
 */
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { logger } from '@/utils/logger';
import type { SavedCard } from '../types/payment-methods.types';

interface EditCardModalProps {
  visible: boolean;
  card: SavedCard | null;
  onClose: () => void;
  onSave: (cardId: string, expiry: string) => void;
}

export const EditCardModal = ({
  visible,
  card,
  onClose,
  onSave,
}: EditCardModalProps) => {
  const [expiry, setExpiry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setExpiry('');
      setError(null);
    }
  }, [visible]);

  const formatExpiry = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/\D/g, '');

    // Format as MM/YY
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleExpiryChange = (text: string) => {
    setError(null);
    const formatted = formatExpiry(text);
    setExpiry(formatted);
  };

  const validateExpiry = (value: string): boolean => {
    const match = value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;

    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10) + 2000;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (month < 1 || month > 12) return false;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!card) return;

    if (!validateExpiry(expiry)) {
      setError('Geçerli bir son kullanma tarihi girin (AA/YY)');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(card.id, expiry);
      onClose();
    } catch (saveCardError) {
      logger.error('[EditCardModal] Failed to update card', {
        error: saveCardError,
        cardId: card.id,
      });
      setError('Kart güncellenemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!card) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.container}>
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Kartı Güncelle</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={COLORS.text.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Card Info */}
          <View style={styles.cardInfo}>
            <MaterialCommunityIcons
              name={
                card.brand.toLowerCase() === 'visa'
                  ? 'credit-card'
                  : 'credit-card-outline'
              }
              size={32}
              color={COLORS.brand.primary}
            />
            <View style={styles.cardDetails}>
              <Text style={styles.cardBrand}>{card.brand}</Text>
              <Text style={styles.cardNumber}>
                •••• •••• •••• {card.lastFour}
              </Text>
            </View>
          </View>

          {/* Expiry Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Yeni Son Kullanma Tarihi</Text>
            <View style={[styles.inputContainer, error && styles.inputError]}>
              <MaterialCommunityIcons
                name="calendar-month"
                size={20}
                color={COLORS.text.secondary}
              />
              <TextInput
                style={styles.input}
                value={expiry}
                onChangeText={handleExpiryChange}
                placeholder="AA/YY"
                placeholderTextColor={COLORS.text.secondary}
                keyboardType="number-pad"
                maxLength={5}
                autoFocus
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          {/* Info Notice */}
          <View style={styles.infoNotice}>
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color={COLORS.brand.primary}
            />
            <Text style={styles.infoText}>
              Güvenlik nedeniyle kart numarasını değiştiremezsiniz. Farklı bir
              kartınız varsa yeni kart ekleyin.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!expiry || isLoading) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!expiry || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.utility.white} />
              ) : (
                <Text style={styles.saveButtonText}>Kartı Güncelle</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: COLORS.utility.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.softGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 16,
  },
  cardDetails: {
    flex: 1,
  },
  cardBrand: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  cardNumber: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: COLORS.feedback.error,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.primary,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.feedback.error,
    marginTop: 8,
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.filterPillActive,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  infoText: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.brand.primary,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.bg.primary,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.softGray,
  },
  saveButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
});
