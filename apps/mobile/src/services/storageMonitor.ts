/**
 * Storage Monitor Service
 * 
 * Monitors device storage capacity and warns about low storage conditions.
 * Helps prevent upload failures and app crashes due to insufficient storage.
 */

import * as FileSystem from 'expo-file-system';
import { logger } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage thresholds (in bytes)
const LOW_STORAGE_THRESHOLD = 100 * 1024 * 1024; // 100MB
const CRITICAL_STORAGE_THRESHOLD = 50 * 1024 * 1024; // 50MB

// Storage check interval (5 minutes)
const STORAGE_CHECK_INTERVAL = 5 * 60 * 1000;

// Storage keys
const LAST_STORAGE_CHECK_KEY = '@travelmatch/last_storage_check';
const STORAGE_WARNING_SHOWN_KEY = '@travelmatch/storage_warning_shown';

export enum StorageLevel {
  NORMAL = 'normal',
  LOW = 'low',
  CRITICAL = 'critical',
}

export interface StorageInfo {
  totalSpace: number;
  freeSpace: number;
  usedSpace: number;
  freePercentage: number;
  level: StorageLevel;
  canUpload: boolean;
  estimatedUploadsRemaining: number; // Approximate number of 5MB files
}

class StorageMonitorService {
  private checkInterval: NodeJS.Timeout | null = null;
  private lastWarningTime: number = 0;
  private readonly WARNING_COOLDOWN = 30 * 60 * 1000; // 30 minutes

  /**
   * Initialize storage monitoring
   */
  async initialize(): Promise<void> {
    try {
      // Check on startup
      await this.checkStorage();
      
      // Setup periodic checks
      this.startMonitoring();
      
      logger.info('StorageMonitor', 'Initialized');
    } catch (error) {
      logger.error('StorageMonitor', 'Failed to initialize', error);
    }
  }

  /**
   * Start periodic storage monitoring
   */
  startMonitoring(): void {
    if (this.checkInterval) {
      return; // Already monitoring
    }

    this.checkInterval = setInterval(async () => {
      await this.checkStorage();
    }, STORAGE_CHECK_INTERVAL);

    logger.info('StorageMonitor', 'Monitoring started');
  }

  /**
   * Stop storage monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('StorageMonitor', 'Monitoring stopped');
    }
  }

  /**
   * Get current storage information
   */
  async getStorageInfo(): Promise<StorageInfo | null> {
    try {
      const diskInfo = await FileSystem.getFreeDiskStorageAsync();
      const totalInfo = await FileSystem.getTotalDiskCapacityAsync();
      
      const freeSpace = diskInfo;
      const totalSpace = totalInfo;
      const usedSpace = totalSpace - freeSpace;
      const freePercentage = (freeSpace / totalSpace) * 100;
      
      // Determine storage level
      let level: StorageLevel;
      if (freeSpace <= CRITICAL_STORAGE_THRESHOLD) {
        level = StorageLevel.CRITICAL;
      } else if (freeSpace <= LOW_STORAGE_THRESHOLD) {
        level = StorageLevel.LOW;
      } else {
        level = StorageLevel.NORMAL;
      }
      
      // Estimate uploads remaining (assuming 5MB average per upload)
      const estimatedUploadsRemaining = Math.floor(freeSpace / (5 * 1024 * 1024));
      
      // Can upload if not critical
      const canUpload = level !== StorageLevel.CRITICAL;
      
      return {
        totalSpace,
        freeSpace,
        usedSpace,
        freePercentage,
        level,
        canUpload,
        estimatedUploadsRemaining,
      };
    } catch (error) {
      logger.error('StorageMonitor', 'Failed to get storage info', error);
      return null;
    }
  }

  /**
   * Check storage and log warnings
   */
  async checkStorage(): Promise<StorageInfo | null> {
    try {
      const storageInfo = await this.getStorageInfo();
      
      if (!storageInfo) {
        return null;
      }
      
      // Log storage info
      await AsyncStorage.setItem(LAST_STORAGE_CHECK_KEY, Date.now().toString());
      
      // Log based on level
      if (storageInfo.level === StorageLevel.CRITICAL) {
        logger.error('StorageMonitor', 'CRITICAL: Storage critically low', {
          freeSpace: this.formatBytes(storageInfo.freeSpace),
          freePercentage: storageInfo.freePercentage.toFixed(1),
          estimatedUploads: storageInfo.estimatedUploadsRemaining,
        });
      } else if (storageInfo.level === StorageLevel.LOW) {
        logger.warn('StorageMonitor', 'WARNING: Storage running low', {
          freeSpace: this.formatBytes(storageInfo.freeSpace),
          freePercentage: storageInfo.freePercentage.toFixed(1),
          estimatedUploads: storageInfo.estimatedUploadsRemaining,
        });
      } else {
        logger.info('StorageMonitor', 'Storage check OK', {
          freeSpace: this.formatBytes(storageInfo.freeSpace),
          freePercentage: storageInfo.freePercentage.toFixed(1),
        });
      }
      
      return storageInfo;
    } catch (error) {
      logger.error('StorageMonitor', 'Storage check failed', error);
      return null;
    }
  }

