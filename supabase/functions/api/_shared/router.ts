/**
 * API Router with Versioning Support
 *
 * Central router for all API endpoints with version management
 *
 * Usage:
 *   GET  /api/v1/moments
 *   POST /api/v1/auth/login
 *   GET  /api/v1/users/:id
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  ErrorCode,
  createErrorResponse,
  toHttpResponse,
} from '../../_shared/errorHandler.ts';
import { getCorsHeaders } from '../../_shared/security-middleware.ts';

// Route handler type
export type RouteHandler = (
  req: Request,
  params: Record<string, string>,
) => Promise<Response> | Response;

export interface Route {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: RegExp;
  handler: RouteHandler;
  paramNames?: string[];
}

/**
 * Parse URL path and extract parameters
 */
function matchRoute(
  pathname: string,
  route: Route,
): { match: boolean; params: Record<string, string> } {
  const match = pathname.match(route.path);

  if (!match) {
    return { match: false, params: {} };
  }

  const params: Record<string, string> = {};
  if (route.paramNames && match.groups) {
    route.paramNames.forEach((name) => {
      params[name] = match.groups![name];
    });
  }

  return { match: true, params };
}

/**
 * API Router Class
 */
export class APIRouter {
  private routes: Route[] = [];
  private notFoundHandler?: RouteHandler;
  private errorHandler?: (error: unknown) => Response;

  /**
   * Register a route
   */
  route(method: Route['method'], path: string, handler: RouteHandler): this {
    // Convert path string to regex with named capture groups
    const paramNames: string[] = [];
    const regexPath = path
      .replace(/:(\w+)/g, (_, name) => {
        paramNames.push(name);
        return `(?<${name}>[^/]+)`;
      })
      .replace(/\*/g, '.*');

    this.routes.push({
      method,
      path: new RegExp(`^${regexPath}$`),
      handler,
      paramNames,
    });

    return this;
  }

  /**
   * Convenience methods
   */
  get(path: string, handler: RouteHandler): this {
    return this.route('GET', path, handler);
  }

  post(path: string, handler: RouteHandler): this {
    return this.route('POST', path, handler);
  }

  put(path: string, handler: RouteHandler): this {
    return this.route('PUT', path, handler);
  }

  patch(path: string, handler: RouteHandler): this {
    return this.route('PATCH', path, handler);
  }

  delete(path: string, handler: RouteHandler): this {
    return this.route('DELETE', path, handler);
  }

  /**
   * Set custom 404 handler
   */
  setNotFoundHandler(handler: RouteHandler): this {
    this.notFoundHandler = handler;
    return this;
  }

  /**
   * Set custom error handler
   */
  setErrorHandler(handler: (error: unknown) => Response): this {
    this.errorHandler = handler;
    return this;
  }

  /**
   * Handle incoming request
   */
  async handle(req: Request): Promise<Response> {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const url = new URL(req.url);
      const pathname = url.pathname;

      // Find matching route
      for (const route of this.routes) {
        if (route.method !== req.method) continue;

        const { match, params } = matchRoute(pathname, route);
        if (match) {
          const response = await route.handler(req, params);

          // Add CORS headers to response
          const headers = new Headers(response.headers);
          Object.entries(corsHeaders).forEach(([key, value]) => {
            headers.set(key, value);
          });

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
        }
      }

      // No route matched - 404
      if (this.notFoundHandler) {
        return await this.notFoundHandler(req, {});
      }

      const error = createErrorResponse(
        `Route not found: ${req.method} ${pathname}`,
        ErrorCode.NOT_FOUND,
      );
      return toHttpResponse(error, corsHeaders);
    } catch (error) {
      // Error handling
      if (this.errorHandler) {
        return this.errorHandler(error);
      }

      const errorResponse = createErrorResponse(
        'Internal server error',
        ErrorCode.INTERNAL_SERVER_ERROR,
      );
      return toHttpResponse(errorResponse, corsHeaders);
    }
  }
}

/**
 * Create a new API router instance
 */
export function createRouter(): APIRouter {
  return new APIRouter();
}

/**
 * Start server with router
 */
export function serveRouter(router: APIRouter): void {
  serve((req) => router.handle(req));
}
