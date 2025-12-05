/**
 * API Utilities
 * API çağrıları için yardımcı fonksiyonlar ve error handling
 */

import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import axios from 'axios';
import type {
  AuthResponse,
  MomentsResponse,
  MomentResponse,
  TripsResponse,
  TripResponse,
  UserResponse,
  PaymentMethodsResponse,
  TransactionsResponse,
  NotificationsResponse,
  SearchResponse,
  ProofsResponse,
  WalletResponse,
  GenericSuccessResponse,
  Moment,
  User,
  SearchFilters,
  TransactionResponse,
  ProofResponse,
} from '../types/api';
import {
  AppError,
  NetworkError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ErrorCode,
} from './errors';
import { checkNetworkAvailability, cache, retryWithBackoff } from './offline';

// API Configuration
const API_TIMEOUT = 30000; // 30 seconds
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.travelmatch.com/api';

/**
 * Create Axios Instance
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Token ve diğer auth bilgilerini ekler
 */
apiClient.interceptors.request.use(
  async (config) => {
    // TODO: AsyncStorage'dan token al ve ekle
    // const token = await AsyncStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Hataları yakalar ve custom error'lara çevirir
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    return Promise.reject(handleApiError(error));
  },
);

/**
 * API Error Handler
 * Axios hatalarını AppError'lara çevirir
 */
export const handleApiError = (error: AxiosError): AppError => {
  // Network Error
  if (!error.response) {
    return new NetworkError(
      error.message ||
        'Unable to connect to server. Please check your internet connection.',
    );
  }

  const { status, data } = error.response;
  const message =
    (data as Record<string, unknown>)?.message?.toString() || error.message;

  // HTTP Status Code'a göre error oluştur
  switch (status) {
    case 400: {
      const errors400 = (data as Record<string, unknown>)?.errors as
        | Record<string, string>
        | undefined;
      const formattedErrors400 = errors400
        ? Object.entries(errors400).reduce((acc, [key, value]) => {
            acc[key] = Array.isArray(value) ? value : [value];
            return acc;
          }, {} as Record<string, string[]>)
        : {};

      return new ValidationError(
        message || 'Invalid request data',
        formattedErrors400,
      );
    }

    case 401:
      // TODO: Burada logout işlemi yapılabilir
      return new UnauthorizedError(message);

    case 403:
      return new AppError(
        message || 'You do not have permission to perform this action',
        ErrorCode.FORBIDDEN,
        403,
      );

    case 404:
      return new NotFoundError(message);

    case 422: {
      const errors422 = (data as Record<string, unknown>)?.errors as
        | Record<string, string>
        | undefined;
      const formattedErrors422 = errors422
        ? Object.entries(errors422).reduce((acc, [key, value]) => {
            acc[key] = Array.isArray(value) ? value : [value];
            return acc;
          }, {} as Record<string, string[]>)
        : {};

      return new ValidationError(
        message || 'Validation failed',
        formattedErrors422,
      );
    }

    case 500:
    case 502:
    case 503:
      return new AppError(
        'Server error. Please try again later.',
        ErrorCode.API_ERROR,
        status,
      );

    default:
      return new AppError(
        message || 'An unexpected error occurred',
        ErrorCode.API_ERROR,
        status,
      );
  }
};

/**
 * Generic API Request Handler with Offline Support
 * Try-catch wrapper ve type-safe response
 */
export async function apiRequest<T>(
  config: AxiosRequestConfig,
  options?: { useCache?: boolean; cacheTTL?: number; retry?: boolean },
): Promise<T> {
  const { useCache = false, cacheTTL = 3600000, retry = true } = options || {};

  // Check cache first for GET requests
  if (config.method === 'GET' && useCache) {
    const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
    const cachedData = cache.get<T>(cacheKey);

    if (cachedData) {
      return cachedData;
    }
  }

  // Check network availability
  const isOnline = await checkNetworkAvailability();
  if (!isOnline) {
    throw new NetworkError('No internet connection');
  }

  const makeRequest = async () => {
    try {
      const response: AxiosResponse<T> = await apiClient(config);

      // Cache GET responses
      if (config.method === 'GET' && useCache) {
        const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
        cache.set(cacheKey, response.data, cacheTTL);
      }

      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw handleApiError(error as AxiosError);
    }
  };

  // Retry logic for failed requests
  if (retry) {
    return retryWithBackoff(makeRequest, 3, 1000);
  }

  return makeRequest();
}

