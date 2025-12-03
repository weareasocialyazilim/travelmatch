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
                  placeholderTextColor={COLORS.textSecondary}
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
              placeholderTextColor={COLORS.textSecondary}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.border,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
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
    borderColor: COLORS.border,
    gap: 16,
  },
  radioOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.mintTransparentLight,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 20,
  },
  otherInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 36,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  noteInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  buttonsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  cancelButton: {
    backgroundColor: COLORS.transparent,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  bottomSpacer: {
    height: 20,
  },
});
