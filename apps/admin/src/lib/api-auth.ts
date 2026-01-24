/**
 * API Route Authentication Helper
 *
 * SECURITY: All admin API routes must verify the admin session token
 * from the cookie, not just check for cookie presence.
 *
 * Usage:
 * ```typescript
 * import { requireAdminAuth } from '@/lib/api-auth';
 *
 * export async function GET(request: Request) {
 *   const auth = await requireAdminAuth();
 *   if (auth.error) return auth.error;
 *
 *   // Use auth.adminId and auth.adminEmail in your logic
 *   const adminId = auth.adminId;
 * }
 * ```
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServiceClient } from './supabase';

export interface AdminAuthResult {
  error?: NextResponse;
  adminId?: string;
  adminEmail?: string;
  adminRole?: string;
}

/**
 * Require admin authentication for API routes
 *
 * SECURITY FIX: Previously, API routes used createServiceClient() without
 * verifying the admin_session cookie. This helper ensures the session is
 * valid and not expired before allowing access.
 *
 * @returns AdminAuthResult with either error response or admin details
 */
export async function requireAdminAuth(): Promise<AdminAuthResult> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!sessionToken) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - No session' },
        { status: 401 }
      ),
    };
  }

  const supabase = createServiceClient();

  // Verify session exists, is valid, and not expired
  const { data: session, error } = await supabase
    .from('admin_sessions')
    .select(`
      admin_id,
      admin_users!inner(
        email,
        role,
        is_active
      )
    `)
    .eq('token_hash', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Invalid or expired session' },
        { status: 401 }
      ),
    };
  }

  // Check if admin is active
  const adminUser = session.admin_users as unknown as {
    email: string;
    role: string;
    is_active: boolean;
  };

  if (!adminUser?.is_active) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Account is inactive' },
        { status: 401 }
      ),
    };
  }

  return {
    adminId: session.admin_id,
    adminEmail: adminUser.email,
    adminRole: adminUser.role,
  };
}

/**
 * Require admin authentication with specific role(s)
 *
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns AdminAuthResult with either error response or admin details
 */
export async function requireAdminRole(
  allowedRoles: string[]
): Promise<AdminAuthResult> {
  const auth = await requireAdminAuth();

  if (auth.error) {
    return auth;
  }

  if (!auth.adminRole || !allowedRoles.includes(auth.adminRole)) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return auth;
}

/**
 * Optional admin authentication (doesn't fail if not authenticated)
 * Useful for routes that behave differently based on auth status
 *
 * @returns AdminAuthResult with admin details or undefined if not authenticated
 */
export async function optionalAdminAuth(): Promise<AdminAuthResult> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!sessionToken) {
    return {};
  }

  const supabase = createServiceClient();

  const { data: session, error } = await supabase
    .from('admin_sessions')
    .select(`
      admin_id,
      admin_users!inner(
        email,
        role,
        is_active
      )
    `)
    .eq('token_hash', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) {
    return {};
  }

  const adminUser = session.admin_users as unknown as {
    email: string;
    role: string;
    is_active: boolean;
  };

  if (!adminUser?.is_active) {
    return {};
  }

  return {
    adminId: session.admin_id,
    adminEmail: adminUser.email,
    adminRole: adminUser.role,
  };
}
