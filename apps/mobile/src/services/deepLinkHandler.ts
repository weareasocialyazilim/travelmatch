/**
 * Unified Deep Link Handler
 *
 * Complete deep link infrastructure with:
 * - Zod validation for all link params
 * - 404/410 expired link handling
 * - Fallback screens for invalid links
 * - Type-safe link generation
 *
 * Supported paths:
 * - profile/:userId
 * - moment/:momentId
 * - gift/:giftId
 * - chat/:conversationId
 * - request/:requestId
 */

import { z } from 'zod';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationContainerRef } from '@react-navigation/native';
// NOTE: Using inline type to avoid circular dependency with AppNavigator
// AppNavigator imports deepLinkHandler, so we can't import RootStackParamList from there
type DeepLinkNavigator = NavigationContainerRef<Record<string, unknown>>;
import { logger } from '../utils/logger';
import { sessionManager } from '../services/sessionManager';

// P2 FIX: AsyncStorage key for persisted deep link queue
const DEEP_LINK_QUEUE_KEY = '@deep_link_queue';

/**
 * Queued deep link entry with metadata
 */
interface QueuedDeepLink {
  url: string;
  options?: ValidationOptions;
  queuedAt: string; // ISO timestamp for ordering
}

/**
 * Deep link types
 */
export enum DeepLinkType {
  PROFILE = 'profile',
  MOMENT = 'moment',
  GIFT = 'gift',
  CHAT = 'chat',
  REQUEST = 'request',
  NOTIFICATION = 'notification',
  SETTINGS = 'settings',
}

/**
 * Zod schemas for validation
 */
const UUIDSchema = z.string().uuid('ID geçersiz format');

const DeepLinkSchemas = {
  profile: z.object({
    userId: UUIDSchema,
  }),
  moment: z.object({
    momentId: UUIDSchema,
  }),
  gift: z.object({
    giftId: UUIDSchema,
  }),
  chat: z.object({
    conversationId: UUIDSchema,
  }),
  request: z.object({
    requestId: UUIDSchema,
  }),
};

/**
 * Validation result
 */
type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Deep link error types
 */
