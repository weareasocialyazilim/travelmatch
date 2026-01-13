/**
 * Pending Transactions Service
 *
 * Manages incomplete/pending payment and upload operations.
 * Handles app crashes, kills, and background interruptions.
 *
 * Features:
 * - Track pending payments (crash recovery)
 * - Track pending uploads (background/kill recovery)
 * - Auto-cleanup expired transactions
 * - Resume or notify user on app restart
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

// Storage keys
const PENDING_PAYMENTS_KEY = '@travelmatch/pending_payments';
const PENDING_UPLOADS_KEY = '@travelmatch/pending_uploads';

// Transaction expiry (24 hours)
const TRANSACTION_EXPIRY_MS = 24 * 60 * 60 * 1000;

export enum TransactionStatus {
  INITIATED = 'initiated',
  PROCESSING = 'processing',
  VERIFYING = 'verifying',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export interface PendingPayment {
  id: string;
  type: 'gift' | 'withdraw' | 'moment_purchase';
  amount: number;
  currency: string;
  recipientId?: string;
  momentId?: string;
  status: TransactionStatus;
  createdAt: number;
  updatedAt: number;
  metadata?: {
    paymentMethod?: string;
    destination?: string;
    note?: string;
  };
}

export interface PendingUpload {
  id: string;
  type: 'proof' | 'moment' | 'avatar' | 'message';
  localUri: string;
  bucket: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: TransactionStatus;
  progress: number; // 0-100
  createdAt: number;
  updatedAt: number;
  retryCount: number;
  metadata?: {
    momentId?: string;
    messageId?: string;
    relatedId?: string;
  };
}

class PendingTransactionsService {
  /**
   * Add a pending payment transaction
   */
  async addPendingPayment(
    payment: Omit<PendingPayment, 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    try {
      const payments = await this.getPendingPayments();
      const newPayment: PendingPayment = {
        ...payment,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      payments.push(newPayment);
      await AsyncStorage.setItem(
        PENDING_PAYMENTS_KEY,
        JSON.stringify(payments),
      );

      logger.info('PendingTransactions', 'Payment added', {
        id: payment.id,
        type: payment.type,
        amount: payment.amount,
      });
    } catch (error) {
      logger.error(
        'PendingTransactions',
        'Failed to add pending payment',
        error,
      );
      throw error;
    }
  }

  /**
   * Update pending payment status
   */
  async updatePaymentStatus(
    id: string,
    status: TransactionStatus,
  ): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(PENDING_PAYMENTS_KEY);
      const payments: PendingPayment[] = stored ? JSON.parse(stored) : [];
      const index = payments.findIndex((p) => p.id === id);

      if (index === -1) {
        logger.warn('PendingTransactions', 'Payment not found for update', {
          id,
        });
        return;
      }

      const payment = payments[index];
      if (!payment) return;

      payment.status = status;
      payment.updatedAt = Date.now();

      // Remove if completed or failed
      if (
        status === TransactionStatus.COMPLETED ||
        status === TransactionStatus.FAILED
      ) {
        payments.splice(index, 1);
      }

      await AsyncStorage.setItem(
        PENDING_PAYMENTS_KEY,
        JSON.stringify(payments),
      );

      logger.info('PendingTransactions', 'Payment status updated', {
        id,
        status,
      });
    } catch (error) {
      logger.error(
        'PendingTransactions',
        'Failed to update payment status',
        error,
      );
    }
  }

  /**
   * Get all pending payments
   */
  async getPendingPayments(): Promise<PendingPayment[]> {
    try {
      const stored = await AsyncStorage.getItem(PENDING_PAYMENTS_KEY);
      if (!stored) return [];

      const payments: PendingPayment[] = JSON.parse(stored);

      // Filter out expired transactions
      const now = Date.now();
      const validPayments = payments.filter((p) => {
        const age = now - p.createdAt;
        return age < TRANSACTION_EXPIRY_MS;
      });

      // Save cleaned list if we removed any
      if (validPayments.length !== payments.length) {
        await AsyncStorage.setItem(
          PENDING_PAYMENTS_KEY,
          JSON.stringify(validPayments),
        );
      }

      return validPayments;
    } catch (error) {
      logger.error(
        'PendingTransactions',
        'Failed to get pending payments',
        error,
      );
      return [];
    }
  }

  /**
   * Clear completed/failed payment
   */
  async clearPayment(id: string): Promise<void> {
    try {
      const payments = await this.getPendingPayments();
      const filtered = payments.filter((p) => p.id !== id);
      await AsyncStorage.setItem(
        PENDING_PAYMENTS_KEY,
        JSON.stringify(filtered),
      );

      logger.info('PendingTransactions', 'Payment cleared', { id });
    } catch (error) {
      logger.error('PendingTransactions', 'Failed to clear payment', error);
    }
  }

  /**
   * Remove a pending payment (alias for clearPayment)
   */
  async removePendingPayment(id: string): Promise<void> {
    return this.clearPayment(id);
  }

  /**
   * Add a pending upload transaction
   */
  async addPendingUpload(
    upload: Omit<PendingUpload, 'createdAt' | 'updatedAt' | 'retryCount'>,
  ): Promise<void> {
    try {
      const uploads = await this.getPendingUploads();
      const newUpload: PendingUpload = {
        ...upload,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        retryCount: 0,
      };

      uploads.push(newUpload);
      await AsyncStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(uploads));

      logger.info('PendingTransactions', 'Upload added', {
        id: upload.id,
        type: upload.type,
        fileName: upload.fileName,
      });
    } catch (error) {
      logger.error(
        'PendingTransactions',
        'Failed to add pending upload',
        error,
      );
      throw error;
    }
  }

  /**
   * Update upload progress
   */
  async updateUploadProgress(
    id: string,
    progress: number,
    status?: TransactionStatus,
  ): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(PENDING_UPLOADS_KEY);
      const uploads: PendingUpload[] = stored ? JSON.parse(stored) : [];
      const index = uploads.findIndex((u) => u.id === id);

      if (index === -1) {
        logger.warn(
          'PendingTransactions',
          'Upload not found for progress update',
          { id },
        );
        return;
      }

      const upload = uploads[index];
      if (!upload) return;

      upload.progress = progress;
      upload.updatedAt = Date.now();

      if (status) {
        upload.status = status;
      }

      // Remove if completed or max retries reached
      if (
        status === TransactionStatus.COMPLETED ||
        (status === TransactionStatus.FAILED && upload.retryCount >= 3)
      ) {
        uploads.splice(index, 1);
      }

      await AsyncStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(uploads));

      logger.info('PendingTransactions', 'Upload progress updated', {
        id,
        progress,
        status,
      });
    } catch (error) {
      logger.error(
        'PendingTransactions',
        'Failed to update upload progress',
        error,
      );
    }
  }

  /**
   * Increment upload retry count
   */
  async incrementUploadRetry(id: string): Promise<number> {
    try {
      const uploads = await this.getPendingUploads();
      const index = uploads.findIndex((u) => u.id === id);

      if (index === -1) {
        return 0;
      }

      const upload = uploads[index];
      if (!upload) return 0;

      upload.retryCount++;
      upload.updatedAt = Date.now();
      upload.status = TransactionStatus.FAILED;

      await AsyncStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(uploads));

      return upload.retryCount;
    } catch (error) {
      logger.error(
        'PendingTransactions',
        'Failed to increment retry count',
        error,
      );
      return 0;
    }
  }

  /**
   * Get all pending uploads
   */
  async getPendingUploads(): Promise<PendingUpload[]> {
    try {
      const stored = await AsyncStorage.getItem(PENDING_UPLOADS_KEY);
      if (!stored) return [];

      const uploads: PendingUpload[] = JSON.parse(stored);

      // Filter out expired uploads
      const now = Date.now();
      const validUploads = uploads.filter((u) => {
        const age = now - u.createdAt;
        return age < TRANSACTION_EXPIRY_MS;
      });

      // Save cleaned list if we removed any
      if (validUploads.length !== uploads.length) {
        await AsyncStorage.setItem(
          PENDING_UPLOADS_KEY,
          JSON.stringify(validUploads),
        );
      }

      return validUploads;
    } catch (error) {
      logger.error(
        'PendingTransactions',
        'Failed to get pending uploads',
        error,
      );
      return [];
    }
  }

  /**
   * Clear completed/failed upload
   */
  async clearUpload(id: string): Promise<void> {
    try {
      const uploads = await this.getPendingUploads();
      const filtered = uploads.filter((u) => u.id !== id);
      await AsyncStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(filtered));

      logger.info('PendingTransactions', 'Upload cleared', { id });
    } catch (error) {
      logger.error('PendingTransactions', 'Failed to clear upload', error);
    }
  }

  /**
   * Remove a pending upload (alias for clearUpload)
   */
  async removePendingUpload(id: string): Promise<void> {
    return this.clearUpload(id);
  }

  /**
   * Check if there are any pending transactions on app start
   */
  async checkPendingOnStartup(): Promise<{
    hasPayments: boolean;
    hasUploads: boolean;
    payments: PendingPayment[];
    uploads: PendingUpload[];
  }> {
    try {
      // Probe storage first so storage-level errors are surfaced as a single aggregated error
      await AsyncStorage.getItem(PENDING_PAYMENTS_KEY);
      await AsyncStorage.getItem(PENDING_UPLOADS_KEY);

      const payments = await this.getPendingPayments();
      const uploads = await this.getPendingUploads();

      const result = {
        hasPayments: payments.length > 0,
        hasUploads: uploads.length > 0,
        payments,
        uploads,
      };

      if (result.hasPayments || result.hasUploads) {
        logger.warn(
          'PendingTransactions',
          'Found pending transactions on startup',
          {
            paymentsCount: payments.length,
            uploadsCount: uploads.length,
          },
        );
      }

      return result;
    } catch (error) {
      logger.error(
        'PendingTransactions',
        'Failed to check pending transactions',
        error,
      );
      return {
        hasPayments: false,
        hasUploads: false,
        payments: [],
        uploads: [],
      };
    }
  }

  /**
   * Clear all pending transactions (for testing/debugging)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        PENDING_PAYMENTS_KEY,
        PENDING_UPLOADS_KEY,
      ]);
      logger.info('PendingTransactions', 'All pending transactions cleared');
    } catch (error) {
      logger.error(
        'PendingTransactions',
        'Failed to clear all transactions',
        error,
      );
    }
  }
}

export const pendingTransactionsService = new PendingTransactionsService();
