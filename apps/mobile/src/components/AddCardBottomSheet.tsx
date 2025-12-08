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

interface AddCardBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddCard: (cardNumber: string, expiry: string, cvv: string) => void;
}

export const AddCardBottomSheet: React.FC<AddCardBottomSheetProps> = ({
  visible,
  onClose,
  onAddCard,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleAddCard = () => {
    if (cardNumber.trim() && expiry.trim() && cvv.trim()) {
      onAddCard(cardNumber, expiry, cvv);
      setCardNumber('');
      setExpiry('');
      setCvv('');
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
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>Add card</Text>
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
          </View>

          {/* Card Number Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Card number</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name={'credit-card' as IconName}
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={COLORS.textSecondary}
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>
          </View>

          {/* Expiry and CVV Fields */}
          <View style={styles.rowFields}>
            <View style={[styles.fieldContainer, styles.flexField]}>
              <Text style={styles.label}>Expiry</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor={COLORS.textSecondary}
                value={expiry}
                onChangeText={setExpiry}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>

            <View style={[styles.fieldContainer, styles.flexField]}>
              <View style={styles.labelWithIcon}>
                <Text style={styles.label}>CVV</Text>
                <MaterialCommunityIcons
                  name={'help-circle-outline' as IconName}
                  size={16}
                  color={COLORS.textSecondary}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="123"
                placeholderTextColor={COLORS.textSecondary}
                value={cvv}
                onChangeText={setCvv}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>

          {/* Security Info */}
          <View style={styles.securityInfo}>
            <View style={styles.securityIconContainer}>
              <MaterialCommunityIcons
                name={'lock' as IconName}
                size={20}
                color={COLORS.text}
              />
            </View>
            <Text style={styles.securityText}>
              Your payment information is secure.
            </Text>
          </View>

          {/* Add Card Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.addButton,
                (!cardNumber.trim() || !expiry.trim() || !cvv.trim()) &&
                  styles.addButtonDisabled,
              ]}
              onPress={handleAddCard}
              disabled={!cardNumber.trim() || !expiry.trim() || !cvv.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>Add card</Text>
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
    backgroundColor: COLORS.overlay30,
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
    paddingBottom: 8,
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
    paddingVertical: 16,
  },
  headerSpacer: {
    width: 48,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  fieldContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flexField: {
    flex: 1,
    paddingHorizontal: 0,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  securityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  addButton: {
    height: 56,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.background,
  },
});
