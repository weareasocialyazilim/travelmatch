/**
 * Admin Panel Authentication Middleware
 *
 * SECURITY: This middleware protects ALL admin routes.
 * It validates session tokens and redirects unauthenticated users to login.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Create Supabase client with service role for session validation
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Public paths that don't require authentication
  const PUBLIC_PATHS = [
    '/api/health',
    '/api/healthz',
    '/api/ready',
  ];

  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return supabaseResponse;
  }

  // Check for admin session token
  const adminSessionToken = request.cookies.get('admin_session_token')?.value;
  const adminSessionId = request.cookies.get('admin_session_id')?.value;

  // Redirect unauthenticated users to login
  if (!adminSessionToken || !adminSessionId) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate session in database
  const { data: session, error } = await supabase
    .from('admin_sessions')
    .select('*, admin_users(*)')
    .eq('id', adminSessionId)
    .eq('is_active', true)
    .single();

  // Invalid or expired session
  if (error || !session || session.expires_at < new Date().toISOString()) {
    // Clear invalid session cookies
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('admin_session_token');
    response.cookies.delete('admin_session_id');
    return response;
  }

  // Check IP consistency (optional security measure)
  // Get IP from headers - request.ip doesn't exist in all Next.js versions
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';

  if (session.ip_hash && session.ip_hash !== hashIP(clientIP)) {
    // Session from different IP - invalidate and require re-auth
    await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('id', session.id);

    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('admin_session_token');
    response.cookies.delete('admin_session_id');
    return response;
  }

  // Update last activity
  await supabase
    .from('admin_sessions')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', session.id);

  // Add user info to headers for downstream use
  supabaseResponse.headers.set('x-admin-user-id', session.admin_users.id);
  supabaseResponse.headers.set('x-admin-user-email', session.admin_users.email);
  supabaseResponse.headers.set('x-admin-role', session.admin_users.role);

  return supabaseResponse;
}

// Simple IP hashing for session binding
function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export const config = {
  /**
   * Match all request paths except:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public folder
   */
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - static files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/health|api/healthz|api/ready).*)',
  ],
};