/**
 * HTTP Methods
 */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
};

/**
 * Typed API Service Methods
 * Type-safe API calls using response types from types/api.ts
 */
export const apiService = {
  // Authentication
  auth: {
    login: (email: string, password: string) =>
      api.post<AuthResponse>('/auth/login', { email, password }),

    register: (data: { email: string; password: string; name: string }) =>
      api.post<AuthResponse>('/auth/register', data),

    logout: () => api.post<GenericSuccessResponse>('/auth/logout'),

    refreshToken: (refreshToken: string) =>
      api.post<AuthResponse>('/auth/refresh', { refreshToken }),
  },

  // Moments
  moments: {
    getAll: (params?: {
      page?: number;
      pageSize?: number;
      category?: string;
    }) => api.get<MomentsResponse>('/moments', { params }),

    getById: (id: string) => api.get<MomentResponse>(`/moments/${id}`),

    create: (data: Partial<Moment>) =>
      api.post<MomentResponse>('/moments', data),

    update: (id: string, data: Partial<Moment>) =>
      api.put<MomentResponse>(`/moments/${id}`, data),

    delete: (id: string) =>
      api.delete<GenericSuccessResponse>(`/moments/${id}`),
  },

  // Trips
  trips: {
    getAll: (params?: { page?: number; pageSize?: number; status?: string }) =>
      api.get<TripsResponse>('/trips', { params }),

    getById: (id: string) => api.get<TripResponse>(`/trips/${id}`),

    create: (data: { momentId: string; bookingDate: string }) =>
      api.post<TripResponse>('/trips', data),

    cancel: (id: string) =>
      api.post<GenericSuccessResponse>(`/trips/${id}/cancel`),
  },

  // User
  user: {
    getProfile: () => api.get<UserResponse>('/user/profile'),

    updateProfile: (data: Partial<User>) =>
      api.put<UserResponse>('/user/profile', data),

    getById: (id: string) => api.get<UserResponse>(`/users/${id}`),
  },

  // Payments
  payments: {
    getMethods: () => api.get<PaymentMethodsResponse>('/payment-methods'),

    addMethod: (data: { type: string; token: string }) =>
      api.post<PaymentMethodsResponse>('/payment-methods', data),

    deleteMethod: (id: string) =>
      api.delete<GenericSuccessResponse>(`/payment-methods/${id}`),

    setDefault: (id: string) =>
      api.post<GenericSuccessResponse>(`/payment-methods/${id}/default`),
  },

  // Transactions
  transactions: {
    getAll: (params?: { page?: number; pageSize?: number }) =>
      api.get<TransactionsResponse>('/transactions', { params }),

    getById: (id: string) =>
      api.get<TransactionResponse>(`/transactions/${id}`),
  },

  // Notifications
  notifications: {
    getAll: (params?: {
      page?: number;
      pageSize?: number;
      unreadOnly?: boolean;
    }) => api.get<NotificationsResponse>('/notifications', { params }),

    markAsRead: (id: string) =>
      api.post<GenericSuccessResponse>(`/notifications/${id}/read`),

    markAllAsRead: () =>
      api.post<GenericSuccessResponse>('/notifications/read-all'),
  },

  // Search
  search: {
    moments: (query: string, filters?: SearchFilters) =>
      api.post<SearchResponse>('/search', { query, filters }),
  },

  // Proofs
  proofs: {
    getAll: (params?: { momentId?: string; status?: string }) =>
      api.get<ProofsResponse>('/proofs', { params }),

    submit: (data: { momentId: string; imageUrl: string }) =>
      api.post<ProofResponse>('/proofs', data),

    approve: (id: string) =>
      api.post<GenericSuccessResponse>(`/proofs/${id}/approve`),

    reject: (id: string, reason: string) =>
      api.post<GenericSuccessResponse>(`/proofs/${id}/reject`, { reason }),
  },

  // Wallet
  wallet: {
    getBalance: () => api.get<WalletResponse>('/wallet/balance'),

    withdraw: (amount: number, method: string) =>
      api.post<GenericSuccessResponse>('/wallet/withdraw', { amount, method }),
  },
};
