/**
 * CORS Headers for Supabase Edge Functions
 *
 * SECURITY: Specific allowed origins instead of wildcard (*)
 * This prevents unauthorized domains from making API requests.
 */

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  // Production
  'https://travelmatch.app',
  'https://www.travelmatch.app',
  'https://admin.travelmatch.app',
  'https://api.travelmatch.app',
  // React Native / Mobile (uses custom scheme)
  'travelmatch://',
  // Expo development (when using expo go)
  'exp://',
];

// Development origins (only in non-production)
const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:8081',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

/**
 * Check if an origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  // Production check
  const isProduction = Deno.env.get('DENO_ENV') === 'production';

  // Allow specific origins
  if (ALLOWED_ORIGINS.includes(origin)) return true;

  // Allow dev origins in non-production
  if (!isProduction && DEV_ORIGINS.includes(origin)) return true;

  // Allow Supabase Studio (for testing)
  if (origin.includes('supabase.co') || origin.includes('supabase.com'))
    return true;

  // Mobile apps may send null or empty origin
  // We rely on apikey validation for mobile security
  if (origin === 'null' || origin === '') return true;

  return false;
}

/**
 * Get CORS headers with proper origin validation
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  // SECURITY: Never return wildcard - if origin not allowed, return empty
  // This blocks unauthorized cross-origin requests
  const allowedOrigin = isOriginAllowed(origin) ? origin || '' : '';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-supabase-auth',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Legacy corsHeaders - DEPRECATED
 * @deprecated DO NOT USE - Wildcard CORS is a security vulnerability.
 *             Use getCorsHeaders(req.headers.get('origin')) instead.
 * @security This export will be removed in the next major version.
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://travelmatch.app', // Locked to production
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-auth',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Handle CORS preflight OPTIONS request
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin');
    return new Response('ok', { headers: getCorsHeaders(origin) });
  }
  return null;
}

/**
 * Create a JSON response with CORS headers
 */
export function jsonResponse(
  data: unknown,
  status: number = 200,
  req?: Request,
): Response {
  const origin = req?.headers.get('origin') ?? null;
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create an error response with CORS headers
 */
export function errorResponse(
  message: string,
  status: number = 400,
  req?: Request,
): Response {
  const origin = req?.headers.get('origin') ?? null;
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      'Content-Type': 'application/json',
    },
  });
}
