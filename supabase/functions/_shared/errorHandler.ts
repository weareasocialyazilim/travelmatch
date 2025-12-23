/**
 * Standard Error Response Handler for Edge Functions
 *
 * Provides consistent error formatting across all edge functions
 * Format: { message: string, code: string }
 */

// Environment check (Deno)
const __DEV__ = Deno.env.get('ENVIRONMENT') === 'development';

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Payment
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_PAYMENT_METHOD = 'INVALID_PAYMENT_METHOD',
  
  // External Services
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  STRIPE_ERROR = 'STRIPE_ERROR',
  GEOCODING_ERROR = 'GEOCODING_ERROR',
  
  // Generic
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export interface ErrorResponse {
  message: string;
  code: ErrorCode;
  details?: Record<string, any>;
  statusCode?: number;
}

export interface SuccessResponse<T = any> {
  data: T;
  message?: string;
}

const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  // 400 Bad Request
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.BAD_REQUEST]: 400,
  
  // 401 Unauthorized
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  
  // 403 Forbidden
  [ErrorCode.FORBIDDEN]: 403,
  
  // 404 Not Found
  [ErrorCode.NOT_FOUND]: 404,
  
  // 409 Conflict
  [ErrorCode.ALREADY_EXISTS]: 409,
  [ErrorCode.CONFLICT]: 409,
  
  // 429 Too Many Requests
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  
  // 402 Payment Required / 4xx Payment Errors
  [ErrorCode.PAYMENT_FAILED]: 402,
  [ErrorCode.INSUFFICIENT_FUNDS]: 402,
  [ErrorCode.INVALID_PAYMENT_METHOD]: 400,
  
  // 500 Internal Server Error
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 500,
  [ErrorCode.STRIPE_ERROR]: 500,
  [ErrorCode.GEOCODING_ERROR]: 500,
  
  // 503 Service Unavailable
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
};

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  code: ErrorCode,
  details?: Record<string, any>,
): ErrorResponse {
  return {
    message,
    code,
    details,
    statusCode: ERROR_STATUS_MAP[code] || 500,
  };
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
): SuccessResponse<T> {
  return {
    data,
    ...(message && { message }),
  };
}

/**
 * Convert ErrorResponse to HTTP Response
 */
export function toHttpResponse(
  error: ErrorResponse,
  headers: Record<string, string> = {},
): Response {
  const statusCode = error.statusCode || ERROR_STATUS_MAP[error.code] || 500;
  
  return new Response(
    JSON.stringify({
      message: error.message,
      code: error.code,
      ...(error.details && { details: error.details }),
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    },
  );
}

/**
 * Convert SuccessResponse to HTTP Response
 */
export function toHttpSuccessResponse<T>(
  success: SuccessResponse<T>,
  statusCode: number = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(
    JSON.stringify(success),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    },
  );
}

/**
 * Handle rate limit errors
 */
export function createRateLimitError(
  retryAfter: number,
  remaining: number = 0,
): { response: Response; headers: Record<string, string> } {
  const error = createErrorResponse(
    'Too many requests. Please try again later.',
    ErrorCode.RATE_LIMIT_EXCEEDED,
    { retryAfter, remaining },
  );
  
  const headers = {
    'Retry-After': String(retryAfter),
    'X-RateLimit-Remaining': String(remaining),
  };
  
  return {
    response: toHttpResponse(error, headers),
    headers,
  };
}

/**
 * Handle validation errors from Zod
 */
export function createValidationError(
  fieldErrors: Record<string, string[]>,
): ErrorResponse {
  return createErrorResponse(
    'Validation failed',
    ErrorCode.VALIDATION_ERROR,
    { fields: fieldErrors },
  );
}

/**
 * Parse and standardize external API errors
 */
export function parseExternalError(
  error: any,
  service: 'stripe' | 'geocoding' | 'other',
): ErrorResponse {
  const serviceCodeMap = {
    stripe: ErrorCode.STRIPE_ERROR,
    geocoding: ErrorCode.GEOCODING_ERROR,
    other: ErrorCode.EXTERNAL_SERVICE_ERROR,
  };
  
  return createErrorResponse(
    error.message || 'External service error',
    serviceCodeMap[service],
    {
      originalError: error.type || error.code,
      service,
    },
  );
}

/**
 * Catch-all error handler for unexpected errors
 */
export function handleUnexpectedError(error: unknown): ErrorResponse {
  console.error('Unexpected error:', error);
  
  if (error instanceof Error) {
    return createErrorResponse(
      __DEV__ ? error.message : 'An unexpected error occurred',
      ErrorCode.INTERNAL_SERVER_ERROR,
      __DEV__ ? { stack: error.stack } : undefined,
    );
  }
  
  return createErrorResponse(
    'An unexpected error occurred',
    ErrorCode.INTERNAL_SERVER_ERROR,
  );
}

/**
 * Check if error is a known Supabase auth error
 */
export function handleSupabaseAuthError(error: any): ErrorResponse {
  const authErrorMap: Record<string, ErrorCode> = {
    'invalid_credentials': ErrorCode.INVALID_CREDENTIALS,
    'user_not_found': ErrorCode.NOT_FOUND,
    'email_exists': ErrorCode.ALREADY_EXISTS,
    'weak_password': ErrorCode.VALIDATION_ERROR,
  };
  
  const code = authErrorMap[error.code] || ErrorCode.UNAUTHORIZED;
  
  return createErrorResponse(
    error.message || 'Authentication failed',
    code,
    { supabaseCode: error.code },
  );
}
