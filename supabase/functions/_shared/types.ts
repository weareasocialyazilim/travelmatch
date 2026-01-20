/**
 * Shared Type Definitions for Lovendo Edge Functions
 *
 * This file contains TypeScript interfaces and types used across
 * multiple Edge Functions to ensure type safety and consistency.
 */

// =============================================================================
// DATABASE TYPES
// =============================================================================

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  verified: boolean;
  kyc_status: 'none' | 'pending' | 'verified' | 'rejected';
  balance: number;
  rating: number;
  review_count: number;
  push_token: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Moment {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: MomentCategory;
  location: string;
  coordinates: { lat: number; lng: number } | null;
  date: string;
  time_start: string | null;
  time_end: string | null;
  price: number;
  max_participants: number;
  status: MomentStatus;
  image_id: string | null;
  blurhash: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export type MomentCategory =
  | 'adventure'
  | 'food'
  | 'culture'
  | 'nightlife'
  | 'sports'
  | 'wellness'
  | 'nature'
  | 'shopping'
  | 'other';

export type MomentStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface Request {
  id: string;
  user_id: string;
  moment_id: string;
  message: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string | null;
  moment_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'payment'
  | 'refund'
  | 'escrow_hold'
  | 'escrow_release'
  | 'escrow_refund'
  | 'transfer_in'
  | 'transfer_out';

export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface EscrowTransaction {
  id: string;
  sender_id: string;
  recipient_id: string;
  amount: number;
  moment_id: string | null;
  status: EscrowStatus;
  release_condition: string;
  expires_at: string;
  released_at: string | null;
  proof_verified: boolean;
  proof_verification_date: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type EscrowStatus = 'pending' | 'released' | 'refunded' | 'expired';

export interface Conversation {
  id: string;
  participant_ids: string[];
  moment_id: string | null;
  last_message_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: MessageType;
  metadata: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export type MessageType = 'text' | 'image' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

export type NotificationType =
  | 'message'
  | 'request'
  | 'payment'
  | 'review'
  | 'system'
  | 'promo';

// =============================================================================
// API TYPES
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  timestamp: string;
  requestId?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  cursor?: string;
}

// =============================================================================
// AUTH TYPES
// =============================================================================

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  role?: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
}

export interface JWTPayload {
  sub: string;
  email?: string;
  phone?: string;
  role?: string;
  aud: string;
  exp: number;
  iat: number;
  iss: string;
}

// =============================================================================
// PAYMENT TYPES
// =============================================================================

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
  metadata: Record<string, string>;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  momentId?: string;
  recipientId?: string;
  description?: string;
}

export interface TransferFundsRequest {
  recipientId: string;
  amount: number;
  momentId?: string;
  description?: string;
}

// =============================================================================
// WEBHOOK TYPES
// =============================================================================

export interface PayTRWebhookEvent {
  merchant_oid: string;
  status: 'success' | 'failed';
  total_amount: number;
  hash: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  payment_type?: string;
  currency?: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// =============================================================================
// CONSTANTS
// =============================================================================

export const ERROR_CODES = {
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Payment errors
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ESCROW_ERROR: 'ESCROW_ERROR',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
