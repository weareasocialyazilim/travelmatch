import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  type ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface ReportOption<T extends string = string> {
  id: T;
  label: string;
}

export interface ReportSummaryCardProps {
  /** Card content - can be user info, moment info, etc. */
  children: React.ReactNode;
  /** Optional custom styles */
  style?: ViewStyle;
}

export interface BaseReportScreenProps<T extends string = string> {
  /** Screen title displayed in header */
  title: string;
  /** Section title above options */
  sectionTitle: string;
  /** Available report options */
  options: ReportOption<T>[];
  /** Called when report is submitted */
  onSubmit: (reason: T, details: string) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Submit button text */
  submitButtonText?: string;
  /** Details field label */
  detailsLabel?: string;
  /** Details field placeholder */
  detailsPlaceholder?: string;
  /** Summary card content (user card, moment card, etc.) */
  summaryCard?: React.ReactNode;
  /** Radio button position - 'left' or 'right' */
  radioPosition?: 'left' | 'right';
  /** Test IDs for testing */
  testID?: string;
}

/**
 * BaseReportScreen - Reusable component for report screens
 *
 * Used by:
 * - ReportUserScreen
 * - ReportMomentScreen
 *
 * @example
 * ```tsx
 * <BaseReportScreen
 *   title="Report User"
 *   sectionTitle="What's the issue?"
 *   options={REPORT_OPTIONS}
 *   onSubmit={handleSubmit}
 *   onCancel={navigation.goBack}
 *   summaryCard={<UserCard user={user} />}
 * />
 * ```
 */
export function BaseReportScreen<T extends string = string>({
  title,
  sectionTitle,
  options,
  onSubmit,
  onCancel,
  submitButtonText = 'Send report',
  detailsLabel = 'Add details (optional)',
  detailsPlaceholder = 'Please provide more information...',
  summaryCard,
  radioPosition = 'right',
  testID,
}: BaseReportScreenProps<T>): React.JSX.Element {
  const [selectedReason, setSelectedReason] = useState<T | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState('');

  const handleSubmit = useCallback(() => {
    if (!selectedReason) return;
    onSubmit(selectedReason, additionalDetails);
  }, [selectedReason, additionalDetails, onSubmit]);

  const renderRadio = (isSelected: boolean) => (
    <View style={[styles.radio, isSelected && styles.radioSelected]}>
      {isSelected && <View style={styles.radioDot} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onCancel}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          testID={`${testID}-back-button`}
        >
          <MaterialCommunityIcons
            name={'arrow-left' as IconName}
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID={`${testID}-scroll-view`}
      >
        {/* Summary Card */}
        {summaryCard}

        {/* Section Title */}
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>

        {/* Report Options */}
        <View style={styles.optionsList}>
          {options.map((option) => {
            const isSelected = selectedReason === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionItem,
                  isSelected && styles.optionItemSelected,
                ]}
                onPress={() => setSelectedReason(option.id)}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                testID={`${testID}-option-${option.id}`}
              >
                {radioPosition === 'left' && renderRadio(isSelected)}
                <Text style={styles.optionLabel}>{option.label}</Text>
                {radioPosition === 'right' && renderRadio(isSelected)}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Additional Details */}
        <View style={styles.textFieldContainer}>
          <Text style={styles.textFieldLabel}>{detailsLabel}</Text>
          <TextInput
            style={styles.textArea}
            placeholder={detailsPlaceholder}
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={additionalDetails}
            onChangeText={setAdditionalDetails}
            testID={`${testID}-details-input`}
          />
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.7}
          accessibilityLabel="Cancel"
          accessibilityRole="button"
          testID={`${testID}-cancel-button`}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !selectedReason && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedReason}
          activeOpacity={0.7}
          accessibilityLabel={submitButtonText}
          accessibilityRole="button"
          accessibilityState={{ disabled: !selectedReason }}
          testID={`${testID}-submit-button`}
        >
          <Text style={styles.submitButtonText}>{submitButtonText}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/**
 * Reusable summary card wrapper for report screens
 */
export function ReportSummaryCard({
  children,
  style,
}: ReportSummaryCardProps): React.JSX.Element {
  return <View style={[styles.summaryCard, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  optionsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  optionItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: `${COLORS.border}CC`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  textFieldContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  textFieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 144,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: `${COLORS.background}F5`,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  submitButton: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default BaseReportScreen;
