import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession } from '@/lib/auth';

/**
 * Admin Audit Log API
 *
 * POST: Create audit log entry from admin actions
 * Used by frontend hooks to log escrow actions, dispute resolutions, etc.
 */

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Log tipi gereklidir' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase.from('audit_logs').insert({
      admin_id: session.admin.id,
      action: type,
      resource_type: data.resource_type || getResourceType(type),
      resource_id: data.resource_id || data.escrow_id || data.dispute_id,
      details: data,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });

    if (error) {
      logger.error('Failed to create audit log:', error);
      return NextResponse.json(
        { error: 'Audit log oluşturulamadı' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Audit log POST error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

/**
 * Map audit log type to resource type
 */
function getResourceType(type: string): string {
  const typeMap: Record<string, string> = {
    escrow_action: 'escrow',
    dispute_resolution: 'dispute',
    user_suspension: 'user',
    moment_removal: 'moment',
    refund_processed: 'refund',
    kyc_approval: 'kyc',
  };

  return typeMap[type] || 'admin_action';
}
