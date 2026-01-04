import React, { useState, memo } from 'react';
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

interface AddBankAccountBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (iban: string, accountHolder: string) => void;
}

export const AddBankAccountBottomSheet: React.FC<AddBankAccountBottomSheetProps> =
  memo(({ visible, onClose, onSave }) => {
    const [iban, setIban] = useState('');
    const [accountHolder, setAccountHolder] = useState('');

    const handleSave = () => {
      if (iban.trim() && accountHolder.trim()) {
        onSave(iban, accountHolder);
        setIban('');
        setAccountHolder('');
        onClose();
      }
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
        testID="add-bank-account-modal"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableWithoutFeedback
            onPress={onClose}
            testID="bank-account-backdrop"
          >
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.bottomSheet}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Headline */}
            <Text style={styles.headline}>Add bank account</Text>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* IBAN Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>IBAN</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DE89 3704 0044 0532 0130 00"
                  placeholderTextColor={COLORS.text.secondary}
                  value={iban}
                  onChangeText={setIban}
                  autoCapitalize="characters"
                  testID="iban-input"
                />
              </View>

              {/* Account Holder Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Account holder</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Jane Doe"
                  placeholderTextColor={COLORS.text.secondary}
                  value={accountHolder}
                  onChangeText={setAccountHolder}
                  autoCapitalize="words"
                  testID="account-holder-input"
                />
              </View>
            </View>

            {/* Security Info */}
            <View style={styles.securityInfo}>
              <MaterialCommunityIcons
                name={'lock' as IconName}
                size={16}
                color={COLORS.text.secondary}
              />
              <Text style={styles.securityText}>
                Your information is securely encrypted.
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!iban.trim() || !accountHolder.trim()) &&
                  styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!iban.trim() || !accountHolder.trim()}
              activeOpacity={0.8}
              testID="save-bank-account-button"
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  });

AddBankAccountBottomSheet.displayName = 'AddBankAccountBottomSheet';

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay40,
  },
  bottomSheet: {
    backgroundColor: COLORS.bg.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
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
    backgroundColor: COLORS.border.default,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text.primary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 24,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  input: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.bg.primary,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  securityText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.border.default,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.utility.white,
  },
});
