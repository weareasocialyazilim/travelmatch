/**
 * Pending Transactions Modal
 *
 * Shows when app starts with incomplete payments or uploads.
 * Allows user to resume or dismiss pending transactions.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../theme/typography';
import type {
  PendingPayment,
  PendingUpload,
} from '../services/pendingTransactionsService';

interface PendingTransactionsModalProps {
  visible: boolean;
  payments: PendingPayment[];
  uploads: PendingUpload[];
  onResumePayment: (payment: PendingPayment) => void;
  onResumeUpload: (upload: PendingUpload) => void;
  onDismissPayment: (paymentId: string) => void;
  onDismissUpload: (uploadId: string) => void;
  onClose: () => void;
}

export const PendingTransactionsModal: React.FC<
  PendingTransactionsModalProps
> = ({
  visible,
  payments,
  uploads,
  onResumePayment,
  onResumeUpload,
  onDismissPayment,
  onDismissUpload,
  onClose,
}) => {
  const hasPayments = payments.length > 0;
  const hasUploads = uploads.length > 0;

  if (!hasPayments && !hasUploads) {
    return null;
  }

  const formatAmount = (amount: number, currency: string) => {
    return `${currency === 'USD' ? '$' : currency}${amount.toFixed(2)}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={24}
              color={COLORS.softOrange}
            />
            <Text style={styles.title}>Incomplete Actions</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={COLORS.text.secondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            We found some actions that didn't complete. Would you like to
            continue?
          </Text>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Pending Payments */}
            {hasPayments && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="credit-card-outline"
                    size={20}
                    color={COLORS.text.primary}
                  />
                  <Text style={styles.sectionTitle}>
                    Pending Payments ({payments.length})
                  </Text>
                </View>

                {payments.map((payment) => (
                  <View key={payment.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.cardTitle}>
                          {payment.type === 'gift'
                            ? 'Gift Payment'
                            : payment.type === 'withdraw'
                              ? 'Withdrawal'
                              : payment.type === 'moment_purchase'
                                ? 'Moment Purchase'
                                : 'Payment'}
                        </Text>
                        <Text style={styles.cardAmount}>
                          {formatAmount(payment.amount, payment.currency)}
                        </Text>
                      </View>
                      <Text style={styles.cardTime}>
                        {formatTime(payment.createdAt)}
                      </Text>
                    </View>

                    {payment.metadata?.note && (
                      <Text style={styles.cardNote}>
                        {payment.metadata.note}
                      </Text>
                    )}

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.dismissButton]}
                        onPress={() => onDismissPayment(payment.id)}
                      >
                        <Text style={styles.dismissButtonText}>Dismiss</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.resumeButton]}
                        onPress={() => onResumePayment(payment)}
                      >
                        <Text style={styles.resumeButtonText}>Resume</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Pending Uploads */}
            {hasUploads && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="cloud-upload-outline"
                    size={20}
                    color={COLORS.text.primary}
                  />
                  <Text style={styles.sectionTitle}>
                    Pending Uploads ({uploads.length})
                  </Text>
                </View>

                {uploads.map((upload) => (
                  <View key={upload.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.cardTitle}>
                          {upload.type === 'proof'
                            ? 'Proof Upload'
                            : upload.type === 'moment'
                              ? 'Moment Image'
                              : upload.type === 'avatar'
                                ? 'Profile Picture'
                                : upload.type === 'message'
                                  ? 'Message Attachment'
                                  : 'Upload'}
                        </Text>
                        <Text style={styles.cardSubtitle}>
                          {upload.fileName}
                        </Text>
                      </View>
                      <Text style={styles.cardTime}>
                        {formatTime(upload.createdAt)}
                      </Text>
                    </View>

                    {/* Progress bar */}
                    {upload.progress > 0 && upload.progress < 100 && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${upload.progress}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {upload.progress}%
                        </Text>
                      </View>
                    )}

                    {upload.retryCount > 0 && (
                      <Text style={styles.retryText}>
                        Failed {upload.retryCount} time
                        {upload.retryCount > 1 ? 's' : ''}
                      </Text>
                    )}

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.dismissButton]}
                        onPress={() => onDismissUpload(upload.id)}
                      >
                        <Text style={styles.dismissButtonText}>Dismiss</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.resumeButton]}
                        onPress={() => onResumeUpload(upload)}
                      >
                        <MaterialCommunityIcons
                          name="refresh"
                          size={16}
                          color={COLORS.utility.white}
                        />
                        <Text style={styles.resumeButtonText}>Retry</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.dismissAllButton} onPress={onClose}>
              <Text style={styles.dismissAllText}>I'll handle this later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay60,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.utility.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 12,
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  card: {
    backgroundColor: COLORS.bg.secondary,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  cardAmount: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.mint,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  cardTime: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  cardNote: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border.default,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.mint,
  },
  progressText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    minWidth: 40,
    textAlign: 'right',
  },
  retryText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.feedback.error,
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dismissButton: {
    backgroundColor: COLORS.utility.white,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  dismissButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  resumeButton: {
    backgroundColor: COLORS.mint,
  },
  resumeButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.utility.white,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  dismissAllButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  dismissAllText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
});
