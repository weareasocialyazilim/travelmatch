/**
 * Pending Transactions Service Tests
 * 
 * Tests pending payment and upload tracking with:
 * - Payment transaction tracking (add, update, remove)
 * - Upload transaction tracking with retry limits
 * - 24h auto-cleanup of expired transactions
 * - AsyncStorage persistence
 * - Concurrent operation handling
 * - Startup recovery checks
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  pendingTransactionsService, 
  TransactionStatus
} from '../pendingTransactionsService';
import { logger } from '../../utils/logger';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../utils/logger');

const mockAsyncStorage = AsyncStorage ;
const mockLogger = logger ;

describe('PendingTransactionsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
    mockAsyncStorage.multiRemove.mockResolvedValue(undefined);
  });

  describe('Pending Payments', () => {
    it('should add pending payment successfully', async () => {
      const payment = {
        id: 'payment-1',
        type: 'gift' as const,
        amount: 25.00,
        currency: 'USD',
        recipientId: 'user-123',
        momentId: 'moment-456',
        status: TransactionStatus.INITIATED,
        metadata: {
          paymentMethod: 'apple_pay',
          note: 'Test gift',
        },
      };

      await pendingTransactionsService.addPendingPayment(payment);

      // Verify AsyncStorage was called with correct data
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@travelmatch/pending_payments',
        expect.stringContaining('"id":"payment-1"')
      );

      // Verify logger was called
      expect(mockLogger.info).toHaveBeenCalledWith(
        'PendingTransactions',
        'Payment added',
        expect.objectContaining({
          id: 'payment-1',
          type: 'gift',
          amount: 25.00,
        })
      );
    });

    it('should get pending payments from storage', async () => {
      const storedPayments = [
        {
          id: 'payment-1',
          type: 'gift',
          amount: 25.00,
          currency: 'USD',
          status: TransactionStatus.PROCESSING,
          createdAt: Date.now() - 1000,
          updatedAt: Date.now(),
        },
        {
          id: 'payment-2',
          type: 'withdraw',
          amount: 50.00,
          currency: 'USD',
          status: TransactionStatus.INITIATED,
          createdAt: Date.now() - 2000,
          updatedAt: Date.now(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedPayments));

      const payments = await pendingTransactionsService.getPendingPayments();

      expect(payments).toHaveLength(2);
      expect(payments[0]?.id).toBe('payment-1');
      expect(payments[1]?.id).toBe('payment-2');
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@travelmatch/pending_payments');
    });

    it('should return empty array when no pending payments', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const payments = await pendingTransactionsService.getPendingPayments();

      expect(payments).toEqual([]);
    });

    it('should update payment status', async () => {
      const storedPayments = [
        {
          id: 'payment-1',
          type: 'gift',
          amount: 25.00,
          currency: 'USD',
          status: TransactionStatus.INITIATED,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedPayments));

      await pendingTransactionsService.updatePaymentStatus('payment-1', TransactionStatus.PROCESSING);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'PendingTransactions',
        'Payment status updated',
        expect.objectContaining({
          id: 'payment-1',
          status: TransactionStatus.PROCESSING,
        })
      );
    });

    it('should remove payment when status is COMPLETED', async () => {
      const storedPayments = [
        {
          id: 'payment-1',
          type: 'gift',
          amount: 25.00,
          currency: 'USD',
          status: TransactionStatus.PROCESSING,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedPayments));

      await pendingTransactionsService.updatePaymentStatus('payment-1', TransactionStatus.COMPLETED);

      // Verify payment was removed (array should be empty)
      const lastCall = mockAsyncStorage.setItem.mock.calls[mockAsyncStorage.setItem.mock.calls.length - 1];
      expect(lastCall).toBeDefined();
      if (lastCall) {
        const savedData = JSON.parse(lastCall[1] as string);
        expect(savedData).toEqual([]);
      }
    });

    it('should remove payment when status is FAILED', async () => {
      const storedPayments = [
        {
          id: 'payment-1',
          type: 'gift',
          amount: 25.00,
          currency: 'USD',
          status: TransactionStatus.PROCESSING,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedPayments));

      await pendingTransactionsService.updatePaymentStatus('payment-1', TransactionStatus.FAILED);

      const lastCall = mockAsyncStorage.setItem.mock.calls[mockAsyncStorage.setItem.mock.calls.length - 1];
      expect(lastCall).toBeDefined();
      if (lastCall) {
        const savedData = JSON.parse(lastCall[1] as string);
        expect(savedData).toEqual([]);
      }
    });

    it('should handle update for non-existent payment', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      await pendingTransactionsService.updatePaymentStatus('non-existent', TransactionStatus.PROCESSING);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'PendingTransactions',
        'Payment not found for update',
        expect.objectContaining({ id: 'non-existent' })
      );
    });

    it('should clear specific payment', async () => {
      const storedPayments = [
        {
          id: 'payment-1',
          type: 'gift',
          amount: 25.00,
          currency: 'USD',
          status: TransactionStatus.INITIATED,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'payment-2',
          type: 'withdraw',
          amount: 50.00,
          currency: 'USD',
          status: TransactionStatus.INITIATED,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedPayments));

      await pendingTransactionsService.clearPayment('payment-1');

      const lastCall = mockAsyncStorage.setItem.mock.calls[mockAsyncStorage.setItem.mock.calls.length - 1];
      expect(lastCall).toBeDefined();
      if (lastCall) {
        const savedData = JSON.parse(lastCall[1] as string);
        expect(savedData).toHaveLength(1);
        expect(savedData[0]?.id).toBe('payment-2');
      }

      expect(mockLogger.info).toHaveBeenCalledWith(
        'PendingTransactions',
        'Payment cleared',
        expect.objectContaining({ id: 'payment-1' })
      );
    });

    it('should support removePendingPayment alias', async () => {
      const storedPayments = [
        {
          id: 'payment-1',
          type: 'gift',
          amount: 25.00,
          currency: 'USD',
          status: TransactionStatus.INITIATED,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedPayments));

      await pendingTransactionsService.removePendingPayment('payment-1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'PendingTransactions',
        'Payment cleared',
        expect.objectContaining({ id: 'payment-1' })
      );
    });
  });

  describe('24h Auto-Cleanup', () => {
    it('should auto-remove payments older than 24 hours', async () => {
      const now = Date.now();
      const twentyFiveHoursAgo = now - (25 * 60 * 60 * 1000); // 25h ago
      const oneHourAgo = now - (60 * 60 * 1000); // 1h ago

      const storedPayments = [
        {
          id: 'payment-expired',
          type: 'gift',
          amount: 25.00,
          currency: 'USD',
          status: TransactionStatus.INITIATED,
          createdAt: twentyFiveHoursAgo,
          updatedAt: twentyFiveHoursAgo,
        },
        {
          id: 'payment-valid',
          type: 'gift',
          amount: 30.00,
          currency: 'USD',
          status: TransactionStatus.INITIATED,
          createdAt: oneHourAgo,
          updatedAt: oneHourAgo,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedPayments));

      const payments = await pendingTransactionsService.getPendingPayments();

      // Should only return valid payment
      expect(payments).toHaveLength(1);
      expect(payments[0]?.id).toBe('payment-valid');

      // Should save cleaned list
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@travelmatch/pending_payments',
        expect.stringContaining('"id":"payment-valid"')
      );
    });

    it('should auto-remove uploads older than 24 hours', async () => {
      const now = Date.now();
      const twentyFiveHoursAgo = now - (25 * 60 * 60 * 1000);
      const oneHourAgo = now - (60 * 60 * 1000);

      const storedUploads = [
        {
          id: 'upload-expired',
          type: 'moment',
          localUri: 'file://expired.jpg',
          bucket: 'moments',
          fileName: 'expired.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          status: TransactionStatus.UPLOADING,
          progress: 50,
          createdAt: twentyFiveHoursAgo,
          updatedAt: twentyFiveHoursAgo,
          retryCount: 0,
        },
        {
          id: 'upload-valid',
          type: 'moment',
          localUri: 'file://valid.jpg',
          bucket: 'moments',
          fileName: 'valid.jpg',
          fileSize: 2048,
          mimeType: 'image/jpeg',
          status: TransactionStatus.UPLOADING,
          progress: 75,
          createdAt: oneHourAgo,
          updatedAt: oneHourAgo,
          retryCount: 0,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedUploads));

      const uploads = await pendingTransactionsService.getPendingUploads();

      expect(uploads).toHaveLength(1);
      expect(uploads[0]?.id).toBe('upload-valid');
    });

    it('should not save if no expired items found', async () => {
      const storedPayments = [
        {
          id: 'payment-1',
          type: 'gift',
          amount: 25.00,
          currency: 'USD',
          status: TransactionStatus.INITIATED,
          createdAt: Date.now() - 1000,
          updatedAt: Date.now(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedPayments));

      await pendingTransactionsService.getPendingPayments();

      // Should only call getItem, not setItem (no cleanup needed)
      expect(mockAsyncStorage.getItem).toHaveBeenCalled();
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Pending Uploads', () => {
    it('should add pending upload successfully', async () => {
      const upload = {
        id: 'upload-1',
        type: 'moment' as const,
        localUri: 'file:///path/to/image.jpg',
        bucket: 'moments',
        fileName: 'moment-image.jpg',
        fileSize: 2048000,
        mimeType: 'image/jpeg',
        status: TransactionStatus.UPLOADING,
        progress: 0,
        metadata: {
          momentId: 'moment-123',
        },
      };

      await pendingTransactionsService.addPendingUpload(upload);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@travelmatch/pending_uploads',
        expect.stringContaining('"id":"upload-1"')
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'PendingTransactions',
        'Upload added',
        expect.objectContaining({
          id: 'upload-1',
          type: 'moment',
          fileName: 'moment-image.jpg',
        })
      );
    });

    it('should initialize retryCount to 0 when adding upload', async () => {
      const upload = {
        id: 'upload-1',
        type: 'proof' as const,
        localUri: 'file:///proof.jpg',
        bucket: 'proofs',
        fileName: 'proof.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        status: TransactionStatus.UPLOADING,
        progress: 0,
      };

      await pendingTransactionsService.addPendingUpload(upload);

      const lastCall = mockAsyncStorage.setItem.mock.calls[mockAsyncStorage.setItem.mock.calls.length - 1];
      expect(lastCall).toBeDefined();
      if (lastCall) {
        const savedData = JSON.parse(lastCall[1] as string);
        expect(savedData[0]?.retryCount).toBe(0);
      }
    });

    it('should get pending uploads from storage', async () => {
      const storedUploads = [
        {
          id: 'upload-1',
          type: 'moment',
          localUri: 'file://image1.jpg',
          bucket: 'moments',
          fileName: 'image1.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          status: TransactionStatus.UPLOADING,
          progress: 50,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 0,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedUploads));

      const uploads = await pendingTransactionsService.getPendingUploads();

      expect(uploads).toHaveLength(1);
      expect(uploads[0]?.id).toBe('upload-1');
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@travelmatch/pending_uploads');
    });

    it('should update upload progress', async () => {
      const storedUploads = [
        {
          id: 'upload-1',
          type: 'moment',
          localUri: 'file://image.jpg',
          bucket: 'moments',
          fileName: 'image.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          status: TransactionStatus.UPLOADING,
          progress: 25,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 0,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedUploads));

      await pendingTransactionsService.updateUploadProgress('upload-1', 75);

      const lastCall = mockAsyncStorage.setItem.mock.calls[mockAsyncStorage.setItem.mock.calls.length - 1];
      expect(lastCall).toBeDefined();
      if (lastCall) {
        const savedData = JSON.parse(lastCall[1] as string);
        expect(savedData[0]?.progress).toBe(75);
      }

      expect(mockLogger.info).toHaveBeenCalledWith(
        'PendingTransactions',
        'Upload progress updated',
        expect.objectContaining({
          id: 'upload-1',
          progress: 75,
        })
      );
    });

    it('should update upload progress and status', async () => {
      const storedUploads = [
        {
          id: 'upload-1',
          type: 'moment',
          localUri: 'file://image.jpg',
          bucket: 'moments',
          fileName: 'image.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          status: TransactionStatus.UPLOADING,
          progress: 75,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 0,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedUploads));

      await pendingTransactionsService.updateUploadProgress('upload-1', 100, TransactionStatus.VERIFYING);

      const lastCall = mockAsyncStorage.setItem.mock.calls[mockAsyncStorage.setItem.mock.calls.length - 1];
      expect(lastCall).toBeDefined();
      if (lastCall) {
        const savedData = JSON.parse(lastCall[1] as string);
        expect(savedData[0]?.progress).toBe(100);
        expect(savedData[0]?.status).toBe(TransactionStatus.VERIFYING);
      }
    });

    it('should remove upload when status is COMPLETED', async () => {
      const storedUploads = [
        {
          id: 'upload-1',
          type: 'moment',
          localUri: 'file://image.jpg',
          bucket: 'moments',
          fileName: 'image.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          status: TransactionStatus.UPLOADING,
          progress: 100,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 0,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedUploads));

      await pendingTransactionsService.updateUploadProgress('upload-1', 100, TransactionStatus.COMPLETED);

      const lastCall = mockAsyncStorage.setItem.mock.calls[mockAsyncStorage.setItem.mock.calls.length - 1];
      expect(lastCall).toBeDefined();
      if (lastCall) {
        const savedData = JSON.parse(lastCall[1] as string);
        expect(savedData).toEqual([]);
      }
    });

    it('should handle update for non-existent upload', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      await pendingTransactionsService.updateUploadProgress('non-existent', 50);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'PendingTransactions',
        'Upload not found for progress update',
        expect.objectContaining({ id: 'non-existent' })
      );
    });

    it('should clear specific upload', async () => {
      const storedUploads = [
        {
          id: 'upload-1',
          type: 'moment',
          localUri: 'file://image1.jpg',
          bucket: 'moments',
          fileName: 'image1.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          status: TransactionStatus.UPLOADING,
          progress: 50,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 0,
        },
        {
          id: 'upload-2',
          type: 'moment',
          localUri: 'file://image2.jpg',
          bucket: 'moments',
          fileName: 'image2.jpg',
          fileSize: 2048,
          mimeType: 'image/jpeg',
          status: TransactionStatus.UPLOADING,
          progress: 75,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 0,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedUploads));

      await pendingTransactionsService.clearUpload('upload-1');

      const lastCall = mockAsyncStorage.setItem.mock.calls[mockAsyncStorage.setItem.mock.calls.length - 1];
      expect(lastCall).toBeDefined();
      if (lastCall) {
        const savedData = JSON.parse(lastCall[1] as string);
        expect(savedData).toHaveLength(1);
        expect(savedData[0]?.id).toBe('upload-2');
      }
    });

    it('should support removePendingUpload alias', async () => {
      const storedUploads = [
        {
          id: 'upload-1',
          type: 'moment',
          localUri: 'file://image.jpg',
          bucket: 'moments',
          fileName: 'image.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          status: TransactionStatus.UPLOADING,
          progress: 50,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 0,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedUploads));

      await pendingTransactionsService.removePendingUpload('upload-1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'PendingTransactions',
        'Upload cleared',
        expect.objectContaining({ id: 'upload-1' })
      );
    });
  });

  describe('Upload Retry Mechanism', () => {
    it('should increment retry count', async () => {
      const storedUploads = [
        {
          id: 'upload-1',
          type: 'moment',
          localUri: 'file://image.jpg',
          bucket: 'moments',
          fileName: 'image.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          status: TransactionStatus.UPLOADING,
          progress: 50,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 0,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedUploads));

      const retryCount = await pendingTransactionsService.incrementUploadRetry('upload-1');

      expect(retryCount).toBe(1);

      const lastCall = mockAsyncStorage.setItem.mock.calls[mockAsyncStorage.setItem.mock.calls.length - 1];
      expect(lastCall).toBeDefined();
      if (lastCall) {
        const savedData = JSON.parse(lastCall[1] as string);
        expect(savedData[0]?.retryCount).toBe(1);
        expect(savedData[0]?.status).toBe(TransactionStatus.FAILED);
      }
    });

    it('should increment retry count multiple times', async () => {
      let storedUploads = [
        {
          id: 'upload-1',
          type: 'moment',
          localUri: 'file://image.jpg',
          bucket: 'moments',
          fileName: 'image.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          status: TransactionStatus.UPLOADING,
          progress: 50,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 0,
        },
      ];

      mockAsyncStorage.getItem.mockImplementation(async () => JSON.stringify(storedUploads));
      mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
        storedUploads = JSON.parse(value);
      });

      const retry1 = await pendingTransactionsService.incrementUploadRetry('upload-1');
      expect(retry1).toBe(1);

      const retry2 = await pendingTransactionsService.incrementUploadRetry('upload-1');
      expect(retry2).toBe(2);

      const retry3 = await pendingTransactionsService.incrementUploadRetry('upload-1');
      expect(retry3).toBe(3);
    });

    it('should remove upload after 3 failed retries', async () => {
      const storedUploads = [
        {
          id: 'upload-1',
          type: 'moment',
          localUri: 'file://image.jpg',
          bucket: 'moments',
          fileName: 'image.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          status: TransactionStatus.UPLOADING,
          progress: 50,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 2, // Already failed twice
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedUploads));

      // Increment to 3rd retry
      await pendingTransactionsService.incrementUploadRetry('upload-1');

      // Now try to update with FAILED status (should remove)
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([
        {
          ...storedUploads[0],
          retryCount: 3,
          status: TransactionStatus.FAILED,
        },
      ]));

      await pendingTransactionsService.updateUploadProgress('upload-1', 0, TransactionStatus.FAILED);

      const lastCall = mockAsyncStorage.setItem.mock.calls[mockAsyncStorage.setItem.mock.calls.length - 1];
      expect(lastCall).toBeDefined();
      if (lastCall) {
        const savedData = JSON.parse(lastCall[1] as string);
        expect(savedData).toEqual([]); // Should be removed
      }
    });

    it('should return 0 for non-existent upload retry', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      const retryCount = await pendingTransactionsService.incrementUploadRetry('non-existent');

      expect(retryCount).toBe(0);
    });

    it('should keep upload if retry count < 3 and status is FAILED', async () => {
      const storedUploads = [
        {
          id: 'upload-1',
          type: 'moment',
          localUri: 'file://image.jpg',
          bucket: 'moments',
          fileName: 'image.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          status: TransactionStatus.UPLOADING,
          progress: 50,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 1, // Only 1 retry
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedUploads));

      await pendingTransactionsService.updateUploadProgress('upload-1', 0, TransactionStatus.FAILED);

      const lastCall = mockAsyncStorage.setItem.mock.calls[mockAsyncStorage.setItem.mock.calls.length - 1];
      expect(lastCall).toBeDefined();
      if (lastCall) {
        const savedData = JSON.parse(lastCall[1] as string);
        expect(savedData).toHaveLength(1); // Should still be there
      }
    });
  });

  describe('Startup Recovery', () => {
    it('should detect pending payments on startup', async () => {
      const storedPayments = [
        {
          id: 'payment-1',
          type: 'gift',
          amount: 25.00,
          currency: 'USD',
          status: TransactionStatus.PROCESSING,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@travelmatch/pending_payments') {
          return JSON.stringify(storedPayments);
        }
        return null;
      });

      const result = await pendingTransactionsService.checkPendingOnStartup();

      expect(result.hasPayments).toBe(true);
      expect(result.hasUploads).toBe(false);
      expect(result.payments).toHaveLength(1);
      expect(result.uploads).toHaveLength(0);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'PendingTransactions',
        'Found pending transactions on startup',
        expect.objectContaining({
          paymentsCount: 1,
          uploadsCount: 0,
        })
      );
    });

    it('should detect pending uploads on startup', async () => {
      const storedUploads = [
        {
          id: 'upload-1',
          type: 'moment',
          localUri: 'file://image.jpg',
          bucket: 'moments',
          fileName: 'image.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          status: TransactionStatus.UPLOADING,
          progress: 50,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 1,
        },
      ];

      mockAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@travelmatch/pending_uploads') {
          return JSON.stringify(storedUploads);
        }
        return null;
      });

      const result = await pendingTransactionsService.checkPendingOnStartup();

      expect(result.hasPayments).toBe(false);
      expect(result.hasUploads).toBe(true);
      expect(result.payments).toHaveLength(0);
      expect(result.uploads).toHaveLength(1);
    });

    it('should detect both pending payments and uploads', async () => {
      const storedPayments = [
        {
          id: 'payment-1',
          type: 'gift',
          amount: 25.00,
          currency: 'USD',
          status: TransactionStatus.PROCESSING,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const storedUploads = [
        {
          id: 'upload-1',
          type: 'moment',
          localUri: 'file://image.jpg',
          bucket: 'moments',
          fileName: 'image.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          status: TransactionStatus.UPLOADING,
          progress: 50,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 0,
        },
      ];

      mockAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@travelmatch/pending_payments') {
          return JSON.stringify(storedPayments);
        }
        if (key === '@travelmatch/pending_uploads') {
          return JSON.stringify(storedUploads);
        }
        return null;
      });

      const result = await pendingTransactionsService.checkPendingOnStartup();

      expect(result.hasPayments).toBe(true);
      expect(result.hasUploads).toBe(true);
      expect(result.payments).toHaveLength(1);
      expect(result.uploads).toHaveLength(1);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'PendingTransactions',
        'Found pending transactions on startup',
        expect.objectContaining({
          paymentsCount: 1,
          uploadsCount: 1,
        })
      );
    });

    it('should return empty result when no pending transactions', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await pendingTransactionsService.checkPendingOnStartup();

      expect(result.hasPayments).toBe(false);
      expect(result.hasUploads).toBe(false);
      expect(result.payments).toEqual([]);
      expect(result.uploads).toEqual([]);

      // Should not log warning when nothing pending
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should handle startup check errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await pendingTransactionsService.checkPendingOnStartup();

      expect(result.hasPayments).toBe(false);
      expect(result.hasUploads).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'PendingTransactions',
        'Failed to check pending transactions',
        expect.any(Error)
      );
    });
  });

  describe('Clear All Transactions', () => {
    it('should clear all pending transactions', async () => {
      await pendingTransactionsService.clearAll();

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@travelmatch/pending_payments',
        '@travelmatch/pending_uploads',
      ]);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'PendingTransactions',
        'All pending transactions cleared'
      );
    });

    it('should handle clear all errors', async () => {
      mockAsyncStorage.multiRemove.mockRejectedValue(new Error('Storage error'));

      await pendingTransactionsService.clearAll();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'PendingTransactions',
        'Failed to clear all transactions',
        expect.any(Error)
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle add payment error', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const payment = {
        id: 'payment-1',
        type: 'gift' as const,
        amount: 25.00,
        currency: 'USD',
        status: TransactionStatus.INITIATED,
      };

      await expect(pendingTransactionsService.addPendingPayment(payment)).rejects.toThrow('Storage error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'PendingTransactions',
        'Failed to add pending payment',
        expect.any(Error)
      );
    });

    it('should handle get payments error', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const payments = await pendingTransactionsService.getPendingPayments();

      expect(payments).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'PendingTransactions',
        'Failed to get pending payments',
        expect.any(Error)
      );
    });

    it('should handle update payment status error', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      await pendingTransactionsService.updatePaymentStatus('payment-1', TransactionStatus.PROCESSING);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'PendingTransactions',
        'Failed to update payment status',
        expect.any(Error)
      );
    });

    it('should handle add upload error', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const upload = {
        id: 'upload-1',
        type: 'moment' as const,
        localUri: 'file://image.jpg',
        bucket: 'moments',
        fileName: 'image.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        status: TransactionStatus.UPLOADING,
        progress: 0,
      };

      await expect(pendingTransactionsService.addPendingUpload(upload)).rejects.toThrow('Storage error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'PendingTransactions',
        'Failed to add pending upload',
        expect.any(Error)
      );
    });

    it('should handle get uploads error', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const uploads = await pendingTransactionsService.getPendingUploads();

      expect(uploads).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'PendingTransactions',
        'Failed to get pending uploads',
        expect.any(Error)
      );
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent payment additions', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const payment1 = {
        id: 'payment-1',
        type: 'gift' as const,
        amount: 25.00,
        currency: 'USD',
        status: TransactionStatus.INITIATED,
      };

      const payment2 = {
        id: 'payment-2',
        type: 'withdraw' as const,
        amount: 50.00,
        currency: 'USD',
        status: TransactionStatus.INITIATED,
      };

      await Promise.all([
        pendingTransactionsService.addPendingPayment(payment1),
        pendingTransactionsService.addPendingPayment(payment2),
      ]);

      // Both should be added (even though reads might conflict)
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrent upload additions', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const upload1 = {
        id: 'upload-1',
        type: 'moment' as const,
        localUri: 'file://image1.jpg',
        bucket: 'moments',
        fileName: 'image1.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        status: TransactionStatus.UPLOADING,
        progress: 0,
      };

      const upload2 = {
        id: 'upload-2',
        type: 'moment' as const,
        localUri: 'file://image2.jpg',
        bucket: 'moments',
        fileName: 'image2.jpg',
        fileSize: 2048,
        mimeType: 'image/jpeg',
        status: TransactionStatus.UPLOADING,
        progress: 0,
      };

      await Promise.all([
        pendingTransactionsService.addPendingUpload(upload1),
        pendingTransactionsService.addPendingUpload(upload2),
      ]);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(2);
    });
  });
});
