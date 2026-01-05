/**
 * Pending Transactions Modal
 *
 * Displays pending payments and uploads to user on app restart.
 * Allows user to resume, retry, or dismiss pending transactions.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS } from '@/constants/colors';
import { pendingTransactionsService } from '@/services/pendingTransactionsService';
import type {
  PendingPayment,
  PendingUpload,
} from '@/services/pendingTransactionsService';
import { formatCurrency } from '@/utils/currencyFormatter';
import { showAlert } from '@/stores/modalStore';

interface PendingTransactionsModalProps {
  visible: boolean;
  payments: PendingPayment[];
  uploads: PendingUpload[];
  onDismiss?: () => void;
  onClose?: () => void; // Alias for onDismiss
  onRetryPayment?: (payment: PendingPayment) => void;
  onResumePayment?: (payment: PendingPayment) => Promise<void>; // Alias
  onRetryUpload?: (upload: PendingUpload) => void;
  onResumeUpload?: (upload: PendingUpload) => Promise<void>; // Alias
  onDismissPayment?: (paymentId: string) => Promise<void>;
  onDismissUpload?: (uploadId: string) => Promise<void>;
}

export const PendingTransactionsModal: React.FC<
  PendingTransactionsModalProps
> = ({
  visible,
  payments,
  uploads,
  onDismiss,
  onClose,
  onRetryPayment,
  onResumePayment,
  onRetryUpload,
  onResumeUpload,
  onDismissPayment: _onDismissPayment,
  onDismissUpload: _onDismissUpload,
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  // Use alias props if main ones not provided
  const handleClose = onDismiss || onClose;
  const handleRetryPaymentFn = onRetryPayment || onResumePayment;
  const handleRetryUploadFn = onRetryUpload || onResumeUpload;

  const handleRetryPayment = async (payment: PendingPayment) => {
    setLoading(payment.id);
    try {
      if (handleRetryPaymentFn) {
        await handleRetryPaymentFn(payment);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleRetryUpload = async (upload: PendingUpload) => {
    setLoading(upload.id);
    try {
      if (handleRetryUploadFn) {
        await handleRetryUploadFn(upload);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDismissPayment = async (payment: PendingPayment) => {
    showAlert({
      title: 'İşlemi Sil',
      message: 'Bu bekleyen işlemi silmek istediğinizden emin misiniz?',
      buttons: [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await pendingTransactionsService.removePendingPayment(payment.id);
          },
        },
      ],
    });
  };

  const handleDismissUpload = async (upload: PendingUpload) => {
    showAlert({
      title: 'Yüklemeyi Sil',
      message: 'Bu bekleyen yüklemeyi silmek istediğinizden emin misiniz?',
      buttons: [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await pendingTransactionsService.removePendingUpload(upload.id);
          },
        },
      ],
    });
  };

  const hasItems = payments.length > 0 || uploads.length > 0;

  if (!hasItems) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bekleyen İşlemler</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Payments Section */}
          {payments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bekleyen Ödemeler</Text>
              {payments.map((payment) => (
                <View key={payment.id} style={styles.item}>
                  <View style={styles.itemInfo}>
                    <Icon
                      name={payment.type === 'gift' ? 'gift' : 'cash'}
                      size={24}
                      color={COLORS.accent.primary}
                    />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemTitle}>
                        {payment.type === 'gift' ? 'Hediye' : 'Para Çekme'}
                      </Text>
                      <Text style={styles.itemAmount}>
                        {formatCurrency(
                          payment.amount,
                          payment.currency as any,
                        )}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.itemActions}>
                    {loading === payment.id ? (
                      <ActivityIndicator color={COLORS.accent.primary} />
                    ) : (
                      <>
                        <TouchableOpacity
                          onPress={() => handleRetryPayment(payment)}
                          style={styles.retryButton}
                        >
                          <Icon
                            name="refresh"
                            size={20}
                            color={COLORS.accent.primary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDismissPayment(payment)}
                          style={styles.dismissButton}
                        >
                          <Icon
                            name="trash-can-outline"
                            size={20}
                            color={COLORS.error}
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Uploads Section */}
          {uploads.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bekleyen Yüklemeler</Text>
              {uploads.map((upload) => (
                <View key={upload.id} style={styles.item}>
                  <View style={styles.itemInfo}>
                    <Icon
                      name={upload.type === 'proof' ? 'camera' : 'cloud-upload'}
                      size={24}
                      color={COLORS.accent.primary}
                    />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemTitle}>
                        {upload.type === 'proof'
                          ? 'Kanıt Yüklemesi'
                          : 'Dosya Yüklemesi'}
                      </Text>
                      <Text style={styles.itemSubtitle}>
                        {Math.round(upload.fileSize / 1024)} KB - %
                        {upload.progress}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.itemActions}>
                    {loading === upload.id ? (
                      <ActivityIndicator color={COLORS.accent.primary} />
                    ) : (
                      <>
                        <TouchableOpacity
                          onPress={() => handleRetryUpload(upload)}
                          style={styles.retryButton}
                        >
                          <Icon
                            name="refresh"
                            size={20}
                            color={COLORS.accent.primary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDismissUpload(upload)}
                          style={styles.dismissButton}
                        >
                          <Icon
                            name="trash-can-outline"
                            size={20}
                            color={COLORS.error}
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.dismissAllButton}
            onPress={handleClose}
          >
            <Text style={styles.dismissAllText}>Tümünü Kapat</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemDetails: {
    marginLeft: 12,
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  itemAmount: {
    fontSize: 14,
    color: COLORS.accent.primary,
    marginTop: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButton: {
    padding: 8,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
  },
  dismissButton: {
    padding: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  dismissAllButton: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dismissAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
});
