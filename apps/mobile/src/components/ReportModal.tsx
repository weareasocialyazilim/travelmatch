/**
 * ReportModal Component
 * Modal for reporting users, moments, messages, or reviews
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

// Color aliases for easier use
const colors = {
  primary: { main: COLORS.brand.primary, light: COLORS.brand.primaryLight },
  text: { primary: COLORS.text.primary, secondary: COLORS.text.secondary },
  background: {
    primary: COLORS.bg.primary,
    secondary: COLORS.bg.secondary,
  },
  border: { light: COLORS.border.default, medium: COLORS.border.default },
  status: { error: COLORS.danger },
};
import { useToast } from '../context/ToastContext';
import {
  moderationService,
  REPORT_REASONS,
} from '../services/moderationService';
import type { ReportReason, ReportTarget } from '../services/moderationService';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetType: ReportTarget;
  targetId: string;
  targetName?: string; // For display purposes
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  targetType,
  targetId,
  targetName,
}) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null,
  );
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const getTitle = () => {
    switch (targetType) {
      case 'user':
        return `Report ${targetName || 'User'}`;
      case 'moment':
        return 'Report Moment';
      case 'message':
        return 'Report Message';
      case 'review':
        return 'Report Review';
      default:
        return 'Report';
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      showToast('Lütfen bir sebep seçin', 'error');
      return;
    }

    try {
      setLoading(true);

      await moderationService.createReport({
        targetType,
        targetId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      showToast('Şikayetiniz başarıyla gönderildi', 'success');
      handleClose();
    } catch {
      showToast('Şikayetiniz gönderilemedi. Lütfen tekrar deneyin', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDescription('');
    onClose();
  };

  // REPORT_REASONS is an array of { label, value }
  const reasons = REPORT_REASONS;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{getTitle()}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Why are you reporting this {targetType}?
          </Text>

          {/* Reason Selection */}
          <View style={styles.reasonsContainer}>
            {reasons.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.reasonItem,
                  selectedReason === value && styles.reasonItemSelected,
                ]}
                onPress={() => setSelectedReason(value)}
                activeOpacity={0.7}
              >
                <View style={styles.reasonContent}>
                  <View style={styles.reasonHeader}>
                    <View
                      style={[
                        styles.radio,
                        selectedReason === value && styles.radioSelected,
                      ]}
                    >
                      {selectedReason === value && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Text style={styles.reasonLabel}>{label}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Additional Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsLabel}>
              Additional details (optional)
            </Text>
            <TextInput
              style={styles.detailsInput}
              placeholder="Provide more context about your report..."
              placeholderTextColor={colors.text.secondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.text.secondary}
            />
            <Text style={styles.infoText}>
              Your report is confidential. We review all reports and take
              appropriate action.
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !selectedReason && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading || !selectedReason}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.utility.white} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Report</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  reasonsContainer: {
    gap: 12,
  },
  reasonItem: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    padding: 16,
    backgroundColor: colors.background.secondary,
  },
  reasonItemSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.light + '10',
  },
  reasonContent: {
    gap: 4,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary.main,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.main,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  detailsContainer: {
    marginTop: 24,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  detailsInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  submitButton: {
    backgroundColor: colors.status.error,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.text.secondary,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
});

export default ReportModal;