export enum DeepLinkError {
  INVALID_URL = 'INVALID_URL',
  INVALID_PARAMS = 'INVALID_PARAMS',
  NOT_FOUND = 'NOT_FOUND',
  EXPIRED = 'EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Deep link result
 */
export interface DeepLinkResult {
  success: boolean;
  type?: DeepLinkType;
  screen?: string;
  params?: Record<string, string | number | boolean>;
  error?: {
    code: DeepLinkError;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Parsed deep link
 */
interface ParsedDeepLink {
  type: DeepLinkType | null;
  rawPath: string;
  pathSegments: string[];
  params: Record<string, string>;
  queryParams: Record<string, string>;
}

/**
 * Link validation options
 */
interface ValidationOptions {
  /** Check if resource exists in backend */
  checkExists?: boolean;
  /** Check if user has access */
  checkAuth?: boolean;
}

/**
 * Deep Link Handler Class
 */
class DeepLinkHandler {
  private navigation: NavigationContainerRef<any> | null = null;
  // P2 FIX: Queue deep links when navigation not ready (now persisted)
  private linkQueue: QueuedDeepLink[] = [];
  private isInitialized = false;

  /**
   * Set navigation reference
   */
  async setNavigation(nav: NavigationContainerRef<any>) {
    this.navigation = nav;
    this.isInitialized = true;

    // P2 FIX: Restore persisted queue first
    await this.restoreQueue();

    // P2 FIX: Process queued deep links after navigation is ready
    if (this.linkQueue.length > 0) {
      logger.info('[DeepLink] Processing queued links:', this.linkQueue.length);
      const queueToProcess = [...this.linkQueue];
      this.linkQueue = [];

      // Process all queued links
      for (const { url, options } of queueToProcess) {
        await this.handleDeepLink(url, options);
      }

      // Clear persisted queue after processing
      await this.clearPersistedQueue();
    }
  }

  /**
   * P2 FIX: Queue deep link for later processing if navigation not ready
   */
  private canProcessLink(): boolean {
    return !!(this.navigation && this.navigation.isReady());
  }

  /**
   * P2 FIX: Queue or process deep link with AsyncStorage persistence
   */
  private queueOrProcess(url: string, options?: ValidationOptions): boolean {
    if (!this.navigation || !this.navigation.isReady()) {
      logger.warn('[DeepLink] Navigation not ready, queuing link');
      const entry: QueuedDeepLink = {
        url,
        options,
        queuedAt: new Date().toISOString(),
      };
      this.linkQueue.push(entry);
      this.persistQueue();
      return false;
    }
    return true;
  }

  /**
   * P2 FIX: Persist queue to AsyncStorage for app restart recovery
   */
  private async persistQueue(): Promise<void> {
    try {
      const queueData = JSON.stringify(this.linkQueue);
      await AsyncStorage.setItem(DEEP_LINK_QUEUE_KEY, queueData);
      logger.debug('[DeepLink] Queue persisted:', this.linkQueue.length);
    } catch (error) {
      logger.warn('[DeepLink] Failed to persist queue:', error);
    }
  }

  /**
   * P2 FIX: Restore queue from AsyncStorage on app start
   */
  async restoreQueue(): Promise<void> {
    try {
      const storedQueue = await AsyncStorage.getItem(DEEP_LINK_QUEUE_KEY);
      if (storedQueue) {
        const parsed: QueuedDeepLink[] = JSON.parse(storedQueue);
        // Filter out stale entries (older than 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const validEntries = parsed.filter((entry) => entry.queuedAt > oneDayAgo);

        if (validEntries.length > 0) {
          logger.info('[DeepLink] Restored queued links:', validEntries.length);
          this.linkQueue = validEntries;
        }
      }
    } catch (error) {
      logger.warn('[DeepLink] Failed to restore queue:', error);
    }
  }

  /**
   * P2 FIX: Clear persisted queue after processing
   */
  private async clearPersistedQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DEEP_LINK_QUEUE_KEY);
      logger.debug('[DeepLink] Persisted queue cleared');
    } catch (error) {
      logger.warn('[DeepLink] Failed to clear persisted queue:', error);
    }
  }

