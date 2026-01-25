import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission, createAuditLog } from '@/lib/auth';

/**
 * GET /api/alerts/rules
 * Fetch all alert rules
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    // All authenticated admins can view alert rules
    const supabase = createServiceClient();

    const { data: rules, error } = await supabase
      .from('alert_rules')
      .select('*')
      .order('severity', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      logger.error('Failed to fetch alert rules:', error);
      return NextResponse.json(
        { error: 'Alert kuralları alınamadı' },
        { status: 500 },
      );
    }

    return NextResponse.json({ rules: rules || [] });
  } catch (error) {
    logger.error('Alert rules API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

/**
 * POST /api/alerts/rules
 * Create a new alert rule
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    // Only super_admin and admin can create alert rules
    if (!hasPermission(session, 'alerts', 'create')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      id,
      name,
      category,
      condition,
      metric_name,
      threshold,
      severity,
      enabled,
    } = body;

    if (
      !id ||
      !name ||
      !category ||
      !condition ||
      !metric_name ||
      threshold === undefined ||
      !severity
    ) {
      return NextResponse.json(
        {
          error:
            'Eksik alanlar: id, name, category, condition, metric_name, threshold, severity',
        },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { data: rule, error } = await supabase
      .from('alert_rules')
      .insert({
        id,
        name,
        category,
        condition,
        metric_name,
        threshold,
        severity,
        enabled: enabled ?? true,
        created_by: session.admin.id,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create alert rule:', error);
      return NextResponse.json(
        { error: 'Alert kuralı oluşturulamadı' },
        { status: 500 },
      );
    }

    // Audit log
    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip');
    await createAuditLog(
      session.admin.id,
      'alert_rule_created',
      'alert_rules',
      id,
      null,
      rule,
      clientIp || undefined,
    );

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    logger.error('Alert rules API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