  /**
   * Check if upload is allowed based on storage
   */
  async canUpload(fileSize: number): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const storageInfo = await this.getStorageInfo();
      
      if (!storageInfo) {
        // If we can't check, allow but log warning
        logger.warn('StorageMonitor', 'Cannot verify storage, allowing upload');
        return { allowed: true };
      }
      
      // Check if file would fit
      const requiredSpace = fileSize * 1.5; // 1.5x buffer for processing
      
      if (storageInfo.freeSpace < requiredSpace) {
        logger.error('StorageMonitor', 'Upload blocked: Insufficient storage', {
          fileSize: this.formatBytes(fileSize),
          freeSpace: this.formatBytes(storageInfo.freeSpace),
          required: this.formatBytes(requiredSpace),
        });
        
        return {
          allowed: false,
          reason: `Insufficient storage. Need ${this.formatBytes(requiredSpace)}, have ${this.formatBytes(storageInfo.freeSpace)}`,
        };
      }
      
      // Warn if low but allow
      if (storageInfo.level !== StorageLevel.NORMAL) {
        logger.warn('StorageMonitor', 'Upload allowed but storage is low', {
          level: storageInfo.level,
          freeSpace: this.formatBytes(storageInfo.freeSpace),
        });
      }
      
      return { allowed: true };
    } catch (error) {
      logger.error('StorageMonitor', 'Failed to check upload permission', error);
      return { allowed: true }; // Allow on error, but logged
    }
  }

  /**
   * Check if user should be warned about storage
   */
  async shouldWarnUser(): Promise<boolean> {
    try {
      const storageInfo = await this.getStorageInfo();
      
      if (!storageInfo || storageInfo.level === StorageLevel.NORMAL) {
        return false;
      }
      
      // Check cooldown
      const now = Date.now();
      if (now - this.lastWarningTime < this.WARNING_COOLDOWN) {
        return false; // Already warned recently
      }
      
      // Check if already shown this session
      const shown = await AsyncStorage.getItem(STORAGE_WARNING_SHOWN_KEY);
      if (shown === 'true') {
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('StorageMonitor', 'Failed to check warning status', error);
      return false;
    }
  }

  /**
   * Mark storage warning as shown
   */
  async markWarningShown(): Promise<void> {
    try {
      this.lastWarningTime = Date.now();
      await AsyncStorage.setItem(STORAGE_WARNING_SHOWN_KEY, 'true');
    } catch (error) {
      logger.error('StorageMonitor', 'Failed to mark warning shown', error);
    }
  }

  /**
   * Reset warning flag (e.g., on app restart)
   */
  async resetWarningFlag(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_WARNING_SHOWN_KEY);
    } catch (error) {
      logger.error('StorageMonitor', 'Failed to reset warning flag', error);
    }
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get storage statistics for debugging
   */
  async getStorageStats(): Promise<string> {
    try {
      const info = await this.getStorageInfo();
      
      if (!info) {
        return 'Storage info unavailable';
      }
      
      return `
Storage Status:
- Total: ${this.formatBytes(info.totalSpace)}
- Used: ${this.formatBytes(info.usedSpace)}
- Free: ${this.formatBytes(info.freeSpace)} (${info.freePercentage.toFixed(1)}%)
- Level: ${info.level}
- Can Upload: ${info.canUpload ? 'Yes' : 'No'}
- Est. Uploads: ~${info.estimatedUploadsRemaining} files
      `.trim();
    } catch (error) {
      return 'Failed to get storage stats';
    }
  }

  /**
   * Cleanup (call on app unmount)
   */
  cleanup(): void {
    this.stopMonitoring();
  }

  /**
   * Destroy service (alias for cleanup)
   */
  destroy(): void {
    this.cleanup();
  }
}

export const storageMonitor = new StorageMonitorService();
