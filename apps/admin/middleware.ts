import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Security headers to protect against XSS, clickjacking, and other attacks
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  // CSP: Removed unsafe-eval to prevent XSS attacks
  // Note: If dynamic code execution is needed, use proper nonce-based CSP
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none';",
  );

  const adminSessionToken = request.cookies.get('admin_session')?.value;

  // All protected dashboard routes - synchronized with sidebar navigation
  const protectedRoutes = [
    // Main Menu
    '/ceo-briefing',
    '/command-center',
    '/alerts',
    '/dashboard',
    '/queue',
    // Management
    '/users',
    '/moments',
    '/disputes',
    '/creators',
    '/vip-management',
    '/ceremony-management',
    // Operations
    '/finance',
    '/wallet-operations',
    '/subscription-management',
    '/pricing',
    '/escrow-operations',
    '/proof-center',
    '/moderation',
    '/safety-hub',
    '/fraud-investigation',
    '/support',
    // Analytics
    '/analytics',
    '/revenue',
    '/user-lifecycle',
    '/discovery-analytics',
    '/chat-analytics',
    '/geographic',
    '/ops-center',
    // Growth
    '/notifications',
    '/campaign-builder',
    '/campaigns',
    '/promos',
    // Technology
    '/ai-center',
    '/ai-insights',
    '/system-health',
    '/integrations-monitor',
    '/feature-flags',
    '/dev-tools',
    // System
    '/team',
    '/security',
    '/audit-trail',
    '/audit-logs',
    '/compliance',
    '/settings',
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
    if (adminSessionToken) {
      return NextResponse.redirect(new URL('/queue', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // SECURITY FIX: Validate session token for protected routes
  // Previously only checked cookie presence, now validates session is active and not expired
  if (isProtectedRoute) {
    if (!adminSessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validate session token (lightweight check in middleware)
    // Full validation happens in API routes via requireAdminAuth()
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: session } = await supabase
          .from('admin_sessions')
          .select('id, expires_at')
          .eq('token_hash', adminSessionToken)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (!session) {
          // Session invalid or expired - redirect to login
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
          loginUrl.searchParams.set('reason', 'session_expired');
          return NextResponse.redirect(loginUrl);
        }
      }
    } catch (error) {
      // On error, allow through but let API routes handle full validation
      // This prevents middleware from breaking if DB is temporarily unavailable
      console.warn('Middleware session validation error:', error);
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && adminSessionToken) {
    const redirectUrl = new URL('/queue', request.url);
    return NextResponse.redirect(redirectUrl);
  }

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
