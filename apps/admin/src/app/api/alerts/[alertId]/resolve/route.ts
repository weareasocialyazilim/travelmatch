import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission, createAuditLog } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ alertId: string }>;
}

/**
 * POST /api/alerts/[alertId]/resolve
 * Resolve an active alert
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
    const body = await request.json().catch(() => ({}));
    const { notes, resolutionType } = body as { notes?: string; resolutionType?: string };

    const supabase = createServiceClient();

    // Check if alert exists
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

    if (alert.status === 'resolved') {
      return NextResponse.json(
        { error: 'Alert zaten çözülmüş' },
        { status: 400 }
      );
    }

    // Update alert status - the trigger will move it to history
    const { error: updateError } = await supabase
      .from('active_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: session.admin.id,
        resolved_by_name: session.admin.name,
        resolution_notes: notes || null,
        metadata: {
          ...alert.metadata,
          resolution_type: resolutionType || 'manual'
        }
      })
      .eq('id', alertId);

    if (updateError) {
      logger.error('Failed to resolve alert:', updateError);
      return NextResponse.json(
        { error: 'Alert çözülemedi' },
        { status: 500 }
      );
    }

    // Audit log
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    await createAuditLog(
      session.admin.id,
      'alert_resolved',
      'active_alerts',
      alertId,
      { status: alert.status, title: alert.title },
      { status: 'resolved', resolved_by: session.admin.name, notes },
      clientIp || undefined
    );

    return NextResponse.json({
      success: true,
      message: 'Alert çözüldü ve geçmişe taşındı'
    });
  } catch (error) {
    logger.error('Alert resolve API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
