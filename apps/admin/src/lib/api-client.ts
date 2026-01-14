/**
 * API Client for Admin Panel
 * Handles all HTTP requests with proper error handling, authentication,
 * rate limiting awareness, timeout, and retry logic.
 *
 * @module lib/api-client
 */

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

interface RequestConfig extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
}

// CSRF Token cache
let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

/**
 * Fetch CSRF token from server
 * Uses singleton pattern to avoid multiple requests
 */
async function getCSRFToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }

  csrfTokenPromise = fetch('/api/csrf', {
    method: 'GET',
    credentials: 'include',
  })
    .then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        csrfToken = data.token;
        return csrfToken as string;
      }
      return '';
    })
    .catch(() => '')
    .finally(() => {
      csrfTokenPromise = null;
    });

  return csrfTokenPromise;
}

/**
 * Reset CSRF token (call after logout or session expiry)
 */
export function resetCSRFToken(): void {
  csrfToken = null;
  csrfTokenPromise = null;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetry: number;
  private defaultRetryDelay: number;

  constructor(
    baseUrl: string = '/api',
    options?: {
      timeout?: number;
      retry?: number;
      retryDelay?: number;
    },
  ) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = options?.timeout ?? 30000; // 30 seconds default
    this.defaultRetry = options?.retry ?? 3;
    this.defaultRetryDelay = options?.retryDelay ?? 1000;
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      return {
        error: `Çok fazla istek. ${retryAfter ? `${retryAfter} saniye sonra tekrar deneyin.` : 'Lütfen bekleyin.'}`,
        status: response.status,
      };
    }

    // Handle authentication errors
    if (response.status === 401) {
      // Clear CSRF token on auth error
      resetCSRFToken();
      return {
        error: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.',
        status: response.status,
      };
    }

    // Handle forbidden
    if (response.status === 403) {
      return {
        error: 'Bu işlem için yetkiniz bulunmuyor.',
        status: response.status,
      };
    }

    if (!response.ok) {
      let error = 'Bir hata oluştu';

      if (contentType?.includes('application/json')) {
        try {
          const data = await response.json();
          error = data.error || data.message || error;
        } catch {
          // JSON parse failed, use default error
        }
      }

      return { error, status: response.status };
    }

    if (contentType?.includes('application/json')) {
      try {
        const data = await response.json();
        return { data, status: response.status };
      } catch {
        return { error: 'Yanıt işlenemedi', status: response.status };
      }
    }

    return { status: response.status };
  }

  private async executeWithRetry<T>(
    operation: () => Promise<Response>,
    config: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const maxRetries = config.retry ?? this.defaultRetry;
    const retryDelay = config.retryDelay ?? this.defaultRetryDelay;
    let lastError: ApiResponse<T> = { error: 'Bilinmeyen hata', status: 0 };

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await operation();
        const result = await this.handleResponse<T>(response);

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (
          result.status >= 400 &&
          result.status < 500 &&
          result.status !== 429
        ) {
          return result;
        }

        // Don't retry on success
        if (!result.error || result.status === 200) {
          return result;
        }

        // For 429, wait the specified time
        if (result.status === 429) {
          const retryAfter = parseInt(
            response.headers.get('Retry-After') || '5',
          );
          if (attempt < maxRetries) {
            await sleep(retryAfter * 1000);
            continue;
          }
        }

        lastError = result;
      } catch (error) {
        // Handle timeout
        if (error instanceof Error && error.name === 'AbortError') {
          lastError = {
            error: 'İstek zaman aşımına uğradı',
            status: 408,
          };
        } else {
          lastError = {
            error: error instanceof Error ? error.message : 'Ağ hatası',
            status: 0,
          };
        }
      }

      // Exponential backoff for retries
      if (attempt < maxRetries) {
        await sleep(retryDelay * Math.pow(2, attempt));
      }
    }

    return lastError;
  }

  async get<T>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const { params, timeout, ...fetchConfig } = config || {};
    const url = this.buildUrl(endpoint, params);

    return this.executeWithRetry<T>(
      () =>
        fetchWithTimeout(
          url,
          {
            method: 'GET',
            credentials: 'include', // Include cookies for session
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              ...fetchConfig.headers,
            },
            ...fetchConfig,
          },
          timeout ?? this.defaultTimeout,
        ),
      config || {},
    );
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const { params, timeout, ...fetchConfig } = config || {};
    const url = this.buildUrl(endpoint, params);

    // Get CSRF token for mutations
    const token = await getCSRFToken();

    return this.executeWithRetry<T>(
      () =>
        fetchWithTimeout(
          url,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              ...(token && { 'X-CSRF-Token': token }),
              ...fetchConfig.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
            ...fetchConfig,
          },
          timeout ?? this.defaultTimeout,
        ),
      config || {},
    );
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const { params, timeout, ...fetchConfig } = config || {};
    const url = this.buildUrl(endpoint, params);

    const token = await getCSRFToken();

    return this.executeWithRetry<T>(
      () =>
        fetchWithTimeout(
          url,
          {
            method: 'PATCH',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              ...(token && { 'X-CSRF-Token': token }),
              ...fetchConfig.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
            ...fetchConfig,
          },
          timeout ?? this.defaultTimeout,
        ),
      config || {},
    );
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const { params, timeout, ...fetchConfig } = config || {};
    const url = this.buildUrl(endpoint, params);

    const token = await getCSRFToken();

    return this.executeWithRetry<T>(
      () =>
        fetchWithTimeout(
          url,
          {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              ...(token && { 'X-CSRF-Token': token }),
              ...fetchConfig.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
            ...fetchConfig,
          },
          timeout ?? this.defaultTimeout,
        ),
      config || {},
    );
  }

  async delete<T>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const { params, timeout, ...fetchConfig } = config || {};
    const url = this.buildUrl(endpoint, params);

    const token = await getCSRFToken();

    return this.executeWithRetry<T>(
      () =>
        fetchWithTimeout(
          url,
          {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              ...(token && { 'X-CSRF-Token': token }),
              ...fetchConfig.headers,
            },
            ...fetchConfig,
          },
          timeout ?? this.defaultTimeout,
        ),
      config || {},
    );
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the class for custom instances
export { ApiClient };
export type { ApiResponse, RequestConfig };
