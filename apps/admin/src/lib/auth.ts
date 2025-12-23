import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase';
import crypto from 'crypto';
import type { Database } from '@/types/database';

type AdminUser = Database['public']['Tables']['admin_users']['Row'];

interface SessionWithAdmin {
  id: string;
  admin_id: string;
  token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: string;
  created_at: string;
  admin: AdminUser | null;
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

    // Find session with admin user joined
    const { data, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('*, admin:admin_users(*)')
      .eq('token_hash', sessionHash)
      .gt('expires_at', new Date().toISOString())
      .single();

    // Type assertion for joined query result
    const session = data as SessionWithAdmin | null;

    if (sessionError || !session || !session.admin) {
      return null;
    }

    // Get permissions
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
        (permissions as Array<{ resource: string; action: string }>) || [],
    };
  } catch (error) {
    console.error('Session check error:', error);
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
    await supabase.from('audit_logs').insert({
      admin_id: adminId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_value: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
      new_value: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
