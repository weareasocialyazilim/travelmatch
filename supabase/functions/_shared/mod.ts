/**
 * Shared Utilities Index
 * 
 * Central export point for all shared Edge Function utilities.
 * Import from this file for convenience:
 * 
 * import { createLogger, validate, jsonResponse } from '../_shared/mod.ts';
 */

// =============================================================================
// TYPES
// =============================================================================
export * from './types.ts';

// =============================================================================
// SUPABASE CLIENT
// =============================================================================
export {
  createSupabaseClients,
  createUserClient,
  createAdminClient,
  getAuthUser,
  requireAuth,
  isServiceRole,
  callRpc,
  getById,
} from './supabase.ts';

// =============================================================================
// RESPONSES
// =============================================================================
export {
  jsonResponse,
  createdResponse,
  noContentResponse,
  errorResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  rateLimitedResponse,
  internalErrorResponse,
  serviceUnavailableResponse,
  corsPreflightResponse,
  parseJsonBody,
  getOrigin,
  getRequestId,
} from './responses.ts';

// =============================================================================
// SECURITY & MIDDLEWARE
// =============================================================================
export {
  getCorsHeaders,
  isOriginAllowed,
  checkRateLimit,
  validateContentType,
  validateMethod,
  sanitizeString as sanitize,
  isValidUuid,
  isValidEmail,
  getClientIp,
  getUserAgent,
} from './security-middleware.ts';

// =============================================================================
// VALIDATION
// =============================================================================
export {
  // Schemas
  UUIDSchema,
  EmailSchema,
  PasswordSchema,
  PhoneSchema,
  UsernameSchema,
  DateTimeSchema,
  PositiveIntSchema,
  NonNegativeIntSchema,
  AmountSchema,
  CurrencySchema,
  PaginationSchema,
  CursorPaginationSchema,
  CoordinatesSchema,
  LocationSearchSchema,
  MomentTypeSchema,
  CreateMomentSchema,
  UpdateMomentSchema,
  SendRequestSchema,
  RespondToRequestSchema,
  UpdateProfileSchema,
  CreatePaymentSchema,
  CreateEscrowSchema,
  // Helpers
  validate,
  validateOrThrow,
  formatValidationErrors,
  sanitizeString,
  sanitizeHtml,
  escapeSqlLike,
  // Re-export zod
  z,
} from './validation.ts';

// =============================================================================
// LOGGING
// =============================================================================
export {
  Logger,
  LogLevel,
  createLogger,
  log,
} from './logger.ts';

// =============================================================================
// DISTRIBUTED TRACING
// =============================================================================
export {
  Tracer,
  createTracer,
  addTraceHeaders,
  generateTraceId,
  generateSpanId,
  parseTraceparent,
  formatTraceparent,
  type TraceContext,
  type Span,
  type SpanEvent,
} from './tracing.ts';

// =============================================================================
// DATABASE
// =============================================================================
export {
  DatabaseError,
  handleDbError,
  buildSelectQuery,
  paginatedQuery,
  encodeCursor,
  decodeCursor,
  withTransaction,
  batchOperation,
  isDeleted,
  excludeDeleted,
  createPoint,
  parsePoint,
  haversineDistance,
  type PaginatedResult,
  type CursorPaginatedResult,
} from './database.ts';

// =============================================================================
// GUARD MIDDLEWARE (Zod Schema Contracts)
// =============================================================================
export {
  createGuard,
  paginationQuery,
  cursorQuery,
  locationQuery,
  sortQuery,
  combineQuery,
  type GuardContext,
  type GuardOptions,
  type GuardHandler,
  type GuardResponse,
} from './guard-middleware.ts';

// =============================================================================
// OBSERVABILITY (Metrics & Monitoring)
// =============================================================================
export {
  metrics,
  metricsStore,
  MetricsReporter,
  HealthChecker,
  healthChecker,
  type RequestMetric,
  type FunctionStats,
  type HealthStatus,
} from './observability.ts';

// =============================================================================
// CHAOS ENGINEERING (Testing & Resilience)
// =============================================================================
export {
  chaosMonkey,
  ChaosMode,
  ChaosError,
  ChaosScenarios,
  ChaosTestRunner,
  chaosTestRunner,
  type ChaosConfig,
  type ChaosContext,
  type ChaosResult,
} from './chaos.ts';

// =============================================================================
// CONVENIENCE HELPERS
// =============================================================================

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an operation with exponential backoff
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Generate a random string
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Pick specified keys from an object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specified keys from an object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}
