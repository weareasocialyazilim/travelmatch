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

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const API_BASE_URL = `${SUPABASE_URL}/functions/v1/api/v1`;

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

  private async getHeaders(useToken?: string): Promise<HeadersInit> {
    // Use provided token or get from session manager
    const token = useToken || (await sessionManager.getValidToken());

    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    };
  }

  async request<T>(
    method: string,
    path: string,
    body?: RequestBody,
    isRetry = false,
  ): Promise<ApiResponse<T>> {
    try {
      // OFFLINE CHECK - Return early if no connection
      const isOnline = await this.checkNetwork();
      if (!isOnline) {
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message:
              'İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.',
          },
        };
      }

      const headers = await this.getHeaders();
      const url = `${API_BASE_URL}${path}`;

      logger.info(`[API v1] ${method} ${path}${isRetry ? ' (retry)' : ''}`);

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
        logger.warn('[API v1] 401 Unauthorized - attempting token refresh');

        // Try to refresh token
        const newToken = await sessionManager.getValidToken();

        if (newToken) {
          // Retry request with new token
          logger.info('[API v1] Token refreshed, retrying request');
          return this.request<T>(method, path, body, true);
        } else {
          // Refresh failed - session expired
          logger.error('[API v1] Token refresh failed - session expired');

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

      if (!response.ok) {
        logger.error(`[API v1] Error ${response.status}:`, data);
        return {
          success: false,
          error: data.error || {
            code: 'UNKNOWN_ERROR',
            message: 'An error occurred',
          },
        };
      }

      logger.info(`[API v1] Success:`, data);
      return data as ApiResponse<T>;
    } catch (error) {
      logger.error('[API v1] Request failed:', error);

      // Better error messaging for network errors
      const isNetworkError =
        error instanceof TypeError &&
        (error.message.includes('Network') || error.message.includes('fetch'));

      return {
        success: false,
        error: {
          code: isNetworkError ? 'NETWORK_ERROR' : 'REQUEST_ERROR',
          message: isNetworkError
            ? 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.'
            : error instanceof Error
              ? error.message
              : 'Request failed',
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
    return apiClient.post<AuthLoginResponse>('/auth/login', { email, password });
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