  /**
   * Parse deep link URL
   */
  private parseURL(url: string): ParsedDeepLink {
    try {
      // Normalize URL
      const normalizedURL = url
        .replace(/^lovendo:\/\//, 'https://www.lovendo.xyz/')
        .replace(/^lovendo:\/\//, 'https://www.lovendo.xyz/')
        .replace(
          /^https:\/\/(www\.)?lovendo\.xyz\//,
          'https://www.lovendo.xyz/',
        )
        .replace(
          /^https:\/\/(www\.)?lovendo\.app\//,
          'https://www.lovendo.xyz/',
        );

      const urlObj = new URL(normalizedURL);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);

      // Extract query params
      const queryParams: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });

      // Determine type from first segment
      const typeMap: Record<string, DeepLinkType> = {
        profile: DeepLinkType.PROFILE,
        p: DeepLinkType.PROFILE,
        moment: DeepLinkType.MOMENT,
        m: DeepLinkType.MOMENT,
        gift: DeepLinkType.GIFT,
        g: DeepLinkType.GIFT,
        chat: DeepLinkType.CHAT,
        c: DeepLinkType.CHAT,
        request: DeepLinkType.REQUEST,
        r: DeepLinkType.REQUEST,
        notifications: DeepLinkType.NOTIFICATION,
        settings: DeepLinkType.SETTINGS,
      };

      const type = pathSegments[0]
        ? typeMap[pathSegments[0].toLowerCase()] || null
        : null;

      // Extract params based on type
      const params: Record<string, string> = {};

      if (type && pathSegments.length > 1) {
        switch (type) {
          case DeepLinkType.PROFILE:
            if (pathSegments[1]) params.userId = pathSegments[1];
            break;
          case DeepLinkType.MOMENT:
            if (pathSegments[1]) params.momentId = pathSegments[1];
            break;
          case DeepLinkType.GIFT:
            if (pathSegments[1]) params.giftId = pathSegments[1];
            break;
          case DeepLinkType.CHAT:
            if (pathSegments[1]) params.conversationId = pathSegments[1];
            break;
          case DeepLinkType.REQUEST:
            if (pathSegments[1]) params.requestId = pathSegments[1];
            break;
        }
      }

      return {
        type,
        rawPath: urlObj.pathname,
        pathSegments,
        params,
        queryParams,
      };
    } catch (error) {
      logger.error('[DeepLink] Parse error:', error);
      return {
        type: null,
        rawPath: '',
        pathSegments: [],
        params: {},
        queryParams: {},
      };
    }
  }

  /**
   * Validate deep link params with Zod
   */
  private validateParams<T>(
    type: DeepLinkType,
    params: Record<string, string>,
  ): ValidationResult<T> {
    try {
      const schema = DeepLinkSchemas[type as keyof typeof DeepLinkSchemas];

      // Types without schemas (notification, settings) are always valid
      if (!schema) {
        return {
          success: true,
          data: {} as T,
        };
      }

      const result = schema.safeParse(params);

      if (result.success) {
        return {
          success: true,
          data: result.data as T,
        };
      } else {
        const firstError = result.error.issues[0];
        const errorMessage = firstError?.message || 'Geçersiz parametreler';
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (_validationError) {
      return {
        success: false,
        error: 'Parametre doğrulama hatası',
      };
    }
  }

  /**
   * Check if resource exists (calls backend)
   */
  private async checkResourceExists(
    type: DeepLinkType,
    id: string,
  ): Promise<{
    exists: boolean;
    expired: boolean;
    statusCode?: number;
    networkError?: boolean;
  }> {
    try {
      // Get valid token
      const token = await sessionManager.getValidToken();

      if (!token) {
        // No auth - skip check for public resources
        return { exists: true, expired: false };
      }

      // Map type to API endpoint
      const endpointMap: Record<DeepLinkType, string> = {
        [DeepLinkType.PROFILE]: `/users/${id}`,
        [DeepLinkType.MOMENT]: `/moments/${id}`,
        [DeepLinkType.GIFT]: `/gifts/${id}`,
        [DeepLinkType.CHAT]: `/conversations/${id}`,
        [DeepLinkType.REQUEST]: `/requests/${id}`,
        [DeepLinkType.NOTIFICATION]: '',
        [DeepLinkType.SETTINGS]: '',
      };

      const endpoint = endpointMap[type];

      if (!endpoint) {
        // No endpoint to check (settings, notifications etc)
        return { exists: true, expired: false };
      }

      // Make HEAD request to check existence
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/api/v1${endpoint}`,
        {
          method: 'HEAD',
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
          },
        },
      );

      if (response.ok) {
        return { exists: true, expired: false, statusCode: response.status };
      } else if (response.status === 404) {
        return { exists: false, expired: false, statusCode: 404 };
      } else if (response.status === 410) {
        return { exists: false, expired: true, statusCode: 410 };
      } else if (response.status === 401 || response.status === 403) {
        return { exists: true, expired: false, statusCode: response.status };
      }

      return { exists: false, expired: false, statusCode: response.status };
    } catch (error) {
      logger.error('[DeepLink] Existence check failed:', error);
      // SECURITY: Fail closed on network errors
      return { exists: false, expired: false, networkError: true };
    }
  }

  /**
   * Main deep link handler
   * P2 FIX: Queue link if navigation not ready
   */
  async handleDeepLink(
    url: string,
    options: ValidationOptions = {},
  ): Promise<DeepLinkResult> {
    // P2 FIX: Queue if navigation not ready
    if (!this.queueOrProcess(url, options)) {
      return {
        success: true,
        queued: true,
        message: 'Link queued for processing',
      };
    }

    try {
      logger.info('[DeepLink] Handling:', url);

      // 1. Parse URL
      const parsed = this.parseURL(url);

      if (!parsed.type) {
        logger.warn('[DeepLink] Invalid URL format');
        return {
          success: false,
          error: {
            code: DeepLinkError.INVALID_URL,
            message: 'Link formatı geçersiz',
            details: { url, parsed },
          },
        };
      }

      // 2. Validate params with Zod
      const validation = this.validateParams(parsed.type, parsed.params);

      if (!validation.success) {
        logger.warn('[DeepLink] Validation failed:', validation.error);
        return {
          success: false,
          type: parsed.type,
          error: {
            code: DeepLinkError.INVALID_PARAMS,
            message: validation.error,
            details: { params: parsed.params },
          },
        };
      }

      // 3. Check if resource exists (optional)
      if (options.checkExists) {
        const resourceId = Object.values(parsed.params)[0];
        if (resourceId) {
          const existsCheck = await this.checkResourceExists(
            parsed.type,
            resourceId,
          );

          if (!existsCheck.exists) {
            if (existsCheck.expired) {
              logger.warn('[DeepLink] Resource expired');
              return {
                success: false,
                type: parsed.type,
                error: {
                  code: DeepLinkError.EXPIRED,
                  message: 'Bu linkin süresi dolmuş gibi görünüyor',
                  details: { statusCode: existsCheck.statusCode },
                },
              };
            } else {
              logger.warn('[DeepLink] Resource not found');
              return {
                success: false,
                type: parsed.type,
                error: {
                  code: DeepLinkError.NOT_FOUND,
                  message: 'İçerik bulunamadı',
                  details: { statusCode: existsCheck.statusCode },
                },
              };
            }
          }

          // Check auth
          if (
            existsCheck.statusCode === 401 ||
            existsCheck.statusCode === 403
          ) {
            return {
              success: false,
              type: parsed.type,
              error: {
                code: DeepLinkError.UNAUTHORIZED,
                message: 'Bu içeriği görüntüleme yetkiniz yok',
                details: { statusCode: existsCheck.statusCode },
              },
            };
          }
        }
      }

      // 4. Map to screen and navigate
      const navigationResult = this.mapToScreen(parsed.type, validation.data);

      if (this.navigation && this.navigation.isReady()) {
        // Type assertion for dynamic screen navigation from deep link mapping
        (
          this.navigation.navigate as unknown as (
            name: string,
            params?: object,
          ) => void
        )(navigationResult.screen, navigationResult.params);
      }

      logger.info('[DeepLink] Success:', navigationResult.screen);

      return {
        success: true,
        type: parsed.type,
        screen: navigationResult.screen,
        params: navigationResult.params,
      };
    } catch (error) {
      logger.error('[DeepLink] Handler error:', error);
      return {
        success: false,
        error: {
          code: DeepLinkError.UNKNOWN,
          message: 'Link işlenirken bir hata oluştu',
          details: { error },
        },
      };
    }
  }

  /**
   * Map deep link type to screen
   */
  private mapToScreen(
    type: DeepLinkType,
    params: any,
  ): { screen: string; params: Record<string, any> } {
    const screenMap: Record<
      DeepLinkType,
      { screen: string; paramKey?: string; targetKey?: string }
    > = {
      [DeepLinkType.PROFILE]: { screen: 'ProfileDetail', paramKey: 'userId' },
      [DeepLinkType.MOMENT]: { screen: 'MomentDetail', paramKey: 'momentId' },
      [DeepLinkType.GIFT]: { screen: 'GiftInboxDetail', paramKey: 'giftId' },
      [DeepLinkType.CHAT]: { screen: 'Chat', paramKey: 'conversationId' },
      [DeepLinkType.REQUEST]: {
        screen: 'RequestDetail',
        paramKey: 'requestId',
      },
      [DeepLinkType.NOTIFICATION]: { screen: 'Notifications' },
      [DeepLinkType.SETTINGS]: { screen: 'Settings' },
    };

    const mapping = screenMap[type];
    const targetKey = mapping.targetKey || mapping.paramKey;

    return {
      screen: mapping.screen,
      params:
        mapping.paramKey && targetKey
          ? { [targetKey]: params[mapping.paramKey] }
          : {},
    };
  }

  /**
   * Navigate to error screen
   */
  navigateToError(error: DeepLinkError, message: string) {
    if (!this.navigation || !this.navigation.isReady()) return;

    const nav = this.navigation as DeepLinkNavigator;

    if (error === DeepLinkError.EXPIRED) {
      nav.navigate('LinkExpired', { message });
    } else if (error === DeepLinkError.NOT_FOUND) {
      nav.navigate('LinkNotFound', { message });
    } else {
      nav.navigate('LinkInvalid', { message });
    }
  }

  /**
   * Generate deep link URL
   */
  generateLink(
    type: DeepLinkType,
    id: string,
    utmParams?: {
      source?: string;
      campaign?: string;
      medium?: string;
      content?: string;
    },
  ): string {
    const baseUrl = 'https://www.lovendo.xyz';

    // Map type to path
    const pathMap: Record<DeepLinkType, string> = {
      [DeepLinkType.PROFILE]: 'profile',
      [DeepLinkType.MOMENT]: 'moment',
      [DeepLinkType.GIFT]: 'gift',
      [DeepLinkType.CHAT]: 'chat',
      [DeepLinkType.REQUEST]: 'request',
      [DeepLinkType.NOTIFICATION]: 'notifications',
      [DeepLinkType.SETTINGS]: 'settings',
    };

    const path = pathMap[type];
    const url =
      type === DeepLinkType.NOTIFICATION || type === DeepLinkType.SETTINGS
        ? `${baseUrl}/${path}`
        : `${baseUrl}/${path}/${id}`;

    // Add UTM params
    if (utmParams) {
      const params = new URLSearchParams();
      if (utmParams.source) params.set('utm_source', utmParams.source);
      if (utmParams.campaign) params.set('utm_campaign', utmParams.campaign);
      if (utmParams.medium) params.set('utm_medium', utmParams.medium);
      if (utmParams.content) params.set('utm_content', utmParams.content);

      const queryString = params.toString();
      return queryString ? `${url}?${queryString}` : url;
    }

    return url;
  }

  /**
   * Initialize deep link listening
   */
  async initialize() {
    // P2 FIX: Restore persisted queue on app start
    await this.restoreQueue();

    // P2 FIX: Check if navigation is ready before processing
    if (!this.navigation?.isReady()) {
      logger.warn('[DeepLink] Navigation not ready during initialize');
    }

    // Listen to initial URL (app opened from link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        logger.info('[DeepLink] Initial URL:', url);
        this.handleDeepLink(url, { checkExists: true }).then((result) => {
          // P2 FIX: Only navigate to error if not queued and actually failed
          if (!result.success && result.error) {
            this.navigateToError(result.error.code, result.error.message);
          }
        });
      }
    });

    // Listen to URL changes (app in background)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      logger.info('[DeepLink] URL received:', url);
      this.handleDeepLink(url, { checkExists: true }).then((result) => {
        // P2 FIX: Only navigate to error if not queued and actually failed
        if (!result.success && result.error) {
          this.navigateToError(result.error.code, result.error.message);
        }
      });
    });

    return () => subscription.remove();
  }

  /**
   * Check for deferred deep links (install attribution)
   * Should be called on first app launch
   */
  public async checkDeferredLink(): Promise<void> {
    try {
      // Placeholder for deferred linking logic
      // In production, generate a fingerprint (IP+UA) and call 'claim_deferred_link' RPC
      // const { data } = await supabase.rpc('claim_deferred_link', { p_fingerprint: '...' });
      // if (data) this.handleDeepLink(data);
      logger.debug('[DeepLink] Checked deferred links');
    } catch (e) {
      logger.warn('[DeepLink] Failed check deferred', e);
    }
  }
}

/**
 * Singleton instance
 */
export const deepLinkHandler = new DeepLinkHandler();

/**
 * React hook for deep linking
 */
export function useDeepLinking() {
  const unsubscribe = deepLinkHandler.initialize();
  return { unsubscribe };
}
