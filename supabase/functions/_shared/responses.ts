/**
 * Response Helpers for Edge Functions
 * 
 * Standardized response formatting for consistent API responses.
 */

import { getCorsHeaders } from './security-middleware.ts';
import { ApiResponse, ApiError, ERROR_CODES, HTTP_STATUS } from './types.ts';

// =============================================================================
// SUCCESS RESPONSES
// =============================================================================

/**
 * Create a success JSON response
 */
export function jsonResponse<T>(
  data: T,
  options: {
    status?: number;
    origin?: string | null;
    headers?: Record<string, string>;
  } = {}
): Response {
  const { status = 200, origin = null, headers = {} } = options;

  const body: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin),
      ...headers,
    },
  });
}

/**
 * Create a created (201) response
 */
export function createdResponse<T>(
  data: T,
  origin?: string | null
): Response {
  return jsonResponse(data, { status: HTTP_STATUS.CREATED, origin });
}

/**
 * Create a no content (204) response
 */
export function noContentResponse(origin?: string | null): Response {
  return new Response(null, {
    status: HTTP_STATUS.NO_CONTENT,
    headers: getCorsHeaders(origin),
  });
}

// =============================================================================
// ERROR RESPONSES
// =============================================================================

/**
 * Create an error JSON response
 */
export function errorResponse(
  error: ApiError | string,
  options: {
    status?: number;
    origin?: string | null;
  } = {}
): Response {
  const { status = 400, origin = null } = options;

  const apiError: ApiError = typeof error === 'string'
    ? { code: ERROR_CODES.INTERNAL_ERROR, message: error }
    : error;

  const body: ApiResponse = {
    success: false,
    error: apiError,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin),
    },
  });
}

/**
 * 400 Bad Request
 */
export function badRequestResponse(
  message: string,
  details?: Record<string, unknown>,
  origin?: string | null
): Response {
  return errorResponse(
    {
      code: ERROR_CODES.VALIDATION_ERROR,
      message,
      details,
    },
    { status: HTTP_STATUS.BAD_REQUEST, origin }
  );
}

/**
 * 401 Unauthorized
 */
export function unauthorizedResponse(
  message = 'Authentication required',
  origin?: string | null
): Response {
  return errorResponse(
    {
      code: ERROR_CODES.UNAUTHORIZED,
      message,
    },
    { status: HTTP_STATUS.UNAUTHORIZED, origin }
  );
}

/**
 * 403 Forbidden
 */
export function forbiddenResponse(
  message = 'Access denied',
  origin?: string | null
): Response {
  return errorResponse(
    {
      code: ERROR_CODES.FORBIDDEN,
      message,
    },
    { status: HTTP_STATUS.FORBIDDEN, origin }
  );
}

/**
 * 404 Not Found
 */
export function notFoundResponse(
  resource = 'Resource',
  origin?: string | null
): Response {
  return errorResponse(
    {
      code: ERROR_CODES.NOT_FOUND,
      message: `${resource} not found`,
    },
    { status: HTTP_STATUS.NOT_FOUND, origin }
  );
}

/**
 * 409 Conflict
 */
export function conflictResponse(
  message: string,
  origin?: string | null
): Response {
  return errorResponse(
    {
      code: ERROR_CODES.CONFLICT,
      message,
    },
    { status: HTTP_STATUS.CONFLICT, origin }
  );
}

/**
 * 429 Too Many Requests
 */
export function rateLimitedResponse(
  retryAfter: number,
  origin?: string | null
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: ERROR_CODES.RATE_LIMITED,
        message: 'Too many requests. Please try again later.',
      },
      meta: {
        timestamp: new Date().toISOString(),
        retryAfter,
      },
    }),
    {
      status: HTTP_STATUS.TOO_MANY_REQUESTS,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        ...getCorsHeaders(origin),
      },
    }
  );
}

/**
 * 500 Internal Server Error
 */
export function internalErrorResponse(
  message = 'Internal server error',
  origin?: string | null
): Response {
  return errorResponse(
    {
      code: ERROR_CODES.INTERNAL_ERROR,
      message,
    },
    { status: HTTP_STATUS.INTERNAL_SERVER_ERROR, origin }
  );
}

/**
 * 503 Service Unavailable
 */
export function serviceUnavailableResponse(
  message = 'Service temporarily unavailable',
  origin?: string | null
): Response {
  return errorResponse(
    {
      code: ERROR_CODES.SERVICE_UNAVAILABLE,
      message,
    },
    { status: HTTP_STATUS.SERVICE_UNAVAILABLE, origin }
  );
}

// =============================================================================
// CORS RESPONSE
// =============================================================================

/**
 * Handle OPTIONS preflight request
 */
export function corsPreflightResponse(origin?: string | null): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Parse JSON body with error handling
 */
export async function parseJsonBody<T = unknown>(
  request: Request
): Promise<T> {
  try {
    const text = await request.text();
    if (!text) {
      throw new Error('Empty request body');
    }
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Get origin from request
 */
export function getOrigin(request: Request): string | null {
  return request.headers.get('Origin');
}

/**
 * Extract request ID for tracing
 */
export function getRequestId(request: Request): string {
  return request.headers.get('x-request-id') || crypto.randomUUID();
}
