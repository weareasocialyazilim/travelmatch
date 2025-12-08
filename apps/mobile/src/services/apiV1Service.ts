/**
 * API v1 Client Service
 * 
 * Wrapper for calling the new API v1 endpoints
 * Gradually migrate from direct edge function calls to v1 API
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

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

/**
 * API v1 Client
 */
class ApiClient {
  private async getHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    
    return {
      'Content-Type': 'application/json',
      'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
      'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    };
  }

  async request<T>(
    method: string,
    path: string,
    body?: any,
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const url = `${API_BASE_URL}${path}`;

      logger.info(`[API v1] ${method} ${path}`);

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

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
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  // Convenience methods
  get<T>(path: string) {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body: any) {
    return this.request<T>('POST', path, body);
  }

  put<T>(path: string, body: any) {
    return this.request<T>('PUT', path, body);
  }

  patch<T>(path: string, body: any) {
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
    return apiClient.post<{
      user: any;
      session: any;
    }>('/auth/login', { email, password });
  },

  async logout() {
    return apiClient.post<null>('/auth/logout', {});
  },

  // ============================================
  // USERS
  // ============================================
  async getUser(userId: string) {
    return apiClient.get<any>(`/users/${userId}`);
  },

  async getUserMoments(userId: string) {
    return apiClient.get<{
      moments: any[];
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
      moments: any[];
      pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      };
    }>(`/moments${query ? `?${query}` : ''}`);
  },

  async getMoment(momentId: string) {
    return apiClient.get<any>(`/moments/${momentId}`);
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
      requests: any[];
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
