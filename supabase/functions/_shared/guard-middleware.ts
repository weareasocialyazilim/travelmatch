/**
 * Zod Guard Middleware for Edge Functions
 *
 * Automatic request validation using Zod schemas.
 * Provides type-safe handlers with validated input.
 *
 * Features:
 * - Body validation with Zod schemas
 * - Query parameter validation
 * - Path parameter extraction
 * - Type-safe handler functions
 * - Automatic error responses
 * - Request context injection
 *
 * Usage:
 * ```ts
 * import { createGuard, CreateMomentSchema } from '../_shared/mod.ts';
 *
 * const handler = createGuard({
 *   body: CreateMomentSchema,
 *   auth: 'required',
 * }, async ({ body, user, tracer }) => {
 *   // body is fully typed based on CreateMomentSchema
 *   // user is the authenticated user
 *   return { success: true, data: body };
 * });
 *
 * serve(handler);
 * ```
 */

import { z } from 'https://esm.sh/zod@3.22.4';
import { getCorsHeaders } from './security-middleware.ts';
import { createLogger, Logger } from './logger.ts';
import { createTracer, Tracer, addTraceHeaders } from './tracing.ts';
import { createSupabaseClients, getAuthUser } from './supabase.ts';
import { metrics } from './observability.ts';
import type { SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';

// =============================================================================
// TYPES
// =============================================================================

export interface GuardContext<TBody = unknown, TQuery = unknown, TParams = Record<string, string>> {
  request: Request;
  body: TBody;
  query: TQuery;
  params: TParams;
  user: User | null;
  supabase: SupabaseClient;
  supabaseAdmin: SupabaseClient;
  logger: Logger;
  tracer: Tracer;
  headers: Record<string, string>;
}

export interface GuardOptions<
  TBodySchema extends z.ZodTypeAny = z.ZodTypeAny,
  TQuerySchema extends z.ZodTypeAny = z.ZodTypeAny,
  TParamsSchema extends z.ZodTypeAny = z.ZodTypeAny,
> {
  /** Zod schema for request body validation */
  body?: TBodySchema;
  /** Zod schema for query parameter validation */
  query?: TQuerySchema;
  /** Zod schema for path parameter validation */
  params?: TParamsSchema;
  /** Authentication requirement */
  auth?: 'required' | 'optional' | 'none';
  /** Allowed HTTP methods */
  methods?: ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')[];
  /** Function name for logging */
  functionName?: string;
}

export type GuardHandler<
  TBody = unknown,
  TQuery = unknown,
  TParams = Record<string, string>,
> = (ctx: GuardContext<TBody, TQuery, TParams>) => Promise<unknown>;

export interface GuardResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  errors?: Record<string, string[]>;
}

// =============================================================================
// RESPONSE HELPERS
// =============================================================================

function jsonResponse(data: GuardResponse, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

function validationErrorResponse(errors: z.ZodError, headers: Record<string, string>): Response {
  const formatted: Record<string, string[]> = {};

  for (const error of errors.errors) {
    const path = error.path.join('.') || '_root';
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(error.message);
  }

  return jsonResponse(
    {
      success: false,
      error: 'Validation failed',
      errors: formatted,
    },
    400,
    headers
  );
}

// =============================================================================
// QUERY PARSER
// =============================================================================

function parseQueryParams(url: URL): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  for (const [key, value] of url.searchParams.entries()) {
    // Try to parse as JSON for complex types
    try {
      // Check if it looks like a number
      if (/^-?\d+(\.\d+)?$/.test(value)) {
        params[key] = parseFloat(value);
      }
      // Check if it looks like boolean
      else if (value === 'true' || value === 'false') {
        params[key] = value === 'true';
      }
      // Check if it looks like JSON array or object
      else if (value.startsWith('[') || value.startsWith('{')) {
        params[key] = JSON.parse(value);
      }
      // Default to string
      else {
        params[key] = value;
      }
    } catch (parseParamError) {
      params[key] = value;
    }
  }

  return params;
}

// =============================================================================
// PATH PARSER
// =============================================================================

function extractPathParams(url: URL, pattern?: RegExp): Record<string, string> {
  if (!pattern) return {};

  const match = url.pathname.match(pattern);
  if (!match?.groups) return {};

  return match.groups;
}

// =============================================================================
// GUARD FACTORY
// =============================================================================

/**
 * Create a guarded Edge Function handler with automatic validation
 */
export function createGuard<
  TBodySchema extends z.ZodTypeAny = z.ZodUnknown,
  TQuerySchema extends z.ZodTypeAny = z.ZodUnknown,
  TParamsSchema extends z.ZodTypeAny = z.ZodUnknown,
