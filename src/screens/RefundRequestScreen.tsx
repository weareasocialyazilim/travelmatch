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
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';

const REFUND_REASONS = [
  { id: 'not_delivered', label: 'Gesture not delivered', icon: 'package-variant-closed-remove' },
  { id: 'no_proof', label: 'No proof provided', icon: 'image-off' },
  { id: 'different', label: 'Different from description', icon: 'alert-circle' },
  { id: 'quality', label: 'Quality issues', icon: 'star-off' },
  { id: 'duplicate', label: 'Duplicate payment', icon: 'content-copy' },
  { id: 'other', label: 'Other reason', icon: 'dots-horizontal' },
];

export const RefundRequestScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { transactionId } = route.params;
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Select Reason', 'Please select a reason for your refund request');
      return;
    }

    if (!details.trim()) {
      Alert.alert('Add Details', 'Please provide details about your refund request');
      return;
    }

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
        ]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Refund</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="information" size={24} color={COLORS.coral} />
          <Text style={styles.infoText}>
            Please provide detailed information about your refund request. Our team will review it
            within 2-3 business days.
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
          <View style={styles.reasonsList}>
            {REFUND_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonCard,
                  selectedReason === reason.id && styles.reasonCardSelected,
                ]}
                onPress={() => setSelectedReason(reason.id)}
                activeOpacity={0.7}
              >
                <Icon
                  name={reason.icon}
                  size={24}
                  color={selectedReason === reason.id ? COLORS.mint : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.reasonLabel,
                    selectedReason === reason.id && styles.reasonLabelSelected,
                  ]}
                >
                  {reason.label}
                </Text>
                {selectedReason === reason.id && (
                  <Icon name="check-circle" size={20} color={COLORS.mint} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Details Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          <Text style={styles.sectionSubtitle}>
            Please explain your situation in detail (minimum 20 characters)
          </Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Describe your issue here..."
              placeholderTextColor={COLORS.textSecondary}
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{details.length}/500</Text>
          </View>
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
          <Icon name="alert" size={20} color="#FF9500" />
          <Text style={styles.warningText}>
            Fraudulent refund requests may result in account suspension. Please ensure your request
            is legitimate.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
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
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    margin: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  transactionCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  transactionLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  transactionValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  reasonsList: {
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  reasonCardSelected: {
    borderColor: COLORS.mint,
    backgroundColor: '#E6F9F0',
  },
  reasonLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  reasonLabelSelected: {
    fontWeight: '700',
    color: COLORS.mint,
  },
  textAreaContainer: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  textArea: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    padding: 16,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'right',
  },
  policyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
  },
  policyLinkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.coral,
  },
  warningCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 19,
  },
  bottomAction: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.coral,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
});
