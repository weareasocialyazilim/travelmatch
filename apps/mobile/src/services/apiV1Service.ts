/**
 * API v1 Client Service
 *
 * Wrapper for calling the new API v1 endpoints
 * Gradually migrate from direct edge function calls to v1 API
 *
 * FEATURES:
 * - Offline handling: Checks network before making requests
 * - Auto token refresh: Refreshes expired tokens on 401
 * - Session management: Clears session on refresh failure
 */

import NetInfo from '@react-native-community/netinfo';
import { logger } from '../utils/logger';
import { sessionManager } from './sessionManager';
import { ErrorHandler, isNetworkRelatedError } from '../utils/errorHandler';
import * as Sentry from '../config/sentry';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const API_BASE_URL = `${SUPABASE_URL}/functions/v1/api/v1`;

/**
 * Generate a unique trace ID for distributed tracing
 * Format: lv-{timestamp}-{random} for easy identification
 */
const generateTraceId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `lv-${timestamp}-${random}`;
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

// Generic request body type - use Record for structured data
type RequestBody = Record<string, unknown>;

// API Response types for better type safety
interface AuthLoginResponse {
  user: {
    id: string;
    email: string;
    full_name?: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

interface UserResponse {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  rating?: number;
  verified?: boolean;
}

interface MomentResponse {
  id: string;
  title: string;
  description?: string;
  images?: string[];
  price?: number;
  user_id: string;
}

interface RequestResponse {
  id: string;
  status: string;
  moment_id: string;
  user_id: string;
  message?: string;
}

/**
 * Network-aware API Client with automatic token refresh
 * - Checks connection before making requests
 * - Intercepts 401 responses and refreshes token
 * - Retries failed request with new token
 * - Clears session if refresh fails
 */
class ApiClient {
  private sessionExpiredCallback: (() => void) | null = null;

  /**
   * Set callback for session expired events
   * Used to trigger navigation to session expired screen
   */
  setSessionExpiredCallback(callback: () => void) {
    this.sessionExpiredCallback = callback;
  }

  /**
   * Check if device is online
   * Returns false if offline, preventing unnecessary requests
   */
  private async checkNetwork(): Promise<boolean> {
    try {
      const netState = await NetInfo.fetch();
      const isConnected =
        netState.isConnected === true && netState.isInternetReachable !== false;

      if (!isConnected) {
        logger.warn('[API v1] Offline - request blocked');
      }

      return isConnected;
    } catch (error) {
      // If NetInfo fails, assume connected (fail-open)
      logger.error('[API v1] NetInfo check failed, assuming online:', error);
      return true;
    }
  }

  private async getHeaders(
    useToken?: string,
    traceId?: string,
  ): Promise<HeadersInit> {
    // Use provided token or get from session manager
    const token = useToken || (await sessionManager.getValidToken());

    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      // Distributed tracing header for request correlation
      'x-trace-id': traceId || generateTraceId(),
      // Request timestamp for latency monitoring
      'x-request-timestamp': new Date().toISOString(),
    };
  }

  async request<T>(
    method: string,
    path: string,
    body?: RequestBody,
    isRetry = false,
    existingTraceId?: string,
  ): Promise<ApiResponse<T>> {
    // Generate trace ID once per request chain (reuse on retries)
    const traceId = existingTraceId || generateTraceId();
    const startTime = Date.now();

    // Set Sentry tag for distributed tracing correlation
    // This allows linking Sentry errors to specific API requests and Edge Function logs
    Sentry.setTag('trace_id', traceId);
    Sentry.setTag('api_path', path);
    Sentry.setTag('api_method', method);

    try {
      // OFFLINE CHECK - Return early if no connection
      const isOnline = await this.checkNetwork();
      if (!isOnline) {
        logger.warn(`[API v1] [${traceId}] Request blocked - offline`);
        Sentry.addBreadcrumb(
          'API request blocked - offline',
          'api',
          'warning',
          {
            traceId,
            path,
            method,
          },
        );
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message:
              'İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.',
          },
        };
      }

      const headers = await this.getHeaders(undefined, traceId);
      const url = `${API_BASE_URL}${path}`;

      // Add breadcrumb for request tracking
      Sentry.addBreadcrumb('API request started', 'api', 'info', {
        traceId,
        path,
        method,
        isRetry,
      });

      logger.info(
        `[API v1] [${traceId}] ${method} ${path}${isRetry ? ' (retry)' : ''}`,
      );

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      // ============================================
      // 401 UNAUTHORIZED - Token expired/invalid
      // ============================================
      if (response.status === 401 && !isRetry) {
        logger.warn(
          `[API v1] [${traceId}] 401 Unauthorized - attempting token refresh`,
        );

        // Try to refresh token
        const newToken = await sessionManager.getValidToken();

        if (newToken) {
          // Retry request with new token (preserve trace ID)
          logger.info(
            `[API v1] [${traceId}] Token refreshed, retrying request`,
          );
          return this.request<T>(method, path, body, true, traceId);
        } else {
          // Refresh failed - session expired
          const latency = Date.now() - startTime;
          logger.error(
            `[API v1] [${traceId}] Token refresh failed - session expired (${latency}ms)`,
          );

          // Trigger session expired callback
          if (this.sessionExpiredCallback) {
            this.sessionExpiredCallback();
          }

          return {
            success: false,
            error: {
              code: 'SESSION_EXPIRED',
              message: 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.',
            },
          };
        }
      }

      const latency = Date.now() - startTime;

      if (!response.ok) {
        logger.error(
          `[API v1] [${traceId}] Error ${response.status} (${latency}ms):`,
          data,
        );
        Sentry.addBreadcrumb('API request failed', 'api', 'error', {
          traceId,
          path,
          method,
          statusCode: response.status,
          latency,
          errorCode: data.error?.code,
        });
        return {
          success: false,
          error: data.error || {
            code: 'UNKNOWN_ERROR',
            message: 'An error occurred',
          },
        };
      }

      logger.info(`[API v1] [${traceId}] Success (${latency}ms)`);
      Sentry.addBreadcrumb('API request succeeded', 'api', 'info', {
        traceId,
        path,
        method,
        latency,
      });
      return data as ApiResponse<T>;
    } catch (error) {
      const latency = Date.now() - startTime;

      // Use consolidated error handler
      const standardizedError = ErrorHandler.handle(
        error,
        `API v1 [${traceId}]`,
      );
      logger.error(`[API v1] [${traceId}] Request failed (${latency}ms):`, {
        code: standardizedError.code,
        message: standardizedError.message,
      });

      // Use centralized error classification
      const isNetwork = isNetworkRelatedError(error);

      // Add Sentry breadcrumb and capture exception for non-network errors
      Sentry.addBreadcrumb('API request exception', 'api', 'error', {
        traceId,
        path,
        method,
        latency,
        isNetworkError: isNetwork,
        errorCode: standardizedError.code,
      });

      // Capture exception to Sentry for debugging (non-network errors only)
      if (!isNetwork && error instanceof Error) {
        Sentry.captureException(error, {
          traceId,
          path,
          method,
          latency,
        });
      }

      return {
        success: false,
        error: {
          code: isNetwork ? 'NETWORK_ERROR' : 'REQUEST_ERROR',
          message: isNetwork
            ? 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.'
            : standardizedError.userMessage,
        },
      };
    }
  }

  // Convenience methods
  get<T>(path: string) {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body: RequestBody) {
    return this.request<T>('POST', path, body);
  }

  put<T>(path: string, body: RequestBody) {
    return this.request<T>('PUT', path, body);
  }

  patch<T>(path: string, body: RequestBody) {
    return this.request<T>('PATCH', path, body);
  }

  delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  }
}

