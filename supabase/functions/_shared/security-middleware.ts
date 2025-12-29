/**
 * Security Middleware for Payment Edge Functions
 *
 * Provides reusable security features:
 * - Authentication validation
 * - Rate limiting
 * - Input sanitization
 * - CORS handling
 * - Request logging
 * - Error handling
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Logger } from './logger.ts';

const logger = new Logger('security-middleware');

/**
 * Allowed origins for CORS
 */
const ALLOWED_ORIGINS = [
  'https://travelmatch.app',
  'https://www.travelmatch.app',
  'https://api.travelmatch.app',
  'https://staging.travelmatch.app',
  /^https:\/\/travelmatch-.*\.vercel\.app$/,
  ...(Deno.env.get('DENO_ENV') !== 'production'
    ? [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8081',
      ]
    : []),
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((allowed) =>
    typeof allowed === 'string' ? allowed === origin : allowed.test(origin),
  );
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin as string,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
}

/** @deprecated Use getCorsHeaders(origin) instead */
export const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0] as string,
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

export interface AuthContext {
  user: {
    id: string;
    email?: string;
    role?: string;
  };
  supabase: SupabaseClient;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Rate limiter using in-memory Map
 * For production, consider using Redis or Supabase Edge Functions KV
 */
export class RateLimiter {
  private requests = new Map<string, { count: number; resetAt: number }>();

  constructor(private config: RateLimitConfig) {}

  check(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    const userLimit = this.requests.get(identifier);

    if (!userLimit || now > userLimit.resetAt) {
      this.requests.set(identifier, {
        count: 1,
        resetAt: now + this.config.windowMs,
      });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetAt: now + this.config.windowMs,
      };
    }

    if (userLimit.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: userLimit.resetAt,
      };
    }

    userLimit.count++;
    return {
      allowed: true,
      remaining: this.config.maxRequests - userLimit.count,
      resetAt: userLimit.resetAt,
    };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetAt) {
        this.requests.delete(key);
      }
    }
  }
}

/**
 * Authenticate request and return user context
 */
export async function authenticateRequest(req: Request): Promise<AuthContext> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    supabase,
  };
}

/**
 * Log request for audit trail
 */
export async function logRequest(
  supabase: SupabaseClient,
  userId: string,
  action: string,
  metadata: Record<string, any>,
  req: Request,
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      metadata,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(
      'Failed to log request',
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potentially dangerous characters
    return input.replace(/[<>]/g, '').trim().slice(0, 1000); // Limit length
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

/**
 * Create standardized error response
 * @param origin - Optional origin for CORS validation
 */
export function errorResponse(
  message: string,
  status: number = 400,
  details?: any,
  origin?: string | null,
): Response {
  const headers = getCorsHeaders(origin);
  return new Response(
    JSON.stringify({
      error: message,
      ...(details && { details }),
    }),
    {
      status,
      headers: { ...headers, 'Content-Type': 'application/json' },
    },
  );
}

/**
 * Create standardized success response
 * @param origin - Optional origin for CORS validation
 */
export function successResponse(
  data: any,
  status: number = 200,
  origin?: string | null,
): Response {
  const headers = getCorsHeaders(origin);
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

/**
 * Handle CORS preflight requests
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin');
    const headers = getCorsHeaders(origin);
    return new Response('ok', { headers });
  }
  return null;
}

/**
 * Validate amount to prevent overflow and negative values
 */
export function validateAmount(amount: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Number.isFinite(amount)) {
    errors.push({ field: 'amount', message: 'Amount must be a valid number' });
  }

  if (amount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be greater than 0' });
  }

  if (amount > 1000000) {
    errors.push({
      field: 'amount',
      message: 'Amount exceeds maximum allowed',
    });
  }

  // Check for too many decimal places (max 2 for currency)
  if (amount.toString().split('.')[1]?.length > 2) {
    errors.push({
      field: 'amount',
      message: 'Amount can have maximum 2 decimal places',
    });
  }

  return errors;
}

/**
 * Validate currency code
 */
export function validateCurrency(currency: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const validCurrencies = ['USD', 'EUR', 'GBP', 'TRY'];

  if (!currency || currency.length !== 3) {
    errors.push({
      field: 'currency',
      message: 'Currency must be a 3-letter code',
    });
  }

  if (!validCurrencies.includes(currency.toUpperCase())) {
    errors.push({
      field: 'currency',
      message: `Currency must be one of: ${validCurrencies.join(', ')}`,
    });
  }

  return errors;
}

/**
 * Validate UUID format
 */
export function validateUUID(
  uuid: string,
  fieldName: string,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(uuid)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be a valid UUID`,
    });
  }

  return errors;
}

/**
 * Comprehensive request validator
 */
export function validateRequest(
  data: any,
  rules: {
    field: string;
    type: 'string' | 'number' | 'uuid' | 'amount' | 'currency';
    required?: boolean;
    maxLength?: number;
  }[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    const value = data[rule.field];

    // Check required
    if (
      rule.required &&
      (value === undefined || value === null || value === '')
    ) {
      errors.push({
        field: rule.field,
        message: `${rule.field} is required`,
      });
      continue;
    }

    if (value === undefined || value === null) continue;

    // Type-specific validation
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be a string`,
          });
        } else if (rule.maxLength && value.length > rule.maxLength) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be at most ${rule.maxLength} characters`,
          });
        }
        break;

      case 'number':
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be a valid number`,
          });
        }
        break;

      case 'uuid':
        errors.push(...validateUUID(value, rule.field));
        break;

      case 'amount':
        errors.push(...validateAmount(value));
        break;

      case 'currency':
        errors.push(...validateCurrency(value));
        break;
    }
  }

  return errors;
}

/**
 * Middleware wrapper for Edge Functions
 * Handles common concerns: CORS, auth, rate limiting, error handling
 */
export function withMiddleware(
  handler: (req: Request, context: AuthContext) => Promise<Response>,
  options?: {
    requireAuth?: boolean;
    rateLimit?: RateLimitConfig;
    logAction?: string;
  },
): (req: Request) => Promise<Response> {
  const rateLimiter = options?.rateLimit
    ? new RateLimiter(options.rateLimit)
    : null;

  return async (req: Request): Promise<Response> => {
    try {
      // Handle CORS
      const corsResponse = handleCors(req);
      if (corsResponse) return corsResponse;

      // Authenticate if required
      let context: AuthContext | undefined;
      if (options?.requireAuth !== false) {
        context = await authenticateRequest(req);

        // Rate limiting
        if (rateLimiter) {
          const rateLimit = rateLimiter.check(context.user.id);
          if (!rateLimit.allowed) {
            const origin = req.headers.get('origin');
            return errorResponse('Rate limit exceeded', 429, undefined, origin);
          }
        }

        // Log request
        if (options?.logAction && context) {
          await logRequest(
            context.supabase,
            context.user.id,
            options.logAction,
            {},
            req,
          );
        }
      }

      // Call handler
      return await handler(req, context!);
    } catch (error) {
      logger.error(
        'Middleware error',
        error instanceof Error ? error : new Error(String(error)),
      );
      const origin = req.headers.get('origin');

      if (
        error.message === 'Unauthorized' ||
        error.message === 'Missing authorization header'
      ) {
        return errorResponse(error.message, 401, undefined, origin);
      }

      return errorResponse(
        error.message || 'Internal server error',
        500,
        undefined,
        origin,
      );
    }
  };
}
