import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { reportSchema, type ReportInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface ReportOption<T extends string = string> {
  id: T;
  label: string;
  description?: string;
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
  testID = 'base-report-screen',
}: BaseReportScreenProps<T>): React.JSX.Element {
  const { control, handleSubmit, formState, setValue, watch } =
    useForm<ReportInput>({
      resolver: zodResolver(reportSchema),
      mode: 'onChange',
      defaultValues: {
        reason: '',
        details: '',
      },
    });

  const selectedReason = watch('reason') as T | '';

  const onFormSubmit = useCallback(
    (data: ReportInput) => {
      if (!data.reason) return;
      onSubmit(data.reason as T, data.details || '');
    },
    [onSubmit],
  );

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
            color={COLORS.text.primary}
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
                onPress={() => setValue('reason', option.id)}
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
        <Controller
          control={control}
          name="details"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <View style={styles.textFieldContainer}>
              <Text style={styles.textFieldLabel}>{detailsLabel}</Text>
              <TextInput
                style={[styles.textArea, error && styles.textAreaError]}
                placeholder={detailsPlaceholder}
                placeholderTextColor={COLORS.text.secondary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                testID={`${testID}-details-input`}
              />
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </View>
          )}
        />
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
            !canSubmitForm({ formState }) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit(onFormSubmit)}
          disabled={!canSubmitForm({ formState })}
          activeOpacity={0.7}
          accessibilityLabel={submitButtonText}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmitForm({ formState }) }}
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
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
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
    color: COLORS.text.primary,
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
    backgroundColor: COLORS.utility.white,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
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
    borderColor: COLORS.border.default,
    borderRadius: 12,
    backgroundColor: COLORS.utility.white,
  },
  optionItemSelected: {
    borderColor: COLORS.brand.primary,
    backgroundColor: `${COLORS.brand.primary}10`,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: `${COLORS.border.default}CC`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.brand.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.brand.primary,
  },
  textFieldContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  textFieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: COLORS.utility.white,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: COLORS.text.primary,
    minHeight: 144,
  },
  textAreaError: {
    borderColor: COLORS.feedback.error,
  },
  errorText: {
    color: COLORS.feedback.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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
    backgroundColor: `${COLORS.bg.primary}F5`,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
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
    color: COLORS.brand.primary,
  },
  submitButton: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand.primary,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.border.default,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
});

export default BaseReportScreen;
