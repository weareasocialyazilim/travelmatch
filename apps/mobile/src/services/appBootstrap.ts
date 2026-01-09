/**
 * AppBootstrap Service
 *
 * Centralized, robust app initialization with:
 * - Graceful degradation (app works even if some services fail)
 * - Progress tracking for user feedback
 * - Retry logic with exponential backoff
 * - Service health monitoring
 * - Proper error handling and logging
 */

import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { logger } from '../utils/logger';
import { migrateSensitiveDataToSecure } from '../utils/secureStorage';
import { validateEnvironment, env } from '../config/env.config';
import { initializeFeatureFlags } from '../config/featureFlags';
import { fetchAppConfig, type AppConfig } from './appConfigService';

// Services
import { analytics } from './analytics';
import { cacheService } from './cacheService';
import { sessionManager } from './sessionManager';
import { pendingTransactionsService } from './pendingTransactionsService';
import { storageMonitor } from './storageMonitor';

// Types
export type ServiceName =
  | 'appConfig'
  | 'environment'
  | 'security'
  | 'session'
  | 'cache'
  | 'analytics'
  | 'featureFlags'
  | 'messaging'
  | 'storage'
  | 'pendingTransactions';

export type ServiceStatus =
  | 'pending'
  | 'loading'
  | 'success'
  | 'failed'
  | 'skipped';

export interface ServiceState {
  name: ServiceName;
  displayName: string;
  status: ServiceStatus;
  error?: string;
  critical: boolean; // If true, app cannot function without this service
  retryCount: number;
}

export interface BootstrapProgress {
  currentStep: number;
  totalSteps: number;
  currentService: ServiceName | null;
  services: Map<ServiceName, ServiceState>;
  isComplete: boolean;
  canContinue: boolean; // True if all critical services loaded
}

export type ProgressCallback = (progress: BootstrapProgress) => void;

// Configuration
const SERVICE_CONFIG: Record<
  ServiceName,
  { displayName: string; critical: boolean; maxRetries: number }
> = {
  appConfig: { displayName: 'App Config', critical: true, maxRetries: 2 },
  environment: { displayName: 'Environment', critical: true, maxRetries: 0 },
  security: { displayName: 'Security Check', critical: false, maxRetries: 1 },
  session: { displayName: 'Session', critical: false, maxRetries: 2 },
  cache: { displayName: 'Cache', critical: false, maxRetries: 1 },
  analytics: { displayName: 'Analytics', critical: false, maxRetries: 1 },
  featureFlags: { displayName: 'Features', critical: false, maxRetries: 2 },
  messaging: { displayName: 'Messaging', critical: false, maxRetries: 0 },
  storage: { displayName: 'Storage', critical: false, maxRetries: 0 },
  pendingTransactions: {
    displayName: 'Recovery Check',
    critical: false,
    maxRetries: 1,
  },
};

const INIT_ORDER: ServiceName[] = [
  'appConfig',
  'environment',
  'security',
  'session',
  'cache',
  'analytics',
  'featureFlags',
  'messaging',
  'storage',
  'pendingTransactions',
];

const DEFAULT_TIMEOUT = 8000; // 8 seconds per service

class AppBootstrapService {
  private services: Map<ServiceName, ServiceState> = new Map();
  private progressCallback: ProgressCallback | null = null;
  private isInitialized = false;
  private appConfig: AppConfig | null = null;
  private pendingTransactionsResult: {
    hasPayments: boolean;
    hasUploads: boolean;
  } | null = null;

  constructor() {
    this.initializeServiceStates();
  }

  private initializeServiceStates(): void {
    INIT_ORDER.forEach((name) => {
      const config = SERVICE_CONFIG[name];
      this.services.set(name, {
        name,
        displayName: config.displayName,
        status: 'pending',
        critical: config.critical,
        retryCount: 0,
      });
    });
  }

