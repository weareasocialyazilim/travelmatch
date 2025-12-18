/**
 * API Client for Admin Panel
 * Handles all HTTP requests with proper error handling and authentication
 */

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
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

    if (!response.ok) {
      let error = 'Bir hata oluştu';

      if (contentType?.includes('application/json')) {
        const data = await response.json();
        error = data.error || data.message || error;
      }

      return { error, status: response.status };
    }

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return { data, status: response.status };
    }

    return { status: response.status };
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const { params, ...fetchConfig } = config || {};
    const url = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...fetchConfig.headers,
        },
        ...fetchConfig,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Ağ hatası',
        status: 0,
      };
    }
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    const { params, ...fetchConfig } = config || {};
    const url = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...fetchConfig.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...fetchConfig,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Ağ hatası',
        status: 0,
      };
    }
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    const { params, ...fetchConfig } = config || {};
    const url = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...fetchConfig.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...fetchConfig,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Ağ hatası',
        status: 0,
      };
    }
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    const { params, ...fetchConfig } = config || {};
    const url = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...fetchConfig.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...fetchConfig,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Ağ hatası',
        status: 0,
      };
    }
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const { params, ...fetchConfig } = config || {};
    const url = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...fetchConfig.headers,
        },
        ...fetchConfig,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Ağ hatası',
        status: 0,
      };
    }
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the class for custom instances
export { ApiClient };
export type { ApiResponse, RequestConfig };
