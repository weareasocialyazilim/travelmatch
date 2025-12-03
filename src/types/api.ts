/**
 * API Response Types
 * Centralized type definitions for all API responses
 * Ensures type safety across service layer
 */

/**
 * Base API Response wrapper
 * @template T - The type of data being returned
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
}

/**
 * Paginated API Response
 * @template T - The type of items in the data array
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Error Response structure
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

/**
 * Authentication Response
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Moment-related response types
 */
export interface Moment {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  location: string;
  category: string;
  createdAt: string;
  hostId: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
}

export type MomentsResponse = PaginatedResponse<Moment>;
export type MomentResponse = ApiResponse<Moment>;

/**
 * Trip-related response types
 */
export interface Trip {
  id: string;
  momentId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  bookingDate: string;
  amount: number;
  createdAt: string;
}

export type TripsResponse = PaginatedResponse<Trip>;
export type TripResponse = ApiResponse<Trip>;

/**
 * User-related response types
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  verified: boolean;
  createdAt: string;
}

export type UsersResponse = PaginatedResponse<User>;
export type UserResponse = ApiResponse<User>;

/**
 * Payment-related response types
 */
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export type PaymentMethodsResponse = ApiResponse<PaymentMethod[]>;
export type PaymentMethodResponse = ApiResponse<PaymentMethod>;

/**
 * Transaction-related response types
 */
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'charge' | 'refund' | 'transfer';
  description: string;
  createdAt: string;
  momentId?: string;
  userId: string;
}

export type TransactionsResponse = PaginatedResponse<Transaction>;
export type TransactionResponse = ApiResponse<Transaction>;

/**
 * Notification-related response types
 */
export interface Notification {
  id: string;
  type: 'message' | 'booking' | 'payment' | 'review' | 'system';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export type NotificationsResponse = PaginatedResponse<Notification>;
export type NotificationResponse = ApiResponse<Notification>;

/**
 * Review-related response types
 */
export interface Review {
  id: string;
  momentId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

export type ReviewsResponse = PaginatedResponse<Review>;
export type ReviewResponse = ApiResponse<Review>;

/**
 * Search-related response types
 */
export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SearchResult {
  moments: Moment[];
  filters: SearchFilters;
  suggestions: string[];
}

export type SearchResponse = ApiResponse<SearchResult>;

/**
 * Analytics-related response types
 */
export interface AnalyticsData {
  totalViews: number;
  totalBookings: number;
  revenue: number;
  period: string;
  breakdown: Record<string, number>;
}

export type AnalyticsResponse = ApiResponse<AnalyticsData>;

/**
 * Proof-related response types
 */
export interface Proof {
  id: string;
  momentId: string;
  userId: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
}

export type ProofsResponse = PaginatedResponse<Proof>;
export type ProofResponse = ApiResponse<Proof>;

/**
 * Wallet-related response types
 */
export interface WalletBalance {
  available: number;
  pending: number;
  currency: string;
  lastUpdated: string;
}

export type WalletResponse = ApiResponse<WalletBalance>;

/**
 * Feature Flag response types
 */
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  value?: unknown;
}

export type FeatureFlagsResponse = ApiResponse<Record<string, FeatureFlag>>;

/**
 * Generic success response
 */
export interface SuccessResponse {
  success: boolean;
  message: string;
}

export type GenericSuccessResponse = ApiResponse<SuccessResponse>;
