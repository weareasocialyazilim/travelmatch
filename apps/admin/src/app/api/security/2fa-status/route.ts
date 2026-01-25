import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession } from '@/lib/auth';

export interface TwoFAStatus {
  enabled: boolean;
  enabled_at?: string;
  backup_codes_remaining?: number;
}

/**
 * GET /api/security/2fa-status
 * Get 2FA status for the current admin user
 */
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Get 2FA status from admin_users table

    const { data: adminUser, error } = await (
      supabase.from('admin_users') as any
    )
      .select('totp_enabled, totp_enabled_at, backup_codes_remaining')
      .eq('id', session.admin.id)
      .single();

    if (error) {
      logger.error('2FA status query error:', error);
      // Return mock data on error for graceful degradation
      return NextResponse.json({
        enabled: false,
      });
    }

    const status: TwoFAStatus = {
      enabled: adminUser?.totp_enabled || false,
      enabled_at: adminUser?.totp_enabled_at,
      backup_codes_remaining: adminUser?.backup_codes_remaining,
    };

    return NextResponse.json(status);
  } catch (error) {
    logger.error('2FA status GET error:', error);
    return NextResponse.json({
      enabled: false,
    });
  }
}
