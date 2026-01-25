import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission, createAuditLog } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ ruleId: string }>;
}

/**
 * GET /api/alerts/rules/[ruleId]
 * Fetch a specific alert rule
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    const { ruleId } = await params;
    const supabase = createServiceClient();

    const { data: rule, error } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('id', ruleId)
      .single();

    if (error || !rule) {
      return NextResponse.json(
        { error: 'Alert kuralı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ rule });
  } catch (error) {
    logger.error('Alert rule API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/alerts/rules/[ruleId]
 * Update an alert rule (enable/disable, modify settings)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { ruleId } = await params;
    const body = await request.json();

    // Only allow updating certain fields
    const allowedFields = ['enabled', 'threshold', 'severity', 'notify_channels', 'notify_roles', 'cooldown_minutes'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Güncellenecek alan bulunamadı' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get old value for audit
    const { data: oldRule } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('id', ruleId)
      .single();

    if (!oldRule) {
      return NextResponse.json(
        { error: 'Alert kuralı bulunamadı' },
        { status: 404 }
      );
    }

    const { data: rule, error } = await supabase
      .from('alert_rules')
      .update(updateData)
      .eq('id', ruleId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update alert rule:', error);
      return NextResponse.json(
        { error: 'Alert kuralı güncellenemedi' },
        { status: 500 }
      );
    }

    // Audit log
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    await createAuditLog(
      session.admin.id,
      'alert_rule_updated',
      'alert_rules',
      ruleId,
      oldRule,
      rule,
      clientIp || undefined
    );

    return NextResponse.json({ rule });
  } catch (error) {
    logger.error('Alert rule API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/alerts/rules/[ruleId]
 * Delete an alert rule
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    if (!hasPermission(session, 'alerts', 'delete')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const { ruleId } = await params;
    const supabase = createServiceClient();

    // Get rule for audit
    const { data: oldRule } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('id', ruleId)
      .single();

    if (!oldRule) {
      return NextResponse.json(
        { error: 'Alert kuralı bulunamadı' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('alert_rules')
      .delete()
      .eq('id', ruleId);

    if (error) {
      logger.error('Failed to delete alert rule:', error);
      return NextResponse.json(
        { error: 'Alert kuralı silinemedi' },
        { status: 500 }
      );
    }

    // Audit log
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    await createAuditLog(
      session.admin.id,
      'alert_rule_deleted',
      'alert_rules',
      ruleId,
      oldRule,
      null,
      clientIp || undefined
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Alert rule API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