  /**
   * Set progress callback for UI updates
   */
  public onProgress(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  /**
   * Get current bootstrap progress
   */
  public getProgress(): BootstrapProgress {
    const loadingService = Array.from(this.services.values()).find(
      (s) => s.status === 'loading',
    );
    const completedCount = Array.from(this.services.values()).filter(
      (s) =>
        s.status === 'success' ||
        s.status === 'failed' ||
        s.status === 'skipped',
    ).length;

    const criticalFailed = Array.from(this.services.values()).some(
      (s) => s.critical && s.status === 'failed',
    );

    return {
      currentStep: completedCount,
      totalSteps: this.services.size,
      currentService: loadingService?.name ?? null,
      services: new Map(this.services),
      isComplete: completedCount === this.services.size,
      canContinue: !criticalFailed,
    };
  }

  private notifyProgress(): void {
    if (this.progressCallback) {
      this.progressCallback(this.getProgress());
    }
  }

  private updateServiceStatus(
    name: ServiceName,
    status: ServiceStatus,
    error?: string,
  ): void {
    const service = this.services.get(name);
    if (service) {
      service.status = status;
      if (error) service.error = error;
      this.notifyProgress();
    }
  }

  /**
   * Execute a service initialization with timeout and retry
   */
  private async executeWithRetry<T>(
    serviceName: ServiceName,
    fn: () => Promise<T>,
    timeoutMs: number = DEFAULT_TIMEOUT,
  ): Promise<T | null> {
    const config = SERVICE_CONFIG[serviceName];
    const service = this.services.get(serviceName)!;

    while (service.retryCount <= config.maxRetries) {
      this.updateServiceStatus(serviceName, 'loading');

      try {
        const result = await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeoutMs),
          ),
        ]);

        this.updateServiceStatus(serviceName, 'success');
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        service.retryCount++;

        if (service.retryCount > config.maxRetries) {
          logger.error(
            'AppBootstrap',
            `${serviceName} failed after ${config.maxRetries} retries`,
            { error: errorMessage },
          );
          this.updateServiceStatus(serviceName, 'failed', errorMessage);
          return null;
        }

        // Exponential backoff before retry
        const backoffMs = Math.min(
          1000 * Math.pow(2, service.retryCount - 1),
          4000,
        );
        logger.warn(
          'AppBootstrap',
          `${serviceName} failed, retrying in ${backoffMs}ms (attempt ${service.retryCount}/${config.maxRetries})`,
          { error: errorMessage },
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    return null;
  }

  /**
   * Initialize all app services
   */
  public async initialize(): Promise<BootstrapProgress> {
    if (this.isInitialized) {
      logger.warn(
        'AppBootstrap',
        'Already initialized, returning cached state',
      );
      return this.getProgress();
    }

    logger.info('AppBootstrap', '🚀 Starting app initialization...');
    const startTime = Date.now();

    // 1. App Config Check (maintenance mode & version check)
    await this.executeWithRetry('appConfig', async () => {
      this.appConfig = await fetchAppConfig();

      if (this.appConfig.isMaintenanceMode) {
        logger.warn('AppBootstrap', '🔧 App is in maintenance mode');
      }

      if (this.appConfig.forceUpdate) {
        logger.warn('AppBootstrap', '📱 Force update required', {
          current: this.appConfig.currentVersion,
          required: this.appConfig.minRequiredVersion,
        });
      }

      logger.info('AppBootstrap', '✅ App config loaded');
      return this.appConfig;
    });

    // 2. Environment Validation (critical in production, warning in dev)
    const envResult = validateEnvironment();

    if (!envResult.isValid) {
      // In production, environment errors are critical
      const errorMessage = envResult.errors.join(', ');
      this.updateServiceStatus('environment', 'failed', errorMessage);
      logger.error(
        'AppBootstrap',
        '🚨 Environment validation failed - app cannot continue',
        { errors: envResult.errors },
      );
      return this.getProgress();
    } else if (envResult.warnings.length > 0) {
      // Warnings don't block but are logged
      this.updateServiceStatus('environment', 'success');
      logger.warn('AppBootstrap', '⚠️ Environment has warnings', {
        warnings: envResult.warnings,
      });
    } else {
      this.updateServiceStatus('environment', 'success');
      logger.info('AppBootstrap', '✅ Environment validated');
    }

    // 3. Security Check (non-critical)
    await this.executeWithRetry('security', async () => {
      const isRooted = await Device.isRootedExperimentalAsync();
      if (isRooted) {
        logger.warn('AppBootstrap', '⚠️ Device is rooted/jailbroken');
      }
      await migrateSensitiveDataToSecure();
      logger.info('AppBootstrap', '✅ Security check completed');
    });

    // 4. Session Initialization (non-critical but important)
    await this.executeWithRetry('session', async () => {
      const sessionState = await sessionManager.initialize();
      logger.info('AppBootstrap', `✅ Session initialized: ${sessionState}`);

      if (sessionState === 'expired') {
        const isValid = await sessionManager.isSessionValid();
        if (!isValid) {
          logger.warn('AppBootstrap', 'Session expired, user needs re-login');
        }
      }
      return sessionState;
    });

    // 4. Cache Service (non-critical)
    await this.executeWithRetry('cache', async () => {
      await cacheService.initialize();
      logger.info('AppBootstrap', '✅ Cache service initialized');
    });

    // 5. Analytics (non-critical)
    await this.executeWithRetry('analytics', async () => {
      await analytics.init();
      analytics.setUserProperties({
        platform: Platform.OS,
        device_model: Device.modelName || 'unknown',
        os_version: String(Platform.Version),
        app_version: '1.0.0',
        app_env: env.APP_ENV,
      });
      logger.info('AppBootstrap', '✅ Analytics initialized');
    });

    // 6. Feature Flags (non-critical)
    await this.executeWithRetry('featureFlags', async () => {
      await initializeFeatureFlags('user-123');
      logger.info('AppBootstrap', '✅ Feature flags initialized');
    });

    // 7. Messaging Service (non-critical, sync init)
    try {
      this.updateServiceStatus('messaging', 'loading');
      // MessageService is ready to use, no explicit init needed
      this.updateServiceStatus('messaging', 'success');
      logger.info('AppBootstrap', '✅ Messaging service ready');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.updateServiceStatus('messaging', 'failed', errorMessage);
    }

    // 8. Storage Monitor (non-critical, sync init)
    try {
      this.updateServiceStatus('storage', 'loading');
      storageMonitor.initialize();
      this.updateServiceStatus('storage', 'success');
      logger.info('AppBootstrap', '✅ Storage monitor initialized');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.updateServiceStatus('storage', 'failed', errorMessage);
    }

    // 9. Pending Transactions Recovery (non-critical)
    this.pendingTransactionsResult = await this.executeWithRetry(
      'pendingTransactions',
      async () => {
        const result = await pendingTransactionsService.checkPendingOnStartup();
        if (result.hasPayments || result.hasUploads) {
          logger.info(
            'AppBootstrap',
            `📋 Found pending: payments=${result.hasPayments}, uploads=${result.hasUploads}`,
          );
        }
        return result;
      },
    );

    this.isInitialized = true;
    const duration = Date.now() - startTime;
    const progress = this.getProgress();

    // Log summary
    const successful = Array.from(this.services.values()).filter(
      (s) => s.status === 'success',
    ).length;
    const failed = Array.from(this.services.values()).filter(
      (s) => s.status === 'failed',
    ).length;

    logger.info('AppBootstrap', `🏁 Initialization complete in ${duration}ms`, {
      successful,
      failed,
      canContinue: progress.canContinue,
    });

    return progress;
  }