export const apiClient = new ApiClient();

/**
 * API v1 Service Methods
 *
 * Gradually migrate to these methods from direct Supabase calls
 */
export const apiV1Service = {
  // ============================================
  // AUTH
  // ============================================
  async login(email: string, password: string) {
    return apiClient.post<AuthLoginResponse>('/auth/login', {
      email,
      password,
    });
  },

  async logout() {
    return apiClient.post<null>('/auth/logout', {});
  },

  // ============================================
  // USERS
  // ============================================
  async getUser(userId: string) {
    return apiClient.get<UserResponse>(`/users/${userId}`);
  },

  async getUserMoments(userId: string) {
    return apiClient.get<{
      moments: MomentResponse[];
      count: number;
    }>(`/users/${userId}/moments`);
  },

  // ============================================
  // MOMENTS
  // ============================================
  async listMoments(params?: {
    limit?: number;
    offset?: number;
    category?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.category) queryParams.append('category', params.category);

    const query = queryParams.toString();
    return apiClient.get<{
      moments: MomentResponse[];
      pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      };
    }>(`/moments${query ? `?${query}` : ''}`);
  },

  async getMoment(momentId: string) {
    return apiClient.get<MomentResponse>(`/moments/${momentId}`);
  },

  // ============================================
  // REQUESTS
  // ============================================
  async listRequests(params?: {
    moment_id?: string;
    user_id?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.moment_id) queryParams.append('moment_id', params.moment_id);
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return apiClient.get<{
      requests: RequestResponse[];
      count: number;
    }>(`/requests${query ? `?${query}` : ''}`);
  },
};

/**
 * Migration Examples
 *
 * BEFORE (Direct Supabase call):
 * ```typescript
 * const { data, error } = await supabase
 *   .from('moments')
 *   .select('*')
 *   .eq('category', 'food');
 * ```
 *
 * AFTER (API v1):
 * ```typescript
 * const response = await apiV1Service.listMoments({ category: 'food' });
 * if (response.success) {
 *   const moments = response.data?.moments;
 * }
 * ```
 *
 * Benefits:
 * 1. Consistent error handling
 * 2. Standardized response format
 * 3. Built-in N+1 query optimization
 * 4. Easier to version and maintain
 * 5. Better API documentation
 */