>(
  options: GuardOptions<TBodySchema, TQuerySchema, TParamsSchema>,
  handler: GuardHandler<
    z.infer<TBodySchema>,
    z.infer<TQuerySchema>,
    z.infer<TParamsSchema>
  >
): (req: Request) => Promise<Response> {
  const {
    body: bodySchema,
    query: querySchema,
    params: paramsSchema,
    auth = 'optional',
    methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    functionName = 'guard',
  } = options;

  return async (req: Request): Promise<Response> => {
    const startTime = performance.now();
    const url = new URL(req.url);
    const origin = req.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);
    const logger = createLogger(functionName, req);
    const tracer = createTracer(functionName, req);

    // Helper to record metrics and return response
    const withMetrics = (response: Response, status: number): Response => {
      const durationMs = performance.now() - startTime;
      metrics.recordRequest(functionName, status, durationMs, {
        traceId: tracer.getTraceId(),
        spanId: tracer.getCurrentSpanId(),
      });
      return response;
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // Validate HTTP method
      if (!methods.includes(req.method as typeof methods[number])) {
        const response = jsonResponse(
          {
            success: false,
            error: `Method ${req.method} not allowed`,
          },
          405,
          corsHeaders
        );
        return withMetrics(response, 405);
      }

      // Initialize Supabase clients
      const { userClient, adminClient } = createSupabaseClients(req);

      // Validate authentication
      let user: User | null = null;
      if (auth !== 'none') {
        user = await tracer.trace('auth.getUser', async () => {
          return await getAuthUser(userClient);
        });

        if (auth === 'required' && !user) {
          const response = jsonResponse(
            {
              success: false,
              error: 'Authentication required',
            },
            401,
            corsHeaders
          );
          return withMetrics(response, 401);
        }
      }

      // Parse and validate body
      let body: z.infer<TBodySchema> = undefined as unknown as z.infer<TBodySchema>;
      if (bodySchema && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const rawBody = await tracer.trace('validation.parseBody', async () => {
          const contentType = req.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            return await req.json();
          }
          return {};
        });

        const result = bodySchema.safeParse(rawBody);
        if (!result.success) {
          tracer.addEvent('validation.bodyFailed', {
            errorCount: result.error.errors.length,
          });
          const response = validationErrorResponse(result.error, corsHeaders);
          return withMetrics(addTraceHeaders(response, tracer), 400);
        }
        body = result.data;
      }

      // Parse and validate query params
      let query: z.infer<TQuerySchema> = {} as z.infer<TQuerySchema>;
      if (querySchema) {
        const rawQuery = parseQueryParams(url);
        const result = querySchema.safeParse(rawQuery);
        if (!result.success) {
          tracer.addEvent('validation.queryFailed', {
            errorCount: result.error.errors.length,
          });
          const response = validationErrorResponse(result.error, corsHeaders);
          return withMetrics(addTraceHeaders(response, tracer), 400);
        }
        query = result.data;
      }

      // Parse path params (basic implementation)
      let params: z.infer<TParamsSchema> = {} as z.infer<TParamsSchema>;
      if (paramsSchema) {
        // Extract path segments as params
        const pathSegments = url.pathname.split('/').filter(Boolean);
        const rawParams: Record<string, string> = {};
        pathSegments.forEach((segment, index) => {
          rawParams[`segment${index}`] = segment;
        });

        const result = paramsSchema.safeParse(rawParams);
        if (!result.success) {
          const response = validationErrorResponse(result.error, corsHeaders);
          return withMetrics(addTraceHeaders(response, tracer), 400);
        }
        params = result.data;
      }

      // Build context
      const ctx: GuardContext<z.infer<TBodySchema>, z.infer<TQuerySchema>, z.infer<TParamsSchema>> = {
        request: req,
        body,
        query,
        params,
        user,
        supabase: userClient,
        supabaseAdmin: adminClient,
        logger,
        tracer,
        headers: corsHeaders,
      };

      // Execute handler
      const result = await tracer.trace('handler.execute', async () => {
        return await handler(ctx);
      });

      // Build response
      tracer.finish();

      const response = jsonResponse(
        {
          success: true,
          data: result,
        },
        200,
        corsHeaders
      );

      return withMetrics(addTraceHeaders(response, tracer), 200);

    } catch (error) {
      logger.error('Guard handler error', error as Error);
      tracer.recordException(error as Error);
      tracer.finish();

      // Handle Zod errors that might have slipped through
      if (error instanceof z.ZodError) {
        const response = validationErrorResponse(error, corsHeaders);
        return withMetrics(addTraceHeaders(response, tracer), 400);
      }

      const errorResponse = jsonResponse(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        },
        500,
        corsHeaders
      );

      // Record error type for observability
      const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
      metrics.recordRequest(functionName, 500, performance.now() - startTime, {
        traceId: tracer.getTraceId(),
        spanId: tracer.getCurrentSpanId(),
        errorType,
      });

      return addTraceHeaders(errorResponse, tracer);
    }
  };
}

// =============================================================================
// SCHEMA BUILDER HELPERS
// =============================================================================

/**
 * Create a pagination query schema
 */
export function paginationQuery() {
  return z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
  });
}

/**
 * Create a cursor pagination query schema
 */
export function cursorQuery() {
  return z.object({
    cursor: z.string().optional(),
    limit: z.number().int().positive().max(100).default(20),
  });
}

/**
 * Create a location search query schema
 */
export function locationQuery() {
  return z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    radius: z.number().positive().max(500).default(50),
  });
}

/**
 * Create a sort query schema
 */
export function sortQuery<T extends string>(fields: readonly T[]) {
  return z.object({
    sortBy: z.enum(fields as [T, ...T[]]).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  });
}

/**
 * Combine multiple query schemas
 */
export function combineQuery<T extends z.ZodRawShape[]>(...schemas: T) {
  return z.object(
    schemas.reduce((acc, schema) => {
      if (schema instanceof z.ZodObject) {
        return { ...acc, ...schema.shape };
      }
      return acc;
    }, {} as z.ZodRawShape)
  );
}

// Re-export z for convenience
export { z };
