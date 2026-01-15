/**
 * Shared Middleware for Edge Functions
 * CORS handling for all edge functions
 */

/**
 * Allowed origins for CORS
 * Add your production domains here
 */
const ALLOWED_ORIGINS = [
  // Production domains
  'https://www.lovendo.xyz',
  'https://lovendo.xyz',
  'https://api.lovendo.xyz',
  // Staging/Preview domains
  'https://staging.lovendo.xyz',
  'https://preview.lovendo.xyz',
  // Vercel preview deployments
  /^https:\/\/lovendo-.*\.vercel\.app$/,
  // Local development (only in non-production)
  ...(Deno.env.get('DENO_ENV') !== 'production'
    ? [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8081',
      ]
    : []),
];

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  return ALLOWED_ORIGINS.some((allowed) => {
    if (typeof allowed === 'string') {
      return allowed === origin;
    }
    // RegExp pattern matching
    return allowed.test(origin);
  });
}

/**
 * Get CORS headers for a specific origin
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin as string,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-idempotency-key',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
}

/**
 * Legacy corsHeaders for backwards compatibility
 * @deprecated Use getCorsHeaders(origin) instead
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0] as string,
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-idempotency-key',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

export const handleCors = (req: Request): Response | null => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin');
    return new Response('ok', { headers: getCorsHeaders(origin) });
  }
  return null;
};
