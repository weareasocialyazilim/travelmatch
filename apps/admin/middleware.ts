import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// ============================================================================
// CSRF Protection
// ============================================================================

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Generate a cryptographically secure CSRF token
 */
function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

/**
 * Validate CSRF token from header matches cookie
 */
function validateCsrfToken(request: NextRequest): boolean {
  const method = request.method.toUpperCase();

  // Safe methods don't need CSRF validation
  if (CSRF_SAFE_METHODS.includes(method)) {
    return true;
  }

  // Skip CSRF for API routes (they use different auth mechanisms)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return true;
  }

  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    console.warn('[CSRF] Missing token', {
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken,
      path: request.nextUrl.pathname,
    });
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    mismatch |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }

  return mismatch === 0;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // ============================================================================
  // CSRF Token Management
  // ============================================================================

  // Generate CSRF token if not present
  let csrfToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!csrfToken) {
    csrfToken = generateCsrfToken();
  }

  // Validate CSRF for state-changing requests
  if (!CSRF_SAFE_METHODS.includes(request.method.toUpperCase())) {
    if (!validateCsrfToken(request)) {
      console.error('[CSRF] Token validation failed', {
        path: request.nextUrl.pathname,
        method: request.method,
      });
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 },
      );
    }
  }

  // ============================================================================
  // Supabase Auth
  // ============================================================================

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    },
  );

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // All protected dashboard routes
  const protectedRoutes = [
    '/queue',
    '/dashboard',
    '/users',
    '/moments',
    '/disputes',
    '/finance',
    '/revenue',
    '/pricing',
    '/settings',
    '/analytics',
    '/support',
    '/trust-safety',
    '/safety-center',
    '/customer-success',
    '/admin-users',
    '/team',
    '/notifications',
    '/campaigns',
    '/events',
    '/gamification',
    '/promos',
    '/partners',
    '/ai-center',
    '/automation',
    '/integrations',
    '/dev-tools',
    '/feature-flags',
    '/geographic',
    '/ops-center',
    '/incidents',
    '/errors',
    '/editorial',
    '/knowledge-base',
    '/feedback',
    '/localization',
    '/accessibility',
    '/creators',
    '/audit-logs',
  ];

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith(route + '/'),
  );

  // Auth routes
  const isAuthRoute =
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname.startsWith('/2fa');

  // Root redirect
  if (request.nextUrl.pathname === '/') {
    if (session) {
      return NextResponse.redirect(new URL('/queue', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    const redirectUrl = new URL('/queue', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // ============================================================================
  // Set CSRF Cookie
  // ============================================================================

  // Always set/refresh CSRF token cookie
  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  // Also expose token in response header for client to read
  response.headers.set('x-csrf-token', csrfToken);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
