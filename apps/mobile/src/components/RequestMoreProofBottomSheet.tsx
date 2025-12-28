import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { COLORS } from '../constants/colors';

interface RequestMoreProofBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSend: (reason: string, note: string) => void;
}

const PROOF_ISSUES = [
  'The photo or video is blurry or unclear.',
  'The proof is missing a key element.',
  'The location shown seems incorrect.',
];

export default function RequestMoreProofBottomSheet({
  visible,
  onClose,
  onSend,
}: RequestMoreProofBottomSheetProps) {
  const [selectedReason, setSelectedReason] = useState(0);
  const [otherReason, setOtherReason] = useState('');
  const [note, setNote] = useState('');
  const [isOther, setIsOther] = useState(false);

  const handleSend = () => {
    const reason = isOther ? otherReason : PROOF_ISSUES[selectedReason];
    onSend(reason, note);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.bottomSheet}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Request More Proof</Text>
              <Text style={styles.subtitle}>
                Let the traveler know what&apos;s missing so they can update
                their proof and receive their gift.
              </Text>
            </View>

            {/* Section Header */}
            <Text style={styles.sectionTitle}>What&apos;s the issue?</Text>

            {/* Radio Options */}
            <View style={styles.optionsContainer}>
              {PROOF_ISSUES.map((issue, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.radioOption,
                    selectedReason === index &&
                      !isOther &&
                      styles.radioOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedReason(index);
                    setIsOther(false);
                  }}
                >
                  <View
                    style={[
                      styles.radio,
                      selectedReason === index &&
                        !isOther &&
                        styles.radioSelected,
                    ]}
                  >
                    {selectedReason === index && !isOther && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.radioText}>{issue}</Text>
                </TouchableOpacity>
              ))}

              {/* Other Option */}
              <TouchableOpacity
                style={[
                  styles.radioOption,
                  isOther && styles.radioOptionSelected,
                ]}
                onPress={() => setIsOther(true)}
              >
                <View style={[styles.radio, isOther && styles.radioSelected]}>
                  {isOther && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Other (please specify)</Text>
              </TouchableOpacity>

              {isOther && (
                <TextInput
                  style={styles.otherInput}
                  placeholder="Specify the issue..."
                  placeholderTextColor={COLORS.text.secondary}
                  value={otherReason}
                  onChangeText={setOtherReason}
                  multiline
                  numberOfLines={3}
                />
              )}
            </View>

            {/* Optional Note */}
            <Text style={styles.sectionTitle}>
              Add a friendly note (optional)
            </Text>
            <TextInput
              style={styles.noteInput}
              placeholder="e.g., 'Hey! Could you take a clearer picture in front of the sign?'"
              placeholderTextColor={COLORS.text.secondary}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
            />

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Text style={styles.sendButtonText}>Send Request</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay.heavy,
  },
  bottomSheet: {
    backgroundColor: COLORS.utility.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border.default,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text.secondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    gap: 16,
  },
  radioOptionSelected: {
    borderColor: COLORS.brand.primary,
    backgroundColor: COLORS.mintTransparentLight,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioSelected: {
    borderColor: COLORS.brand.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.brand.primary,
  },
  radioText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  otherInput: {
    backgroundColor: COLORS.bg.primary,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.text.primary,
    marginLeft: 36,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  noteInput: {
    backgroundColor: COLORS.bg.primary,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.text.primary,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  buttonsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  sendButton: {
    backgroundColor: COLORS.brand.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.utility.white,
  },
  cancelButton: {
    backgroundColor: COLORS.utility.transparent,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.secondary,
  },
  bottomSpacer: {
    height: 20,
  },
});
