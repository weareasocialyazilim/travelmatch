import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { sanitizeUUID } from '@/lib/query-utils';

/**
 * GET /api/forensic/export
 * Export comprehensive forensic data for compliance/legal purposes
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    if (
      !hasPermission(session, 'users', 'view') ||
      !hasPermission(session, 'transactions', 'view') ||
      !hasPermission(session, 'moderation', 'view')
    ) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = sanitizeUUID(searchParams.get('user_id'));
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const format = searchParams.get('format') || 'json';

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID zorunludur' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient() as any;
    const adminId = session.admin.id;
    const startDateFilter = startDate || '1970-01-01';
    const endDateFilter = endDate || new Date().toISOString();

    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: transactionsData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDateFilter)
      .lte('created_at', endDateFilter);

    const { data: moderationData } = await supabase
      .from('moderation_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDateFilter)
      .lte('created_at', endDateFilter);

    const { data: reportsData } = await supabase
      .from('reports')
      .select('*')
      .eq('reporter_id', userId)
      .gte('created_at', startDateFilter)
      .lte('created_at', endDateFilter);

    const { data: auditLogsData } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .eq('metadata->>user_id', userId)
      .gte('created_at', startDateFilter)
      .lte('created_at', endDateFilter);

    const forensicData = {
      export_metadata: {
        exported_at: new Date().toISOString(),
        exported_by: adminId,
        export_type: 'user_forensic',
        target_user_id: userId,
        date_range: { start: startDate, end: endDate },
        format_version: '1.0',
      },
      user_profile: userProfile || null,
      sessions: [],
      transactions: transactionsData || [],
      moderation_history: moderationData || [],
      reports_made: reportsData || [],
      admin_audit_logs: auditLogsData || [],
    };

    await supabase.from('admin_audit_logs').insert({
      admin_id: adminId,
      action: 'forensic_export',
      resource_type: 'user',
      resource_id: userId,
      new_value: {
        export_format: format,
        date_range: { start: startDate, end: endDate },
        record_counts: {
          transactions: transactionsData?.length || 0,
          moderation: moderationData?.length || 0,
          reports: reportsData?.length || 0,
        },
      },
      reason: 'Forensic data export for compliance/legal purposes',
    });

    if (format === 'csv') {
      const transactions = transactionsData || [];
      if (transactions.length === 0) {
        return new NextResponse('No data to export', { status: 204 });
      }
      const headers = Object.keys(transactions[0]).join(',');
      const rows = transactions.map((row: any) =>
        Object.keys(transactions[0])
          .map((key) => `"${String(row[key] || '').replace(/"/g, '""')}"`)
          .join(','),
      );
      const csv = [headers, ...rows].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="forensic-${userId}-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json(forensicData);
  } catch (error) {
    logger.error('Forensic export error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
