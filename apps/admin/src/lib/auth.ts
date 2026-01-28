import 'server-only';

import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase.server';
import crypto from 'crypto';
import { logger } from './logger';
import type { Database } from '@/types/database';

type AdminUserRow = Database['public']['Tables']['admin_users']['Row'];
type RolePermissionRow =
  Database['public']['Tables']['role_permissions']['Row'];

// Session security constants
const SESSION_EXPIRY_HOURS = 8; // Max session duration
const SESSION_IDLE_TIMEOUT_MINUTES = 30; // Idle timeout
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

// Session validation result
interface SessionValidationResult {
  valid: boolean;
  reason?: string;
  session?: SessionWithAdmin;
}

export async function validateAdminSession(request?: {
  headers?: { get?: (name: string) => string | null };
}): Promise<SessionValidationResult> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) {
      return { valid: false, reason: 'No session token' };
    }

    const supabase = createServiceClient();
    const sessionHash = crypto
      .createHash('sha256')
      .update(sessionToken)
      .digest('hex');

    // Check if session exists and is not expired
    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('*, admin:admin_users(*)')
      .eq('token_hash', sessionHash)
      .gt('expires_at', new Date().toISOString())
      .single<SessionWithAdmin>();

    if (sessionError || !session || !session.admin) {
      return { valid: false, reason: 'Session expired or invalid' };
    }

    // Check for idle timeout (activity tracking)
    const lastActivity = new Date(session.created_at);
    const now = new Date();
    const idleMinutes = (now.getTime() - lastActivity.getTime()) / 1000 / 60;

    if (idleMinutes > SESSION_IDLE_TIMEOUT_MINUTES) {
      // Clean up expired session
      await supabase.from('admin_sessions').delete().eq('id', session.id);
      return { valid: false, reason: 'Session idle timeout' };
    }

    // Optionally validate IP (if stored)
    const clientIP = request?.headers?.get?.('x-forwarded-for') || 'unknown';
    if (session.ip_address && session.ip_address !== clientIP) {
      logger.warn('Session IP mismatch - possible session hijacking attempt', {
        sessionId: session.id,
        storedIP: session.ip_address,
        clientIP,
      });
      // Note: In production, you might want to invalidate the session here
    }

    return { valid: true, session };
  } catch (error) {
    logger.error('Session validation error', error);
    return { valid: false, reason: 'Validation error' };
  }
}

export function getSessionExpiryDate(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + SESSION_EXPIRY_HOURS);
  return expiry;
}

interface SessionWithAdmin {
  id: string;
  admin_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  ip_address: string | null;
  last_activity_at: string | null;
  admin: AdminUserRow | null;
}

export interface AdminSession {
  admin: {
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
    role: string;
  };
  permissions: Array<{ resource: string; action: string }>;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) {
      return null;
    }

    const supabase = createServiceClient();
    const sessionHash = crypto
      .createHash('sha256')
      .update(sessionToken)
      .digest('hex');

    // Find session with admin user data
    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('*, admin:admin_users(*)')
      .eq('token_hash', sessionHash)
      .gt('expires_at', new Date().toISOString())
      .single<SessionWithAdmin>();

    if (sessionError || !session || !session.admin) {
      return null;
    }

    // Get permissions for the admin's role
    const { data: permissions } = await supabase
      .from('role_permissions')
      .select('resource, action')
      .eq('role', session.admin.role);

    return {
      admin: {
        id: session.admin.id,
        email: session.admin.email,
        name: session.admin.name,
        avatar_url: session.admin.avatar_url,
        role: session.admin.role,
      },
      permissions:
        (permissions as Pick<RolePermissionRow, 'resource' | 'action'>[]) || [],
    };
  } catch (error) {
    logger.error('Session check error', error);
    return null;
  }
}

export function hasPermission(
  session: AdminSession,
  resource: string,
  action: string,
): boolean {
  // Super admins have all permissions
  if (session.admin.role === 'super_admin') {
    return true;
  }

  return session.permissions.some(
    (p) => p.resource === resource && p.action === action,
  );
}

export async function createAuditLog(
  adminId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  oldValue?: unknown,
  newValue?: unknown,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from('audit_logs').insert({
      admin_id: adminId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_value: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
      new_value: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (error) {
      // CRITICAL: Audit log insert failed - log with logger only
      logger.error('CRITICAL: Audit log insert failed', {
        adminId,
        action,
        resourceType,
        resourceId,
        originalError: error.message,
      });
    }
  } catch (error) {
    // Fallback for unexpected errors - log with logger only
    logger.error('CRITICAL: Audit logging completely failed', {
      adminId,
      action,
      resourceType,
      resourceId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Rate limiting for admin actions
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = MAX_FAILED_ATTEMPTS,
  windowMs: number = LOCKOUT_DURATION_MINUTES * 60 * 1000,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // New window
    const resetAt = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

export function getLockoutRemainingSeconds(resetAt: number): number {
  const remaining = Math.max(0, resetAt - Date.now());
  return Math.ceil(remaining / 1000);
}
