/**
 * Storage Monitor Service Tests
 * 
 * Tests device storage monitoring with:
 * - Storage level detection (normal, low, critical)
 * - Upload permission checks based on available space
 * - Automatic cleanup triggers
 * - Warning cooldown mechanisms
 * - Platform-specific storage APIs
 * - Periodic monitoring lifecycle
 */

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageMonitor, StorageLevel } from '../storageMonitor';
import { logger } from '../../utils/logger';

// Mock dependencies
jest.mock('expo-file-system');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../utils/logger');

const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('StorageMonitorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Default mock implementations
    mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(500 * 1024 * 1024); // 500MB
    mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024); // 1GB
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
  });

  afterEach(() => {
    storageMonitor.stopMonitoring();
    jest.useRealTimers();
  });

  describe('Storage Info Detection', () => {
    it('should detect NORMAL storage level (> 100MB free)', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(200 * 1024 * 1024); // 200MB
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024); // 1GB

      const info = await storageMonitor.getStorageInfo();

      expect(info).toBeDefined();
      expect(info?.level).toBe(StorageLevel.NORMAL);
      expect(info?.canUpload).toBe(true);
      expect(info?.freeSpace).toBe(200 * 1024 * 1024);
      expect(info?.totalSpace).toBe(1000 * 1024 * 1024);
      expect(info?.usedSpace).toBe(800 * 1024 * 1024);
    });

    it('should detect LOW storage level (50MB - 100MB free)', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(75 * 1024 * 1024); // 75MB
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024); // 1GB

      const info = await storageMonitor.getStorageInfo();

      expect(info?.level).toBe(StorageLevel.LOW);
      expect(info?.canUpload).toBe(true); // Still allowed on LOW
    });

    it('should detect CRITICAL storage level (< 50MB free)', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(30 * 1024 * 1024); // 30MB
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024); // 1GB

      const info = await storageMonitor.getStorageInfo();

      expect(info?.level).toBe(StorageLevel.CRITICAL);
      expect(info?.canUpload).toBe(false); // Blocked on CRITICAL
    });

    it('should calculate free percentage correctly', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(250 * 1024 * 1024); // 250MB
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024); // 1GB

      const info = await storageMonitor.getStorageInfo();

      expect(info?.freePercentage).toBe(25); // 25% free
    });

    it('should estimate uploads remaining based on 5MB average', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(100 * 1024 * 1024); // 100MB

      const info = await storageMonitor.getStorageInfo();

      // 100MB / 5MB = 20 uploads
      expect(info?.estimatedUploadsRemaining).toBe(20);
    });

    it('should handle storage info errors gracefully', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockRejectedValue(new Error('FileSystem error'));

      const info = await storageMonitor.getStorageInfo();

      expect(info).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'StorageMonitor',
        'Failed to get storage info',
        expect.any(Error)
      );
    });
  });

  describe('Upload Permission Checks', () => {
    it('should allow upload when sufficient storage (normal)', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(200 * 1024 * 1024); // 200MB
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      const fileSize = 10 * 1024 * 1024; // 10MB file
      const result = await storageMonitor.canUpload(fileSize);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should block upload on CRITICAL storage (< 50MB)', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(40 * 1024 * 1024); // 40MB
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      const fileSize = 10 * 1024 * 1024; // 10MB file
      const result = await storageMonitor.canUpload(fileSize);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Insufficient storage');
    });

    it('should block upload when file size exceeds available space', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(20 * 1024 * 1024); // 20MB
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      const fileSize = 50 * 1024 * 1024; // 50MB file (requires 75MB with buffer)
      const result = await storageMonitor.canUpload(fileSize);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'StorageMonitor',
        'Upload blocked: Insufficient storage',
        expect.objectContaining({
          fileSize: expect.any(String),
          freeSpace: expect.any(String),
          required: expect.any(String),
        })
      );
    });

    it('should apply 1.5x buffer for processing space', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(100 * 1024 * 1024); // 100MB
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      const fileSize = 80 * 1024 * 1024; // 80MB (requires 120MB with 1.5x buffer)
      const result = await storageMonitor.canUpload(fileSize);

      expect(result.allowed).toBe(false); // 100MB < 120MB required
    });

    it('should warn but allow upload on LOW storage', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(75 * 1024 * 1024); // 75MB (LOW)
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      const fileSize = 10 * 1024 * 1024; // 10MB file
      const result = await storageMonitor.canUpload(fileSize);

      expect(result.allowed).toBe(true);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'StorageMonitor',
        'Upload allowed but storage is low',
        expect.objectContaining({
          level: StorageLevel.LOW,
        })
      );
    });

    it('should allow upload when storage info unavailable (fail-open)', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockRejectedValue(new Error('Error'));

      const result = await storageMonitor.canUpload(10 * 1024 * 1024);

      expect(result.allowed).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'StorageMonitor',
        'Cannot verify storage, allowing upload'
      );
    });

    it('should handle canUpload check errors gracefully', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockRejectedValue(new Error('FileSystem error'));

      const result = await storageMonitor.canUpload(10 * 1024 * 1024);

      expect(result.allowed).toBe(true); // Fail-open on error
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('Storage Check Logging', () => {
    it('should log CRITICAL storage level', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(30 * 1024 * 1024); // 30MB
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      await storageMonitor.checkStorage();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'StorageMonitor',
        'CRITICAL: Storage critically low',
        expect.objectContaining({
          freeSpace: expect.any(String),
          freePercentage: expect.any(String),
          estimatedUploads: expect.any(Number),
        })
      );
    });

    it('should log LOW storage level as warning', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(75 * 1024 * 1024); // 75MB
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      await storageMonitor.checkStorage();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'StorageMonitor',
        'WARNING: Storage running low',
        expect.objectContaining({
          freeSpace: expect.any(String),
          freePercentage: expect.any(String),
          estimatedUploads: expect.any(Number),
        })
      );
    });

    it('should log NORMAL storage level as info', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(200 * 1024 * 1024); // 200MB
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      await storageMonitor.checkStorage();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'StorageMonitor',
        'Storage check OK',
        expect.objectContaining({
          freeSpace: expect.any(String),
          freePercentage: expect.any(String),
        })
      );
    });

    it('should save last storage check timestamp', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(200 * 1024 * 1024);
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      await storageMonitor.checkStorage();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@travelmatch/last_storage_check',
        expect.any(String)
      );
    });

    it('should handle check storage errors gracefully', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockRejectedValue(new Error('Error'));

      const info = await storageMonitor.checkStorage();

      expect(info).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'StorageMonitor',
        'Storage check failed',
        expect.any(Error)
      );
    });
  });

  describe('Periodic Monitoring', () => {
    it('should start monitoring with interval', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(200 * 1024 * 1024);
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      storageMonitor.startMonitoring();

      // Fast-forward 5 minutes
      jest.advanceTimersByTime(5 * 60 * 1000);

      await Promise.resolve(); // Allow promises to resolve

      expect(mockLogger.info).toHaveBeenCalledWith(
        'StorageMonitor',
        'Monitoring started'
      );
    });

    it('should not start monitoring if already monitoring', () => {
      storageMonitor.startMonitoring();
      
      const firstCall = mockLogger.info.mock.calls.length;
      
      storageMonitor.startMonitoring(); // Try to start again

      expect(mockLogger.info).toHaveBeenCalledTimes(firstCall); // No additional call
    });

    it('should stop monitoring and clear interval', () => {
      storageMonitor.startMonitoring();
      storageMonitor.stopMonitoring();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'StorageMonitor',
        'Monitoring stopped'
      );
    });

    it('should handle stop monitoring when not monitoring', () => {
      storageMonitor.stopMonitoring(); // Already stopped

      // Should not crash or log anything
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        'StorageMonitor',
        'Monitoring stopped'
      );
    });

    it('should run periodic checks every 5 minutes', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(200 * 1024 * 1024);
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      storageMonitor.startMonitoring();

      // Clear initial call
      mockLogger.info.mockClear();

      // Advance 5 minutes
      jest.advanceTimersByTime(5 * 60 * 1000);
      await Promise.resolve();

      // Should have checked storage
      expect(mockFileSystem.getFreeDiskStorageAsync).toHaveBeenCalled();

      storageMonitor.stopMonitoring();
    });
  });

  describe('Initialization', () => {
    it('should initialize and start monitoring', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(200 * 1024 * 1024);
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      await storageMonitor.initialize();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'StorageMonitor',
        'Initialized'
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'StorageMonitor',
        'Monitoring started'
      );

      storageMonitor.stopMonitoring();
    });

    it('should check storage on initialization', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(200 * 1024 * 1024);
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      await storageMonitor.initialize();

      expect(mockFileSystem.getFreeDiskStorageAsync).toHaveBeenCalled();
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@travelmatch/last_storage_check',
        expect.any(String)
      );

      storageMonitor.stopMonitoring();
    });

    it('should handle initialization errors gracefully', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockRejectedValue(new Error('Init error'));

      await storageMonitor.initialize();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'StorageMonitor',
        'Failed to initialize',
        expect.any(Error)
      );

      storageMonitor.stopMonitoring();
    });
  });

  describe('Warning System', () => {
    it('should warn user when storage is LOW and not warned recently', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(75 * 1024 * 1024); // LOW
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);
      mockAsyncStorage.getItem.mockResolvedValue(null); // Not shown yet

      const shouldWarn = await storageMonitor.shouldWarnUser();

      expect(shouldWarn).toBe(true);
    });

    it('should warn user when storage is CRITICAL', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(30 * 1024 * 1024); // CRITICAL
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const shouldWarn = await storageMonitor.shouldWarnUser();

      expect(shouldWarn).toBe(true);
    });

    it('should not warn when storage is NORMAL', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(200 * 1024 * 1024); // NORMAL
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      const shouldWarn = await storageMonitor.shouldWarnUser();

      expect(shouldWarn).toBe(false);
    });

    it('should not warn if already shown this session', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(75 * 1024 * 1024); // LOW
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);
      mockAsyncStorage.getItem.mockResolvedValue('true'); // Already shown

      const shouldWarn = await storageMonitor.shouldWarnUser();

      expect(shouldWarn).toBe(false);
    });

    it('should respect 30 minute cooldown between warnings', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(75 * 1024 * 1024); // LOW
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      // Mark warning shown
      await storageMonitor.markWarningShown();

      // Immediately check again
      const shouldWarn = await storageMonitor.shouldWarnUser();

      expect(shouldWarn).toBe(false); // Cooldown active
    });

    it('should mark warning as shown', async () => {
      await storageMonitor.markWarningShown();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@travelmatch/storage_warning_shown',
        'true'
      );
    });

    it('should reset warning flag', async () => {
      await storageMonitor.resetWarningFlag();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        '@travelmatch/storage_warning_shown'
      );
    });

    it('should handle shouldWarnUser errors gracefully', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockRejectedValue(new Error('Error'));

      const shouldWarn = await storageMonitor.shouldWarnUser();

      expect(shouldWarn).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle markWarningShown errors', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await storageMonitor.markWarningShown();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'StorageMonitor',
        'Failed to mark warning shown',
        expect.any(Error)
      );
    });

    it('should handle resetWarningFlag errors', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      await storageMonitor.resetWarningFlag();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'StorageMonitor',
        'Failed to reset warning flag',
        expect.any(Error)
      );
    });
  });

  describe('Utility Functions', () => {
    it('should format bytes correctly', () => {
      expect(storageMonitor.formatBytes(0)).toBe('0 Bytes');
      expect(storageMonitor.formatBytes(1024)).toBe('1 KB');
      expect(storageMonitor.formatBytes(1024 * 1024)).toBe('1 MB');
      expect(storageMonitor.formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
      expect(storageMonitor.formatBytes(1536 * 1024)).toBe('1.5 MB');
    });

    it('should get storage stats string', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(250 * 1024 * 1024); // 250MB
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024); // 1GB

      const stats = await storageMonitor.getStorageStats();

      expect(stats).toContain('Storage Status:');
      expect(stats).toContain('Total: 1 GB');
      expect(stats).toContain('Free: 250 MB');
      expect(stats).toContain('Level: normal');
      expect(stats).toContain('Can Upload: Yes');
    });

    it('should handle getStorageStats errors', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockRejectedValue(new Error('Error'));

      const stats = await storageMonitor.getStorageStats();

      expect(stats).toBe('Failed to get storage stats');
    });

    it('should return unavailable message when no info', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockRejectedValue(new Error('Error'));

      const stats = await storageMonitor.getStorageStats();

      expect(stats).toContain('Failed to get storage stats');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup and stop monitoring', () => {
      storageMonitor.startMonitoring();
      storageMonitor.cleanup();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'StorageMonitor',
        'Monitoring stopped'
      );
    });

    it('should destroy service (alias for cleanup)', () => {
      storageMonitor.startMonitoring();
      storageMonitor.destroy();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'StorageMonitor',
        'Monitoring stopped'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle exact threshold values (100MB - LOW)', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(100 * 1024 * 1024); // Exactly 100MB
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      const info = await storageMonitor.getStorageInfo();

      expect(info?.level).toBe(StorageLevel.LOW); // <= 100MB is LOW
    });

    it('should handle exact threshold values (50MB - CRITICAL)', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(50 * 1024 * 1024); // Exactly 50MB
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      const info = await storageMonitor.getStorageInfo();

      expect(info?.level).toBe(StorageLevel.CRITICAL); // <= 50MB is CRITICAL
    });

    it('should handle 0 bytes free', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(0);
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      const info = await storageMonitor.getStorageInfo();

      expect(info?.level).toBe(StorageLevel.CRITICAL);
      expect(info?.canUpload).toBe(false);
      expect(info?.estimatedUploadsRemaining).toBe(0);
    });

    it('should handle very large storage values', async () => {
      const tenTB = 10 * 1024 * 1024 * 1024 * 1024; // 10TB
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(tenTB);
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(tenTB * 2);

      const info = await storageMonitor.getStorageInfo();

      expect(info?.level).toBe(StorageLevel.NORMAL);
      expect(info?.canUpload).toBe(true);
    });

    it('should handle concurrent getStorageInfo calls', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(200 * 1024 * 1024);
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      const [info1, info2, info3] = await Promise.all([
        storageMonitor.getStorageInfo(),
        storageMonitor.getStorageInfo(),
        storageMonitor.getStorageInfo(),
      ]);

      expect(info1?.level).toBe(StorageLevel.NORMAL);
      expect(info2?.level).toBe(StorageLevel.NORMAL);
      expect(info3?.level).toBe(StorageLevel.NORMAL);
    });

    it('should handle concurrent canUpload calls', async () => {
      mockFileSystem.getFreeDiskStorageAsync.mockResolvedValue(200 * 1024 * 1024);
      mockFileSystem.getTotalDiskCapacityAsync.mockResolvedValue(1000 * 1024 * 1024);

      const [result1, result2] = await Promise.all([
        storageMonitor.canUpload(10 * 1024 * 1024),
        storageMonitor.canUpload(20 * 1024 * 1024),
      ]);

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });
  });
});