  /**
   * Get pending transactions result (available after initialization)
   */
  public getPendingTransactionsResult(): {
    hasPayments: boolean;
    hasUploads: boolean;
  } | null {
    return this.pendingTransactionsResult;
  }

  /**
   * Get service health status
   */
  public getServiceHealth(): Record<
    ServiceName,
    { healthy: boolean; error?: string }
  > {
    const health: Record<string, { healthy: boolean; error?: string }> = {};
    this.services.forEach((service, name) => {
      health[name] = {
        healthy: service.status === 'success',
        error: service.error,
      };
    });
    return health as Record<ServiceName, { healthy: boolean; error?: string }>;
  }

  /**
   * Retry a specific failed service
   */
  public async retryService(serviceName: ServiceName): Promise<boolean> {
    const service = this.services.get(serviceName);
    if (!service || service.status !== 'failed') {
      return false;
    }

    service.retryCount = 0;
    service.status = 'pending';
    service.error = undefined;

    // Re-run initialization for this specific service
    // This is a simplified version - in production you'd have service-specific init functions
    logger.info('AppBootstrap', `🔄 Retrying ${serviceName}...`);

    switch (serviceName) {
      case 'analytics':
        return (
          (await this.executeWithRetry('analytics', () => analytics.init())) !==
          null
        );
      case 'featureFlags':
        return (
          (await this.executeWithRetry('featureFlags', () =>
            initializeFeatureFlags('user-123'),
          )) !== null
        );
      case 'cache':
        return (
          (await this.executeWithRetry('cache', () =>
            cacheService.initialize(),
          )) !== null
        );
      default:
        logger.warn('AppBootstrap', `Retry not supported for ${serviceName}`);
        return false;
    }
  }

  /**
   * Get app config (maintenance mode, version check)
   */
  public getAppConfig(): AppConfig | null {
    return this.appConfig;
  }

  /**
   * Check if app is in maintenance mode
   */
  public isMaintenanceMode(): boolean {
    return this.appConfig?.isMaintenanceMode ?? false;
  }

  /**
   * Check if force update is required
   */
  public requiresForceUpdate(): boolean {
    return this.appConfig?.forceUpdate ?? false;
  }

  /**
   * Cleanup on app shutdown
   */
  public cleanup(): void {
    logger.info('AppBootstrap', 'Cleaning up services...');
    cacheService.destroy();
    storageMonitor.destroy();
  }
}

// Singleton export
export const appBootstrap = new AppBootstrapService();
