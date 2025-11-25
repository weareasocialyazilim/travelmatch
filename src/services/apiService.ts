import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError} from 'axios';

interface ApiError {
  message: string;
  statusCode?: number;
  details?: unknown;
}

class ApiService {
  private api: AxiosInstance;

  constructor(baseURL: string = 'https://api.example.com') {
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      config => {
        // Token eklenebilir
        // const token = await getToken();
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.api.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        let message = 'An error occurred';
        
        if (error.code === 'ECONNABORTED') {
          message = 'Request timeout. Please try again.';
        } else if (error.code === 'ERR_NETWORK') {
          message = 'Network error. Please check your connection.';
        } else if (error.response) {
          // Server responded with error status
          switch (error.response.status) {
            case 400:
              message = 'Invalid request. Please check your input.';
              break;
            case 401:
              message = 'Authentication required. Please log in.';
              break;
            case 403:
              message = 'Access denied.';
              break;
            case 404:
              message = 'Resource not found.';
              break;
            case 500:
              message = 'Server error. Please try again later.';
              break;
            default:
              message = error.message || 'An error occurred';
          }
        }
        
        const apiError: ApiError = {
          message,
          statusCode: error.response?.status,
          details: error.response?.data,
        };
        
        // Hata yönetimi
        if (error.response?.status === 401) {
          // Oturum süresi dolmuş, logout işlemi yapılabilir
        }
        
        return Promise.reject(apiError);
      },
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config);
    return response.data;
  }

  async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data, config);
    return response.data;
  }

  async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config);
    return response.data;
  }
}

const apiService = new ApiService();

// Auth endpoints
export const authService = {
  login: (email: string, password: string) =>
    apiService.post('/auth/login', { email, password }),
  
  register: (data: any) =>
    apiService.post('/auth/register', data),
  
  verifyPhone: (phone: string, code: string) =>
    apiService.post('/auth/verify-phone', { phone, code }),
  
  refreshToken: () =>
    apiService.post('/auth/refresh'),
};

// Moment endpoints
export const momentService = {
  getMoments: (filters?: any) =>
    apiService.get('/moments', { params: filters }),
  
  getMoment: (id: string) =>
    apiService.get(`/moments/${id}`),
  
  createMoment: (data: any) =>
    apiService.post('/moments', data),
  
  updateMoment: (id: string, data: any) =>
    apiService.put(`/moments/${id}`, data),
  
  deleteMoment: (id: string) =>
    apiService.delete(`/moments/${id}`),
};

// Proof endpoints
export const proofService = {
  getProofs: () =>
    apiService.get('/proofs'),
  
  getProof: (id: string) =>
    apiService.get(`/proofs/${id}`),
  
  uploadProof: (data: FormData) =>
    apiService.post('/proofs', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  verifyProof: (id: string) =>
    apiService.post(`/proofs/${id}/verify`),
};

// Transaction endpoints
export const transactionService = {
  getTransactions: () =>
    apiService.get('/transactions'),
  
  getTransaction: (id: string) =>
    apiService.get(`/transactions/${id}`),
  
  createTransaction: (data: any) =>
    apiService.post('/transactions', data),
  
  requestRefund: (id: string, reason: string) =>
    apiService.post(`/transactions/${id}/refund`, { reason }),
};

// User endpoints
export const userService = {
  getProfile: () =>
    apiService.get('/users/profile'),
  
  updateProfile: (data: any) =>
    apiService.put('/users/profile', data),
  
  getUser: (id: string) =>
    apiService.get(`/users/${id}`),
  
  uploadAvatar: (data: FormData) =>
    apiService.post('/users/avatar', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default apiService;
