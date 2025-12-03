/**
 * Error Recovery Utilities
 * Comprehensive error handling and recovery strategies
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Retry options for network requests
 */
type RetryOptions = {
  maxRetries?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
};

/**
 * Fetch with automatic retry and exponential backoff
 * Use for critical network requests that should recover from temporary failures
 *
 * @example
 * const data = await fetchWithRetry(
 *   () => api.getTrips(),
 *   {
 *     maxRetries: 3,
 *     backoff: 'exponential',
 *     onRetry: (attempt) => showToast(`Retrying... (${attempt}/3)`, 'info')
 *   }
 * );
 */
export const fetchWithRetry = async <T>(
  fetcher: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> => {
  const {
    maxRetries = 3,
    backoff = 'exponential',
    onRetry,
    shouldRetry = () => true,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetcher();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry this error
      if (!shouldRetry(lastError)) {
        throw lastError;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Handle rate limiting (429) with Retry-After header
      // @ts-expect-error - response may exist on error object
      const status = lastError.status || lastError.response?.status;
      let delay: number;

      if (status === 429) {
        // Check for Retry-After header
        // @ts-expect-error - response headers may exist
        const retryAfter = lastError.response?.headers?.['retry-after'];

        if (retryAfter) {
          // Retry-After can be in seconds or HTTP date
          const retryAfterNum = parseInt(retryAfter, 10);
          delay = isNaN(retryAfterNum)
            ? 60000 // Default 60s if date format
            : retryAfterNum * 1000;

          console.log(
            `Rate limited. Waiting ${delay / 1000}s as per Retry-After header`,
          );
        } else {
          // No Retry-After header, use exponential backoff
          delay = Math.pow(2, attempt) * 1000;
        }
      } else {
        // Standard backoff for other errors
        delay =
          backoff === 'exponential'
            ? Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
            : (attempt + 1) * 1000; // 1s, 2s, 3s
      }

      // Notify about retry
      onRetry?.(attempt + 1, lastError);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

/**
 * Check if error is network-related
 */
export const isNetworkError = (error: Error): boolean => {
  const message = error.message?.toLowerCase() || '';
  return (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('fetch') ||
    message.includes('enotfound') ||
    message.includes('econnrefused')
  );
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: Error): boolean => {
  // Network errors are retryable
  if (isNetworkError(error)) return true;

  // 5xx server errors are retryable
  // @ts-expect-error - status may exist on error object
  const status = error.status || error.statusCode;
  if (status >= 500 && status < 600) return true;

  // 429 Too Many Requests is retryable
  if (status === 429) return true;

  return false;
};

/**
 * App state backup key
 */
const APP_STATE_BACKUP_KEY = '@app_state_backup';

/**
 * App state structure
 */
type AppStateBackup = {
  timestamp: number;
  version: string;
  state: Record<string, unknown>;
};

/**
 * Persist app state for crash recovery
 * Call this periodically or on critical state changes
 *
 * @example
 * useEffect(() => {
 *   persistAppState({ user, settings, drafts });
 * }, [user, settings, drafts]);
 */
export const persistAppState = async (
  state: Record<string, unknown>,
): Promise<void> => {
  try {
    const backup: AppStateBackup = {
      timestamp: Date.now(),
      version: '1.0', // App version for migration support
      state,
    };

    await AsyncStorage.setItem(APP_STATE_BACKUP_KEY, JSON.stringify(backup));
  } catch (error) {
    console.error('Failed to persist app state:', error);
  }
};

/**
 * Recover app state after crash or reload
 * Returns null if no valid backup exists or backup is too old
 *
 * @param maxAge - Maximum age of backup in milliseconds (default: 1 hour)
 *
 * @example
 * const recoveredState = await recoverAppState();
 * if (recoveredState) {
 *   restoreState(recoveredState);
 *   showToast('Your work has been restored', 'success');
 * }
 */
export const recoverAppState = async (
  maxAge = 60 * 60 * 1000, // 1 hour
): Promise<Record<string, unknown> | null> => {
  try {
    const backupStr = await AsyncStorage.getItem(APP_STATE_BACKUP_KEY);
    if (!backupStr) return null;

    const backup: AppStateBackup = JSON.parse(backupStr);

    // Check if backup is too old
    const age = Date.now() - backup.timestamp;
    if (age > maxAge) {
      // Clear old backup
      await clearAppStateBackup();
      return null;
    }

    // Return recovered state
    return backup.state;
  } catch (error) {
    console.error('Failed to recover app state:', error);
    return null;
  }
};

/**
 * Clear app state backup
 */
export const clearAppStateBackup = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(APP_STATE_BACKUP_KEY);
  } catch (error) {
    console.error('Failed to clear app state backup:', error);
  }
};

/**
 * Check if backup exists
 */
export const hasAppStateBackup = async (): Promise<boolean> => {
  try {
    const backup = await AsyncStorage.getItem(APP_STATE_BACKUP_KEY);
    return backup !== null;
  } catch {
    return false;
  }
};

/**
 * Network queue for offline operations
 */
type QueuedOperation = {
  id: string;
  operation: () => Promise<unknown>;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
};

class NetworkQueueClass {
  private queue: QueuedOperation[] = [];
  private isProcessing = false;

  /**
   * Add operation to queue
   */
  add = (
    operation: () => Promise<unknown>,
    options: { id?: string; maxRetries?: number } = {},
  ): string => {
    const id = options.id || `op_${Date.now()}_${Math.random()}`;

    this.queue.push({
      id,
      operation,
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      createdAt: Date.now(),
    });

    this.process();

    return id;
  };

  /**
   * Process queue
   */
  private process = async (): Promise<void> => {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const op = this.queue[0];

      try {
        await op.operation();
        // Success - remove from queue
        this.queue.shift();
      } catch (error) {
        op.retryCount++;

        if (op.retryCount >= op.maxRetries) {
          // Max retries exceeded - remove from queue
          console.error('Operation failed after max retries:', op.id, error);
          this.queue.shift();
        } else {
          // Will retry later
          console.warn('Operation failed, will retry:', op.id, error);
          break;
        }
      }
    }

    this.isProcessing = false;
  };

  /**
   * Get queue length
   */
  getLength = (): number => {
    return this.queue.length;
  };

  /**
   * Clear queue
   */
  clear = (): void => {
    this.queue = [];
  };
}

export const NetworkQueue = new NetworkQueueClass();

/**
 * Safe async operation wrapper
 * Catches errors and provides default value
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  defaultValue: T,
  onError?: (error: Error) => void,
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    onError?.(error as Error);
    return defaultValue;
  }
};
