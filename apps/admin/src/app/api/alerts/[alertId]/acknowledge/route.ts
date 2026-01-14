import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession, hasPermission, createAuditLog } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ alertId: string }>;
}

/**
 * POST /api/alerts/[alertId]/acknowledge
 * Acknowledge an active alert
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    if (!hasPermission(session, 'alerts', 'update')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const { alertId } = await params;
    const supabase = createServiceClient();

    // Check if alert exists and is active
    const { data: alert, error: fetchError } = await supabase
      .from('active_alerts')
      .select('*')
      .eq('id', alertId)
      .single();

    if (fetchError || !alert) {
      return NextResponse.json(
        { error: 'Alert bulunamadı' },
        { status: 404 }
      );
    }

    if (alert.status === 'acknowledged') {
      return NextResponse.json(
        { error: 'Alert zaten onaylanmış' },
        { status: 400 }
      );
    }

    if (alert.status === 'resolved') {
      return NextResponse.json(
        { error: 'Alert zaten çözülmüş' },
        { status: 400 }
      );
    }

    // Update alert status
    const { data: updatedAlert, error: updateError } = await supabase
      .from('active_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: session.admin.id,
        acknowledged_by_name: session.admin.name
      })
      .eq('id', alertId)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to acknowledge alert:', updateError);
      return NextResponse.json(
        { error: 'Alert onaylanamadı' },
        { status: 500 }
      );
    }

    // Audit log
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    await createAuditLog(
      session.admin.id,
      'alert_acknowledged',
      'active_alerts',
      alertId,
      { status: 'active' },
      { status: 'acknowledged', acknowledged_by: session.admin.name },
      clientIp || undefined
    );

    return NextResponse.json({
      success: true,
      alert: updatedAlert
    });
  } catch (error) {
    logger.error('Alert acknowledge API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
