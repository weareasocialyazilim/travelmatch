import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import { refundRequestSchema, type RefundRequestInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';

type IconName = React.ComponentProps<typeof Icon>['name'];

const REFUND_REASONS: { id: string; label: string; icon: IconName }[] = [
  {
    id: 'not_delivered',
    label: 'Gesture not delivered',
    icon: 'package-variant-closed-remove',
  },
  { id: 'no_proof', label: 'No proof provided', icon: 'image-off' },
  {
    id: 'different',
    label: 'Different from description',
    icon: 'alert-circle',
  },
  { id: 'quality', label: 'Quality issues', icon: 'star-off' },
  { id: 'duplicate', label: 'Duplicate payment', icon: 'content-copy' },
  { id: 'other', label: 'Other reason', icon: 'dots-horizontal' },
];

type RefundRequestScreenProps = StackScreenProps<
  RootStackParamList,
  'RefundRequest'
>;

export const RefundRequestScreen: React.FC<RefundRequestScreenProps> = ({
  navigation,
  route,
}) => {
  const { transactionId } = route.params;
  
  const { control, handleSubmit, formState, watch, setValue } = useForm<RefundRequestInput>({
    resolver: zodResolver(refundRequestSchema),
    mode: 'onChange',
    defaultValues: {
      reason: '',
      description: '',
      amount: 0,
    },
  });

  const reason = watch('reason');
  const description = watch('description');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: RefundRequestInput) => {
    setIsSubmitting(true);

    // Mock API call - gerçek uygulamada backend'e gönderilecek
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Request Submitted',
        'Your refund request has been submitted successfully. We will review it within 2-3 business days.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    }, 1500);
  };

  const isSubmitDisabled = !canSubmitForm({ formState } as any, {
    requireDirty: false,
    requireValid: true,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Refund</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="information" size={24} color={COLORS.coral} />
          <Text style={styles.infoText}>
            Please provide detailed information about your refund request. Our
            team will review it within 2-3 business days.
          </Text>
        </View>

        {/* Transaction Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          <View style={styles.transactionCard}>
            <View style={styles.transactionRow}>
              <Text style={styles.transactionLabel}>Transaction ID</Text>
              <Text style={styles.transactionValue}>{transactionId}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.transactionRow}>
              <Text style={styles.transactionLabel}>Amount</Text>
              <Text style={styles.transactionValue}>$25.00</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.transactionRow}>
              <Text style={styles.transactionLabel}>Date</Text>
              <Text style={styles.transactionValue}>Jan 15, 2024</Text>
            </View>
          </View>
        </View>

        {/* Reason Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason for Refund</Text>
          <Controller
            control={control}
            name="reason"
            render={({ field: { value }, fieldState: { error } }) => (
              <>
                <View style={styles.reasonsList}>
                  {REFUND_REASONS.map((reasonOption) => (
                    <TouchableOpacity
                      key={reasonOption.id}
                      style={[
                        styles.reasonCard,
                        value === reasonOption.id && styles.reasonCardSelected,
                      ]}
                      onPress={() => setValue('reason', reasonOption.id)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={reasonOption.icon}
                        size={24}
                        color={
                          value === reasonOption.id
                            ? COLORS.mint
                            : COLORS.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.reasonLabel,
                          value === reasonOption.id && styles.reasonLabelSelected,
                        ]}
                      >
                        {reasonOption.label}
                      </Text>
                      {value === reasonOption.id && (
                        <Icon name="check-circle" size={20} color={COLORS.mint} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />
        </View>

        {/* Details Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          <Text style={styles.sectionSubtitle}>
            Please explain your situation in detail (minimum 20 characters)
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <>
                <View style={styles.textAreaContainer}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Describe your issue here..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    maxLength={500}
                  />
                  <Text style={styles.charCount}>{value.length}/500</Text>
                </View>
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />
        </View>

        {/* Policy Link */}
        <TouchableOpacity
          style={styles.policyLink}
          onPress={() => navigation.navigate('RefundPolicy')}
        >
          <Icon name="file-document-outline" size={20} color={COLORS.coral} />
          <Text style={styles.policyLinkText}>View Refund Policy</Text>
          <Icon name="chevron-right" size={20} color={COLORS.coral} />
        </TouchableOpacity>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Icon name="alert" size={20} color={COLORS.warning} />
          <Text style={styles.warningText}>
            Fraudulent refund requests may result in account suspension. Please
            ensure your request is legitimate.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || isSubmitDisabled) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || isSubmitDisabled}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <Text style={styles.submitButtonText}>Submitting...</Text>
          ) : (
            <>
              <Icon name="send" size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>Submit Refund Request</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  bottomAction: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.lightGray,
    borderTopWidth: 1,
    padding: 16,
    paddingBottom: 32,
  },
  charCount: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.caption,
    marginTop: 8,
    textAlign: 'right',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  divider: {
    backgroundColor: COLORS.lightGray,
    height: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.lightGray,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    color: COLORS.text,
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: COLORS.warningLight,
    borderColor: COLORS.warningDark,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    margin: 16,
    padding: 16,
  },
  infoText: {
    color: COLORS.text,
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    lineHeight: 20,
  },
  policyLink: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  policyLinkText: {
    color: COLORS.coral,
    flex: 1,
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  reasonCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  reasonCardSelected: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.mint,
  },
  reasonLabel: {
    color: COLORS.text,
    flex: 1,
    ...TYPOGRAPHY.body,
    fontWeight: '500',
  },
  reasonLabelSelected: {
    color: COLORS.mint,
    fontWeight: '700',
  },
  reasonsList: {
    gap: 12,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.bodySmall,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: COLORS.coral,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    borderWidth: 1,
    color: COLORS.text,
    ...TYPOGRAPHY.body,
    minHeight: 120,
    padding: 16,
  },
  textAreaContainer: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  transactionCard: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    padding: 16,
  },
  transactionLabel: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
  },
  transactionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  transactionValue: {
    color: COLORS.text,
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  warningCard: {
    backgroundColor: COLORS.warningLight,
    borderColor: COLORS.warningDark,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    marginHorizontal: 16,
    padding: 16,
  },
  warningText: {
    color: COLORS.text,
    flex: 1,
    ...TYPOGRAPHY.caption,
    lineHeight: 19,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.coral,
    marginTop: 8,
  },
});

// Wrap with ScreenErrorBoundary for critical refund functionality
const RefundRequestScreenWithErrorBoundary = (props: RefundRequestScreenProps) => (
  <ScreenErrorBoundary>
    <RefundRequestScreen {...props} />
  </ScreenErrorBoundary>
);

export default RefundRequestScreenWithErrorBoundary;
