/**
 * Secure API Client
 * Centralized API client with JWT interceptors for Admin Panel communication
 *
 * Features:
 * - Automatic JWT token injection
 * - 401/403 error handling with auth redirect
 * - Request/Response logging
 * - Retry logic for transient failures
 * - Sentry error tracking
 */

import { supabase } from './supabase';
import { logger } from '@/utils/logger';
// DISABLED: Sentry v7 incompatible with React 19 - using stub
import { Sentry } from './sentry';

// Types
export interface ApiResponse<T = unknown> {
  data: T | null;
  error: ApiError | null;
  status: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
}

// Event emitter for auth errors
type AuthErrorCallback = (error: ApiError) => void;
const authErrorListeners: Set<AuthErrorCallback> = new Set();

export const onAuthError = (callback: AuthErrorCallback): (() => void) => {
  authErrorListeners.add(callback);
  return () => authErrorListeners.delete(callback);
};

const notifyAuthError = (error: ApiError) => {
  authErrorListeners.forEach((callback) => callback(error));
};

// Default configuration
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRIES = 2;
const RETRY_DELAY = 1000;

/**
 * Get current JWT token from Supabase session
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch (error) {
    logger.error('ApiClient', 'Failed to get auth token', error);
    return null;
  }
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Make authenticated API request with interceptors
 */
export const apiRequest = async <T = unknown>(
  url: string,
  config: RequestConfig = {},
): Promise<ApiResponse<T>> => {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    skipAuth = false,
  } = config;

  let lastError: ApiError | null = null;
  let attempts = 0;

  while (attempts <= retries) {
    try {
      // Request interceptor - add auth token
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      if (!skipAuth) {
        const token = await getAuthToken();
        if (token) {
          requestHeaders['Authorization'] = `Bearer ${token}`;
        }
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Log request
      logger.debug('ApiClient', `${method} ${url}`, {
        hasAuth: !!requestHeaders['Authorization'],
        attempt: attempts + 1,
      });

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Response interceptor - handle errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        const apiError: ApiError = {
          code: `HTTP_${response.status}`,
          message: errorData.message || response.statusText,
          details: errorData,
        };

        // Handle auth errors
        if (response.status === 401) {
          apiError.code = 'UNAUTHORIZED';
          apiError.message = 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';
          notifyAuthError(apiError);

          Sentry.captureMessage('API 401 Unauthorized', {
            level: 'warning',
            extra: { url, method },
          });

          return { data: null, error: apiError, status: 401 };
        }

        if (response.status === 403) {
          apiError.code = 'FORBIDDEN';
          apiError.message = 'Bu işlem için yetkiniz bulunmuyor.';
          notifyAuthError(apiError);

          Sentry.captureMessage('API 403 Forbidden', {
            level: 'warning',
            extra: { url, method },
          });

          return { data: null, error: apiError, status: 403 };
        }

        // Retry on 5xx errors
        if (response.status >= 500 && attempts < retries) {
          lastError = apiError;
          attempts++;
          await sleep(RETRY_DELAY * attempts);
          continue;
        }

        // Track payment errors specifically
        if (url.includes('payment') || url.includes('paytr')) {
          Sentry.captureException(
            new Error(`Payment API Error: ${apiError.message}`),
            {
              tags: {
                type: 'payment_error',
                status: response.status.toString(),
              },
              extra: { url, method, errorData },
            },
          );
        }

        return { data: null, error: apiError, status: response.status };
      }

      // Parse successful response
      const data = (await response.json()) as T;

      logger.debug('ApiClient', `${method} ${url} - Success`, {
        status: response.status,
      });

      return { data, error: null, status: response.status };
    } catch (error) {
      const isTimeout = error instanceof Error && error.name === 'AbortError';

      lastError = {
        code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout
          ? 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.'
          : 'Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.',
        details: error,
      };

      if (attempts < retries) {
        attempts++;
        await sleep(RETRY_DELAY * attempts);
        continue;
      }

      Sentry.captureException(error, {
        tags: { type: 'api_network_error' },
        extra: { url, method, attempts },
      });
    }
  }

  return { data: null, error: lastError, status: 0 };
};

/**
 * Convenience methods
 */
export const api = {
  get: <T = unknown>(url: string, config?: Omit<RequestConfig, 'method'>) =>
    apiRequest<T>(url, { ...config, method: 'GET' }),

  post: <T = unknown>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'method' | 'body'>,
  ) => apiRequest<T>(url, { ...config, method: 'POST', body }),

  put: <T = unknown>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'method' | 'body'>,
  ) => apiRequest<T>(url, { ...config, method: 'PUT', body }),

  patch: <T = unknown>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'method' | 'body'>,
  ) => apiRequest<T>(url, { ...config, method: 'PATCH', body }),

  delete: <T = unknown>(url: string, config?: Omit<RequestConfig, 'method'>) =>
    apiRequest<T>(url, { ...config, method: 'DELETE' }),
};

export default api;
