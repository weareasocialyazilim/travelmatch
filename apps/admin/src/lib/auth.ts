import 'server-only';

import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase.server';
import crypto from 'crypto';
import { logger } from './logger';
import type { Database } from '@/types/database';

type AdminUserRow = Database['public']['Tables']['admin_users']['Row'];
type RolePermissionRow =
  Database['public']['Tables']['role_permissions']['Row'];

interface SessionWithAdmin {
  id: string;
  admin_id: string;
  token_hash: string;
  expires_at: string;
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
